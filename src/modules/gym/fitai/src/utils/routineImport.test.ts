import { describe, it, expect } from 'vitest';
import { formatRoutineForSharing } from './routineShare';
import { parseRoutineText } from './routineImport';
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

const day1: DailyRoutine = {
  dayNumber: 1,
  name: 'Empuje Dinámico (Día 1)',
  focus: 'Pecho y Tríceps',
  description: '',
  estimatedMinutes: 50,
  difficulty: 'intermedio',
  targetMuscles: ['Pectoral', 'Tríceps'],
  exercises: [exercise],
};

const day2Rest: DailyRoutine = {
  dayNumber: 2,
  name: 'Tirón Potente (Día 2)',
  focus: 'Recuperación',
  description: '',
  estimatedMinutes: 30,
  difficulty: 'principiante',
  targetMuscles: [],
  exercises: [],
  isRestDay: true,
};

describe('parseRoutineText', () => {
  it('reconstruye una rutina desde el texto compartido (round-trip)', () => {
    const text = formatRoutineForSharing([day1, day2Rest]);
    const result = parseRoutineText(text);

    expect(result.error).toBeNull();
    expect(result.routines).toHaveLength(2);

    const [imported, rest] = result.routines;
    expect(imported.name).toBe('Empuje Dinámico');
    expect(imported.dayNumber).toBe(1);
    expect(imported.focus).toBe('Pecho y Tríceps');
    expect(imported.difficulty).toBe('intermedio');
    expect(imported.estimatedMinutes).toBe(50);
    expect(imported.targetMuscles).toEqual(['Pectoral', 'Tríceps']);
    expect(imported.exercises).toHaveLength(1);
    expect(imported.exercises[0]).toMatchObject({
      name: 'Press de Banca con Barra',
      sets: 4,
      reps: '8-10',
      suggestedWeightKg: 80,
      restSeconds: 90,
    });
    expect(imported.exercises[0].id).toMatch(/^import_/);

    expect(rest.isRestDay).toBe(true);
    expect(rest.name).toBe('Tirón Potente');
    expect(rest.dayNumber).toBe(2);
  });

  it('renumera los días de forma consecutiva respetando el orden del texto', () => {
    const text =
      'Mi Rutina FitAI\n' +
      '==============\n' +
      '\n' +
      'Día 5 - Tirón Potente (Día 2)\n' +
      '  Descanso\n' +
      '\n' +
      'Día 3 - Empuje Dinámico (Día 1)\n' +
      '  Enfoque: Pecho\n' +
      '  1. Press de Banca con Barra\n' +
      '     - 4 x 8-10 @ 80 kg\n';
    const result = parseRoutineText(text);
    expect(result.routines.map((d) => d.dayNumber)).toEqual([1, 2]);
    expect(result.routines[0].name).toBe('Tirón Potente');
    expect(result.routines[1].name).toBe('Empuje Dinámico');
  });

  it('usa huesos seguros para ejercicios desconocidos y limpia el nombre', () => {
    const text =
      'Mi Rutina FitAI\n' +
      '==============\n' +
      '\n' +
      'Día 1 - Día de prueba\n' +
      '  Enfoque: Cuerpo completo\n' +
      '  Dificultad: avanzado • ~60 min\n' +
      '  1. <b>Prensa Inédita</b>\n' +
      '     - 5 x 12-15 @ 40 kg\n' +
      '     - Descanso: 3 min\n';

    const result = parseRoutineText(text);
    expect(result.error).toBeNull();
    expect(result.routines[0].estimatedMinutes).toBe(60);
    const ex = result.routines[0].exercises[0];
    expect(ex.name).not.toMatch(/[<>]/);
    expect(ex.difficulty).toBe('avanzado');
    expect(ex).toMatchObject({ sets: 5, reps: '12-15', suggestedWeightKg: 40, restSeconds: 180 });
  });

  it('enriquece con el dataset cuando el resolver lo encuentra y aplica las sobrecargas', () => {
    const resolver = (name: string): Exercise | null =>
      name === 'Press de Banca con Barra'
        ? { ...exercise, fullInstructions: ['paso 1', 'paso 2'] }
        : null;

    const text =
      'Mi Rutina FitAI\n' +
      '==============\n' +
      '\n' +
      'Día 1 - Empuje\n' +
      '  1. Press de Banca con Barra\n' +
      '     - 3 x 10 @ 60 kg\n' +
      '     - Descanso: 2 min\n';

    const result = parseRoutineText(text, resolver);
    const day = result.routines[0];
    const ex = day.exercises[0];
    expect(ex.fullInstructions).toEqual(['paso 1', 'paso 2']);
    expect(ex).toMatchObject({ sets: 3, reps: '10', suggestedWeightKg: 60, restSeconds: 120 });
    expect(ex.id).toMatch(/^import_/);
  });

  it('acota valores fuera de rango', () => {
    const text =
      'Mi Rutina FitAI\n' +
      '==============\n' +
      '\n' +
      'Día 1 - Día extremo\n' +
      '  1. Peso Muerto\n' +
      '     - 99 x 200-300 @ 9999 kg\n' +
      '     - Descanso: 999 min\n';

    const result = parseRoutineText(text);
    expect(result.routines[0].exercises[0]).toMatchObject({
      sets: 12,
      reps: '200-300',
      suggestedWeightKg: 500,
      restSeconds: 900,
    });
  });

  it('limita a 7 días conservando los primeros', () => {
    const days = Array.from(
      { length: 9 },
      (_, i): DailyRoutine => ({
        dayNumber: i + 1,
        name: `Día ${i + 1}`,
        focus: 'Prueba',
        description: '',
        estimatedMinutes: 45,
        difficulty: 'principiante',
        targetMuscles: [],
        exercises: [exercise],
      })
    );
    const result = parseRoutineText(formatRoutineForSharing(days));
    expect(result.routines).toHaveLength(7);
    expect(result.warnings.some((w) => /superaba 7 días/.test(w))).toBe(true);
  });

  it('limita el número de ejercicios por día', () => {
    const many = Array.from({ length: 15 }, (_, i) => ({ ...exercise, id: `e${i}` }));
    const text =
      'Mi Rutina FitAI\n' +
      '==============\n' +
      '\n' +
      `Día 1 - Día lleno\n` +
      many
        .map((e, i) => `  ${i + 1}. ${e.name}\n     - 3 x 10 @ 20 kg\n     - Descanso: 1 min`)
        .join('\n');

    const result = parseRoutineText(text);
    expect(result.routines[0].exercises).toHaveLength(12);
  });

  it('rechaza texto sin una rutina válida', () => {
    expect(parseRoutineText('esto no es una rutina\nnada reconocible')).toMatchObject({
      error: expect.stringContaining('No se reconoció una rutina válida'),
      routines: [],
    });
  });

  it('rechaza la rutina vacía de la función compartir', () => {
    expect(parseRoutineText(formatRoutineForSharing([]))).toMatchObject({
      error: expect.stringContaining('La rutina compartida está vacía'),
      routines: [],
    });
  });

  it('rechaza texto compuesto únicamente por días de descanso', () => {
    const text = formatRoutineForSharing([day2Rest]);
    expect(parseRoutineText(text)).toMatchObject({
      error: expect.stringContaining('No se reconoció una rutina válida'),
      routines: [],
    });
  });
});