import { Inject, Injectable } from '@nestjs/common';
import { TransactionNotFoundError } from '../../domain/errors/transaction-not-found.error';
import {
  TRANSACTION_REPOSITORY,
  type TransactionRepositoryPort,
} from '../../domain/ports/outbound/transaction-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { TransactionView } from '../dto/transaction-view';
import { TransactionViewMapper } from '../mappers/transaction-view.mapper';

/**
 * Caso de uso: consultar una transacción por su identificador.
 */
@Injectable()
export class GetTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<TransactionView, TransactionNotFoundError>> {
    const transaction = await this.transactionRepository.findById(id);
    if (transaction === null) {
      return err(new TransactionNotFoundError(id));
    }
    return ok(TransactionViewMapper.toView(transaction));
  }
}
