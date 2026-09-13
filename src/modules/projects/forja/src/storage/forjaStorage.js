/**
 * @file forja/src/storage/forjaStorage.js
 * @description Capa de persistencia de FORJA. Reutiliza la capa de almacenamiento
 * del propio Kaizen OS (core/storage) y migra los proyectos del wireframe antiguo
 * (projects_list) a la nueva estructura de FORJA en el primer arranque.
 */

import { loadCustomData, saveCustomData } from '../../../../../core/storage';

export const FORJA_KEY = 'forja_projects_v1';
export const LEGACY_KEY = 'projects_list';
export const SYNC_EVENT = 'storage_projects_updated';

function migrateLegacy(items) {
  const now = new Date().toISOString();
  return items.map((old) => ({
    id: old.id || `pf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: old.title,
    description: old.description || 'Sin descripción adicional.',
    nextAction: old.nextAction || '',
    priority: old.priority || 'Media',
    dueDate: old.dueDate || '',
    status: old.status || 'Por iniciar',
    progressPercent: old.progressPercent ?? 10,
    nextActionDoneAt: null,
    createdAt: old.createdAt || now,
    updatedAt: now,
    log: [
      { id: `lg-${Date.now()}`, type: 'migrated', message: 'Pieza importada del taller antiguo', when: now },
    ],
  }));
}

export function loadProjects(seed) {
  const current = loadCustomData(FORJA_KEY, null);
  if (Array.isArray(current)) return current;

  const legacy = loadCustomData(LEGACY_KEY, null);
  if (Array.isArray(legacy) && legacy.length > 0) {
    const migrated = migrateLegacy(legacy);
    saveProjects(migrated);
    return migrated;
  }

  return seed;
}

export function saveProjects(projects) {
  saveCustomData(FORJA_KEY, projects);
  window.dispatchEvent(new Event(SYNC_EVENT));
}

export function isForjaState(projects) {
  return Array.isArray(projects) && projects.length > 0 && projects.every((p) => p && p.log !== undefined);
}