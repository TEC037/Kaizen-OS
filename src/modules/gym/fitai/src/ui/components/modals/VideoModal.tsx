import React from 'react';
import { Exercise } from '../../types';
import { ExerciseImage } from '../ExerciseImage';
import { Icon } from '../Icon';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise | null;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, exercise }) => {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="videocam" size={22} className="text-[#c3f400]" />
            <h3 className="font-headline text-base sm:text-lg text-white font-bold truncate">
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31] shrink-0"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Demostración animada del dataset (Gym Visual) */}
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-[#0b0e14]">
          <ExerciseImage
            gifUrl={exercise.gifUrl}
            imageUrl={exercise.imageUrl}
            alt={exercise.name}
            attribution={exercise.attribution}
            className="aspect-video w-full"
          />
        </div>

        {/* Cues */}
        <div className="flex flex-col gap-2 bg-[#191c22] p-3 rounded-xl border border-white/[0.04]">
          <span className="font-headline text-xs font-bold text-[#c3f400] uppercase tracking-wider">
            Claves de Ejecución
          </span>
          <ul className="text-xs text-[#c4c9ac] space-y-1 font-body">
            {exercise.notes ? (
              <li className="flex items-start gap-1.5">
                <span className="text-[#4ae176] font-bold">•</span>
                {exercise.notes}
              </li>
            ) : null}
            <li className="flex items-start gap-1.5">
              <span className="text-[#4ae176] font-bold">•</span>
              Retracción y depresión escapular completa antes de despegar la carga.
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#4ae176] font-bold">•</span>
              Pausa isométrica de 1 segundo en el punto de estiramiento.
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white font-headline text-xs font-bold transition-colors"
        >
          Volver al Entrenamiento
        </button>
      </div>
    </div>
  );
};