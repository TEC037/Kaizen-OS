/**
 * @file src/components/ui/KzScorePill.tsx
 * @description Átomo: Indicador atómico de puntos Kaizen con micro-animación ámbar.
 */

import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundEngine } from '../../core/sound';

export interface KzScorePillProps {
  points: number;
  dailyPercent?: number;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const KzScorePill: React.FC<KzScorePillProps> = ({
  points,
  dailyPercent,
  onClick,
  className = '',
  size = 'md',
}) => {
  const isClickable = Boolean(onClick);
  const isGoalDone = typeof dailyPercent === 'number' && dailyPercent >= 100;

  const handleClick = () => {
    if (onClick) {
      soundEngine.playTap();
      onClick();
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      whileTap={isClickable ? { scale: 0.97 } : undefined}
      onClick={isClickable ? handleClick : undefined}
      className={`inline-flex items-center gap-1.5 font-mono border rounded-sm select-none transition-all ${
        isGoalDone
          ? 'border-emerald-400 bg-emerald-50/90 text-emerald-950 hover:bg-emerald-100/90 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
          : 'border-amber-300/80 bg-amber-50/70 hover:bg-amber-100/70 text-amber-950'
      } ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${isClickable ? 'cursor-pointer' : 'cursor-default'} ${className}`}
      title="Puntos Kaizen acumulados y avance diario"
    >
      <Star
        size={13}
        className={isGoalDone ? 'text-emerald-600 fill-emerald-500 shrink-0' : 'text-amber-600 fill-amber-500 shrink-0'}
      />
      <span className="font-bold tracking-tight">{points} pts</span>
      {typeof dailyPercent === 'number' && (
        <>
          <span className={isGoalDone ? 'text-emerald-400' : 'text-amber-400/80'}>|</span>
          <span className={`${isGoalDone ? 'text-emerald-800' : 'text-amber-800'} text-[11px] font-medium`}>
            +1%: {dailyPercent}% {isGoalDone && '✓'}
          </span>
        </>
      )}
    </motion.button>
  );
};
