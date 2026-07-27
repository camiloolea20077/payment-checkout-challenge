import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '../../../domain/entities/product';
import { renderWithProviders } from '../../../test-utils/render';
import { ProductDetailModal } from './product-detail-modal';

const product: Product = {
  id: 'p1',
  name: 'Teclado mecánico',
  description: 'Switches azules y retroiluminación',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'https://example.com/teclado.png',
  availableUnits: 5,
};

describe('ProductDetailModal', () => {
  it('no consulta el producto si está cerrado', () => {
    const getProduct = jest.fn();
    renderWithProviders(
      <ProductDetailModal
        productId={null}
        onClose={jest.fn()}
        onBuy={jest.fn()}
      />,
      { repository: { getProduct } },
    );
    expect(getProduct).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra imagen, descripción, precio y stock del producto', async () => {
    const getProduct = jest.fn().mockResolvedValue(product);
    renderWithProviders(
      <ProductDetailModal
        productId="p1"
        onClose={jest.fn()}
        onBuy={jest.fn()}
      />,
      { repository: { getProduct } },
    );

    expect(
      await screen.findByText('Switches azules y retroiluminación'),
    ).toBeInTheDocument();
    expect(getProduct).toHaveBeenCalledWith('p1');
    expect(screen.getByRole('img', { name: 'Teclado mecánico' })).toHaveAttribute(
      'src',
      'https://example.com/teclado.png',
    );
    expect(screen.getByText('$ 300')).toBeInTheDocument();
  });

  it('compra con la cantidad elegida en el diálogo', async () => {
    const getProduct = jest.fn().mockResolvedValue(product);
    const onBuy = jest.fn();
    renderWithProviders(
      <ProductDetailModal productId="p1" onClose={jest.fn()} onBuy={onBuy} />,
      { repository: { getProduct } },
    );

    await screen.findByText('Switches azules y retroiluminación');
    await userEvent.click(screen.getByLabelText('Aumentar cantidad'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Pagar con tarjeta' }),
    );
    expect(onBuy).toHaveBeenCalledWith(product, 2);
  });

  it('cierra con Escape y con el botón de cerrar', async () => {
    const getProduct = jest.fn().mockResolvedValue(product);
    const onClose = jest.fn();
    renderWithProviders(
      <ProductDetailModal productId="p1" onClose={onClose} onBuy={jest.fn()} />,
      { repository: { getProduct } },
    );

    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('deshabilita la compra si el producto quedó sin stock', async () => {
    const getProduct = jest.fn().mockResolvedValue({
      ...product,
      availableUnits: 0,
    });
    renderWithProviders(
      <ProductDetailModal
        productId="p1"
        onClose={jest.fn()}
        onBuy={jest.fn()}
      />,
      { repository: { getProduct } },
    );

    expect(
      await screen.findByRole('button', { name: 'Sin stock' }),
    ).toBeDisabled();
    expect(screen.queryByLabelText('Aumentar cantidad')).not.toBeInTheDocument();
  });

  it('muestra error y permite reintentar', async () => {
    const getProduct = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(product);

    renderWithProviders(
      <ProductDetailModal
        productId="p1"
        onClose={jest.fn()}
        onBuy={jest.fn()}
      />,
      { repository: { getProduct } },
    );

    await userEvent.click(
      await screen.findByRole('button', { name: 'Reintentar' }),
    );

    await waitFor(() =>
      expect(
        screen.getByText('Switches azules y retroiluminación'),
      ).toBeInTheDocument(),
    );
    expect(getProduct).toHaveBeenCalledTimes(2);
  });
});
