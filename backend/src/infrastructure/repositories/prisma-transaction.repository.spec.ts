import { ConfigService } from '@nestjs/config';
import { Transaction } from '../../domain/entities/transaction';
import { Money } from '../../domain/value-objects/money';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaTransactionRepository } from './prisma-transaction.repository';

const record = {
  id: 'tx-1',
  reference: 'TXN-1',
  customerId: 'customer-1',
  productId: 'product-1',
  deliveryId: 'delivery-1',
  quantity: 1,
  productAmountInCents: 30_000,
  baseFeeInCents: 5_000,
  deliveryFeeInCents: 10_000,
  totalAmountInCents: 45_000,
  currency: 'COP',
  status: 'PENDING',
  providerTransactionId: null,
  providerStatus: null,
  failureReason: null,
  idempotencyKey: 'key-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const buildRepo = (delegate: Record<string, jest.Mock>) => {
  const prisma = {
    client: { transaction: delegate },
  } as unknown as PrismaService;
  const config = { get: () => 'COP' } as unknown as ConfigService;
  return new PrismaTransactionRepository(prisma, config);
};

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

describe('PrismaTransactionRepository', () => {
  it('create persiste y mapea', async () => {
    const create = jest.fn().mockResolvedValue(record);
    const repo = buildRepo({ create });
    const result = await repo.create(transaction);
    expect(result.id).toBe('tx-1');
    expect(result.totalAmount.amountInCents).toBe(45_000);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('update persiste el nuevo estado', async () => {
    const repo = buildRepo({
      update: jest.fn().mockResolvedValue({ ...record, status: 'APPROVED' }),
    });
    const result = await repo.update(transaction.approve('prov-1', 'APPROVED'));
    expect(result.status).toBe('APPROVED');
  });

  it('findByIdempotencyKey devuelve null cuando no existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(null) });
    expect(await repo.findByIdempotencyKey('nope')).toBeNull();
  });

  it('findByReference mapea cuando existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(record) });
    const result = await repo.findByReference('TXN-1');
    expect(result?.reference).toBe('TXN-1');
  });
});
