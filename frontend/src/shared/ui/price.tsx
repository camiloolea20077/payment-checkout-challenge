import { cn } from "../utils/cn";
import { formatMoney } from "../utils/money";

interface PriceProps {
  amountInCents: number;
  currency: string;
  className?: string;
}

/**
 * Muestra un monto formateado como moneda a partir de centavos.
 */
export function Price({ amountInCents, currency, className }: PriceProps) {
  return (
    <span className={cn("tabular-nums", className)}>
      {formatMoney(amountInCents, currency)}
    </span>
  );
}
