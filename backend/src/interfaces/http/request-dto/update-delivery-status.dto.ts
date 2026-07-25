import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DeliveryStatus } from '../../../domain/enums/delivery-status.enum';

/**
 * Cuerpo de la petición para actualizar el estado de una entrega.
 */
export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.InProgress })
  @IsEnum(DeliveryStatus)
  status!: DeliveryStatus;
}
