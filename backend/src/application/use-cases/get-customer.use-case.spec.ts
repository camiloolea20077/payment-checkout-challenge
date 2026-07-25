import { Customer } from '../../domain/entities/customer';
import { CustomerRepositoryPort } from '../../domain/ports/outbound/customer-repository.port';
import { GetCustomerUseCase } from './get-customer.use-case';

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

describe('GetCustomerUseCase', () => {
  it('devuelve el cliente cuando existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(customer),
    } as unknown as CustomerRepositoryPort;
    const result = await new GetCustomerUseCase(repo).execute('customer-1');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.email).toBe('ada@example.com');
  });

  it('devuelve error cuando no existe', async () => {
    const repo = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as CustomerRepositoryPort;
    const result = await new GetCustomerUseCase(repo).execute('missing');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('CUSTOMER_NOT_FOUND');
  });
});
