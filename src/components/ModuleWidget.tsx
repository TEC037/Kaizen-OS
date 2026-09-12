/**
 * @file src/components/ModuleWidget.tsx
 * @description Contenedor estándar de baja fidelidad para los widgets renderizados en el dashboard.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

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
    <div
      id={`dashboard-widget-${id}`}
      className="border border-zinc-300 bg-white p-4 flex flex-col justify-between"
    >
      <div>
        {/* Cabecera del widget con identificador de módulo */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">
              {title}
            </h4>
            <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-100 text-zinc-600 border border-zinc-200">
              módulo: {moduleId}
            </span>
          </div>

          {targetPath && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(targetPath)}
              title={`Ver módulo completo en ${targetPath}`}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-mono cursor-pointer"
            >
              <span>Abrir</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>

        {/* Contenido del widget */}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};
