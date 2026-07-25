import { DomainError } from './domain-error';

/**
 * Se lanza cuando se intenta una transición de estado no permitida sobre una
 * transacción (p. ej. aprobar una transacción que ya no está en `PENDING`).
 *
 * Protege la integridad del ciclo de vida y evita efectos como el doble cobro.
 */
export class InvalidTransactionStateError extends DomainError {
  readonly code = 'INVALID_TRANSACTION_STATE';

  constructor(from: string, to: string) {
    super(`Transición de transacción no permitida: ${from} -> ${to}.`);
  }
}
