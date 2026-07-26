import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * Estado de interfaz efímero (no persistible), como el backdrop de
 * procesamiento del pago que bloquea el doble envío.
 */
export interface UiState {
  isProcessingPayment: boolean;
}

const initialState: UiState = {
  isProcessingPayment: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setProcessingPayment(state, action: PayloadAction<boolean>) {
      state.isProcessingPayment = action.payload;
    },
  },
});

export const { setProcessingPayment } = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
