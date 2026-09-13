/**
 * @file src/modules/projects/ProjectsPage.tsx
 * @description Módulo "FORJA": taller de proyectos construido dentro del módulo
 * (`src/modules/projects/forja`), 100% local. FORJA solo EMITE eventos; los
 * puntos Kaizen los otorga el shell de forma declarativa a partir del `spec`
 * del manifiesto (Fase 5), sin acoplar este código al scoring.
 */

import React from 'react';
import ForjaApp from './forja/src/App';
import './forja/src/index.css';

export const ProjectsPage: React.FC = () => {
  return (
    <div className="forja-app -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      <ForjaApp />
    </div>
  );
};