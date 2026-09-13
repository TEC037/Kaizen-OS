import { describe, it, expect } from 'vitest';
import { WorkoutSessionLog, PersonalRecord } from '../types';
import {
  computeDashboardStats,
  getWeeklyVolumeBuckets,
  parseIsoLocal,
  parseSpanishRecordDate,
  stripReps,
} from './dashboardStats';

const baseSession = (
  id: string,
  date: string,
  extra: Partial<WorkoutSessionLog> = {}
): WorkoutSessionLog => ({
  id,
  date,
  routineName: 'Rutina',
  durationMinutes: 60,
  totalVolumeKg: 1000,
  exercisesCompleted: 5,
  totalSets: 15,
  averageRpe: 8,
  caloriesBurned: 400,
  userObservations: '',
  aiCoachFeedback: '',
  completedSets: [],
  ...extra,
});

const baseRecord = (id: string, date: string): PersonalRecord => ({
  id,
  exerciseName: 'Press de Banca Plano',
  recordValue: '95 kg (x2 reps)',
  date,
  category: 'Pecho',
  previousValue: '92.5 kg',
  progressPercent: 2.7,
});

describe('parseIsoLocal', () => {
  it('acepta fechas ISO validas como medialocal', () => {
    const parsed = parseIsoLocal('2026-09-02');
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(2);
  });

  it('devuelve null ante formatos invalidos', () => {
    expect(parseIsoLocal('02 Sep 2026')).toBeNull();
    expect(parseIsoLocal('not-a-date')).toBeNull();
  });
});

describe('parseSpanishRecordDate', () => {
  it('parsea fechas espanolas mes abreviado a epoch', () => {
    expect(parseSpanishRecordDate('28 Ago 2026')).toBe(new Date(2026, 7, 28).getTime());
    expect(parseSpanishRecordDate('15 Ene 2026')).toBe(new Date(2026, 0, 15).getTime());
  });

  it('devuelve NaN para fechas desconocidas', () => {
    expect(Number.isNaN(parseSpanishRecordDate('15 Xxx 2026'))).toBe(true);
    expect(Number.isNaN(parseSpanishRecordDate('cualquier cosa'))).toBe(true);
  });
});

describe('stripReps', () => {
  it('elimina el entre parentesis de reps', () => {
    expect(stripReps('95 kg (x2 reps)')).toBe('95 kg');
    expect(stripReps('130 kg (x1 rep)')).toBe('130 kg');
    expect(stripReps('26 kg c/u (x6 reps)')).toBe('26 kg c/u');
  });
});

describe('getWeeklyVolumeBuckets', () => {
  it('agrupa por semana antigua->reciente respecto a la referencia', () => {
    const ref = new Date(2026, 8, 6);
    const buckets = getWeeklyVolumeBuckets(
      [
        baseSession('a', '2026-09-02', { totalVolumeKg: 12000 }),
        baseSession('b', '2026-08-31', { totalVolumeKg: 13000 }),
        baseSession('c', '2026-08-28', { totalVolumeKg: 14000 }),
        baseSession('d', '2026-08-25', { totalVolumeKg: 9000 }),
      ],
      ref
    );
    expect(buckets.map((b) => b.volumeKg)).toEqual([0, 0, 23000, 25000]);
    expect(buckets.map((b) => b.workouts)).toEqual([0, 0, 2, 2]);
  });

  it('descarta sesiones fuera de la ventana de 4 semanas', () => {
    const ref = new Date(2026, 8, 6);
    const buckets = getWeeklyVolumeBuckets(
      [baseSession('old', '2026-07-20', { totalVolumeKg: 9999 })],
      ref
    );
    expect(buckets.every((b) => b.workouts === 0)).toBe(true);
  });
});

describe('computeDashboardStats', () => {
  const history: WorkoutSessionLog[] = [
    baseSession('a', '2026-09-02', { totalVolumeKg: 12450, durationMinutes: 62 }),
    baseSession('b', '2026-08-31', { totalVolumeKg: 11800, durationMinutes: 58 }),
    baseSession('c', '2026-08-28', { totalVolumeKg: 14200, durationMinutes: 66 }),
    baseSession('d', '2026-08-25', { totalVolumeKg: 8900, durationMinutes: 52 }),
  ];
  const weightHistory = [
    { date: '10 Jul', weight: 79.5 },
    { date: '03 Sep', weight: 78.2 },
  ];
  const personalRecords: PersonalRecord[] = [
    baseRecord('pr_01', '15 Ago 2026'),
    {
      ...baseRecord('pr_02', '28 Ago 2026'),
      recordValue: '125 kg (x6 reps)',
      progressPercent: 4.1,
    },
  ];

  it('deriva volumen de la ultima semana con sesiones y su tendencia vs semana anterior', () => {
    const stats = computeDashboardStats(
      history,
      weightHistory,
      personalRecords,
      new Date(2026, 8, 6)
    );
    expect(stats.latestWeekVolumeKg).toBe(24250);
    expect(stats.weeklyVolumeTrendPercent).toBeCloseTo(4.98, 1);
  });

  it('devuelve tendencia null si solo hay una semana con datos', () => {
    const stats = computeDashboardStats(
      [baseSession('a', '2026-09-02', { totalVolumeKg: 12450 })],
      weightHistory,
      personalRecords,
      new Date(2026, 8, 6)
    );
    expect(stats.latestWeekVolumeKg).toBe(12450);
    expect(stats.weeklyVolumeTrendPercent).toBeNull();
  });

  it('calcula volumen cero sin historial', () => {
    const stats = computeDashboardStats([], [], [], new Date(2026, 8, 6));
    expect(stats.latestWeekVolumeKg).toBe(0);
    expect(stats.weeklyVolumeTrendPercent).toBeNull();
  });

  it('cuenta workouts del mes y de los ultimos 7 dias', () => {
    const stats = computeDashboardStats(
      history,
      weightHistory,
      personalRecords,
      new Date(2026, 8, 6)
    );
    expect(stats.workoutsThisMonth).toBe(1);
    expect(stats.workoutsThisWeek).toBe(2);
  });

  it('deriva tiempo total y promedio por sesion del historial', () => {
    const stats = computeDashboardStats(
      history,
      weightHistory,
      personalRecords,
      new Date(2026, 8, 6)
    );
    expect(stats.totalTrainingHours).toBe(4.0);
    expect(stats.averageSessionMinutes).toBe(60);
  });

  it('deriva el delta de peso del primer al ultimo registro', () => {
    const stats = computeDashboardStats(
      history,
      weightHistory,
      personalRecords,
      new Date(2026, 8, 6)
    );
    expect(stats.weightDeltaKg).toBeCloseTo(-1.3, 1);
  });

  it('selecciona el PR mas reciente por fecha espanola como ultimo record', () => {
    const stats = computeDashboardStats(
      history,
      weightHistory,
      personalRecords,
      new Date(2026, 8, 6)
    );
    expect(stats.latestPersonalRecord?.id).toBe('pr_02');
  });

  it('no rompe sin records', () => {
    const stats = computeDashboardStats(history, weightHistory, [], new Date(2026, 8, 6));
    expect(stats.latestPersonalRecord).toBeNull();
  });
});
