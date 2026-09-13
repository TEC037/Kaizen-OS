/**
 * @file src/core/moduleSettings.ts
 * @description Settings declarativos por módulo (Fase 6).
 * El shell guarda las preferencias por usuario en `kaizen:system:settings`
 * con estructura `{ [moduleId]: { [settingId]: value } }`. Las definiciones se
 * declaran en `spec.settings` del manifiesto; este store solo persiste y emite
 * cambios por `window` + bus para que el shell y los módulos reaccionen.
 */

import { useState, useEffect, useCallback } from 'react';
import { kaizenBus } from '../sdk/bus';

const SETTINGS_KEY = 'kaizen:system:settings';
const SETTINGS_CHANGED_EVENT = 'kaizen:system:settings-changed';

export type ModuleSettingsMap = Record<string, Record<string, unknown>>;

/** Lectura tolerante del almacén completo de settings. */
function readAll(): ModuleSettingsMap {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as ModuleSettingsMap;
  } catch {
    return {};
  }
}

function writeAll(map: ModuleSettingsMap): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(map));
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: map }));
}

/** Valor actual (solo las sobreescrituras de usuario) de un módulo. */
export function loadModuleSettings(moduleId: string): Record<string, unknown> {
  return readAll()[moduleId] ?? {};
}

/** Persiste el valor de un setting y emite el cambio (window + bus). */
export function saveModuleSetting(moduleId: string, settingId: string, value: unknown): void {
  const map = readAll();
  map[moduleId] = { ...(map[moduleId] ?? {}), [settingId]: value };
  writeAll(map);
  kaizenBus.emit<{ moduleId: string; settingId: string; value: unknown }>(
    { name: 'settings:changed' },
    { moduleId, settingId, value }
  );
}

/** Descarta las sobreescrituras de usuario de un módulo. */
export function resetModuleSettings(moduleId: string): void {
  const map = readAll();
  delete map[moduleId];
  writeAll(map);
}

/**
 * Hook reactivo: valores de los settings de un módulo (sobreescrituras de
 * usuario) + acciones para actualizarlos y restablecerlos.
 */
export function useModuleSettings(moduleId: string): {
  values: Record<string, unknown>;
  setValue: (settingId: string, value: unknown) => void;
  reset: () => void;
} {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    loadModuleSettings(moduleId)
  );

  useEffect(() => {
    const handler = () => setValues(loadModuleSettings(moduleId));
    window.addEventListener(SETTINGS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handler);
  }, [moduleId]);

  const setValue = useCallback(
    (settingId: string, value: unknown) => saveModuleSetting(moduleId, settingId, value),
    [moduleId]
  );

  const reset = useCallback(() => {
    resetModuleSettings(moduleId);
    setValues({});
  }, [moduleId]);

  return { values, setValue, reset };
}