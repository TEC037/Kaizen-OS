import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

interface UsePersistedStateOptions<T> {
  /** Custom serialization (default: JSON.stringify). */
  serialize?: (value: T) => string;
  /** Custom parsing al restaurar (default: JSON.parse). */
  parse?: (raw: string) => T;
}

function resolveDefault<T>(value: T | (() => T)): T {
  return typeof value === 'function' ? (value as () => T)() : value;
}

function defaultParse<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

/**
 * useState con persistencia en localStorage: hidrata desde la clave al montar y
 * escribe en cada cambio (con debounce). Se sincroniza entre pestañas.
 * Fallback silencioso al valor por defecto ante cualquier error.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T | (() => T),
  options: UsePersistedStateOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const { serialize = JSON.stringify, parse = defaultParse } = options;

  const serializeRef = useRef(serialize);
  const parseRef = useRef(parse);

  useEffect(() => {
    serializeRef.current = serialize;
    parseRef.current = parse;
  }, [serialize, parse]);

  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return resolveDefault(defaultValue);
      return parseRef.current(saved);
    } catch {
      return resolveDefault(defaultValue);
    }
  });

  // Si cambia la key dinámica, reiniciamos el estado
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setValue(parseRef.current(saved));
      } else {
        setValue(resolveDefault(defaultValue));
      }
    } catch {
      setValue(resolveDefault(defaultValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); 

  // Escribir en localStorage con debounce
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, serializeRef.current(value));
      } catch {
        // Fallback silencioso
      }
    }, 300);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value]);

  // Sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(parseRef.current(e.newValue));
        } catch {
          // Fallback silencioso
        }
      } else if (e.key === key && e.newValue === null) {
        setValue(resolveDefault(defaultValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
