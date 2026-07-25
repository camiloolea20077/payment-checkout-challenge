import { CheckoutError } from '../../domain/errors/checkout-errors';

/**
 * Extrae un mensaje comprensible para el usuario a partir de un error.
 *
 * Los errores de dominio ya traen un mensaje amigable; para cualquier otro se
 * devuelve un texto genérico sin exponer detalles técnicos.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof CheckoutError) {
    return error.message;
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
