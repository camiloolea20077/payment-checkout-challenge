import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Delivery } from '../../domain/entities/delivery';
import { DeliveryRepositoryPort } from '../../domain/ports/outbound/delivery-repository.port';
import { EnvironmentVariables } from '../configuration/environment.config';
import { PrismaService } from '../database/prisma/prisma.service';
import { DeliveryMapper } from './mappers/delivery.mapper';

/**
 * Implementación con Prisma del puerto {@link DeliveryRepositoryPort}.
 */
@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepositoryPort {
  private readonly currency: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.currency = config.get('CURRENCY', { infer: true });
  }

  async create(delivery: Delivery): Promise<Delivery> {
    const record = await this.prisma.delivery.create({
      data: {
        id: delivery.id,
        customerId: delivery.customerId,
        address: delivery.address,
        city: delivery.city,
        department: delivery.department,
        postalCode: delivery.postalCode,
        deliveryFeeInCents: delivery.deliveryFee.amountInCents,
        status: delivery.status,
      },
    });
    return DeliveryMapper.toDomain(record, this.currency);
  }

  async findById(id: string): Promise<Delivery | null> {
    const record = await this.prisma.delivery.findUnique({ where: { id } });
    return record ? DeliveryMapper.toDomain(record, this.currency) : null;
  }

  async update(delivery: Delivery): Promise<Delivery> {
    const record = await this.prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status: delivery.status,
        updatedAt: delivery.updatedAt,
      },
    });
    return DeliveryMapper.toDomain(record, this.currency);
  }
}
