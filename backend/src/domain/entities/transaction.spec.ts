import { TransactionStatus } from '../enums/transaction-status.enum';
import { InvalidQuantityError } from '../errors/invalid-quantity.error';
import { InvalidTransactionStateError } from '../errors/invalid-transaction-state.error';
import { Money } from '../value-objects/money';
import { Transaction } from './transaction';

const buildPending = (quantity = 2): Transaction =>
  Transaction.createPending({
    id: 'tx-1',
    reference: 'REF-1',
    customerId: 'customer-1',
    productId: 'product-1',
    deliveryId: 'delivery-1',
    quantity,
    productAmount: Money.fromCents(30_000, 'COP'),
    baseFee: Money.fromCents(5_000, 'COP'),
    deliveryFee: Money.fromCents(10_000, 'COP'),
    idempotencyKey: 'idem-1',
  });

describe('Transaction', () => {
  describe('createPending', () => {
    it('crea la transacción en estado PENDING', () => {
      expect(buildPending().status).toBe(TransactionStatus.Pending);
    });

    it('recalcula el total como producto + tarifa base + envío', () => {
      const transaction = buildPending();
      expect(transaction.totalAmount.amountInCents).toBe(45_000);
      expect(transaction.currency).toBe('COP');
    });

    it('rechaza cantidades menores a 1', () => {
      expect(() => buildPending(0)).toThrow(InvalidQuantityError);
    });
  });

  describe('transiciones de estado', () => {
    it('aprueba una transacción pendiente', () => {
      const approved = buildPending().approve('prov-123', 'APPROVED');
      expect(approved.status).toBe(TransactionStatus.Approved);
      expect(approved.providerTransactionId).toBe('prov-123');
      expect(approved.isApproved()).toBe(true);
    });

    it('rechaza una transacción pendiente conservando la causa', () => {
      const declined = buildPending().decline(
        'DECLINED',
        'Fondos insuficientes',
      );
      expect(declined.status).toBe(TransactionStatus.Declined);
      expect(declined.failureReason).toBe('Fondos insuficientes');
    });

    it('marca error controlado', () => {
      const errored = buildPending().markError('Timeout de la pasarela');
      expect(errored.status).toBe(TransactionStatus.Error);
      expect(errored.failureReason).toBe('Timeout de la pasarela');
    });

    it('no permite aprobar dos veces (evita doble cobro)', () => {
      const approved = buildPending().approve('prov-123', 'APPROVED');
      expect(() => approved.approve('prov-456', 'APPROVED')).toThrow(
        InvalidTransactionStateError,
      );
    });

    it('no permite aprobar una transacción rechazada', () => {
      const declined = buildPending().decline('DECLINED', 'causa');
      expect(() => declined.approve('prov-1', 'APPROVED')).toThrow(
        InvalidTransactionStateError,
      );
    });

    it('no muta la transacción original al transicionar', () => {
      const pending = buildPending();
      pending.approve('prov-123', 'APPROVED');
      expect(pending.status).toBe(TransactionStatus.Pending);
    });
  });
});
