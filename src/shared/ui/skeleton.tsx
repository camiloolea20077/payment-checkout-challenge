import { cn } from "../utils/cn";

interface SkeletonProps {
  className?: string;
}

/**
 * Bloque de carga (placeholder animado) para reservar el espacio del contenido
 * mientras llega la respuesta del backend.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      aria-hidden
    />
  );
}
