export type ExperienceLevel = 'principiante' | 'intermedio' | 'avanzado';

export type FitnessGoal =
  'hipertrofia' | 'perdida_grasa' | 'fuerza' | 'resistencia' | 'condicion_general';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender?: string;
  height: number; // in cm
  weight: number; // in kg
  experience: ExperienceLevel;
  daysPerWeek: number;
  avgDuration: number; // minutes
  primaryGoal: FitnessGoal;
  targetMuscles: string[];
  equipment: string[];
  injuries: string;
  weeklyCompliance: number; // percentage (0-100)
  unitSystem: 'metric' | 'imperial';
  notifications: {
    workoutReminders: boolean;
    coachTips: boolean;
    restTimerSound: boolean;
  };
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  primaryMuscle: string;
  sets: number;
  reps: string;
  suggestedWeightKg: number;
  restSeconds: number;
  rpe: number; // 1 - 10
  technicalCue: string;
  fullInstructions: string[];
  commonMistakes: string[];
  equipment: string | string[];
  difficulty: ExperienceLevel;
  iconType: 'barbell' | 'dumbbell' | 'bodyweight' | 'cable' | 'machine';
  datasetId?: string;
  image?: string;
  gifUrl?: string;
  attribution?: string;
}

export interface DatasetExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  steps_es: string[];
  steps_en: string[];
  image: string;
  gif_url: string;
  attribution?: string;
}

export interface DailyRoutine {
  dayNumber: number;
  name: string;
  focus: string;
  description: string;
  estimatedMinutes: number;
  difficulty: ExperienceLevel;
  targetMuscles: string[];
  exercises: Exercise[];
  isRestDay?: boolean;
}

export interface LoggedSet {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number;
  sensation?: string;
  completedAt: string;
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  routineName: string;
  durationMinutes: number;
  totalVolumeKg: number;
  exercisesCompleted: number;
  totalSets: number;
  averageRpe: number;
  caloriesBurned: number;
  averageHeartRate?: number;
  peakHeartRate?: number;
  allometricPowerWatts?: number;
  allometricCalories?: number;
  userObservations: string;
  aiCoachFeedback: string;
  completedSets: LoggedSet[];
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  recordValue: string;
  date: string;
  category: string;
  previousValue: string;
  progressPercent: number;
  allometricScore?: number;
  normalized70kgLoad?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  category?: 'technique' | 'motivation' | 'nutrition' | 'adaptation';
  /** De dónde vino la respuesta del coach (UI: 'LLM' | 'servidor' | 'mot. local'). */
  source?: 'llm' | 'engine' | 'local';
  suggestedAction?: {
    label: string;
    screen: 'routine' | 'profile' | 'exercises';
  };
}

export type AppScreen =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'routine'
  | 'exercises'
  | 'profile';

/** Resultado genérico para operaciones que pueden fallar. */
export type Result<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
