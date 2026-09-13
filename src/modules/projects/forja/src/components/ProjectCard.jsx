/**
 * @file forja/src/components/ProjectCard.jsx
 * @description Tarjeta de una pieza (proyecto) en el tablero: próxima acción,
 * progreso, navegación de estado, acciones y bitácora.
 */

import React, { useState } from 'react';
import { Check, Pencil, Trash2, ChevronDown, ChevronUp, Hammer } from 'lucide-react';
import {
  STATUS_META,
  PRIORITY_META,
  formatWhen,
  isOverdue,
} from '../domain/projectDomain';

export default function ProjectCard({ project, onAdvance, onRegress, onComplete, onEdit, onDelete }) {
  const [showLog, setShowLog] = useState(false);
  const meta = STATUS_META[project.status];
  const priority = PRIORITY_META[project.priority] || PRIORITY_META.Media;
  const overdue = isOverdue(project);
  const complete = project.status === 'Completado';
  const canAdvance = project.status !== 'Completado';
  const canRegress = project.status !== 'Por iniciar';

  return (
    <article className="fj-card" data-status={project.status}>
      <div className="fj-card-top">
        <span
          className="fj-priority"
          style={{ color: priority.text, background: priority.bg, borderColor: priority.border }}
        >
          {project.priority}
        </span>
        <div className="fj-card-actions">
          <button type="button" className="fj-icon-btn" onClick={() => onEdit(project)} title="Editar pieza" aria-label="Editar">
            <Pencil size={14} />
          </button>
          <button type="button" className="fj-icon-btn" data-danger="true" onClick={() => onDelete(project)} title="Desmantelar pieza" aria-label="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="fj-card-title">{project.title}</h3>
      {project.description && <p className="fj-card-desc">{project.description}</p>}

      <div className="fj-next-action">
        <div className="fj-next-label">
          <Hammer size={11} />
          Próxima acción
        </div>
        <p className="fj-next-text" style={project.nextActionDoneAt ? { textDecoration: 'line-through', opacity: 0.75 } : undefined}>
          {project.nextAction || '—'}
        </p>
        {project.nextActionDoneAt ? (
          <div className="fj-next-done">
            <span>✓ completada {formatWhen(project.nextActionDoneAt)}</span>
          </div>
        ) : (
          !complete && (
            <button type="button" className="fj-btn fj-btn-primary fj-complete-btn" onClick={() => onComplete(project)}>
              <Check size={12} />
              Completar próxima acción
            </button>
          )
        )}
      </div>

      <div className="fj-progress">
        <span>AVANCE</span>
        <div className="fj-progress-track">
          <div
            className="fj-progress-fill"
            data-complete={complete}
            style={{ width: `${project.progressPercent}%` }}
          />
        </div>
        <span>{project.progressPercent}%</span>
      </div>

      <div className="fj-card-foot">
        <div className="fj-state-nav">
          <button
            type="button"
            className="fj-state-btn"
            onClick={() => onRegress(project)}
            disabled={!canRegress}
            title="Retroceder estado"
            aria-label="Retroceder estado"
          >
            ◀
          </button>
          <span
            className="fj-status-tag"
            style={{ color: meta.text, background: meta.bg, border: `1px solid ${meta.border}`, padding: '3px 8px', fontSize: 10, letterSpacing: '0.05em' }}
          >
            {meta.label}
          </span>
          <button
            type="button"
            className="fj-state-btn"
            onClick={() => onAdvance(project)}
            disabled={!canAdvance}
            title="Avanzar estado"
            aria-label="Avanzar estado"
          >
            ▶
          </button>
        </div>

        <button type="button" className="fj-log-toggle" onClick={() => setShowLog(!showLog)}>
          Bitácora ({project.log.length}) {showLog ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {project.dueDate && (
        <span className="fj-due" data-overdue={overdue}>
          Vence: {project.dueDate} {overdue ? '· ¡VENCIDA!' : ''}
        </span>
      )}

      {showLog && project.log.length > 0 && (
        <div className="fj-log">
          {project.log
            .slice()
            .reverse()
            .map((entry) => (
              <div className="fj-log-entry" key={entry.id}>
                <span className="fj-log-when">{formatWhen(entry.when)}</span>
                <span className="fj-log-msg">{entry.message}</span>
              </div>
            ))}
        </div>
      )}
    </article>
  );
}