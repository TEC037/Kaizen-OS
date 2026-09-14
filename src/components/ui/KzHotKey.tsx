/**
 * @file src/components/ui/KzHotKey.tsx
 * @description Átomo visual para representación de atajos de teclado (Kbd).
 */

import React from 'react';

interface KzHotKeyProps {
  keys: string | string[];
  className?: string;
  size?: 'sm' | 'md';
}

export const KzHotKey: React.FC<KzHotKeyProps> = ({ keys, className = '', size = 'sm' }) => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 min-w-4' : 'text-xs px-2 py-1 min-w-5';

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {keyList.map((k, idx) => (
        <kbd
          key={idx}
          className={`${sizeClasses} inline-flex items-center justify-center font-mono font-bold rounded-lg bg-[#faf8f1] text-stone-800 border-2 border-[#d9d3c5] shadow-[0_2px_0_#cfc7b6] leading-none select-none`}
        >
          {k}
        </kbd>
      ))}
    </span>
  );
};
