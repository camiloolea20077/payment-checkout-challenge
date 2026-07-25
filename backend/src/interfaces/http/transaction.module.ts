import { Module } from '@nestjs/common';
import { CreatePendingTransactionUseCase } from '../../application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { RepositoriesModule } from '../../infrastructure/repositories/repositories.module';
import { TransactionController } from './controllers/transaction.controller';

/**
 * Módulo de transacciones.
 */
@Module({
  imports: [RepositoriesModule],
  controllers: [TransactionController],
  providers: [CreatePendingTransactionUseCase, GetTransactionUseCase],
})
export class TransactionModule {}
