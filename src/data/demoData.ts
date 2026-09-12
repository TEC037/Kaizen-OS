/**
 * @file src/data/demoData.ts
 * @description Datos iniciales de demostración simulados para los módulos de Kaizen OS.
 * No utiliza APIs externas ni bases de datos reales.
 */

export interface HabitItem {
  id: string;
  name: string;
  category: string;
  targetFrequency: string;
  completedToday: boolean;
  weeklyProgress: boolean[]; // L, M, X, J, V, S, D
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  status: 'Por iniciar' | 'En progreso' | 'En revisión' | 'Completado';
  nextAction: string;
  progressPercent: number;
  priority: 'Alta' | 'Media' | 'Baja';
  dueDate: string;
}

export interface WorkoutLogItem {
  id: string;
  routineName: string;
  date: string;
  durationMinutes: number;
  exercisesCount: number;
  intensity: 'Alta' | 'Media' | 'Moderada';
  notes: string;
}

export interface GymRoutineItem {
  id: string;
  name: string;
  targetFocus: string;
  daysPerWeek: number;
  exercises: string[];
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  status: 'en_progreso' | 'pendiente' | 'terminado';
  currentPage: number;
  totalPages: number;
  rating?: number;
}

export interface ExpenseCategoryItem {
  id: string;
  category: string;
  spent: number;
  allocated: number;
}

export interface FinancialGoalItem {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  deadline: string;
}

export const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'h-1',
    name: 'Beber 2.5 litros de agua',
    category: 'Salud',
    targetFrequency: 'Diario',
    completedToday: true,
    weeklyProgress: [true, true, true, true, false, false, false],
  },
  {
    id: 'h-2',
    name: 'Sesión de meditación / respiración (10 min)',
    category: 'Mente',
    targetFrequency: 'Diario',
    completedToday: true,
    weeklyProgress: [true, true, false, true, true, false, false],
  },
  {
    id: 'h-3',
    name: 'Caminar 8.000 pasos activos',
    category: 'Movimiento',
    targetFrequency: 'Diario',
    completedToday: false,
    weeklyProgress: [true, true, true, false, false, false, false],
  },
  {
    id: 'h-4',
    name: 'Planificar el día siguiente al cerrar jornada',
    category: 'Productividad',
    targetFrequency: 'Lun - Vie',
    completedToday: false,
    weeklyProgress: [true, true, true, true, false, false, false],
  },
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'p-1',
    title: 'Migración a arquitectura modular',
    description: 'Desacoplar componentes del shell y crear registro de módulos dinámico.',
    status: 'En progreso',
    nextAction: 'Revisar contratos de interfaz de widgets y aislamiento de rutas',
    progressPercent: 75,
    priority: 'Alta',
    dueDate: '2026-09-20',
  },
  {
    id: 'p-2',
    title: 'Rediseño del espacio de trabajo personal',
    description: 'Organizar estación física con gestión de cables y mejor ergonomía.',
    status: 'Por iniciar',
    nextAction: 'Medir distancia al monitor y pedir soporte ergonómico',
    progressPercent: 15,
    priority: 'Media',
    dueDate: '2026-09-30',
  },
  {
    id: 'p-3',
    title: 'Estudio de sistemas Kaizen y Lean',
    description: 'Sintetizar principios de mejora continua aplicados a desarrollo de software.',
    status: 'En revisión',
    nextAction: 'Escribir resumen de 1 página sobre los 5 pilares de Kaizen',
    progressPercent: 90,
    priority: 'Media',
    dueDate: '2026-09-18',
  },
];

export const INITIAL_GYM_ROUTINES: GymRoutineItem[] = [
  {
    id: 'gr-1',
    name: 'Torso / Fuerza funcional',
    targetFocus: 'Pecho, Espalda, Deltoides',
    daysPerWeek: 3,
    exercises: ['Press banca plano 4x8', 'Dominadas con peso 4x6', 'Press militar con mancuernas 3x10', 'Remo con barra 4x8'],
  },
  {
    id: 'gr-2',
    name: 'Pierna / Cadena posterior',
    targetFocus: 'Cuádriceps, Isquiotibiales, Glúteos',
    daysPerWeek: 2,
    exercises: ['Sentadilla trasera 4x6', 'Peso muerto rumano 3x8', 'Prensa inclinada 3x12', 'Elevación de talones 4x15'],
  },
];

export const INITIAL_WORKOUT_LOGS: WorkoutLogItem[] = [
  {
    id: 'wl-1',
    routineName: 'Torso / Fuerza funcional',
    date: 'Ayer',
    durationMinutes: 55,
    exercisesCount: 5,
    intensity: 'Alta',
    notes: 'Incremento de 2.5kg en press banca sin pérdida de técnica.',
  },
  {
    id: 'wl-2',
    routineName: 'Pierna / Cadena posterior',
    date: 'Hace 3 días',
    durationMinutes: 60,
    exercisesCount: 4,
    intensity: 'Alta',
    notes: 'Excelente cadencia en peso muerto rumano.',
  },
  {
    id: 'wl-3',
    routineName: 'Movilidad & Zona Media',
    date: 'Hace 5 días',
    durationMinutes: 30,
    exercisesCount: 3,
    intensity: 'Moderada',
    notes: 'Trabajo compensatorio de cadera y escápulas.',
  },
];

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'b-1',
    title: 'Hábitos Atómicos',
    author: 'James Clear',
    status: 'en_progreso',
    currentPage: 164,
    totalPages: 320,
    rating: 5,
  },
  {
    id: 'b-2',
    title: 'Deep Work: Reglas para el éxito enfocado',
    author: 'Cal Newport',
    status: 'en_progreso',
    currentPage: 88,
    totalPages: 288,
    rating: 5,
  },
  {
    id: 'b-3',
    title: 'El Método Kaizen: Un pequeño paso puede cambiar tu vida',
    author: 'Robert Maurer',
    status: 'pendiente',
    currentPage: 0,
    totalPages: 240,
  },
  {
    id: 'b-4',
    title: 'El obstáculo es el camino',
    author: 'Ryan Holiday',
    status: 'terminado',
    currentPage: 220,
    totalPages: 220,
    rating: 4,
  },
];

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategoryItem[] = [
  { id: 'c-1', category: 'Vivienda y Servicios', spent: 650, allocated: 700 },
  { id: 'c-2', category: 'Alimentación saludable', spent: 340, allocated: 400 },
  { id: 'c-3', category: 'Transporte y Movilidad', spent: 90, allocated: 120 },
  { id: 'c-4', category: 'Formación y Libros', spent: 65, allocated: 100 },
  { id: 'c-5', category: 'Ocio y Desconexión', spent: 110, allocated: 150 },
];

export const INITIAL_FINANCIAL_GOALS: FinancialGoalItem[] = [
  {
    id: 'fg-1',
    title: 'Fondo de tranquilidad (6 meses)',
    currentAmount: 4800,
    targetAmount: 6000,
    deadline: 'Dic 2026',
  },
  {
    id: 'fg-2',
    title: 'Actualización equipamiento de trabajo',
    currentAmount: 750,
    targetAmount: 1200,
    deadline: 'Nov 2026',
  },
];
