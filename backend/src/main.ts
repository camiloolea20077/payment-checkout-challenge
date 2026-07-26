import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './infrastructure/configuration/environment.config';

/**
 * Punto de entrada de la aplicación.
 *
 * Configura las defensas de seguridad y las convenciones de la API antes de
 * escuchar peticiones:
 * - Helmet para cabeceras de seguridad.
 * - CORS restringido al origen del frontend.
 * - Prefijo global `api/v1` para versionado.
 * - ValidationPipe estricto (whitelist + forbidNonWhitelisted + transform).
 * - Documentación Swagger publicada en `/api/docs`.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  // Cabeceras de seguridad HTTP (XSS, clickjacking, sniffing, etc.).
  app.use(helmet());

  // Solo se permite el origen del frontend; sin credenciales por cookies.
  app.enableCors({
    origin: config.get('FRONTEND_URL', { infer: true }),
    methods: ['GET', 'POST', 'PATCH'],
    credentials: false,
  });

  app.setGlobalPrefix('api/v1');

  // Validación y transformación centralizada de todos los DTO de entrada.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Checkout API')
    .setDescription('API de checkout con pago por tarjeta en ambiente Sandbox.')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
}

void bootstrap();
