import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '../../../domain/entities/product';
import { ProductCard } from './product-card';

const product: Product = {
  id: 'p1',
  name: 'Teclado mecánico',
  description: 'desc',
  priceInCents: 30000,
  currency: 'COP',
  imageUrl: 'x',
  availableUnits: 5,
};

describe('ProductCard', () => {
  it('muestra nombre, precio y permite comprar con la cantidad elegida', async () => {
    const onBuy = jest.fn();
    render(<ProductCard product={product} onBuy={onBuy} />);

    expect(screen.getByText('Teclado mecánico')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Aumentar cantidad'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Pagar con tarjeta' }),
    );
    expect(onBuy).toHaveBeenCalledWith(product, 2);
  });

  it('deshabilita la compra si no hay stock', () => {
    const onBuy = jest.fn();
    render(
      <ProductCard product={{ ...product, availableUnits: 0 }} onBuy={onBuy} />,
    );
    expect(screen.getByRole('button', { name: 'Sin stock' })).toBeDisabled();
    expect(screen.queryByLabelText('Aumentar cantidad')).not.toBeInTheDocument();
  });
});
