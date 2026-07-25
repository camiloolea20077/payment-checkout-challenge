import type { Customer as PrismaCustomer } from '../../../generated/prisma/client';
import { CustomerMapper } from './customer.mapper';

const record: PrismaCustomer = {
  id: 'customer-1',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+573001112233',
  documentType: 'CC',
  documentNumber: '1020304050',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('CustomerMapper', () => {
  it('mapea un registro de Prisma a entidad de dominio', () => {
    const customer = CustomerMapper.toDomain(record);
    expect(customer.id).toBe('customer-1');
    expect(customer.email).toBe('ada@example.com');
    expect(customer.documentNumber).toBe('1020304050');
  });
});
