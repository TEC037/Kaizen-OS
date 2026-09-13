import { DailyRoutine } from '../types';

function renderExerciseLine(
  ex: { name: string; sets: number; reps: string; suggestedWeightKg: number; restSeconds: number },
  index: number
): string {
  return [
    `  ${index + 1}. ${ex.name}`,
    `     - ${ex.sets} x ${ex.reps} @ ${ex.suggestedWeightKg} kg`,
    `     - Descanso: ${ex.restSeconds} seg`,
  ].join('\n');
}

function renderDay(day: DailyRoutine): string {
  const head = `Día ${day.dayNumber} - ${day.name}`;
  if (day.isRestDay) {
    return [head, '  Descanso', ''].join('\n');
  }
  const body = [
    head,
    `  Enfoque: ${day.focus}`,
    `  Dificultad: ${day.difficulty} • ~${day.estimatedMinutes} min`,
    `  Músculos: ${day.targetMuscles.join(', ')}`,
    ...day.exercises.map((ex, i) => renderExerciseLine(ex, i)),
    '',
  ];
  return body.join('\n');
}

export function formatRoutineForSharing(routines: DailyRoutine[]): string {
  if (routines.length === 0) {
    return 'Mi rutina en Punto Fuerte: todavía no tengo ejercicios añadidos.';
  }
  const header = 'Mi Rutina Punto Fuerte';
  const divider = '='.repeat(header.length);
  const days = [...routines]
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map(renderDay)
    .join('\n');
  return `${header}\n${divider}\n\n${days}`.trim();
}