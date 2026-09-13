import React, { useState } from 'react';
import { Routine } from '../../types';
import { Icon } from '../Icon';

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (routine: Routine) => void;
}

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  isOpen,
  onClose,
  onSaveRoutine,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'fuerza' | 'cardio' | 'ppl' | 'movilidad'>('fuerza');
  const [difficulty, setDifficulty] = useState<'Baja' | 'Moderada' | 'Alta' | 'Extrema'>('Alta');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [exercisesCount, setExercisesCount] = useState(6);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRoutine: Routine = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      category,
      difficulty,
      tag: category.toUpperCase(),
      durationMinutes,
      exercisesCount,
      muscleIcons: ['fitness_center', 'bolt', 'accessibility_new'],
      description: description.trim() || 'Rutina personalizada creada por el usuario.',
      lastPerformed: 'Creada recientemente',
    };

    onSaveRoutine(newRoutine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="add_circle" size={22} className="text-[#c3f400]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Crear Rutina Personalizada
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
              Nombre de la Rutina
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Torso B - Énfasis Deltoides"
              className="w-full mt-1.5 px-3.5 py-2.5 bg-[#101319] rounded-xl text-sm text-white border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as 'fuerza' | 'cardio' | 'ppl' | 'movilidad')}
                className="w-full mt-1.5 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
              >
                <option value="fuerza">Fuerza & Hipertrofia</option>
                <option value="cardio">Cardio / Intervalos</option>
                <option value="ppl">Empuje / Tirón / Pierna</option>
                <option value="movilidad">Movilidad</option>
              </select>
            </div>

            <div>
              <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
                Dificultad
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'Baja' | 'Moderada' | 'Alta' | 'Extrema')}
                className="w-full mt-1.5 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
              >
                <option value="Baja">Baja</option>
                <option value="Moderada">Moderada</option>
                <option value="Alta">Alta</option>
                <option value="Extrema">Extrema</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
                Duración (minutos)
              </label>
              <input
                type="number"
                min="10"
                max="180"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                className="w-full mt-1.5 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white font-bold border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
              />
            </div>

            <div>
              <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
                Nº de Ejercicios
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={exercisesCount}
                onChange={(e) => setExercisesCount(parseInt(e.target.value) || 5)}
                className="w-full mt-1.5 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white font-bold border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
              />
            </div>
          </div>

          <div>
            <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
              Descripción / Objetivos
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enfoque principal, descansos sugeridos, técnica..."
              className="w-full mt-1.5 px-3.5 py-2 bg-[#101319] rounded-xl text-xs text-white border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400] resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full bg-[#272a31] text-[#c4c9ac] font-headline text-xs font-semibold hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold hover:brightness-105 shadow-md"
            >
              Guardar Rutina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
