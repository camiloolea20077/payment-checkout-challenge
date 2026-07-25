import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaProductRepository } from './prisma-product.repository';

const record = {
  id: 'product-1',
  name: 'Teclado',
  description: 'desc',
  priceInCents: 30_000,
  imageUrl: 'https://example.test/p.png',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const buildRepo = (delegate: Record<string, jest.Mock>) => {
  const prisma = { client: { product: delegate } } as unknown as PrismaService;
  const config = { get: () => 'COP' } as unknown as ConfigService;
  return new PrismaProductRepository(prisma, config);
};

describe('PrismaProductRepository', () => {
  it('findById mapea a dominio cuando existe', async () => {
    const repo = buildRepo({
      findUnique: jest.fn().mockResolvedValue(record),
    });
    const product = await repo.findById('product-1');
    expect(product?.id).toBe('product-1');
    expect(product?.price.amountInCents).toBe(30_000);
  });

  it('findById devuelve null cuando no existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(null) });
    expect(await repo.findById('missing')).toBeNull();
  });

  it('findAllActive mapea la lista', async () => {
    const repo = buildRepo({
      findMany: jest.fn().mockResolvedValue([record]),
    });
    const products = await repo.findAllActive();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Teclado');
  });
});
