import { Delivery } from '../../domain/entities/delivery';
import { Stock } from '../../domain/entities/stock';
import { Transaction } from '../../domain/entities/transaction';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { InsufficientStockError } from '../../domain/errors/insufficient-stock.error';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery-repository.port';
import { IdGeneratorPort } from '../../domain/ports/outbound/id-generator.port';
import { StockMovementRepositoryPort } from '../../domain/ports/outbound/stock-movement-repository.port';
import { StockRepositoryPort } from '../../domain/ports/outbound/stock-repository.port';
import { TransactionRepositoryPort } from '../../domain/ports/outbound/transaction-repository.port';
import { UnitOfWorkPort } from '../../domain/ports/outbound/unit-of-work.port';
import { Money } from '../../domain/value-objects/money';
import { ConfirmSaleService } from './confirm-sale.service';

const transaction = Transaction.createPending({
  id: 'tx-1',
  reference: 'TXN-1',
  customerId: 'customer-1',
  productId: 'product-1',
  deliveryId: 'delivery-1',
  quantity: 3,
  productAmount: Money.fromCents(30_000, 'COP'),
  baseFee: Money.fromCents(5_000, 'COP'),
  deliveryFee: Money.fromCents(10_000, 'COP'),
  idempotencyKey: 'key-1',
});

const buildStock = (availableUnits: number): Stock =>
  new Stock({
    id: 'stock-1',
    productId: 'product-1',
    availableUnits,
    reservedUnits: 0,
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

const buildDelivery = (): Delivery =>
  new Delivery({
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

const buildService = (stock: Stock | null) => {
  const stockUpdate = jest.fn((s: Stock) => Promise.resolve(s));
  const movementCreate = jest.fn((m) => Promise.resolve(m));
  const deliveryUpdate = jest.fn((d: Delivery) => Promise.resolve(d));
  const transactionUpdate = jest.fn((t: Transaction) => Promise.resolve(t));

  const stockRepository: Partial<StockRepositoryPort> = {
    findByProductId: jest.fn().mockResolvedValue(stock),
    update: stockUpdate,
  };
  const stockMovementRepository: Partial<StockMovementRepositoryPort> = {
    create: movementCreate,
  };
  const deliveryRepository: Partial<DeliveryRepositoryPort> = {
    findById: jest.fn().mockResolvedValue(buildDelivery()),
    update: deliveryUpdate,
  };
  const transactionRepository: Partial<TransactionRepositoryPort> = {
    update: transactionUpdate,
  };
  const unitOfWork: UnitOfWorkPort = {
    runInTransaction: (work) => work(),
  };
  const idGenerator: IdGeneratorPort = {
    generate: jest.fn(() => 'movement-1'),
  };

  const service = new ConfirmSaleService(
    unitOfWork,
    stockRepository as StockRepositoryPort,
    stockMovementRepository as StockMovementRepositoryPort,
    deliveryRepository as DeliveryRepositoryPort,
    transactionRepository as TransactionRepositoryPort,
    idGenerator,
  );
  return {
    service,
    stockUpdate,
    movementCreate,
    deliveryUpdate,
    transactionUpdate,
  };
};

describe('ConfirmSaleService', () => {
  it('descuenta el stock una sola vez y registra el movimiento', async () => {
    const { service, stockUpdate, movementCreate } = buildService(
      buildStock(10),
    );

    await service.confirm(transaction, 'wompi-1', 'APPROVED');

    expect(stockUpdate).toHaveBeenCalledTimes(1);
    const savedStock = stockUpdate.mock.calls[0][0];
    expect(savedStock.availableUnits).toBe(7); // 10 - 3

    expect(movementCreate).toHaveBeenCalledTimes(1);
    const movement = movementCreate.mock.calls[0][0];
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(7);
    expect(movement.quantity).toBe(3);
  });

  it('asigna la entrega y aprueba la transacción', async () => {
    const { service, deliveryUpdate, transactionUpdate } = buildService(
      buildStock(10),
    );

    await service.confirm(transaction, 'wompi-1', 'APPROVED');

    expect(deliveryUpdate.mock.calls[0][0].status).toBe(
      DeliveryStatus.Assigned,
    );
    expect(transactionUpdate.mock.calls[0][0].status).toBe('APPROVED');
  });

  it('lanza InsufficientStock y no descuenta si no alcanza', async () => {
    const { service, stockUpdate } = buildService(buildStock(1));

    await expect(
      service.confirm(transaction, 'wompi-1', 'APPROVED'),
    ).rejects.toBeInstanceOf(InsufficientStockError);
    expect(stockUpdate).not.toHaveBeenCalled();
  });

  it('lanza InsufficientStock si no existe stock', async () => {
    const { service } = buildService(null);

    await expect(
      service.confirm(transaction, 'wompi-1', 'APPROVED'),
    ).rejects.toBeInstanceOf(InsufficientStockError);
  });
});
