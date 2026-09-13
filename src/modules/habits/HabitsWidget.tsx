/**
 * @file src/modules/habits/HabitsWidget.tsx
 * @description Widget de TRANSMUTE para el Dashboard de Kaizen OS.
 * Refleja en vivo el estado persistido por el módulo (transmute-storage) y
 * permite marcar hábitos de hoy sin salir del dashboard.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { createModuleStorage } from '../../sdk/storage';
import { Check, Square, ArrowRight, Flame, Plus } from 'lucide-react';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';

interface TransmuteHabit {
  id: string;
  name: string;
  completedDays?: Record<string, boolean>;
}

interface TransmuteState {
  habits: TransmuteHabit[];
  selectedDate: string;
}

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const computeStreak = (completedDays?: Record<string, boolean>): number => {
  if (!completedDays) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (completedDays[dateStr]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
};

/**
 * Storage namespaced de hábitos con back-compat de la clave v1 `transmute-storage`.
 * El widget ya NO lee localStorage directamente: pasa por el SDK.
 */
const transmuteStorage = createModuleStorage<TransmuteState>({
  scope: 'habits',
  version: 1,
  defaults: { habits: [], selectedDate: todayLocal() },
  storageKey: 'transmute-storage',
  parse: (raw) => {
    const parsed = raw as { state?: { habits?: TransmuteHabit[]; selectedDate?: string } } | null;
    return {
      habits: parsed?.state?.habits ?? [],
      selectedDate: parsed?.state?.selectedDate ?? todayLocal(),
    };
  },
  eventName: 'transmute:storage-change',
});

const loadTransmuteState = () => transmuteStorage.load();

export const HabitsWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [state, setState] = useState(loadTransmuteState);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newHabitName.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const { useStore } = await import('./transmute/src/store/useStore');
      await useStore.getState().addHabit({
        name: trimmed,
        area: 'Dominio del Ser',
      });
      soundEngine.playTap();
      const next = loadTransmuteState();
      setState(next);
      setNewHabitName('');
      setIsAdding(false);
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const refresh = () => setState(loadTransmuteState());
    const unsubscribe = transmuteStorage.subscribe(refresh);
    window.addEventListener('transmute:habit-completed', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('transmute:habit-completed', refresh);
    };
  }, []);

  const toggleFromWidget = (id: string) => {
    const shallow = localStorage.getItem('transmute-storage');
    if (!shallow) return;
    import('./transmute/src/store/useStore').then(({ useStore }) => {
      const store = useStore.getState();
      const habit = (state.habits ?? []).find((h) => h.id === id);
      const willBeDone = !habit?.completedDays?.[state.selectedDate];

      store.toggleHabit(id, state.selectedDate);
      soundEngine.playComplete();

      if (habit) {
        const updatedDays = { ...(habit.completedDays || {}), [state.selectedDate]: willBeDone };
        const streak = computeStreak(updatedDays);
        kaizenBus.emit(KaizenContracts.HabitToggled, {
          habitId: id,
          habitTitle: habit.name,
          completed: willBeDone,
          streak,
        });
      }

      const nextState = loadTransmuteState();
      setState(nextState);

      // Si todos los hábitos quedaron completados, emitir hito de día dorado
      const nextHabits = nextState.habits ?? [];
      const allDone = nextHabits.length > 0 && nextHabits.every((h) => h.completedDays?.[nextState.selectedDate]);
      if (allDone && willBeDone) {
        kaizenBus.emit(KaizenContracts.HabitsAllDailyDone, {
          date: nextState.selectedDate,
          count: nextHabits.length,
        });
      }
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
              const streak = computeStreak(habit.completedDays);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleFromWidget(habit.id)}
                  className="flex items-center justify-between p-2 border border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 cursor-pointer transition-colors text-xs group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-700 shrink-0">
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
                    <span className={`truncate ${done ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {habit.name}
                    </span>
                  </div>

                  {streak > 0 && (
                    <div
                      className={`flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 shrink-0 border transition-colors ${
                        streak >= 7
                          ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-semibold'
                          : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                      title={`Racha: ${streak} día${streak > 1 ? 's' : ''} consecutivos`}
                    >
                      <Flame size={11} className={streak >= 7 ? 'text-amber-600 fill-amber-500' : 'text-stone-400'} />
                      <span>{streak}d</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick add inline habit */}
        {isAdding ? (
          <form onSubmit={handleCreateHabit} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              autoFocus
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Nombre del nuevo hábito..."
              disabled={isSubmitting}
              className="flex-1 text-xs px-2 py-1 border border-stone-400 bg-white font-mono placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newHabitName.trim()}
              className="px-2 py-1 text-[11px] font-mono bg-stone-900 text-stone-100 hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setIsAdding(false);
                setNewHabitName('');
              }}
              className="px-1.5 py-1 text-[11px] font-mono text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              ✕
            </button>
          </form>
        ) : (
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setIsAdding(true);
              }}
              className="text-[11px] font-mono text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>Nuevo hábito</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onNavigate('/habits');
              }}
              className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
            >
              <span>Gestionar todos</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </ModuleWidget>
  );
};