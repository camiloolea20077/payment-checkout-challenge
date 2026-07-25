import { Injectable } from '@nestjs/common';
import { UnitOfWorkPort } from '../../../domain/ports/outbound/unit-of-work.port';
import { PrismaService } from './prisma.service';

/**
 * Implementación de {@link UnitOfWorkPort} con Prisma.
 *
 * Delega en {@link PrismaService.runInTransaction}, que abre la transacción y
 * expone el cliente transaccional a los repositorios vía contexto asíncrono.
 */
@Injectable()
export class PrismaUnitOfWork implements UnitOfWorkPort {
  constructor(private readonly prisma: PrismaService) {}

  runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.runInTransaction(work);
  }
}
