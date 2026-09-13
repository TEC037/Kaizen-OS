import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente utilitario para asegurar que cada navegación
 * reinicie el desplazamiento al tope de la página.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
