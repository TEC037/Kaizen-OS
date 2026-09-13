/**
 * @file forja/src/components/Board.jsx
 * @description Tablero con las cuatro columnas de estado del taller de FORJA.
 */

import React from 'react';
import ProjectCard from './ProjectCard';
import { STATUSES, STATUS_META } from '../domain/projectDomain';

export default function Board({ projects, callbacks }) {
  return (
    <div className="fj-board">
      {STATUSES.map((status) => {
        const meta = STATUS_META[status];
        const items = projects.filter((p) => p.status === status);
        return (
          <section className="fj-col" key={status} aria-label={status}>
            <div className="fj-col-head">
              <span className="fj-col-name">
                <span className="fj-dot" style={{ background: meta.dot }} />
                {meta.label}
              </span>
              <span className="fj-col-count">{items.length}</span>
            </div>
            <div className="fj-col-body">
              {items.length === 0 ? (
                <div className="fj-col-empty">— Sin piezas aquí —</div>
              ) : (
                items.map((project) => (
                  <ProjectCard key={project.id} project={project} {...callbacks} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}