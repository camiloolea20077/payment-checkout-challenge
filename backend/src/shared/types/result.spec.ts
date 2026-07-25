import { err, isErr, isOk, ok } from './result';

describe('Result', () => {
  it('ok() construye una variante exitosa', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it('err() construye una variante fallida', () => {
    const result = err('sin stock');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('sin stock');
    }
  });

  it('isOk() distingue la variante exitosa', () => {
    expect(isOk(ok(1))).toBe(true);
    expect(isOk(err('x'))).toBe(false);
  });

  it('isErr() distingue la variante fallida', () => {
    expect(isErr(err('x'))).toBe(true);
    expect(isErr(ok(1))).toBe(false);
  });
});
