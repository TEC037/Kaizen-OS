/**
 * @file src/modules/gym/GymWidget.tsx
 * @description Widget de Gimnasio para el Dashboard de Kaizen OS.
 * Solo aparece cuando el módulo está habilitado.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { WorkoutLogItem, INITIAL_WORKOUT_LOGS } from '../../data/demoData';
import { loadCustomData } from '../../core/storage';
import { Dumbbell, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';

export const GymWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<WorkoutLogItem[]>(() =>
    loadCustomData<WorkoutLogItem[]>('gym_logs', INITIAL_WORKOUT_LOGS)
  );

  useEffect(() => {
    const handleStorage = () => {
      setLogs(loadCustomData<WorkoutLogItem[]>('gym_logs', INITIAL_WORKOUT_LOGS));
    };
    window.addEventListener('storage_gym_updated', handleStorage);
    return () => window.removeEventListener('storage_gym_updated', handleStorage);
  }, []);

  const lastSession = logs[0];

  return (
    <ModuleWidget
      id="gym-overview"
      moduleId="gym"
      title="Gimnasio & Entrenamientos"
      targetPath="/gym"
      onNavigate={onNavigate}
    >
      <div className="space-y-3">
        {/* Resumen de última sesión */}
        {lastSession ? (
          <div className="p-3 border border-zinc-200 bg-zinc-50/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                <Dumbbell size={14} className="text-zinc-700" />
                <span>Última sesión: {lastSession.routineName}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 border border-zinc-200 px-1 py-0.2 bg-white">
                {lastSession.date}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-mono">
              <div className="border border-zinc-200 bg-white p-1">
                <span className="text-zinc-500 block text-[9px]">DURACIÓN</span>
                <span className="font-semibold text-zinc-800">{lastSession.durationMinutes} min</span>
              </div>
              <div className="border border-zinc-200 bg-white p-1">
                <span className="text-zinc-500 block text-[9px]">EJERCICIOS</span>
                <span className="font-semibold text-zinc-800">{lastSession.exercisesCount}</span>
              </div>
              <div className="border border-zinc-200 bg-white p-1">
                <span className="text-zinc-500 block text-[9px]">INTENSIDAD</span>
                <span className="font-semibold text-zinc-800">{lastSession.intensity}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 italic">
              "{lastSession.notes}"
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic py-2">
            No hay entrenamientos registrados aún.
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-mono text-zinc-600">
            Total sesiones mes: <strong className="text-zinc-900">{logs.length}</strong>
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/gym')}
            className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Ver rutinas y registrar</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};
