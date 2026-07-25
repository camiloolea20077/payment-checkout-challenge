import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Delivery } from '../../domain/entities/delivery';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { CustomerNotFoundError } from '../../domain/errors/customer-not-found.error';
import {
  CUSTOMER_REPOSITORY,
  type CustomerRepositoryPort,
} from '../../domain/ports/outbound/customer-repository.port';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../../domain/ports/outbound/delivery-repository.port';
import {
  ID_GENERATOR,
  type IdGeneratorPort,
} from '../../domain/ports/outbound/id-generator.port';
import { Money } from '../../domain/value-objects/money';
import { EnvironmentVariables } from '../../infrastructure/configuration/environment.config';
import { Result, err, ok } from '../../shared/types/result';
import { DeliveryView } from '../dto/delivery-view';
import { DeliveryViewMapper } from '../mappers/delivery-view.mapper';

/**
 * Datos de entrada para crear una entrega.
 *
 * La tarifa de envío NO se recibe del cliente: la calcula el backend a partir
 * de la configuración, cumpliendo la regla de que el frontend nunca define
 * valores monetarios.
 */
export interface CreateDeliveryInput {
  customerId: string;
  address: string;
  city: string;
  department: string;
  postalCode: string;
}

/**
 * Caso de uso: crear una entrega en estado `PENDING` para un cliente.
 */
@Injectable()
export class CreateDeliveryUseCase {
  private readonly currency: string;
  private readonly defaultDeliveryFeeInCents: number;

  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(ID_GENERATOR)
    private readonly idGenerator: IdGeneratorPort,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.currency = config.get('CURRENCY', { infer: true });
    this.defaultDeliveryFeeInCents = config.get(
      'DEFAULT_DELIVERY_FEE_IN_CENTS',
      {
        infer: true,
      },
    );
  }

  /**
   * Crea la entrega tras verificar que el cliente existe.
   *
   * @returns La vista de la entrega, o `CustomerNotFoundError` si el cliente
   *          no existe.
   */
  async execute(
    input: CreateDeliveryInput,
  ): Promise<Result<DeliveryView, CustomerNotFoundError>> {
    const customer = await this.customerRepository.findById(input.customerId);
    if (customer === null) {
      return err(new CustomerNotFoundError(input.customerId));
    }

    const now = new Date();
    const delivery = new Delivery({
      id: this.idGenerator.generate(),
      customerId: input.customerId,
      address: input.address,
      city: input.city,
      department: input.department,
      postalCode: input.postalCode,
      deliveryFee: Money.fromCents(
        this.defaultDeliveryFeeInCents,
        this.currency,
      ),
      status: DeliveryStatus.Pending,
      createdAt: now,
      updatedAt: now,
    });

    const created = await this.deliveryRepository.create(delivery);
    return ok(DeliveryViewMapper.toView(created));
  }
}
