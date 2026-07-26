import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '../../domain/entities/product';
import { renderWithProviders } from '../../test-utils/render';
import { ProductPage } from './product-page';

const product: Product = {
  id: 'p1',
  name: 'Teclado mecánico',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

describe('ProductPage', () => {
  it('renderiza el catálogo cuando carga', async () => {
    renderWithProviders(<ProductPage />, {
      repository: { getProducts: jest.fn().mockResolvedValue([product]) },
    });
    expect(await screen.findByText('Teclado mecánico')).toBeInTheDocument();
  });

  it('muestra el estado vacío', async () => {
    renderWithProviders(<ProductPage />, {
      repository: { getProducts: jest.fn().mockResolvedValue([]) },
    });
    expect(
      await screen.findByText('No hay productos disponibles'),
    ).toBeInTheDocument();
  });

  it('muestra error y permite reintentar', async () => {
    const getProducts = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce([product]);

    renderWithProviders(<ProductPage />, { repository: { getProducts } });

    const retry = await screen.findByRole('button', { name: 'Reintentar' });
    await userEvent.click(retry);

    await waitFor(() =>
      expect(screen.getByText('Teclado mecánico')).toBeInTheDocument(),
    );
    expect(getProducts).toHaveBeenCalledTimes(2);
  });
});
