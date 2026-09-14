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
  spec: {
    theme: {
      accent: '#0e7490', // Azul zafiro intelectual
      bg: '#f4f2ec',
    },
    storage: {
      scope: 'reading',
      version: 1,
      defaults: {},
    },
    events: {
      emits: [
        {
          name: 'reading:session-finished',
          description: 'Sesión de lectura activa de páginas registrada',
          points: 15,
          reason: 'Lectura activa en biblioteca',
        },
      ],
      listens: [],
    },
    settings: [
      {
        id: 'metaPaginasDiarias',
        label: 'Meta diaria de páginas leídas',
        type: 'number',
        default: 20,
        help: 'Páginas recomendadas por día para mantener la disciplina intelectual',
      },
    ],
  },
};
