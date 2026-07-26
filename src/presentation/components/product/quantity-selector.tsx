import { MIN_QUANTITY } from '../../../shared/constants/product';
import { cn } from '../../../shared/utils/cn';

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
  disabled?: boolean;
}

const STEPPER_BUTTON =
  'flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40';

/**
 * Selector de cantidad acotado entre {@link MIN_QUANTITY} y el stock disponible,
 * de modo que el usuario nunca pueda elegir más unidades de las que hay.
 *
 * @param quantity - Cantidad actual.
 * @param max - Máximo permitido (stock disponible).
 * @param onChange - Se invoca con la nueva cantidad válida.
 */
export function QuantitySelector({
  quantity,
  max,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(MIN_QUANTITY, quantity - 1));
  const increase = () => onChange(Math.min(max, quantity + 1));

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={cn(STEPPER_BUTTON)}
        onClick={decrease}
        disabled={disabled || quantity <= MIN_QUANTITY}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <span
        className="w-8 text-center text-lg font-semibold tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        className={cn(STEPPER_BUTTON)}
        onClick={increase}
        disabled={disabled || quantity >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
