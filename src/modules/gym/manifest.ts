/**
 * @file src/modules/gym/manifest.ts
 * @description Manifiesto declarativo del módulo de Gimnasio para Kaizen OS.
 * Por defecto está en estado 'available' (disponible para instalar).
 */

import { ModuleManifest } from '../../core/types';
import { GymPage } from './GymPage';
import { GymWidget } from './GymWidget';

export const gymManifest: ModuleManifest = {
  id: 'gym',
  name: 'Gimnasio',
  description: 'Registro de entrenamientos, rutinas estructuradas y métricas de progreso físico.',
  category: 'Salud y Bienestar',
  iconName: 'Dumbbell',
  defaultStatus: 'available', // IMPORTANTE: Inicialmente disponible, NO instalado
  routes: [
    {
      path: '/gym',
      label: 'Gimnasio',
      iconName: 'Dumbbell',
      component: GymPage,
    },
  ],
  widgets: [
    {
      id: 'gym-workout-log',
      title: 'Entrenamiento & Rutinas',
      gridSpan: 'half',
      component: GymWidget,
    },
  ],
  permissions: ['storage:local', 'fitness:metrics'],
  optionalDependencies: [],
  version: '1.0.0',
};
