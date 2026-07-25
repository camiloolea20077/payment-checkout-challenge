import { Customer } from '../../domain/entities/customer';
import { CustomerRepositoryPort } from '../../domain/ports/outbound/customer-repository.port';
import { IdGeneratorPort } from '../../domain/ports/outbound/id-generator.port';
import { CreateCustomerUseCase } from './create-customer.use-case';

const input = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+573001112233',
  documentType: 'CC',
  documentNumber: '1020304050',
};

const existing = new Customer({
  id: 'existing-id',
  ...input,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('CreateCustomerUseCase', () => {
  const idGenerator: IdGeneratorPort = { generate: jest.fn(() => 'new-id') };

  it('crea un cliente nuevo cuando no existe por email', async () => {
    const create = jest.fn((c: Customer) => Promise.resolve(c));
    const repository: CustomerRepositoryPort = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      create,
    };

    const useCase = new CreateCustomerUseCase(repository, idGenerator);
    const result = await useCase.execute(input);

    expect(result.id).toBe('new-id');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('reutiliza el cliente existente por email sin crear otro', async () => {
    const create = jest.fn();
    const repository: CustomerRepositoryPort = {
      findByEmail: jest.fn().mockResolvedValue(existing),
      findById: jest.fn(),
      create,
    };

    const useCase = new CreateCustomerUseCase(repository, idGenerator);
    const result = await useCase.execute(input);

    expect(result.id).toBe('existing-id');
    expect(create).not.toHaveBeenCalled();
  });
});
