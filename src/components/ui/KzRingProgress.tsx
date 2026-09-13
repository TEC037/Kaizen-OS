/**
 * @file src/components/ui/KzRingProgress.tsx
 * @description Átomo: Anillo SVG matemático para el progreso diario del 1% con física de resortes.
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface KzRingProgressProps {
  percent: number; // 0 to 100 (or more)
  size?: number;   // diameter in px (default 64)
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export const KzRingProgress: React.FC<KzRingProgressProps> = ({
  percent,
  size = 56,
  strokeWidth = 5,
  showLabel = true,
  className = '',
}) => {
  const normalizedPercent = Math.min(100, Math.max(0, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPercent / 100) * circumference;
  const isGoalAchieved = percent >= 100;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Pista de fondo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e7e2d6"
          strokeWidth={strokeWidth}
        />
        {/* Arco de progreso animado */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isGoalAchieved ? '#166534' : '#b45309'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center font-mono select-none">
          <span className={`text-[11px] font-bold leading-none ${isGoalAchieved ? 'text-emerald-800' : 'text-stone-800'}`}>
            {percent}%
          </span>
          <span className="text-[8px] text-stone-500 uppercase tracking-tighter mt-0.5">+1%</span>
        </div>
      )}
    </div>
  );
};
