import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IdGeneratorPort } from '../../domain/ports/outbound/id-generator.port';

/**
 * Implementación del generador de identificadores basada en `crypto.randomUUID`.
 */
@Injectable()
export class UuidGenerator implements IdGeneratorPort {
  generate(): string {
    return randomUUID();
  }
}
