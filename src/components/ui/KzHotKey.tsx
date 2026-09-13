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
          className={`${sizeClasses} inline-flex items-center justify-center font-mono font-semibold rounded-sm bg-stone-100 text-stone-700 border border-stone-300 shadow-[0_1px_0_1px_rgba(0,0,0,0.06)] leading-none select-none`}
        >
          {k}
        </kbd>
      ))}
    </span>
  );
};
