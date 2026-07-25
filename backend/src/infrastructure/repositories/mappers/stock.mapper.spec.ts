import type { Stock as PrismaStock } from '../../../generated/prisma/client';
import { StockMapper } from './stock.mapper';

const record: PrismaStock = {
  id: 'stock-1',
  productId: 'product-1',
  availableUnits: 25,
  reservedUnits: 2,
  version: 3,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('StockMapper', () => {
  it('mapea un registro de Prisma a entidad de dominio', () => {
    const stock = StockMapper.toDomain(record);
    expect(stock.id).toBe('stock-1');
    expect(stock.productId).toBe('product-1');
    expect(stock.availableUnits).toBe(25);
    expect(stock.reservedUnits).toBe(2);
    expect(stock.version).toBe(3);
  });
});
