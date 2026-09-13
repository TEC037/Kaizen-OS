/**
 * @file src/modules/habits/HabitsWidget.tsx
 * @description Widget de TRANSMUTE para el Dashboard de Kaizen OS.
 * Refleja en vivo el estado persistido por el módulo (transmute-storage) y
 * permite marcar hábitos de hoy sin salir del dashboard.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { Check, Square, ArrowRight } from 'lucide-react';

interface TransmuteHabit {
  id: string;
  name: string;
  completedDays?: Record<string, boolean>;
}

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const loadTransmuteState = () => {
  try {
    const raw = localStorage.getItem('transmute-storage');
    if (!raw) return { habits: [] as TransmuteHabit[], selectedDate: todayLocal() };
    const parsed = JSON.parse(raw) as { state?: { habits?: TransmuteHabit[]; selectedDate?: string } };
    return {
      habits: parsed.state?.habits ?? [],
      selectedDate: parsed.state?.selectedDate ?? todayLocal(),
    };
  } catch {
    return { habits: [] as TransmuteHabit[], selectedDate: todayLocal() };
  }
};

export const HabitsWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [state, setState] = useState(loadTransmuteState);

  useEffect(() => {
    const refresh = () => setState(loadTransmuteState());
    window.addEventListener('storage', refresh);
    window.addEventListener('transmute:habit-completed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('transmute:habit-completed', refresh);
    };
  }, []);

  const toggleFromWidget = (id: string) => {
    const shallow = localStorage.getItem('transmute-storage');
    if (!shallow) return;
    import('./transmute/src/store/useStore').then(({ useStore }) => {
      const { toggleHabit } = useStore.getState();
      toggleHabit(id, state.selectedDate);
      setState(loadTransmuteState());
    });
  };

  const habits = state.habits ?? [];
  const completed = habits.filter((h) => h.completedDays?.[state.selectedDate]).length;
  const total = habits.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <ModuleWidget
      id="habits-daily"
      moduleId="habits"
      title="Hábitos de Hoy"
      targetPath="/habits"
      onNavigate={onNavigate}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
          <span>Progreso de hoy: {completed}/{total} transmutados</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="w-full bg-zinc-200 h-2 border border-zinc-300">
          <div
            className="bg-zinc-800 h-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {habits.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">
            Ninguna transmutación activa. Entra al módulo para forjar tus hábitos.
          </p>
        ) : (
          <div className="space-y-1.5 pt-1">
            {habits.slice(0, 4).map((habit) => {
              const done = !!habit.completedDays?.[state.selectedDate];
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleFromWidget(habit.id)}
                  className="flex items-center justify-between p-2 border border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-700">
                      {done ? (
                        <span className="w-4 h-4 flex items-center justify-center bg-zinc-900 text-white">
                          <Check size={12} />
                        </span>
                      ) : (
                        <span className="w-4 h-4 flex items-center justify-center border border-zinc-400 bg-white">
                          <Square size={10} className="text-transparent" />
                        </span>
                      )}
                    </span>
                    <span className={done ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                      {habit.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/habits')}
            className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Gestionar todos los hábitos</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};