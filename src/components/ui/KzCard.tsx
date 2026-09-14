/**
 * @file src/components/ui/KzCard.tsx
 * @description Átomo: Contenedor con estética Cartoon-Zen (geometría redondeada y sombra táctil 3D).
 */

import React from 'react';

export interface KzCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'sunken' | 'elevated' | 'dashed';
  interactive?: boolean;
}

const variantClasses: Record<string, string> = {
  surface:
    'bg-[#fffdf8] border-2 border-[#e2dcd0] text-[#211d19] shadow-[0_4px_0_#d8d1c2,0_8px_20px_rgba(33,29,25,0.03)]',
  sunken:
    'bg-[#faf8f1] border-2 border-[#eae4d8] text-[#211d19] shadow-[inset_0_2px_4px_rgba(33,29,25,0.03)]',
  elevated:
    'bg-white border-2 border-[#d9d3c5] text-[#211d19] shadow-[0_6px_0_#cfc7b6,0_16px_32px_rgba(33,29,25,0.06)]',
  dashed:
    'bg-[#faf8f1]/70 border-2 border-dashed border-[#d9d3c5] text-[#57534e]',
};

export const KzCard: React.FC<KzCardProps> = ({
  variant = 'surface',
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 ${variantClasses[variant]} ${
        interactive
          ? 'hover:border-[#b8b2a3] hover:shadow-[0_6px_0_#cec5b3,0_12px_24px_rgba(33,29,25,0.06)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_#cec5b3] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
