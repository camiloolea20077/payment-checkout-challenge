import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formatea centavos a moneda COP', () => {
    const result = formatMoney(3015000, 'COP');
    // Contiene el símbolo/monto sin decimales forzados.
    expect(result).toContain('30.150');
  });

  it('maneja el cero', () => {
    expect(formatMoney(0, 'COP')).toContain('0');
  });
});
