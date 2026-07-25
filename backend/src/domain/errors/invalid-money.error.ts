import { DomainError } from './domain-error';

/**
 * Se lanza cuando se intenta construir u operar un valor monetario inválido
 * (no entero, negativo, sin moneda o mezclando monedas distintas).
 */
export class InvalidMoneyError extends DomainError {
  readonly code = 'INVALID_MONEY';
}
