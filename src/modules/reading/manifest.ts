/**
 * @file src/modules/reading/manifest.ts
 * @description Manifiesto declarativo del módulo de Lectura para Kaizen OS.
 * Se incorpora dinámicamente al registrarse en el sistema.
 */

import { ModuleManifest } from '../../core/types';
import { ReadingPage } from './ReadingPage';
import { ReadingWidget } from './ReadingWidget';

export const readingManifest: ModuleManifest = {
  id: 'reading',
  name: 'Lectura',
  description: 'Gestión de libros en progreso, pendientes y registro de sesiones de lectura activa.',
  category: 'Aprendizaje',
  iconName: 'BookOpen',
  defaultStatus: 'available', // Inicialmente disponible
  routes: [
    {
      path: '/reading',
      label: 'Lectura',
      iconName: 'BookOpen',
      component: ReadingPage,
    },
  ],
  widgets: [
    {
      id: 'reading-current-book',
      title: 'Lectura Activa',
      gridSpan: 'half',
      component: ReadingWidget,
    },
  ],
  permissions: ['storage:local'],
  optionalDependencies: [],
  version: '1.0.0',
};
