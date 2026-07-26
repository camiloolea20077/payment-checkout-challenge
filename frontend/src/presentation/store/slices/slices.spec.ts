import {
  checkoutReducer,
  resetCheckout,
  setCustomer,
  setDelivery,
  setProductSelection,
  setStep,
  setTransactionId,
} from './checkout-slice';
import { clearCard, paymentReducer, setCard } from './payment-slice';
import {
  productLoadFailed,
  productLoadStarted,
  productReducer,
  productSelected,
  productsLoaded,
} from './product-slice';
import {
  clearTransaction,
  transactionFailed,
  transactionReducer,
  transactionResolved,
  transactionStarted,
} from './transaction-slice';
import { setProcessingPayment, uiReducer } from './ui-slice';

const product = {
  id: 'p1',
  name: 'Teclado',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

const customer = {
  fullName: 'Ada',
  email: 'a@e.com',
  phone: '300',
  documentType: 'CC',
  documentNumber: '1',
};

describe('checkoutReducer', () => {
  it('guarda selección, cliente, entrega, id y paso; y resetea', () => {
    let s = checkoutReducer(undefined, {
      type: '@@init',
    });
    s = checkoutReducer(s, setProductSelection({ productId: 'p1', quantity: 2 }));
    s = checkoutReducer(s, setCustomer(customer));
    s = checkoutReducer(
      s,
      setDelivery({ address: 'a', city: 'b', department: 'c' }),
    );
    s = checkoutReducer(s, setTransactionId('tx1'));
    s = checkoutReducer(s, setStep(3));
    expect(s).toMatchObject({
      productId: 'p1',
      quantity: 2,
      transactionId: 'tx1',
      currentStep: 3,
    });
    expect(checkoutReducer(s, resetCheckout()).productId).toBeNull();
  });
});

describe('productReducer', () => {
  it('maneja el ciclo de carga', () => {
    let s = productReducer(undefined, productLoadStarted());
    expect(s.status).toBe('loading');
    s = productReducer(s, productsLoaded([product]));
    expect(s.items).toHaveLength(1);
    s = productReducer(s, productSelected(product));
    expect(s.selected?.id).toBe('p1');
    s = productReducer(s, productLoadFailed('boom'));
    expect(s.status).toBe('failed');
    expect(s.error).toBe('boom');
  });
});

describe('transactionReducer', () => {
  it('maneja inicio, resolución, error y limpieza', () => {
    const tx = {
      id: 'tx1',
      reference: 'R',
      status: 'APPROVED' as const,
      quantity: 1,
      productAmountInCents: 1,
      baseFeeInCents: 1,
      deliveryFeeInCents: 1,
      totalAmountInCents: 3,
      currency: 'COP',
      failureReason: null,
    };
    let s = transactionReducer(undefined, transactionStarted());
    expect(s.status).toBe('loading');
    s = transactionReducer(s, transactionResolved(tx));
    expect(s.current?.id).toBe('tx1');
    s = transactionReducer(s, transactionFailed('e'));
    expect(s.error).toBe('e');
    expect(transactionReducer(s, clearTransaction()).current).toBeNull();
  });
});

describe('paymentReducer', () => {
  it('guarda y limpia la tarjeta', () => {
    const card = {
      number: '4242',
      cvc: '123',
      expMonth: '08',
      expYear: '40',
      cardHolder: 'Ada',
      installments: 1,
    };
    const s = paymentReducer(undefined, setCard(card));
    expect(s.card?.number).toBe('4242');
    expect(paymentReducer(s, clearCard()).card).toBeNull();
  });
});

describe('uiReducer', () => {
  it('alterna el estado de procesamiento', () => {
    const s = uiReducer(undefined, setProcessingPayment(true));
    expect(s.isProcessingPayment).toBe(true);
  });
});
