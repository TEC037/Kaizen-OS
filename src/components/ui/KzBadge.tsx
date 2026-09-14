/**
 * @file src/components/ui/KzBadge.tsx
 * @description Átomo: Insignia sticker tipo píldora Cartoon-Zen.
 */

import React from 'react';

export type KzBadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'dim';

const badgeVariants: Record<KzBadgeVariant, string> = {
  default: 'bg-[#faf8f1] text-stone-800 border-stone-300 shadow-[0_1.5px_0_#d9d3c5]',
  accent: 'bg-amber-50 text-amber-950 border-amber-300 shadow-[0_1.5px_0_#fcd34d]',
  success: 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-[0_1.5px_0_#86efac]',
  warning: 'bg-yellow-50 text-yellow-950 border-yellow-300 shadow-[0_1.5px_0_#fde047]',
  danger: 'bg-rose-50 text-rose-950 border-rose-300 shadow-[0_1.5px_0_#fca5a5]',
  info: 'bg-cyan-50 text-cyan-950 border-cyan-300 shadow-[0_1.5px_0_#67e8f9]',
  dim: 'bg-stone-100 text-stone-600 border-stone-200 shadow-[0_1px_0_#e7e5e4]',
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
      className={`inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 border-2 rounded-full select-none ${badgeVariants[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
