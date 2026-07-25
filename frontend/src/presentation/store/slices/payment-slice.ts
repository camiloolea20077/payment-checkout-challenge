import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CardInput } from "../../../application/dto/checkout-input";

/**
 * Estado transitorio de la tarjeta.
 *
 * ⚠️ NUNCA se persiste (no entra en localStorage ni en el estado guardado):
 * vive solo en memoria y se pierde al recargar, por diseño.
 */
export interface PaymentState {
  card: CardInput | null;
}

const initialState: PaymentState = {
  card: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setCard(state, action: PayloadAction<CardInput>) {
      state.card = action.payload;
    },
    clearCard() {
      return initialState;
    },
  },
});

export const { setCard, clearCard } = paymentSlice.actions;

export const paymentReducer = paymentSlice.reducer;
