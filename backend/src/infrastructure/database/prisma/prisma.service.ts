import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvironmentVariables } from '../../configuration/environment.config';
import { PrismaClient } from '../../../generated/prisma/client';

/**
 * Servicio que expone el cliente de Prisma al resto de la aplicación.
 *
 * Extiende el `PrismaClient` generado y lo instancia con el driver adapter de
 * PostgreSQL (`@prisma/adapter-pg`), tal como exige Prisma 7. Gestiona el ciclo
 * de vida de la conexión mediante los hooks de NestJS para conectar al arrancar
 * y cerrar limpiamente al apagar.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
    });
    super({ adapter });
  }

  /**
   * Establece la conexión con la base de datos al inicializar el módulo.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conexión a la base de datos establecida.');
  }

  /**
   * Cierra la conexión de forma ordenada al destruir el módulo.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
