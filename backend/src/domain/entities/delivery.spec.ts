import { DeliveryStatus } from '../enums/delivery-status.enum';
import { Money } from '../value-objects/money';
import { Delivery } from './delivery';

const buildDelivery = (): Delivery =>
  new Delivery({
    id: 'delivery-1',
    customerId: 'customer-1',
    address: 'Calle 123',
    city: 'Bogotá',
    department: 'Cundinamarca',
    postalCode: '110111',
    deliveryFee: Money.fromCents(10_000, 'COP'),
    status: DeliveryStatus.Pending,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

describe('Delivery', () => {
  it('nace en estado PENDING', () => {
    expect(buildDelivery().status).toBe(DeliveryStatus.Pending);
  });

  it('pasa a ASSIGNED al asignarse', () => {
    expect(buildDelivery().assign().status).toBe(DeliveryStatus.Assigned);
  });

  it('no muta la entrega original al asignar (inmutabilidad)', () => {
    const delivery = buildDelivery();
    delivery.assign();
    expect(delivery.status).toBe(DeliveryStatus.Pending);
  });
});
