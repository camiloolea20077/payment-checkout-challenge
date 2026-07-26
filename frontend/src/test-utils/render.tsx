import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { CheckoutRepositoryPort } from '../domain/ports/checkout-repository.port';
import { RepositoryContext } from '../presentation/providers/repository-context';
import { checkoutReducer } from '../presentation/store/slices/checkout-slice';
import { paymentReducer } from '../presentation/store/slices/payment-slice';
import { productReducer } from '../presentation/store/slices/product-slice';
import { transactionReducer } from '../presentation/store/slices/transaction-slice';
import { uiReducer } from '../presentation/store/slices/ui-slice';

const reducer = {
  product: productReducer,
  checkout: checkoutReducer,
  payment: paymentReducer,
  transaction: transactionReducer,
  ui: uiReducer,
};

type PreloadedState = Parameters<
  typeof configureStore<{
    product: ReturnType<typeof productReducer>;
    checkout: ReturnType<typeof checkoutReducer>;
    payment: ReturnType<typeof paymentReducer>;
    transaction: ReturnType<typeof transactionReducer>;
    ui: ReturnType<typeof uiReducer>;
  }>
>[0]['preloadedState'];

/** Crea un store de Redux aislado para cada prueba. */
export function createTestStore(preloadedState?: PreloadedState) {
  return configureStore({ reducer, preloadedState });
}

interface RenderOptions {
  repository?: Partial<CheckoutRepositoryPort>;
  store?: ReturnType<typeof createTestStore>;
  route?: string;
}

/**
 * Renderiza un componente con los providers de la app (Redux, repositorio y
 * router en memoria), inyectando un repositorio doble para las pruebas.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    repository = {},
    store = createTestStore(),
    route = '/',
  }: RenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <RepositoryContext.Provider
          value={repository as CheckoutRepositoryPort}
        >
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </RepositoryContext.Provider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
