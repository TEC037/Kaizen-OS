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
    'bg-[#fffdf8] hover:bg-[#faf8f1] text-[#211d19] border-2 border-[#d9d3c5] hover:border-[#b8b09f] shadow-[0_3px_0_#cfc7b6] hover:shadow-[0_3.5px_0_#cfc7b6] active:shadow-[0_1px_0_#cfc7b6]',
  primary:
    'bg-[#211d19] hover:bg-[#342e27] text-[#faf8f1] border-2 border-[#161310] shadow-[0_3px_0_#0a0807] hover:shadow-[0_3.5px_0_#0a0807] active:shadow-[0_1px_0_#0a0807]',
  ghost:
    'bg-transparent hover:bg-stone-200/50 text-stone-700 border-2 border-transparent hover:border-stone-200',
  destructive:
    'bg-rose-50 hover:bg-rose-100 text-rose-900 border-2 border-rose-300 hover:border-rose-400 shadow-[0_3px_0_#fca5a5] active:shadow-[0_1px_0_#fca5a5]',
  outline:
    'bg-transparent hover:bg-[#faf8f1] text-stone-800 border-2 border-[#d9d3c5] hover:border-[#b8b09f] shadow-[0_2px_0_#d9d3c5] active:shadow-[0_0.5px_0_#d9d3c5]',
};

const sizeStyles: Record<KzButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
  md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 rounded-xl',
  lg: 'text-sm px-4.5 py-2.5 gap-2.5 rounded-xl',
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
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 2 }}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-mono font-bold cursor-pointer transition-[border-color,background-color] disabled:opacity-40 disabled:cursor-not-allowed select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
};
