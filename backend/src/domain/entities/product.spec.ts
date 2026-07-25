import { Money } from '../value-objects/money';
import { Product } from './product';

const buildProduct = (isActive: boolean): Product =>
  new Product({
    id: 'product-1',
    name: 'Teclado mecánico',
    description: 'Switches azules',
    price: Money.fromCents(30_000, 'COP'),
    imageUrl: 'https://example.test/keyboard.png',
    isActive,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

describe('Product', () => {
  it('está disponible solo si está activo', () => {
    expect(buildProduct(true).isAvailableForPurchase()).toBe(true);
    expect(buildProduct(false).isAvailableForPurchase()).toBe(false);
  });

  it('calcula el subtotal según la cantidad', () => {
    expect(buildProduct(true).priceFor(3).amountInCents).toBe(90_000);
  });
});
