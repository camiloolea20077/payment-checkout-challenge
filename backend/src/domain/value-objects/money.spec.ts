import { InvalidMoneyError } from '../errors/invalid-money.error';
import { Money } from './money';

describe('Money', () => {
  describe('fromCents', () => {
    it('crea un monto válido', () => {
      const money = Money.fromCents(5000, 'COP');
      expect(money.amountInCents).toBe(5000);
      expect(money.currency).toBe('COP');
    });

    it('rechaza montos no enteros', () => {
      expect(() => Money.fromCents(10.5, 'COP')).toThrow(InvalidMoneyError);
    });

    it('rechaza montos negativos', () => {
      expect(() => Money.fromCents(-1, 'COP')).toThrow(InvalidMoneyError);
    });

    it('rechaza moneda vacía', () => {
      expect(() => Money.fromCents(100, '   ')).toThrow(InvalidMoneyError);
    });
  });

  describe('operaciones', () => {
    it('suma montos de la misma moneda', () => {
      const total = Money.fromCents(5000, 'COP').add(
        Money.fromCents(2500, 'COP'),
      );
      expect(total.amountInCents).toBe(7500);
    });

    it('no permite sumar monedas distintas', () => {
      expect(() =>
        Money.fromCents(5000, 'COP').add(Money.fromCents(2500, 'USD')),
      ).toThrow(InvalidMoneyError);
    });

    it('multiplica por una cantidad entera', () => {
      const subtotal = Money.fromCents(3000, 'COP').multiply(3);
      expect(subtotal.amountInCents).toBe(9000);
    });

    it('rechaza factores no enteros o negativos', () => {
      expect(() => Money.fromCents(3000, 'COP').multiply(1.5)).toThrow(
        InvalidMoneyError,
      );
      expect(() => Money.fromCents(3000, 'COP').multiply(-2)).toThrow(
        InvalidMoneyError,
      );
    });

    it('compara si es mayor', () => {
      expect(
        Money.fromCents(5000, 'COP').isGreaterThan(
          Money.fromCents(2500, 'COP'),
        ),
      ).toBe(true);
    });

    it('evalúa igualdad por monto y moneda', () => {
      expect(
        Money.fromCents(5000, 'COP').equals(Money.fromCents(5000, 'COP')),
      ).toBe(true);
      expect(
        Money.fromCents(5000, 'COP').equals(Money.fromCents(5000, 'USD')),
      ).toBe(false);
    });
  });
});
