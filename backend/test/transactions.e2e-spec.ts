import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const SEEDED_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';
const unique = Date.now();

describe('Checkout flow (e2e)', () => {
  let app: INestApplication<App>;
  let http: App;

  let customerId: string;
  let deliveryId: string;
  let unitPriceInCents: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  it('POST /customers -> 201', async () => {
    const res = await request(http)
      .post('/api/v1/customers')
      .send({
        fullName: 'Ada Lovelace',
        email: `ada+${unique}@example.com`,
        phone: '+573001112233',
        documentType: 'CC',
        documentNumber: `${unique}`,
      })
      .expect(201);
    customerId = res.body.id;
    expect(customerId).toBeDefined();
  });

  it('POST /deliveries -> 201 con tarifa calculada por el backend', async () => {
    const res = await request(http)
      .post('/api/v1/deliveries')
      .send({
        customerId,
        address: 'Calle 123 #45-67',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      })
      .expect(201);
    deliveryId = res.body.id;
    expect(res.body.deliveryFeeInCents).toBeGreaterThan(0);
  });

  it('POST /transactions -> 201 PENDING con total recalculado', async () => {
    const productRes = await request(http)
      .get(`/api/v1/products/${SEEDED_PRODUCT_ID}`)
      .expect(200);
    unitPriceInCents = productRes.body.priceInCents;

    const res = await request(http)
      .post('/api/v1/transactions')
      .set('Idempotency-Key', `key-${unique}`)
      .send({
        customerId,
        productId: SEEDED_PRODUCT_ID,
        deliveryId,
        quantity: 2,
      })
      .expect(201);

    expect(res.body.status).toBe('PENDING');
    expect(res.body.productAmountInCents).toBe(unitPriceInCents * 2);
    expect(res.body.totalAmountInCents).toBe(
      res.body.productAmountInCents +
        res.body.baseFeeInCents +
        res.body.deliveryFeeInCents,
    );
  });

  it('POST /transactions con la misma Idempotency-Key -> misma transacción', async () => {
    const first = await request(http)
      .post('/api/v1/transactions')
      .set('Idempotency-Key', `idem-${unique}`)
      .send({
        customerId,
        productId: SEEDED_PRODUCT_ID,
        deliveryId,
        quantity: 1,
      })
      .expect(201);

    const second = await request(http)
      .post('/api/v1/transactions')
      .set('Idempotency-Key', `idem-${unique}`)
      .send({
        customerId,
        productId: SEEDED_PRODUCT_ID,
        deliveryId,
        quantity: 1,
      })
      .expect(201);

    expect(second.body.id).toBe(first.body.id);
  });

  it('POST /transactions con producto inexistente -> 404', () => {
    return request(http)
      .post('/api/v1/transactions')
      .send({
        customerId,
        productId: '99999999-9999-4999-8999-999999999999',
        deliveryId,
        quantity: 1,
      })
      .expect(404);
  });

  it('POST /transactions con quantity inválida -> 400', () => {
    return request(http)
      .post('/api/v1/transactions')
      .send({
        customerId,
        productId: SEEDED_PRODUCT_ID,
        deliveryId,
        quantity: 0,
      })
      .expect(400);
  });
});
