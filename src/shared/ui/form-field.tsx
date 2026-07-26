import type { ReactNode } from "react";

interface FormFieldProps {
  /** Id del control que etiqueta (para `htmlFor` y `aria-describedby`). */
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * Envuelve un control de formulario con su etiqueta, ayuda y mensaje de error.
 *
 * Expone el id del error como `${id}-error` para que el control lo referencie
 * con `aria-describedby`; el mensaje usa `role="alert"` para ser anunciado.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
