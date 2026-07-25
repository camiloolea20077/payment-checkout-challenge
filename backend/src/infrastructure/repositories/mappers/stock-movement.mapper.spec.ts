import { MovementType } from '../../../domain/enums/movement-type.enum';
import type { StockMovement as PrismaStockMovement } from '../../../generated/prisma/client';
import { StockMovementMapper } from './stock-movement.mapper';

const record: PrismaStockMovement = {
  id: 'movement-1',
  productId: 'product-1',
  transactionId: 'tx-1',
  movementType: 'SALE',
  quantity: 3,
  previousStock: 10,
  newStock: 7,
  createdAt: new Date('2026-01-01'),
};

describe('StockMovementMapper', () => {
  it('mapea el registro a entidad de dominio', () => {
    const movement = StockMovementMapper.toDomain(record);
    expect(movement.id).toBe('movement-1');
    expect(movement.movementType).toBe(MovementType.Sale);
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(7);
  });
});
