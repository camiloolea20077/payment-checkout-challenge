import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionView } from '../../../application/dto/transaction-view';
import { CreatePendingTransactionUseCase } from '../../../application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '../../../application/use-cases/get-transaction.use-case';
import { domainErrorToHttp } from '../errors/domain-error.mapper';
import { CreateTransactionDto } from '../request-dto/create-transaction.dto';
import { TransactionResponseDto } from '../response-dto/transaction-response.dto';

/**
 * Controlador HTTP de transacciones.
 *
 * La creación acepta el header `Idempotency-Key` para que reintentos o
 * doble clic no generen transacciones duplicadas.
 */
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createPendingTransaction: CreatePendingTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea una transacción local en estado PENDING' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Clave para evitar transacciones duplicadas ante reintentos.',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  async create(
    @Body() dto: CreateTransactionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<TransactionView> {
    const result = await this.createPendingTransaction.execute({
      ...dto,
      idempotencyKey,
    });
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta una transacción por su id' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiNotFoundResponse({ description: 'La transacción no existe.' })
  async detail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TransactionView> {
    const result = await this.getTransaction.execute(id);
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
