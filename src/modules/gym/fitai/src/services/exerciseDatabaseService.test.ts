import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  EXERCISE_DATABASE,
  setExerciseDatabase,
  datasetToRoutineExercise,
  getAvailableCategories,
  getExerciseByName,
  getExerciseGifUrl,
  getExerciseImageUrl,
  getDatasetExerciseById,
  searchExercises,
  translateCategory,
  translateEquipment,
  translateTarget,
} from './exerciseDatabaseService';

// Seed the database from local JSON file (mirrors what the app does via fetch at runtime)
beforeAll(() => {
  const jsonPath = resolve(__dirname, '../../public/exercisesDatabase.json');
  const raw = readFileSync(jsonPath, 'utf-8');
  setExerciseDatabase(JSON.parse(raw));
});

describe('dataset', () => {
  it('contiene los 1324 ejercicios esperados', () => {
    expect(EXERCISE_DATABASE).toHaveLength(1324);
  });

  it('obtiene un ejercicio por su id', () => {
    const item = getDatasetExerciseById('0001');
    expect(item?.name).toBe('3/4 sit-up');
  });

  it('busca ejercicios por nombre sin diferenciar mayúsculas ni acentos', () => {
    const first = EXERCISE_DATABASE[0];
    const found = getExerciseByName(first.name.toUpperCase());
    expect(found).toBeDefined();
    expect(found?.id).toBe(first.id);
    expect(getExerciseByName('No existe este ejercicio XYZ')).toBeUndefined();
    expect(getExerciseByName('   ')).toBeUndefined();
  });
});

describe('traducciones al español', () => {
  it('traduce categorías, equipamiento y músculos', () => {
    expect(translateCategory('chest')).toBe('Pecho');
    expect(translateEquipment('dumbbell')).toBe('Mancuernas');
    expect(translateTarget('abs')).toBe('Abdominales Rectos');
  });

  it('devuelve el valor original si no conoce la traducción', () => {
    expect(translateCategory('zzz-no-existe')).toBe('zzz-no-existe');
  });
});

describe('URLs de medios (CDN de jsdelivr)', () => {
  it('construye la URL de imagen de miniatura', () => {
    const url = getExerciseImageUrl('images/0001-2gPfomN.jpg');
    expect(url).toContain('cdn.jsdelivr.net');
    expect(url.endsWith('images/0001-2gPfomN.jpg')).toBe(true);
  });

  it('construye la URL del GIF animado', () => {
    const url = getExerciseGifUrl('videos/0001-2gPfomN.gif');
    expect(url).toContain('cdn.jsdelivr.net');
    expect(url.endsWith('videos/0001-2gPfomN.gif')).toBe(true);
  });

  it('deja pasar URLs absolutamente calificadas', () => {
    expect(getExerciseImageUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
  });
});

describe('searchExercises', () => {
  it('aplica límite y offset', () => {
    const r = searchExercises({ limit: 10, offset: 0 });
    expect(r.items.length).toBeLessThanOrEqual(10);
    expect(r.total).toBe(EXERCISE_DATABASE.length);
  });

  it('filtra por músculo objetivo', () => {
    const r = searchExercises({ target: 'abs', limit: 50 });
    expect(r.total).toBeGreaterThan(0);
    for (const item of r.items) {
      expect(item.target).toBe('abs');
    }
  });

  it('encuentra por consulta de texto', () => {
    const r = searchExercises({ query: 'barbell' });
    expect(r.total).toBeGreaterThan(0);
  });

  it('encuentra "bench press" escribiendo "press banca" en español', () => {
    const r = searchExercises({ query: 'press banca', limit: 50 });
    expect(r.total).toBeGreaterThan(0);
    const benchNames = r.items.map((e) => e.name.toLowerCase());
    expect(benchNames.some((n) => n.includes('bench press'))).toBe(true);
  });

  it('encuentra "squat" escribiendo "sentadilla" en español', () => {
    const r = searchExercises({ query: 'sentadilla', limit: 50 });
    expect(r.total).toBeGreaterThan(0);
    const names = r.items.map((e) => e.name.toLowerCase());
    expect(names.some((n) => n.includes('squat'))).toBe(true);
  });

  it('encuentra "dips" escribiendo "fondos" en español', () => {
    const r = searchExercises({ query: 'fondos', limit: 50 });
    expect(r.total).toBeGreaterThan(0);
    const names = r.items.map((e) => e.name.toLowerCase());
    expect(names.some((n) => n.includes('dip'))).toBe(true);
  });

  it('ordena por nombre A-Z y Z-A', () => {
    const asc = searchExercises({ sort: 'name', limit: 100 });
    const names = asc.items.map((e) => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);

    const desc = searchExercises({ sort: 'name-desc', limit: 100 });
    const descNames = desc.items.map((e) => e.name);
    const sortedDesc = [...descNames].sort((a, b) => b.localeCompare(a));
    expect(descNames).toEqual(sortedDesc);
  });
});

describe('getAvailableCategories', () => {
  it('expone categorías únicas traducidas', () => {
    const cats = getAvailableCategories();
    expect(cats.length).toBeGreaterThan(0);
    expect(cats.some((c) => c.label.includes('Pecho'))).toBe(true);
  });
});

describe('datasetToRoutineExercise', () => {
  it('mapea un ejercicio del dataset al formato de rutina (body weight)', () => {
    const item = getDatasetExerciseById('0001')!;
    const ex = datasetToRoutineExercise(item);
    expect(ex.name).toBe('3/4 sit-up');
    expect(ex.difficulty).toBe('intermedio');
    expect(ex.equipment).toBe('Peso Corporal');
    expect(ex.iconType).toBe('bodyweight');
    expect(ex.suggestedWeightKg).toBe(0);
    expect(ex.reps).toBe('12-15');
    expect(ex.targetMuscles).toContain('Abdominales Rectos');
    expect(ex.fullInstructions.length).toBeGreaterThan(0);
    expect(ex.datasetId).toBe('0001');
  });

  it('respeta los overrides pasados', () => {
    const item = getDatasetExerciseById('0001')!;
    const ex = datasetToRoutineExercise(item, { sets: 5, rpe: 9 });
    expect(ex.sets).toBe(5);
    expect(ex.rpe).toBe(9);
  });
});
