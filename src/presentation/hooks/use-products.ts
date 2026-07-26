import { useCallback, useEffect } from "react";
import { errorMessage } from "../../shared/utils/error-message";
import { useCheckoutRepository } from "../providers/repository-context";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  productLoadFailed,
  productLoadStarted,
  productsLoaded,
} from "../store/slices/product-slice";

/**
 * Carga el catálogo de productos activos y lo expone desde el store.
 *
 * Depende del puerto de repositorio (no de Axios). Carga automáticamente la
 * primera vez y ofrece `reload` para reintentar tras un error o para refrescar
 * el stock al volver del checkout.
 *
 * @returns Los productos, el estado de carga, el error y `reload`.
 */
export function useProducts() {
  const repository = useCheckoutRepository();
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.product);

  const load = useCallback(async () => {
    dispatch(productLoadStarted());
    try {
      const products = await repository.getProducts();
      dispatch(productsLoaded(products));
    } catch (caught) {
      dispatch(productLoadFailed(errorMessage(caught)));
    }
  }, [repository, dispatch]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products: items, status, error, reload: load };
}
