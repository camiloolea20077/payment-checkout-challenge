import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Min } from 'class-validator';

/**
 * Datos de tarjeta para procesar un pago.
 *
 * Son transitorios: se envían a la pasarela para tokenizar y no se persisten ni
 * se registran en logs.
 */
export class CardDto {
  @ApiProperty({ example: '4242424242424242' })
  @Matches(/^\d{13,19}$/, {
    message: 'number debe tener entre 13 y 19 dígitos',
  })
  number!: string;

  @ApiProperty({ example: '123' })
  @Matches(/^\d{3,4}$/, { message: 'cvc debe tener 3 o 4 dígitos' })
  cvc!: string;

  @ApiProperty({ example: '08' })
  @Matches(/^\d{2}$/, { message: 'expMonth debe ser MM' })
  expMonth!: string;

  @ApiProperty({ example: '28' })
  @Matches(/^\d{2}$/, { message: 'expYear debe ser YY' })
  expYear!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  cardHolder!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  installments!: number;
}
