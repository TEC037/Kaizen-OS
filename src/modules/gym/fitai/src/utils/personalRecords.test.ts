import { describe, it, expect } from 'vitest';
import { derivePersonalRecords } from './personalRecords';
import { PersonalRecord, WorkoutSessionLog } from '../types';

function session(id: string, date: string, sets: { name: string; weight: number; reps: number }[]): WorkoutSessionLog {
  return {
    id,
    date,
    routineName: 'Rutina Test',
    durationMinutes: 30,
    totalVolumeKg: 100,
    exercisesCompleted: sets.length,
    totalSets: sets.length,
    averageRpe: 8,
    caloriesBurned: 300,
    userObservations: '',
    aiCoachFeedback: '',
    completedSets: sets.map((s, i) => ({
      exerciseId: `ex_${s.name}`,
      exerciseName: s.name,
      setNumber: i + 1,
      weightKg: s.weight,
      reps: s.reps,
      rpe: 8,
      completedAt: '10:00',
    })),
  };
}

describe('derivePersonalRecords', () => {
  it('apunta la mejor serie por ejercicio y le da formato', () => {
    const history = [
      session('h1', '2026-09-01', [
        { name: 'press de banca', weight: 80, reps: 10 },
        { name: 'press de banca', weight: 82.5, reps: 8 },
      ]),
      session('h2', '2026-08-25', [{ name: 'press de banca', weight: 77.5, reps: 10 }]),
    ];

    const prs = derivePersonalRecords(history, []);

    expect(prs).toHaveLength(1);
    expect(prs[0].exerciseName).toBe('Press de banca');
    expect(prs[0].recordValue).toBe('82.5 kg (x8 reps)');
    expect(prs[0].date).toBe('01 sep 2026');
    expect(prs[0].progressPercent).toBe(0);
  });

  it('detecta mejora sobre un récord previo y calcula el progreso', () => {
    const prev: PersonalRecord[] = [
      {
        id: 'pr_press',
        exerciseName: 'Press de Banca',
        recordValue: '80 kg (x10 reps)',
        date: '10 Ago 2026',
        category: 'Pecho',
        previousValue: '78 kg',
        progressPercent: 2.5,
      },
    ];
    const history = [session('h1', '2026-09-05', [{ name: 'Press de Banca', weight: 84, reps: 5 }])];

    const prs = derivePersonalRecords(history, prev);

    expect(prs).toHaveLength(1);
    expect(prs[0].recordValue).toBe('84 kg (x5 reps)');
    expect(prs[0].previousValue).toBe('80 kg (x10 reps)');
    expect(prs[0].progressPercent).toBeCloseTo(5);
  });

  it('no marca mejora si el peso es menor y conserva los récords sin entrenar', () => {
    const prev: PersonalRecord[] = [
      {
        id: 'pr_squat',
        exerciseName: 'Sentadilla',
        recordValue: '120 kg (x5 reps)',
        date: '10 Ago 2026',
        category: 'Piernas',
        previousValue: '',
        progressPercent: 0,
      },
    ];
    const history = [session('h1', '2026-09-05', [{ name: 'Sentadilla', weight: 110, reps: 5 }])];

    const prs = derivePersonalRecords(history, prev);

    expect(prs).toHaveLength(1);
    expect(prs[0].recordValue).toBe('110 kg (x5 reps)');
    expect(prs[0].progressPercent).toBe(0);
  });

  it('conserva récords previos de ejercicios ausentes en el historial', () => {
    const prev: PersonalRecord[] = [
      {
        id: 'pr_row',
        exerciseName: 'Remo con Barra',
        recordValue: '70 kg (x10 reps)',
        date: '28 Ago 2026',
        category: 'Espalda',
        previousValue: '',
        progressPercent: 0,
      },
    ];
    const history = [session('h1', '2026-09-05', [{ name: 'Press de Banca', weight: 80, reps: 8 }])];

    const prs = derivePersonalRecords(history, prev);

    expect(prs).toHaveLength(2);
    expect(prs.map((p) => p.exerciseName)).toContain('Remo con Barra');
    expect(prs.find((p) => p.exerciseName === 'Remo con Barra')).toBe(prev[0]);
  });

  it('devuelve vacío sin historial ni récords previos', () => {
    expect(derivePersonalRecords([], [])).toEqual([]);
  });
});