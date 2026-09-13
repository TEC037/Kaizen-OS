import { Routine, PersonalRecord, WeeklyVolume, Exercise } from '../types';

const FITAI_USER_STORAGE_KEY = 'fitai_user_v2';

/**
 * Conecta con los datos persistidos de FitAI (Punto Fuerte): si existe un perfil
 * de usuario guardado bajo la clave legacy, usa su nombre y peso; si no, cae al
 * perfil por defecto del demo.
 */
function readFitaiUserProfile(): Partial<{ name: string; weight: number }> | null {
  try {
    const raw = localStorage.getItem(FITAI_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: unknown; weight?: unknown };
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      weight: typeof parsed.weight === 'number' ? parsed.weight : undefined,
    };
  } catch {
    return null;
  }
}

const fitaiUser = readFitaiUserProfile();

export const USER_PROFILE = {
  name: fitaiUser?.name ? fitaiUser.name.split(' ')[0] : 'Atleta',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPpN59-1Yeayz7bwY1P0HAI0ScIdzTU4QNmzL1emPq81gn_fHpqo6Ki_fvQB2s7BjhMFJ4sibMM2Q-5PfRCpDrF3hkrLRs9KDYURnkrirORWUc533Y8Y1YpKGAU7COzcgiCeduP7b1PkU14tijQRsxgKU3cj9f3u6HYt_FRMELSzXGBXgwvpJlIaRzjBjxpxVr_suPbHumLMWY_6mZekDa3w21I7IrZyi9wG0Kr0oJHYxB0uvM2WESTg',
  status: 'Listo para entrenar',
  phase: 'Fase Hipertrofia',
  currentStreakDays: 12,
  todayCalories: 540,
  weekDuration: '4h 15m',
  weekGoalPercent: 88,
  weight: fitaiUser?.weight ?? 76.4,
  weightDelta: -1.2,
  bodyFatPercent: 13.8,
  bodyFatDelta: -0.6,
  leanMassKg: 64.2,
  leanMassDelta: 0.3,
  monthlyTonnageKg: 18420,
  monthlyTonnageDeltaPercent: 8.4,
  monthlySessions: 16,
  monthlyTotalTime: '14h 32m',
  monthlyAverageSession: '54m / entreno',
  activeDaysInMonth: 16,
  targetDaysInMonth: 20,
  monthName: 'Octubre',
};

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'push-1',
    title: 'Push - Pecho, Hombro, Tríceps',
    category: 'fuerza',
    difficulty: 'Alta',
    tag: 'FUERZA',
    tagColor: 'primary',
    durationMinutes: 50,
    exercisesCount: 6,
    muscleIcons: ['shield', 'sports_martial_arts', 'accessibility_new'],
    lastPerformed: 'hace 2 días',
    description: 'Enfoque en empuje horizontal y vertical con trabajo analítico de tríceps.',
  },
  {
    id: 'pull-1',
    title: 'Pull - Espalda, Deltoides Post, Bíceps',
    category: 'fuerza',
    difficulty: 'Alta',
    tag: 'HIPERTROFIA',
    tagColor: 'tertiary',
    durationMinutes: 55,
    exercisesCount: 6,
    muscleIcons: ['expand', 'reorder', 'sports_mma'],
    lastPerformed: 'Próxima en cola',
    description: 'Densidad y amplitud de espalda alta con tirón vertical pesado y curl concentrado.',
  },
  {
    id: 'legs-1',
    title: 'Legs - Cuádriceps & Femoral Enfocado',
    category: 'fuerza',
    difficulty: 'Extrema',
    tag: 'VOLUMEN',
    tagColor: 'accent',
    durationMinutes: 60,
    exercisesCount: 5,
    muscleIcons: ['directions_run', 'downhill_skiing', 'skateboarding'],
    recordNote: 'Récord previo: 140kg Prensa',
    description: 'Gran estímulo en cuádriceps en sentadilla hack seguido de bisagra de cadera profunda.',
  },
  {
    id: 'fullbody-1',
    title: 'Full Body Acondicionamiento & Core',
    category: 'cardio',
    difficulty: 'Moderada',
    tag: 'FUNCIONAL',
    tagColor: 'secondary',
    durationMinutes: 40,
    exercisesCount: 7,
    muscleIcons: ['hdr_strong', 'electric_bolt', 'favorite'],
    lastPerformed: 'Ideal para descarga activa',
    description: 'Intervalos metabólicos con peso corporal y kettlebells para potenciar resistencia y tronco.',
  },
  {
    id: 'ppl-featured',
    title: 'Hipertrofia Avanzada 4 Días',
    category: 'ppl',
    difficulty: 'Alta',
    tag: 'MÁS POPULAR',
    durationMinutes: 60,
    exercisesCount: 6,
    daysPerWeek: 4,
    muscleIcons: ['fitness_center', 'timer', 'calendar_month'],
    isFeatured: true,
    description: 'Plan estructurado en bloques de sobrecarga progresiva y congestión metabólica.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBBhroT9yGD5MVdzHxZYev9OBKeHu6aWxzeqqJG-8d5whs8zV1s8rOZaz_aXjfSnidr_LnsFbB6c_LK1hnHZHZ2qamycMeOxODfaj63fY9ALBcLrkRSYdVSCBHSvOtIz4Du5vZAFNDQtLBVckrzZ_kbvUHLY4-FKGsKW7ihGZs0jCmS1Sn852EO9Yk3i5sg0ApbqS9PLFsxAwklKls71I-MfHI4auXB2zQwgieGXjp1oWUdKvtni8HCg',
  },
];

export const ACTIVE_EXERCISES: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Press de Banca con Barra',
    targetMuscles: 'Pecho, Tríceps, Deltoides Anterior',
    pr: 'Récord 95kg',
    rpe: 8.5,
    gifUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0025-EIeI8Vf.gif',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/images/0025-EIeI8Vf.jpg',
    attribution: '© Gym visual — https://gymvisual.com/',
    sets: [
      { id: 1, setNumber: 1, weight: 60, reps: 12, completed: true },
      { id: 2, setNumber: 2, weight: 75, reps: 10, completed: true },
      { id: 3, setNumber: 3, weight: 82.5, reps: 8, targetReps: 8, completed: false, isActive: true },
      { id: 4, setNumber: 4, weight: 85, reps: 6, completed: false },
    ],
  },
  {
    id: 'pullups-weighted',
    name: 'Dominadas con Lastre',
    targetMuscles: 'Dorsal, Bíceps',
    pr: 'Récord +25kg',
    rpe: 8.0,
    gifUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0841-HMzLjXx.gif',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/images/0841-HMzLjXx.jpg',
    attribution: '© Gym visual — https://gymvisual.com/',
    sets: [
      { id: 1, setNumber: 1, weight: 10, reps: 8, completed: false, isActive: true },
      { id: 2, setNumber: 2, weight: 15, reps: 6, completed: false },
      { id: 3, setNumber: 3, weight: 15, reps: 6, completed: false },
      { id: 4, setNumber: 4, weight: 20, reps: 5, completed: false },
    ],
  },
  {
    id: 'incline-db-press',
    name: 'Press Inclinado con Mancuernas',
    targetMuscles: 'Pecho Superior',
    pr: 'Récord 36kg/lado',
    rpe: 8.5,
    gifUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0314-ns0SIbU.gif',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/images/0314-ns0SIbU.jpg',
    attribution: '© Gym visual — https://gymvisual.com/',
    sets: [
      { id: 1, setNumber: 1, weight: 30, reps: 10, completed: false, isActive: true },
      { id: 2, setNumber: 2, weight: 34, reps: 8, completed: false },
      { id: 3, setNumber: 3, weight: 34, reps: 8, completed: false },
    ],
  },
  {
    id: 't-bar-row',
    name: 'Remo con Barra T',
    targetMuscles: 'Espalda Media',
    pr: 'Récord 70kg',
    rpe: 8.0,
    gifUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/videos/0027-eZyBC3j.gif',
    imageUrl:
      'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/images/0027-eZyBC3j.jpg',
    attribution: '© Gym visual — https://gymvisual.com/',
    sets: [
      { id: 1, setNumber: 1, weight: 50, reps: 12, completed: false, isActive: true },
      { id: 2, setNumber: 2, weight: 60, reps: 10, completed: false },
      { id: 3, setNumber: 3, weight: 65, reps: 8, completed: false },
      { id: 4, setNumber: 4, weight: 70, reps: 8, completed: false },
    ],
  },
];

export const PERSONAL_RECORDS: PersonalRecord[] = [
  {
    id: 'pr-1',
    exercise: 'Press de Banca',
    weight: 105,
    unit: 'kg',
    date: 'hace 4 días',
    isRecent: true,
    delta: '+2.5 kg',
    iconName: 'fitness_center',
  },
  {
    id: 'pr-2',
    exercise: 'Sentadilla Profunda',
    weight: 140,
    unit: 'kg',
    date: 'hace 2 semanas',
    iconName: 'downhill_skiing',
  },
  {
    id: 'pr-3',
    exercise: 'Peso Muerto Convencional',
    weight: 175,
    unit: 'kg',
    date: 'hace 1 mes',
    iconName: 'vertical_align_top',
  },
  {
    id: 'pr-4',
    exercise: 'Press Militar',
    weight: 65,
    unit: 'kg',
    date: 'hace 3 semanas',
    iconName: 'upload',
  },
];

export const WEEKLY_VOLUMES: WeeklyVolume[] = [
  { week: 'S1', tonnage: 3850, label: 'Semana 01' },
  { week: 'S2', tonnage: 4210, label: 'Semana 02' },
  { week: 'S3', tonnage: 5640, label: 'Semana 03 (Pico Máximo)', isPeak: true },
  { week: 'S4', tonnage: 4720, label: 'Semana 04' },
];

export const CALENDAR_OCTOBER_DAYS = [
  { day: 29, active: false, isOtherMonth: true },
  { day: 30, active: false, isOtherMonth: true },
  { day: 1, active: true },
  { day: 2, active: true },
  { day: 3, active: false },
  { day: 4, active: true },
  { day: 5, active: false },
  { day: 6, active: true },
  { day: 7, active: true },
  { day: 8, active: false },
  { day: 9, active: true },
  { day: 10, active: true },
  { day: 11, active: false },
  { day: 12, active: false },
  { day: 13, active: true },
  { day: 14, active: true },
  { day: 15, active: true },
  { day: 16, active: false },
  { day: 17, active: true },
  { day: 18, active: true },
  { day: 19, active: false },
  { day: 20, active: true },
  { day: 21, active: true },
  { day: 22, active: true, isCurrentDay: true },
  { day: 23, active: false },
  { day: 24, active: false },
  { day: 25, active: false },
  { day: 26, active: false },
];
