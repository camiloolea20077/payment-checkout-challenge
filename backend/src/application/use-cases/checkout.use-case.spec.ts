import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error';
import { err, ok } from '../../shared/types/result';
import { CheckoutUseCase } from './checkout.use-case';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { CreatePendingTransactionUseCase } from './create-pending-transaction.use-case';
import { ProcessPaymentUseCase } from './process-payment.use-case';

const input = {
  customer: {
    fullName: 'Ada',
    email: 'ada@example.com',
    phone: '+57300',
    documentType: 'CC',
    documentNumber: '123',
  },
  delivery: {
    address: 'Calle 1',
    city: 'Bogotá',
    department: 'Cundinamarca',
    postalCode: '110111',
  },
  productId: 'product-1',
  quantity: 1,
  card: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '08',
    expYear: '28',
    cardHolder: 'Ada',
    installments: 1,
  },
};

const customerView = { id: 'customer-1' };
const deliveryView = { id: 'delivery-1' };

describe('CheckoutUseCase', () => {
  it('ejecuta el flujo completo y procesa el pago', async () => {
    const createCustomer = {
      execute: jest.fn().mockResolvedValue(customerView),
    } as unknown as CreateCustomerUseCase;
    const createDelivery = {
      execute: jest.fn().mockResolvedValue(ok(deliveryView)),
    } as unknown as CreateDeliveryUseCase;
    const createPending = {
      execute: jest
        .fn()
        .mockResolvedValue(ok({ id: 'tx-1', status: 'PENDING' })),
    } as unknown as CreatePendingTransactionUseCase;
    const processPayment = {
      execute: jest
        .fn()
        .mockResolvedValue(ok({ id: 'tx-1', status: 'APPROVED' })),
    } as unknown as ProcessPaymentUseCase;

    const useCase = new CheckoutUseCase(
      createCustomer,
      createDelivery,
      createPending,
      processPayment,
    );
    const result = await useCase.execute(input);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('APPROVED');
    expect(processPayment.execute).toHaveBeenCalledWith({
      transactionId: 'tx-1',
      card: input.card,
    });
  });

  it('corta el flujo si falla la creación de la entrega', async () => {
    const createCustomer = {
      execute: jest.fn().mockResolvedValue(customerView),
    } as unknown as CreateCustomerUseCase;
    const createDelivery = {
      execute: jest
        .fn()
        .mockResolvedValue(err(new CustomerNotFoundError('customer-1'))),
    } as unknown as CreateDeliveryUseCase;
    const createPending = {
      execute: jest.fn(),
    } as unknown as CreatePendingTransactionUseCase;
    const processPayment = {
      execute: jest.fn(),
    } as unknown as ProcessPaymentUseCase;

    const useCase = new CheckoutUseCase(
      createCustomer,
      createDelivery,
      createPending,
      processPayment,
    );
    const result = await useCase.execute(input);

    expect(result.ok).toBe(false);
    expect(createPending.execute).not.toHaveBeenCalled();
    expect(processPayment.execute).not.toHaveBeenCalled();
  });

  it('no re-cobra si la transacción ya está resuelta (idempotencia)', async () => {
    const createCustomer = {
      execute: jest.fn().mockResolvedValue(customerView),
    } as unknown as CreateCustomerUseCase;
    const createDelivery = {
      execute: jest.fn().mockResolvedValue(ok(deliveryView)),
    } as unknown as CreateDeliveryUseCase;
    const createPending = {
      execute: jest
        .fn()
        .mockResolvedValue(ok({ id: 'tx-1', status: 'APPROVED' })),
    } as unknown as CreatePendingTransactionUseCase;
    const processPayment = {
      execute: jest.fn(),
    } as unknown as ProcessPaymentUseCase;

    const useCase = new CheckoutUseCase(
      createCustomer,
      createDelivery,
      createPending,
      processPayment,
    );
    const result = await useCase.execute(input);

    expect(result.ok).toBe(true);
    expect(processPayment.execute).not.toHaveBeenCalled();
  });
});
