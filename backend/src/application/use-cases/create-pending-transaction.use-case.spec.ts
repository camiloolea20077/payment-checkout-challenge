import { ConfigService } from '@nestjs/config';
import { Customer } from '../../domain/entities/customer';
import { Delivery } from '../../domain/entities/delivery';
import { Product } from '../../domain/entities/product';
import { Stock } from '../../domain/entities/stock';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { CustomerRepositoryPort } from '../../domain/ports/outbound/customer-repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery-repository.port';
import { IdGeneratorPort } from '../../domain/ports/outbound/id-generator.port';
import { ProductRepositoryPort } from '../../domain/ports/outbound/product-repository.port';
import { StockRepositoryPort } from '../../domain/ports/outbound/stock-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction-repository.port';
import { Money } from '../../domain/value-objects/money';
import { CreatePendingTransactionUseCase } from './create-pending-transaction.use-case';

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

const activeProduct = new Product({
  id: 'product-1',
  name: 'Teclado',
  description: 'desc',
  price: Money.fromCents(30_000, 'COP'),
  imageUrl: 'https://example.test/p.png',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const delivery = new Delivery({
  id: 'delivery-1',
  customerId: 'customer-1',
  address: 'Calle 1',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
  deliveryFee: Money.fromCents(10_000, 'COP'),
  status: DeliveryStatus.Pending,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const stock = new Stock({
  id: 'stock-1',
  productId: 'product-1',
  availableUnits: 5,
  reservedUnits: 0,
  version: 1,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const buildUseCase = (overrides?: {
  customer?: Customer | null;
  product?: Product | null;
  delivery?: Delivery | null;
  stock?: Stock | null;
  existingByKey?: unknown;
}) => {
  const customerRepository: CustomerRepositoryPort = {
    create: jest.fn(),
    findById: jest
      .fn()
      .mockResolvedValue(
        overrides?.customer === undefined ? customer : overrides.customer,
      ),
    findByEmail: jest.fn(),
  };
  const productRepository: ProductRepositoryPort = {
    findById: jest
      .fn()
      .mockResolvedValue(
        overrides?.product === undefined ? activeProduct : overrides.product,
      ),
    findAllActive: jest.fn(),
  };
  const stockRepository: Partial<StockRepositoryPort> = {
    findByProductId: jest
      .fn()
      .mockResolvedValue(
        overrides?.stock === undefined ? stock : overrides.stock,
      ),
  };
  const deliveryRepository: Partial<DeliveryRepositoryPort> = {
    findById: jest
      .fn()
      .mockResolvedValue(
        overrides?.delivery === undefined ? delivery : overrides.delivery,
      ),
  };
  const created = jest.fn((tx) => Promise.resolve(tx));
  const transactionRepository: Partial<TransactionRepositoryPort> = {
    findByIdempotencyKey: jest
      .fn()
      .mockResolvedValue(overrides?.existingByKey ?? null),
    create: created,
  };
  let counter = 0;
  const idGenerator: IdGeneratorPort = {
    generate: jest.fn(() => `id-${++counter}`),
  };
  const config = {
    get: (key: string) => (key === 'CURRENCY' ? 'COP' : 5000),
  } as unknown as ConfigService;

  const useCase = new CreatePendingTransactionUseCase(
    customerRepository,
    productRepository,
    stockRepository as StockRepositoryPort,
    deliveryRepository as DeliveryRepositoryPort,
    transactionRepository as TransactionRepositoryPort,
    idGenerator,
    config,
  );
  return { useCase, created };
};

const input = {
  customerId: 'customer-1',
  productId: 'product-1',
  deliveryId: 'delivery-1',
  quantity: 2,
};

describe('CreatePendingTransactionUseCase', () => {
  it('crea la transacción y recalcula el total en el backend', async () => {
    const { useCase } = buildUseCase();
    const result = await useCase.execute(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // 2 * 30000 + 5000 base + 10000 envío = 75000
      expect(result.value.productAmountInCents).toBe(60_000);
      expect(result.value.totalAmountInCents).toBe(75_000);
      expect(result.value.status).toBe('PENDING');
    }
  });

  it('falla si el cliente no existe', async () => {
    const { useCase } = buildUseCase({ customer: null });
    const result = await useCase.execute(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CUSTOMER_NOT_FOUND');
  });

  it('falla si el producto no existe', async () => {
    const { useCase } = buildUseCase({ product: null });
    const result = await useCase.execute(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('falla si el producto está inactivo', async () => {
    const inactive = new Product({
      id: 'product-1',
      name: 'Teclado',
      description: 'desc',
      price: Money.fromCents(30_000, 'COP'),
      imageUrl: 'https://example.test/p.png',
      isActive: false,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    const { useCase } = buildUseCase({ product: inactive });
    const result = await useCase.execute(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PRODUCT_INACTIVE');
  });

  it('falla si no hay stock suficiente', async () => {
    const { useCase } = buildUseCase({
      stock: new Stock({
        id: 'stock-1',
        productId: 'product-1',
        availableUnits: 1,
        reservedUnits: 0,
        version: 1,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      }),
    });
    const result = await useCase.execute(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('es idempotente: devuelve la transacción existente y no crea otra', async () => {
    const existing = {
      id: 'tx-existing',
      reference: 'TXN-x',
      customerId: 'customer-1',
      productId: 'product-1',
      deliveryId: 'delivery-1',
      quantity: 2,
      productAmount: Money.fromCents(60_000, 'COP'),
      baseFee: Money.fromCents(5_000, 'COP'),
      deliveryFee: Money.fromCents(10_000, 'COP'),
      totalAmount: Money.fromCents(75_000, 'COP'),
      currency: 'COP',
      status: 'PENDING',
      providerTransactionId: null,
      providerStatus: null,
      failureReason: null,
      idempotencyKey: 'key-1',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };
    const { useCase, created } = buildUseCase({ existingByKey: existing });
    const result = await useCase.execute({ ...input, idempotencyKey: 'key-1' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.id).toBe('tx-existing');
    expect(created).not.toHaveBeenCalled();
  });
});
