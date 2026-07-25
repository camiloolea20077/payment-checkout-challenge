import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PAYMENT_GATEWAY } from '../../domain/ports/outbound/payment-gateway.port';
import { WompiPaymentGateway } from './wompi-payment.gateway';

/** Timeout de las llamadas HTTP a la pasarela (ms). */
const HTTP_TIMEOUT_MS = 10_000;

/**
 * Módulo que provee la implementación de la pasarela de pagos.
 *
 * Configura `HttpModule` con timeout para no dejar peticiones colgadas y expone
 * el puerto {@link PAYMENT_GATEWAY} resuelto a la implementación de Wompi.
 */
@Module({
  imports: [HttpModule.register({ timeout: HTTP_TIMEOUT_MS, maxRedirects: 0 })],
  providers: [{ provide: PAYMENT_GATEWAY, useClass: WompiPaymentGateway }],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentGatewayModule {}
