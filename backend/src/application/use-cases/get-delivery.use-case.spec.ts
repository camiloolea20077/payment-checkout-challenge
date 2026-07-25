import { Delivery } from '../../domain/entities/delivery';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery-repository.port';
import { Money } from '../../domain/value-objects/money';
import { GetDeliveryUseCase } from './get-delivery.use-case';

const delivery = new Delivery({
  id: 'delivery-1',
  customerId: 'customer-1',
  address: 'Calle 1',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
  deliveryFee: Money.fromCents(10_000, 'COP'),
  status: DeliveryStatus.Pending,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('GetDeliveryUseCase', () => {
  it('devuelve la entrega cuando existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(delivery),
    } as unknown as DeliveryRepositoryPort;
    const result = await new GetDeliveryUseCase(repo).execute('delivery-1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.id).toBe('delivery-1');
  });

  it('devuelve error cuando no existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as DeliveryRepositoryPort;
    const result = await new GetDeliveryUseCase(repo).execute('missing');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('DELIVERY_NOT_FOUND');
  });
});
