import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CardDto } from './card.dto';

/**
 * Cuerpo para procesar el pago de una transacción existente.
 */
export class ProcessPaymentDto {
  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card!: CardDto;
}
