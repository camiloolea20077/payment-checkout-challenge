import { configureStore } from "@reduxjs/toolkit";
import { checkoutReducer } from "./slices/checkout-slice";
import { productReducer } from "./slices/product-slice";
import { transactionReducer } from "./slices/transaction-slice";
import { uiReducer } from "./slices/ui-slice";

/**
 * Store raíz de Redux Toolkit.
 *
 * Combina los slices del dominio de la aplicación. La persistencia del progreso
 * no sensible se añade en una fase posterior.
 */
export const store = configureStore({
  reducer: {
    product: productReducer,
    checkout: checkoutReducer,
    transaction: transactionReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
