import { UuidGenerator } from './uuid-generator';

describe('UuidGenerator', () => {
  const generator = new UuidGenerator();

  it('genera un UUID v4 válido', () => {
    const id = generator.generate();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('genera identificadores distintos', () => {
    expect(generator.generate()).not.toBe(generator.generate());
  });
});
