import { ApiProperty } from '@nestjs/swagger';
import { DeliveryView } from '../../../application/dto/delivery-view';
import { DeliveryStatus } from '../../../domain/enums/delivery-status.enum';

/**
 * DTO de respuesta de una entrega, documentado para Swagger.
 */
export class DeliveryResponseDto implements DeliveryView {
  @ApiProperty({ example: 'c4e2d1a5-6f70-4a80-9b1c-3d4e5f6a7b8c' })
  id!: string;

  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  customerId!: string;

  @ApiProperty({ example: 'Calle 123 #45-67' })
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  city!: string;

  @ApiProperty({ example: 'Cundinamarca' })
  department!: string;

  @ApiProperty({ example: '110111' })
  postalCode!: string;

  @ApiProperty({ example: 10000, description: 'Tarifa de envío en centavos' })
  deliveryFeeInCents!: number;

  @ApiProperty({ example: 'COP' })
  currency!: string;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.Pending })
  status!: string;
}
