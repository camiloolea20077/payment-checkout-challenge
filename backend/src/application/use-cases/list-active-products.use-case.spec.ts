import { Product } from '../../domain/entities/product';
import { Stock } from '../../domain/entities/stock';
import { ProductRepositoryPort } from '../../domain/ports/outbound/product-repository.port';
import { StockRepositoryPort } from '../../domain/ports/outbound/stock-repository.port';
import { Money } from '../../domain/value-objects/money';
import { ListActiveProductsUseCase } from './list-active-products.use-case';

const buildProduct = (id: string): Product =>
  new Product({
    id,
    name: `Producto ${id}`,
    description: 'desc',
    price: Money.fromCents(30_000, 'COP'),
    imageUrl: 'https://example.test/p.png',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

const buildStock = (productId: string, availableUnits: number): Stock =>
  new Stock({
    id: `stock-${productId}`,
    productId,
    availableUnits,
    reservedUnits: 0,
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

describe('ListActiveProductsUseCase', () => {
  it('combina productos con su stock disponible', async () => {
    const productRepository: ProductRepositoryPort = {
      findById: jest.fn(),
      findAllActive: jest
        .fn()
        .mockResolvedValue([buildProduct('a'), buildProduct('b')]),
    };
    const stockRepository: Partial<StockRepositoryPort> = {
      findByProductIds: jest
        .fn()
        .mockResolvedValue([buildStock('a', 10), buildStock('b', 3)]),
    };

    const useCase = new ListActiveProductsUseCase(
      productRepository,
      stockRepository as StockRepositoryPort,
    );
    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].availableUnits).toBe(10);
    expect(result[1].availableUnits).toBe(3);
  });

  it('reporta 0 unidades cuando falta el stock de un producto', async () => {
    const productRepository: ProductRepositoryPort = {
      findById: jest.fn(),
      findAllActive: jest.fn().mockResolvedValue([buildProduct('a')]),
    };
    const stockRepository: Partial<StockRepositoryPort> = {
      findByProductIds: jest.fn().mockResolvedValue([]),
    };

    const useCase = new ListActiveProductsUseCase(
      productRepository,
      stockRepository as StockRepositoryPort,
    );
    const result = await useCase.execute();

    expect(result[0].availableUnits).toBe(0);
  });

  it('devuelve vacío sin consultar stock cuando no hay productos', async () => {
    const findByProductIds = jest.fn();
    const productRepository: ProductRepositoryPort = {
      findById: jest.fn(),
      findAllActive: jest.fn().mockResolvedValue([]),
    };
    const stockRepository: Partial<StockRepositoryPort> = { findByProductIds };

    const useCase = new ListActiveProductsUseCase(
      productRepository,
      stockRepository as StockRepositoryPort,
    );
    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(findByProductIds).not.toHaveBeenCalled();
  });
});
