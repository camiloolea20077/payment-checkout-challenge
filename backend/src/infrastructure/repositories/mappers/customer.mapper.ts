import { Customer } from '../../../domain/entities/customer';
import type { Customer as PrismaCustomer } from '../../../generated/prisma/client';

/**
 * Traduce entre el registro de Prisma y la entidad de dominio `Customer`.
 */
export class CustomerMapper {
  static toDomain(record: PrismaCustomer): Customer {
    return new Customer({
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      documentType: record.documentType,
      documentNumber: record.documentNumber,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
