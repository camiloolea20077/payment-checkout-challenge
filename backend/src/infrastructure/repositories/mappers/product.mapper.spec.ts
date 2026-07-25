import { Money } from '../../../domain/value-objects/money';
import type { Product as PrismaProduct } from '../../../generated/prisma/client';
import { ProductMapper } from './product.mapper';

const record: PrismaProduct = {
  id: 'product-1',
  name: 'Teclado',
  description: 'Mecánico',
  priceInCents: 30_000,
  imageUrl: 'https://example.test/k.png',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('ProductMapper', () => {
  it('mapea un registro de Prisma a entidad de dominio', () => {
    const product = ProductMapper.toDomain(record, 'COP');
    expect(product.id).toBe('product-1');
    expect(product.name).toBe('Teclado');
    expect(product.isActive).toBe(true);
  });

  it('construye el precio como Money en la moneda indicada', () => {
    const product = ProductMapper.toDomain(record, 'COP');
    expect(product.price.equals(Money.fromCents(30_000, 'COP'))).toBe(true);
  });
});
