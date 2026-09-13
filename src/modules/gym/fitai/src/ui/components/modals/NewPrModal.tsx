import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { PersonalRecord } from '../../types';
import { Icon } from '../Icon';

interface NewPrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePr: (newPr: PersonalRecord) => void;
}

export const NewPrModal: React.FC<NewPrModalProps> = ({
  isOpen,
  onClose,
  onSavePr,
}) => {
  const [exercise, setExercise] = useState('Press de Banca');
  const [weight, setWeight] = useState(107.5);
  const [unit] = useState('kg');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c3f400', '#4ae176', '#ffffff'],
      });
    } catch {
      // ignore
    }

    const pr: PersonalRecord = {
      id: `pr-${Date.now()}`,
      exercise,
      weight,
      unit,
      date: '¡Hoy!',
      isRecent: true,
      delta: `+${(weight - 105).toFixed(1)} kg`,
      iconName: 'fitness_center',
    };

    onSavePr(pr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="emoji_events" size={22} className="text-[#c3f400]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Registrar Nuevo Récord (1 repetición máxima)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
              Ejercicio
            </label>
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
            >
              <option value="Press de Banca">Press de Banca</option>
              <option value="Sentadilla Profunda">Sentadilla Profunda</option>
              <option value="Peso Muerto Convencional">Peso Muerto Convencional</option>
              <option value="Press Militar">Press Militar</option>
              <option value="Dominadas con Lastre">Dominadas con Lastre</option>
              <option value="Remo con Barra T">Remo con Barra T</option>
            </select>
          </div>

          <div>
            <label className="font-headline text-xs uppercase text-[#c4c9ac] font-bold">
              Peso Levantado (1 rep máx)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                step="0.5"
                required
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-[#101319] rounded-xl text-sm font-headline text-white font-bold border border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#c3f400]"
              />
              <span className="px-3 py-2 bg-[#272a31] rounded-xl text-xs font-bold text-white">
                {unit}
              </span>
            </div>
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
              Guardar Récord
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
