import { DailyRoutine, Exercise, ExperienceLevel } from '../types';
import { datasetToRoutineExercise, getExerciseByName } from '../services/exerciseDatabaseService';

export interface RoutineImportResult {
  routines: DailyRoutine[];
  warnings: string[];
  error: string | null;
}

const DIFFICULTIES: ExperienceLevel[] = ['principiante', 'intermedio', 'avanzado'];

const MAX_DAYS = 7;
const MAX_EXERCISES_PER_DAY = 12;

function stripControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

/** Limpia un valor de una sola línea: sin controles ni corchetes/etiquetas. */
function sanitizeLine(value: string): string {
  return stripControlChars(value).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function clampInt(value: number, min: number, max: number, fallback: number): number {
  const n = Math.round(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampFloat(value: number, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function sanitizeReps(value: string): string {
  const reps = value
    .replace(/–/g, '-')
    .replace(/[^\d\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10);
  return reps || '10-12';
}

function sanitizeMuscle(value: string): string {
  return sanitizeLine(value).slice(0, 30);
}

function stripDaySuffix(name: string): string {
  return sanitizeLine(name).replace(/\s*\(?Día\s*\d+\)?\s*$/i, '').trim();
}

function buildStubExercise(
  name: string,
  sets: number,
  reps: string,
  weight: number,
  rest: number,
  difficulty: ExperienceLevel,
  muscles: string[],
  idSuffix: string
): Exercise {
  return {
    id: `import_${idSuffix}`,
    name,
    primaryMuscle: muscles[0] || 'General',
    targetMuscles: muscles,
    sets,
    reps,
    suggestedWeightKg: weight,
    restSeconds: rest,
    rpe: 8,
    technicalCue: '',
    fullInstructions: [],
    commonMistakes: [],
    equipment: 'Carga libre',
    difficulty,
    iconType: 'dumbbell',
  };
}

/**
 * Resolver por defecto: enriquece los ejercicios con los datos del dataset si
 * ya está cargado en la sesión (módulo de ejercicio). Si está vacío devuelve
 * `null` y el import usa un stub seguro.
 */
export function createDatabaseResolver(): (name: string) => Exercise | null {
  return (name: string) => {
    const match = getExerciseByName(name);
    return match ? datasetToRoutineExercise(match) : null;
  };
}

/**
 * Parsea el texto compartido por `formatRoutineForSharing` y lo convierte de
 * nuevo en `DailyRoutine[]`. El texto es tratado como no confiable: se eliminan
 * caracteres de control, se recortan longitudes, se validan los tipos numéricos
 * y se acotan los días y ejercicios. Devuelve `error` (y rutinas vacías) si el
 * texto no contiene una rutina válida.
 */
export function parseRoutineText(
  text: string,
  resolveExercise: (name: string) => Exercise | null = () => null
): RoutineImportResult {
  const warnings: string[] = [];
  const lines = stripControlChars(text).split(/\r?\n/);
  const parsed: DailyRoutine[] = [];
  let currentDay: DailyRoutine | null = null;
  let pendingSets = 3;
  let pendingReps = '10-12';
  let pendingWeight = 0;
  let pendingRest = 60;
  let foundHeader = false;
  let pendingName = '';

  const flushPendingExercise = () => {
    if (!currentDay || !pendingName) return;
    const name = pendingName;
    const sets = pendingSets;
    const reps = pendingReps;
    const weight = pendingWeight;
    const rest = pendingRest;
    const base = resolveExercise(name);
    const stub = buildStubExercise(
      name,
      sets,
      reps,
      weight,
      rest,
      currentDay.difficulty,
      currentDay.targetMuscles,
      `${parsed.length}_${currentDay.exercises.length}`
    );
    currentDay.exercises.push({
      ...(base ?? stub),
      name,
      sets,
      reps,
      suggestedWeightKg: weight,
      restSeconds: rest,
    });
    pendingName = '';
    pendingSets = 3;
    pendingReps = '10-12';
    pendingWeight = 0;
    pendingRest = 60;
  };

  const commitDay = () => {
    if (!currentDay) return;
    if (pendingName) flushPendingExercise();
    parsed.push(currentDay);
    currentDay = null;
  };

  for (const raw of lines) {
    const line = sanitizeLine(raw);
    if (!line) continue;

    if (!foundHeader) {
      if (/^Mi Rutina (FitAI|Punto Fuerte)/i.test(line) || /^=+$/.test(line)) {
        foundHeader = true;
        continue;
      }
      if (/todavía no tengo ejercicios/i.test(line)) {
        return { routines: [], warnings: [], error: 'La rutina compartida está vacía.' };
      }
      if (!/^Día\s*\d+\s*[-—]/i.test(line)) continue;
      foundHeader = true;
    }

    const dayMatch = line.match(/^Día\s*(\d{1,2})\s*[-—]\s*(.+?)\s*$/i);
    if (dayMatch) {
      commitDay();
      currentDay = {
        dayNumber: 0,
        name: stripDaySuffix(dayMatch[2]) || 'Día sin nombre',
        focus: '',
        description: '',
        estimatedMinutes: 45,
        difficulty: 'intermedio',
        targetMuscles: [],
        exercises: [],
      };
      continue;
    }

    if (!currentDay) continue;

    if (/^Descanso$/i.test(line)) {
      currentDay.isRestDay = true;
      pendingName = '';
      continue;
    }

    if (/^Enfoque:\s*/i.test(line)) {
      currentDay.focus = sanitizeLine(line.replace(/^Enfoque:\s*/i, '')).slice(0, 80);
      continue;
    }

    if (/^Músculos:\s*/i.test(line)) {
      currentDay.targetMuscles = [
        ...new Set(
          line
            .replace(/^Músculos:\s*/i, '')
            .split(',')
            .map(sanitizeMuscle)
            .filter(Boolean)
        ),
      ].slice(0, 12);
      continue;
    }

    const difficultyMatch = line.match(
    /^Dificultad:\s*([a-záéíóúñü\s-]+?)\s*(?:•\s*~?\s*(\d+)\s*min)?\s*$/i
  );
    if (difficultyMatch) {
      const label = difficultyMatch[1].toLowerCase();
      currentDay.difficulty = DIFFICULTIES.includes(label as ExperienceLevel)
        ? (label as ExperienceLevel)
        : 'intermedio';
      if (difficultyMatch[2]) {
        currentDay.estimatedMinutes = clampInt(Number(difficultyMatch[2]), 10, 240, 45);
      }
      continue;
    }

    const detailMatch = line.match(/^-\s*(\d{1,2})\s*x\s*([\d\s–-]+?)\s*@\s*([\d.,]+)\s*kg/i);
    if (detailMatch) {
      pendingSets = clampInt(Number(detailMatch[1]), 1, 12, 3);
      pendingReps = sanitizeReps(detailMatch[2]);
      pendingWeight = clampFloat(Number(detailMatch[3].replace(',', '.')), 0, 500, 0);
      continue;
    }

    const restMatchSeg = line.match(/^-\s*Descanso:\s*(\d{1,4})\s*seg/i);
    if (restMatchSeg) {
      pendingRest = clampInt(Number(restMatchSeg[1]), 0, 900, 60);
      continue;
    }

    const restMatch = line.match(/^-\s*Descanso:\s*(\d{1,3})\s*min/i);
    if (restMatch) {
      pendingRest = clampInt(Number(restMatch[1]) * 60, 0, 900, 60);
      continue;
    }

    const exMatch = line.match(/^\d+[.)]\s*(.+)$/);
    if (exMatch) {
      const name = sanitizeLine(exMatch[1]).slice(0, 120);
      if (!name) continue;
      if (pendingName) flushPendingExercise();
      pendingName = name;
      continue;
    }
  }
  commitDay();

  for (const day of parsed) {
    if (!day.isRestDay && day.exercises.length === 0) {
      warnings.push(`Día «${day.name}» no tenía ejercicios y se omitió.`);
      continue;
    }
    if (day.exercises.length > MAX_EXERCISES_PER_DAY) {
      day.exercises = day.exercises.slice(0, MAX_EXERCISES_PER_DAY);
      warnings.push(`Día «${day.name}» superaba 12 ejercicios; se conservaron los primeros.`);
    }
  }

  if (parsed.length > MAX_DAYS) {
    parsed.length = MAX_DAYS;
    warnings.push('La rutina superaba 7 días; se conservaron los 7 primeros.');
  }

  const kept = parsed.filter((day) => day.isRestDay || day.exercises.length > 0);
  const totalExercises = kept.reduce((sum, d) => sum + d.exercises.length, 0);
  if (kept.length === 0 || totalExercises === 0) {
    return { routines: [], warnings, error: 'No se reconoció una rutina válida en el texto.' };
  }

  const routines = kept.map((day, index) => ({
    ...day,
    dayNumber: index + 1,
    description: '',
    exercises: day.exercises.map((ex, i) => ({
      ...ex,
      id: `import_${index + 1}_${i + 1}`,
    })),
  }));

  return { routines, warnings, error: null };
}