import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App (Punto Fuerte)', () => {
  beforeEach(() => {
    localStorage.clear();
    window.print = vi.fn();
  });

  it('muestra la marca Punto Fuerte en el header', () => {
    render(<App />);
    expect(screen.getByText('Punto Fuerte')).toBeInTheDocument();
  });

  it('abre por defecto en la pestaña Ejercicios', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Ejercicios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ejercicios/i })).toHaveAttribute('aria-current', 'page');
  });

  it('navega por las 4 pestañas inferiores (Ejercicios, Rutina, Entrenamiento, Ajustes)', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /^Rutina$/i }));
    expect(
      screen.getByPlaceholderText(/Buscar por ejercicio, músculo o rutina/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Entrenamiento$/i }));
    expect(screen.getByText(/En Vivo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Ajustes$/i }));
    expect(screen.getByRole('heading', { name: /Ajustes/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Ejercicios$/i }));
    expect(screen.getByRole('heading', { name: /Ejercicios/i })).toBeInTheDocument();
  });

  it('abre el modal de notificaciones desde el header', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    expect(screen.getByRole('heading', { name: /Notificaciones/i })).toBeInTheDocument();
  });

  it('abre el perfil desde el header', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Perfil de usuario' }));
    expect(screen.getByText('Perfil de Atleta')).toBeInTheDocument();
  });

  it('abre el modal de peso desde la acción rápida de Ajustes', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Ajustes$/i }));
    fireEvent.click(screen.getByRole('button', { name: /Peso:/i }));
    expect(screen.getByRole('heading', { name: /Registrar Peso/i })).toBeInTheDocument();
  });
});
