import { describe, it, expect } from 'vitest';
import { formatRoutineForSharing } from './routineShare';
import { DailyRoutine, Exercise } from '../types';

const exercise: Exercise = {
  id: 'e1',
  name: 'Press de Banca con Barra',
  primaryMuscle: 'Pecho',
  targetMuscles: ['Pectoral', 'Tríceps'],
  sets: 4,
  reps: '8-10',
  suggestedWeightKg: 80,
  restSeconds: 90,
  rpe: 8,
  technicalCue: 'Cue',
  fullInstructions: [],
  commonMistakes: [],
  equipment: 'Barra',
  difficulty: 'intermedio',
  iconType: 'barbell',
};

const routines: DailyRoutine[] = [
  {
    dayNumber: 2,
    name: 'Tirón Potente (Día 2)',
    focus: 'Espalda',
    description: '',
    estimatedMinutes: 45,
    difficulty: 'intermedio',
    targetMuscles: ['Dorsal'],
    exercises: [],
  },
  {
    dayNumber: 1,
    name: 'Empuje Dinámico (Día 1)',
    focus: 'Pecho y Tríceps',
    description: '',
    estimatedMinutes: 50,
    difficulty: 'intermedio',
    targetMuscles: ['Pectoral', 'Tríceps'],
    exercises: [exercise],
  },
];

describe('formatRoutineForSharing', () => {
  it('ordena por dayNumber y muestra el ejercicio con series y descanso', () => {
    const text = formatRoutineForSharing(routines);
    expect(text).toContain('Día 1 - Empuje Dinámico (Día 1)');
    expect(text.indexOf('Día 1')).toBeLessThan(text.indexOf('Día 2'));
    expect(text).toContain('1. Press de Banca con Barra');
    expect(text).toContain('4 x 8-10 @ 80 kg');
    expect(text).toContain('Descanso: 90 seg');
    expect(text).toContain('Músculos: Pectoral, Tríceps');
  });

  it('marca los días de descanso', () => {
    const withRest: DailyRoutine[] = [
      { ...routines[0], isRestDay: true, exercises: [] },
    ];
    expect(formatRoutineForSharing(withRest)).toContain('Descanso');
  });

  it('devuelve un aviso cuando no hay rutina', () => {
    expect(formatRoutineForSharing([])).toContain('todavía no tengo ejercicios');
  });
});