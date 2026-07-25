import { ApiProperty } from '@nestjs/swagger';
import { TransactionView } from '../../../application/dto/transaction-view';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';

/**
 * DTO de respuesta de una transacción, documentado para Swagger.
 *
 * Los importes van en centavos y no se exponen datos sensibles de tarjeta.
 */
export class TransactionResponseDto implements TransactionView {
  @ApiProperty({ example: 'd5f3e2b6-7081-4b90-8c2d-4e5f6a7b8c9d' })
  id!: string;

  @ApiProperty({ example: 'TXN-9f8e7d6c-...' })
  reference!: string;

  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  customerId!: string;

  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  productId!: string;

  @ApiProperty({ example: 'c4e2d1a5-6f70-4a80-9b1c-3d4e5f6a7b8c' })
  deliveryId!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({
    example: 60000,
    description: 'Subtotal del producto en centavos',
  })
  productAmountInCents!: number;

  @ApiProperty({ example: 5000, description: 'Tarifa base en centavos' })
  baseFeeInCents!: number;

  @ApiProperty({ example: 10000, description: 'Tarifa de envío en centavos' })
  deliveryFeeInCents!: number;

  @ApiProperty({ example: 75000, description: 'Total en centavos' })
  totalAmountInCents!: number;

  @ApiProperty({ example: 'COP' })
  currency!: string;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.Pending })
  status!: string;

  @ApiProperty({ example: null, nullable: true })
  providerStatus!: string | null;

  @ApiProperty({ example: null, nullable: true })
  failureReason!: string | null;

  @ApiProperty({ example: '2026-07-25T14:30:00.000Z' })
  createdAt!: string;
}
