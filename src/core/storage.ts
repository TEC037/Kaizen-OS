/**
 * @file src/core/storage.ts
 * @description Capa de almacenamiento local (localStorage) para persistir estados de módulos
 * y datos interactivos de demostración en Kaizen OS.
 */

import { ModuleStateMap, ModuleStatus } from './types';

const STORAGE_KEY_MODULES = 'kaizen_os_modules_state_v1';
const STORAGE_KEY_DATA = 'kaizen_os_demo_data_v1';

/**
 * Configuración inicial por defecto exigida por la especificación:
 * - Hábitos y Proyectos: habilitados ('enabled')
 * - Gimnasio, Lectura, Finanzas: disponibles ('available')
 */
export const DEFAULT_MODULE_STATES: ModuleStateMap = {
  habits: { status: 'enabled', installedAt: new Date().toISOString() },
  projects: { status: 'enabled', installedAt: new Date().toISOString() },
  gym: { status: 'available' },
  reading: { status: 'available' },
  finance: { status: 'available' },
};

/**
 * Carga el mapa de estados de módulos desde localStorage o retorna el valor por defecto
 */
export function loadModuleStates(): ModuleStateMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODULES);
    if (!raw) {
      return { ...DEFAULT_MODULE_STATES };
    }
    const parsed = JSON.parse(raw) as ModuleStateMap;
    // Asegurar que todas las claves requeridas existan
    return {
      ...DEFAULT_MODULE_STATES,
      ...parsed,
    };
  } catch (error) {
    console.warn('[KaizenOS:Storage] Error al leer estados de módulos, usando valores por defecto', error);
    return { ...DEFAULT_MODULE_STATES };
  }
}

/**
 * Guarda el mapa de estados en localStorage
 */
export function saveModuleStates(states: ModuleStateMap): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(states));
  } catch (error) {
    console.error('[KaizenOS:Storage] Error al guardar estados de módulos', error);
  }
}

/**
 * Restablece la configuración inicial de módulos
 */
export function resetModuleStates(): ModuleStateMap {
  try {
    localStorage.removeItem(STORAGE_KEY_MODULES);
  } catch (error) {
    console.error('[KaizenOS:Storage] Error al limpiar estados', error);
  }
  return { ...DEFAULT_MODULE_STATES };
}

/**
 * Utilidades para guardar y cargar datos de demostración interactivos (hábitos, proyectos, etc.)
 */
export function loadCustomData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_DATA}_${key}`);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.warn(`[KaizenOS:Storage] Error al leer datos ${key}`, e);
  }
  return defaultVal;
}

export function saveCustomData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_DATA}_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`[KaizenOS:Storage] Error al guardar datos ${key}`, e);
  }
}

export function clearCustomData(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_DATA}_${key}`);
  } catch (e) {
    console.error(`[KaizenOS:Storage] Error al limpiar datos ${key}`, e);
  }
}
