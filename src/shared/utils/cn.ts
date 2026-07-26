import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind resolviendo conflictos.
 *
 * `clsx` arma la lista condicional de clases y `tailwind-merge` deja la última
 * clase ganadora cuando dos utilidades chocan (p. ej. `px-2` y `px-4`).
 *
 * @param inputs - Clases o condiciones de clase.
 * @returns La cadena de clases final, sin conflictos.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
