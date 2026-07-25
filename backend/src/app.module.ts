import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnvironment } from './infrastructure/configuration/environment.config';
import { HealthController } from './interfaces/http/controllers/health.controller';
import { AllExceptionsFilter } from './interfaces/http/filters/all-exceptions.filter';
import { LoggingInterceptor } from './interfaces/http/interceptors/logging.interceptor';

/**
 * Módulo raíz de la aplicación.
 *
 * Cablea las preocupaciones transversales de la Fase 1:
 * - Configuración validada al arranque ({@link validateEnvironment}).
 * - Rate limiting global vía Throttler.
 * - Filtro de excepciones e interceptor de logging aplicados a toda la app.
 *
 * Los módulos de dominio (productos, stock, transacciones...) se registrarán
 * en fases posteriores.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
