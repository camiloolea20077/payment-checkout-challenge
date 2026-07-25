import { Inject, Injectable } from '@nestjs/common';
import { Customer } from '../../domain/entities/customer';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../domain/ports/outbound/customer-repository.port';
import {
  ID_GENERATOR,
  type IdGeneratorPort,
} from '../../domain/ports/outbound/id-generator.port';
import { CustomerView } from '../dto/customer-view';
import { CustomerViewMapper } from '../mappers/customer-view.mapper';

/**
 * Datos de entrada para crear (o reutilizar) un cliente.
 */
export interface CreateCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
}

/**
 * Caso de uso: crear un cliente, reutilizándolo si ya existe por correo.
 *
 * Reutilizar por email evita duplicar clientes cuando la misma persona compra
 * varias veces, tal como pide el flujo del checkout.
 */
@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IdGeneratorPort,
  ) {}

  /**
   * Crea el cliente o devuelve el existente con el mismo correo.
   *
   * @param input - Datos del cliente.
   * @returns La vista del cliente creado o reutilizado.
   */
  async execute(input: CreateCustomerInput): Promise<CustomerView> {
    const existing = await this.customerRepository.findByEmail(input.email);
    if (existing !== null) {
      return CustomerViewMapper.toView(existing);
    }

    const now = new Date();
    const customer = new Customer({
      id: this.idGenerator.generate(),
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.customerRepository.create(customer);
    return CustomerViewMapper.toView(created);
  }
}
