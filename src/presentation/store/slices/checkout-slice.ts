import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CustomerInput,
  DeliveryInput,
} from "../../../application/dto/checkout-input";

/**
 * Estado del flujo de checkout. Solo contiene datos **no sensibles** y
 * persistibles (nunca tarjeta ni CVV), para poder recuperar el progreso tras
 * recargar la página.
 */
export interface CheckoutState {
  currentStep: number;
  productId: string | null;
  quantity: number;
  customer: CustomerInput | null;
  delivery: DeliveryInput | null;
  transactionId: string | null;
}

const initialState: CheckoutState = {
  currentStep: 1,
  productId: null,
  quantity: 1,
  customer: null,
  delivery: null,
  transactionId: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setProductSelection(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      state.productId = action.payload.productId;
      state.quantity = action.payload.quantity;
    },
    setCustomer(state, action: PayloadAction<CustomerInput>) {
      state.customer = action.payload;
    },
    setDelivery(state, action: PayloadAction<DeliveryInput>) {
      state.delivery = action.payload;
    },
    setTransactionId(state, action: PayloadAction<string>) {
      state.transactionId = action.payload;
    },
    setStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    resetCheckout() {
      return initialState;
    },
  },
});

export const {
  setProductSelection,
  setCustomer,
  setDelivery,
  setTransactionId,
  setStep,
  resetCheckout,
} = checkoutSlice.actions;

export const checkoutReducer = checkoutSlice.reducer;
