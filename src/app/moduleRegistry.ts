/**
 * @file src/app/moduleRegistry.ts
 * @description Registro central de módulos de Kaizen OS basado en manifiestos declarativos.
 * 
 * ============================================================================
 * ¿CÓMO AÑADIR UN NUEVO MÓDULO AL SISTEMA KAIZEN OS? (3 PASOS SENCILLOS):
 * ============================================================================
 * 1. Crea la carpeta del módulo en `src/modules/<nuevo-modulo>/`.
 *    Ejemplo: `src/modules/journal/`
 * 
 * 2. Define su manifiesto declarativo (`manifest.ts`) exportando un objeto de tipo
 *    `ModuleManifest` que declare:
 *    - `id`: identificador único (ej: 'journal')
 *    - `name`: nombre legible (ej: 'Diario de Gratitud')
 *    - `description`: descripción funcional
 *    - `category`: categoría ('Productividad' | 'Salud y Bienestar' | ...)
 *    - `iconName`: nombre de icono (ej: 'Book')
 *    - `defaultStatus`: 'available' o 'enabled'
 *    - `routes`: array con las rutas y componentes de página (ej: [{ path: '/journal', ... }])
 *    - `widgets`: array con los widgets para el dashboard (ej: [{ id: 'journal-widget', ... }])
 *    - `permissions`: permisos simulados requeridos (ej: ['storage:local'])
 * 
 * 3. Importa el manifiesto en este archivo (`moduleRegistry.ts`) y agrégalo
 *    al array `ALL_MODULE_MANIFESTS`.
 * 
 * ¡Listo! El Shell, la navegación dinámica, el enrutador protegido y el Dashboard
 * incorporarán automáticamente el nuevo módulo sin tocar ninguna otra línea de código.
 * ============================================================================
 */

import { ModuleManifest, ModuleStatus, ModuleRoute, ModuleWidgetDef } from '../core/types';
import { habitsManifest } from '../modules/habits/manifest';
import { projectsManifest } from '../modules/projects/manifest';
import { gymManifest } from '../modules/gym/manifest';
import { readingManifest } from '../modules/reading/manifest';
import { financeManifest } from '../modules/finance/manifest';

/**
 * Catálogo completo de manifiestos registrados en el sistema.
 * Para registrar un nuevo módulo, agrégalo a esta lista.
 */
export const ALL_MODULE_MANIFESTS: ModuleManifest[] = [
  habitsManifest,
  projectsManifest,
  gymManifest,
  readingManifest,
  financeManifest,
];

/**
 * Retorna todos los manifiestos registrados
 */
export function getAllManifests(): ModuleManifest[] {
  return ALL_MODULE_MANIFESTS;
}

/**
 * Obtiene el manifiesto de un módulo por su ID
 */
export function getManifestById(id: string): ModuleManifest | undefined {
  return ALL_MODULE_MANIFESTS.find((m) => m.id === id);
}

/**
 * Obtiene el manifiesto responsable de una ruta específica
 */
export function getManifestByRoutePath(path: string): ModuleManifest | undefined {
  return ALL_MODULE_MANIFESTS.find((m) =>
    m.routes.some((r) => r.path === path)
  );
}

/**
 * Filtra y retorna únicamente los módulos en estado 'enabled'
 */
export function getEnabledManifests(statusResolver: (id: string) => ModuleStatus): ModuleManifest[] {
  return ALL_MODULE_MANIFESTS.filter((m) => statusResolver(m.id) === 'enabled');
}

/**
 * Filtra los módulos instalados (habilitados o suspendidos)
 */
export function getInstalledManifests(statusResolver: (id: string) => ModuleStatus): ModuleManifest[] {
  return ALL_MODULE_MANIFESTS.filter((m) => {
    const s = statusResolver(m.id);
    return s === 'enabled' || s === 'suspended' || s === 'installed';
  });
}

/**
 * Filtra los módulos disponibles para instalar
 */
export function getAvailableManifests(statusResolver: (id: string) => ModuleStatus): ModuleManifest[] {
  return ALL_MODULE_MANIFESTS.filter((m) => statusResolver(m.id) === 'available');
}

/**
 * Genera de forma puramente dinámica todos los enlaces de navegación a partir
 * de los módulos actualmente habilitados.
 * NINGÚN componente necesita condicionales como if (gymEnabled).
 */
export function getDynamicNavRoutes(statusResolver: (id: string) => ModuleStatus): (ModuleRoute & { moduleId: string })[] {
  const enabled = getEnabledManifests(statusResolver);
  return enabled.flatMap((m) =>
    m.routes.map((r) => ({
      ...r,
      moduleId: m.id,
    }))
  );
}

/**
 * Genera de forma puramente dinámica todos los widgets para el dashboard
 * a partir de los módulos habilitados.
 */
export function getDynamicWidgets(statusResolver: (id: string) => ModuleStatus): (ModuleWidgetDef & { moduleId: string })[] {
  const enabled = getEnabledManifests(statusResolver);
  return enabled.flatMap((m) =>
    m.widgets.map((w) => ({
      ...w,
      moduleId: m.id,
    }))
  );
}
