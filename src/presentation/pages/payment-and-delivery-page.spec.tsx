import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '../../domain/entities/product';
import { createTestStore, renderWithProviders } from '../../test-utils/render';
import { PaymentAndDeliveryPage } from './payment-and-delivery-page';

const product: Product = {
  id: 'p1',
  name: 'Teclado mecánico',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

const store = () =>
  createTestStore({
    product: { items: [], selected: product, status: 'succeeded', error: null },
    checkout: {
      currentStep: 2,
      productId: 'p1',
      quantity: 1,
      customer: null,
      delivery: null,
      transactionId: null,
    },
    payment: { card: null },
    transaction: { current: null, status: 'idle', error: null },
    ui: { isProcessingPayment: false },
  });

describe('PaymentAndDeliveryPage', () => {
  it('muestra el pedido y los formularios de tarjeta y entrega', () => {
    renderWithProviders(<PaymentAndDeliveryPage />, { store: store() });
    expect(screen.getByText('Tu pedido')).toBeInTheDocument();
    expect(screen.getByText('Teclado mecánico')).toBeInTheDocument();
    expect(screen.getByLabelText('Número de tarjeta')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
  });

  it('detecta la marca de la tarjeta al escribir el número', async () => {
    renderWithProviders(<PaymentAndDeliveryPage />, { store: store() });
    await userEvent.type(
      screen.getByLabelText('Número de tarjeta'),
      '4242424242424242',
    );
    expect(screen.getByText('Visa')).toBeInTheDocument();
  });
});
