import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionView } from '../../../application/dto/transaction-view';
import { CheckoutUseCase } from '../../../application/use-cases/checkout.use-case';
import { domainErrorToHttp } from '../errors/domain-error.mapper';
import { CheckoutDto } from '../request-dto/checkout.dto';
import { TransactionResponseDto } from '../response-dto/transaction-response.dto';

/**
 * Controlador del checkout de punta a punta.
 *
 * Un único endpoint ejecuta todo el flujo: cliente, entrega, transacción y
 * pago. Acepta `Idempotency-Key` para que reintentos no dupliquen el cobro.
 */
@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ejecuta el flujo completo de compra' })
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Clave para evitar cobros duplicados ante reintentos.',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  async execute(
    @Body() dto: CheckoutDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<TransactionView> {
    const result = await this.checkout.execute({
      customer: dto.customer,
      delivery: dto.delivery,
      productId: dto.productId,
      quantity: dto.quantity,
      card: dto.card,
      idempotencyKey,
    });
    if (!result.ok) {
      throw domainErrorToHttp(result.error);
    }
    return result.value;
  }
}
