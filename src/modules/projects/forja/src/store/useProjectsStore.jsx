/**
 * @file forja/src/store/useProjectsStore.jsx
 * @description Estado y acciones del taller de FORJA. Cada mutación persiste en
 * la capa de almacenamiento y emite eventos desacoplados (forja:*) que el
 * wrapper del módulo traduce en puntos Kaizen del shell.
 */

import { useCallback, useMemo, useState } from 'react';
import { loadProjects, saveProjects } from '../storage/forjaStorage';
import { seedProjects } from '../data/seed';
import {
  createProject,
  nextStatus,
  prevStatus,
  statusProgress,
  logEvent,
} from '../domain/projectDomain';

function dispatchForja(type, detail) {
  window.dispatchEvent(new CustomEvent(`forja:${type}`, { detail }));
}

export function useProjectsStore() {
  const [projects, setProjects] = useState(() => loadProjects(seedProjects));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [form, setForm] = useState({ open: false, editingId: null });

  const commit = useCallback((next) => {
    setProjects(next);
    saveProjects(next);
  }, []);

  const addProject = useCallback(
    (input) => {
      const piece = createProject(input);
      commit([piece, ...projects]);
      dispatchForja('project-created', { title: piece.title });
    },
    [projects, commit]
  );

  const updateProject = useCallback(
    (id, patch) => {
      const next = projects.map((p) =>
        p.id === id
          ? { ...p, ...patch, progressPercent: statusProgress(patch.status ?? p.status), updatedAt: new Date().toISOString() }
          : p
      );
      commit(next);
    },
    [projects, commit]
  );

  const removeProject = useCallback(
    (id) => commit(projects.filter((p) => p.id !== id)),
    [projects, commit]
  );

  const advanceProject = useCallback(
    (id) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return;
      const status = nextStatus(target.status);
      if (status === target.status) return;

      const becameCompleted = status === 'Completado';
      const next = projects.map((p) =>
        p.id === id
          ? logEvent(
              { ...p, status, progressPercent: statusProgress(status) },
              becameCompleted ? 'completed' : 'advanced',
              becameCompleted ? 'Pieza completada · hito forjado' : `Avance a «${status}»`
            )
          : p
      );
      commit(next);

      if (becameCompleted) {
        dispatchForja('project-completed', { title: target.title });
      } else {
        dispatchForja('project-advanced', { title: target.title, status });
      }
    },
    [projects, commit]
  );

  const regressProject = useCallback(
    (id) => {
      const target = projects.find((p) => p.id === id);
      if (!target) return;
      const status = prevStatus(target.status);
      if (status === target.status) return;
      commit(
        projects.map((p) =>
          p.id === id
            ? logEvent({ ...p, status, progressPercent: statusProgress(status) }, 'regressed', `Retroceso a «${status}»`)
            : p
        )
      );
    },
    [projects, commit]
  );

  const completeNextAction = useCallback(
    (id) => {
      const target = projects.find((p) => p.id === id);
      if (!target || target.nextActionDoneAt) return;
      const next = projects.map((p) =>
        p.id === id ? logEvent({ ...p, nextActionDoneAt: new Date().toISOString() }, 'next-action-done', `Próxima acción completada: ${p.nextAction}`) : p
      );
      commit(next);
      dispatchForja('next-action-done', { title: target.title });
    },
    [projects, commit]
  );

  const resetToSeed = useCallback(() => {
    const seed = seedProjects.map((s) => ({ ...s, createdAt: new Date().toISOString(), log: [] }));
    commit(seed);
  }, [commit]);

  const clearAll = useCallback(() => commit([]), [commit]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => (statusFilter === 'Todos' ? true : p.status === statusFilter))
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.nextAction || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
  }, [projects, query, statusFilter]);

  return {
    projects,
    filtered,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    form,
    setForm,
    addProject,
    updateProject,
    removeProject,
    advanceProject,
    regressProject,
    completeNextAction,
    resetToSeed,
    clearAll,
  };
}