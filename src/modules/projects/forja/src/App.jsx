/**
 * @file forja/src/App.jsx
 * @description Aplicación FORJA: taller de proyectos con próxima acción,
 * tablero Kanban por estados, bitácora y persistencia local de Kaizen OS.
 */

import React from 'react';
import { Hammer, Plus, RotateCcw, Trash2, Search, X } from 'lucide-react';
import { useProjectsStore } from './store/useProjectsStore';
import StatsBar from './components/StatsBar';
import Board from './components/Board';
import ProjectForm from './components/ProjectForm';
import { STATUSES } from './domain/projectDomain';
import { FORJA_KEY } from './storage/forjaStorage';

export default function ForjaApp() {
  const store = useProjectsStore();
  const {
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
  } = store;

  const editing = form.editingId ? projects.find((p) => p.id === form.editingId) || null : null;

  const openNew = () => setForm({ open: true, editingId: null });
  const openEdit = (project) => setForm({ open: true, editingId: project.id });
  const closeForm = () => setForm({ open: false, editingId: null });

  const handleSubmit = ({ id, payload }) => {
    if (id) updateProject(id, payload);
    else addProject(payload);
    closeForm();
  };

  const callbacks = {
    onAdvance: (p) => advanceProject(p.id),
    onRegress: (p) => regressProject(p.id),
    onComplete: (p) => completeNextAction(p.id),
    onEdit: openEdit,
    onDelete: (p) => removeProject(p.id),
  };

  return (
    <div className="fj-wrap">
      <header className="fj-header">
        <div className="fj-title-block">
          <p className="fj-kicker">Módulo /projects · v2.0.0 · 100% local</p>
          <h1 className="fj-title">FORJA</h1>
          <p className="fj-subtitle">
            Taller de proyectos: cada pieza necesita una próxima acción concreta. 1% de avance cada día.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="fj-btn fj-btn-primary" onClick={openNew}>
            <Plus size={13} />
            Forjar pieza
          </button>
          <button type="button" className="fj-btn fj-btn-ghost" onClick={clearAll} title="Vacía el taller (para probar el estado vacío)">
            <Trash2 size={13} />
            Despejar
          </button>
          <button type="button" className="fj-btn fj-btn-ghost" onClick={resetToSeed} title="Recupera los planos de muestra">
            <RotateCcw size={13} />
            Planos de muestra
          </button>
        </div>
      </header>

      <StatsBar projects={projects} />

      <div className="fj-toolbar">
        <div className="fj-search">
          <Search size={13} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.stopPropagation();
                setQuery('');
              }
            }}
            placeholder="Buscar pieza o próxima acción…"
            aria-label="Buscar"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--fj-ink-soft)' }}
              title="Limpiar búsqueda"
              aria-label="Limpiar búsqueda"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {['Todos', ...STATUSES].map((s) => (
          <button
            type="button"
            key={s}
            className="fj-chip"
            data-active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'Todos' ? 'Todas' : s}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'var(--fj-ink-soft)' }}>
          {filtered.length} de {projects.length} piezas
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="fj-empty">
          <p className="fj-empty-title">El taller está vacío</p>
          <p style={{ fontSize: 13, margin: 0 }}>
            No hay piezas forjadas todavía. Cada proyecto requiere una próxima acción concreta para avanzar el 1% diario.
          </p>
          <div className="fj-empty-actions">
            <button type="button" className="fj-btn fj-btn-primary" onClick={openNew}>
              <Plus size={13} />
              Forjar la primera pieza
            </button>
            <button type="button" className="fj-btn fj-btn-ghost" onClick={resetToSeed}>
              <RotateCcw size={13} />
              Cargar planos de muestra
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="fj-empty">
          <p className="fj-empty-title">Sin resultados</p>
          <p style={{ fontSize: 13, margin: 0 }}>Ninguna pieza coincide con el filtro o la búsqueda actual.</p>
        </div>
      ) : (
        <Board projects={filtered} callbacks={callbacks} />
      )}

      <footer className="fj-footer">
        <span>TALLER DE FORJA · ESTADO GUARDADO EN: {FORJA_KEY}</span>
        <span>KAIZEN 1% · AVANZA HOY CON LA PRÓXIMA ACCIÓN</span>
      </footer>

      <ProjectForm form={form} editing={editing} onClose={closeForm} onSubmit={handleSubmit} />
    </div>
  );
}