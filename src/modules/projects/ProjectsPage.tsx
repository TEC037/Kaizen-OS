/**
 * @file src/modules/projects/ProjectsPage.tsx
 * @description Módulo "FORJA": taller de proyectos construido dentro del módulo
 * (`src/modules/projects/forja`), 100% local. FORJA solo EMITE eventos; los
 * puntos Kaizen los otorga el shell de forma declarativa a partir del `spec`
 * del manifiesto (Fase 5), sin acoplar este código al scoring.
 */

import React, { useEffect } from 'react';
import ForjaApp from './forja/src/App';
import './forja/src/index.css';
import { soundEngine } from '../../core/sound';

export const ProjectsPage: React.FC = () => {
  useEffect(() => {
    const handleNextAction = () => {
      soundEngine.playComplete();
      window.dispatchEvent(new Event('storage_projects_updated'));
    };

    const handleProjectCompleted = () => {
      soundEngine.playMilestone();
      window.dispatchEvent(new Event('storage_projects_updated'));
    };

    const handleProjectAdvanced = () => {
      soundEngine.playTap();
      window.dispatchEvent(new Event('storage_projects_updated'));
    };

    const handleProjectCreated = () => {
      soundEngine.playTap();
      window.dispatchEvent(new Event('storage_projects_updated'));
    };

    window.addEventListener('forja:next-action-done', handleNextAction);
    window.addEventListener('forja:project-completed', handleProjectCompleted);
    window.addEventListener('forja:project-advanced', handleProjectAdvanced);
    window.addEventListener('forja:project-created', handleProjectCreated);

    return () => {
      window.removeEventListener('forja:next-action-done', handleNextAction);
      window.removeEventListener('forja:project-completed', handleProjectCompleted);
      window.removeEventListener('forja:project-advanced', handleProjectAdvanced);
      window.removeEventListener('forja:project-created', handleProjectCreated);
    };
  }, []);

  return (
    <div className="forja-app -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      <ForjaApp />
    </div>
  );
};