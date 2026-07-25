import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_REPOSITORY,
  type ProductRepositoryPort,
} from '../../domain/ports/outbound/product-repository.port';
import {
  STOCK_REPOSITORY,
  type StockRepositoryPort,
} from '../../domain/ports/outbound/stock-repository.port';
import { ProductView } from '../dto/product-view';
import { ProductViewMapper } from '../mappers/product-view.mapper';

/**
 * Caso de uso: listar los productos activos del catálogo con su stock.
 *
 * Depende de abstracciones (puertos) y no de Prisma, cumpliendo DIP. Combina
 * productos y stock en una sola pasada evitando el problema N+1.
 */
@Injectable()
export class ListActiveProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(STOCK_REPOSITORY)
    private readonly stockRepository: StockRepositoryPort,
  ) {}

  /**
   * Ejecuta la consulta del catálogo activo.
   *
   * @returns La lista de productos activos con sus unidades disponibles.
   */
  async execute(): Promise<ProductView[]> {
    const products = await this.productRepository.findAllActive();
    if (products.length === 0) {
      return [];
    }

    const stocks = await this.stockRepository.findByProductIds(
      products.map((product) => product.id),
    );
    const stockByProductId = new Map(
      stocks.map((stock) => [stock.productId, stock]),
    );

    return products.map((product) =>
      ProductViewMapper.toView(
        product,
        stockByProductId.get(product.id) ?? null,
      ),
    );
  }
}
