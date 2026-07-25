import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Cuerpo de la petición para crear una entrega.
 *
 * No incluye la tarifa de envío: la calcula el backend.
 */
export class CreateDeliveryDto {
  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  @IsUUID()
  customerId!: string;

  @ApiProperty({ example: 'Calle 123 #45-67' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address!: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  department!: string;

  @ApiProperty({ example: '110111' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode!: string;
}
