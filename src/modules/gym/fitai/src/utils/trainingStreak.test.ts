import { describe, expect, it } from 'vitest';
import { computeTrainingStreak } from './trainingStreak';

const REFERENCE = new Date(2026, 8, 8); // Sep 8, 2026 is a Tuesday

describe('computeTrainingStreak', () => {
  it('Devuelve cero sin sesiones', () => {
    expect(computeTrainingStreak([], REFERENCE)).toEqual({ currentWeeks: 0, longestWeeks: 0 });
  });

  it('Cuenta la semana actual como racha de 1', () => {
    expect(computeTrainingStreak(['2026-09-08'], REFERENCE)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    });
  });

  it('Sesiones del mismo lunes a domingo suman una sola semana', () => {
    expect(computeTrainingStreak(['2026-09-07', '2026-09-08'], REFERENCE)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    });
  });

  it('Racha actual de dos semanas consecutivas', () => {
    expect(computeTrainingStreak(['2026-09-08', '2026-08-31'], REFERENCE)).toEqual({
      currentWeeks: 2,
      longestWeeks: 2,
    });
  });

  it('Una semana sin entrenar corta la racha actual pero guarda el récord', () => {
    const dates = ['2026-09-08', '2026-08-25', '2026-08-18'];
    expect(computeTrainingStreak(dates, REFERENCE)).toEqual({ currentWeeks: 1, longestWeeks: 2 });
  });

  it('El récord se calcula ignorando la racha actual', () => {
    expect(computeTrainingStreak(['2026-08-18', '2026-08-11', '2026-09-08'], REFERENCE)).toEqual({
      currentWeeks: 1,
      longestWeeks: 2,
    });
  });

  it('Ignora sesiones futuras respecto a la referencia', () => {
    expect(computeTrainingStreak(['2026-10-02', '2026-09-08'], REFERENCE)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    });
  });

  it('maintains streak on Monday when last session was Sunday', () => {
    const refMonday = new Date(2026, 8, 7);
    expect(computeTrainingStreak(['2026-09-06'], refMonday)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    });
  });

  it('grace period — current week without sessions keeps streak from last week', () => {
    expect(computeTrainingStreak(['2026-09-02'], REFERENCE)).toEqual({
      currentWeeks: 1,
      longestWeeks: 1,
    });
  });
});