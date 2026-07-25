import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CustomerNotFoundError } from '../../../domain/errors/customer-not-found.error';
import { InsufficientStockError } from '../../../domain/errors/insufficient-stock.error';
import { InvalidQuantityError } from '../../../domain/errors/invalid-quantity.error';
import { OptimisticLockError } from '../../../domain/errors/optimistic-lock.error';
import { ProductInactiveError } from '../../../domain/errors/product-inactive.error';
import { domainErrorToHttp } from './domain-error.mapper';

describe('domainErrorToHttp', () => {
  it('mapea *_NOT_FOUND a 404', () => {
    expect(domainErrorToHttp(new CustomerNotFoundError('x'))).toBeInstanceOf(
      NotFoundException,
    );
  });

  it('mapea PRODUCT_INACTIVE a 422', () => {
    expect(domainErrorToHttp(new ProductInactiveError('x'))).toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('mapea INSUFFICIENT_STOCK a 409', () => {
    expect(domainErrorToHttp(new InsufficientStockError(2, 1))).toBeInstanceOf(
      ConflictException,
    );
  });

  it('mapea OPTIMISTIC_LOCK_CONFLICT a 409', () => {
    expect(
      domainErrorToHttp(new OptimisticLockError('stock', 'x')),
    ).toBeInstanceOf(ConflictException);
  });

  it('mapea el resto a 400', () => {
    expect(domainErrorToHttp(new InvalidQuantityError())).toBeInstanceOf(
      BadRequestException,
    );
  });
});
