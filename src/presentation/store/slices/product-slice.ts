import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../../domain/entities/product";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

/**
 * Estado del catálogo y del producto seleccionado. No es persistible: se
 * recarga desde el backend para tener siempre el stock actualizado.
 */
export interface ProductState {
  items: Product[];
  selected: Product | null;
  status: LoadStatus;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    productLoadStarted(state) {
      state.status = "loading";
      state.error = null;
    },
    productsLoaded(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
      state.status = "succeeded";
    },
    productSelected(state, action: PayloadAction<Product>) {
      state.selected = action.payload;
      state.status = "succeeded";
    },
    productLoadFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const {
  productLoadStarted,
  productsLoaded,
  productSelected,
  productLoadFailed,
} = productSlice.actions;

export const productReducer = productSlice.reducer;
