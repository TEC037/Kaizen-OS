import { useState, useEffect } from 'react';

export const MOBILE_BREAKPOINT_PX = 768;

/**
 * Detecta si la ventana actual es un viewport móvil (max-width: 768px).
 * Devuelve `false` si no hay matchMedia (jsdom / SSR) para no romper el render.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}