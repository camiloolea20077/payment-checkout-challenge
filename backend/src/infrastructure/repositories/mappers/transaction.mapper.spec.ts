import { TransactionStatus } from '../../../domain/enums/transaction-status.enum';
import type { Transaction as PrismaTransaction } from '../../../generated/prisma/client';
import { TransactionMapper } from './transaction.mapper';

const record: PrismaTransaction = {
  id: 'tx-1',
  reference: 'TXN-1',
  customerId: 'customer-1',
  productId: 'product-1',
  deliveryId: 'delivery-1',
  quantity: 2,
  productAmountInCents: 60_000,
  baseFeeInCents: 5_000,
  deliveryFeeInCents: 10_000,
  totalAmountInCents: 75_000,
  currency: 'COP',
  status: 'APPROVED',
  providerTransactionId: 'wompi-1',
  providerStatus: 'APPROVED',
  failureReason: null,
  idempotencyKey: 'key-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('TransactionMapper', () => {
  it('mapea el registro construyendo los Money y el estado', () => {
    const transaction = TransactionMapper.toDomain(record, 'COP');
    expect(transaction.id).toBe('tx-1');
    expect(transaction.status).toBe(TransactionStatus.Approved);
    expect(transaction.totalAmount.amountInCents).toBe(75_000);
    expect(transaction.providerTransactionId).toBe('wompi-1');
  });
});
