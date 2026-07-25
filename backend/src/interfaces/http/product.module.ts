import { Module } from '@nestjs/common';
import { GetProductStockUseCase } from '../../application/use-cases/get-product-stock.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ListActiveProductsUseCase } from '../../application/use-cases/list-active-products.use-case';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product-repository.port';
import { STOCK_REPOSITORY } from '../../domain/ports/outbound/stock-repository.port';
import { PrismaProductRepository } from '../../infrastructure/repositories/prisma-product.repository';
import { PrismaStockRepository } from '../../infrastructure/repositories/prisma-stock.repository';
import { ProductController } from './controllers/product.controller';

/**
 * Módulo del catálogo de productos.
 *
 * Cablea el controlador, los casos de uso y las implementaciones concretas de
 * los puertos de repositorio (DIP): la aplicación depende de las interfaces y
 * aquí se resuelven a los repositorios de Prisma mediante sus tokens.
 */
@Module({
  controllers: [ProductController],
  providers: [
    ListActiveProductsUseCase,
    GetProductUseCase,
    GetProductStockUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: STOCK_REPOSITORY, useClass: PrismaStockRepository },
  ],
})
export class ProductModule {}
