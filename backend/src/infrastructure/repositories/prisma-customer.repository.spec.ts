import { Customer } from '../../domain/entities/customer';
import { PrismaService } from '../database/prisma/prisma.service';
import { PrismaCustomerRepository } from './prisma-customer.repository';

const record = {
  id: 'customer-1',
  fullName: 'Ada',
  email: 'ada@example.com',
  phone: '+57300',
  documentType: 'CC',
  documentNumber: '123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const buildRepo = (delegate: Record<string, jest.Mock>) => {
  const prisma = { client: { customer: delegate } } as unknown as PrismaService;
  return new PrismaCustomerRepository(prisma);
};

const customer = new Customer({ ...record });

describe('PrismaCustomerRepository', () => {
  it('create persiste y mapea', async () => {
    const create = jest.fn().mockResolvedValue(record);
    const repo = buildRepo({ create });
    const result = await repo.create(customer);
    expect(result.email).toBe('ada@example.com');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('findById devuelve null cuando no existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(null) });
    expect(await repo.findById('missing')).toBeNull();
  });

  it('findByEmail mapea cuando existe', async () => {
    const repo = buildRepo({ findUnique: jest.fn().mockResolvedValue(record) });
    const result = await repo.findByEmail('ada@example.com');
    expect(result?.id).toBe('customer-1');
  });
});
