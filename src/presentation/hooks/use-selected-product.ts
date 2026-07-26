import { useEffect } from 'react';
import type { Product } from '../../domain/entities/product';
import { useCheckoutRepository } from '../providers/repository-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { productSelected } from '../store/slices/product-slice';

/**
 * Devuelve el producto del checkout actual, recuperándolo del backend si no
 * está en memoria (p. ej. tras recargar en pasos avanzados del flujo).
 *
 * @returns El producto seleccionado, o `null` mientras se resuelve.
 */
export function useSelectedProduct(): Product | null {
  const repository = useCheckoutRepository();
  const dispatch = useAppDispatch();
  const productId = useAppSelector((state) => state.checkout.productId);
  const product = useAppSelector((state) => state.product.selected);

  const isLoaded = product !== null && product.id === productId;

  useEffect(() => {
    if (productId !== null && !isLoaded) {
      void repository
        .getProduct(productId)
        .then((fetched) => dispatch(productSelected(fetched)))
        .catch(() => undefined);
    }
  }, [productId, isLoaded, repository, dispatch]);

  return isLoaded ? product : null;
}
