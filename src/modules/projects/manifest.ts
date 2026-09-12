/**
 * @file src/modules/projects/manifest.ts
 * @description Manifiesto declarativo del módulo de Proyectos para Kaizen OS.
 */

import { ModuleManifest } from '../../core/types';
import { ProjectsPage } from './ProjectsPage';
import { ProjectsWidget } from './ProjectsWidget';

export const projectsManifest: ModuleManifest = {
  id: 'projects',
  name: 'Proyectos',
  description: 'Gestión de proyectos personales, estado de avance y próxima acción inmediata.',
  category: 'Productividad',
  iconName: 'FolderKanban',
  defaultStatus: 'enabled', // Inicialmente habilitado según la especificación
  routes: [
    {
      path: '/projects',
      label: 'Proyectos',
      iconName: 'FolderKanban',
      component: ProjectsPage,
    },
  ],
  widgets: [
    {
      id: 'projects-next-actions',
      title: 'Próximas Acciones',
      gridSpan: 'half',
      component: ProjectsWidget,
    },
  ],
  permissions: ['storage:local', 'tasks:manage'],
  optionalDependencies: [],
  version: '1.0.0',
};
