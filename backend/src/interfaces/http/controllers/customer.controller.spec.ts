import { NotFoundException } from '@nestjs/common';
import { CreateCustomerUseCase } from '../../../application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from '../../../application/use-cases/get-customer.use-case';
import { CustomerNotFoundError } from '../../../domain/errors/customer-not-found.error';
import { err, ok } from '../../../shared/types/result';
import { CustomerController } from './customer.controller';

const view = { id: 'customer-1', email: 'ada@example.com' };

const dto = {
  fullName: 'Ada',
  email: 'ada@example.com',
  phone: '+57300',
  documentType: 'CC',
  documentNumber: '123',
};

describe('CustomerController', () => {
  const create = { execute: jest.fn() } as unknown as CreateCustomerUseCase;
  const get = { execute: jest.fn() } as unknown as GetCustomerUseCase;
  const controller = new CustomerController(create, get);

  it('create delega en el caso de uso', async () => {
    (create.execute as jest.Mock).mockResolvedValue(view);
    expect(await controller.create(dto)).toEqual(view);
  });

  it('detail devuelve el cliente cuando existe', async () => {
    (get.execute as jest.Mock).mockResolvedValue(ok(view));
    expect(await controller.detail('customer-1')).toEqual(view);
  });

  it('detail lanza 404 cuando no existe', async () => {
    (get.execute as jest.Mock).mockResolvedValue(
      err(new CustomerNotFoundError('missing')),
    );
    await expect(controller.detail('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
