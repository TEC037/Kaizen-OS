/**
 * @file src/modules/gym/manifest.ts
 * @description Manifiesto declarativo del módulo "Punto Fuerte" (FitAi) para Kaizen OS.
 * La aplicación completa vive en el submódulo Git `src/modules/gym/fitai`.
 * Por defecto está en estado 'available' (disponible para instalar).
 */

import { ModuleManifest } from '../../core/types';
import { GymPage } from './GymPage';
import { GymWidget } from './GymWidget';

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
};