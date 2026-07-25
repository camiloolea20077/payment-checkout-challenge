import { DeliveryStatus } from '../../../domain/enums/delivery-status.enum';
import type { Delivery as PrismaDelivery } from '../../../generated/prisma/client';
import { DeliveryMapper } from './delivery.mapper';

const record: PrismaDelivery = {
  id: 'delivery-1',
  customerId: 'customer-1',
  address: 'Calle 1',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
  deliveryFeeInCents: 10_000,
  status: 'PENDING',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('DeliveryMapper', () => {
  it('mapea el registro y construye el Money de la tarifa', () => {
    const delivery = DeliveryMapper.toDomain(record, 'COP');
    expect(delivery.id).toBe('delivery-1');
    expect(delivery.status).toBe(DeliveryStatus.Pending);
    expect(delivery.deliveryFee.amountInCents).toBe(10_000);
    expect(delivery.deliveryFee.currency).toBe('COP');
  });
});
