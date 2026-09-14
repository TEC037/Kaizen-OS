/**
 * @file src/core/profile.ts
 * @description Gestión centralizada y global de la identidad del usuario en Kaizen OS.
 * Única fuente de verdad para el nombre de usuario, consumida reactivamente por
 * todos los módulos (Dashboard, Hábitos, Gimnasio, Sensei AI, Finanzas, etc.).
 */

import { useState, useEffect, useCallback } from 'react';

export const GLOBAL_USER_NAME_KEY = 'kz:user_name';
export const DEFAULT_USER_NAME = 'Alex';
export const USER_NAME_CHANGED_EVENT = 'kz:user_name_changed';

/**
 * Obtiene el nombre de usuario global actual desde el almacenamiento persistente.
 */
export function getGlobalUserName(): string {
  if (typeof window === 'undefined') return DEFAULT_USER_NAME;
  try {
    const stored = localStorage.getItem(GLOBAL_USER_NAME_KEY);
    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
  } catch {
    // Si localStorage está restringido
  }
  return DEFAULT_USER_NAME;
}

/**
 * Actualiza el nombre de usuario globalmente y notifica a todos los módulos y listeners.
 */
export function setGlobalUserName(newName: string): string {
  const trimmed = newName.trim() || DEFAULT_USER_NAME;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GLOBAL_USER_NAME_KEY, trimmed);
    } catch (err) {
      console.warn('Error al persistir nombre global en localStorage:', err);
    }

    // Sincronizar en caliente cachés conocidos de submódulos
    try {
      const gymKeys = ['puntofuerte_user', 'puntofuerte_demo_user'];
      gymKeys.forEach((k) => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              parsed.name = trimmed;
              localStorage.setItem(k, JSON.stringify(parsed));
            }
          } catch {
            // Ignorar parse error
          }
        }
      });
    } catch {
      // no-op
    }

    // Emitir evento reactivo del sistema Kaizen
    window.dispatchEvent(
      new CustomEvent(USER_NAME_CHANGED_EVENT, {
        detail: { userName: trimmed },
      })
    );

    // Emitir evento nativo de storage para interoperabilidad entre tabs
    window.dispatchEvent(new Event('storage'));
  }

  return trimmed;
}

/**
 * Hook de React para consumir y suscribirse reactivamente al nombre de usuario global.
 */
export function useGlobalUserName(): [string, (name: string) => string] {
  const [userName, setUserNameState] = useState<string>(getGlobalUserName);

  useEffect(() => {
    const handleNameChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ userName?: string }>;
      if (customEvt.detail?.userName) {
        setUserNameState(customEvt.detail.userName);
      } else {
        setUserNameState(getGlobalUserName());
      }
    };

    const handleStorage = (e: StorageEvent | Event) => {
      if ('key' in e) {
        if (e.key === GLOBAL_USER_NAME_KEY || !e.key) {
          setUserNameState(getGlobalUserName());
        }
      } else {
        setUserNameState(getGlobalUserName());
      }
    };

    window.addEventListener(USER_NAME_CHANGED_EVENT, handleNameChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(USER_NAME_CHANGED_EVENT, handleNameChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateUserName = useCallback((name: string) => {
    const saved = setGlobalUserName(name);
    setUserNameState(saved);
    return saved;
  }, []);

  return [userName, updateUserName];
}
