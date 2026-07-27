import { useState } from 'react';
import type { Product } from '../../../domain/entities/product';
import { MIN_QUANTITY } from '../../../shared/constants/product';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { Price } from '../../../shared/ui/price';
import { StockBadge } from './stock-badge';
import { QuantitySelector } from './quantity-selector';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product, quantity: number) => void;
  onViewDetail: (product: Product) => void;
}

/**
 * Tarjeta de producto: imagen, nombre, descripción, precio, stock, selector de
 * cantidad y acción de compra. Deshabilita la compra si no hay stock.
 */
export function ProductCard({
  product,
  onBuy,
  onViewDetail,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const isOutOfStock = product.availableUnits <= 0;

  return (
    <Card className="flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* `object-contain` muestra la imagen completa: con `cover` se recortaba
          y ampliaba cuando su proporción no coincidía con la del marco. */}
      <div className="aspect-[3/2] w-full overflow-hidden bg-slate-100 p-3">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            {product.name}
          </h2>
          <StockBadge availableUnits={product.availableUnits} />
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">
          {product.description}
        </p>

        <Price
          amountInCents={product.priceInCents}
          currency={product.currency}
          className="text-xl font-bold text-slate-900"
        />

        <div className="mt-auto flex flex-col gap-3 pt-2">
          {!isOutOfStock && (
            <QuantitySelector
              quantity={quantity}
              max={product.availableUnits}
              onChange={setQuantity}
            />
          )}
          <Button
            fullWidth
            disabled={isOutOfStock}
            onClick={() => onBuy(product, quantity)}
          >
            {isOutOfStock ? 'Sin stock' : 'Pagar con tarjeta'}
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => onViewDetail(product)}
          >
            Ver detalle
          </Button>
        </div>
      </div>
    </Card>
  );
}
