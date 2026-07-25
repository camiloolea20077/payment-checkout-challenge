import { ApiProperty } from '@nestjs/swagger';
import { ProductView } from '../../../application/dto/product-view';

/**
 * DTO de respuesta de un producto, documentado para Swagger.
 *
 * Los valores monetarios se exponen en centavos.
 */
export class ProductResponseDto implements ProductView {
  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  id!: string;

  @ApiProperty({ example: 'Teclado mecánico' })
  name!: string;

  @ApiProperty({ example: 'Switches azules, retroiluminado' })
  description!: string;

  @ApiProperty({ example: 30000, description: 'Precio unitario en centavos' })
  priceInCents!: number;

  @ApiProperty({ example: 'COP' })
  currency!: string;

  @ApiProperty({ example: 'https://example.test/keyboard.png' })
  imageUrl!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 25, description: 'Unidades disponibles en stock' })
  availableUnits!: number;
}
