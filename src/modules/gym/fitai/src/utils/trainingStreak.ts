import { parseIsoLocal } from './dashboardStats';

export interface TrainingStreak {
  currentWeeks: number;
  longestWeeks: number;
}

/** Devuelve el inicio de semana (lunes, medianoche local) de una fecha. */
function weekStart(date: Date): Date {
  const start = new Date(date);
  const offset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** Clave de semana como 'YYYY-MM-DD' del lunes (inmune a DST). */
function weekKey(date: Date): string {
  const ws = weekStart(date);
  const y = ws.getFullYear();
  const m = String(ws.getMonth() + 1).padStart(2, '0');
  const d = String(ws.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Retrocede 7 días de forma inmune a DST (usa aritmética de fecha, no de ms). */
function previousWeekStart(monday: Date): Date {
  const prev = new Date(monday);
  prev.setDate(prev.getDate() - 7);
  prev.setHours(0, 0, 0, 0);
  return prev;
}

/**
 * Calcula la racha de constancia: semanas consecutivas (desde la semana de
 * `referenceDate` hacia atrás) con al menos una sesión, y la racha más larga
 * histórica. Descarta sesiones futuras respecto a la referencia.
 *
 * **Período de gracia:** si la semana actual no tiene sesiones pero la semana
 * anterior sí, la racha se cuenta desde la semana anterior (el usuario aún
 * no ha perdido su racha porque la semana no ha terminado).
 */
export function computeTrainingStreak(
  sessionDates: string[],
  referenceDate: Date = new Date()
): TrainingStreak {
  const weeks = new Set<string>();
  for (const date of sessionDates) {
    const parsed = parseIsoLocal(date);
    if (!parsed || parsed.getTime() > referenceDate.getTime()) continue;
    weeks.add(weekKey(parsed));
  }

  const refMonday = weekStart(referenceDate);
  const refKey = weekKey(refMonday);

  // Período de gracia: si la semana actual no tiene sesiones, iniciar
  // desde la semana anterior (la semana actual aún no terminó).
  let cursor: Date;
  if (weeks.has(refKey)) {
    cursor = new Date(refMonday);
  } else {
    cursor = previousWeekStart(refMonday);
  }

  let currentWeeks = 0;
  while (weeks.has(weekKey(cursor))) {
    currentWeeks += 1;
    cursor = previousWeekStart(cursor);
  }

  // Racha más larga histórica
  let longestRun = 0;
  let run = 0;
  let previousKey = '';
  const sorted = [...weeks].sort();
  for (const wk of sorted) {
    // Comprobar si es consecutiva: la semana anterior debería ser prevKey
    if (previousKey) {
      const prevDate = new Date(previousKey + 'T00:00:00');
      const expectedNext = weekKey(new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 7));
      run = wk === expectedNext ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longestRun) longestRun = run;
    previousKey = wk;
  }

  return { currentWeeks, longestWeeks: Math.max(longestRun, currentWeeks) };
}