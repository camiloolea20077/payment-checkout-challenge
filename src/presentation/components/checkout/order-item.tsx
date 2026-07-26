import { Price } from '../../../shared/ui/price';

interface OrderItemProps {
  name: string;
  imageUrl: string;
  quantity: number;
  priceInCents: number;
  currency: string;
}

/**
 * Fila compacta con la miniatura del producto, su nombre, la cantidad y el
 * precio unitario. Reutilizable en pago, resumen y resultado.
 */
export function OrderItem({
  name,
  imageUrl,
  quantity,
  priceInCents,
  currency,
}: OrderItemProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">Cantidad: {quantity}</p>
      </div>
      <Price
        amountInCents={priceInCents}
        currency={currency}
        className="text-sm font-medium text-slate-700"
      />
    </div>
  );
}
