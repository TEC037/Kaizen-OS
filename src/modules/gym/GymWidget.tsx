/**
 * @file src/modules/gym/GymWidget.tsx
 * @description Widget del módulo "Punto Fuerte" (FitAi) para el Dashboard de Kaizen OS.
 * Muestra la última sesión y el cumplimiento semanal. Fuentes:
 * - Historial canónico del submódulo (fitai_history_v2) cuando persiste sesiones.
 * - Registro propio de Kaizen (kaizen_os_gym_sessions_v1), alimentado desde GymPage
 *   con el evento `punto-fuerte:workout-completed` para el flujo demo sin Supabase.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { STORAGE_KEYS } from './fitai/src/config/constants';
import { WorkoutSessionLog, UserProfile } from './fitai/src/types';
import { readKaizenSessions } from './sessions';
import { Dumbbell, ArrowRight, Flame, CheckCircle2 } from 'lucide-react';

function readHistory(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WorkoutSessionLog[]) : [];
  } catch {
    return [];
  }
}

function readProfile(): Partial<UserProfile> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<UserProfile>;
  } catch {
    return null;
  }
}

export const GymWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [history, setHistory] = useState<WorkoutSessionLog[]>(() => readHistory());
  const [sessions, setSessions] = useState<WorkoutSessionLog[]>(() => readKaizenSessions());
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(() => readProfile());

  const refresh = useCallback(() => {
    setHistory(readHistory());
    setSessions(readKaizenSessions());
    setProfile(readProfile());
  }, []);

  useEffect(() => {
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  const lastSession = history[0] ?? sessions[0];
  const totalSessions = history.length + sessions.length;
  const weeklyCompliance =
    typeof profile?.weeklyCompliance === 'number' ? profile.weeklyCompliance : null;

  return (
    <ModuleWidget
      id="gym-overview"
      moduleId="gym"
      title="Punto Fuerte"
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
              <CheckCircle2 size={14} className="text-green-600" />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-mono">
              <div className="border border-zinc-200 bg-white p-1">
                <span className="text-zinc-500 block text-[9px]">FECHA</span>
                <span className="font-semibold text-zinc-800">{lastSession.date}</span>
              </div>
              <div className="border border-zinc-200 bg-white p-1">
                <span className="text-zinc-500 block text-[9px]">DURACIÓN</span>
                <span className="font-semibold text-zinc-800">
                  {lastSession.durationMinutes} min
                </span>
              </div>
              <div className="border border-zinc-200 bg-white p-1">
                <span className="text-zinc-500 block text-[9px]">VOLUMEN</span>
                <span className="font-semibold text-zinc-800">
                  {lastSession.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
            </div>

            {lastSession.caloriesBurned > 0 && (
              <p className="text-[11px] text-zinc-600 italic flex items-center gap-1">
                <Flame size={11} className="text-orange-500" />
                ~{lastSession.caloriesBurned} kcal quemadas · {lastSession.totalSets} series
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic py-2">
            Aún no hay entrenamientos registrados en Punto Fuerte.
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          {weeklyCompliance !== null ? (
            <span className="text-xs font-mono text-zinc-600">
              Cumplimiento semanal:{' '}
              <strong className="text-zinc-900">{weeklyCompliance}%</strong>
            </span>
          ) : (
            <span className="text-xs font-mono text-zinc-600">
              Total sesiones: <strong className="text-zinc-900">{totalSessions}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/gym')}
            className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Abrir Punto Fuerte</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};