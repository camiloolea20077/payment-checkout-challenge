import { cn } from "../utils/cn";

/**
 * Separador horizontal sutil entre secciones.
 */
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-slate-200", className)} />;
}
