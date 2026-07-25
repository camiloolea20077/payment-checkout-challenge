import { NotFoundException } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../../../application/use-cases/create-delivery.use-case';
import { GetDeliveryUseCase } from '../../../application/use-cases/get-delivery.use-case';
import { UpdateDeliveryStatusUseCase } from '../../../application/use-cases/update-delivery-status.use-case';
import { DeliveryStatus } from '../../../domain/enums/delivery-status.enum';
import { DeliveryNotFoundError } from '../../../domain/errors/delivery-not-found.error';
import { err, ok } from '../../../shared/types/result';
import { DeliveryController } from './delivery.controller';

const view = { id: 'delivery-1', status: 'PENDING' };

const dto = {
  customerId: 'customer-1',
  address: 'Calle 1',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
};

describe('DeliveryController', () => {
  const create = { execute: jest.fn() } as unknown as CreateDeliveryUseCase;
  const get = { execute: jest.fn() } as unknown as GetDeliveryUseCase;
  const update = {
    execute: jest.fn(),
  } as unknown as UpdateDeliveryStatusUseCase;
  const controller = new DeliveryController(create, get, update);

  it('create devuelve la entrega', async () => {
    (create.execute as jest.Mock).mockResolvedValue(ok(view));
    expect(await controller.create(dto)).toEqual(view);
  });

  it('create lanza 404 si el cliente no existe', async () => {
    (create.execute as jest.Mock).mockResolvedValue(
      err(new DeliveryNotFoundError('missing')),
    );
    await expect(controller.create(dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updateStatus delega con el estado', async () => {
    (update.execute as jest.Mock).mockResolvedValue(
      ok({ ...view, status: 'IN_PROGRESS' }),
    );
    const result = await controller.updateStatus('delivery-1', {
      status: DeliveryStatus.InProgress,
    });
    expect(result.status).toBe('IN_PROGRESS');
  });
});
