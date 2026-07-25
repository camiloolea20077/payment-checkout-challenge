import { Delivery } from '../../domain/entities/delivery';
import { DeliveryView } from '../dto/delivery-view';

/**
 * Construye la vista de lectura de una entrega a partir de la entidad.
 */
export class DeliveryViewMapper {
  static toView(delivery: Delivery): DeliveryView {
    return {
      id: delivery.id,
      customerId: delivery.customerId,
      address: delivery.address,
      city: delivery.city,
      department: delivery.department,
      postalCode: delivery.postalCode,
      deliveryFeeInCents: delivery.deliveryFee.amountInCents,
      currency: delivery.deliveryFee.currency,
      status: delivery.status,
    };
  }
}
