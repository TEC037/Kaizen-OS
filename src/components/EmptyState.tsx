/**
 * @file src/components/EmptyState.tsx
 * @description Componente de estado vacío con estética Wabi-Sabi unificada.
 * Explica con claridad la situación y ofrece acciones de recuperación sin fricción.
 */

import React from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { KzCard } from './ui/KzCard';
import { KzButton } from './ui/KzButton';
import { soundEngine } from '../core/sound';

interface EmptyStateProps {
  id?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'neutral' | 'warning' | 'alert';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'neutral',
}) => {
  const iconColor = {
    neutral: 'text-stone-500',
    warning: 'text-amber-700',
    alert: 'text-red-700',
  }[variant];

  return (
    <KzCard
      id={id}
      variant="dashed"
      className="p-8 text-center my-4 flex flex-col items-center justify-center font-mono"
    >
      <div className="w-10 h-10 border border-stone-300 bg-white flex items-center justify-center mb-3 rounded-sm shadow-2xs">
        <AlertCircle size={20} className={iconColor} />
      </div>

      <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight mb-1 font-mono uppercase">
        {title}
      </h3>

      <p className="text-xs text-stone-600 max-w-md mx-auto mb-5 leading-relaxed font-sans">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {actionLabel && onAction && (
          <KzButton
            variant="primary"
            size="sm"
            onClick={() => {
              soundEngine.playTap();
              onAction();
            }}
            icon={<Plus size={14} />}
          >
            {actionLabel}
          </KzButton>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <KzButton
            variant="craft"
            size="sm"
            onClick={() => {
              soundEngine.playTap();
              onSecondaryAction();
            }}
            icon={<RefreshCw size={13} />}
          >
            {secondaryActionLabel}
          </KzButton>
        )}
      </div>
    </KzCard>
  );
};
