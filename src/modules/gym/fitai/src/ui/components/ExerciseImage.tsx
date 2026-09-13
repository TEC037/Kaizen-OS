import React, { useState } from 'react';
import { Icon } from './Icon';

interface ExerciseImageProps {
  /** GIF animado del dataset (Gym Visual). URL absoluta. */
  gifUrl?: string;
  /** Imagen estática del dataset. URL absoluta. */
  imageUrl?: string;
  alt: string;
  className?: string;
  /** Atribución obligatoria de la licencia (© Gym visual). */
  attribution?: string;
  showAttribution?: boolean;
}

type Stage = 'gif' | 'image' | 'placeholder';

/**
 * Muestra el media de un ejercicio del dataset de forma CSS-aliadá:
 * `object-contain` (sin recortar), atribución de la licencia y fallback
 * progresivo GIF → imagen → placeholder.
 */
export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  gifUrl,
  imageUrl,
  alt,
  className = '',
  attribution,
  showAttribution = true,
}) => {
  const [stage, setStage] = useState<Stage>(() => {
    if (gifUrl) return 'gif';
    if (imageUrl) return 'image';
    return 'placeholder';
  });

  const src = (stage === 'gif' ? gifUrl : imageUrl) || '';

  const handleError = () => {
    if (stage === 'gif' && imageUrl) {
      setStage('image');
    } else {
      setStage('placeholder');
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#0b0e14] flex items-center justify-center ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          onError={handleError}
          className="w-full h-full object-contain"
        />
      ) : (
        <Icon name="fitness_center" size={26} className="text-[#444933] select-none" />
      )}
      {showAttribution && attribution && (
        <span className="absolute bottom-0.5 right-1.5 font-headline text-[8px] text-white/45 select-none pointer-events-none px-1 py-0.5 rounded bg-black/25">
          {attribution}
        </span>
      )}
    </div>
  );
};