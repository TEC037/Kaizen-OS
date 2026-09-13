import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve el valor inicial de inmediato', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebouncedValue('hola'));
    expect(result.current).toBe('hola');
  });

  it('no propaga el cambio hasta que pasa el retraso', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('b');
  });

  it('descarta los valores intermedios cuando cambia rápido', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 250), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(250));
    expect(result.current).toBe('c');
  });

  it('respeta el retraso personalizado', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 800), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(799));
    expect(result.current).toBe(1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(2);
  });

  it('propaga de inmediato con delay=0 al flushear timers', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 0), {
      initialProps: { value: 'x' },
    });

    rerender({ value: 'y' });
    act(() => vi.advanceTimersByTime(0));
    expect(result.current).toBe('y');
  });
});
