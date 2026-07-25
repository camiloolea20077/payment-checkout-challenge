import { configureStore } from '@reduxjs/toolkit';
import { loadCheckoutState, saveCheckoutState } from './persistence';
import { checkoutReducer } from './slices/checkout-slice';
import { paymentReducer } from './slices/payment-slice';
import { productReducer } from './slices/product-slice';
import { transactionReducer } from './slices/transaction-slice';
import { uiReducer } from './slices/ui-slice';

/**
 * Store raíz de Redux Toolkit.
 *
 * Precarga el progreso no sensible del checkout desde `localStorage` y se
 * suscribe para guardarlo en cada cambio. El slice `payment` (tarjeta) queda
 * deliberadamente fuera de la persistencia.
 */
const persistedCheckout = loadCheckoutState();

export const store = configureStore({
  reducer: {
    product: productReducer,
    checkout: checkoutReducer,
    payment: paymentReducer,
    transaction: transactionReducer,
    ui: uiReducer,
  },
  preloadedState: persistedCheckout
    ? { checkout: persistedCheckout }
    : undefined,
});

store.subscribe(() => {
  saveCheckoutState(store.getState().checkout);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
