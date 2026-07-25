import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DomainError } from '../../../domain/errors/domain-error';

/**
 * Traduce un error de dominio a la excepción HTTP correspondiente.
 *
 * Concentra en un solo lugar el mapeo `code -> status`, para que todos los
 * controladores respondan de forma consistente sin repetir la lógica.
 *
 * @param error - Error de negocio devuelto por un caso de uso.
 * @returns La `HttpException` con el estado adecuado.
 */
export function domainErrorToHttp(error: DomainError): HttpException {
  switch (error.code) {
    case 'PRODUCT_NOT_FOUND':
    case 'CUSTOMER_NOT_FOUND':
    case 'DELIVERY_NOT_FOUND':
    case 'TRANSACTION_NOT_FOUND':
      return new NotFoundException(error.message);
    case 'PRODUCT_INACTIVE':
      return new UnprocessableEntityException(error.message);
    case 'INSUFFICIENT_STOCK':
    case 'OPTIMISTIC_LOCK_CONFLICT':
      return new ConflictException(error.message);
    default:
      return new BadRequestException(error.message);
  }
}
