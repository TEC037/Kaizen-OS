/**
 * @file src/sdk/storage.ts
 * @description Almacenamiento namespaced y versionado para módulos de Kaizen OS.
 *
 * Regla de oro: un módulo NUNCA lee directamente la clave de localStorage de
 * otro módulo. Todo acceso pasa por `createModuleStorage` con su `scope`.
 *
 * Formato canónico guardado:
 *   { "scope": <scope>, "version": <version>, "data": <T> }
 *
 * Para claves heredadas (v1) se permite `storageKey` + `parse`/`serialize`
 * personalizados, de modo que la migración no rompe datos existentes.
 */

import React from 'react';

export interface ModuleStorageOptions<T> {
  /** Namespace del módulo (ej: 'habits'). */
  scope: string;
  /** Versión del schema de datos (default 1). */
  version?: number;
  /** Valor por defecto cuando no existe o los datos están corruptos. */
  defaults: T;
  /** Clave personalizada (back-compat con claves v1 por defecto null). */
  storageKey?: string;
  /** Deserializar el valor crudo guardado (back-compat). */
  parse?: (raw: unknown) => T;
  /** Serializar antes de guardar (back-compat). */
  serialize?: (data: T) => unknown;
  /** Nombre del evento de cambio que se emite tras `save` (default `<scope>:changed`). */
  eventName?: string;
}

export interface ModuleStorage<T> {
  scope: string;
  /** Carga el dato actual (o defaults con fallback seguro). */
  load(): T;
  /** Guarda el dato completo, emite el evento de cambio. */
  save(data: T): void;
  /** Actualiza parcialmente el dato actual. */
  patch(updater: (prev: T) => T): void;
  /** Elimina la clave y vuelve a defaults. */
  reset(): void;
  /** Se suscribe a cambios (misma pestaña vía evento + cross-tab vía storage). */
  subscribe(listener: () => void): () => void;
  /** Clave real usada en localStorage (inspección/debug). */
  rawKey(): string;
}

function parseJSON(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createModuleStorage<T>(options: ModuleStorageOptions<T>): ModuleStorage<T> {
  const { scope } = options;
  const version = options.version ?? 1;
  const defaults = options.defaults;
  const key = options.storageKey ?? `kaizen:${scope}:v${version}`;
  const eventName = options.eventName ?? `${scope}:changed`;

  return {
    scope,
    rawKey: () => key,

    load(): T {
      const parsed = parseJSON(localStorage.getItem(key));
      if (parsed == null) return defaults;

      if (options.parse) {
        try {
          return options.parse(parsed);
        } catch (e) {
          console.warn(`[KaizenOS:Storage] ${scope}: error al parsear clave heredada`, e);
          return defaults;
        }
      }

      // Formato canónico: { scope, version, data }
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'data' in (parsed as Record<string, unknown>) &&
        (parsed as Record<string, unknown>).scope === scope
      ) {
        return (parsed as { data: T }).data;
      }

      // Valor legado almacenado sin envoltura → tratar como T directo
      return parsed as T;
    },

    save(data: T): void {
      const serialized = options.serialize ? options.serialize(data) : { scope, version, data };
      try {
        localStorage.setItem(key, JSON.stringify(serialized));
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      } catch (e) {
        console.error(`[KaizenOS:Storage] ${scope}: error al guardar`, e);
      }
    },

    patch(updater: (prev: T) => T): void {
      this.save(updater(this.load()));
    },

    reset(): void {
      try {
        localStorage.removeItem(key);
        window.dispatchEvent(new CustomEvent(eventName, { detail: defaults }));
      } catch (e) {
        console.error(`[KaizenOS:Storage] ${scope}: error al limpiar`, e);
      }
    },

    subscribe(listener: () => void): () => void {
      const handleEvent = () => listener();
      window.addEventListener(eventName, handleEvent);
      window.addEventListener('storage', handleEvent);
      return () => {
        window.removeEventListener(eventName, handleEvent);
        window.removeEventListener('storage', handleEvent);
      };
    },
  };
}

/** Hook de React: carga el storage y reacciona a cambios externos. */
export function useModuleStorage<T>(storage: ModuleStorage<T>): T {
  const { useEffect, useState } = React;
  const [value, setValue] = useState<T>(() => storage.load());

  useEffect(() => {
    const refresh = () => setValue(storage.load());
    refresh();
    return storage.subscribe(refresh);
  }, [storage]);

  return value;
}