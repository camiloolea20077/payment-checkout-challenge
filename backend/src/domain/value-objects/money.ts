import { InvalidMoneyError } from '../errors/invalid-money.error';

/**
 * Value object que representa un valor monetario en centavos.
 *
 * Todo el dinero del sistema se maneja como enteros de centavos para evitar los
 * errores de redondeo de `float`/`double`. Es inmutable: las operaciones
 * devuelven nuevas instancias en lugar de mutar la actual, y no permite operar
 * entre monedas distintas.
 */
export class Money {
  private constructor(
    public readonly amountInCents: number,
    public readonly currency: string,
  ) {}

  /**
   * Crea un `Money` validando que el monto sea un entero no negativo y que la
   * moneda esté presente.
   *
   * @param amountInCents - Monto en centavos (entero, >= 0).
   * @param currency - Código de moneda (p. ej. `COP`).
   * @throws InvalidMoneyError si el monto o la moneda son inválidos.
   */
  static fromCents(amountInCents: number, currency: string): Money {
    if (!Number.isInteger(amountInCents)) {
      throw new InvalidMoneyError(
        `El monto debe ser un entero en centavos, se recibió ${amountInCents}.`,
      );
    }
    if (amountInCents < 0) {
      throw new InvalidMoneyError('El monto no puede ser negativo.');
    }
    if (currency.trim().length === 0) {
      throw new InvalidMoneyError('La moneda es obligatoria.');
    }
    return new Money(amountInCents, currency);
  }

  /**
   * Crea un `Money` con valor cero en la moneda indicada.
   */
  static zero(currency: string): Money {
    return Money.fromCents(0, currency);
  }

  /**
   * Suma dos montos de la misma moneda.
   *
   * @throws InvalidMoneyError si las monedas difieren.
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountInCents + other.amountInCents, this.currency);
  }

  /**
   * Multiplica el monto por una cantidad entera no negativa.
   *
   * Se usa para calcular el subtotal a partir del precio unitario y la cantidad.
   *
   * @throws InvalidMoneyError si el factor no es un entero no negativo.
   */
  multiply(factor: number): Money {
    if (!Number.isInteger(factor) || factor < 0) {
      throw new InvalidMoneyError(
        'El factor de multiplicación debe ser un entero no negativo.',
      );
    }
    return new Money(this.amountInCents * factor, this.currency);
  }

  /**
   * Indica si este monto es estrictamente mayor que otro de la misma moneda.
   */
  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amountInCents > other.amountInCents;
  }

  /**
   * Compara igualdad de monto y moneda.
   */
  equals(other: Money): boolean {
    return (
      this.amountInCents === other.amountInCents &&
      this.currency === other.currency
    );
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new InvalidMoneyError(
        `No se pueden operar monedas distintas: ${this.currency} y ${other.currency}.`,
      );
    }
  }
}
