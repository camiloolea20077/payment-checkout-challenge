import { checkoutFormSchema } from './checkout-form-schema';

const validValues = {
  cardHolder: 'Ada Lovelace',
  number: '4242 4242 4242 4242',
  expMonth: '08',
  expYear: '40',
  cvc: '123',
  installments: 1,
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '3001112233',
  documentType: 'CC' as const,
  documentNumber: '1020304050',
  address: 'Calle 123',
  city: 'Bogotá',
  department: 'Cundinamarca',
  postalCode: '110111',
};

describe('checkoutFormSchema', () => {
  it('acepta datos válidos', () => {
    expect(checkoutFormSchema.safeParse(validValues).success).toBe(true);
  });

  it('rechaza un número que no pasa Luhn', () => {
    const result = checkoutFormSchema.safeParse({
      ...validValues,
      number: '4242 4242 4242 4241',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza tarjeta vencida', () => {
    const result = checkoutFormSchema.safeParse({
      ...validValues,
      expYear: '20',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza CVV inválido', () => {
    const result = checkoutFormSchema.safeParse({ ...validValues, cvc: '12' });
    expect(result.success).toBe(false);
  });

  it('rechaza correo inválido', () => {
    const result = checkoutFormSchema.safeParse({
      ...validValues,
      email: 'no-es-correo',
    });
    expect(result.success).toBe(false);
  });

  // El backend exige `postalCode` no vacío: si el formulario lo dejara pasar,
  // el checkout fallaría con un 400 en lugar de avisar en pantalla.
  it('rechaza código postal vacío', () => {
    const result = checkoutFormSchema.safeParse({
      ...validValues,
      postalCode: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza código postal ausente', () => {
    const { postalCode: _omitted, ...withoutPostalCode } = validValues;
    expect(checkoutFormSchema.safeParse(withoutPostalCode).success).toBe(false);
  });
});
