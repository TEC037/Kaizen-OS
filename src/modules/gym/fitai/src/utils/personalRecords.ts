import { LoggedSet, PersonalRecord, WorkoutSessionLog } from '../types';
import { formatIsoDate } from './format';

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/gi, '').trim();
}

function weightValue(value: string): number {
  const m = /^(\d+(?:\.\d+)?)\s*kg/.exec(value);
  return m ? Number(m[1]) : 0;
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Deriva los récords personales (mejor serie por ejercicio) desde el historial
 * de sesiones, fusionándolos con los récords previos que no aparecen en él.
 */
export function derivePersonalRecords(
  history: WorkoutSessionLog[],
  previous: PersonalRecord[]
): PersonalRecord[] {
  const bestByExercise = new Map<string, { set: LoggedSet; date: string }>();
  for (const session of history) {
    for (const set of session.completedSets) {
      const key = normalizeName(set.exerciseName);
      const current = bestByExercise.get(key);
      if (
        !current ||
        set.weightKg > current.set.weightKg ||
        (set.weightKg === current.set.weightKg && set.reps > current.set.reps)
      ) {
        bestByExercise.set(key, { set, date: session.date });
      }
    }
  }

  const previousByKey = new Map(previous.map((p) => [normalizeName(p.exerciseName), p]));
  const derived: PersonalRecord[] = [];

  for (const [key, { set, date }] of bestByExercise) {
    const prev = previousByKey.get(key);
    const prevWeight = prev ? weightValue(prev.recordValue) : 0;
    const improved = Boolean(prev && prevWeight > 0 && set.weightKg > prevWeight);
    derived.push({
      id: `pr_${key || 'ejercicio'}`,
      exerciseName: capitalize(set.exerciseName),
      recordValue: `${set.weightKg} kg (x${set.reps} reps)`,
      date: formatIsoDate(date),
      category: prev?.category ?? 'Récord',
      previousValue: improved ? prev?.recordValue ?? '' : '',
      progressPercent: improved
        ? Number(((set.weightKg / prevWeight - 1) * 100).toFixed(1))
        : 0,
      allometricScore: prev?.allometricScore,
      normalized70kgLoad: prev?.normalized70kgLoad,
    });
  }

  const consumed = new Set(bestByExercise.keys());
  for (const p of previous) {
    if (!consumed.has(normalizeName(p.exerciseName) || 'ejercicio')) {
      derived.push(p);
    }
  }

  return derived.sort(
    (a, b) =>
      weightValue(b.recordValue) - weightValue(a.recordValue) ||
      b.progressPercent - a.progressPercent ||
      a.exerciseName.localeCompare(b.exerciseName)
  );
}