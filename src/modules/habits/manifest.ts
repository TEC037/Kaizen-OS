/**
 * @file src/modules/habits/manifest.ts
 * @description Manifiesto declarativo del módulo TRANSMUTE para Kaizen OS.
 * TRANSMUTE: gestión de hábitos con narrativa alquímica y progresión RPG, 100% local.
 */

import { ModuleManifest } from '../../core/types';
import { HabitsPage } from './HabitsPage';
import { HabitsWidget } from './HabitsWidget';

export const habitsManifest: ModuleManifest = {
  id: 'habits',
  name: 'TRANSMUTE',
  description: 'Grand Obra de hábitos: forja disciplinas diarias con narrativa alquímica, rachas y progresión RPG, en modo 100% local.',
  category: 'Productividad',
  iconName: 'CheckSquare',
  defaultStatus: 'enabled',
  routes: [
    {
      path: '/habits',
      label: 'TRANSMUTE',
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
  version: '2.0.0',
};