import React from 'react';
import { DatasetExercise } from '../../../types';
import {
  getExerciseGifUrl,
  getExerciseImageUrl,
  translateCategory,
  translateEquipment,
  translateTarget,
} from '../../../services/exerciseDatabaseService';
import { Icon } from '../Icon';

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: DatasetExercise | null;
  onSelectExercise?: (exercise: DatasetExercise) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (exerciseId: string) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  onClose,
  exercise,
  onSelectExercise,
  isFavorite = false,
  onToggleFavorite,
}) => {
  if (!isOpen || !exercise) return null;

  const gifUrl = getExerciseGifUrl(exercise.gif_url);
  const imageUrl = getExerciseImageUrl(exercise.image);
  const mediaUrl = gifUrl || imageUrl;
  const steps = exercise.steps_es && exercise.steps_es.length > 0 ? exercise.steps_es : exercise.steps_en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-headline text-[10px] text-[#c3f400] font-bold uppercase tracking-wider">
              {translateCategory(exercise.category)} • {translateEquipment(exercise.equipment)}
            </span>
            <h2 className="font-headline text-xl text-white font-bold capitalize">
              {exercise.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31] shrink-0 cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Media Preview with Mandatory Attribution */}
        <div className="relative rounded-xl overflow-hidden bg-[#0b0e14] border border-white/[0.06] aspect-video flex items-center justify-center">
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt={exercise.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <Icon name="fitness_center" size={32} className="text-[#444933]" />
          )}

          <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] text-white/80 font-headline">
            {exercise.attribution || '© Gym visual — https://gymvisual.com/'}
          </div>
        </div>

        {/* Muscle Targets */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold">
            Objetivo: {translateTarget(exercise.target)}
          </span>
          {exercise.secondary_muscles?.map((sec, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full bg-[#272a31] text-[#c4c9ac] font-headline text-xs font-semibold border border-white/[0.04]"
            >
              {translateTarget(sec)}
            </span>
          ))}
        </div>

        {/* Step by Step Instructions */}
        {steps && steps.length > 0 && (
          <div className="flex flex-col gap-2 bg-[#191c22] p-3.5 rounded-xl border border-white/[0.04]">
            <span className="font-headline text-xs font-bold text-[#c3f400] uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="format_list_numbered" size={16} />
              Instrucciones Paso a Paso
            </span>
            <ol className="space-y-1.5 text-xs text-[#e1e2eb] font-body list-decimal list-inside pl-1">
              {steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(exercise.id)}
              type="button"
              className="p-3 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <Icon
                name={isFavorite ? 'favorite' : 'favorite_border'}
                size={20}
                className={isFavorite ? 'text-[#4ae176]' : 'text-[#c4c9ac]'}
              />
            </button>
          )}

          {onSelectExercise && (
            <button
              onClick={() => {
                onSelectExercise(exercise);
                onClose();
              }}
              type="button"
              className="flex-1 py-3 px-4 rounded-full bg-[#c3f400] hover:bg-[#b0dc00] text-[#161e00] font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Icon name="add" size={18} />
              Añadir Ejercicio a la Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
