import { InsufficientStockError } from '../errors/insufficient-stock.error';
import { InvalidQuantityError } from '../errors/invalid-quantity.error';
import { Stock } from './stock';

const buildStock = (availableUnits: number): Stock =>
  new Stock({
    id: 'stock-1',
    productId: 'product-1',
    availableUnits,
    reservedUnits: 0,
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

describe('Stock', () => {
  describe('canFulfill', () => {
    it('es verdadero cuando hay unidades suficientes', () => {
      expect(buildStock(10).canFulfill(10)).toBe(true);
    });

    it('es falso cuando no hay unidades suficientes', () => {
      expect(buildStock(3).canFulfill(4)).toBe(false);
    });
  });

  describe('decrease', () => {
    it('descuenta unidades e incrementa la versión', () => {
      const updated = buildStock(10).decrease(4);
      expect(updated.availableUnits).toBe(6);
      expect(updated.version).toBe(2);
    });

    it('no muta el stock original (inmutabilidad)', () => {
      const original = buildStock(10);
      original.decrease(4);
      expect(original.availableUnits).toBe(10);
      expect(original.version).toBe(1);
    });

    it('lanza error si no hay stock suficiente', () => {
      expect(() => buildStock(3).decrease(4)).toThrow(InsufficientStockError);
    });

    it('nunca deja el stock negativo', () => {
      expect(() => buildStock(0).decrease(1)).toThrow(InsufficientStockError);
    });

    it('rechaza cantidades inválidas', () => {
      expect(() => buildStock(10).decrease(0)).toThrow(InvalidQuantityError);
      expect(() => buildStock(10).decrease(1.5)).toThrow(InvalidQuantityError);
    });
  });

  describe('increase', () => {
    it('suma unidades e incrementa la versión', () => {
      const updated = buildStock(5).increase(3);
      expect(updated.availableUnits).toBe(8);
      expect(updated.version).toBe(2);
    });
  });
});
