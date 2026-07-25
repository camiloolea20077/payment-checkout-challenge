import { ApiProperty } from '@nestjs/swagger';
import { StockView } from '../../../application/dto/stock-view';

/**
 * DTO de respuesta del inventario de un producto, documentado para Swagger.
 */
export class StockResponseDto implements StockView {
  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  productId!: string;

  @ApiProperty({ example: 25, description: 'Unidades disponibles' })
  availableUnits!: number;

  @ApiProperty({ example: 0, description: 'Unidades reservadas' })
  reservedUnits!: number;
}
