import React, { useState } from 'react';
import { Icon } from '../Icon';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
  onSaveWeight: (newWeight: number) => void;
}

export const WeightModal: React.FC<WeightModalProps> = ({
  isOpen,
  onClose,
  currentWeight,
  onSaveWeight,
}) => {
  const [weight, setWeight] = useState(currentWeight);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="monitor_weight" size={22} className="text-[#c3f400]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Registrar Peso
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <p className="font-body text-xs text-[#c4c9ac]">
          Mantén tu registro matutino en ayunas para una mayor precisión del déficit o superávit.
        </p>

        {/* Input & Stepper */}
        <div className="flex flex-col items-center justify-center py-4 bg-[#101319] rounded-xl border border-white/[0.06]">
          <span className="font-headline text-xs text-[#c4c9ac] uppercase font-bold">
            Peso Actual
          </span>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setWeight((prev) => Math.max(30, +(prev - 0.2).toFixed(1)))}
              className="w-10 h-10 rounded-full bg-[#272a31] text-white flex items-center justify-center text-xl font-bold hover:bg-[#32353c] active:scale-95"
            >
              -
            </button>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-4xl text-white font-bold tabular-nums">
                {weight.toFixed(1)}
              </span>
              <span className="font-headline text-sm text-[#c4c9ac]">kg</span>
            </div>
            <button
              onClick={() => setWeight((prev) => +(prev + 0.2).toFixed(1))}
              className="w-10 h-10 rounded-full bg-[#272a31] text-white flex items-center justify-center text-xl font-bold hover:bg-[#32353c] active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
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
              onSaveWeight(weight);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold hover:brightness-105 shadow-md"
          >
            Guardar Peso
          </button>
        </div>
      </div>
    </div>
  );
};
