import { NetworkError } from '../../domain/errors/checkout-errors';
import { errorMessage } from './error-message';

describe('errorMessage', () => {
  it('devuelve el mensaje de un error de dominio', () => {
    expect(errorMessage(new NetworkError('sin conexión'))).toBe('sin conexión');
  });

  it('devuelve un texto genérico para otros errores', () => {
    expect(errorMessage(new Error('detalle técnico'))).toBe(
      'Ocurrió un error inesperado. Intenta de nuevo.',
    );
  });
});
