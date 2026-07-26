import {
  detectCardBrand,
  formatCardNumber,
  isValidExpiry,
  luhnCheck,
  maskCardNumber,
  onlyDigits,
} from './card';

describe('card utils', () => {
  it('onlyDigits elimina no dígitos', () => {
    expect(onlyDigits('4242 4242-abc')).toBe('42424242');
  });

  it('detectCardBrand reconoce Visa y Mastercard', () => {
    expect(detectCardBrand('4242424242424242')).toBe('visa');
    expect(detectCardBrand('5254133674403564')).toBe('mastercard');
    expect(detectCardBrand('6011000000000000')).toBe('unknown');
  });

  it('luhnCheck valida el número', () => {
    expect(luhnCheck('4242 4242 4242 4242')).toBe(true);
    expect(luhnCheck('4242424242424241')).toBe(false);
    expect(luhnCheck('123')).toBe(false);
  });

  it('formatCardNumber agrupa de a 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('isValidExpiry acepta futuro y rechaza pasado/ inválido', () => {
    expect(isValidExpiry('08', '40')).toBe(true);
    expect(isValidExpiry('13', '40')).toBe(false);
    expect(isValidExpiry('01', '20')).toBe(false);
  });

  it('maskCardNumber deja solo los últimos 4', () => {
    expect(maskCardNumber('4242424242424242')).toBe('•••• •••• •••• 4242');
  });
});
