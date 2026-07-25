import { ConflictException } from '@nestjs/common';
import { CheckoutUseCase } from '../../../application/use-cases/checkout.use-case';
import { InsufficientStockError } from '../../../domain/errors/insufficient-stock.error';
import { err, ok } from '../../../shared/types/result';
import { CheckoutController } from './checkout.controller';

const dto = {
  customer: {
    fullName: 'Ada',
    email: 'ada@example.com',
    phone: '+57300',
    documentType: 'CC',
    documentNumber: '123',
  },
  delivery: {
    address: 'Calle 1',
    city: 'Bogotá',
    department: 'Cundinamarca',
    postalCode: '110111',
  },
  productId: 'product-1',
  quantity: 1,
  card: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '08',
    expYear: '28',
    cardHolder: 'Ada',
    installments: 1,
  },
};

describe('CheckoutController', () => {
  const checkout = { execute: jest.fn() } as unknown as CheckoutUseCase;
  const controller = new CheckoutController(checkout);

  it('devuelve la transacción y pasa la idempotency-key', async () => {
    (checkout.execute as jest.Mock).mockResolvedValue(
      ok({ id: 'tx-1', status: 'APPROVED' }),
    );
    const result = await controller.execute(dto, 'key-1');
    expect(result.status).toBe('APPROVED');
    expect(checkout.execute).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: 'key-1' }),
    );
  });

  it('mapea InsufficientStock a 409', async () => {
    (checkout.execute as jest.Mock).mockResolvedValue(
      err(new InsufficientStockError(2, 1)),
    );
    await expect(controller.execute(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
