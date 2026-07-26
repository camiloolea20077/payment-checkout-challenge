import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { PaymentGatewayError } from '../../domain/errors/payment-gateway.error';
import { ChargeCommand } from '../../domain/ports/outbound/payment-gateway.port';
import { SandboxPaymentGateway } from './sandbox-payment.gateway';

const command: ChargeCommand = {
  reference: 'TXN-1',
  amountInCents: 75_000,
  currency: 'COP',
  customerEmail: 'ada@example.com',
  card: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '08',
    expYear: '28',
    cardHolder: 'Ada',
    installments: 1,
  },
};

const config = {
  get: (key: string) => {
    const values: Record<string, string> = {
      PAYMENT_API_URL: 'https://sandbox.example/v1',
      PAYMENT_PUBLIC_KEY: 'pub_test',
      PAYMENT_PRIVATE_KEY: 'prv_test',
      PAYMENT_INTEGRITY_SECRET: 'integrity',
    };
    return values[key];
  },
} as unknown as ConfigService;

describe('SandboxPaymentGateway', () => {
  it('procesa el cobro y normaliza el estado aprobado', async () => {
    const get = jest
      .fn()
      .mockReturnValueOnce(
        of({
          data: {
            data: { presigned_acceptance: { acceptance_token: 'acc_1' } },
          },
        }),
      )
      .mockReturnValue(
        of({ data: { data: { id: 'prov-1', status: 'APPROVED' } } }),
      );
    const post = jest
      .fn()
      .mockReturnValueOnce(of({ data: { data: { id: 'tok_1' } } }))
      .mockReturnValueOnce(
        of({ data: { data: { id: 'prov-1', status: 'PENDING' } } }),
      );
    const http = { get, post } as unknown as HttpService;

    const gateway = new SandboxPaymentGateway(http, config);
    const result = await gateway.charge(command);

    expect(result.status).toBe('APPROVED');
    expect(result.providerTransactionId).toBe('prov-1');
    // Firma de integridad enviada en el cuerpo de la creación.
    const createBody = post.mock.calls[1][1] as { signature: string };
    expect(createBody.signature).toHaveLength(64);
  });

  it('lanza PaymentGatewayError ante un fallo de red', async () => {
    const http = {
      get: jest.fn().mockReturnValue(throwError(() => new Error('network'))),
      post: jest.fn(),
    } as unknown as HttpService;

    const gateway = new SandboxPaymentGateway(http, config);

    await expect(gateway.charge(command)).rejects.toBeInstanceOf(
      PaymentGatewayError,
    );
  });
});
