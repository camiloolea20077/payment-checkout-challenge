import { DomainError } from './domain-error';

/**
 * Se lanza cuando se intenta comprar un producto que no está activo.
 *
 * Aplica la regla: el producto debe estar activo para poder adquirirse.
 */
export class ProductInactiveError extends DomainError {
  readonly code = 'PRODUCT_INACTIVE';

  constructor(productId: string) {
    super(`El producto ${productId} no está disponible para compra.`);
  }
}
