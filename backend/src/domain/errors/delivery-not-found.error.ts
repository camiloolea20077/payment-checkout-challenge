import { DomainError } from './domain-error';

/**
 * Se lanza cuando no existe una entrega con el identificador solicitado.
 */
export class DeliveryNotFoundError extends DomainError {
  readonly code = 'DELIVERY_NOT_FOUND';

  constructor(deliveryId: string) {
    super(`No existe la entrega con id ${deliveryId}.`);
  }
}
