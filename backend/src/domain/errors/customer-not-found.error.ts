import { DomainError } from './domain-error';

/**
 * Se lanza cuando no existe un cliente con el identificador solicitado.
 */
export class CustomerNotFoundError extends DomainError {
  readonly code = 'CUSTOMER_NOT_FOUND';

  constructor(customerId: string) {
    super(`No existe el cliente con id ${customerId}.`);
  }
}
