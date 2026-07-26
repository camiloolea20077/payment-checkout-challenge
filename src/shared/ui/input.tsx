import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/**
 * Campo de texto base. `invalid` aplica el estilo de error; el cableado de
 * accesibilidad (`aria-invalid`, `aria-describedby`) lo pasa el formulario.
 *
 * Usa `forwardRef` para integrarse con React Hook Form.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-lg border bg-white px-3 text-slate-900 shadow-sm transition",
        "placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        invalid
          ? "border-red-400 focus-visible:ring-red-500"
          : "border-slate-300 focus-visible:ring-blue-600",
        className,
      )}
      {...props}
    />
  );
});
