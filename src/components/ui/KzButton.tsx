/**
 * @file src/components/ui/KzButton.tsx
 * @description Átomo: Botón artesanal táctil con física de resortes (Framer Motion).
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export type KzButtonVariant = 'craft' | 'primary' | 'ghost' | 'destructive' | 'outline';
export type KzButtonSize = 'sm' | 'md' | 'lg';

export interface KzButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: KzButtonVariant;
  size?: KzButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<KzButtonVariant, string> = {
  craft:
    'bg-[#faf8f1] hover:bg-[#fffdf8] text-[#211d19] border border-[#d9d3c5] hover:border-[#a5a093] shadow-[0_1px_2px_rgba(33,29,25,0.05)] hover:shadow-[0_2px_4px_rgba(33,29,25,0.08)]',
  primary:
    'bg-[#211d19] hover:bg-[#38332c] text-[#faf8f1] border border-[#211d19] shadow-sm',
  ghost:
    'bg-transparent hover:bg-stone-200/50 text-stone-700 border border-transparent',
  destructive:
    'bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 hover:border-red-300',
  outline:
    'bg-transparent hover:bg-stone-100 text-stone-800 border border-stone-300',
};

const sizeStyles: Record<KzButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
  lg: 'text-sm px-4 py-2.5 gap-2.5',
};

export const KzButton: React.FC<KzButtonProps> = ({
  variant = 'craft',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-mono font-medium rounded-sm cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
