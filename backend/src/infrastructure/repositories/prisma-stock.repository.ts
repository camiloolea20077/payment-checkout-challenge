import { Injectable } from '@nestjs/common';
import { Stock } from '../../domain/entities/stock';
import { OptimisticLockError } from '../../domain/errors/optimistic-lock.error';
import { StockRepositoryPort } from '../../domain/ports/outbound/stock-repository.port';
import { PrismaService } from '../database/prisma/prisma.service';
import { StockMapper } from './mappers/stock.mapper';

/**
 * Implementación con Prisma del puerto {@link StockRepositoryPort}.
 *
 * La actualización aplica bloqueo optimista: solo modifica la fila si su
 * versión en base de datos sigue siendo la anterior a la entidad recibida,
 * evitando descuentos concurrentes (doble descuento).
 */
@Injectable()
export class PrismaStockRepository implements StockRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string): Promise<Stock | null> {
    const record = await this.prisma.client.stock.findUnique({
      where: { productId },
    });
    return record ? StockMapper.toDomain(record) : null;
  }

  async findByProductIds(productIds: string[]): Promise<Stock[]> {
    const records = await this.prisma.client.stock.findMany({
      where: { productId: { in: productIds } },
    });
    return records.map((record) => StockMapper.toDomain(record));
  }

  /**
   * Persiste el nuevo estado del stock con bloqueo optimista.
   *
   * La entidad recibida ya trae la versión incrementada; la fila en base de
   * datos aún tiene la versión anterior (`version - 1`). Si ninguna fila
   * coincide con esa versión, es que otro proceso la modificó primero.
   *
   * @throws OptimisticLockError si la versión esperada ya no coincide.
   */
  async update(stock: Stock): Promise<Stock> {
    const result = await this.prisma.client.stock.updateMany({
      where: { id: stock.id, version: stock.version - 1 },
      data: {
        availableUnits: stock.availableUnits,
        reservedUnits: stock.reservedUnits,
        version: stock.version,
        updatedAt: stock.updatedAt,
      },
    });

    if (result.count === 0) {
      throw new OptimisticLockError('stock', stock.id);
    }

    const updated = await this.prisma.client.stock.findUniqueOrThrow({
      where: { id: stock.id },
    });
    return StockMapper.toDomain(updated);
  }
}
