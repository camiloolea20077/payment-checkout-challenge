import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Product } from '../../domain/entities/product';
import { ProductRepositoryPort } from '../../domain/ports/outbound/product-repository.port';
import { EnvironmentVariables } from '../configuration/environment.config';
import { PrismaService } from '../database/prisma/prisma.service';
import { ProductMapper } from './mappers/product.mapper';

/**
 * Implementación con Prisma del puerto {@link ProductRepositoryPort}.
 *
 * Traduce cada registro a entidad de dominio mediante {@link ProductMapper},
 * de modo que la capa de aplicación nunca recibe tipos de Prisma.
 */
@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  private readonly currency: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.currency = config.get('CURRENCY', { infer: true });
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? ProductMapper.toDomain(record, this.currency) : null;
  }

  async findAllActive(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) =>
      ProductMapper.toDomain(record, this.currency),
    );
  }
}
