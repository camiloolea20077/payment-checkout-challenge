import { DomainError } from './domain-error';

/**
 * Se lanza cuando la cantidad solicitada no es un entero mayor o igual a 1.
 *
 * Aplica la regla de negocio: la cantidad mínima de compra es 1 unidad.
 */
export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY';

  constructor(message = 'La cantidad debe ser un entero mayor o igual a 1.') {
    super(message);
  }
}
