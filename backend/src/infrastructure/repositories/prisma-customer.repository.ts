import { Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities/customer';
import { CustomerRepositoryPort } from '../../domain/ports/outbound/customer-repository.port';
import { PrismaService } from '../database/prisma/prisma.service';
import { CustomerMapper } from './mappers/customer.mapper';

/**
 * Implementación con Prisma del puerto {@link CustomerRepositoryPort}.
 */
@Injectable()
export class PrismaCustomerRepository implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: Customer): Promise<Customer> {
    const record = await this.prisma.customer.create({
      data: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        documentType: customer.documentType,
        documentNumber: customer.documentNumber,
      },
    });
    return CustomerMapper.toDomain(record);
  }

  async findById(id: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({ where: { id } });
    return record ? CustomerMapper.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const record = await this.prisma.customer.findUnique({ where: { email } });
    return record ? CustomerMapper.toDomain(record) : null;
  }
}
