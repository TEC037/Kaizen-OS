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
      className="p-4 sm:p-5 flex flex-col justify-between border-stone-300 shadow-[0_1px_3px_rgba(33,29,25,0.04)]"
    >
      <div>
        {/* Cabecera del widget con identificador de módulo */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-200 font-mono">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight uppercase">
              {title}
            </h4>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#faf8f1] text-stone-600 border border-stone-200 rounded-xs">
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
              className="text-xs text-stone-600 hover:text-stone-950 flex items-center gap-1 cursor-pointer transition-colors"
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
