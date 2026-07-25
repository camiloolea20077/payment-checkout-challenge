import { ApiProperty } from '@nestjs/swagger';
import { CustomerView } from '../../../application/dto/customer-view';

/**
 * DTO de respuesta de un cliente, documentado para Swagger.
 */
export class CustomerResponseDto implements CustomerView {
  @ApiProperty({ example: 'b3f1c2a4-5d6e-7f80-9a1b-2c3d4e5f6a7b' })
  id!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  fullName!: string;

  @ApiProperty({ example: 'ada@example.com' })
  email!: string;

  @ApiProperty({ example: '+573001112233' })
  phone!: string;

  @ApiProperty({ example: 'CC' })
  documentType!: string;

  @ApiProperty({ example: '1020304050' })
  documentNumber!: string;
}
