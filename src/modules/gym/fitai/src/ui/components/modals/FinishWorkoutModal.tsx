import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Icon } from '../Icon';

interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: {
    durationSeconds: number;
    volumeKg: number;
    setsCompleted: number;
  };
  onConfirmFinish: () => void;
}

export const FinishWorkoutModal: React.FC<FinishWorkoutModalProps> = ({
  isOpen,
  onClose,
  summary,
  onConfirmFinish,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c3f400', '#4ae176', '#7bd0ff', '#ffffff'],
        });
      } catch {
        // ignore if canvas unavailable
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(summary.durationSeconds / 60);
  const seconds = summary.durationSeconds % 60;
  const estimatedCalories = Math.round((summary.durationSeconds / 60) * 8.5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-[#1d2026] p-6 border border-white/[0.1] shadow-2xl flex flex-col items-center text-center gap-4">
        {/* Glowing Trophy Badge */}
        <div className="w-16 h-16 rounded-full bg-[#c3f400]/20 border border-[#c3f400]/40 flex items-center justify-center text-[#c3f400] shadow-[0_0_24px_rgba(195,244,0,0.3)]">
          <Icon name="emoji_events" size={36} className="text-[#c3f400]" />
        </div>

        <div className="flex flex-col">
          <span className="font-headline text-xs font-bold uppercase tracking-wider text-[#4ae176]">
            ¡Sesión Completada!
          </span>
          <h3 className="font-headline text-2xl text-white font-bold tracking-tight mt-0.5">
            Entrenamiento
          </h3>
          <p className="font-body text-xs text-[#c4c9ac] mt-1">
            Sobrecarga progresiva alcanzada con éxito. Excelente trabajo.
          </p>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2 w-full pt-1">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#101319] border border-white/[0.04]">
            <Icon name="timer" size={18} className="text-[#c3f400]" />
            <span className="font-headline text-base text-white font-bold mt-1">
              {minutes}m {seconds}s
            </span>
            <span className="font-headline text-[10px] text-[#c4c9ac]">
              Tiempo
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#101319] border border-white/[0.04]">
            <Icon name="fitness_center" size={18} className="text-[#4ae176]" />
            <span className="font-headline text-base text-white font-bold mt-1">
              {summary.volumeKg.toLocaleString()}
            </span>
            <span className="font-headline text-[10px] text-[#c4c9ac]">
              kg Total
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#101319] border border-white/[0.04]">
            <Icon
              name="local_fire_department"
              size={18}
              className="text-[#ffb4ab]"
            />
            <span className="font-headline text-base text-white font-bold mt-1">
              {estimatedCalories}
            </span>
            <span className="font-headline text-[10px] text-[#c4c9ac]">
              kcal
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full pt-2">
          <button
            type="button"
            onClick={onConfirmFinish}
            className="w-full py-3.5 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-sm font-bold shadow-[0_0_16px_rgba(195,244,0,0.35)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
          >
            Guardar & Ver Resumen
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-transparent text-[#c4c9ac] hover:text-white font-headline text-xs font-semibold"
          >
            Continuar Entrenando
          </button>
        </div>
      </div>
    </div>
  );
};
