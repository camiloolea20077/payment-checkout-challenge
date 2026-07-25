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
import { StockView } from '../dto/stock-view';

/**
 * Caso de uso: consultar el stock disponible de un producto.
 *
 * Permite al frontend refrescar las unidades disponibles tras una compra.
 */
@Injectable()
export class GetProductStockUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
  ) {}

  /**
   * Ejecuta la consulta de stock.
   *
   * @param productId - Identificador del producto.
   * @returns Éxito con la vista de stock, o error `ProductNotFoundError` si el
   *          producto no existe.
   */
  async execute(
    productId: string,
  ): Promise<Result<StockView, ProductNotFoundError>> {
    const product = await this.productRepository.findById(productId);
    if (product === null) {
      return err(new ProductNotFoundError(productId));
    }

    const stock = await this.stockRepository.findByProductId(productId);
    return ok({
      productId,
      availableUnits: stock?.availableUnits ?? 0,
      reservedUnits: stock?.reservedUnits ?? 0,
    });
  }
}
