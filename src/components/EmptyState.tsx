/**
 * @file src/components/EmptyState.tsx
 * @description Componente de estado vacío con estética deliberadamente de baja fidelidad (wireframe).
 * Explica con claridad qué ocurrió y qué acción puede realizar el usuario.
 */

import React from 'react';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';

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
  const borderStyles = {
    neutral: 'border-zinc-300 bg-zinc-50',
    warning: 'border-amber-300 bg-amber-50/50',
    alert: 'border-red-300 bg-red-50/40',
  }[variant];

  return (
    <div
      id={id}
      className={`border border-dashed ${borderStyles} p-8 text-center rounded-none my-4 flex flex-col items-center justify-center`}
    >
      <div className="w-10 h-10 border border-zinc-400 bg-white flex items-center justify-center mb-3 text-zinc-600">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 max-w-md mx-auto mb-5 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-4 py-2 text-sm font-medium border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            <span>{actionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="px-4 py-2 text-sm font-medium border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
