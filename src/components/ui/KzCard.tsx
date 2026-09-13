/**
 * @file src/components/ui/KzCard.tsx
 * @description Átomo: Contenedor con superficie Wabi-Sabi y borde editorial.
 */

import React from 'react';

export interface KzCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'sunken' | 'elevated' | 'dashed';
  interactive?: boolean;
}

const variantClasses: Record<string, string> = {
  surface: 'bg-[#fffdf8] border-[#d9d3c5] text-[#211d19] shadow-[0_1px_2px_rgba(33,29,25,0.05)]',
  sunken: 'bg-[#faf8f1] border-[#e5dfd3] text-[#211d19]',
  elevated: 'bg-white border-[#d9d3c5] text-[#211d19] shadow-[0_8px_20px_rgba(33,29,25,0.08)]',
  dashed: 'bg-[#faf8f1]/50 border-dashed border-[#d9d3c5] text-[#57534e]',
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
      className={`border rounded-sm p-4 sm:p-5 transition-all duration-200 ${variantClasses[variant]} ${
        interactive ? 'hover:border-[#a5a093] hover:shadow-[0_4px_12px_rgba(33,29,25,0.08)] hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
