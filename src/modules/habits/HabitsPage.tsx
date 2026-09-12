/**
 * @file src/modules/habits/HabitsPage.tsx
 * @description Pantalla completa del módulo de Hábitos en Kaizen OS.
 * Incluye checklist diario interactivo, matriz de progreso semanal, creación y estado vacío.
 */

import React, { useState } from 'react';
import { HabitItem, INITIAL_HABITS } from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { awardKaizenPoints } from '../../core/scoring';
import { EmptyState } from '../../components/EmptyState';
import { Check, Plus, RotateCcw, Trash2, Calendar, Target } from 'lucide-react';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    loadCustomData<HabitItem[]>('habits_list', INITIAL_HABITS)
  );
  const [newHabitName, setNewHabitName] = useState('');
  const [newCategory, setNewCategory] = useState('Salud');

  const updateHabits = (newItems: HabitItem[]) => {
    setHabits(newItems);
    saveCustomData('habits_list', newItems);
    window.dispatchEvent(new Event('storage_habits_updated'));
  };

  const toggleToday = (id: string) => {
    const target = habits.find((h) => h.id === id);
    const willBeCompleted = target ? !target.completedToday : false;

    const updated = habits.map((h) =>
      h.id === id ? { ...h, completedToday: !h.completedToday } : h
    );
    updateHabits(updated);

    if (willBeCompleted && target) {
      awardKaizenPoints(10, 'habits', `Hábito completado hoy: ${target.name}`);
    }
  };

  const toggleDayOfWeek = (habitId: string, dayIndex: number) => {
    const target = habits.find((h) => h.id === habitId);
    const willBeDone = target ? !target.weeklyProgress[dayIndex] : false;

    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      const progress = [...h.weeklyProgress];
      progress[dayIndex] = !progress[dayIndex];
      return { ...h, weeklyProgress: progress };
    });
    updateHabits(updated);

    if (willBeDone && target) {
      awardKaizenPoints(5, 'habits', `Registro semanal de hábito: ${target.name}`);
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: HabitItem = {
      id: `h-${Date.now()}`,
      name: newHabitName.trim(),
      category: newCategory,
      targetFrequency: 'Diario',
      completedToday: false,
      weeklyProgress: [false, false, false, false, false, false, false],
    };

    updateHabits([newHabit, ...habits]);
    awardKaizenPoints(5, 'habits', `Nuevo hábito definido: ${newHabit.name}`);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    updateHabits(habits.filter((h) => h.id !== id));
  };

  // Permite simular el estado vacío requerido por la especificación
  const clearAllHabits = () => {
    updateHabits([]);
  };

  const restoreInitialHabits = () => {
    updateHabits(INITIAL_HABITS);
  };

  const completedTodayCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="border border-zinc-300 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-800">
              MÓDULO: /habits
            </span>
            <span className="font-mono text-xs text-zinc-500">v1.0.0</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mt-1 tracking-tight">
            Seguimiento de Hábitos
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Checklist de micro-acciones diarias y consistencia semanal según la filosofía Kaizen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {habits.length > 0 ? (
            <button
              type="button"
              onClick={clearAllHabits}
              className="px-3 py-1.5 text-xs font-mono border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 flex items-center gap-1 cursor-pointer"
              title="Permite probar el estado vacío requerido"
            >
              <Trash2 size={13} />
              Vaciar hábitos (Probar estado vacío)
            </button>
          ) : (
            <button
              type="button"
              onClick={restoreInitialHabits}
              className="px-3 py-1.5 text-xs font-mono border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              Cargar hábitos de muestra
            </button>
          )}
        </div>
      </div>

      {/* Formulario simple de baja fidelidad para nuevo hábito */}
      <form
        onSubmit={handleAddHabit}
        className="border border-zinc-300 bg-zinc-50 p-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
      >
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="Escribe un nuevo hábito (ej: Leer 15 minutos, Estiramiento...)"
          className="flex-1 px-3 py-2 text-xs border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-800"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-zinc-300 bg-white text-zinc-800 focus:outline-none focus:border-zinc-800"
        >
          <option value="Salud">Salud</option>
          <option value="Productividad">Productividad</option>
          <option value="Mente">Mente</option>
          <option value="Aprendizaje">Aprendizaje</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Plus size={14} />
          <span>Añadir hábito</span>
        </button>
      </form>

      {/* Si no hay hábitos, mostrar Estado Vacío requerido */}
      {habits.length === 0 ? (
        <EmptyState
          id="habits-empty-state"
          title="No hay hábitos registrados en tu sistema"
          description="Aún no has configurado hábitos personales para dar seguimiento. Un hábito Kaizen se basa en pequeños pasos repetibles cada día."
          actionLabel="Cargar hábitos de demostración"
          onAction={restoreInitialHabits}
          variant="neutral"
        />
      ) : (
        <div className="space-y-6">
          {/* Métricas rápidas de alambre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-zinc-300 bg-white p-3">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Total Registrados
              </span>
              <p className="text-xl font-bold text-zinc-900 mt-0.5">{habits.length}</p>
            </div>
            <div className="border border-zinc-300 bg-white p-3">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Completados Hoy
              </span>
              <p className="text-xl font-bold text-zinc-900 mt-0.5">
                {completedTodayCount} / {habits.length}
              </p>
            </div>
            <div className="border border-zinc-300 bg-white p-3">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Eficacia de Hoy
              </span>
              <p className="text-xl font-bold text-zinc-900 mt-0.5">
                {Math.round((completedTodayCount / habits.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Tabla de hábitos y progreso semanal */}
          <div className="border border-zinc-300 bg-white overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-100 font-mono text-zinc-700">
                  <th className="p-3 w-12 text-center">Hoy</th>
                  <th className="p-3">Hábito / Micro-rutina</th>
                  <th className="p-3 w-28">Categoría</th>
                  <th className="p-3 text-center w-56">Progreso Semanal (L-D)</th>
                  <th className="p-3 w-16 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {habits.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Check de hoy */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleToday(h.id)}
                        className={`w-5 h-5 inline-flex items-center justify-center border cursor-pointer ${
                          h.completedToday
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'bg-white border-zinc-400 hover:border-zinc-700'
                        }`}
                        title="Marcar completado hoy"
                      >
                        {h.completedToday && <Check size={13} />}
                      </button>
                    </td>

                    {/* Nombre */}
                    <td className="p-3">
                      <span
                        className={`font-medium ${
                          h.completedToday ? 'line-through text-zinc-400' : 'text-zinc-900'
                        }`}
                      >
                        {h.name}
                      </span>
                    </td>

                    {/* Categoría */}
                    <td className="p-3">
                      <span className="font-mono text-[11px] px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700">
                        {h.category}
                      </span>
                    </td>

                    {/* Matriz semanal */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1 font-mono">
                        {h.weeklyProgress.map((done, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleDayOfWeek(h.id, idx)}
                            className={`w-6 h-6 text-[10px] border flex items-center justify-center cursor-pointer transition-colors ${
                              done
                                ? 'bg-zinc-800 text-white border-zinc-800'
                                : 'bg-white text-zinc-400 border-zinc-300 hover:border-zinc-500'
                            }`}
                            title={`Día ${WEEKDAYS[idx]}: Click para cambiar`}
                          >
                            {WEEKDAYS[idx]}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Eliminar */}
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteHabit(h.id)}
                        className="text-zinc-400 hover:text-red-700 p-1 cursor-pointer"
                        title="Eliminar hábito"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
