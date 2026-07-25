import { useNavigate } from 'react-router-dom';
import type { Product } from '../../domain/entities/product';
import { Card } from '../../shared/ui/card';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { Skeleton } from '../../shared/ui/skeleton';
import { ProductCard } from '../components/product/product-card';
import { useProducts } from '../hooks/use-products';
import { useAppDispatch } from '../store/hooks';
import { setProductSelection, setStep } from '../store/slices/checkout-slice';
import { productSelected } from '../store/slices/product-slice';

/**
 * Página de producto (pasos 1 y 5 del flujo): muestra el catálogo con su stock
 * y permite iniciar el checkout de un producto y cantidad.
 */
export function ProductPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { products, status, error, reload } = useProducts();

  const handleBuy = (product: Product, quantity: number) => {
    dispatch(productSelected(product));
    dispatch(setProductSelection({ productId: product.id, quantity }));
    dispatch(setStep(2));
    navigate('/checkout/payment');
  };

  return (
    <section aria-labelledby="product-heading">
      <div className="mb-6">
        <h1 id="product-heading" className="text-2xl font-bold tracking-tight">
          Nuestros productos
        </h1>
        <p className="mt-1 text-slate-600">
          Elige un producto y paga de forma segura con tarjeta.
        </p>
      </div>

      {status === 'loading' && <ProductGridSkeleton />}

      {status === 'failed' && (
        <ErrorState message={error ?? 'No se pudo cargar el catálogo.'} onRetry={reload} />
      )}

      {status === 'succeeded' && products.length === 0 && (
        <EmptyState
          title="No hay productos disponibles"
          description="Vuelve más tarde: pronto tendremos novedades."
        />
      )}

      {status === 'succeeded' && products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onBuy={handleBuy} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Rejilla de esqueletos mientras carga el catálogo (evita saltos de layout).
 */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="aspect-[3/2] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-11 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
