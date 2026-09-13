import { useApp } from '../context/useApp';
import { INITIAL_USER } from '../data/mockUser';
import { AppScreen } from '../types';

export type GuidanceStep = AppScreen;

export interface GuidanceInfo {
  step: GuidanceStep;
  message: string;
}

function isNamePersonalized(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  return trimmed.toLowerCase() !== INITIAL_USER.name.toLowerCase();
}

function countRoutineExercises(routines: { exercises: unknown[] }[]): number {
  return routines.reduce((acc, r) => acc + r.exercises.length, 0);
}

/**
 * Guía con pulsos dorados del botón circular.
 *
 * 1) Sin sesión → Perfil (personalizar nombre).
 * 2) Con sesión y rutina con ejercicios → Rutina (comenzar entrenamiento).
 * 3) Nombre personalizado y rutina vacía → Biblioteca (añadir ejercicio).
 * 4) Todavía con el nombre por defecto → Perfil (adaptar nombre).
 */
export function useGuidanceStep(): GuidanceInfo {
  const { isAuthenticated, user, routines } = useApp();

  if (!isAuthenticated) {
    return {
      step: 'profile',
      message: 'Entra y personaliza tu nombre',
    };
  }

  const hasExercises = countRoutineExercises(routines) > 0;

  if (hasExercises) {
    return { step: 'routine', message: '¡Es hora de entrenar!' };
  }

  if (isNamePersonalized(user.name)) {
    return { step: 'exercises', message: 'Añade un ejercicio a tu rutina' };
  }

  return { step: 'profile', message: 'Adapta tu nombre al tuyo' };
}