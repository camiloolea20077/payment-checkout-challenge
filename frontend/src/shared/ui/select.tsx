import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  invalid?: boolean;
}

/**
 * Desplegable base. Integrable con React Hook Form vía `forwardRef`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ options, invalid = false, className, ...props }, ref) {
    return (
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-slate-900 shadow-sm transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          invalid
            ? "border-red-400 focus-visible:ring-red-500"
            : "border-slate-300 focus-visible:ring-blue-600",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);
