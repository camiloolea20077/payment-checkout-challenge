import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

/**
 * Cuerpo de la petición para crear una transacción pendiente.
 *
 * No incluye importes: el backend recalcula el total. Los datos sensibles de
 * tarjeta no viajan por aquí.
 */
export class CreateTransactionDto {
  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  @IsUUID()
  customerId!: string;

  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 'c4e2d1a5-6f70-4a80-9b1c-3d4e5f6a7b8c' })
  @IsUUID()
  deliveryId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
