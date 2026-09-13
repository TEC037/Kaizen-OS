/**
 * @file forja/src/domain/projectDomain.js
 * @description Reglas del dominio de FORJA: estados, progreso, prioridades y
 * ayudantes de cada pieza (proyecto) forjada en el taller.
 */

export const STATUSES = ['Por iniciar', 'En progreso', 'En revisión', 'Completado'];
export const PRIORITIES = ['Alta', 'Media', 'Baja'];

export const PROGRESS_BY_STATUS = {
  'Por iniciar': 10,
  'En progreso': 50,
  'En revisión': 85,
  Completado: 100,
};

export const STATUS_META = {
  'Por iniciar': { label: 'POR INICIAR', dot: '#a8a29e', text: '#57534e', bg: '#f5f5f4', border: '#d6d3d1' },
  'En progreso': { label: 'EN PROGRESO', dot: '#f59e0b', text: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
  'En revisión': { label: 'EN REVISIÓN', dot: '#06b6d4', text: '#155e75', bg: '#ecfeff', border: '#67e8f9' },
  Completado: { label: 'COMPLETADO', dot: '#22c55e', text: '#166534', bg: '#f0fdf4', border: '#86efac' },
};

export const PRIORITY_META = {
  Alta: { label: 'Alta', text: '#7f1d1d', bg: '#fef2f2', border: '#fca5a5' },
  Media: { label: 'Media', text: '#713f12', bg: '#fefce8', border: '#fde047' },
  Baja: { label: 'Baja', text: '#14532d', bg: '#f0fdf4', border: '#86efac' },
};

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function statusProgress(status) {
  return PROGRESS_BY_STATUS[status] ?? 10;
}

export function nextStatus(status) {
  const i = STATUSES.indexOf(status);
  return i >= 0 && i < STATUSES.length - 1 ? STATUSES[i + 1] : status;
}

export function prevStatus(status) {
  const i = STATUSES.indexOf(status);
  return i > 0 ? STATUSES[i - 1] : status;
}

export function createProject({ title, description = '', nextAction = '', priority = 'Media', dueDate = '' }) {
  const now = new Date().toISOString();
  const log = [];
  log.push({ id: `lg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'created', message: 'Pieza forjada en el taller', when: now });
  return {
    id: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    description: description.trim() || 'Sin descripción adicional.',
    nextAction: nextAction.trim(),
    priority,
    dueDate,
    status: 'Por iniciar',
    progressPercent: statusProgress('Por iniciar'),
    nextActionDoneAt: null,
    createdAt: now,
    updatedAt: now,
    log,
  };
}

export function isOverdue(project) {
  if (project.status === 'Completado' || !project.dueDate) return false;
  return project.dueDate < todayISO();
}

export function logEvent(project, type, message) {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    log: [
      ...(project.log || []),
      { id: `lg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, message, when: new Date().toISOString() },
    ].slice(-30),
  };
}