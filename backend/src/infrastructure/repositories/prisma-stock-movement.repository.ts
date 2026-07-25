import { Injectable } from '@nestjs/common';
import { StockMovement } from '../../domain/entities/stock-movement';
import { StockMovementRepositoryPort } from '../../domain/ports/outbound/stock-movement-repository.port';
import { PrismaService } from '../database/prisma/prisma.service';
import { StockMovementMapper } from './mappers/stock-movement.mapper';

/**
 * Implementación con Prisma del puerto {@link StockMovementRepositoryPort}.
 *
 * Usa `this.prisma.client`, por lo que si se invoca dentro de una unidad de
 * trabajo el registro se crea en la misma transacción que el descuento de stock.
 */
@Injectable()
export class PrismaStockMovementRepository implements StockMovementRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(movement: StockMovement): Promise<StockMovement> {
    const record = await this.prisma.client.stockMovement.create({
      data: {
        id: movement.id,
        productId: movement.productId,
        transactionId: movement.transactionId,
        movementType: movement.movementType,
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
      },
    });
    return StockMovementMapper.toDomain(record);
  }
}
