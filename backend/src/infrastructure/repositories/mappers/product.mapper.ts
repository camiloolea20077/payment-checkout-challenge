import { Product } from '../../../domain/entities/product';
import { Money } from '../../../domain/value-objects/money';
import type { Product as PrismaProduct } from '../../../generated/prisma/client';

/**
 * Traduce entre el registro de Prisma y la entidad de dominio `Product`.
 *
 * Aísla el dominio del esquema de persistencia: el resto de la aplicación nunca
 * manipula tipos de Prisma, solo entidades de dominio.
 */
export class ProductMapper {
  /**
   * Convierte un registro de Prisma en una entidad de dominio.
   *
   * @param record - Fila de la tabla `products`.
   * @param currency - Moneda del sistema para construir el value object `Money`
   *                   (el precio se guarda solo en centavos).
   * @returns La entidad de dominio `Product`.
   */
  static toDomain(record: PrismaProduct, currency: string): Product {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      price: Money.fromCents(record.priceInCents, currency),
      imageUrl: record.imageUrl,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
