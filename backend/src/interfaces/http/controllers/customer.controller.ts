import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CustomerView } from '../../../application/dto/customer-view';
import { CreateCustomerUseCase } from '../../../application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '../../../application/use-cases/get-customer.use-case';
import { domainErrorToHttp } from '../errors/domain-error.mapper';
import { CreateCustomerDto } from '../request-dto/create-customer.dto';
import { CustomerResponseDto } from '../response-dto/customer-response.dto';

/**
 * Controlador HTTP de clientes. Delega en los casos de uso y traduce los
 * errores de negocio a respuestas HTTP.
 */
@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly getCustomer: GetCustomerUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crea un cliente (o reutiliza el existente por email)',
  })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  create(@Body() dto: CreateCustomerDto): Promise<CustomerView> {
    return this.createCustomer.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta un cliente por su id' })
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiNotFoundResponse({ description: 'El cliente no existe.' })
  async detail(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerView> {
    const result = await this.getCustomer.execute(id);
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
