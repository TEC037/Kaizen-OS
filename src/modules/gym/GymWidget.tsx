/**
 * @file src/modules/gym/GymWidget.tsx
 * @description Widget del módulo "Punto Fuerte" (FitAi) para el Dashboard de Kaizen OS.
 * Incluye registro rápido de sesión en 1 clic (+20 min) que dispara la sinergia con TRANSMUTE.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { STORAGE_KEYS } from './fitai/src/config/constants';
import { WorkoutSessionLog, UserProfile } from './fitai/src/types';
import { todayStamp, readKaizenSessions, recordWorkoutSession } from './sessions';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { awardKaizenPoints } from '../../core/scoring';
import { Dumbbell, ArrowRight, Flame, CheckCircle2, Zap } from 'lucide-react';

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
    window.addEventListener('storage_gym_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage_gym_updated', handleStorage);
    };
  }, [refresh]);

  const quickLogWorkout = () => {
    recordWorkoutSession({
      durationSeconds: 1200, // 20 min
      volumeKg: 1200,
      setsCompleted: 4,
    });
    soundEngine.playComplete();
    awardKaizenPoints(30, 'gym', 'Sesión rápida de entrenamiento (20 min)');
    kaizenBus.emit(KaizenContracts.GymSessionCompleted, {
      durationMinutes: 20,
      intensity: 'mid',
      volumeKg: 1200,
    });
    refresh();
  };

  const lastSession = history[0] ?? sessions[0];
  const totalSessions = history.length + sessions.length;
  const weeklyCompliance =
    typeof profile?.weeklyCompliance === 'number' ? profile.weeklyCompliance : null;

  const today = todayStamp();
  const trainedToday =
    (history.length > 0 && history.some((s) => s.date === today)) ||
    (sessions.length > 0 && sessions.some((s) => s.date === today));

  return (
    <ModuleWidget
      id="gym-overview"
      moduleId="gym"
      title="Punto Fuerte"
      targetPath="/gym"
      onNavigate={onNavigate}
    >
      <div className="space-y-3 font-mono text-xs">
        {/* Resumen de última sesión */}
        {lastSession ? (
          <div className="p-3 border border-stone-200 bg-[#faf8f1] rounded-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <Dumbbell size={14} className="text-red-700" />
                <span className="truncate">Última: {lastSession.routineName}</span>
              </div>
              <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="border border-stone-200 bg-white p-1 rounded-xs">
                <span className="text-stone-500 block text-[8px] uppercase">FECHA</span>
                <span className="font-bold text-stone-800">{lastSession.date}</span>
              </div>
              <div className="border border-stone-200 bg-white p-1 rounded-xs">
                <span className="text-stone-500 block text-[8px] uppercase">DURACIÓN</span>
                <span className="font-bold text-stone-800">
                  {lastSession.durationMinutes} min
                </span>
              </div>
              <div className="border border-stone-200 bg-white p-1 rounded-xs">
                <span className="text-stone-500 block text-[8px] uppercase">VOLUMEN</span>
                <span className="font-bold text-stone-800">
                  {lastSession.totalVolumeKg.toLocaleString()} kg
                </span>
              </div>
            </div>

            {lastSession.caloriesBurned > 0 && (
              <p className="text-[10px] text-stone-600 flex items-center gap-1">
                <Flame size={11} className="text-amber-600" />
                <span>~{lastSession.caloriesBurned} kcal quemadas · {lastSession.totalSets} series</span>
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic py-2">
            Aún no hay entrenamientos registrados en Punto Fuerte.
          </p>
        )}

        {/* Botón de micro-acción contextual */}
        {trainedToday ? (
          <div className="flex items-center justify-between p-2.5 border border-emerald-300 bg-emerald-50/80 rounded-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
              <span className="text-[11px] text-emerald-950 font-bold">
                Entrenamiento de hoy completado (+30 pts)
              </span>
            </div>
            <button
              type="button"
              onClick={quickLogWorkout}
              className="px-2 py-0.5 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-xs text-[10px] font-mono cursor-pointer transition-colors"
              title="Registrar sesión extra o estiramiento"
            >
              + Extra 15m
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 border border-red-200 bg-red-50/50 rounded-sm">
            <div className="flex items-center gap-1.5 min-w-0">
              <Zap size={13} className="text-red-600 shrink-0" />
              <span className="text-[11px] text-red-950 font-bold">¿Entrenaste hoy?</span>
            </div>

            <button
              type="button"
              onClick={quickLogWorkout}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xs text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
              title="Registrar sesión de 20 min (+30 pts Kaizen y auto-marca hábito)"
            >
              + Registrar 20 min
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {weeklyCompliance !== null ? (
            <span className="text-[11px] text-stone-600">
              Cumplimiento: <strong className="text-stone-900">{weeklyCompliance}%</strong>
            </span>
          ) : (
            <span className="text-[11px] text-stone-600">
              Sesiones totales: <strong className="text-stone-900">{totalSessions}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/gym')}
            className="text-xs font-mono text-stone-700 hover:text-stone-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Abrir Punto Fuerte</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};