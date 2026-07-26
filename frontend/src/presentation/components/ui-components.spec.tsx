import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from '../../shared/ui/badge';
import { Button } from '../../shared/ui/button';
import { Price } from '../../shared/ui/price';
import { AmountBreakdown } from './checkout/amount-breakdown';
import { OrderItem } from './checkout/order-item';
import { QuantitySelector } from './product/quantity-selector';
import { StockBadge } from './product/stock-badge';

describe('Button', () => {
  it('llama onClick y se deshabilita al cargar', async () => {
    const onClick = jest.fn();
    const { rerender } = render(<Button onClick={onClick}>Pagar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Pagar' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} isLoading>
        Pagar
      </Button>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Badge y Price', () => {
  it('Badge muestra su contenido', () => {
    render(<Badge tone="success">Disponible</Badge>);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('Price formatea el monto', () => {
    render(<Price amountInCents={3015000} currency="COP" />);
    expect(screen.getByText(/30\.150/)).toBeInTheDocument();
  });
});

describe('StockBadge', () => {
  it('muestra agotado, pocas unidades o disponibles', () => {
    const { rerender } = render(<StockBadge availableUnits={0} />);
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    rerender(<StockBadge availableUnits={3} />);
    expect(screen.getByText(/Últimas 3/)).toBeInTheDocument();
    rerender(<StockBadge availableUnits={20} />);
    expect(screen.getByText(/20 disponibles/)).toBeInTheDocument();
  });
});

describe('QuantitySelector', () => {
  it('respeta los límites y notifica cambios', async () => {
    const onChange = jest.fn();
    render(<QuantitySelector quantity={2} max={3} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Aumentar cantidad'));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByLabelText('Disminuir cantidad'));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('bloquea el botón + en el máximo', () => {
    render(<QuantitySelector quantity={3} max={3} onChange={jest.fn()} />);
    expect(screen.getByLabelText('Aumentar cantidad')).toBeDisabled();
  });
});

describe('OrderItem y AmountBreakdown', () => {
  it('OrderItem muestra nombre y cantidad', () => {
    render(
      <OrderItem
        name="Teclado"
        imageUrl="x"
        quantity={2}
        priceInCents={30000}
        currency="COP"
      />,
    );
    expect(screen.getByText('Teclado')).toBeInTheDocument();
    expect(screen.getByText(/Cantidad: 2/)).toBeInTheDocument();
  });

  it('AmountBreakdown muestra el total', () => {
    render(
      <AmountBreakdown
        itemLabel="Subtotal"
        productAmountInCents={60000}
        baseFeeInCents={5000}
        deliveryFeeInCents={10000}
        totalAmountInCents={75000}
        currency="COP"
      />,
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText(/750/)).toBeInTheDocument();
  });
});
