/**
 * @file src/components/ui/KzBadge.tsx
 * @description Átomo: Insignia editorial de estado y categoría.
 */

import React from 'react';

export type KzBadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'dim';

const badgeVariants: Record<KzBadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-800 border-stone-300',
  accent: 'bg-amber-50 text-amber-900 border-amber-300',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-300',
  danger: 'bg-red-50 text-red-800 border-red-300',
  info: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  dim: 'bg-stone-50 text-stone-500 border-stone-200',
};

export interface KzBadgeProps {
  variant?: KzBadgeVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const KzBadge: React.FC<KzBadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  icon,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider px-1.5 py-0.5 border rounded-sm ${badgeVariants[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
