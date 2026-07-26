import type { CheckoutState } from './slices/checkout-slice';
import { loadCheckoutState, saveCheckoutState } from './persistence';

const state: CheckoutState = {
  currentStep: 2,
  productId: 'product-1',
  quantity: 3,
  customer: {
    fullName: 'Ada',
    email: 'ada@example.com',
    phone: '3001112233',
    documentType: 'CC',
    documentNumber: '123',
  },
  delivery: {
    address: 'Calle 1',
    city: 'Bogotá',
    department: 'Cundinamarca',
    postalCode: '110111',
  },
  transactionId: null,
};

describe('persistence del checkout', () => {
  beforeEach(() => localStorage.clear());

  it('guarda y recupera el progreso no sensible', () => {
    saveCheckoutState(state);
    expect(loadCheckoutState()).toEqual(state);
  });

  it('devuelve undefined si no hay nada guardado', () => {
    expect(loadCheckoutState()).toBeUndefined();
  });

  it('devuelve undefined si el contenido está corrupto', () => {
    localStorage.setItem('checkout-progress', '{no-json');
    expect(loadCheckoutState()).toBeUndefined();
  });
});
