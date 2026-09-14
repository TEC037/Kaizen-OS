/**
 * @file src/components/ShortcutsModal.tsx
 * @description Modal de referencia rápida de atajos de teclado del sistema (pulsar '?').
 */

import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { KzHotKey } from './ui/KzHotKey';

import { soundEngine } from '../core/sound';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'Comandos Globales',
    items: [
      { keys: ['⌘', 'K'], label: 'Abrir Centro de Mando / Omnibar' },
      { keys: ['Z'], label: 'Alternar Modo Zen (enfoque sin distracciones)' },
      { keys: ['M'], label: 'Silenciar / Activar sonido' },
      { keys: ['?'], label: 'Ver esta ayuda de atajos' },
      { keys: ['Esc'], label: 'Cerrar modal / menú activo' },
    ],
  },
  {
    title: 'Navegación Rápida (Estilo Vim)',
    items: [
      { keys: ['G', 'D'], label: 'Ir al Dashboard Principal' },
      { keys: ['G', 'H'], label: 'Ir a TRANSMUTE (Hábitos)' },
      { keys: ['G', 'F'], label: 'Ir a FORJA (Proyectos)' },
      { keys: ['G', 'G'], label: 'Ir a Punto Fuerte (Gym)' },
      { keys: ['G', 'R'], label: 'Ir a Lectura' },
      { keys: ['G', 'B'], label: 'Ir a Finanzas' },
      { keys: ['G', 'M'], label: 'Ir a Configuración de Módulos' },
    ],
  },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => {
        onClose();
        soundEngine.playTap();
      }}
    >
      <div
        className="border-2 border-stone-300 bg-[#fffdf8] w-full max-w-lg p-6 sm:p-7 font-mono shadow-[0_12px_0_#cfc7b6,0_30px_50px_rgba(0,0,0,0.18)] rounded-2xl sm:rounded-3xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-stone-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-stone-700" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-900">
              Atajos de Teclado del Sistema
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              soundEngine.playTap();
            }}
            className="text-stone-500 hover:text-stone-900 border-2 border-stone-300 bg-white hover:bg-stone-50 px-2.5 py-1 rounded-xl shadow-[0_1.5px_0_#cfc7b6] cursor-pointer transition-all active:translate-y-[1px]"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="font-extrabold text-stone-600 uppercase text-[10px] tracking-wider">
                {group.title}
              </h3>
              <div className="divide-y divide-stone-200/60 border-2 border-stone-200 rounded-2xl bg-[#faf8f1] shadow-[0_2px_0_#d9d3c5] overflow-hidden">
                {group.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5">
                    <span className="text-stone-800 font-medium">{item.label}</span>
                    <KzHotKey keys={item.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t-2 border-stone-200/80 flex justify-end">
          <button
            type="button"
            onClick={() => {
              onClose();
              soundEngine.playTap();
            }}
            className="px-5 py-2 text-xs font-mono font-bold bg-[#211d19] text-[#faf8f1] border-2 border-[#161310] rounded-xl shadow-[0_2.5px_0_#0a0807] cursor-pointer hover:bg-stone-800 transition-all active:translate-y-[1px] active:shadow-none"
          >
            Entendido [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
