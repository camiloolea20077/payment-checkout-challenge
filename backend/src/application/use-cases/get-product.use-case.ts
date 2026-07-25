import { Inject, Injectable } from '@nestjs/common';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../domain/ports/outbound/product-repository.port';
import {
  STOCK_REPOSITORY,
  type StockRepositoryPort,
} from '../../domain/ports/outbound/stock-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { ProductView } from '../dto/product-view';
import { ProductViewMapper } from '../mappers/product-view.mapper';

/**
 * Caso de uso: consultar un producto por id junto con su stock.
 *
 * Devuelve un `Result` en lugar de lanzar excepciones para los errores de
 * negocio (producto inexistente), siguiendo el enfoque railway-oriented.
 */
@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
  ) {}

  /**
   * Ejecuta la consulta de un producto.
   *
   * @param id - Identificador del producto.
   * @returns Éxito con la vista del producto, o error `ProductNotFoundError`.
   */
  async execute(
    id: string,
  ): Promise<Result<ProductView, ProductNotFoundError>> {
    const product = await this.productRepository.findById(id);
    if (product === null) {
      return err(new ProductNotFoundError(id));
    }

    const stock = await this.stockRepository.findByProductId(id);
    return ok(ProductViewMapper.toView(product, stock));
  }
}
