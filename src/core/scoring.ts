/**
 * @file src/core/scoring.ts
 * @description Sistema de puntuación y progreso Kaizen.
 * El usuario comienza estrictamente con 0 puntos y acumula puntos mediante
 * micro-acciones, cumplimiento de tareas, hitos y consistencia diaria.
 * Basado en la máxima Kaizen: "1% de avance es suficiente cada día".
 */

import { useState, useEffect, useCallback } from 'react';
import { KaizenScoreState, ScoreLogEntry } from './types';

const STORAGE_KEY_SCORE = 'kaizen_os_score_v1';
const SCORE_EVENT_NAME = 'kaizen_os_score_event';
const TOAST_EVENT_NAME = 'kaizen_os_score_toast';

/**
 * Meta diaria estándar: 50 puntos representan el objetivo del "1% de mejora diaria".
 */
export const DAILY_1_PERCENT_TARGET = 50;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Estado inicial estricto: El usuario comienza con 0 puntos.
 */
export const INITIAL_SCORE_STATE: KaizenScoreState = {
  totalPoints: 0,
  todayPoints: 0,
  dailyGoalPoints: DAILY_1_PERCENT_TARGET,
  currentStreakDays: 1,
  lastActiveDate: getTodayString(),
  history: [],
};

/**
 * Carga el estado de puntuación de localStorage o retorna el estado inicial (0 puntos)
 */
export function loadScoreState(): KaizenScoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCORE);
    if (!raw) return { ...INITIAL_SCORE_STATE };
    const parsed = JSON.parse(raw) as KaizenScoreState;

    // Verificar si el día cambió para reiniciar todayPoints respetando la racha
    const today = getTodayString();
    if (parsed.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = parsed.lastActiveDate === yesterday && parsed.todayPoints >= parsed.dailyGoalPoints;
      
      return {
        ...parsed,
        todayPoints: 0,
        lastActiveDate: today,
        currentStreakDays: isConsecutive ? parsed.currentStreakDays + 1 : 1,
      };
    }

    return parsed;
  } catch (error) {
    console.warn('[KaizenScore] Error al cargar puntuación, reiniciando a 0', error);
    return { ...INITIAL_SCORE_STATE };
  }
}

/**
 * Guarda el estado en localStorage y emite el evento para sincronizar componentes
 */
export function saveScoreState(state: KaizenScoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCORE, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(SCORE_EVENT_NAME, { detail: state }));
  } catch (error) {
    console.error('[KaizenScore] Error al guardar puntuación', error);
  }
}

/**
 * Función global para otorgar puntos desde cualquier módulo de forma desacoplada
 */
export function awardKaizenPoints(points: number, sourceModule: string, reason: string): void {
  const current = loadScoreState();
  const entry: ScoreLogEntry = {
    id: `sc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    points,
    sourceModule,
    reason,
  };

  const wasGoalCompletedBefore = current.todayPoints >= current.dailyGoalPoints;
  const newTodayPoints = current.todayPoints + points;
  const isGoalCompletedNow = newTodayPoints >= current.dailyGoalPoints;

  // Si con esta acción alcanza por primera vez la meta del 1% del día, otorgar bono de hito
  let bonusPoints = 0;
  let bonusEntry: ScoreLogEntry | null = null;
  if (!wasGoalCompletedBefore && isGoalCompletedNow) {
    bonusPoints = 25; // 25 puntos bono por alcanzar el hito del 1% diario
    bonusEntry = {
      id: `sc-bonus-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: bonusPoints,
      sourceModule: 'system',
      reason: '¡Hito Kaizen alcanzado! Completaste el 1% de mejora de hoy',
    };
  }

  const updatedHistory = bonusEntry
    ? [bonusEntry, entry, ...current.history].slice(0, 50)
    : [entry, ...current.history].slice(0, 50);

  const updated: KaizenScoreState = {
    ...current,
    totalPoints: current.totalPoints + points + bonusPoints,
    todayPoints: newTodayPoints + bonusPoints,
    lastActiveDate: getTodayString(),
    history: updatedHistory,
  };

  saveScoreState(updated);

  // Emitir evento de notificación visual tipo toast
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        points: points + bonusPoints,
        reason,
        isMilestone: !wasGoalCompletedBefore && isGoalCompletedNow,
      },
    })
  );
}

/**
 * Restablece la puntuación a 0 puntos
 */
export function resetScoreState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SCORE);
    window.dispatchEvent(new CustomEvent(SCORE_EVENT_NAME, { detail: INITIAL_SCORE_STATE }));
  } catch (e) {
    console.error('[KaizenScore] Error al reiniciar puntuación', e);
  }
}

/**
 * Hook de React para acceder reactivamente al sistema de puntuación
 */
export function useKaizenScore() {
  const [scoreState, setScoreState] = useState<KaizenScoreState>(() => loadScoreState());
  const [lastToast, setLastToast] = useState<{
    points: number;
    reason: string;
    isMilestone: boolean;
  } | null>(null);

  useEffect(() => {
    const handleScoreChange = (e: Event) => {
      const customEvent = e as CustomEvent<KaizenScoreState>;
      if (customEvent.detail) {
        setScoreState(customEvent.detail);
      } else {
        setScoreState(loadScoreState());
      }
    };

    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{
        points: number;
        reason: string;
        isMilestone: boolean;
      }>;
      if (customEvent.detail) {
        setLastToast(customEvent.detail);
        const timer = setTimeout(() => {
          setLastToast(null);
        }, 3500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener(SCORE_EVENT_NAME, handleScoreChange);
    window.addEventListener(TOAST_EVENT_NAME, handleToast);

    return () => {
      window.removeEventListener(SCORE_EVENT_NAME, handleScoreChange);
      window.removeEventListener(TOAST_EVENT_NAME, handleToast);
    };
  }, []);

  const addPoints = useCallback((points: number, sourceModule: string, reason: string) => {
    awardKaizenPoints(points, sourceModule, reason);
  }, []);

  const resetScore = useCallback(() => {
    resetScoreState();
    setScoreState({ ...INITIAL_SCORE_STATE });
  }, []);

  // Porcentaje del 1% diario alcanzado (0 a 100%)
  const dailyPercent = Math.min(
    100,
    Math.round((scoreState.todayPoints / scoreState.dailyGoalPoints) * 100)
  );

  return {
    scoreState,
    dailyPercent,
    lastToast,
    addPoints,
    resetScore,
  };
}
