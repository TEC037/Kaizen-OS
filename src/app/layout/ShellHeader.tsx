/**
 * @file src/app/layout/ShellHeader.tsx
 * @description Encabezado principal sintetizado del Shell de Kaizen OS.
 * Estética artesanal "Wabi-Sabi Tech", navegación modular balanceada,
 * dock compacto de herramientas y cero desbordamiento horizontal.
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
} from 'lucide-react';
import { KzScorePill } from '../../components/ui/KzScorePill';
import { KzHotKey } from '../../components/ui/KzHotKey';
import { ModuleRoute } from '../../core/types';
import { soundEngine } from '../../core/sound';
import { DashboardContextMode } from '../providers/ShellLayoutProvider';
import { useGlobalUserName } from '../../core/profile';

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
  onOpenCommandBar: () => void;
  onOpenScoreModal: () => void;
  onOpenInspector: () => void;
  isInspectorOpen: boolean;
  onOpenProfileModal?: () => void;
  contextMode?: DashboardContextMode;
  onSelectContextMode?: (mode: DashboardContextMode) => void;
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
  onOpenCommandBar,
  onOpenScoreModal,
  onOpenInspector,
  isInspectorOpen,
  onOpenProfileModal,
}) => {
  const [globalUserName] = useGlobalUserName();

  return (
    <header className="border-b-2 border-[#e6e0d2] bg-[#fffdf8]/95 backdrop-blur-md sticky top-0 z-30 shadow-[0_2px_8px_rgba(33,29,25,0.03)] w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-3">
        {/* 1. Logo de Marca (Sintetizado y Compacto) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onNavigate('/');
              soundEngine.playTap();
            }}
            className="flex items-center gap-2 text-left cursor-pointer group select-none shrink-0"
            title="Kaizen OS — Inicio"
          >
            <div className="w-8 h-8 rounded-xl border-2 border-[#1f1c18] bg-[#211d19] text-[#faf8f1] flex items-center justify-center font-mono font-bold text-sm shadow-[0_2px_0_#0f0d0b] group-hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              改
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-[#211d19] font-mono">
                Kaizen OS
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border border-amber-300 bg-amber-50 text-amber-950 font-bold shadow-[0_1px_0_#fcd34d]">
                v2
              </span>
            </div>
          </button>
        </div>

        {/* 2. Navegación Modular Central (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            id="nav-dashboard"
            onClick={() => {
              onNavigate('/');
              soundEngine.playTap();
            }}
            className={`px-2.5 py-1.5 rounded-xl border-2 flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
              currentPath === '/'
                ? 'border-[#211d19] bg-[#211d19] text-[#faf8f1] font-bold shadow-[0_2px_0_#0f0d0b]'
                : 'border-transparent text-stone-700 hover:border-stone-300 hover:bg-[#faf8f1]'
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
                onClick={() => {
                  onNavigate(route.path);
                  soundEngine.playTap();
                }}
                className={`px-2.5 py-1.5 rounded-xl border-2 flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                  isActive
                    ? 'border-[#211d19] bg-[#211d19] text-[#faf8f1] font-bold shadow-[0_2px_0_#0f0d0b]'
                    : 'border-transparent text-stone-700 hover:border-stone-300 hover:bg-[#faf8f1]'
                }`}
              >
                <IconComponent size={13} />
                <span>{route.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 3. Clúster Derecho de Acciones y Utilidades (Sintetizado) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Gatillo del Omnibar (Cmd+K) */}
          <button
            type="button"
            id="btn-trigger-commandbar"
            onClick={() => {
              soundEngine.playTap();
              onOpenCommandBar();
            }}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-mono font-bold border-2 border-stone-300 bg-[#faf8f1] hover:bg-white text-stone-700 rounded-xl shadow-[0_2px_0_#cfc7b6] active:translate-y-[1px] active:shadow-none cursor-pointer transition-all"
            title="Abrir Centro de Mando / Omnibar (Cmd+K)"
          >
            <Search size={13} className="text-stone-400" />
            <KzHotKey keys={['⌘', 'K']} size="sm" />
          </button>

          {/* Perfil de Usuario Global */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              onOpenProfileModal?.();
            }}
            className="px-2 py-1.5 text-xs font-mono font-bold border-2 border-stone-300 bg-[#faf8f1] hover:bg-white text-stone-800 rounded-xl shadow-[0_2px_0_#cfc7b6] active:translate-y-[1px] active:shadow-none cursor-pointer flex items-center gap-1.5 transition-all"
            title={`Perfil global: ${globalUserName} (Clic para cambiar)`}
            aria-label="Perfil de usuario global"
          >
            <div className="w-4 h-4 rounded-full bg-amber-200 border border-stone-800 flex items-center justify-center text-[9px] font-extrabold text-stone-900">
              {globalUserName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:inline max-w-[80px] truncate">{globalUserName}</span>
          </button>

          {/* Indicador de Puntos Kaizen */}
          <KzScorePill
            points={totalPoints}
            dailyPercent={dailyPercent}
            onClick={onOpenScoreModal}
          />

          {/* Dock Compacto de Herramientas (Segmentado, sin duplicar márgenes sueltos) */}
          <div className="flex items-center border-2 border-stone-300 bg-[#faf8f1] rounded-xl shadow-[0_2px_0_#cfc7b6] divide-x-2 divide-stone-200 overflow-hidden">
            {/* Alternar Sonido */}
            <button
              type="button"
              onClick={onToggleSound}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Silenciar sonidos [M]' : 'Activar sonidos de feedback [M]'}
              aria-label="Alternar sonido (M)"
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} className="text-stone-400" />}
            </button>

            {/* Alternar Modo Zen */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onToggleZenMode();
              }}
              className={`p-1.5 transition-colors cursor-pointer ${
                zenMode ? 'bg-amber-100 text-amber-950' : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
              title="Alternar Modo Zen / Foco Total [Z]"
              aria-label="Alternar Modo Zen (Z)"
            >
              {zenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

            {/* Catálogo de Módulos */}
            <button
              type="button"
              id="nav-modules"
              onClick={() => {
                onNavigate('/modules');
                soundEngine.playTap();
              }}
              className={`px-2 py-1.5 text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                currentPath === '/modules'
                  ? 'bg-[#211d19] text-[#faf8f1]'
                  : 'text-stone-700 hover:bg-white'
              }`}
              title={`Catálogo de Módulos (${enabledModulesCount} activos)`}
              aria-label="Catálogo de módulos"
            >
              <Layers size={13} />
              <span className="text-[10px] font-extrabold">{enabledModulesCount}</span>
            </button>

            {/* Inspector de Arquitectura */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                onOpenInspector();
              }}
              className={`p-1.5 transition-colors cursor-pointer ${
                isInspectorOpen
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white'
              }`}
              title="Inspector de Arquitectura Modular y Bus"
              aria-label="Inspector"
            >
              <Code2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Menú de navegación móvil */}
      <div className="md:hidden border-t-2 border-stone-200/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-xs font-mono bg-[#faf8f1]">
        <button
          type="button"
          onClick={() => {
            onNavigate('/');
            soundEngine.playTap();
          }}
          className={`px-3 py-1 border-2 rounded-full font-bold shrink-0 shadow-[0_1.5px_0_rgba(0,0,0,0.1)] ${
            currentPath === '/' ? 'bg-[#211d19] text-white border-[#211d19]' : 'bg-white border-stone-300 text-stone-800'
          }`}
        >
          Dashboard
        </button>
        {dynamicNavRoutes.map((route) => (
          <button
            key={route.path}
            type="button"
            onClick={() => {
              onNavigate(route.path);
              soundEngine.playTap();
            }}
            className={`px-3 py-1 border-2 rounded-full font-bold shrink-0 shadow-[0_1.5px_0_rgba(0,0,0,0.06)] ${
              currentPath === route.path ? 'bg-[#211d19] text-white border-[#211d19]' : 'bg-white border-stone-300 text-stone-800'
            }`}
          >
            {route.label}
          </button>
        ))}
      </div>
    </header>
  );
};
