import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'node:async_hooks';
import { EnvironmentVariables } from '../../configuration/environment.config';
import { Prisma, PrismaClient } from '../../../generated/prisma/client';

/** Cliente transaccional de Prisma (sin métodos de nivel de conexión). */
type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Servicio que expone el cliente de Prisma al resto de la aplicación.
 *
 * Compone (no extiende) un `PrismaClient` instanciado con el driver adapter de
 * PostgreSQL (`@prisma/adapter-pg`), tal como exige Prisma 7. La composición
 * evita el problema de que el cliente generado devuelve un Proxy: al acceder por
 * la propiedad {@link client} siempre se obtiene el cliente correcto.
 *
 * Soporta unidad de trabajo: {@link runInTransaction} ejecuta una función dentro
 * de una transacción de base de datos y guarda el cliente transaccional en un
 * `AsyncLocalStorage`. Los repositorios acceden mediante {@link client}, de modo
 * que, sin cambiar su API, operan sobre la transacción activa cuando la hay o
 * sobre la conexión normal cuando no.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly prisma: PrismaClient;
  private readonly transactionContext =
    new AsyncLocalStorage<PrismaTransactionClient>();

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    });
    this.prisma = new PrismaClient({ adapter });
  }

  /**
   * Cliente a usar para las consultas: el transaccional si hay una transacción
   * activa en el contexto, o la conexión base en caso contrario.
   */
  get client(): PrismaTransactionClient {
    return this.transactionContext.getStore() ?? this.prisma;
  }

  /**
   * Ejecuta `work` dentro de una única transacción de base de datos.
   *
   * Si ya existe una transacción activa, la reutiliza (no anida), lo que permite
   * componer operaciones sin abrir transacciones nuevas por accidente.
   *
   * @param work - Función con las operaciones a ejecutar atómicamente.
   * @returns El resultado de `work`; si lanza, se revierte toda la transacción.
   */
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const active = this.transactionContext.getStore();
    if (active) {
      return work();
    }
    return this.prisma.$transaction((tx) =>
      this.transactionContext.run(tx, () => work()),
    );
  }

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
    this.logger.log('Conexión a la base de datos establecida.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
