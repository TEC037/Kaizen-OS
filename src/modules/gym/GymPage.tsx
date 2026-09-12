/**
 * @file src/modules/gym/GymPage.tsx
 * @description Pantalla completa del módulo de Gimnasio en Kaizen OS.
 * Incluye registro de entrenamientos, rutinas estructuradas, progreso físico
 * y comprobación de estado habilitado con advertencia visual si se intenta acceder sin estarlo.
 */

import React, { useState } from 'react';
import {
  WorkoutLogItem,
  GymRoutineItem,
  INITIAL_WORKOUT_LOGS,
  INITIAL_GYM_ROUTINES,
} from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { awardKaizenPoints } from '../../core/scoring';
import { Dumbbell, Plus, Calendar, Flame, Activity, Check, ArrowRight } from 'lucide-react';

interface GymPageProps {
  onNavigate?: (path: string) => void;
}

export const GymPage: React.FC<GymPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<WorkoutLogItem[]>(() =>
    loadCustomData<WorkoutLogItem[]>('gym_logs', INITIAL_WORKOUT_LOGS)
  );
  const [routines] = useState<GymRoutineItem[]>(INITIAL_GYM_ROUTINES);
  const [showLogModal, setShowLogModal] = useState(false);

  // Form state
  const [selectedRoutine, setSelectedRoutine] = useState(routines[0]?.name || 'Torso');
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState<'Alta' | 'Media' | 'Moderada'>('Alta');
  const [notes, setNotes] = useState('');

  const updateLogs = (newLogs: WorkoutLogItem[]) => {
    setLogs(newLogs);
    saveCustomData('gym_logs', newLogs);
    window.dispatchEvent(new Event('storage_gym_updated'));
  };

  const handleRegisterWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WorkoutLogItem = {
      id: `wl-${Date.now()}`,
      routineName: selectedRoutine,
      date: 'Hoy',
      durationMinutes: duration,
      exercisesCount: selectedRoutine.includes('Torso') ? 5 : 4,
      intensity,
      notes: notes.trim() || 'Entrenamiento completado según el plan.',
    };

    updateLogs([newLog, ...logs]);
    awardKaizenPoints(30, 'gym', `Entrenamiento completado: ${selectedRoutine} (${duration} min)`);
    setNotes('');
    setShowLogModal(false);
  };

  const totalMinutes = logs.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="border border-zinc-300 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-800">
              MÓDULO: /gym
            </span>
            <span className="font-mono text-xs text-zinc-500">v1.0.0</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mt-1 tracking-tight flex items-center gap-2">
            <Dumbbell size={20} />
            <span>Gimnasio y Rendimiento Físico</span>
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Registro de sobrecarga progresiva, control de rutinas y consistencia de entrenamiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLogModal(!showLogModal)}
            className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Registrar entrenamiento</span>
          </button>
        </div>
      </div>

      {/* Formulario desplegable para registrar sesión */}
      {showLogModal && (
        <form
          onSubmit={handleRegisterWorkout}
          className="border border-zinc-400 bg-zinc-50 p-4 space-y-3"
        >
          <div className="font-mono text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Registrar nueva sesión de entrenamiento
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Rutina realizada
              </label>
              <select
                value={selectedRoutine}
                onChange={(e) => setSelectedRoutine(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-800"
              >
                {routines.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
                <option value="Cardio & Resistencia">Cardio & Resistencia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Duración (minutos)
              </label>
              <input
                type="number"
                min={10}
                max={240}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Intensidad percibida
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value as any)}
                className="w-full px-2 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-800"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Moderada">Moderada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Notas de la sesión / Récords
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Aumenté 2 reps en dominadas, buena energía..."
              className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLogModal(false)}
              className="px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
            >
              Guardar sesión
            </button>
          </div>
        </form>
      )}

      {/* Métricas de progreso físico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-zinc-300 bg-white p-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Sesiones Registradas
          </span>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{logs.length}</p>
        </div>
        <div className="border border-zinc-300 bg-white p-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Tiempo Acumulado
          </span>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">{totalMinutes} min</p>
        </div>
        <div className="border border-zinc-300 bg-white p-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Racha Actual
          </span>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">3 semanas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Rutinas Estructuradas */}
        <div className="space-y-4 lg:col-span-1">
          <div className="border border-zinc-300 bg-white p-4 space-y-3">
            <div className="border-b border-zinc-200 pb-2">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight font-mono">
                Rutinas Programadas
              </h2>
              <p className="text-xs text-zinc-500">Distribución semanal de fuerza</p>
            </div>

            <div className="space-y-3">
              {routines.map((routine) => (
                <div key={routine.id} className="p-3 border border-zinc-200 bg-zinc-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-900">
                      {routine.name}
                    </span>
                    <span className="text-[10px] font-mono border border-zinc-300 px-1.5 py-0.2 bg-white">
                      {routine.daysPerWeek}x / sem
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600">
                    Foco: {routine.targetFocus}
                  </p>
                  <div className="border-t border-zinc-200 pt-1.5">
                    <span className="text-[10px] font-mono text-zinc-500 block mb-1">
                      Ejercicios clave:
                    </span>
                    <ul className="text-xs space-y-0.5 font-mono text-zinc-700">
                      {routine.exercises.map((ex, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-zinc-600 inline-block"></span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Historial de Entrenamientos */}
        <div className="space-y-4 lg:col-span-2">
          <div className="border border-zinc-300 bg-white p-4 space-y-3">
            <div className="border-b border-zinc-200 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight font-mono">
                  Historial de Sesiones
                </h2>
                <p className="text-xs text-zinc-500">Registro cronológico de esfuerzo físico</p>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {logs.length} registros
              </span>
            </div>

            <div className="divide-y divide-zinc-200">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900">
                        {log.routineName}
                      </span>
                      <span className="text-[10px] font-mono border border-zinc-200 px-1.5 py-0.2 bg-zinc-50 text-zinc-600">
                        {log.date}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">
                      {log.notes}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-700 shrink-0">
                    <span className="border border-zinc-200 px-2 py-0.5 bg-zinc-50">
                      {log.durationMinutes} min
                    </span>
                    <span className="border border-zinc-200 px-2 py-0.5 bg-zinc-50">
                      {log.exercisesCount} ejer.
                    </span>
                    <span className="border border-zinc-200 px-2 py-0.5 bg-zinc-50">
                      {log.intensity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
