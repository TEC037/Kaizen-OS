/**
 * @file src/modules/gym/GymPage.tsx
 * @description Módulo "Punto Fuerte" (FitAi): la aplicación completa de
 * entrenamiento embebida como submódulo Git en `src/modules/gym/fitai`.
 * Al completar un entrenamiento se otorgan puntos Kaizen (desacoplado vía evento).
 */

import React, { useEffect } from 'react';
import FitAiApp from './fitai/src/App';
import './fitai/src/index.css';
import { awardKaizenPoints } from '../../core/scoring';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { WorkoutSummary, recordWorkoutSession } from './sessions';

interface GymPageProps {
  onNavigate?: (path: string) => void;
}

const WORKOUT_COMPLETED_EVENT = 'punto-fuerte:workout-completed';

export const GymPage: React.FC<GymPageProps> = () => {
  useEffect(() => {
    const handleWorkoutCompleted = (e: Event) => {
      const detail = (e as CustomEvent<WorkoutSummary>).detail;
      const durationMin = Math.max(1, Math.round((detail?.durationSeconds ?? 0) / 60));
      awardKaizenPoints(
        30,
        'gym',
        `Entrenamiento completado en Punto Fuerte (${durationMin} min)`
      );
      recordWorkoutSession(detail ?? {});
      kaizenBus.emit(KaizenContracts.GymSessionCompleted, {
        durationMinutes: durationMin,
        intensity: 'mid',
        volumeKg: detail?.volumeKg,
      });
    };

    window.addEventListener(WORKOUT_COMPLETED_EVENT, handleWorkoutCompleted);
    return () =>
      window.removeEventListener(WORKOUT_COMPLETED_EVENT, handleWorkoutCompleted);
  }, []);

  return (
    <div
      className="punto-fuerte-app -mx-4 -my-4 sm:-mx-6 sm:-my-6 bg-[#101319] text-[#e1e2eb]"
      style={{ transform: 'translateZ(0)' }}
    >
      <FitAiApp />
    </div>
  );
};