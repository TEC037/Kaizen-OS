import { useEffect, useRef } from 'react';

export const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Añade a un diálogo modal:
 * - Foco inicial en el primer elemento enfocable al abrir
 * - Trampa de foco (Tab envuelve entre primer y último elemento)
 * - Cierre con Escape
 * - Restauración del foco al elemento que lo tenía antes de abrir
 *
 * `onClose` se guarda en una ref para que cambios de identidad en el padre
 * no re-ejecuten el efecto ni roben el foco mientras el modal está abierto.
 *
 * Devuelve una ref para adjuntar al contenedor del diálogo y un handler
 * de cierre por clic en el fondo (backdrop).
 */
export function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
        (el) => !el.hasAttribute('disabled')
      );

    getFocusable()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;

        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          if (active === firstEl || !dialogRef.current?.contains(active)) {
            event.preventDefault();
            lastEl.focus();
          }
        } else if (active === lastEl || !dialogRef.current?.contains(active)) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCloseRef.current();
    }
  };

  return { dialogRef, handleBackdropClick };
}

export default useModalAccessibility;
