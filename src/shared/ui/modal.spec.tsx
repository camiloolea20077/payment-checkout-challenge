import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './modal';

function renderModal(onClose = jest.fn()) {
  render(
    <Modal open onClose={onClose} title="Detalle">
      <button type="button">Primero</button>
      <button type="button">Último</button>
    </Modal>,
  );
  return onClose;
}

describe('Modal', () => {
  it('no renderiza nada cuando está cerrado', () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Detalle">
        <p>contenido</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se anuncia como diálogo modal con su título', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Detalle');
  });

  it('mueve el foco al primer elemento al abrirse', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  });

  it('atrapa el foco: Tab desde el último vuelve al primero', async () => {
    renderModal();
    screen.getByRole('button', { name: 'Último' }).focus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();
  });

  it('atrapa el foco: Shift+Tab desde el primero va al último', async () => {
    renderModal();
    screen.getByRole('button', { name: 'Cerrar' }).focus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Último' })).toHaveFocus();
  });

  it('cierra al hacer clic en el fondo', async () => {
    const onClose = renderModal();
    // El fondo es el contenedor del diálogo: se pulsa fuera del panel.
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no cierra al hacer clic dentro del diálogo', async () => {
    const onClose = renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Primero' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('bloquea el scroll de la página mientras está abierto', () => {
    const { unmount } = render(
      <Modal open onClose={jest.fn()} title="Detalle">
        <button type="button">Acción</button>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('devuelve el foco al elemento que lo abrió', () => {
    render(<button type="button">Abrir</button>);
    const opener = screen.getByRole('button', { name: 'Abrir' });
    opener.focus();

    const { unmount } = render(
      <Modal open onClose={jest.fn()} title="Detalle">
        <button type="button">Acción</button>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveFocus();

    unmount();
    expect(opener).toHaveFocus();
  });
});
