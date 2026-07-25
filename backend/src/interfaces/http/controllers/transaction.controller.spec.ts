import { NotFoundException } from '@nestjs/common';
import { CreatePendingTransactionUseCase } from '../../../application/use-cases/create-pending-transaction.use-case';
import { GetTransactionUseCase } from '../../../application/use-cases/get-transaction.use-case';
import { ProcessPaymentUseCase } from '../../../application/use-cases/process-payment.use-case';
import { TransactionNotFoundError } from '../../../domain/errors/transaction-not-found.error';
import { err, ok } from '../../../shared/types/result';
import { TransactionController } from './transaction.controller';

const view = { id: 'tx-1', status: 'PENDING' };

const card = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '08',
  expYear: '28',
  cardHolder: 'Ada',
  installments: 1,
};

describe('TransactionController', () => {
  const create = {
    execute: jest.fn(),
  } as unknown as CreatePendingTransactionUseCase;
  const get = { execute: jest.fn() } as unknown as GetTransactionUseCase;
  const process = { execute: jest.fn() } as unknown as ProcessPaymentUseCase;
  const controller = new TransactionController(create, get, process);

  it('create pasa la idempotency-key al caso de uso', async () => {
    (create.execute as jest.Mock).mockResolvedValue(ok(view));
    const dto = {
      customerId: 'c',
      productId: 'p',
      deliveryId: 'd',
      quantity: 1,
    };
    await controller.create(dto, 'key-1');
    expect(create.execute).toHaveBeenCalledWith({
      ...dto,
      idempotencyKey: 'key-1',
    });
  });

  it('process devuelve la transacción resuelta', async () => {
    (process.execute as jest.Mock).mockResolvedValue(
      ok({ ...view, status: 'APPROVED' }),
    );
    const result = await controller.process('tx-1', { card });
    expect(result.status).toBe('APPROVED');
  });

  it('detail lanza 404 cuando no existe', async () => {
    (get.execute as jest.Mock).mockResolvedValue(
      err(new TransactionNotFoundError('missing')),
    );
    await expect(controller.detail('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
