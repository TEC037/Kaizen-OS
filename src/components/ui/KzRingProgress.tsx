/**
 * @file src/components/ui/KzRingProgress.tsx
 * @description Átomo: Anillo SVG matemático para el progreso diario del 1% con física de resortes.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { soundEngine } from '../../core/sound';

export interface KzRingProgressProps {
  percent: number; // 0 to 100 (or more)
  size?: number;   // diameter in px (default 64)
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const KzRingProgress: React.FC<KzRingProgressProps> = ({
  percent,
  size = 56,
  strokeWidth = 5,
  showLabel = true,
  className = '',
  onClick,
}) => {
  const normalizedPercent = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;
  const isGoalAchieved = percent >= 100;
  const isClickable = Boolean(onClick);

  const handleClick = () => {
    if (onClick) {
      soundEngine.playTap();
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.08 } : undefined}
      whileTap={isClickable ? { scale: 0.94 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={isClickable ? handleClick : undefined}
      className={`relative inline-flex items-center justify-center select-none ${
        isClickable ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Pista de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#eae4d6"
          strokeWidth={strokeWidth}
        />
        {/* Arco de progreso animado */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isGoalAchieved ? '#2e6b36' : '#b45309'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono select-none">
          <span className={`text-[12px] font-extrabold leading-none ${isGoalAchieved ? 'text-emerald-900' : 'text-stone-900'}`}>
            {percent}%
          </span>
          <span className="text-[8px] font-bold text-stone-500 uppercase tracking-tighter mt-0.5">+1%</span>
        </div>
      )}
    </motion.div>
  );
};
