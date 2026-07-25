import { DomainError } from './domain-error';

/**
 * Se lanza cuando no existe un producto con el identificador solicitado.
 */
export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND';

  constructor(productId: string) {
    super(`No existe el producto con id ${productId}.`);
  }
}
