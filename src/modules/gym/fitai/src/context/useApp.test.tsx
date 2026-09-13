import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from './AppContext';
import { useApp } from './useApp';

describe('useApp', () => {
  it('lanza un error cuando se usa fuera del AppProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useApp())).toThrow('useApp must be used within an AppProvider');
    spy.mockRestore();
  });

  it('expone el estado inicial y las acciones del contexto', () => {
    const { result } = renderHook(() => useApp(), { wrapper: AppProvider });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentScreen).toBe('landing');
    expect(typeof result.current.navigateTo).toBe('function');
    expect(typeof result.current.loginDemoUser).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.updateUserProfile).toBe('function');
    expect(typeof result.current.startWorkout).toBe('function');
    expect(typeof result.current.sendCoachMessage).toBe('function');
  });

  it('desloguea al usuario y permite el re-logueo del demo', async () => {
    const { result } = renderHook(() => useApp(), { wrapper: AppProvider });

    await act(async () => result.current.loginDemoUser());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();

    await act(async () => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
