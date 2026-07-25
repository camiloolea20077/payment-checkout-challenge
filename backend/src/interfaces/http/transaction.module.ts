import { Module } from '@nestjs/common';
import { ConfirmSaleService } from '../../application/services/confirm-sale.service';
import { CreatePendingTransactionUseCase } from '../../application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { PaymentGatewayModule } from '../../infrastructure/payment-gateway/payment-gateway.module';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { TransactionController } from './controllers/transaction.controller';

/**
 * Módulo de transacciones (creación, consulta y procesamiento de pago).
 */
@Module({
  imports: [RepositoriesModule, PaymentGatewayModule],
  controllers: [TransactionController],
  providers: [
    CreatePendingTransactionUseCase,
    GetTransactionUseCase,
    ProcessPaymentUseCase,
    ConfirmSaleService,
  ],
})
export class TransactionModule {}
