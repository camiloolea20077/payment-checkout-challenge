import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transaction } from '../../domain/entities/transaction';
import { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction-repository.port';
import { EnvironmentVariables } from '../configuration/environment.config';
import { PrismaService } from '../database/prisma/prisma.service';
import { TransactionMapper } from './mappers/transaction.mapper';

/**
 * Implementación con Prisma del puerto {@link TransactionRepositoryPort}.
 */
@Injectable()
export class PrismaTransactionRepository implements TransactionRepositoryPort {
  private readonly currency: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.currency = config.get('CURRENCY', { infer: true });
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const record = await this.prisma.transaction.create({
      data: this.toData(transaction),
    });
    return TransactionMapper.toDomain(record, this.currency);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const record = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transaction.status,
        providerTransactionId: transaction.providerTransactionId,
        providerStatus: transaction.providerStatus,
        failureReason: transaction.failureReason,
        updatedAt: transaction.updatedAt,
      },
    });
    return TransactionMapper.toDomain(record, this.currency);
  }

  async findById(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({ where: { id } });
    return record ? TransactionMapper.toDomain(record, this.currency) : null;
  }

  async findByReference(reference: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { reference },
    });
    return record ? TransactionMapper.toDomain(record, this.currency) : null;
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
    return record ? TransactionMapper.toDomain(record, this.currency) : null;
  }

  private toData(transaction: Transaction) {
    return {
      id: transaction.id,
      reference: transaction.reference,
      customerId: transaction.customerId,
      productId: transaction.productId,
      deliveryId: transaction.deliveryId,
      quantity: transaction.quantity,
      productAmountInCents: transaction.productAmount.amountInCents,
      baseFeeInCents: transaction.baseFee.amountInCents,
      deliveryFeeInCents: transaction.deliveryFee.amountInCents,
      totalAmountInCents: transaction.totalAmount.amountInCents,
      currency: transaction.currency,
      status: transaction.status,
      providerTransactionId: transaction.providerTransactionId,
      providerStatus: transaction.providerStatus,
      failureReason: transaction.failureReason,
      idempotencyKey: transaction.idempotencyKey,
    };
  }
}
