import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CardDto } from './card.dto';
import { CreateCustomerDto } from './create-customer.dto';

/**
 * Datos de la dirección de entrega dentro del checkout.
 *
 * No incluye la tarifa de envío: la calcula el backend.
 */
export class CheckoutDeliveryDto {
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

/**
 * Cuerpo del checkout completo: cliente, entrega, producto y tarjeta.
 *
 * No incluye importes: el backend recalcula el total.
 */
export class CheckoutDto {
  @ApiProperty({ type: CreateCustomerDto })
  @ValidateNested()
  @Type(() => CreateCustomerDto)
  customer!: CreateCustomerDto;

  @ApiProperty({ type: CheckoutDeliveryDto })
  @ValidateNested()
  @Type(() => CheckoutDeliveryDto)
  delivery!: CheckoutDeliveryDto;

  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ type: CardDto })
  @ValidateNested()
  @Type(() => CardDto)
  card!: CardDto;
}
