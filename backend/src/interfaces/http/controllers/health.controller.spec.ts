import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  it('reporta estado "ok"', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
  });

  it('incluye un timestamp ISO válido', () => {
    const result = controller.check();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('reporta el uptime como número no negativo', () => {
    const result = controller.check();
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result.uptimeSeconds)).toBe(true);
  });
});
