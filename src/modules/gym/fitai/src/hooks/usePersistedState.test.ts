import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { usePersistedState } from './usePersistedState';

const KEY = 'fitai_test_key';

describe('usePersistedState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('parte del valor por defecto cuando no hay nada guardado', () => {
    const { result } = renderHook(() => usePersistedState<number>(KEY, 42));
    expect(result.current[0]).toBe(42);
  });

  it('escribe en localStorage cuando el valor cambia', async () => {
    const { result } = renderHook(() => usePersistedState<number>(KEY, 0));
    act(() => {
      result.current[1](10);
    });
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(KEY) as string)).toBe(10);
    });
  });

  it('restaura el valor guardado al montar', () => {
    localStorage.setItem(KEY, JSON.stringify(7));
    const { result } = renderHook(() => usePersistedState<number>(KEY, 0));
    expect(result.current[0]).toBe(7);
  });

  it('cae al valor por defecto si el JSON guardado está corrupto', () => {
    localStorage.setItem(KEY, '{{no es json}}');
    const { result } = renderHook(() => usePersistedState<number>(KEY, 99));
    expect(result.current[0]).toBe(99);
  });

  it('vale para valores lazy (función de inicialización)', () => {
    localStorage.setItem(KEY, JSON.stringify(5));
    const { result } = renderHook(() => usePersistedState<number>(KEY, () => 500));
    expect(result.current[0]).toBe(5);
  });

  it('resuelve el default lazy cuando no hay valor guardado', () => {
    const { result } = renderHook(() => usePersistedState<number>(KEY, () => 500));
    expect(result.current[0]).toBe(500);
  });

  it('soporta serialización y parsing personalizados (texto plano)', async () => {
    const { result } = renderHook(() =>
      usePersistedState<string>(KEY, 'dashboard', {
        serialize: (v) => v,
        parse: (raw) => raw,
      })
    );

    act(() => {
      result.current[1]('routine');
    });
    await waitFor(() => {
      expect(localStorage.getItem(KEY)).toBe('routine');
    });

    act(() => {
      result.current[1]('dashboard');
    });
    await waitFor(() => {
      expect(localStorage.getItem(KEY)).toBe('dashboard');
    });
  });

  it('restaura texto plano guardado con parse personalizado', () => {
    localStorage.setItem(KEY, 'profile');
    const { result } = renderHook(() =>
      usePersistedState<string>(KEY, 'dashboard', {
        serialize: (v) => v,
        parse: (raw) => raw,
      })
    );
    expect(result.current[0]).toBe('profile');
  });

  it('sobrevive si localStorage tira error al leer', () => {
    const originalGet = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('storage bloqueado');
    };
    try {
      const { result } = renderHook(() => usePersistedState<number>(KEY, 5));
      expect(result.current[0]).toBe(5);
    } finally {
      Storage.prototype.getItem = originalGet;
    }
  });

  it('sobrevive si localStorage tira error al escribir', () => {
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error('cuota superada');
    };
    try {
      const { result } = renderHook(() => usePersistedState<number>(KEY, 5));
      act(() => {
        result.current[1](9);
      });
      expect(result.current[0]).toBe(9);
    } finally {
      Storage.prototype.setItem = originalSet;
    }
  });
});
