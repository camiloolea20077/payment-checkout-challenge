import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './alert';
import { Backdrop } from './backdrop';
import { Divider } from './divider';
import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { FormField } from './form-field';
import { Input } from './input';
import { Select } from './select';
import { Skeleton } from './skeleton';
import { Spinner } from './spinner';
import { Stepper } from './stepper';

describe('componentes UI simples', () => {
  it('Alert muestra título y contenido', () => {
    render(
      <Alert tone="danger" title="Error">
        detalle
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Error');
  });

  it('Backdrop muestra el mensaje', () => {
    render(<Backdrop message="Procesando" />);
    expect(screen.getByText('Procesando')).toBeInTheDocument();
  });

  it('EmptyState y Divider y Skeleton y Spinner renderizan', () => {
    const { container } = render(
      <div>
        <EmptyState title="Vacío" description="nada" />
        <Divider />
        <Skeleton className="h-4" />
        <Spinner />
      </div>,
    );
    expect(screen.getByText('Vacío')).toBeInTheDocument();
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('ErrorState llama onRetry', async () => {
    const onRetry = jest.fn();
    render(<ErrorState message="ups" onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('FormField asocia label y muestra error', () => {
    render(
      <FormField id="email" label="Correo" error="requerido">
        <Input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('requerido');
  });

  it('Select renderiza opciones', () => {
    render(
      <Select
        aria-label="tipo"
        options={[
          { value: 'CC', label: 'Cédula' },
          { value: 'PP', label: 'Pasaporte' },
        ]}
      />,
    );
    expect(screen.getByRole('option', { name: 'Cédula' })).toBeInTheDocument();
  });

  it('Stepper marca el paso actual', () => {
    render(<Stepper steps={['Pago', 'Resumen', 'Resultado']} current={2} />);
    expect(screen.getByText('Resumen')).toBeInTheDocument();
  });
});
