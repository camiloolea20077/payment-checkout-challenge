import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

/**
 * Entornos de ejecución soportados por la aplicación.
 */
export enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Contrato tipado de las variables de entorno requeridas por el backend.
 *
 * Se valida al arranque para fallar rápido (fail-fast) si falta o es inválida
 * alguna variable crítica, en lugar de descubrir el error a mitad de una
 * petición. Los valores monetarios se expresan en centavos (enteros).
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsInt()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL!: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_API_URL!: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_PUBLIC_KEY!: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_PRIVATE_KEY!: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_INTEGRITY_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_EVENTS_SECRET!: string;

  @IsInt()
  @Min(0)
  BASE_FEE_IN_CENTS!: number;

  @IsInt()
  @Min(0)
  DEFAULT_DELIVERY_FEE_IN_CENTS!: number;

  @IsString()
  @IsNotEmpty()
  CURRENCY!: string;
}

/**
 * Valida y normaliza las variables de entorno durante el bootstrap de NestJS.
 *
 * `ConfigModule` invoca esta función con el objeto plano de `process.env`. Las
 * variables llegan como texto, por lo que se habilita la conversión implícita
 * para transformar los campos numéricos (puerto, tarifas) a `number` antes de
 * validarlos.
 *
 * @param config - Diccionario crudo de variables de entorno.
 * @returns La instancia validada y tipada de {@link EnvironmentVariables}.
 * @throws Error si alguna variable requerida falta o no cumple su restricción,
 *         abortando el arranque de la aplicación.
 */
export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Variables de entorno inválidas: ${details}`);
  }

  return validatedConfig;
}
