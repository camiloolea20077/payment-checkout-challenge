import { Product } from '../../domain/entities/product';
import { Stock } from '../../domain/entities/stock';
import { ProductRepositoryPort } from '../../domain/ports/outbound/product-repository.port';
import { StockRepositoryPort } from '../../domain/ports/outbound/stock-repository.port';
import { Money } from '../../domain/value-objects/money';
import { GetProductUseCase } from './get-product.use-case';

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
  availableUnits: 7,
  reservedUnits: 0,
  version: 1,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('GetProductUseCase', () => {
  it('devuelve la vista del producto con su stock', async () => {
    const productRepository: ProductRepositoryPort = {
      findById: jest.fn().mockResolvedValue(product),
      findAllActive: jest.fn(),
    };
    const stockRepository: Partial<StockRepositoryPort> = {
      findByProductId: jest.fn().mockResolvedValue(stock),
    };

    const useCase = new GetProductUseCase(
      productRepository,
      stockRepository as StockRepositoryPort,
    );
    const result = await useCase.execute('product-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('product-1');
      expect(result.value.availableUnits).toBe(7);
    }
  });

  it('devuelve error cuando el producto no existe', async () => {
    const productRepository: ProductRepositoryPort = {
      findById: jest.fn().mockResolvedValue(null),
      findAllActive: jest.fn(),
    };
    const stockRepository: Partial<StockRepositoryPort> = {
      findByProductId: jest.fn(),
    };

    const useCase = new GetProductUseCase(
      productRepository,
      stockRepository as StockRepositoryPort,
    );
    const result = await useCase.execute('missing');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
    }
  });
});
