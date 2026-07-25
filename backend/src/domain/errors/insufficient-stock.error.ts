import { DomainError } from './domain-error';

/**
 * Se lanza cuando la cantidad solicitada supera las unidades disponibles.
 *
 * Aplica las reglas: la cantidad no puede superar el stock y el stock nunca
 * puede quedar negativo.
 */
export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(
      `Stock insuficiente: se solicitaron ${requested} unidades y hay ${available} disponibles.`,
    );
  }
}
