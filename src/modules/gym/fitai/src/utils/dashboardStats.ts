import { PersonalRecord, WorkoutSessionLog } from '../types';

export interface WeeklyVolumeBucket {
  volumeKg: number;
  workouts: number;
}

export interface DashboardStats {
  latestWeekVolumeKg: number;
  weeklyVolumeTrendPercent: number | null;
  weeklyBuckets: WeeklyVolumeBucket[];
  weightDeltaKg: number | null;
  workoutsThisMonth: number;
  workoutsThisWeek: number;
  totalTrainingHours: number;
  averageSessionMinutes: number;
  latestPersonalRecord: PersonalRecord | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const DASHBOARD_WEEK_BUCKETS = 4;

const SPANISH_MONTHS: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(refDay: Date, sessionDay: Date): number | null {
  const ms = refDay.getTime() - sessionDay.getTime();
  if (ms < 0) return null;
  return Math.floor(ms / DAY_MS);
}

/**
 * Convierte una fecha ISO ('YYYY-MM-DD') a un Date local (medianoche local).
 */
export function parseIsoLocal(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Parsea fechas de PR en formato español ('15 Ago 2026') a epoch. NaN si no se reconoce.
 */
export function parseSpanishRecordDate(value: string): number {
  const match = /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]{3})\.?\s+(\d{4})$/.exec(value.trim());
  if (!match) return Number.NaN;
  const month = SPANISH_MONTHS[match[2].toLowerCase().slice(0, 3)];
  if (month === undefined) return Number.NaN;
  return new Date(Number(match[3]), month, Number(match[1])).getTime();
}

/**
 * Extrae el valor sin paréntesis de reps de un récord: '95 kg (x2 reps)' -> '95 kg'.
 */
export function stripReps(recordValue: string): string {
  return recordValue.replace(/\s*\([^)]*reps?\)\s*/i, '').trim();
}

function getLatestPersonalRecord(records: PersonalRecord[]): PersonalRecord | null {
  if (records.length === 0) return null;
  return [...records].sort(
    (a, b) => parseSpanishRecordDate(b.date) - parseSpanishRecordDate(a.date)
  )[0];
}

/**
 * Agrupa el historial en hasta DASHBOARD_WEEK_BUCKETS semanas (más antigua -> más reciente),
 * tomando como referencia la fecha indicada. Descarta sesiones más recientes que la referencia
 * y las anteriores a la ventana.
 */
export function getWeeklyVolumeBuckets(
  history: WorkoutSessionLog[],
  referenceDate: Date
): WeeklyVolumeBucket[] {
  const refDay = startOfDay(referenceDate);
  const buckets: WeeklyVolumeBucket[] = Array.from({ length: DASHBOARD_WEEK_BUCKETS }, () => ({
    volumeKg: 0,
    workouts: 0,
  }));

  for (const session of history) {
    const sessionDay = parseIsoLocal(session.date);
    if (!sessionDay) continue;
    const diff = dayDiff(refDay, sessionDay);
    if (diff === null || diff >= DASHBOARD_WEEK_BUCKETS * 7) continue;
    const weeksAgo = Math.min(Math.floor(diff / 7), DASHBOARD_WEEK_BUCKETS - 1);
    const index = DASHBOARD_WEEK_BUCKETS - 1 - weeksAgo;
    buckets[index].volumeKg += session.totalVolumeKg;
    buckets[index].workouts += 1;
  }

  return buckets;
}

/**
 * Deriva todos los KPIs del Dashboard desde datos reales (historial, pesos y récords),
 * en vez de valores hardcodeados.
 */
export function computeDashboardStats(
  history: WorkoutSessionLog[],
  weightHistory: { date: string; weight: number }[],
  personalRecords: PersonalRecord[],
  referenceDate: Date = new Date()
): DashboardStats {
  const weeklyBuckets = getWeeklyVolumeBuckets(history, referenceDate);

  const nonEmptyBuckets = weeklyBuckets.filter((bucket) => bucket.workouts > 0);
  const latest = nonEmptyBuckets[nonEmptyBuckets.length - 1] ?? weeklyBuckets[0];
  const previous = nonEmptyBuckets.length > 1 ? nonEmptyBuckets[nonEmptyBuckets.length - 2] : null;
  const weeklyVolumeTrendPercent =
    previous && previous.volumeKg > 0
      ? ((latest.volumeKg - previous.volumeKg) / previous.volumeKg) * 100
      : null;

  const weightDeltaKg =
    weightHistory.length >= 2
      ? weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight
      : null;

  const refDay = startOfDay(referenceDate);
  let workoutsThisMonth = 0;
  let workoutsThisWeek = 0;
  for (const session of history) {
    const sessionDay = parseIsoLocal(session.date);
    if (!sessionDay) continue;
    if (
      sessionDay.getFullYear() === refDay.getFullYear() &&
      sessionDay.getMonth() === refDay.getMonth()
    ) {
      workoutsThisMonth += 1;
    }
    const diff = dayDiff(refDay, sessionDay);
    if (diff !== null && diff < 7) {
      workoutsThisWeek += 1;
    }
  }

  const totalMinutes = history.reduce((sum, session) => sum + session.durationMinutes, 0);
  const totalTrainingHours = Number((totalMinutes / 60).toFixed(1));
  const averageSessionMinutes = history.length > 0 ? Math.round(totalMinutes / history.length) : 0;

  return {
    latestWeekVolumeKg: latest.volumeKg,
    weeklyVolumeTrendPercent,
    weeklyBuckets,
    weightDeltaKg,
    workoutsThisMonth,
    workoutsThisWeek,
    totalTrainingHours,
    averageSessionMinutes,
    latestPersonalRecord: getLatestPersonalRecord(personalRecords),
  };
}
