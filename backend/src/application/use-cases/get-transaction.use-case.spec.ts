import { Transaction } from '../../domain/entities/transaction';
import { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction-repository.port';
import { Money } from '../../domain/value-objects/money';
import { GetTransactionUseCase } from './get-transaction.use-case';

const transaction = Transaction.createPending({
  id: 'tx-1',
  reference: 'TXN-1',
  customerId: 'customer-1',
  productId: 'product-1',
  deliveryId: 'delivery-1',
  quantity: 1,
  productAmount: Money.fromCents(30_000, 'COP'),
  baseFee: Money.fromCents(5_000, 'COP'),
  deliveryFee: Money.fromCents(10_000, 'COP'),
  idempotencyKey: 'key-1',
});

describe('GetTransactionUseCase', () => {
  it('devuelve la transacción cuando existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(transaction),
    } as unknown as TransactionRepositoryPort;
    const result = await new GetTransactionUseCase(repo).execute('tx-1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.reference).toBe('TXN-1');
  });

  it('devuelve error cuando no existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as TransactionRepositoryPort;
    const result = await new GetTransactionUseCase(repo).execute('missing');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
  });
});
