import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ProductView } from '../../../application/dto/product-view';
import { StockView } from '../../../application/dto/stock-view';
import { GetProductStockUseCase } from '../../../application/use-cases/get-product-stock.use-case';
import { GetProductUseCase } from '../../../application/use-cases/get-product.use-case';
import { ListActiveProductsUseCase } from '../../../application/use-cases/list-active-products.use-case';
import { ProductResponseDto } from '../response-dto/product-response.dto';
import { StockResponseDto } from '../response-dto/stock-response.dto';

/**
 * Controlador HTTP del catálogo de productos.
 *
 * No contiene lógica de negocio: delega en los casos de uso y traduce los
 * errores de negocio (producto inexistente) a respuestas HTTP.
 */
@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly listActiveProducts: ListActiveProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly getProductStock: GetProductStockUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista los productos activos con su stock' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  list(): Promise<ProductView[]> {
    return this.listActiveProducts.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta un producto por su id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'El producto no existe.' })
  async detail(@Param('id', ParseUUIDPipe) id: string): Promise<ProductView> {
    const result = await this.getProduct.execute(id);
    if (!result.ok) {
      throw new NotFoundException(result.error.message);
    }
    return result.value;
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'Consulta el stock disponible de un producto' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: StockResponseDto })
  @ApiNotFoundResponse({ description: 'El producto no existe.' })
  async stock(@Param('id', ParseUUIDPipe) id: string): Promise<StockView> {
    const result = await this.getProductStock.execute(id);
    if (!result.ok) {
      throw new NotFoundException(result.error.message);
    }
    return result.value;
  }
}
