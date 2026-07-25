import { StockMovement } from '../../../domain/entities/stock-movement';
import { MovementType } from '../../../domain/enums/movement-type.enum';
import type { StockMovement as PrismaStockMovement } from '../../../generated/prisma/client';

/**
 * Traduce entre el registro de Prisma y la entidad `StockMovement`.
 */
export class StockMovementMapper {
  static toDomain(record: PrismaStockMovement): StockMovement {
    return new StockMovement({
      id: record.id,
      productId: record.productId,
      transactionId: record.transactionId,
      movementType: record.movementType as MovementType,
      quantity: record.quantity,
      previousStock: record.previousStock,
      newStock: record.newStock,
      createdAt: record.createdAt,
    });
  }
}
