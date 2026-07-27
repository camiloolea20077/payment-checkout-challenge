import { cn } from "../utils/cn";

interface StepperProps {
  steps: string[];
  /** Paso actual, 1-based. */
  current: number;
}

/**
 * Indicador de progreso del checkout. Comunica el estado con número/check y
 * texto, no solo con color (accesibilidad), y marca el paso actual con
 * `aria-current`.
 */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso del checkout">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < current;
        const isCurrent = stepNumber === current;

        return (
          <li
            key={label}
            className="flex flex-1 flex-col items-center gap-1.5 sm:flex-row sm:gap-2"
          >
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                isCompleted && "bg-blue-600 text-white",
                isCurrent && "bg-blue-600 text-white ring-2 ring-blue-200",
                !isCompleted && !isCurrent && "bg-slate-200 text-slate-600",
              )}
            >
              {isCompleted ? "✓" : stepNumber}
            </span>
            {/* En móvil la etiqueta va bajo el círculo: ocultarla dejaría el
                progreso comunicado solo por color y posición. */}
            <span
              className={cn(
                "text-center text-xs font-medium sm:text-sm",
                isCurrent ? "text-slate-900" : "text-slate-500",
              )}
            >
              {label}
            </span>
            {stepNumber < steps.length && (
              <span
                className={cn(
                  "ml-1 hidden h-px flex-1 sm:block",
                  isCompleted ? "bg-blue-600" : "bg-slate-200",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
