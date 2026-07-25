import { Customer } from '../../domain/entities/customer';
import { Transaction } from '../../domain/entities/transaction';
import { PaymentGatewayError } from '../../domain/errors/payment-gateway.error';
import { CustomerRepositoryPort } from '../../domain/ports/outbound/customer-repository.port';
import {
  PaymentGatewayPort,
  PaymentResult,
} from '../../domain/ports/outbound/payment-gateway.port';
import { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction-repository.port';
import { Money } from '../../domain/value-objects/money';
import { ProcessPaymentUseCase } from './process-payment.use-case';

const card = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '08',
  expYear: '28',
  cardHolder: 'Ada',
  installments: 1,
};

const customer = new Customer({
  id: 'customer-1',
  fullName: 'Ada',
  email: 'ada@example.com',
  phone: '+57300',
  documentType: 'CC',
  documentNumber: '123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const buildPending = (): Transaction =>
  Transaction.createPending({
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

const buildUseCase = (options: {
  transaction: Transaction | null;
  gateway: Partial<PaymentGatewayPort>;
}) => {
  const update = jest.fn((tx: Transaction) => Promise.resolve(tx));
  const transactionRepository: Partial<TransactionRepositoryPort> = {
    findById: jest.fn().mockResolvedValue(options.transaction),
    update,
  };
  const customerRepository: Partial<CustomerRepositoryPort> = {
    findById: jest.fn().mockResolvedValue(customer),
  };
  const useCase = new ProcessPaymentUseCase(
    transactionRepository as TransactionRepositoryPort,
    customerRepository as CustomerRepositoryPort,
    options.gateway as PaymentGatewayPort,
  );
  return { useCase, update };
};

const approvedResult: PaymentResult = {
  providerTransactionId: 'wompi-1',
  status: 'APPROVED',
  providerStatus: 'APPROVED',
  failureReason: null,
};

describe('ProcessPaymentUseCase', () => {
  it('aprueba la transacción cuando la pasarela aprueba', async () => {
    const { useCase, update } = buildUseCase({
      transaction: buildPending(),
      gateway: { charge: jest.fn().mockResolvedValue(approvedResult) },
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('APPROVED');
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('rechaza la transacción cuando la pasarela rechaza', async () => {
    const { useCase } = buildUseCase({
      transaction: buildPending(),
      gateway: {
        charge: jest.fn().mockResolvedValue({
          providerTransactionId: 'wompi-2',
          status: 'DECLINED',
          providerStatus: 'DECLINED',
          failureReason: 'Fondos insuficientes',
        } satisfies PaymentResult),
      },
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('DECLINED');
      expect(result.value.failureReason).toBe('Fondos insuficientes');
    }
  });

  it('un error de red deja la transacción en ERROR (nunca aprueba)', async () => {
    const { useCase } = buildUseCase({
      transaction: buildPending(),
      gateway: {
        charge: jest.fn().mockRejectedValue(new PaymentGatewayError('timeout')),
      },
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('ERROR');
  });

  it('devuelve error si la transacción no existe', async () => {
    const { useCase } = buildUseCase({
      transaction: null,
      gateway: { charge: jest.fn() },
    });
    const result = await useCase.execute({ transactionId: 'missing', card });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it('es idempotente: no re-cobra una transacción ya aprobada', async () => {
    const approved = buildPending().approve('wompi-1', 'APPROVED');
    const charge = jest.fn();
    const { useCase } = buildUseCase({
      transaction: approved,
      gateway: { charge },
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('APPROVED');
    expect(charge).not.toHaveBeenCalled();
  });
});
