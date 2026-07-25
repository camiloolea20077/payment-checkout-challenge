import { Delivery } from '../../domain/entities/delivery';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery-repository.port';
import { Money } from '../../domain/value-objects/money';
import { UpdateDeliveryStatusUseCase } from './update-delivery-status.use-case';

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

describe('UpdateDeliveryStatusUseCase', () => {
  it('actualiza el estado cuando existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(delivery),
      update: jest.fn((d: Delivery) => Promise.resolve(d)),
    } as unknown as DeliveryRepositoryPort;
    const result = await new UpdateDeliveryStatusUseCase(repo).execute(
      'delivery-1',
      DeliveryStatus.InProgress,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe(DeliveryStatus.InProgress);
  });

  it('devuelve error cuando no existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    } as unknown as DeliveryRepositoryPort;
    const result = await new UpdateDeliveryStatusUseCase(repo).execute(
      'missing',
      DeliveryStatus.Delivered,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('DELIVERY_NOT_FOUND');
  });
});
