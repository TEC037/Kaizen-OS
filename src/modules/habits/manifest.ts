/**
 * @file src/modules/habits/manifest.ts
 * @description Manifiesto declarativo del módulo TRANSMUTE para Kaizen OS.
 * TRANSMUTE: gestión de hábitos con narrativa alquímica y progresión RPG, 100% local.
 */

import { ModuleManifest } from '../../core/types';
import { lazy } from 'react';

// Carga diferida: TRANSMUTE solo se descarga al habilitar el módulo.
const HabitsPage = lazy(() => import('./HabitsPage').then((m) => ({ default: m.HabitsPage })));
const HabitsWidget = lazy(() => import('./HabitsWidget').then((m) => ({ default: m.HabitsWidget })));

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
  // Especificación declarativa (v2) + ajustes personalizables (Fase 6).
  spec: {
    theme: {
      accent: '#0f6b6b', // Verdigris alquímico
      bg: '#f4f2ec',
    },
    storage: {
      scope: 'habits',
      version: 1,
      defaults: {},
    },
    events: {
      emits: [
        {
          name: 'habits:toggled',
          description: 'Hábito individual transmutado en TRANSMUTE',
          points: 10,
          reason: 'Hábito transmutado en TRANSMUTE',
        },
        {
          name: 'habits:all-daily-done',
          description: 'Todos los hábitos diarios completados al 100% (Día Dorado)',
          points: 30,
          reason: 'Día Dorado: todos los hábitos completados',
        },
      ],
      listens: [
        {
          name: 'gym:session-completed',
          description: 'Sinergia: auto-marca hábito de entrenamiento al completar sesión',
        },
        {
          name: 'forja:next-action-done',
          description: 'Sinergia: auto-marca hábito de trabajo profundo al avanzar acción en FORJA',
        },
        {
          name: 'reading:session-finished',
          description: 'Sinergia: auto-marca hábito de lectura tras sesión',
        },
        {
          name: 'finance:expense-logged',
          description: 'Sinergia: auto-marca hábito financiero tras registro',
        },
      ],
    },
    settings: [
      {
        id: 'metasTransmutacion',
        label: 'Metas de transmutación diarias',
        type: 'number',
        default: 3,
        help: 'Hábitos a transmutar por día para mantener la Gran Obra',
      },
      {
        id: 'temaObscuro',
        label: 'Variante Nigredo (tema oscuro)',
        type: 'boolean',
        default: false,
        help: 'Activa la fase de putrefacción: interfaz en tonos oscuros',
      },
    ],
  },
};