/**
 * Result representa el desenlace de una operación que puede fallar de forma
 * controlada, sin recurrir a excepciones para los errores de negocio.
 *
 * Es la base del enfoque "Railway Oriented Programming": cada paso del flujo
 * devuelve un `Result` y el siguiente paso solo se ejecuta si el anterior fue
 * exitoso, encadenando validaciones sin `try/catch` anidados.
 *
 * @typeParam T - Tipo del valor en caso de éxito.
 * @typeParam E - Tipo del error de negocio en caso de fallo.
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Construye un `Result` exitoso.
 *
 * @param value - Valor producido por la operación.
 * @returns Un `Result` con `ok: true` que envuelve el valor.
 */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/**
 * Construye un `Result` fallido.
 *
 * @param error - Error de negocio producido por la operación.
 * @returns Un `Result` con `ok: false` que envuelve el error.
 */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

/**
 * Type guard que estrecha el tipo a la variante exitosa.
 *
 * Permite que TypeScript entienda que, tras comprobar `isOk(result)`, el campo
 * `result.value` está disponible sin castings manuales.
 */
export const isOk = <T, E>(
  result: Result<T, E>,
): result is { ok: true; value: T } => result.ok;

/**
 * Type guard que estrecha el tipo a la variante fallida.
 */
export const isErr = <T, E>(
  result: Result<T, E>,
): result is { ok: false; error: E } => !result.ok;
