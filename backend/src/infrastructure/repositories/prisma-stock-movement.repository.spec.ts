import { StockMovement } from '../../domain/entities/stock-movement';
import { MovementType } from '../../domain/enums/movement-type.enum';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaStockMovementRepository } from './prisma-stock-movement.repository';

const record = {
  id: 'movement-1',
  productId: 'product-1',
  transactionId: 'tx-1',
  movementType: 'SALE',
  quantity: 3,
  previousStock: 10,
  newStock: 7,
  createdAt: new Date('2026-01-01'),
};

describe('PrismaStockMovementRepository', () => {
  it('create persiste y mapea el movimiento', async () => {
    const create = jest.fn().mockResolvedValue(record);
    const prisma = {
      client: { stockMovement: { create } },
    } as unknown as PrismaService;
    const repo = new PrismaStockMovementRepository(prisma);

    const result = await repo.create(
      new StockMovement({
        id: 'movement-1',
        productId: 'product-1',
        transactionId: 'tx-1',
        movementType: MovementType.Sale,
        quantity: 3,
        previousStock: 10,
        newStock: 7,
        createdAt: new Date('2026-01-01'),
      }),
    );

    expect(result.id).toBe('movement-1');
    expect(result.newStock).toBe(7);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
