import { Transaction } from '../../domain/entities/transaction';
import { TransactionView } from '../dto/transaction-view';

/**
 * Construye la vista de lectura de una transacción a partir de la entidad.
 */
export class TransactionViewMapper {
  static toView(transaction: Transaction): TransactionView {
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
      providerStatus: transaction.providerStatus,
      failureReason: transaction.failureReason,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
