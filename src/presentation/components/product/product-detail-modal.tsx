import { useEffect, useState } from "react";
import type { Product } from "../../../domain/entities/product";
import { MIN_QUANTITY } from "../../../shared/constants/product";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/ui/error-state";
import { Modal } from "../../../shared/ui/modal";
import { Price } from "../../../shared/ui/price";
import { Skeleton } from "../../../shared/ui/skeleton";
import { useProductDetail } from "../../hooks/use-product-detail";
import { QuantitySelector } from "./quantity-selector";
import { StockBadge } from "./stock-badge";

interface ProductDetailModalProps {
  /** Producto a mostrar; `null` mantiene el diálogo cerrado. */
  productId: string | null;
  onClose: () => void;
  onBuy: (product: Product, quantity: number) => void;
}

/**
 * Diálogo con el detalle del producto: imagen, descripción, precio, stock y
 * selector de cantidad para iniciar el pago.
 *
 * Pide el producto al backend cada vez que se abre, de modo que el stock que
 * ve el usuario antes de pagar no sea el del catálogo cargado al entrar.
 */
export function ProductDetailModal({
  productId,
  onClose,
  onBuy,
}: ProductDetailModalProps) {
  const { product, status, error, reload } = useProductDetail(productId);
  const [quantity, setQuantity] = useState(MIN_QUANTITY);

  // Cada producto arranca con la cantidad mínima; sin esto, abrir un producto
  // tras elegir 3 unidades de otro heredaría esa cantidad.
  useEffect(() => {
    setQuantity(MIN_QUANTITY);
  }, [productId]);

  const isOutOfStock = product !== null && product.availableUnits <= 0;

  return (
    <Modal
      open={productId !== null}
      onClose={onClose}
      title={product?.name ?? "Detalle del producto"}
    >
      {status === "loading" && (
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-[3/2] w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}

      {status === "error" && (
        <ErrorState
          message={error ?? "No pudimos cargar el producto."}
          onRetry={reload}
        />
      )}

      {status === "ready" && product !== null && (
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/2] w-full overflow-hidden rounded-xl bg-slate-100 p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          </div>

          {/* La descripción va bajo la imagen y el precio a su lado en pantallas
              medianas; en móvil se apilan para no comprimir el texto. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="flex-1 text-sm text-slate-600">
              {product.description}
            </p>
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <Price
                amountInCents={product.priceInCents}
                currency={product.currency}
                className="text-2xl font-bold text-slate-900"
              />
              <StockBadge availableUnits={product.availableUnits} />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {isOutOfStock ? (
              <p className="text-sm text-slate-500">
                Este producto no tiene unidades disponibles.
              </p>
            ) : (
              <QuantitySelector
                quantity={quantity}
                max={product.availableUnits}
                onChange={setQuantity}
              />
            )}
            <Button
              disabled={isOutOfStock}
              onClick={() => onBuy(product, quantity)}
              className="sm:w-auto"
              fullWidth
            >
              {isOutOfStock ? "Sin stock" : "Pagar con tarjeta"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
