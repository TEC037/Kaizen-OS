/**
 * @file src/core/moduleLifecycle.ts
 * @description Gestor del ciclo de vida de los módulos de Kaizen OS.
 * Implementa las transiciones de estado formales:
 * - install: 'available' -> 'enabled'
 * - suspend: 'enabled' -> 'suspended'
 * - activate/enable: 'suspended' | 'installed' -> 'enabled'
 * - uninstall: 'enabled' | 'suspended' | 'installed' -> 'available'
 * - reset: restablece a la configuración inicial (Hábitos y Proyectos habilitados)
 */

import { useState, useEffect, useCallback } from 'react';
import { ModuleStateMap, ModuleStatus } from './types';
import {
  loadModuleStates,
  saveModuleStates,
  resetModuleStates,
  DEFAULT_MODULE_STATES,
} from './storage';

const LIFECYCLE_EVENT = 'kaizen_os_module_state_change';

/**
 * Dispara evento global de cambio de estado para sincronizar todos los componentes
 */
function emitStateChange(states: ModuleStateMap) {
  saveModuleStates(states);
  window.dispatchEvent(new CustomEvent(LIFECYCLE_EVENT, { detail: states }));
}

/**
 * Hook de React para consumir y mutar el estado del ciclo de vida de los módulos
 */
export function useModuleLifecycle() {
  const [states, setStates] = useState<ModuleStateMap>(() => loadModuleStates());

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ModuleStateMap>;
      if (customEvent.detail) {
        setStates(customEvent.detail);
      } else {
        setStates(loadModuleStates());
      }
    };
    window.addEventListener(LIFECYCLE_EVENT, handler);
    return () => window.removeEventListener(LIFECYCLE_EVENT, handler);
  }, []);

  /**
   * Instala un módulo disponible y lo marca inmediatamente como 'enabled'
   */
  const installModule = useCallback((moduleId: string) => {
    setStates((prev) => {
      const next: ModuleStateMap = {
        ...prev,
        [moduleId]: {
          status: 'enabled',
          installedAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        },
      };
      emitStateChange(next);
      return next;
    });
  }, []);

  /**
   * Suspende un módulo habilitado. Oculta sus rutas y widgets,
   * pero conserva el módulo en la sección de módulos instalados con estado suspendido.
   */
  const suspendModule = useCallback((moduleId: string) => {
    setStates((prev) => {
      const next: ModuleStateMap = {
        ...prev,
        [moduleId]: {
          status: 'suspended',
          installedAt: prev[moduleId]?.installedAt || new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        },
      };
      emitStateChange(next);
      return next;
    });
  }, []);

  /**
   * Reactiva o habilita un módulo suspendido o instalado
   */
  const activateModule = useCallback((moduleId: string) => {
    setStates((prev) => {
      const next: ModuleStateMap = {
        ...prev,
        [moduleId]: {
          status: 'enabled',
          installedAt: prev[moduleId]?.installedAt || new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        },
      };
      emitStateChange(next);
      return next;
    });
  }, []);

  /**
   * Desinstala un módulo y lo regresa al estado 'available'
   */
  const uninstallModule = useCallback((moduleId: string) => {
    setStates((prev) => {
      const next: ModuleStateMap = {
        ...prev,
        [moduleId]: {
          status: 'available',
          lastUpdatedAt: new Date().toISOString(),
        },
      };
      emitStateChange(next);
      return next;
    });
  }, []);

  /**
   * Restablece la configuración inicial de módulos según los criterios de aceptación
   * (Hábitos y Proyectos habilitados, Gimnasio, Lectura y Finanzas disponibles)
   */
  const resetToDefault = useCallback(() => {
    const defaultState = resetModuleStates();
    setStates(defaultState);
    emitStateChange(defaultState);
  }, []);

  /**
   * Helper para obtener el estado actual de un módulo dado
   */
  const getStatus = useCallback(
    (moduleId: string): ModuleStatus => {
      return states[moduleId]?.status || 'available';
    },
    [states]
  );

  return {
    states,
    getStatus,
    installModule,
    suspendModule,
    activateModule,
    uninstallModule,
    resetToDefault,
  };
}
