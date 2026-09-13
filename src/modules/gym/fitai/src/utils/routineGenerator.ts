import {
  DailyRoutine,
  DatasetExercise,
  Exercise,
  ExperienceLevel,
  FitnessGoal,
} from '../types';
import { datasetToRoutineExercise } from '../services/exerciseDatabaseService';
import { MOCK_ROUTINES } from '../data/mockRoutines';

export interface SurveyAnswers {
  goal: FitnessGoal;
  experience: ExperienceLevel;
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[];
  priorityMuscles: string[];
  limitations: string[];
  style: 'compound' | 'balanced' | 'isolation';
}

export interface RoutineSummary {
  split: string;
  days: string[];
  goalLabel: string;
  styleLabel: string;
  safetyNote: string | null;
}

interface MuscleInfo {
  label: string;
  aliases: string[];
  categories: string[];
  targets: string[];
}

const MUSCLES: MuscleInfo[] = [
  { label: 'Pecho', aliases: ['pecho', 'pectoral'], categories: ['chest'], targets: ['pectorals'] },
  { label: 'Espalda', aliases: ['espalda', 'dorsal', 'lats'], categories: ['back'], targets: ['lats', 'upper back'] },
  { label: 'Hombros', aliases: ['hombro', 'deltoides', 'delts'], categories: ['shoulders'], targets: ['delts'] },
  { label: 'Bíceps', aliases: ['bicep', 'biceps'], categories: ['upper arms'], targets: ['biceps'] },
  { label: 'Tríceps', aliases: ['tricep', 'triceps'], categories: ['upper arms'], targets: ['triceps'] },
  { label: 'Piernas', aliases: ['pierna', 'cuadriceps', 'isquio', 'quad', 'hamstring', 'femoral', 'pantorrilla', 'calf'], categories: ['upper legs'], targets: ['quads', 'hamstrings', 'calves'] },
  { label: 'Glúteos', aliases: ['gluteo', 'glutes'], categories: ['upper legs'], targets: ['glutes'] },
  { label: 'Abdomen y Core', aliases: ['abdomen', 'abdominal', 'abs', 'core', 'spine', 'waist'], categories: ['waist'], targets: ['abs', 'spine'] },
];

interface DaySpec {
  name: string;
  focus: MuscleInfo[];
  isRestDay?: boolean;
}

const GOAL_PROFILE: Record<FitnessGoal, { sets: number; reps: string; rest: number; label: string }> = {
  hipertrofia: { sets: 4, reps: '8-12', rest: 90, label: 'Hipertrofia (8-12 reps)' },
  fuerza: { sets: 5, reps: '3-6', rest: 150, label: 'Fuerza Máxima (3-6 reps)' },
  perdida_grasa: { sets: 3, reps: '12-15', rest: 45, label: 'Perder Grasa (déficit y densidad)' },
  resistencia: { sets: 3, reps: '15-20', rest: 60, label: 'Resistencia (15+ reps)' },
  condicion_general: { sets: 3, reps: '10-12', rest: 75, label: 'Condición General' },
};

const STYLE_LABELS: Record<SurveyAnswers['style'], string> = {
  compound: 'Básicos compuestos',
  balanced: 'Mix equilibrado',
  isolation: 'Aislamiento y máquinas',
};

const LIMITATION_LABELS: Record<string, string> = {
  rodillas: 'Protejo rodillas (sin carga en sentadillas/zancadas)',
  espalda: 'Protejo zona lumbar (sin peso muerto ni remos forzados)',
  hombros: 'Protejo hombros (sin press por encima de la cabeza)',
  cervical: 'Protejo cervical (sin cargas sobre el cuello)',
};

const EXCLUDE_PATTERNS: Record<string, RegExp> = {
  rodillas: /sentadilla|squat|lunge|zancada|leg press|prensa de pierna|step.?up|pistol|wall sit|burpee|box jump|skater|sled push/i,
  espalda: /peso muerto|deadlift|good morning|bent.?over row|barbell row|remo con barra|rdl|romanian|back extension|hyperextension|kettlebell swing|turkish get.?up|snatch|clean and/i,
  hombros: /overhead|military press|shoulder press|press militar|press de hombro|handstand|pike|dips\b|fondos\b|upright row|behind.?neck|detras del cuello/i,
  cervical: /shrug|neck|encogimiento|cuello|hombros alto/i,
};

const EQUIPMENT_ALLOWED: Record<string, RegExp> = {
  barras: /barbell|ez barbell|trap bar|smith|barra/,
  mancuernas: /dumbbell|mancuerna/,
  maquinas: /machine|lever|smith|assisted|maquina|prensa|jalon|femoral|multipower/,
  poleas: /cable|polea/,
  calistenia: /body weight|band|peso corporal|colchoneta|dominadas|paralelas|banda|rueda|bodyweight/,
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function inferDatasetTokens(equipment: string): string[] {
  const value = normalize(equipment);
  if (/barbell|bar |smith/.test(value)) return ['barbell'];
  if (/dumbbell|mancuerna/.test(value)) return ['dumbbell'];
  if (/cable|polea/.test(value)) return ['cable'];
  if (/machine|lever|assisted|prensa|smith/.test(value)) return ['machine'];
  if (/body weight|bands?|resistance|band/.test(value)) return ['body weight'];
  return ['body weight'];
}

function inferEquipmentTokens(equipmentText: string | undefined): string[] {
  if (!equipmentText) return ['body weight'];
  const text = normalize(equipmentText);
  return Object.entries(EQUIPMENT_ALLOWED)
    .filter(([, pattern]) => pattern.test(text))
    .map(([id]) => (id === 'calistenia' ? 'body weight' : id === 'barras' ? 'barbell' : id === 'mancuernas' ? 'dumbbell' : id === 'maquinas' ? 'machine' : id === 'poleas' ? 'cable' : 'body weight'));
}

function equipmentAllowed(tokens: string[], selected: string[]): boolean {
  if (selected.length === 0 || selected.includes('gimnasio')) return true;
  const allowed = new Set(selected.flatMap((id) => EQUIPMENT_ALLOWED[id] ? [id] : []));
  const text = tokens.join(' ');
  return [...allowed].some((id) => {
    if (id === 'barras') return /barbell|barra/.test(text);
    if (id === 'mancuernas') return /dumbbell|mancuerna/.test(text);
    if (id === 'maquinas') return /machine|assisted|maquina|prensa|jalon/.test(text);
    if (id === 'poleas') return /cable|polea/.test(text);
    if (id === 'calistenia') return /body weight|peso corporal|colchoneta|banda|rueda|dominadas|paralelas/.test(text);
    return false;
  });
}

function matchesMuscle(muscle: MuscleInfo, label: string): boolean {
  const norm = normalize(label);
  if (!norm) return false;
  return muscle.aliases.some((alias) => norm.includes(alias) || alias.includes(norm));
}

function hasLimitation(limitations: string[], name: string): boolean {
  if (limitations.length === 0 || limitations.includes('ninguna')) return false;
  const norm = normalize(name);
  return limitations.some((lim) => EXCLUDE_PATTERNS[lim]?.test(norm) ?? false);
}

interface PickItem {
  exercise: Exercise;
  tokens: string[];
  kind: 'dataset' | 'mock';
  category?: string;
  target?: string;
  names: string[];
}

const FALLBACK_POOL: PickItem[] = MOCK_ROUTINES.flatMap((day) =>
  day.exercises.map((ex) => ({
    exercise: { ...ex },
    tokens: inferEquipmentTokens(typeof ex.equipment === 'string' ? ex.equipment : ex.equipment.join(' ')),
    kind: 'mock' as const,
    names: [...(ex.targetMuscles ?? []), ex.primaryMuscle],
  }))
);

function styleScore(item: PickItem, style: SurveyAnswers['style']): number {
  const tokens = item.tokens.join(' ');
  const isCompound =
    item.kind === 'dataset'
      ? ['chest', 'back', 'upper legs', 'shoulders'].includes(item.category ?? '')
      : /barbell/.test(tokens);
  if (style === 'compound') return isCompound ? 0 : 1;
  if (style === 'isolation') {
    const isolated =
      item.kind === 'dataset'
        ? ['biceps', 'triceps', 'delts', 'abs', 'forearms', 'calves', 'glutes'].includes(item.target ?? '')
        : /dumbbell|cable|machine/.test(tokens);
    return isolated ? 0 : 2;
  }
  return 0;
}

function candidatesFor(muscle: MuscleInfo, pool: PickItem[], answers: SurveyAnswers): PickItem[] {
  return pool
    .filter((item) => {
      const byMuscle =
        item.kind === 'dataset'
          ? Boolean(item.category && item.target) &&
            (muscle.categories.includes(item.category ?? '') ||
              muscle.targets.includes(item.target ?? ''))
          : item.names.some((label) => matchesMuscle(muscle, label));
      if (!byMuscle) return false;
      if (!equipmentAllowed(item.tokens, answers.equipment)) return false;
      if (hasLimitation(answers.limitations, item.exercise.name)) return false;
      return true;
    })
    .sort((a, b) => styleScore(a, answers.style) - styleScore(b, answers.style));
}

function buildExercise(item: PickItem, goal: FitnessGoal, experience: ExperienceLevel): Exercise {
  const profile = GOAL_PROFILE[goal];
  return {
    ...item.exercise,
    id: `gen_${normalize(item.exercise.name).slice(0, 24)}`,
    name: item.exercise.name,
    sets: profile.sets,
    reps: profile.reps,
    restSeconds: profile.rest,
    difficulty: experience,
    rpe: experience === 'avanzado' ? 9 : experience === 'intermedio' ? 8 : 7,
  };
}

function splitForDays(days: number, style: SurveyAnswers['style']): DaySpec[] {
  const chest = MUSCLES.find((m) => m.label === 'Pecho')!;
  const back = MUSCLES.find((m) => m.label === 'Espalda')!;
  const shoulders = MUSCLES.find((m) => m.label === 'Hombros')!;
  const biceps = MUSCLES.find((m) => m.label === 'Bíceps')!;
  const triceps = MUSCLES.find((m) => m.label === 'Tríceps')!;
  const legs = MUSCLES.find((m) => m.label === 'Piernas')!;
  const glutes = MUSCLES.find((m) => m.label === 'Glúteos')!;
  const core = MUSCLES.find((m) => m.label === 'Abdomen y Core')!;

  const push: DaySpec = { name: 'Empuje (Pecho, Hombros y Tríceps)', focus: [chest, shoulders, triceps] };
  const pull: DaySpec = { name: 'Tirón (Espalda y Bíceps)', focus: [back, biceps] };
  const legsDay: DaySpec = { name: 'Pierna (Cuádriceps y Glúteos)', focus: [legs, glutes] };
  const upper: DaySpec = { name: 'Parte Superior', focus: [chest, back, shoulders] };
  const lower: DaySpec = { name: 'Parte Inferior', focus: [legs, glutes, core] };

  if (days === 2) {
    if (style === 'compound') {
      return [
        { name: 'Cuerpo Completo A (Empuje + Core)', focus: [chest, shoulders, triceps, core] },
        { name: 'Cuerpo Completo B (Tirón + Pierna)', focus: [back, legs, glutes, biceps] },
      ];
    }
    return [
      { name: 'Cuerpo Completo A', focus: [chest, back, legs, shoulders] },
      { name: 'Cuerpo Completo B', focus: [legs, glutes, back, shoulders, core] },
    ];
  }
  if (days === 3) return [push, pull, legsDay];
  if (days === 4)
    return [upper, lower, { ...upper, name: 'Parte Superior B' }, { ...lower, name: 'Parte Inferior B' }];
  if (days === 5)
    return [
      push,
      pull,
      legsDay,
      { name: 'Hombros y Brazos', focus: [shoulders, biceps, triceps] },
      { name: 'Core y Cardio Ligero', focus: [core], isRestDay: true },
    ];
  return [
    push,
    pull,
    legsDay,
    { ...push, name: 'Empuje (Variante B)' },
    { ...pull, name: 'Tirón (Variante B)' },
    { ...legsDay, name: 'Pierna (Variante B)' },
  ];
}

function resolvePriorityKeys(muscleLabels: string[]): MuscleInfo[] {
  const resolved = muscleLabels.flatMap((label) => {
    const norm = normalize(label);
    if (norm === 'brazos' || norm === 'brazo') {
      return [MUSCLES.find((m) => m.label === 'Bíceps')!, MUSCLES.find((m) => m.label === 'Tríceps')!];
    }
    const match = MUSCLES.find((m) => matchesMuscle(m, label));
    return match ? [match] : [];
  });
  return [...new Set(resolved.map((m) => m.label))].map((label) =>
    MUSCLES.find((m) => m.label === label)!
  );
}

function exercisesPerSession(minutes: number): number {
  if (minutes >= 75) return 6;
  if (minutes >= 60) return 5;
  if (minutes >= 45) return 4;
  return 3;
}

export function generateRoutineFromSurvey(
  answers: SurveyAnswers,
  database: DatasetExercise[]
): { routines: DailyRoutine[]; summary: RoutineSummary } {
  const days = Math.min(6, Math.max(2, answers.daysPerWeek));
  const planned = splitForDays(days, answers.style);

  const pool: PickItem[] =
    database.length > 0
      ? database.map((item) => ({
          exercise: datasetToRoutineExercise(item),
          tokens: inferDatasetTokens(item.equipment),
          kind: 'dataset' as const,
          category: item.category,
          target: item.target,
          names: [],
        }))
      : FALLBACK_POOL;

  const priority = resolvePriorityKeys(answers.priorityMuscles);
  const budget = Math.min(6, exercisesPerSession(answers.minutesPerSession));
  const priorityLabels = new Set(priority.map((m) => m.label));

  const routines: DailyRoutine[] = planned.map((day, dayIndex) => {
    const foci = [...day.focus];
    for (const extra of priority) {
      if (foci.length >= 4) break;
      if (!foci.some((f) => f.label === extra.label)) foci.push(extra);
    }

    const selections: { muscle: MuscleInfo; exercises: Exercise[] }[] = [];
    const perMuscle = Math.max(1, Math.floor(budget / foci.length));
    let remainingBudget = budget;

    for (const muscle of foci) {
      if (remainingBudget <= 0) break;
      const candidates = candidatesFor(muscle, pool, answers);
      if (candidates.length === 0) continue;
      const count = Math.min(
        priorityLabels.has(muscle.label) ? perMuscle + 1 : perMuscle,
        candidates.length,
        remainingBudget
      );
      selections.push({
        muscle,
        exercises: candidates.slice(0, count).map((item) => buildExercise(item, answers.goal, answers.experience)),
      });
      remainingBudget -= count;
    }

    if (day.isRestDay) {
      return {
        dayNumber: dayIndex + 1,
        name: day.name,
        focus: '',
        description: 'Recuperación activa, movilidad y cardio ligero.',
        estimatedMinutes: 20,
        difficulty: answers.experience,
        targetMuscles: [],
        exercises: selections.flatMap((s) => s.exercises).slice(0, 1),
        isRestDay: true,
      };
    }

    const exercises = selections.flatMap((s) => s.exercises).slice(0, budget);
    return {
      dayNumber: dayIndex + 1,
      name: day.name,
      focus: day.focus.map((m) => m.label).join(', '),
      description: '',
      estimatedMinutes: answers.minutesPerSession,
      difficulty: answers.experience,
      targetMuscles: [...new Set(selections.map((s) => s.muscle.label))],
      exercises,
    };
  });

  const withExercises = routines.filter((r) => r.exercises.length > 0 || r.isRestDay);
  const totalExercises = withExercises.reduce((sum, r) => sum + r.exercises.length, 0);

  if (totalExercises === 0) {
    return {
      routines: MOCK_ROUTINES.map((r, i) => ({ ...r, dayNumber: i + 1 })),
      summary: buildSummary(answers, planned.map((d) => d.name)),
    };
  }

  return {
    routines: withExercises.map((r, i) => ({ ...r, dayNumber: i + 1 })),
    summary: buildSummary(answers, withExercises.map((r) => r.name)),
  };
}

function buildSummary(answers: SurveyAnswers, dayNames: string[]): RoutineSummary {
  const activeLimitations = answers.limitations.filter((l) => l !== 'ninguna');
  return {
    split: `${answers.daysPerWeek} días semanales`,
    days: dayNames,
    goalLabel: GOAL_PROFILE[answers.goal].label,
    styleLabel: STYLE_LABELS[answers.style],
    safetyNote:
      activeLimitations.length > 0
        ? activeLimitations.map((l) => LIMITATION_LABELS[l] ?? l).join(' — ')
        : null,
  };
}

export const GENERATOR_SUPPORT = { GOAL_PROFILE, STYLE_LABELS, LIMITATION_LABELS };