import { Delivery } from '../../../domain/entities/delivery';
import { DeliveryStatus } from '../../../domain/enums/delivery-status.enum';
import { Money } from '../../../domain/value-objects/money';
import type { Delivery as PrismaDelivery } from '../../../generated/prisma/client';

/**
 * Traduce entre el registro de Prisma y la entidad de dominio `Delivery`.
 */
export class DeliveryMapper {
  /**
   * @param record - Fila de la tabla `deliveries`.
   * @param currency - Moneda del sistema para construir el `Money` de la tarifa.
   */
  static toDomain(record: PrismaDelivery, currency: string): Delivery {
    return new Delivery({
      id: record.id,
      customerId: record.customerId,
      address: record.address,
      city: record.city,
      department: record.department,
      postalCode: record.postalCode,
      deliveryFee: Money.fromCents(record.deliveryFeeInCents, currency),
      status: record.status as DeliveryStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
