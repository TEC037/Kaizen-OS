export type TabType = 'ejercicios' | 'rutina' | 'entrenamiento' | 'ajustes';

export interface ExerciseSet {
  id: number;
  setNumber: number;
  weight: number;
  reps: number;
  targetReps?: number;
  completed: boolean;
  isActive?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string;
  pr?: string;
  sets: ExerciseSet[];
  notes?: string;
  videoUrl?: string;
  rpe?: number;
  /** SVG/GIF animado del dataset (Gym Visual). URL absoluta del CDN. */
  gifUrl?: string;
  /** Imagen estática del ejercicio (dataset). URL absoluta del CDN. */
  imageUrl?: string;
  /** Atribución obligatoria de la licencia del media. */
  attribution?: string;
}

export interface Routine {
  id: string;
  title: string;
  category: 'fuerza' | 'cardio' | 'ppl' | 'movilidad' | 'todos';
  difficulty: 'Baja' | 'Moderada' | 'Alta' | 'Extrema';
  tag: string;
  tagColor?: string;
  durationMinutes: number;
  exercisesCount: number;
  muscleIcons: string[];
  lastPerformed?: string;
  recordNote?: string;
  isFeatured?: boolean;
  description?: string;
  daysPerWeek?: number;
  imageUrl?: string;
  gifUrl?: string;
  /** Día real de la semana (1-7) al que pertenece en el motor. */
  dayNumber?: number;
}

export interface PersonalRecord {
  id: string;
  exercise: string;
  weight: number;
  unit: string;
  date: string;
  isRecent?: boolean;
  delta?: string;
  iconName: string;
}

export interface WeeklyVolume {
  week: string;
  tonnage: number;
  label: string;
  isPeak?: boolean;
}

/** Entrada de historial presentada en la UI (modal de historial / actividad reciente). */
export interface HistoryEntry {
  id: string;
  title: string;
  dateLabel: string;
  duration: string;
  calories: string;
  volume: string;
  tag?: string;
  icon: string;
  color: string;
}

/** Día del calendario mensual. */
export interface CalendarDay {
  day: number;
  active: boolean;
  isOtherMonth?: boolean;
  isCurrentDay?: boolean;
}

/** Perfil de usuario presentado en la UI (datos derivados del motor o seeds demo). */
export interface UiProfile {
  firstName: string;
  name: string;
  avatarUrl?: string;
  email: string;
  status: string;
  phase: string;
  currentStreakDays: number;
  weekDuration: string;
  weekGoalPercent: number;
  weight: number;
  weightDelta: number | null;
  bodyFatPercent: number | null;
  leanMassKg: number | null;
  monthlyTonnageKg: number;
  monthlySessions: number;
  monthlyTotalTime: string;
  monthlyAverageSession: string;
  monthName: string;
}

/** Próxima sesión sugerida para el banner de HoyScreen. */
export interface NextSession {
  title: string;
  durationLabel: string;
  exercisesCount: number;
  difficulty: string;
  focus: string;
  routineDay?: number;
}

export interface WeekScheduleDay {
  day: string;
  completed: boolean;
  isToday: boolean;
}
