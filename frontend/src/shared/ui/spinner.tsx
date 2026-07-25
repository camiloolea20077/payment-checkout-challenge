import { cn } from "../utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

/**
 * Indicador de carga circular accesible.
 *
 * Usa `role="status"` y una etiqueta oculta para lectores de pantalla.
 */
export function Spinner({
  size = "md",
  className,
  label = "Cargando",
}: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        className={cn(
          "animate-spin rounded-full border-slate-300 border-t-blue-600",
          SIZES[size],
          className,
        )}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
