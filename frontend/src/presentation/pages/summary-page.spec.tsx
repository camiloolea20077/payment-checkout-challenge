import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '../../domain/entities/product';
import type { Transaction } from '../../domain/entities/transaction';
import { createTestStore, renderWithProviders } from '../../test-utils/render';
import { SummaryPage } from './summary-page';

const product: Product = {
  id: 'p1',
  name: 'Teclado mecánico',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

const approved: Transaction = {
  id: 'tx1',
  reference: 'R-1',
  status: 'APPROVED',
  quantity: 1,
  productAmountInCents: 30000,
  baseFeeInCents: 5000,
  deliveryFeeInCents: 10000,
  totalAmountInCents: 45000,
  currency: 'COP',
  failureReason: null,
};

const store = () =>
  createTestStore({
    product: { items: [], selected: product, status: 'succeeded', error: null },
    checkout: {
      currentStep: 3,
      productId: 'p1',
      quantity: 1,
      customer: {
        fullName: 'Ada',
        email: 'a@e.com',
        phone: '300',
        documentType: 'CC',
        documentNumber: '1',
      },
      delivery: {
        address: 'Calle 1',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
      transactionId: null,
    },
    payment: {
      card: {
        number: '4242424242424242',
        cvc: '123',
        expMonth: '08',
        expYear: '40',
        cardHolder: 'Ada',
        installments: 1,
      },
    },
    transaction: { current: null, status: 'idle', error: null },
    ui: { isProcessingPayment: false },
  });

describe('SummaryPage', () => {
  it('muestra desglose y tarjeta enmascarada', () => {
    renderWithProviders(<SummaryPage />, { store: store() });
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('•••• •••• •••• 4242')).toBeInTheDocument();
  });

  it('al pagar llama al repositorio con la Idempotency-Key', async () => {
    const checkout = jest.fn().mockResolvedValue(approved);
    renderWithProviders(<SummaryPage />, {
      store: store(),
      repository: { checkout },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Pagar ahora' }));
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(1));
    expect(typeof checkout.mock.calls[0][1]).toBe('string'); // idempotency key
  });
});
