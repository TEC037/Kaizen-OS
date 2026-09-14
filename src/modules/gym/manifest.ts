/**
 * @file src/modules/gym/manifest.ts
 * @description Manifiesto declarativo del módulo "Punto Fuerte" (FitAi) para Kaizen OS.
 * La aplicación completa vive en el submódulo Git `src/modules/gym/fitai`.
 * Por defecto está en estado 'available' (disponible para instalar).
 */

import { ModuleManifest } from '../../core/types';
import { lazy } from 'react';

// Carga diferida: el sub-app completo de FitAi solo se descarga al habilitarse.
const GymPage = lazy(() => import('./GymPage').then((m) => ({ default: m.GymPage })));
const GymWidget = lazy(() => import('./GymWidget').then((m) => ({ default: m.GymWidget })));

export const gymManifest: ModuleManifest = {
  id: 'gym',
  name: 'Punto Fuerte',
  description:
    'Entrenamientos, rutinas estructuradas, catálogo de ejercicios, nutrición y progreso atlético personal.',
  category: 'Salud y Bienestar',
  iconName: 'Dumbbell',
  defaultStatus: 'available', // IMPORTANTE: Inicialmente disponible, NO instalado
  routes: [
    {
      path: '/gym',
      label: 'Punto Fuerte',
      iconName: 'Dumbbell',
      component: GymPage,
    },
  ],
  widgets: [
    {
      id: 'gym-workout-log',
      title: 'Punto Fuerte',
      gridSpan: 'half',
      component: GymWidget,
    },
  ],
  permissions: ['storage:local', 'fitness:metrics'],
  optionalDependencies: [],
  version: '1.0.0',
  spec: {
    theme: {
      accent: '#b91c1c', // Carmesí atlético
      bg: '#f4f2ec',
    },
    storage: {
      scope: 'gym',
      version: 1,
      defaults: {},
    },
    events: {
      emits: [
        {
          name: 'gym:session-completed',
          description: 'Sesión de entrenamiento finalizada en Punto Fuerte',
          points: 30,
          reason: 'Entrenamiento completado en Punto Fuerte',
        },
      ],
      listens: [],
    },
    settings: [
      {
        id: 'metaEntrenamientosSemana',
        label: 'Meta semanal de entrenamientos',
        type: 'number',
        default: 4,
        help: 'Días por semana planificados para actividad física deliberada',
      },
    ],
  },
};