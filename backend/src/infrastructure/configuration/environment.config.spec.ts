import { validateEnvironment } from './environment.config';

const validEnv = {
  NODE_ENV: 'development',
  PORT: '3000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db?schema=public',
  FRONTEND_URL: 'http://localhost:5173',
  PAYMENT_API_URL: 'https://api-sandbox.example/v1',
  PAYMENT_PUBLIC_KEY: 'pub_test',
  PAYMENT_PRIVATE_KEY: 'prv_test',
  PAYMENT_INTEGRITY_SECRET: 'integrity_test',
  PAYMENT_EVENTS_SECRET: 'events_test',
  BASE_FEE_IN_CENTS: '5000',
  DEFAULT_DELIVERY_FEE_IN_CENTS: '10000',
  CURRENCY: 'COP',
};

describe('validateEnvironment', () => {
  it('acepta una configuración válida y convierte los numéricos', () => {
    const config = validateEnvironment(validEnv);
    expect(config.PORT).toBe(3000);
    expect(config.BASE_FEE_IN_CENTS).toBe(5000);
    expect(typeof config.PORT).toBe('number');
  });

  it('lanza error si falta una variable requerida', () => {
    const incomplete: Partial<typeof validEnv> = { ...validEnv };
    delete incomplete.DATABASE_URL;
    expect(() => validateEnvironment(incomplete)).toThrow(
      /Variables de entorno inválidas/,
    );
  });

  it('lanza error si un fee es negativo', () => {
    expect(() =>
      validateEnvironment({ ...validEnv, BASE_FEE_IN_CENTS: '-1' }),
    ).toThrow(/Variables de entorno inválidas/);
  });
});
