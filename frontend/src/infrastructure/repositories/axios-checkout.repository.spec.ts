import { AxiosError } from 'axios';
import {
  NetworkError,
  ProductNotFoundError,
  UnexpectedError,
} from '../../domain/errors/checkout-errors';
import { httpClient } from '../http/http-client';
import { AxiosCheckoutRepository } from './axios-checkout.repository';

jest.mock('../http/http-client', () => ({
  httpClient: { get: jest.fn(), post: jest.fn() },
}));

const get = httpClient.get as jest.Mock;
const post = httpClient.post as jest.Mock;

const productResponse = {
  id: 'p1',
  name: 'Teclado',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

const transactionResponse = {
  id: 'tx1',
  reference: 'R-1',
  status: 'APPROVED',
  quantity: 2,
  productAmountInCents: 60000,
  baseFeeInCents: 5000,
  deliveryFeeInCents: 10000,
  totalAmountInCents: 75000,
  currency: 'COP',
  failureReason: null,
};

describe('AxiosCheckoutRepository', () => {
  const repo = new AxiosCheckoutRepository();

  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it('getProducts mapea la lista', async () => {
    get.mockResolvedValue({ data: [productResponse] });
    const products = await repo.getProducts();
    expect(products[0].id).toBe('p1');
  });

  it('getProduct mapea el producto', async () => {
    get.mockResolvedValue({ data: productResponse });
    expect((await repo.getProduct('p1')).name).toBe('Teclado');
  });

  it('checkout envía la Idempotency-Key y mapea la transacción', async () => {
    post.mockResolvedValue({ data: transactionResponse });
    const tx = await repo.checkout(
      {
        customer: {
          fullName: 'Ada',
          email: 'a@e.com',
          phone: '300',
          documentType: 'CC',
          documentNumber: '1',
        },
        delivery: { address: 'a', city: 'b', department: 'c' },
        productId: 'p1',
        quantity: 2,
        card: {
          number: '4242',
          cvc: '123',
          expMonth: '08',
          expYear: '40',
          cardHolder: 'Ada',
          installments: 1,
        },
      },
      'key-1',
    );
    expect(tx.status).toBe('APPROVED');
    expect(tx.quantity).toBe(2);
    expect(post.mock.calls[0][2]).toEqual({
      headers: { 'Idempotency-Key': 'key-1' },
    });
  });

  it('getProductStock devuelve el stock', async () => {
    get.mockResolvedValue({
      data: { productId: 'p1', availableUnits: 4, reservedUnits: 0 },
    });
    expect((await repo.getProductStock('p1')).availableUnits).toBe(4);
  });

  it('getTransaction mapea la transacción', async () => {
    get.mockResolvedValue({ data: transactionResponse });
    expect((await repo.getTransaction('tx1')).reference).toBe('R-1');
  });

  it('mapea 404 a ProductNotFoundError', async () => {
    get.mockRejectedValue(
      new AxiosError('not found', '404', undefined, undefined, {
        status: 404,
      } as never),
    );
    await expect(repo.getProduct('x')).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });

  it('mapea fallo sin respuesta a NetworkError', async () => {
    get.mockRejectedValue(new AxiosError('network'));
    await expect(repo.getProducts()).rejects.toBeInstanceOf(NetworkError);
  });

  it('mapea otros errores a UnexpectedError', async () => {
    get.mockRejectedValue(new Error('boom'));
    await expect(repo.getProducts()).rejects.toBeInstanceOf(UnexpectedError);
  });
});
