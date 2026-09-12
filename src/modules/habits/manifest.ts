/**
 * @file src/modules/habits/manifest.ts
 * @description Manifiesto declarativo del módulo de Hábitos para Kaizen OS.
 */

import { ModuleManifest } from '../../core/types';
import { HabitsPage } from './HabitsPage';
import { HabitsWidget } from './HabitsWidget';

export const habitsManifest: ModuleManifest = {
  id: 'habits',
  name: 'Hábitos',
  description: 'Seguimiento de hábitos diarios, checklist interactivo y progreso semanal.',
  category: 'Productividad',
  iconName: 'CheckSquare',
  defaultStatus: 'enabled', // Inicialmente habilitado según la especificación
  routes: [
    {
      path: '/habits',
      label: 'Hábitos',
      iconName: 'CheckSquare',
      component: HabitsPage,
    },
  ],
  widgets: [
    {
      id: 'habits-daily-checklist',
      title: 'Hábitos de Hoy',
      gridSpan: 'half',
      component: HabitsWidget,
    },
  ],
  permissions: ['storage:local', 'reminders:daily'],
  optionalDependencies: [],
  version: '1.0.0',
};
