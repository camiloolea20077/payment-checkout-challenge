import { Stock } from '../../../domain/entities/stock';
import type { Stock as PrismaStock } from '../../../generated/prisma/client';

/**
 * Traduce entre el registro de Prisma y la entidad de dominio `Stock`.
 */
export class StockMapper {
  /**
   * Convierte un registro de Prisma en una entidad de dominio.
   *
   * @param record - Fila de la tabla `stock`.
   * @returns La entidad de dominio `Stock`.
   */
  static toDomain(record: PrismaStock): Stock {
    return new Stock({
      id: record.id,
      productId: record.productId,
      availableUnits: record.availableUnits,
      reservedUnits: record.reservedUnits,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
