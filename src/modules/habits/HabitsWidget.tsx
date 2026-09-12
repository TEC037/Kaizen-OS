/**
 * @file src/modules/habits/HabitsWidget.tsx
 * @description Widget de Hábitos para el Dashboard de Kaizen OS.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { HabitItem, INITIAL_HABITS } from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { awardKaizenPoints } from '../../core/scoring';
import { Check, Square, ArrowRight } from 'lucide-react';

export const HabitsWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    loadCustomData<HabitItem[]>('habits_list', INITIAL_HABITS)
  );

  useEffect(() => {
    // Escuchar cambios guardados por la página completa
    const handleStorage = () => {
      setHabits(loadCustomData<HabitItem[]>('habits_list', INITIAL_HABITS));
    };
    window.addEventListener('storage_habits_updated', handleStorage);
    return () => window.removeEventListener('storage_habits_updated', handleStorage);
  }, []);

  const toggleHabit = (id: string) => {
    const target = habits.find((h) => h.id === id);
    const willBeCompleted = target ? !target.completedToday : false;

    const updated = habits.map((h) =>
      h.id === id ? { ...h, completedToday: !h.completedToday } : h
    );
    setHabits(updated);
    saveCustomData('habits_list', updated);
    window.dispatchEvent(new Event('storage_habits_updated'));

    if (willBeCompleted && target) {
      awardKaizenPoints(10, 'habits', `Hábito cumplido: ${target.name}`);
    }
  };

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ModuleWidget
      id="habits-daily"
      moduleId="habits"
      title="Hábitos de Hoy"
      targetPath="/habits"
      onNavigate={onNavigate}
    >
      <div className="space-y-3">
        {/* Barra de progreso de alambre */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
          <span>Progreso de hoy: {completedCount}/{totalCount} completados</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
        <div className="w-full bg-zinc-200 h-2 border border-zinc-300">
          <div
            className="bg-zinc-800 h-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Lista rápida de hábitos con checklist */}
        {habits.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">
            No hay hábitos configurados actualmente.
          </p>
        ) : (
          <div className="space-y-1.5 pt-1">
            {habits.slice(0, 4).map((habit) => (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="flex items-center justify-between p-2 border border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-zinc-700">
                    {habit.completedToday ? (
                      <span className="w-4 h-4 flex items-center justify-center bg-zinc-900 text-white">
                        <Check size={12} />
                      </span>
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center border border-zinc-400 bg-white">
                        <Square size={10} className="text-transparent" />
                      </span>
                    )}
                  </span>
                  <span className={habit.completedToday ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                    {habit.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 border border-zinc-200 px-1 py-0.2">
                  {habit.targetFrequency}
                </span>
              </div>
            ))}
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
