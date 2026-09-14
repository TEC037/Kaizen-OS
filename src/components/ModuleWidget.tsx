/**
 * @file src/components/ModuleWidget.tsx
 * @description Contenedor atómico unificado para los widgets renderizados en el Dashboard de Kaizen OS.
 * Aplica la superficie Wabi-Sabi KzCard y tipografía editorial.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { KzCard } from './ui/KzCard';
import { soundEngine } from '../core/sound';

interface ModuleWidgetProps {
  id: string;
  moduleId: string;
  title: string;
  targetPath?: string;
  onNavigate?: (path: string) => void;
  children: React.ReactNode;
}

export const ModuleWidget: React.FC<ModuleWidgetProps> = ({
  id,
  moduleId,
  title,
  targetPath,
  onNavigate,
  children,
}) => {
  return (
    <KzCard
      id={`dashboard-widget-${id}`}
      variant="surface"
      className="p-5 flex flex-col justify-between"
    >
      <div>
        {/* Cabecera del widget con identificador de módulo */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-stone-200/80 font-mono">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 tracking-tight uppercase">
              {title}
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#faf8f1] text-stone-700 border-2 border-stone-300 rounded-full shadow-[0_1px_0_#d9d3c5]">
              {moduleId}
            </span>
          </div>

          {targetPath && onNavigate && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onNavigate(targetPath);
              }}
              title={`Ver módulo completo en ${targetPath}`}
              className="text-xs font-bold text-stone-600 hover:text-stone-950 hover:bg-[#faf8f1] border border-transparent hover:border-stone-300 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all active:translate-y-0.5"
            >
              <span>Abrir</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>

        {/* Contenido del widget */}
        <div>{children}</div>
      </div>
    </KzCard>
  );
};
