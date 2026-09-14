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
      whileHover={isClickable ? { scale: 1.04, y: -1 } : undefined}
      whileTap={isClickable ? { scale: 0.96, y: 2 } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      onClick={isClickable ? handleClick : undefined}
      className={`inline-flex items-center gap-1.5 font-mono border-2 rounded-full select-none transition-all ${
        isGoalDone
          ? 'border-emerald-400 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 shadow-[0_2.5px_0_#86efac]'
          : 'border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-950 shadow-[0_2.5px_0_#fcd34d]'
      } ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-xs'
      } ${isClickable ? 'cursor-pointer active:shadow-none' : 'cursor-default'} ${className}`}
      title="Puntos Kaizen acumulados y avance diario (+1%)"
    >
      <Star
        size={14}
        className={`${
          isGoalDone ? 'text-emerald-600 fill-emerald-500' : 'text-amber-600 fill-amber-500'
        } shrink-0 transition-transform group-hover:rotate-12`}
      />
      <span className="font-extrabold tracking-tight">{points} pts</span>
      {typeof dailyPercent === 'number' && (
        <>
          <span className={isGoalDone ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>•</span>
          <span className={`${isGoalDone ? 'text-emerald-800' : 'text-amber-900'} text-[11px] font-bold`}>
            +1%: {dailyPercent}% {isGoalDone && '✓'}
          </span>
        </>
      )}
    </motion.button>
  );
};
