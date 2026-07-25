import { Inject, Injectable } from '@nestjs/common';
import { DeliveryStatus } from '../../domain/enums/delivery-status.enum';
import { DeliveryNotFoundError } from '../../domain/errors/delivery-not-found.error';
import {
  DELIVERY_REPOSITORY,
  type DeliveryRepositoryPort,
} from '../../domain/ports/outbound/delivery-repository.port';
import { Result, err, ok } from '../../shared/types/result';
import { DeliveryView } from '../dto/delivery-view';
import { DeliveryViewMapper } from '../mappers/delivery-view.mapper';

/**
 * Caso de uso: actualizar el estado de una entrega.
 */
@Injectable()
export class UpdateDeliveryStatusUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  /**
   * @param id - Identificador de la entrega.
   * @param status - Nuevo estado.
   * @returns La vista actualizada, o `DeliveryNotFoundError` si no existe.
   */
  async execute(
    id: string,
    status: DeliveryStatus,
  ): Promise<Result<DeliveryView, DeliveryNotFoundError>> {
    const delivery = await this.deliveryRepository.findById(id);
    if (delivery === null) {
      return err(new DeliveryNotFoundError(id));
    }

    const updated = await this.deliveryRepository.update(
      delivery.changeStatusTo(status),
    );
    return ok(DeliveryViewMapper.toView(updated));
  }
}
