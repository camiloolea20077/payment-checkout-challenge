import { Divider } from "../../../shared/ui/divider";
import { Price } from "../../../shared/ui/price";

interface PaymentSummaryProps {
  productName: string;
  quantity: number;
  priceInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  currency: string;
}

/**
 * Desglose de importes del pedido: subtotal, tarifa base, envío y total.
 *
 * El total mostrado es una previsualización; el backend lo recalcula al cobrar.
 */
export function PaymentSummary({
  productName,
  quantity,
  priceInCents,
  baseFeeInCents,
  deliveryFeeInCents,
  currency,
}: PaymentSummaryProps) {
  const subtotalInCents = priceInCents * quantity;
  const totalInCents = subtotalInCents + baseFeeInCents + deliveryFeeInCents;

  return (
    <div className="space-y-3">
      <Row label={`${productName} × ${quantity}`}>
        <Price amountInCents={subtotalInCents} currency={currency} />
      </Row>
      <Row label="Tarifa base">
        <Price amountInCents={baseFeeInCents} currency={currency} />
      </Row>
      <Row label="Envío">
        <Price amountInCents={deliveryFeeInCents} currency={currency} />
      </Row>
      <Divider />
      <Row label="Total" strong>
        <Price
          amountInCents={totalInCents}
          currency={currency}
          className="text-lg font-bold"
        />
      </Row>
    </div>
  );
}

function Row({
  label,
  strong = false,
  children,
}: {
  label: string;
  strong?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span
        className={strong ? "font-semibold text-slate-900" : "text-slate-600"}
      >
        {label}
      </span>
      <span className="text-slate-900">{children}</span>
    </div>
  );
}
