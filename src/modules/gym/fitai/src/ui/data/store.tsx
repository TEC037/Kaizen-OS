import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useApp } from '../../context/useApp';
import { isSupabaseEnabled } from '../../lib/supabaseClient';
import {
  hydrateCustomRoutines,
  persistCustomRoutines,
  resetPassword,
} from '../../lib/supabaseService';
import { getExerciseGifUrl, getExerciseImageUrl } from '../../services/exerciseDatabaseService';
import type {
  UserProfile as RealUserProfile,
  DailyRoutine as RealDailyRoutine,
  Exercise as RealExercise,
  WorkoutSessionLog,
  PersonalRecord as RealPersonalRecord,
} from '../../types';
import type {
  Routine as UiRoutine,
  PersonalRecord as UiPersonalRecord,
  WeeklyVolume,
  Exercise as UiExercise,
  HistoryEntry,
  CalendarDay,
  UiProfile,
  NextSession,
  WeekScheduleDay,
} from '../types';
import {
  INITIAL_ROUTINES,
  ACTIVE_EXERCISES,
  PERSONAL_RECORDS,
} from './mockData';

const EXTRA_CALORIES_KEY = 'puntofuerte_extra_calories';
const CUSTOM_ROUTINES_KEY = 'puntofuerte_custom_routines';
const CUSTOM_ROUTINES_KEY_PREFIX = `${CUSTOM_ROUTINES_KEY}:`;

function customRoutinesKey(scope: string): string {
  return `${CUSTOM_ROUTINES_KEY_PREFIX}${scope}`;
}

// Lee rutinas custom del usuario actual con fallback a la clave global legada
// (pre-existente), para no perder datos durante la adopción del scope por usuario.
function readCustomRoutines(scope: string): UiRoutine[] {
  try {
    const keyed = localStorage.getItem(customRoutinesKey(scope));
    if (keyed) return JSON.parse(keyed) as UiRoutine[];
    const legacy = localStorage.getItem(CUSTOM_ROUTINES_KEY);
    if (legacy) return JSON.parse(legacy) as UiRoutine[];
    return [];
  } catch {
    return [];
  }
}

function writeCustomRoutines(scope: string, routines: UiRoutine[]): void {
  try {
    localStorage.setItem(customRoutinesKey(scope), JSON.stringify(routines));
  } catch {
    // almacenamiento no disponible: mantener en memoria
  }
}

export interface AuthFailure {
  error: string | null;
}

export interface UiDataContextType {
  // --- Modo / sesión ---
  isDemoMode: boolean;
  isHydrating: boolean;
  isAuthenticated: boolean;
  canUseEmailAuth: boolean;

  // --- Perfil ---
  profile: UiProfile;
  todayCalories: number;

  // --- Rutinas y ejercicios ---
  routines: UiRoutine[];
  activeExercises: UiExercise[];
  nextSession: NextSession | null;
  activeWorkoutTitle: string;

  // --- Progreso ---
  personalRecords: UiPersonalRecord[];
  weeklyVolumes: WeeklyVolume[];
  monthCalendarDays: CalendarDay[];

  // --- Historial ---
  history: HistoryEntry[];
  recentActivity: HistoryEntry[];
  weekSchedule: WeekScheduleDay[];

  // --- Acciones ---
  saveWeight: (weight: number) => void;
  addExtraCalories: (calories: number) => void;
  addCustomRoutine: (routine: UiRoutine) => void;
  updateCustomRoutine: (id: string, patch: Partial<UiRoutine>) => void;
  removeCustomRoutine: (id: string) => void;
  startWorkoutRoutine: (dayNumber?: number) => void;

  // --- Auth (passthrough del motor) ---
  loginDemo: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthFailure>;
  register: (email: string, password: string, name: string) => Promise<AuthFailure>;
  logoutUser: () => Promise<void>;
  resetDemo: () => void;
  requestPasswordReset: (email: string) => Promise<AuthFailure>;
}

const UiDataContext = createContext<UiDataContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers de fechas / formatos
// ---------------------------------------------------------------------------

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(stamp: string): Date {
  const [y, m, d] = stamp.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfWeek(day: Date): Date {
  const x = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dow = (x.getDay() + 6) % 7; // Lunes = 0
  x.setDate(x.getDate() - dow);
  return x;
}

function daysBetween(stamp: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stamp)) return -1;
  const target = parseDate(stamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - target.getTime()) / 86400000);
}

function relativeDateLabel(stamp: string): string {
  const diff = daysBetween(stamp);
  if (diff === -1) return stamp;
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return parseDate(stamp).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function formatDuration(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  principiante: 'Baja',
  intermedio: 'Moderada',
  avanzado: 'Alta',
};

const PHASE_LABEL: Record<string, string> = {
  hipertrofia: 'Fase Hipertrofia',
  fuerza: 'Fase Fuerza',
  perdida_grasa: 'Fase Pérdida de Grasa',
  resistencia: 'Fase Resistencia',
  condicion_general: 'Fase Acondicionamiento',
};

// ---------------------------------------------------------------------------
// Seeds de demostración (presentación)
// ---------------------------------------------------------------------------

const DEMO_NEXT_SESSION: NextSession = {
  title: 'Torso Potencia: Pecho & Espalda',
  durationLabel: '55 min',
  exercisesCount: 6,
  difficulty: 'Intermedio',
  focus: 'Fuerza & Pecho',
};

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const DEMO_ROUTINE_NAMES = [
  'Torso Potencia: Pecho & Espalda',
  'Empuje: Pecho & Tríceps',
  'Tracción & Espalda Fuerte',
  'Pierna & Glúteos',
  'Core & Acondicionamiento',
];

// Sesiones demo coherentes con "hoy": racha, tonelaje mensual y constancia
// semanal se derivan de esta fuente única.
function buildDemoSessions(): WorkoutSessionLog[] {
  const now = new Date();
  const sessions: WorkoutSessionLog[] = [];
  const seededRng = mulberry32(20260901);
  for (let d = 0; d < 34; d += 1) {
    // Entrenamos de forma consecutiva los últimos 5 días (racha viva) y luego
    // un patrón tipo día sí / día no hacia atrás.
    const dayAgo = d <= 4 || d % 2 === 0;
    if (!dayAgo) continue;
    const day = new Date(now);
    day.setDate(now.getDate() - d);
    const duration = 34 + Math.round(seededRng() * 26);
    const volume = 4200 + Math.round(seededRng() * 5200);
    const rpe = Math.round((7.2 + seededRng() * 1.4) * 10) / 10;
    sessions.push({
      id: `demo-s-${dateKey(day)}`,
      date: dateKey(day),
      routineName: DEMO_ROUTINE_NAMES[d % DEMO_ROUTINE_NAMES.length],
      durationMinutes: duration,
      totalVolumeKg: volume,
      exercisesCompleted: 4 + (d % 3),
      totalSets: 12 + (d % 6),
      averageRpe: rpe,
      caloriesBurned: Math.round(duration * 9.5),
      averageHeartRate: 142 + Math.round(seededRng() * 22),
      peakHeartRate: 168 + Math.round(seededRng() * 14),
      userObservations: 'Buenas sensaciones, técnica estable.',
      aiCoachFeedback: 'Mantén la sobrecarga progresiva en los ejercicios compuestos.',
      completedSets: [],
    });
  }
  return sessions;
}

function buildDemoWeightHistory(currentWeight: number): { date: string; weight: number }[] {
  const now = new Date();
  const points: { date: string; weight: number }[] = [];
  for (let i = 3; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i * 9);
    points.push({ date: dateKey(day), weight: Math.round((currentWeight + i * 0.4) * 10) / 10 });
  }
  return points;
}

// PRNG determinista para que la demo sea estable entre recargas.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Mappers: motor real → shapes de UI
// ---------------------------------------------------------------------------

function exerciseToUiExercise(ex: RealExercise): UiExercise {
  const targetReps = parseInt((ex.reps.match(/\d+/) ?? ['10'])[0], 10) || 10;
  const setCount = Math.max(1, ex.sets);
  const gifUrl = getExerciseGifUrl(ex.gifUrl);
  const imageUrl = getExerciseImageUrl(ex.image);
  return {
    id: ex.id,
    name: ex.name,
    targetMuscles: ex.targetMuscles.join(', '),
    gifUrl,
    imageUrl,
    attribution: ex.attribution,
    videoUrl: gifUrl,
    notes: ex.technicalCue,
    rpe: ex.rpe,
    sets: Array.from({ length: setCount }, (_, i) => ({
      id: i + 1,
      setNumber: i + 1,
      weight: ex.suggestedWeightKg,
      reps: targetReps,
      targetReps,
      completed: false,
      isActive: i === 0,
    })),
  };
}

function categoryOf(routine: RealDailyRoutine): UiRoutine['category'] {
  const t = `${routine.name} ${routine.focus}`.toLowerCase();
  if (
    t.includes('cardio') ||
    t.includes('hiit') ||
    t.includes('acond') ||
    t.includes('movilidad')
  ) {
    return 'cardio';
  }
  if (
    t.includes('empuje') ||
    t.includes('tracci') ||
    t.includes('tir') ||
    t.includes('push') ||
    t.includes('pull') ||
    t.includes('pierna') ||
    t.includes('tren inferior') ||
    t.includes('hombros')
  ) {
    return 'ppl';
  }
  if (t.includes('movil')) return 'movilidad';
  return 'fuerza';
}

const MUSCLE_ICONS: Record<string, string> = {
  pecho: 'fitness_center',
  pector: 'fitness_center',
  espalda: 'reorder',
  dorsal: 'reorder',
  tracci: 'reorder',
  pierna: 'directions_run',
  cuadric: 'directions_run',
  femoral: 'directions_run',
  triceps: 'sports_martial_arts',
  biceps: 'accessibility_new',
  hombro: 'shield',
  deltoide: 'shield',
  glu: 'downhill_skiing',
  core: 'hdr_strong',
  abdom: 'hdr_strong',
};

function iconsFor(targets: string[]): string[] {
  const out: string[] = [];
  for (const t of targets) {
    const lower = t.toLowerCase();
    const key = Object.keys(MUSCLE_ICONS).find((k) => lower.includes(k));
    if (key && !out.includes(MUSCLE_ICONS[key])) out.push(MUSCLE_ICONS[key]);
    if (out.length >= 2) break;
  }
  return out.length ? out : ['fitness_center', 'timer'];
}

function routinesToUiRoutines(routines: RealDailyRoutine[]): UiRoutine[] {
  return routines.map((r) => {
    const first = r.exercises[0];
    const gifUrl = getExerciseGifUrl(first?.gifUrl);
    const imageUrl = getExerciseImageUrl(first?.image);
    return {
      id: `day-${r.dayNumber}`,
      title: r.name,
      category: categoryOf(r),
      difficulty: (DIFFICULTY_LABEL[r.difficulty] ?? 'Moderada') as UiRoutine['difficulty'],
      tag: r.focus.toUpperCase(),
      durationMinutes: r.estimatedMinutes,
      exercisesCount: r.exercises.length,
      muscleIcons: iconsFor(r.targetMuscles),
      isFeatured: r.dayNumber === 1,
      description: r.description,
      dayNumber: r.dayNumber,
      imageUrl,
      gifUrl,
    };
  });
}

function recordsToUiRecords(records: RealPersonalRecord[]): UiPersonalRecord[] {
  const icons = ['fitness_center', 'downhill_skiing', 'vertical_align_top', 'upload', 'speed'];
  return records.map((r, i) => {
    const match = r.recordValue.match(/([\d.,]+)\s*(kg|lbs)/i);
    const diff = daysBetween(r.date);
    return {
      id: r.id,
      exercise: r.exerciseName,
      weight: match ? parseFloat(match[1].replace(',', '.')) : 0,
      unit: match?.[2]?.toLowerCase() ?? 'kg',
      date: relativeDateLabel(r.date),
      isRecent: diff !== -1 && diff >= 0 && diff <= 7,
      delta: r.progressPercent > 0 ? `+${r.progressPercent}%` : undefined,
      iconName: icons[i % icons.length],
    };
  });
}

function historyToEntries(history: WorkoutSessionLog[]): HistoryEntry[] {
  return history.map((s) => {
    const lower = s.routineName.toLowerCase();
    let icon = 'fitness_center';
    let color = '#c3f400';
    if (lower.includes('pierna') || lower.includes('tren inferior')) {
      icon = 'sports_gymnastics';
      color = '#4ae176';
    } else if (lower.includes('cardio') || lower.includes('hiit') || lower.includes('run')) {
      icon = 'directions_run';
      color = '#7bd0ff';
    }
    const tag =
      s.averageRpe >= 8.5
        ? `Esfuerzo ${s.averageRpe}`
        : s.totalVolumeKg > 10000
          ? 'Sobrecarga +5%'
          : 'Completado';
    return {
      id: s.id,
      title: s.routineName.replace(/\s*\(.*\)\s*$/, '').trim() || 'Entrenamiento',
      dateLabel: `${relativeDateLabel(s.date)} • ${s.durationMinutes} min`,
      duration: `${s.durationMinutes} min`,
      calories: `${s.caloriesBurned} kcal`,
      volume: `${(s.totalVolumeKg / 1000).toFixed(1).replace('.', ',')}k kg`,
      tag,
      icon,
      color,
    };
  });
}

function historyToWeeklyVolumes(history: WorkoutSessionLog[]): WeeklyVolume[] {
  const byWeek = new Map<string, number>();
  for (const s of history) {
    const dt = parseDate(s.date);
    byWeek.set(dateKey(startOfWeek(dt)), (byWeek.get(dateKey(startOfWeek(dt))) ?? 0) + s.totalVolumeKg);
  }
  const currentStart = startOfWeek(new Date());
  const weeks: WeeklyVolume[] = [];
  for (let i = 3; i >= 0; i -= 1) {
    const start = new Date(currentStart);
    start.setDate(start.getDate() - i * 7);
    const tonnage = byWeek.get(dateKey(start)) ?? 0;
    weeks.push({
      week: `S${4 - i}`,
      tonnage,
      label: i === 0 ? 'Semana Actual' : `Semana ${4 - i}`,
    });
  }
  const max = weeks.reduce((acc, w) => Math.max(acc, w.tonnage), 0);
  return weeks.map((w) => ({ ...w, isPeak: w.tonnage > 0 && w.tonnage === max }));
}

function historyToWeekSchedule(history: WorkoutSessionLog[]): WeekScheduleDay[] {
  const activeDates = new Set(history.map((h) => h.date));
  const now = new Date();
  const weekdayIndex = (now.getDay() + 6) % 7; // lunes = 0
  return DAY_LABELS.map((label, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - weekdayIndex + i);
    const key = dateKey(d);
    return {
      day: label,
      completed: activeDates.has(key),
      isToday: i === weekdayIndex,
    };
  });
}

function historyToCalendar(history: WorkoutSessionLog[]): CalendarDay[] {
  const activeDates = new Set(history.map((h) => h.date));
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const todayKey = dateKey(now);
  const items: CalendarDay[] = [];
  for (let i = firstDow - 1; i >= 0; i -= 1) {
    items.push({ day: prevMonthDays - i, active: false, isOtherMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    const key = dateKey(new Date(year, month, d));
    items.push({ day: d, active: activeDates.has(key), isCurrentDay: key === todayKey });
  }
  const trailing = 7 - (items.length % 7);
  if (trailing < 7) {
    for (let i = 1; i <= trailing; i += 1) {
      items.push({ day: i, active: false, isOtherMonth: true });
    }
  }
  return items;
}

function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  if (!set.has(dateKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dateKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function profilePhase(goal: RealUserProfile['primaryGoal']): string {
  return PHASE_LABEL[goal] ?? 'Fase Entrenamiento';
}

function buildUiProfile(
  user: RealUserProfile,
  history: WorkoutSessionLog[],
  weightHistory: { date: string; weight: number }[]
): UiProfile {
  const now = new Date();
  const monthStartKey = dateKey(new Date(now.getFullYear(), now.getMonth(), 1));
  const todayKey = dateKey(now);
  const monthSessions = history.filter((s) => s.date >= monthStartKey && s.date <= todayKey);
  const monthTonnage = monthSessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
  const monthMinutes = monthSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const weekStartKey = dateKey(startOfWeek(now));
  const weekMinutes = history
    .filter((s) => s.date >= weekStartKey && s.date <= todayKey)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const weightDelta =
    weightHistory.length >= 2
      ? Math.round((weightHistory[weightHistory.length - 1].weight - weightHistory[weightHistory.length - 2].weight) * 10) / 10
      : null;

  return {
    firstName: user.name.split(' ')[0] || user.name,
    name: user.name,
    email: user.email,
    status: 'Listo para entrenar',
    phase: profilePhase(user.primaryGoal),
    currentStreakDays: computeStreak(history.map((h) => h.date)),
    weekDuration: formatDuration(weekMinutes),
    weekGoalPercent: user.weeklyCompliance,
    weight: user.weight,
    weightDelta,
    bodyFatPercent: null,
    leanMassKg: null,
    monthlyTonnageKg: monthTonnage,
    monthlySessions: monthSessions.length,
    monthlyTotalTime: formatDuration(monthMinutes),
    monthlyAverageSession: formatDuration(monthSessions.length > 0 ? monthMinutes / monthSessions.length : 0),
    monthName: new Intl.DateTimeFormat('es', { month: 'long' }).format(now),
  };
}

function buildNextSession(routine: RealDailyRoutine | undefined): NextSession | null {
  if (!routine || routine.isRestDay) return null;
  return {
    title: routine.focus ? `${routine.name}: ${routine.focus}` : routine.name,
    durationLabel: `${routine.estimatedMinutes} min`,
    exercisesCount: routine.exercises.length,
    difficulty: DIFFICULTY_LABEL[routine.difficulty] ?? 'Moderada',
    focus: routine.focus,
    routineDay: routine.dayNumber,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const UiDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const app = useApp();

  const [extraCalories, setExtraCalories] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(EXTRA_CALORIES_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  const real = app.isAuthenticated && !app.isDemoUser;

  // El proveedor se remonta al cambiar de sesión (gate auth), así que el scope
  // de inicio es estable durante toda la vida del provider.
  const sessionScope = app.isAuthenticated
    ? app.isDemoUser
      ? 'demo'
      : `user:${app.user?.id ?? 'anon'}`
    : 'guest';

  const canSyncCustomRoutines = isSupabaseEnabled && real;
  const activeUserId = real ? app.user?.id ?? null : null;

  const [customRoutines, setCustomRoutines] = useState<UiRoutine[]>(() =>
    readCustomRoutines(sessionScope)
  );

  // Fuente de verdad en modo real: Supabase. La caché localStorage (por scope)
  // agiliza el arranque; al montar, se reconcilia con la nube.
  const routinesDirtyRef = useRef(false);
  useEffect(() => {
    if (!canSyncCustomRoutines || !activeUserId) return;
    let cancelled = false;
    void hydrateCustomRoutines(activeUserId).then((res) => {
      if (cancelled || !res.ok || routinesDirtyRef.current) return;
      const synced = (res.data ?? []) as unknown as UiRoutine[];
      if (synced.length > 0) setCustomRoutines(synced);
    });
    return () => {
      cancelled = true;
    };
  }, [canSyncCustomRoutines, activeUserId]);

  const demoSessionData = useMemo(() => buildDemoSessions(), []);
  const demoWeightHistory = useMemo(
    () => buildDemoWeightHistory(app.user?.weight ?? 78.2),
    [app.user?.weight]
  );

  const addExtraCalories = useCallback((calories: number) => {
    if (!calories) return;
    setExtraCalories((prev) => {
      const next = prev + calories;
      try {
        localStorage.setItem(EXTRA_CALORIES_KEY, String(next));
      } catch {
        // almacenamiento no disponible: mantener en memoria
      }
      return next;
    });
  }, []);

  const saveWeight = useCallback(
    (weight: number) => {
      if (real) {
        app.updateUserProfile({ weight });
      }
    },
    [real, app]
  );

  const addCustomRoutine = useCallback(
    (routine: UiRoutine) => {
      const next = [routine, ...customRoutines];
      routinesDirtyRef.current = true;
      setCustomRoutines(next);
      writeCustomRoutines(sessionScope, next);

      if (canSyncCustomRoutines && activeUserId) {
        void persistCustomRoutines(activeUserId, next as unknown as Record<string, unknown>[]);
      }
    },
    [customRoutines, canSyncCustomRoutines, activeUserId, sessionScope]
  );

  const updateCustomRoutine = useCallback(
    (id: string, patch: Partial<UiRoutine>) => {
      setCustomRoutines((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...r, ...patch, id } : r));
        routinesDirtyRef.current = true;
        writeCustomRoutines(sessionScope, next);
        if (canSyncCustomRoutines && activeUserId) {
          void persistCustomRoutines(activeUserId, next as unknown as Record<string, unknown>[]);
        }
        return next;
      });
    },
    [canSyncCustomRoutines, activeUserId, sessionScope]
  );

  const removeCustomRoutine = useCallback(
    (id: string) => {
      setCustomRoutines((prev) => {
        if (!prev.some((r) => r.id === id)) return prev;
        const next = prev.filter((r) => r.id !== id);
        routinesDirtyRef.current = true;
        writeCustomRoutines(sessionScope, next);
        if (canSyncCustomRoutines && activeUserId) {
          void persistCustomRoutines(activeUserId, next as unknown as Record<string, unknown>[]);
        }
        return next;
      });
    },
    [canSyncCustomRoutines, activeUserId, sessionScope]
  );

  const startWorkoutRoutine = useCallback(
    (dayNumber?: number) => {
      if (real) app.startWorkout(dayNumber);
    },
    [real, app]
  );

  // --- Valor derivado del motor (modo real) o seeds (demo) ---
  const value = useMemo<UiDataContextType>(() => {
    // --- Perfil ---
    const profile = real
      ? buildUiProfile(app.user, app.history, app.weightHistory)
      : buildUiProfile(app.user, demoSessionData, demoWeightHistory);

    // --- Calorías de hoy: sesiones de hoy + acumulador rápido ---
    const todayKey = dateKey(new Date());
    const sessionsToday = (real ? app.history : demoSessionData).filter(
      (h) => h.date === todayKey
    );
    const burnedToday = sessionsToday.reduce((acc, h) => acc + h.caloriesBurned, 0);
    const todayCalories = burnedToday + extraCalories;

    // --- Rutinas ---
    const engineRoutines = real ? routinesToUiRoutines(app.routines) : INITIAL_ROUTINES;
    const routines = [...customRoutines, ...engineRoutines];

    // --- Próxima sesión / ejercicios activos ---
    const activeRoutine =
      (real ? app.activeRoutine : null) ??
      (real ? app.routines.find((r) => r.dayNumber === app.selectedDay) ?? app.routines[0] : undefined);
    const nextSession = real ? buildNextSession(activeRoutine) : DEMO_NEXT_SESSION;
    const activeExercises = real
      ? activeRoutine?.exercises.map(exerciseToUiExercise) ?? []
      : ACTIVE_EXERCISES;

    const personalRecords = real
      ? recordsToUiRecords(app.personalRecords)
      : PERSONAL_RECORDS;
    const weeklyVolumes = real
      ? historyToWeeklyVolumes(app.history)
      : historyToWeeklyVolumes(demoSessionData);
    const monthCalendarDays = real
      ? historyToCalendar(app.history)
      : historyToCalendar(demoSessionData);
    const history = real
      ? historyToEntries(app.history)
      : historyToEntries(demoSessionData);
    const recentActivity = history.slice(0, 2);
    const weekSchedule = real
      ? historyToWeekSchedule(app.history)
      : historyToWeekSchedule(demoSessionData);

    return {
      isDemoMode: !real,
      isHydrating: app.isHydrating,
      isAuthenticated: app.isAuthenticated,
      canUseEmailAuth: isSupabaseEnabled,
      profile,
      todayCalories,
      routines,
      activeExercises,
      nextSession,
      activeWorkoutTitle: activeRoutine?.name ?? 'Torso Potencia',
      personalRecords,
      weeklyVolumes,
      monthCalendarDays,
      history,
      recentActivity,
      weekSchedule,
      saveWeight,
      addExtraCalories,
      addCustomRoutine,
      updateCustomRoutine,
      removeCustomRoutine,
      startWorkoutRoutine,
      loginDemo: app.loginDemoUser,
      login: app.loginWithEmail,
      register: app.registerWithEmail,
      logoutUser: app.logout,
      resetDemo: app.resetToDemoData,
      requestPasswordReset: async (email: string): Promise<AuthFailure> => {
        if (!isSupabaseEnabled) {
          return { error: 'La recuperación requiere Supabase configurado. Usa la demo.' };
        }
        const result = await resetPassword(email);
        return { error: result.error };
      },
    };
  }, [
    real,
    app,
    extraCalories,
    customRoutines,
    demoSessionData,
    demoWeightHistory,
    saveWeight,
    addExtraCalories,
    addCustomRoutine,
    updateCustomRoutine,
    removeCustomRoutine,
    startWorkoutRoutine,
  ]);

  return <UiDataContext.Provider value={value}>{children}</UiDataContext.Provider>;
};

export const useUiData = (): UiDataContextType => {
  const context = useContext(UiDataContext);
  if (!context) {
    throw new Error('useUiData must be used within a UiDataProvider');
  }
  return context;
};