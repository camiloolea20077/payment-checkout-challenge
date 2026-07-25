import { Stock } from '../../domain/entities/stock';
import { OptimisticLockError } from '../../domain/errors/optimistic-lock.error';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaStockRepository } from './prisma-stock.repository';

const record = {
  id: 'stock-1',
  productId: 'product-1',
  availableUnits: 10,
  reservedUnits: 0,
  version: 1,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const buildRepo = (delegate: Record<string, jest.Mock>) => {
  const prisma = { client: { stock: delegate } } as unknown as PrismaService;
  return new PrismaStockRepository(prisma);
};

const buildStock = (version: number): Stock =>
  new Stock({
    id: 'stock-1',
    productId: 'product-1',
    availableUnits: 6,
    reservedUnits: 0,
    version,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

describe('PrismaStockRepository', () => {
  it('findByProductId mapea cuando existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(record) });
    const stock = await repo.findByProductId('product-1');
    expect(stock?.availableUnits).toBe(10);
  });

  it('findByProductIds mapea la lista', async () => {
    const repo = buildRepo({ findMany: jest.fn().mockResolvedValue([record]) });
    const stocks = await repo.findByProductIds(['product-1']);
    expect(stocks).toHaveLength(1);
  });

  it('update persiste con lock optimista y devuelve el stock', async () => {
    const repo = buildRepo({
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findUniqueOrThrow: jest.fn().mockResolvedValue(record),
    });
    const result = await repo.update(buildStock(2));
    expect(result.id).toBe('stock-1');
  });

  it('update lanza OptimisticLockError si la versión no coincide', async () => {
    const repo = buildRepo({
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      findUniqueOrThrow: jest.fn(),
    });
    await expect(repo.update(buildStock(2))).rejects.toBeInstanceOf(
      OptimisticLockError,
    );
  });
});
