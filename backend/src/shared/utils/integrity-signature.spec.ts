import { buildIntegritySignature } from './integrity-signature';

describe('buildIntegritySignature', () => {
  it('coincide con el hash SHA-256 esperado (vector fijo)', () => {
    const signature = buildIntegritySignature(
      'TXN-ref-1',
      75000,
      'COP',
      'test_secret',
    );
    expect(signature).toBe(
      '354348c0550202039e9e988f7583033c7b0fc85643c480e558f92e629c4125e7',
    );
  });

  it('es determinista para la misma entrada', () => {
    const a = buildIntegritySignature('ref', 1000, 'COP', 's');
    const b = buildIntegritySignature('ref', 1000, 'COP', 's');
    expect(a).toBe(b);
  });

  it('cambia si cambia cualquier parte (incluye el orden)', () => {
    const base = buildIntegritySignature('ref', 1000, 'COP', 's');
    expect(buildIntegritySignature('ref', 1001, 'COP', 's')).not.toBe(base);
    expect(buildIntegritySignature('ref', 1000, 'USD', 's')).not.toBe(base);
    expect(buildIntegritySignature('ref', 1000, 'COP', 'x')).not.toBe(base);
  });
});
