/**
 * @file src/core/useKeyboardShortcuts.ts
 * @description Hook de atajos globales de teclado del sistema Kaizen OS.
 * Maneja secuencias estilo Vim (G D, G H, G F...), Omnibar (Cmd+K), Zen Mode (Z) y ayuda (?).
 */

import { useEffect, useRef } from 'react';
import { soundEngine } from './sound';

interface KeyboardShortcutsOptions {
  onToggleCommandBar: () => void;
  onToggleZenMode: () => void;
  onToggleShortcutsModal: () => void;
  onToggleSound?: () => void;
  onNavigate: (path: string) => void;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts({
  onToggleCommandBar,
  onToggleZenMode,
  onToggleShortcutsModal,
  onToggleSound,
  onNavigate,
  onCloseModals,
}: KeyboardShortcutsOptions) {
  const lastKeyRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el foco está dentro de un campo de texto o editable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Cmd+K o Ctrl+K funciona SIEMPRE, incluso dentro de inputs
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundEngine.playTap();
        onToggleCommandBar();
        return;
      }

      if (isInput) return;

      const now = Date.now();
      const prevKey = lastKeyRef.current;

      // Escape cierra modales
      if (e.key === 'Escape') {
        soundEngine.playTap();
        onCloseModals();
        return;
      }

      // Zen mode toggle: tecla 'z' o 'Z'
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        soundEngine.playTap();
        onToggleZenMode();
        return;
      }

      // Sonido toggle: tecla 'm' o 'M' (Mute) cuando no viene de secuencia 'g'
      if (e.key.toLowerCase() === 'm' && prevKey.key.toLowerCase() !== 'g') {
        e.preventDefault();
        soundEngine.playTap();
        onToggleSound?.();
        return;
      }

      // Ayuda: tecla '?'
      if (e.key === '?') {
        e.preventDefault();
        soundEngine.playTap();
        onToggleShortcutsModal();
        return;
      }

      // '/' abre el CommandBar
      if (e.key === '/') {
        e.preventDefault();
        soundEngine.playTap();
        onToggleCommandBar();
        return;
      }

      // Manejo de secuencias de 2 teclas que empiezan por 'g' (Go to...)
      if (prevKey.key.toLowerCase() === 'g' && now - prevKey.time < 800) {
        const k = e.key.toLowerCase();
        let navigated = false;
        if (k === 'd') {
          e.preventDefault();
          onNavigate('/');
          navigated = true;
        } else if (k === 'h') {
          e.preventDefault();
          onNavigate('/habits');
          navigated = true;
        } else if (k === 'f') {
          e.preventDefault();
          onNavigate('/projects');
          navigated = true;
        } else if (k === 'g') {
          e.preventDefault();
          onNavigate('/gym');
          navigated = true;
        } else if (k === 'r') {
          e.preventDefault();
          onNavigate('/reading');
          navigated = true;
        } else if (k === 'b') {
          e.preventDefault();
          onNavigate('/finance');
          navigated = true;
        } else if (k === 'm') {
          e.preventDefault();
          onNavigate('/modules');
          navigated = true;
        }
        if (navigated) {
          soundEngine.playTap();
        }
        lastKeyRef.current = { key: '', time: 0 };
        return;
      }

      lastKeyRef.current = { key: e.key, time: now };
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onToggleCommandBar,
    onToggleZenMode,
    onToggleShortcutsModal,
    onToggleSound,
    onNavigate,
    onCloseModals,
  ]);
}
