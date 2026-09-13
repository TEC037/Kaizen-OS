import { describe, it, expect } from 'vitest';
import { generateRoutineFromSurvey, SurveyAnswers } from './routineGenerator';

function baseAnswers(overrides: Partial<SurveyAnswers> = {}): SurveyAnswers {
  return {
    goal: 'hipertrofia',
    experience: 'intermedio',
    daysPerWeek: 3,
    minutesPerSession: 60,
    equipment: [],
    priorityMuscles: [],
    limitations: [],
    style: 'balanced',
    ...overrides,
  };
}

const NO_DATABASE: any[] = [];

describe('generateRoutineFromSurvey', () => {
  it('genera la división para 3 días con volumen de hipertrofia', () => {
    const { routines, summary } = generateRoutineFromSurvey(baseAnswers(), NO_DATABASE);

    expect(routines).toHaveLength(3);
    expect(routines.map((r) => r.name)).toEqual([
      'Empuje (Pecho, Hombros y Tríceps)',
      'Tirón (Espalda y Bíceps)',
      'Pierna (Cuádriceps y Glúteos)',
    ]);
    expect(routines.map((r) => r.dayNumber)).toEqual([1, 2, 3]);

    expect(routines[0].targetMuscles).toContain('Pecho');
    for (const routine of routines) {
      expect(routine.isRestDay).toBeFalsy();
      for (const exercise of routine.exercises) {
        expect(exercise.sets).toBe(4);
        expect(exercise.reps).toBe('8-12');
        expect(exercise.restSeconds).toBe(90);
        expect(exercise.difficulty).toBe('intermedio');
        expect(exercise.id).toMatch(/^gen_/);
      }
    }

    expect(summary.goalLabel).toBe('Hipertrofia (8-12 reps)');
    expect(summary.styleLabel).toBe('Mix equilibrado');
    expect(summary.safetyNote).toBeNull();
  });

  it('adapta series, repeticiones y descanso al objetivo de fuerza', () => {
    const { routines, summary } = generateRoutineFromSurvey(
      baseAnswers({ goal: 'fuerza' }),
      NO_DATABASE
    );

    for (const exercise of routines.flatMap((r) => r.exercises)) {
      expect(exercise.sets).toBe(5);
      expect(exercise.reps).toBe('3-6');
      expect(exercise.restSeconds).toBe(150);
    }
    expect(summary.goalLabel).toContain('Fuerza');
  });

  it('filtra ejercicios que requieren equipamiento no seleccionado', () => {
    const { routines } = generateRoutineFromSurvey(
      baseAnswers({ equipment: ['barras'], daysPerWeek: 3, style: 'compound' }),
      NO_DATABASE
    );

    const names = routines.flatMap((r) => r.exercises.map((e) => e.name));
    expect(names).toContain('Press de Banca con Barra');
    for (const routine of routines) {
      if (routine.isRestDay) continue;
      for (const exercise of routine.exercises) {
        expect(exercise.equipment).toMatch(/barra|rack/i);
      }
    }
  });

  it('excluye patrones de riesgo cuando hay limitación de rodillas', () => {
    const { routines, summary } = generateRoutineFromSurvey(
      baseAnswers({ limitations: ['rodillas'], daysPerWeek: 3 }),
      NO_DATABASE
    );

    for (const name of routines.flatMap((r) => r.exercises.map((e) => e.name))) {
      expect(name).not.toMatch(/sentadilla|zancada|lunge|squat/i);
    }
    expect(summary.safetyNote).toContain('rodillas');
  });

  it('construye 4 días con división superior/inferior A y B', () => {
    const { routines } = generateRoutineFromSurvey(
      baseAnswers({ daysPerWeek: 4 }),
      NO_DATABASE
    );

    expect(routines.map((r) => r.name)).toEqual([
      'Parte Superior',
      'Parte Inferior',
      'Parte Superior B',
      'Parte Inferior B',
    ]);
    expect(routines.map((r) => r.dayNumber)).toEqual([1, 2, 3, 4]);
  });

  it('reactiva el descanso activo el día 5 y limpia los números de día', () => {
    const { routines } = generateRoutineFromSurvey(
      baseAnswers({ daysPerWeek: 5 }),
      NO_DATABASE
    );

    expect(routines).toHaveLength(5);
    const restDay = routines.find((r) => r.isRestDay);
    expect(restDay?.name).toBe('Core y Cardio Ligero');
    expect(restDay?.exercises.length).toBeLessThanOrEqual(1);
    expect(routines.map((r) => r.dayNumber)).toEqual([1, 2, 3, 4, 5]);
  });

  it('prioriza las zonas solicitadas añadiendo ejercicios extra', () => {
    const { routines } = generateRoutineFromSurvey(
      baseAnswers({ priorityMuscles: ['Brazos'], daysPerWeek: 3, minutesPerSession: 90 }),
      NO_DATABASE
    );

    const day1 = routines[0];
    expect(day1.targetMuscles).toContain('Bíceps');

    const hasArmTarget = (exerciseName: (typeof day1.exercises)[number]) =>
      exerciseName.targetMuscles.some((t) =>
        t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/tricep|bicep/i)
      );

    expect(day1.exercises.filter(hasArmTarget).length).toBeGreaterThanOrEqual(2);
    expect(
      routines.flatMap((r) => r.exercises).some((e) => e.primaryMuscle === 'Bíceps')
    ).toBe(true);
  });

  it('es determinista para las mismas entradas', () => {
    const first = generateRoutineFromSurvey(baseAnswers(), NO_DATABASE);
    const second = generateRoutineFromSurvey(baseAnswers(), NO_DATABASE);

    expect(JSON.stringify(first.routines)).toBe(JSON.stringify(second.routines));
    expect(first.summary).toEqual(second.summary);
  });

  it('limita a un rango válido de días por semana', () => {
    expect(generateRoutineFromSurvey(baseAnswers({ daysPerWeek: 9 }), NO_DATABASE).routines).toHaveLength(6);
    expect(generateRoutineFromSurvey(baseAnswers({ daysPerWeek: 1 }), NO_DATABASE).routines).toHaveLength(2);
  });

  it('siempre entrega rutina y resumen coherentes usando el pool interno', () => {
    const { routines, summary } = generateRoutineFromSurvey(
      baseAnswers({ goal: 'perdida_grasa', daysPerWeek: 3, minutesPerSession: 45 }),
      NO_DATABASE
    );

    expect(routines.length).toBeGreaterThan(0);
    expect(summary.days.length).toBe(routines.length);
    expect(summary.split).toContain('3 días');
    for (const exercise of routines.flatMap((r) => r.exercises)) {
      expect(exercise.suggestedWeightKg).toBeGreaterThanOrEqual(0);
    }
  });
});