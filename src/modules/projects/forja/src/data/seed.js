/**
 * @file forja/src/data/seed.js
 * @description Piezas de muestra con las que arranca el taller de FORJA
 * cuando no hay proyectos guardados (ni migrables desde el wireframe antiguo).
 */

export const seedProjects = [
  {
    id: 'pf-seed-1',
    title: 'FORJA: módulo de proyectos de Kaizen OS',
    description: 'Convertir el wireframe de Proyectos en un módulo real con tablero, próxima acción y bitácora.',
    nextAction: 'Verificar el tablero en el navegador y completar la primera próxima acción',
    dueDate: '',
    priority: 'Alta',
    status: 'En progreso',
    progressPercent: 50,
    nextActionDoneAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [
      { id: 'lg-seed-1', type: 'created', message: 'Pieza forjada en el taller', when: new Date().toISOString() },
    ],
  },
  {
    id: 'pf-seed-2',
    title: 'Migración a arquitectura modular',
    description: 'Desacoplar componentes del shell y crear registro de módulos dinámico.',
    nextAction: 'Revisar contratos de interfaz de widgets y aislamiento de rutas',
    dueDate: '',
    priority: 'Alta',
    status: 'En revisión',
    progressPercent: 85,
    nextActionDoneAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [
      { id: 'lg-seed-2', type: 'created', message: 'Pieza forjada en el taller', when: new Date().toISOString() },
    ],
  },
  {
    id: 'pf-seed-3',
    title: 'Organizar la estación de trabajo',
    description: 'Mejorar ergonomía y gestión de cables del espacio físico de trabajo.',
    nextAction: 'Medir distancia al monitor y pedir soporte ergonómico',
    dueDate: '',
    priority: 'Media',
    status: 'Por iniciar',
    progressPercent: 10,
    nextActionDoneAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    log: [
      { id: 'lg-seed-3', type: 'created', message: 'Pieza forjada en el taller', when: new Date().toISOString() },
    ],
  },
];