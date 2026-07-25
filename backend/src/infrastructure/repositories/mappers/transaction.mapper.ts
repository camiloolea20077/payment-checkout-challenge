import { Transaction } from '../../../domain/entities/transaction';
import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import { Money } from '../../../domain/value-objects/money';
import type { Transaction as PrismaTransaction } from '../../../generated/prisma/client';

/**
 * Traduce entre el registro de Prisma y la entidad de dominio `Transaction`.
 */
export class TransactionMapper {
  /**
   * @param record - Fila de la tabla `transactions`.
   * @param currency - Moneda para construir los value objects `Money`.
   */
  static toDomain(record: PrismaTransaction, currency: string): Transaction {
    return new Transaction({
      id: record.id,
      reference: record.reference,
      customerId: record.customerId,
      productId: record.productId,
      deliveryId: record.deliveryId,
      quantity: record.quantity,
      productAmount: Money.fromCents(record.productAmountInCents, currency),
      baseFee: Money.fromCents(record.baseFeeInCents, currency),
      deliveryFee: Money.fromCents(record.deliveryFeeInCents, currency),
      totalAmount: Money.fromCents(record.totalAmountInCents, currency),
      currency: record.currency,
      status: record.status as TransactionStatus,
      providerTransactionId: record.providerTransactionId,
      providerStatus: record.providerStatus,
      failureReason: record.failureReason,
      idempotencyKey: record.idempotencyKey,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
