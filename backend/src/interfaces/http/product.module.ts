import { Module } from '@nestjs/common';
import { GetProductStockUseCase } from '../../application/use-cases/get-product-stock.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ListActiveProductsUseCase } from '../../application/use-cases/list-active-products.use-case';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { ProductController } from './controllers/product.controller';

/**
 * Módulo del catálogo de productos.
 *
 * Importa {@link RepositoriesModule} para resolver los puertos de repositorio y
 * cablea el controlador con sus casos de uso.
 */
@Module({
  imports: [RepositoriesModule],
  controllers: [ProductController],
  providers: [
    ListActiveProductsUseCase,
    GetProductUseCase,
    GetProductStockUseCase,
  ],
})
export class ProductModule {}
