import { ConfigService } from '@nestjs/config';
import { Customer } from '../../domain/entities/customer';
import { Delivery } from '../../domain/entities/delivery';
import { CustomerRepositoryPort } from '../../domain/ports/outbound/customer-repository.port';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery-repository.port';
import { IdGeneratorPort } from '../../domain/ports/outbound/id-generator.port';
import { EnvironmentVariables } from '../../infrastructure/configuration/environment.config';
import { CreateDeliveryUseCase } from './create-delivery.use-case';

const customer = new Customer({
  id: 'customer-1',
  fullName: 'Ada',
  email: 'ada@example.com',
  phone: '+57300',
  documentType: 'CC',
  documentNumber: '123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const input = {
  customerId: 'customer-1',
  address: 'Calle 1',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
};

const buildUseCase = (foundCustomer: Customer | null) => {
  const customerRepository = {
    findById: jest.fn().mockResolvedValue(foundCustomer),
  } as unknown as CustomerRepositoryPort;
  const deliveryRepository = {
    create: jest.fn((d: Delivery) => Promise.resolve(d)),
  } as unknown as DeliveryRepositoryPort;
  const idGenerator: IdGeneratorPort = {
    generate: jest.fn(() => 'delivery-1'),
  };
  const config = {
    get: (key: string) => (key === 'CURRENCY' ? 'COP' : 10_000),
  } as unknown as ConfigService<EnvironmentVariables, true>;
  return new CreateDeliveryUseCase(
    customerRepository,
    deliveryRepository,
    idGenerator,
    config,
  );
};

describe('CreateDeliveryUseCase', () => {
  it('crea la entrega con la tarifa calculada por el backend', async () => {
    const result = await buildUseCase(customer).execute(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.deliveryFeeInCents).toBe(10_000);
      expect(result.value.status).toBe('PENDING');
    }
  });

  it('falla si el cliente no existe', async () => {
    const result = await buildUseCase(null).execute(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CUSTOMER_NOT_FOUND');
  });
});
