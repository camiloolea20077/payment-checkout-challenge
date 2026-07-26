import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import type { Product } from '../../domain/entities/product';
import type { Transaction } from '../../domain/entities/transaction';
import { createTestStore, renderWithProviders } from '../../test-utils/render';
import { ResultPage } from './result-page';

const product: Product = {
  id: 'p1',
  name: 'Teclado mecánico',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

const tx = (status: Transaction['status']): Transaction => ({
  id: 'tx1',
  reference: 'R-123',
  status,
  quantity: 1,
  productAmountInCents: 30000,
  baseFeeInCents: 5000,
  deliveryFeeInCents: 10000,
  totalAmountInCents: 45000,
  currency: 'COP',
  failureReason: status === 'DECLINED' ? 'Fondos insuficientes' : null,
});

const store = () =>
  createTestStore({
    product: { items: [], selected: product, status: 'succeeded', error: null },
    checkout: {
      currentStep: 4,
      productId: 'p1',
      quantity: 1,
      customer: null,
      delivery: {
        address: 'Calle 1',
        city: 'Bogotá',
        department: 'Cundinamarca',
        postalCode: '110111',
      },
      transactionId: 'tx1',
    },
    payment: { card: null },
    transaction: { current: null, status: 'idle', error: null },
    ui: { isProcessingPayment: false },
  });

const renderResult = (repository: { getTransaction: jest.Mock }) =>
  renderWithProviders(
    <Routes>
      <Route path="/checkout/result/:transactionId" element={<ResultPage />} />
    </Routes>,
    { store: store(), repository, route: '/checkout/result/tx1' },
  );

describe('ResultPage', () => {
  it('muestra pago aprobado con referencia, total y detalle', async () => {
    renderResult({ getTransaction: jest.fn().mockResolvedValue(tx('APPROVED')) });
    expect(await screen.findByText('¡Pago aprobado!')).toBeInTheDocument();
    expect(screen.getByText('R-123')).toBeInTheDocument();
    expect(screen.getByText(/450/)).toBeInTheDocument();
    expect(screen.getByText('Teclado mecánico')).toBeInTheDocument();
  });

  it('muestra pago rechazado con la causa', async () => {
    renderResult({ getTransaction: jest.fn().mockResolvedValue(tx('DECLINED')) });
    expect(await screen.findByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByText('Fondos insuficientes')).toBeInTheDocument();
  });
});
