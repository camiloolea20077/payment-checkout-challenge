import { Product } from '../../domain/entities/product';
import { Stock } from '../../domain/entities/stock';
import { ProductRepositoryPort } from '../../domain/ports/outbound/product-repository.port';
import { StockRepositoryPort } from '../../domain/ports/outbound/stock-repository.port';
import { Money } from '../../domain/value-objects/money';
import { GetProductStockUseCase } from './get-product-stock.use-case';

const product = new Product({
  id: 'product-1',
  name: 'Teclado',
  description: 'desc',
  price: Money.fromCents(30_000, 'COP'),
  imageUrl: 'https://example.test/p.png',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const stock = new Stock({
  id: 'stock-1',
  productId: 'product-1',
  availableUnits: 8,
  reservedUnits: 1,
  version: 1,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('GetProductStockUseCase', () => {
  it('devuelve el stock cuando el producto existe', async () => {
    const productRepo = {
      findById: jest.fn().mockResolvedValue(product),
    } as unknown as ProductRepositoryPort;
    const stockRepo = {
      findByProductId: jest.fn().mockResolvedValue(stock),
    } as unknown as StockRepositoryPort;
    const result = await new GetProductStockUseCase(
      productRepo,
      stockRepo,
    ).execute('product-1');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.availableUnits).toBe(8);
      expect(result.value.reservedUnits).toBe(1);
    }
  });

  it('devuelve error cuando el producto no existe', async () => {
    const productRepo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as ProductRepositoryPort;
    const stockRepo = {
      findByProductId: jest.fn(),
    } as unknown as StockRepositoryPort;
    const result = await new GetProductStockUseCase(
      productRepo,
      stockRepo,
    ).execute('missing');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});
