import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Transaction } from "../../../domain/entities/transaction";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

/**
 * Estado de la transacción actual (resultado del pago).
 */
export interface TransactionState {
  current: Transaction | null;
  status: LoadStatus;
  error: string | null;
}

const initialState: TransactionState = {
  current: null,
  status: "idle",
  error: null,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    transactionStarted(state) {
      state.status = "loading";
      state.error = null;
    },
    transactionResolved(state, action: PayloadAction<Transaction>) {
      state.current = action.payload;
      state.status = "succeeded";
    },
    transactionFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
    clearTransaction() {
      return initialState;
    },
  },
});

export const {
  transactionStarted,
  transactionResolved,
  transactionFailed,
  clearTransaction,
} = transactionSlice.actions;

export const transactionReducer = transactionSlice.reducer;
