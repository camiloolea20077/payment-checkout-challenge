import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  PAYMENT_GATEWAY,
  PaymentResult,
} from './../src/domain/ports/outbound/payment-gateway.port';
import { AppModule } from './../src/app.module';

const SEEDED_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';
const unique = Date.now();

// Respuesta configurable de la pasarela (stub), para no golpear la red real.
let gatewayResult: PaymentResult = {
  providerTransactionId: 'wompi-approved',
  status: 'APPROVED',
  providerStatus: 'APPROVED',
  failureReason: null,
};

const buildBody = (email: string) => ({
  customer: {
    fullName: 'Ada Lovelace',
    email,
    phone: '+573001112233',
    documentType: 'CC',
    documentNumber: `${unique}`,
  },
  delivery: {
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    department: 'Cundinamarca',
    postalCode: '110111',
  },
  productId: SEEDED_PRODUCT_ID,
  quantity: 1,
  card: {
    number: '4242424242424242',
    cvc: '123',
    expMonth: '08',
    expYear: '28',
    cardHolder: 'Ada Lovelace',
    installments: 1,
  },
});

describe('Checkout (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PAYMENT_GATEWAY)
      .useValue({ charge: () => Promise.resolve(gatewayResult) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    http = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /checkout aprobado -> 201 APPROVED, total recalculado y stock descontado', async () => {
    gatewayResult = {
      providerTransactionId: 'wompi-approved',
      status: 'APPROVED',
      providerStatus: 'APPROVED',
      failureReason: null,
    };

    const before = await request(http)
      .get(`/api/v1/products/${SEEDED_PRODUCT_ID}/stock`)
      .expect(200);
    const stockBefore = before.body.availableUnits as number;

    const res = await request(http)
      .post('/api/v1/checkout')
      .set('Idempotency-Key', `checkout-${unique}`)
      .send(buildBody(`ada+${unique}@example.com`))
      .expect(201);

    expect(res.body.status).toBe('APPROVED');
    expect(res.body.totalAmountInCents).toBe(
      res.body.productAmountInCents +
        res.body.baseFeeInCents +
        res.body.deliveryFeeInCents,
    );

    // La transacción quedó persistida y consultable.
    await request(http)
      .get(`/api/v1/transactions/${res.body.id}`)
      .expect(200)
      .expect((r) => expect(r.body.status).toBe('APPROVED'));

    // El stock se descontó exactamente en la cantidad comprada (1).
    const after = await request(http)
      .get(`/api/v1/products/${SEEDED_PRODUCT_ID}/stock`)
      .expect(200);
    expect(after.body.availableUnits).toBe(stockBefore - 1);
  });

  it('POST /checkout rechazado -> 201 DECLINED', async () => {
    gatewayResult = {
      providerTransactionId: 'wompi-declined',
      status: 'DECLINED',
      providerStatus: 'DECLINED',
      failureReason: 'Fondos insuficientes',
    };

    const res = await request(http)
      .post('/api/v1/checkout')
      .send(buildBody(`carl+${unique}@example.com`))
      .expect(201);

    expect(res.body.status).toBe('DECLINED');
    expect(res.body.failureReason).toBe('Fondos insuficientes');
  });

  it('POST /checkout con body inválido -> 400', () => {
    return request(http)
      .post('/api/v1/checkout')
      .send({ productId: 'no-es-uuid' })
      .expect(400);
  });
});
