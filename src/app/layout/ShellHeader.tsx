/**
 * @file src/app/layout/ShellHeader.tsx
 * @description Encabezado principal del Shell de Kaizen OS.
 * Estética artesanal "Wabi-Sabi Tech", selector de contextos diarios,
 * gatillo de Omnibar y métricas del 1% diario.
 */

import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Code2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Search,
  CheckSquare,
  FolderKanban,
  Dumbbell,
  BookOpen,
  Wallet,
  Hammer,
  ChevronRight,
  Sun,
  Flame,
  Moon,
  Compass,
} from 'lucide-react';
import { KzScorePill } from '../../components/ui/KzScorePill';
import { KzHotKey } from '../../components/ui/KzHotKey';
import { ModuleRoute } from '../../core/types';
import { soundEngine } from '../../core/sound';
import { DashboardContextMode } from '../providers/ShellLayoutProvider';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CheckSquare,
  FolderKanban,
  Dumbbell,
  BookOpen,
  Wallet,
  Hammer,
};

interface ShellHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  dynamicNavRoutes: Array<ModuleRoute & { moduleId: string }>;
  enabledModulesCount: number;
  totalPoints: number;
  dailyPercent: number;
  zenMode: boolean;
  onToggleZenMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  contextMode: DashboardContextMode;
  onSelectContextMode: (mode: DashboardContextMode) => void;
  onOpenCommandBar: () => void;
  onOpenScoreModal: () => void;
  onOpenInspector: () => void;
  isInspectorOpen: boolean;
}

export const ShellHeader: React.FC<ShellHeaderProps> = ({
  currentPath,
  onNavigate,
  dynamicNavRoutes,
  enabledModulesCount,
  totalPoints,
  dailyPercent,
  zenMode,
  onToggleZenMode,
  soundEnabled,
  onToggleSound,
  contextMode,
  onSelectContextMode,
  onOpenCommandBar,
  onOpenScoreModal,
  onOpenInspector,
  isInspectorOpen,
}) => {
  return (
    <header className="border-b border-[#d9d3c5] bg-[#fffdf8] sticky top-0 z-30 shadow-[0_1px_3px_rgba(33,29,25,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo de Marca Artesanal */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left cursor-pointer group select-none"
          >
            <div className="w-7 h-7 rounded-sm border border-[#211d19] bg-[#211d19] text-[#faf8f1] flex items-center justify-center font-mono font-bold text-sm shadow-sm group-hover:bg-[#3d372e] transition-colors">
              改
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-[#211d19] font-mono">
                  Kaizen OS
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded-sm border border-amber-300 bg-amber-50 text-amber-900 font-semibold">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-600 block leading-none">
                MEJORA CONTINUA +1%
              </span>
            </div>
          </button>

          {/* Selector de Contextos del Día (Solo visible en Dashboard) */}
          {currentPath === '/' && (
            <div className="hidden lg:flex items-center gap-1 border border-stone-200 bg-[#faf8f1] p-0.5 rounded-sm text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  onSelectContextMode('all');
                  soundEngine.playTap();
                }}
                className={`px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
                  contextMode === 'all'
                    ? 'bg-[#211d19] text-[#faf8f1] font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Ver todos los widgets activos"
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectContextMode('morning');
                  soundEngine.playTap();
                }}
                className={`px-2 py-0.5 rounded-sm flex items-center gap-1 transition-colors cursor-pointer ${
                  contextMode === 'morning'
                    ? 'bg-amber-700 text-white font-bold'
                    : 'text-stone-600 hover:text-amber-800'
                }`}
                title="Modo Mañana: Hábitos y Rutina de Fuerza"
              >
                <Sun size={11} />
                <span>Mañana</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectContextMode('deepwork');
                  soundEngine.playTap();
                }}
                className={`px-2 py-0.5 rounded-sm flex items-center gap-1 transition-colors cursor-pointer ${
                  contextMode === 'deepwork'
                    ? 'bg-amber-900 text-white font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Modo Foco Profundo: Taller FORJA y Próxima Acción"
              >
                <Flame size={11} />
                <span>Foco</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectContextMode('evening');
                  soundEngine.playTap();
                }}
                className={`px-2 py-0.5 rounded-sm flex items-center gap-1 transition-colors cursor-pointer ${
                  contextMode === 'evening'
                    ? 'bg-indigo-900 text-white font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Modo Cierre: Lectura y Reflexión del Día"
              >
                <Moon size={11} />
                <span>Cierre</span>
              </button>
            </div>
          )}
        </div>

        {/* Menú de Navegación Modular (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          <button
            type="button"
            id="nav-dashboard"
            onClick={() => onNavigate('/')}
            className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 cursor-pointer transition-colors ${
              currentPath === '/'
                ? 'border-[#211d19] bg-[#211d19] text-[#faf8f1] font-semibold'
                : 'border-transparent text-stone-700 hover:border-stone-300 hover:bg-stone-100/50'
            }`}
          >
            <LayoutDashboard size={13} />
            <span>Dashboard</span>
          </button>

          {dynamicNavRoutes.map((route) => {
            const IconComponent = ICON_MAP[route.iconName] || ChevronRight;
            const isActive = currentPath === route.path;
            return (
              <button
                key={route.path}
                id={`nav-${route.moduleId}`}
                type="button"
                onClick={() => onNavigate(route.path)}
                className={`px-3 py-1.5 rounded-sm border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'border-[#211d19] bg-[#211d19] text-[#faf8f1] font-semibold'
                    : 'border-transparent text-stone-700 hover:border-stone-300 hover:bg-stone-100/50'
                }`}
              >
                <IconComponent size={13} />
                <span>{route.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Acciones y Gatillos de Cabecera */}
        <div className="flex items-center gap-2">
          {/* Gatillo del Omnibar (Cmd+K) */}
          <button
            type="button"
            id="btn-trigger-commandbar"
            onClick={onOpenCommandBar}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono border border-stone-300 bg-[#faf8f1] hover:bg-white text-stone-700 rounded-sm cursor-pointer transition-colors"
            title="Abrir Centro de Mando / Omnibar (Cmd+K)"
          >
            <Search size={13} className="text-stone-400" />
            <span className="hidden md:inline">Comandos</span>
            <KzHotKey keys={['⌘', 'K']} size="sm" />
          </button>

          {/* Indicador de Puntos Kaizen */}
          <KzScorePill
            points={totalPoints}
            dailyPercent={dailyPercent}
            onClick={onOpenScoreModal}
          />

          {/* Alternar Sonido */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 bg-[#faf8f1] hover:bg-white rounded-sm cursor-pointer transition-colors"
            title={soundEnabled ? 'Silenciar sonidos [M]' : 'Activar sonidos de feedback [M]'}
            aria-label="Alternar sonido (M)"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-stone-400" />}
          </button>

          {/* Alternar Modo Zen */}
          <button
            type="button"
            onClick={onToggleZenMode}
            className={`px-2 py-1.5 text-xs font-mono border rounded-sm flex items-center gap-1 cursor-pointer transition-colors ${
              zenMode
                ? 'border-amber-400 bg-amber-100 text-amber-950 font-bold'
                : 'border-stone-300 bg-[#faf8f1] hover:bg-white text-stone-700'
            }`}
            title="Alternar Modo Zen / Foco Total (tecla Z)"
          >
            {zenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden xl:inline">Zen</span>
          </button>

          {/* Mis Módulos */}
          <button
            type="button"
            id="nav-modules"
            onClick={() => onNavigate('/modules')}
            className={`px-2.5 py-1.5 text-xs font-mono border rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
              currentPath === '/modules'
                ? 'border-[#211d19] bg-[#211d19] text-[#faf8f1] font-semibold'
                : 'border-stone-300 bg-[#faf8f1] text-stone-800 hover:bg-white'
            }`}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">Módulos</span>
            <span className="w-4 h-4 bg-stone-200 text-stone-800 text-[10px] flex items-center justify-center font-bold rounded-xs">
              {enabledModulesCount}
            </span>
          </button>

          {/* Inspector de Arquitectura */}
          <button
            type="button"
            onClick={onOpenInspector}
            className={`p-1.5 text-xs font-mono border rounded-sm cursor-pointer transition-colors ${
              isInspectorOpen
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                : 'border-stone-300 bg-[#faf8f1] text-stone-600 hover:text-stone-900 hover:bg-white'
            }`}
            title="Inspector de Arquitectura Modular y Bus"
            aria-label="Inspector"
          >
            <Code2 size={14} />
          </button>
        </div>
      </div>

      {/* Menú de navegación móvil */}
      <div className="md:hidden border-t border-stone-200 px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-mono bg-[#faf8f1]">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className={`px-2.5 py-1 border rounded-sm shrink-0 ${
            currentPath === '/' ? 'bg-[#211d19] text-white border-[#211d19]' : 'bg-white border-stone-300'
          }`}
        >
          Dashboard
        </button>
        {dynamicNavRoutes.map((route) => (
          <button
            key={route.path}
            type="button"
            onClick={() => onNavigate(route.path)}
            className={`px-2.5 py-1 border rounded-sm shrink-0 ${
              currentPath === route.path ? 'bg-[#211d19] text-white border-[#211d19]' : 'bg-white border-stone-300'
            }`}
          >
            {route.label}
          </button>
        ))}
      </div>
    </header>
  );
};
