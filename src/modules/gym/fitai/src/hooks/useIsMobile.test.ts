import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile, MOBILE_BREAKPOINT_PX } from './useIsMobile';

class MockMediaQueryList {
  matches: boolean;
  onChange: ((e: { matches: boolean }) => void) | null = null;
  listeners = new Set<(e: { matches: boolean }) => void>();

  constructor(matches: boolean) {
    this.matches = matches;
  }

  addEventListener(_type: string, cb: (e: { matches: boolean }) => void) {
    this.listeners.add(cb);
  }

  removeEventListener(_type: string, cb: (e: { matches: boolean }) => void) {
    this.listeners.delete(cb);
  }

  dispatch(matches: boolean) {
    this.matches = matches;
    const event = { matches };
    this.listeners.forEach((cb) => cb(event));
  }
}

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    if (originalMatchMedia === undefined) {
      delete (window as unknown as { matchMedia?: unknown }).matchMedia;
    } else {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('devuelve false cuando no hay matchMedia (jsdom/SSR)', () => {
    delete (window as unknown as { matchMedia?: unknown }).matchMedia;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('reporta true en un viewport móvil', () => {
    window.matchMedia = vi.fn(() => new MockMediaQueryList(true)) as unknown as typeof matchMedia;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
  });

  it('reporta false en un viewport de escritorio y reacciona a cambios', () => {
    const mql = new MockMediaQueryList(false);
    window.matchMedia = vi.fn(() => mql) as unknown as typeof matchMedia;

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => mql.dispatch(true));
    expect(result.current).toBe(true);

    act(() => mql.dispatch(false));
    expect(result.current).toBe(false);
  });
});