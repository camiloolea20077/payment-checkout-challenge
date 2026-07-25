import { NotFoundException } from '@nestjs/common';
import { ProductNotFoundError } from '../../../domain/errors/product-not-found.error';
import { err, ok } from '../../../shared/types/result';
import { GetProductStockUseCase } from '../../../application/use-cases/get-product-stock.use-case';
import { GetProductUseCase } from '../../../application/use-cases/get-product.use-case';
import { ListActiveProductsUseCase } from '../../../application/use-cases/list-active-products.use-case';
import { ProductController } from './product.controller';

const view = { id: 'product-1', availableUnits: 5 };

describe('ProductController', () => {
  const list = { execute: jest.fn() } as unknown as ListActiveProductsUseCase;
  const get = { execute: jest.fn() } as unknown as GetProductUseCase;
  const stock = { execute: jest.fn() } as unknown as GetProductStockUseCase;
  const controller = new ProductController(list, get, stock);

  it('list delega en el caso de uso', async () => {
    (list.execute as jest.Mock).mockResolvedValue([view]);
    expect(await controller.list()).toEqual([view]);
  });

  it('detail devuelve el producto cuando existe', async () => {
    (get.execute as jest.Mock).mockResolvedValue(ok(view));
    expect(await controller.detail('product-1')).toEqual(view);
  });

  it('detail lanza 404 cuando no existe', async () => {
    (get.execute as jest.Mock).mockResolvedValue(
      err(new ProductNotFoundError('missing')),
    );
    await expect(controller.detail('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('stock devuelve las unidades cuando existe', async () => {
    (stock.execute as jest.Mock).mockResolvedValue(
      ok({ productId: 'product-1', availableUnits: 5, reservedUnits: 0 }),
    );
    expect((await controller.stock('product-1')).availableUnits).toBe(5);
  });
});
