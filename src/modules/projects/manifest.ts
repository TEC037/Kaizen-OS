/**
 * @file src/modules/projects/manifest.ts
 * @description Manifiesto declarativo del módulo de Proyectos para Kaizen OS.
 * FORJA: taller de proyectos con próxima acción, tablero por estados y
 * bitácora, 100% local.
 */

import { ModuleManifest } from '../../core/types';
import { lazy } from 'react';

// Carga diferida: el taller FORJA solo se descarga al habilitar el módulo.
const ProjectsPage = lazy(() => import('./ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectsWidget = lazy(() => import('./ProjectsWidget').then((m) => ({ default: m.ProjectsWidget })));

export const projectsManifest: ModuleManifest = {
  id: 'projects',
  name: 'FORJA',
  description:
    'Taller de proyectos: cada pieza requiere una próxima acción concreta. Tablero por estados, bitácora y avance Kaizen del 1%, en modo 100% local.',
  category: 'Productividad',
  iconName: 'Hammer',
  defaultStatus: 'enabled', // Inicialmente habilitado según la especificación
  routes: [
    {
      path: '/projects',
      label: 'FORJA',
      iconName: 'Hammer',
      component: ProjectsPage,
    },
  ],
  widgets: [
    {
      id: 'projects-next-actions',
      title: 'FORJA · Próximas Acciones',
      gridSpan: 'half',
      component: ProjectsWidget,
    },
  ],
  permissions: ['storage:local', 'tasks:manage'],
  optionalDependencies: [],
  version: '2.0.0',
  // Especificación declarativa (v2): los eventos con `points` alimentan el
  // scoring del shell automáticamente (Fase 5). Ningún código de FORJA otorga
  // puntos: solo emite el evento.
  spec: {
    theme: {
      accent: '#b45309', // Ámbar de la fragua
      bg: '#f4f2ec',
    },
    storage: {
      scope: 'forja',
      version: 1,
      defaults: {},
    },
    events: {
      emits: [
        {
          name: 'forja:project-created',
          description: 'Se estructura un nuevo proyecto en el taller',
          points: 15,
          reason: 'Estructurar nuevo proyecto en FORJA',
        },
        {
          name: 'forja:project-advanced',
          description: 'Un proyecto cambia de estado (En progreso / En revisión / Por iniciar)',
          points: 15,
          reason: 'Avance de estado en FORJA',
        },
        {
          name: 'forja:project-completed',
          description: 'Un proyecto del taller forjado por completo',
          points: 50,
          reason: 'Hito forjado: proyecto concluido',
        },
        {
          name: 'forja:next-action-done',
          description: 'Se completa la próxima acción concreta de un proyecto',
          points: 5,
          reason: 'Próxima acción completada en FORJA',
        },
      ],
      listens: [],
    },
    // Ajustes declarativos (Fase 6): el shell genera el formulario en
    // "Mis Módulos" a partir de este esquema.
    settings: [
      {
        id: 'metaProyectosActivos',
        label: 'Meta de proyectos activos',
        type: 'number',
        default: 3,
        help: 'Máximo de piezas en fragua por ciclo',
      },
      {
        id: 'bitacoraAutomatica',
        label: 'Bitácora automática al avanzar',
        type: 'boolean',
        default: true,
        help: 'Registra cada avance de estado en la bitácora',
      },
      {
        id: 'gamaFragua',
        label: 'Gama de la fragua',
        type: 'select',
        options: [
          { value: 'ambar', label: 'Ámbar' },
          { value: 'ceniza', label: 'Ceniza' },
          { value: 'verde', label: 'Verde' },
        ],
        default: 'ambar',
      },
    ],
  },
};