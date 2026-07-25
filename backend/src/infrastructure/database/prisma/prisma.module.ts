import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global que provee el {@link PrismaService}.
 *
 * Se marca como `@Global` para que cualquier repositorio pueda inyectar el
 * cliente de base de datos sin reimportar el módulo en cada feature.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
