import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Id de un producto cargado por el seed (prisma/seed.ts).
const SEEDED_PRODUCT_ID = '11111111-1111-4111-8111-111111111111';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/products -> 200 con catálogo sembrado', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(4);
        expect(typeof res.body[0].availableUnits).toBe('number');
      });
  });

  it('GET /api/v1/products/:id -> 200 con el producto', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/products/${SEEDED_PRODUCT_ID}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(SEEDED_PRODUCT_ID);
        expect(res.body.priceInCents).toBeGreaterThan(0);
      });
  });

  it('GET /api/v1/products/:id/stock -> 200 con unidades', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/products/${SEEDED_PRODUCT_ID}/stock`)
      .expect(200)
      .expect((res) => {
        expect(res.body.productId).toBe(SEEDED_PRODUCT_ID);
        expect(res.body.availableUnits).toBeGreaterThanOrEqual(0);
      });
  });

  it('GET /api/v1/products/:id -> 404 si no existe', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products/99999999-9999-4999-8999-999999999999')
      .expect(404);
  });

  it('GET /api/v1/products/:id -> 400 si el id no es uuid', () => {
    return request(app.getHttpServer())
      .get('/api/v1/products/no-es-uuid')
      .expect(400);
  });
});
