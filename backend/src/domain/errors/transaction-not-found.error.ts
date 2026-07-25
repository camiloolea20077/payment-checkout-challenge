import { DomainError } from './domain-error';

/**
 * Se lanza cuando no existe una transacción con el identificador solicitado.
 */
export class TransactionNotFoundError extends DomainError {
  readonly code = 'TRANSACTION_NOT_FOUND';

  constructor(transactionId: string) {
    super(`No existe la transacción con id ${transactionId}.`);
  }
}
