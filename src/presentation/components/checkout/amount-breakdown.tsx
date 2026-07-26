import { Divider } from '../../../shared/ui/divider';
import { Price } from '../../../shared/ui/price';

interface AmountBreakdownProps {
  itemLabel: string;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  totalAmountInCents: number;
  currency: string;
}

/**
 * Desglose de importes (subtotal, tarifa base, envío y total) a partir de
 * valores explícitos en centavos. En el resumen se usa con una previsualización
 * y en el resultado con los importes reales de la transacción.
 */
export function AmountBreakdown({
  itemLabel,
  productAmountInCents,
  baseFeeInCents,
  deliveryFeeInCents,
  totalAmountInCents,
  currency,
}: AmountBreakdownProps) {
  return (
    <div className="space-y-3">
      <Row label={itemLabel}>
        <Price amountInCents={productAmountInCents} currency={currency} />
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
          amountInCents={totalAmountInCents}
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
        className={strong ? 'font-semibold text-slate-900' : 'text-slate-600'}
      >
        {label}
      </span>
      <span className="text-slate-900">{children}</span>
    </div>
  );
}
