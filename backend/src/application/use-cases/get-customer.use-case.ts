import { Inject, Injectable } from '@nestjs/common';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../domain/ports/outbound/customer-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { CustomerView } from '../dto/customer-view';
import { CustomerViewMapper } from '../mappers/customer-view.mapper';

/**
 * Caso de uso: consultar un cliente por su identificador.
 */
@Injectable()
export class GetCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<CustomerView, CustomerNotFoundError>> {
    const customer = await this.customerRepository.findById(id);
    if (customer === null) {
      return err(new CustomerNotFoundError(id));
    }
    return ok(CustomerViewMapper.toView(customer));
  }
}
