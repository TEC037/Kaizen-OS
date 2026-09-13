/**
 * @file forja/src/components/StatsBar.jsx
 * @description Indicadores del taller: total de piezas, en curso, forjadas y
 * próximas acciones vencidas.
 */

import React from 'react';
import { isOverdue } from '../domain/projectDomain';

export default function StatsBar({ projects }) {
  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === 'En progreso').length;
  const done = projects.filter((p) => p.status === 'Completado').length;
  const overdue = projects.filter((p) => isOverdue(p)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = [
    { label: 'Piezas en el taller', value: total },
    { label: 'En forja activa', value: inProgress },
    { label: 'Forjadas', value: `${done} · ${pct}%` },
    { label: 'Acciones vencidas', value: overdue },
  ];

  return (
    <div className="fj-stats">
      {stats.map((s) => (
        <div className="fj-stat" key={s.label}>
          <div className="fj-stat-value">{s.value}</div>
          <div className="fj-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}