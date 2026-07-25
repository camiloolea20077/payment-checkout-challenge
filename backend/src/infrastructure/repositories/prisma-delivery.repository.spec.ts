import { ConfigService } from '@nestjs/config';
import { Delivery } from '../../domain/entities/delivery';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { Money } from '../../domain/value-objects/money';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaDeliveryRepository } from './prisma-delivery.repository';

const record = {
  id: 'delivery-1',
  customerId: 'customer-1',
  address: 'Calle 1',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
  deliveryFeeInCents: 10_000,
  status: 'PENDING',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const buildRepo = (delegate: Record<string, jest.Mock>) => {
  const prisma = { client: { delivery: delegate } } as unknown as PrismaService;
  const config = { get: () => 'COP' } as unknown as ConfigService;
  return new PrismaDeliveryRepository(prisma, config);
};

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

describe('PrismaDeliveryRepository', () => {
  it('create persiste y mapea', async () => {
    const repo = buildRepo({ create: jest.fn().mockResolvedValue(record) });
    const result = await repo.create(delivery);
    expect(result.id).toBe('delivery-1');
    expect(result.deliveryFee.amountInCents).toBe(10_000);
  });

  it('findById devuelve null cuando no existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(null) });
    expect(await repo.findById('missing')).toBeNull();
  });

  it('update persiste el nuevo estado', async () => {
    const repo = buildRepo({
      update: jest.fn().mockResolvedValue({ ...record, status: 'ASSIGNED' }),
    });
    const result = await repo.update(delivery.assign());
    expect(result.status).toBe(DeliveryStatus.Assigned);
  });
});
