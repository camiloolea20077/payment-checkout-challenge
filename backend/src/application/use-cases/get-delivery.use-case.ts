import { Inject, Injectable } from '@nestjs/common';
import { DeliveryNotFoundError } from '../../domain/errors/delivery-not-found.error';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../../domain/ports/outbound/delivery-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { DeliveryView } from '../dto/delivery-view';
import { DeliveryViewMapper } from '../mappers/delivery-view.mapper';

/**
 * Caso de uso: consultar una entrega por su identificador.
 */
@Injectable()
export class GetDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<DeliveryView, DeliveryNotFoundError>> {
    const delivery = await this.deliveryRepository.findById(id);
    if (delivery === null) {
      return err(new DeliveryNotFoundError(id));
    }
    return ok(DeliveryViewMapper.toView(delivery));
  }
}
