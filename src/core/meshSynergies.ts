/**
 * @file src/core/meshSynergies.ts
 * @description Malla Entramada de Sinergias Cruzadas (Cross-Module Synergies).
 * Conecta los eventos de un módulo para provocar efectos cascada beneficiosos en otros:
 * - Sesión de Gym completada -> Auto-marca el hábito de entrenamiento en TRANSMUTE.
 * - Próxima acción en FORJA completada -> Avanza hábito de enfoque/trabajo profundo.
 * - Todos los hábitos completados -> Dispara hito Kaizen con feedback sonoro y visual.
 */

import { useEffect } from 'react';
import { kaizenBus } from '../sdk/bus';
import { KaizenContracts } from '../sdk/contracts';
import { soundEngine } from './sound';
import { awardKaizenPoints } from './scoring';

export function initializeMeshSynergies(): () => void {
  const cleanups: Array<() => void> = [];

  // 1. Gym -> Hábitos (TRANSMUTE)
  const unsubGym = kaizenBus.on(KaizenContracts.GymSessionCompleted, (payload) => {
    soundEngine.playComplete();

    // Intentar auto-marcar hábito relacionado con gym o ejercicio en TRANSMUTE
    try {
      const raw = localStorage.getItem('transmute-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const habits: Array<{ id: string; name: string; completedDays?: Record<string, boolean> }> =
          parsed?.state?.habits ?? [];
        const today = new Date().toISOString().split('T')[0];

        // Buscar un hábito que contenga palabras clave de entrenamiento
        const gymHabit = habits.find((h) => {
          const name = (h.name || '').toLowerCase();
          return (
            name.includes('gym') ||
            name.includes('entrena') ||
            name.includes('ejercicio') ||
            name.includes('fuerza') ||
            name.includes('deporte') ||
            name.includes('pesas')
          );
        });

        if (gymHabit && !gymHabit.completedDays?.[today]) {
          import('../modules/habits/transmute/src/store/useStore')
            .then(({ useStore }) => {
              const { toggleHabit } = useStore.getState();
              toggleHabit(gymHabit.id, today);
              console.info(
                `[MeshSynergy] Hábito "${gymHabit.name}" auto-completado tras entrenamiento en Punto Fuerte.`
              );
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[MeshSynergy] Error intentando sinergia Gym -> Hábitos:', err);
    }
  });
  cleanups.push(unsubGym);

  // 2. FORJA -> Auto-marca hábito de enfoque/trabajo profundo y feedback
  const unsubForjaAction = kaizenBus.on(KaizenContracts.ForjaNextActionDone, (_payload) => {
    try {
      const raw = localStorage.getItem('transmute-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const habits: Array<{ id: string; name: string; completedDays?: Record<string, boolean> }> =
          parsed?.state?.habits ?? [];
        const today = new Date().toISOString().split('T')[0];

        // Buscar un hábito que contenga palabras clave de foco, proyecto o trabajo profundo
        const focusHabit = habits.find((h) => {
          const name = (h.name || '').toLowerCase();
          return (
            name.includes('foco') ||
            name.includes('focus') ||
            name.includes('profundo') ||
            name.includes('forja') ||
            name.includes('proyecto') ||
            name.includes('trabajo') ||
            name.includes('estudio')
          );
        });

        if (focusHabit && !focusHabit.completedDays?.[today]) {
          import('../modules/habits/transmute/src/store/useStore')
            .then(({ useStore }) => {
              const { toggleHabit } = useStore.getState();
              toggleHabit(focusHabit.id, today);
              console.info(
                `[MeshSynergy] Hábito "${focusHabit.name}" auto-completado tras avanzar acción en FORJA.`
              );
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[MeshSynergy] Error intentando sinergia FORJA -> Hábitos:', err);
    }
  });
  cleanups.push(unsubForjaAction);

  const unsubForjaProject = kaizenBus.on(KaizenContracts.ForjaProjectCompleted, (payload) => {
    soundEngine.playMilestone();
    awardKaizenPoints(50, 'projects', `Hito Forjado: Proyecto "${payload.name}" completado`);
  });
  cleanups.push(unsubForjaProject);

  // 3. Hábitos: Hito de rachas consecutivas (3, 7, 14, 21, 30 días)
  const unsubHabitToggled = kaizenBus.on(KaizenContracts.HabitToggled, (payload) => {
    if (payload.completed && [3, 7, 14, 21, 30].includes(payload.streak)) {
      soundEngine.playMilestone();
      awardKaizenPoints(
        payload.streak * 5,
        'habits',
        `Racha Forjada: ${payload.streak} días seguidos en "${payload.habitTitle}"`
      );
    }
  });
  cleanups.push(unsubHabitToggled);

  // 4. Hábitos perfectos -> Día Dorado
  const unsubHabits = kaizenBus.on(KaizenContracts.HabitsAllDailyDone, (payload) => {
    soundEngine.playMilestone();
    awardKaizenPoints(30, 'habits', `Día Dorado: ${payload.count} hábitos completados al 100%`);
  });
  cleanups.push(unsubHabits);

  // 5. Lectura -> Hábitos (TRANSMUTE)
  const unsubReading = kaizenBus.on(KaizenContracts.ReadingSessionFinished, (_payload) => {
    try {
      const raw = localStorage.getItem('transmute-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const habits: Array<{ id: string; name: string; completedDays?: Record<string, boolean> }> =
          parsed?.state?.habits ?? [];
        const today = new Date().toISOString().split('T')[0];

        // Buscar un hábito que contenga palabras clave de lectura o libros
        const readingHabit = habits.find((h) => {
          const name = (h.name || '').toLowerCase();
          return (
            name.includes('lectura') ||
            name.includes('leer') ||
            name.includes('libro') ||
            name.includes('read') ||
            name.includes('páginas') ||
            name.includes('paginas')
          );
        });

        if (readingHabit && !readingHabit.completedDays?.[today]) {
          import('../modules/habits/transmute/src/store/useStore')
            .then(({ useStore }) => {
              const { toggleHabit } = useStore.getState();
              toggleHabit(readingHabit.id, today);
              console.info(
                `[MeshSynergy] Hábito "${readingHabit.name}" auto-completado tras sesión de Lectura.`
              );
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[MeshSynergy] Error intentando sinergia Lectura -> Hábitos:', err);
    }
  });
  cleanups.push(unsubReading);

  return () => {
    cleanups.forEach((fn) => fn());
  };
}

/**
 * Hook de React para activar la malla entramada en el ciclo de vida del Kernel
 */
export function useMeshSynergies(): void {
  useEffect(() => {
    const cleanup = initializeMeshSynergies();
    return cleanup;
  }, []);
}
