import { Module } from '@nestjs/common';
import { CheckoutUseCase } from '../../application/use-cases/checkout.use-case';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { CreatePendingTransactionUseCase } from '../../application/use-cases/create-pending-transaction.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { PaymentGatewayModule } from '../../infrastructure/payment-gateway/payment-gateway.module';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { CheckoutController } from './controllers/checkout.controller';

/**
 * Módulo del checkout, que compone los casos de uso del flujo completo.
 */
@Module({
  imports: [RepositoriesModule, PaymentGatewayModule],
  controllers: [CheckoutController],
  providers: [
    CheckoutUseCase,
    CreateCustomerUseCase,
    CreateDeliveryUseCase,
    CreatePendingTransactionUseCase,
    ProcessPaymentUseCase,
  ],
})
export class CheckoutModule {}
