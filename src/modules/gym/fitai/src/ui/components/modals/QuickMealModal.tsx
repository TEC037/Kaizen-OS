import React, { useState } from 'react';
import { Icon } from '../Icon';

interface QuickMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCalories: (cals: number, mealName: string) => void;
}

export const QuickMealModal: React.FC<QuickMealModalProps> = ({
  isOpen,
  onClose,
  onAddCalories,
}) => {
  const [mealName, setMealName] = useState('Batido Proteico Post-Entreno');
  const [calories, setCalories] = useState(380);
  const [proteinGrams, setProteinGrams] = useState(38);

  if (!isOpen) return null;

  const quickOptions = [
    { name: 'Batido Whey + Plátano', cals: 320, protein: 35 },
    { name: 'Arroz con Pollo', cals: 550, protein: 48 },
    { name: 'Avena con Proteína & Nueces', cals: 420, protein: 30 },
    { name: 'Tortilla de 4 Claras + Aguacate', cals: 290, protein: 26 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="restaurant" size={22} className="text-[#4ae176]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Comida Rápida
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Quick Options */}
        <div className="flex flex-col gap-1.5">
          <span className="font-headline text-[10px] uppercase text-[#c4c9ac] font-bold">
            Opciones Frecuentes
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {quickOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setMealName(opt.name);
                  setCalories(opt.cals);
                  setProteinGrams(opt.protein);
                }}
                className="text-left px-3 py-2 rounded-xl bg-[#191c22] hover:bg-[#272a31] border border-white/[0.04] flex items-center justify-between transition-colors"
              >
                <span className="font-headline text-xs text-white truncate max-w-[200px]">
                  {opt.name}
                </span>
                <span className="font-headline text-xs text-[#4ae176] font-semibold">
                  +{opt.cals} kcal
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.06]">
          <div>
            <label className="font-headline text-[10px] uppercase text-[#c4c9ac] font-bold">
              Descripción
            </label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#4ae176]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-headline text-[10px] uppercase text-[#c4c9ac] font-bold">
                Calorías (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white font-bold border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#4ae176]"
              />
            </div>
            <div>
              <label className="font-headline text-[10px] uppercase text-[#c4c9ac] font-bold">
                Proteína (g)
              </label>
              <input
                type="number"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(parseInt(e.target.value) || 0)}
                className="w-full mt-1 px-3 py-2 bg-[#101319] rounded-xl text-xs text-white font-bold border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-[#4ae176]"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-[#272a31] text-[#c4c9ac] font-headline text-xs font-semibold hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onAddCalories(calories, mealName);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-full bg-[#4ae176] text-[#003915] font-headline text-xs font-bold hover:brightness-105 shadow-md"
          >
            Registrar Comida
          </button>
        </div>
      </div>
    </div>
  );
};
