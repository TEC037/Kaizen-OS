/**
 * @file forja/src/components/ProjectForm.jsx
 * @description Panel de forja de nuevas piezas y edición de las existentes.
 */

import React, { useEffect, useState } from 'react';
import { X, Hammer } from 'lucide-react';
import { STATUSES } from '../domain/projectDomain';

function todayPlus(days) {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString().split('T')[0];
}

export default function ProjectForm({ form, editing = null, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [priority, setPriority] = useState('Media');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Por iniciar');
  const [error, setError] = useState('');

  useEffect(() => {
    if (form.open) {
      setTitle(editing?.title || '');
      setDescription(editing?.description || '');
      setNextAction(editing?.nextAction || '');
      setPriority(editing?.priority || 'Media');
      setDueDate(editing?.dueDate || '');
      setStatus(editing?.status || 'Por iniciar');
      setError('');
    }
  }, [form.open, editing?.id]);

  if (!form.open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título de la pieza es obligatorio.');
      return;
    }
    if (!nextAction.trim()) {
      setError('Define una próxima acción concreta (filosofía Kaizen de FORJA).');
      return;
    }
    onSubmit({
      id: editing?.id,
      payload: {
        title,
        description,
        nextAction,
        priority,
        dueDate,
        status,
      },
    });
  };

  return (
    <div className="fj-overlay" onClick={onClose}>
      <div className="fj-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={editing ? 'Editar pieza' : 'Nueva pieza'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="fj-drawer-title">{editing ? 'Ajustar la pieza' : 'Forjar nueva pieza'}</h2>
            <p className="fj-drawer-sub">
              {editing
                ? 'Actualiza los planos de este proyecto.'
                : 'Cada proyecto necesita una próxima acción concreta y medible.'}
            </p>
          </div>
          <button type="button" className="fj-icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fj-field">
            <label className="fj-label" htmlFor="fj-title">Título de la pieza *</label>
            <input id="fj-title" className="fj-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Publicar la web del portafolio" autoFocus />
          </div>

          <div className="fj-field">
            <label className="fj-label" htmlFor="fj-next">Próxima acción inmediata *</label>
            <input id="fj-next" className="fj-input" value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Ej: Escribir el primer borrador de la portada" />
          </div>

          <div className="fj-field">
            <label className="fj-label" htmlFor="fj-desc">Descripción o propósito</label>
            <textarea id="fj-desc" className="fj-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve resumen del objetivo final de la pieza…" />
          </div>

          <div className="fj-form-row">
            <div className="fj-field">
              <label className="fj-label" htmlFor="fj-prio">Prioridad</label>
              <select id="fj-prio" className="fj-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {['Alta', 'Media', 'Baja'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="fj-field">
              <label className="fj-label" htmlFor="fj-due">Fecha de vencimiento</label>
              <input id="fj-due" type="date" className="fj-input" value={dueDate} min={todayPlus(-365)} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          {editing && (
            <div className="fj-field">
              <label className="fj-label" htmlFor="fj-status">Estado</label>
              <select id="fj-status" className="fj-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--fj-red)', fontSize: 12, margin: '0 0 10px' }} role="alert">
              {error}
            </p>
          )}

          <div className="fj-form-actions">
            <button type="button" className="fj-btn fj-btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="fj-btn fj-btn-primary">
              <Hammer size={13} />
              {editing ? 'Guardar ajustes' : 'Forjar pieza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}