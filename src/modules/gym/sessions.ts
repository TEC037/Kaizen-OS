/**
 * @file src/modules/gym/sessions.ts
 * @description Registro de sesiones de entrenamiento de Punto Fuerte para el
 * widget del Dashboard. En el flujo demo embebido (sin Supabase), FitAi no
 * persiste el historial desde la UI, así que Kaizen registra la sesión al
 * recibir el evento `punto-fuerte:workout-completed` (manejado en GymPage).
 */

import { WorkoutSessionLog } from './fitai/src/types';

export const KAIZEN_GYM_SESSIONS_KEY = 'kaizen_os_gym_sessions_v1';

export interface WorkoutSummary {
  durationSeconds?: number;
  volumeKg?: number;
  setsCompleted?: number;
}

export function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function buildSessionFromSummary(summary: WorkoutSummary): WorkoutSessionLog {
  const durationSeconds = typeof summary.durationSeconds === 'number' ? summary.durationSeconds : 0;
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
  return {
    id: `kaizen_${Date.now()}`,
    date: todayStamp(),
    routineName: 'Entrenamiento completado',
    durationMinutes,
    totalVolumeKg: typeof summary.volumeKg === 'number' ? summary.volumeKg : 0,
    exercisesCompleted: 0,
    totalSets: typeof summary.setsCompleted === 'number' ? summary.setsCompleted : 0,
    averageRpe: 0,
    caloriesBurned: Math.round((durationSeconds / 60) * 8.5),
    userObservations: '',
    aiCoachFeedback: '',
    completedSets: [],
  };
}

export function readKaizenSessions(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(KAIZEN_GYM_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkoutSessionLog[]) : [];
  } catch {
    return [];
  }
}

export function recordWorkoutSession(summary: WorkoutSummary): void {
  try {
    const session = buildSessionFromSummary(summary);
    const next = [session, ...readKaizenSessions()].slice(0, 12);
    localStorage.setItem(KAIZEN_GYM_SESSIONS_KEY, JSON.stringify(next));
  } catch {
    /* almacenamiento no disponible */
  }
}