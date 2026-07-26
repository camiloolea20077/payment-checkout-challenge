import { Spinner } from "./spinner";

interface BackdropProps {
  message?: string;
}

/**
 * Capa a pantalla completa que bloquea la interacción mientras se procesa una
 * acción (p. ej. el pago), evitando envíos duplicados. Usa `aria-live` para
 * anunciar el estado.
 */
export function Backdrop({ message = "Procesando…" }: BackdropProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/50"
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium text-white">{message}</p>
    </div>
  );
}
