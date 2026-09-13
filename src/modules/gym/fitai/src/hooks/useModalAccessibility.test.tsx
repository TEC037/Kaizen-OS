import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useModalAccessibility } from './useModalAccessibility';

function ModalFixture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dialogRef, handleBackdropClick } = useModalAccessibility(open, onClose);
  return (
    <div data-testid="dialog" ref={dialogRef} onClick={handleBackdropClick}>
      <button>Primero</button>
      <button>Último</button>
      <button disabled>Deshabilitado</button>
    </div>
  );
}

describe('useModalAccessibility', () => {
  it('mueve el foco al primer elemento enfocable al abrirse', () => {
    const onClose = vi.fn();
    render(<ModalFixture open onClose={onClose} />);

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primero' }));
  });

  it('envuelve el foco al primer elemento con Tab desde el último', () => {
    render(<ModalFixture open onClose={vi.fn()} />);

    fireEvent.focus(screen.getByRole('button', { name: 'Último' }));
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Primero' }));
  });

  it('envuelve el foco al último elemento con Shift+Tab desde el primero', () => {
    render(<ModalFixture open onClose={vi.fn()} />);

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Último' }));
  });

  it('cierra con Escape', () => {
    const onClose = vi.fn();
    render(<ModalFixture open onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('restaura el foco al elemento que lo tenía al cerrar', () => {
    const onClose = vi.fn();
    const { getByRole, rerender } = render(
      <>
        <button data-testid="origin">Origen</button>
        <ModalFixture open={false} onClose={onClose} />
      </>
    );

    act(() => getByRole('button', { name: 'Origen' }).focus());

    rerender(
      <>
        <button data-testid="origin">Origen</button>
        <ModalFixture open onClose={onClose} />
      </>
    );

    expect(document.activeElement).toBe(getByRole('button', { name: 'Primero' }));

    rerender(
      <>
        <button data-testid="origin">Origen</button>
        <ModalFixture open={false} onClose={onClose} />
      </>
    );

    expect(document.activeElement).toBe(getByRole('button', { name: 'Origen' }));
  });

  it('llama onClose solo al hacer clic en el fondo (backdrop)', () => {
    const onClose = vi.fn();
    render(<ModalFixture open onClose={onClose} />);

    fireEvent.click(screen.getByTestId('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Primero' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
