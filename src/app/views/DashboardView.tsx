/**
 * @file src/app/views/DashboardView.tsx
 * @description Vista del Dashboard Principal de Kaizen OS.
 * Incorpora el Sensei Kaizen, el compromiso del 1% diario, filtros de contexto y widgets dinámicos.
 */

import React, { Suspense } from 'react';
import { LayoutGrid, ChevronUp, ChevronDown, Eye, EyeOff, TrendingUp, Flame, Award, SlidersHorizontal, Info, Pencil, Check, RotateCcw } from 'lucide-react';
import { DAILY_1_PERCENT_TARGET } from '../../core/scoring';
import { DynamicWidgetDef } from '../moduleRegistry';
import { WidgetLayout, WidgetSpan, SPAN_CLASSES } from '../../core/widgetLayout';
import { ModuleManifest, KaizenScoreState } from '../../core/types';
import { EmptyState } from '../../components/EmptyState';
import { SenseiWidget } from '../../components/SenseiWidget';
import { ZenWorkspace } from '../../components/ZenWorkspace';
import { DashboardContextMode } from '../providers/ShellLayoutProvider';
import { KzCard } from '../../components/ui/KzCard';
import { KzButton } from '../../components/ui/KzButton';
import { KzBadge } from '../../components/ui/KzBadge';
import { KzRingProgress } from '../../components/ui/KzRingProgress';
import { soundEngine } from '../../core/sound';

interface DashboardViewProps {
  scoreState: KaizenScoreState;
  dailyPercent: number;
  dynamicWidgets: DynamicWidgetDef[];
  widgetLayout: WidgetLayout;
  setPlacement: (widgetId: string, patch: { visible?: boolean; gridSpan?: WidgetSpan }) => void;
  movePlacement: (widgetId: string, direction: -1 | 1) => void;
  onResetLayout?: () => void;
  showDashboardCustomize: boolean;
  onToggleDashboardCustomize: () => void;
  enabledManifests: ModuleManifest[];
  onNavigate: (path: string) => void;
  onOpenScoreModal: () => void;
  onFullReset: () => void;
  zenMode: boolean;
  onExitZen: () => void;
  contextMode: DashboardContextMode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scoreState,
  dailyPercent,
  dynamicWidgets,
  widgetLayout,
  setPlacement,
  movePlacement,
  onResetLayout,
  showDashboardCustomize,
  onToggleDashboardCustomize,
  enabledManifests,
  onNavigate,
  onOpenScoreModal,
  onFullReset,
  zenMode,
  onExitZen,
  contextMode,
}) => {
  if (zenMode) {
    return (
      <ZenWorkspace
        scorePoints={scoreState.todayPoints}
        dailyPercent={dailyPercent}
        streakDays={scoreState.currentStreakDays}
        onExitZen={onExitZen}
        onNavigate={onNavigate}
      />
    );
  }

  const [userName, setUserName] = React.useState(() => {
    return localStorage.getItem('kz:user_name') || 'Alex';
  });
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(userName);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleSaveName = () => {
    const trimmed = tempName.trim() || 'Alex';
    setUserName(trimmed);
    localStorage.setItem('kz:user_name', trimmed);
    setIsEditingName(false);
    soundEngine.playTap();
  };

  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const isDailyGoalAchieved = scoreState.todayPoints >= scoreState.dailyGoalPoints;

  // Filtrar widgets según el modo de contexto seleccionado
  const filteredPlacements = widgetLayout.placements.filter((placement) => {
    if (!placement.visible) return false;
    const widget = dynamicWidgets.find((w) => w.id === placement.widgetId);
    if (!widget) return false;

    if (contextMode === 'morning') {
      return widget.moduleId === 'habits' || widget.moduleId === 'gym';
    }
    if (contextMode === 'deepwork') {
      return widget.moduleId === 'projects' || widget.moduleId === 'habits';
    }
    if (contextMode === 'evening') {
      return widget.moduleId === 'reading' || widget.moduleId === 'finance';
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner de Bienvenida y Resumen del Día */}
      <KzCard variant="surface" className="border-stone-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-stone-600">
                ESPACIO PERSONAL • KAIZEN OS
              </span>
              <KzBadge variant="success">
                {enabledManifests.length} módulos activos
              </KzBadge>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 py-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-stone-900 font-mono">
                    {getGreeting()},
                  </span>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                    autoFocus
                    className="text-xl sm:text-2xl font-bold text-stone-900 font-mono bg-white border border-stone-400 px-1.5 py-0 rounded-xs w-36 outline-none shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-1 border border-stone-400 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xs cursor-pointer"
                    title="Guardar nombre"
                  >
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight font-mono flex items-center gap-1.5 group">
                  <span>{getGreeting()}, {userName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                      soundEngine.playTap();
                    }}
                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 transition-opacity p-0.5 cursor-pointer"
                    title="Editar tu nombre"
                  >
                    <Pencil size={13} />
                  </button>
                </h1>
              )}
            </div>

            <p className="text-xs text-stone-600 capitalize font-mono">{todayFormatted}</p>
          </div>

          <div className="flex items-center gap-2">
            <KzButton
              variant="craft"
              size="sm"
              onClick={onOpenScoreModal}
              title="Ver detalle del sistema de puntos e historial Kaizen"
            >
              ★ {scoreState.totalPoints} pts | +1%: {dailyPercent}%
            </KzButton>

            <KzButton
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/modules')}
              icon={<SlidersHorizontal size={13} />}
            >
              Configurar módulos
            </KzButton>
          </div>
        </div>

        {/* Filosofía Kaizen */}
        <div className="bg-[#faf8f1] border border-stone-200 p-2.5 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono rounded-sm">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-stone-500 shrink-0" />
            <span>
              Filosofía Kaizen: <strong>1% es suficiente avance por día</strong>. La constancia sostenida vence al esfuerzo desmedido.
            </span>
          </div>
          <span className="text-stone-600 text-[11px]">
            Modo: Ecosistema Entramado v2
          </span>
        </div>
      </KzCard>

      {/* Grid Superior: Compromiso del 1% y Sensei Kaizen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tarjeta: Compromiso de Mejora Continua (+1% Diario) */}
        <KzCard variant="surface" className="border-stone-300 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 border border-stone-300 bg-[#faf8f1] rounded-sm">
                  <TrendingUp size={16} className="text-stone-800" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-stone-900 tracking-tight font-mono uppercase">
                    Compromiso de Mejora Continua (+1%)
                  </h2>
                  <span className="text-[10px] text-stone-600 font-mono block">
                    Meta del día: {DAILY_1_PERCENT_TARGET} puntos equivalen a tu 1% diario
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1 border border-stone-200 px-2 py-0.5 bg-[#faf8f1] rounded-sm text-[11px]">
                  <Flame size={12} className="text-amber-600" />
                  <span><strong>{scoreState.currentStreakDays} {scoreState.currentStreakDays === 1 ? 'día' : 'días'}</strong></span>
                </span>
                <span className="flex items-center gap-1 border border-stone-200 px-2 py-0.5 bg-[#faf8f1] rounded-sm text-[11px]">
                  <Award size={12} className="text-stone-700" />
                  <span><strong>{scoreState.todayPoints}/{scoreState.dailyGoalPoints}</strong></span>
                </span>
              </div>
            </div>

            {/* Anillo y barra de progreso */}
            <div className="flex items-center gap-4 pt-1">
              <KzRingProgress percent={dailyPercent} size={68} strokeWidth={6} />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-600">Avance de hoy:</span>
                  <span className="font-bold text-stone-900">{dailyPercent}%</span>
                </div>
                <div className="w-full h-2.5 border border-stone-300 bg-stone-100 p-0.5 rounded-xs">
                  <div
                    className={`h-full transition-all duration-300 rounded-xs ${
                      isDailyGoalAchieved ? 'bg-emerald-700' : 'bg-amber-700'
                    }`}
                    style={{ width: `${Math.min(100, dailyPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs font-mono">
            <span className="text-[11px] text-stone-600 flex items-center gap-2">
              {isDailyGoalAchieved ? (
                <>
                  <span className="border border-red-800/40 bg-red-50 text-red-900 px-1.5 py-0.2 rounded-xs font-mono text-[9px] uppercase tracking-wider font-bold shadow-xs shrink-0">
                    印 1% CONSOLIDADO
                  </span>
                  <span className="text-emerald-800 font-semibold">
                    ¡Meta del día lograda! Bono acreditado.
                  </span>
                </>
              ) : (
                <span>
                  Faltan <strong>{Math.max(0, scoreState.dailyGoalPoints - scoreState.todayPoints)} pts</strong> para tu 1% de hoy.
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={onOpenScoreModal}
              className="text-[11px] underline text-stone-800 hover:text-stone-950 cursor-pointer"
            >
              Ver reglas &rarr;
            </button>
          </div>
        </KzCard>

        {/* Sensei Kaizen (Analista Holístico) */}
        <SenseiWidget
          scorePoints={scoreState.todayPoints}
          dailyPercent={dailyPercent}
          streakDays={scoreState.currentStreakDays}
          onNavigate={onNavigate}
        />
      </div>

      {/* Grid de Widgets Dinámicos del Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <span>Widgets activos ({filteredPlacements.length})</span>
            </h2>
            {contextMode !== 'all' && (
              <KzBadge variant="accent">
                Filtrado por: {contextMode}
              </KzBadge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-dashboard-customize"
              onClick={onToggleDashboardCustomize}
              className="px-2.5 py-1 text-xs font-mono border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 rounded-sm cursor-pointer"
              title="Personalizar orden y visibilidad de widgets"
            >
              <LayoutGrid size={13} />
              <span>Personalizar</span>
            </button>
          </div>
        </div>

        {/* Panel de Personalización de Widgets */}
        {showDashboardCustomize && widgetLayout.placements.length > 0 && (
          <div className="border border-stone-300 bg-white p-3 mb-4 space-y-2 rounded-sm shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-stone-800">
                Personalización del Dashboard
              </span>
              <div className="flex items-center gap-3">
                {onResetLayout && (
                  <button
                    type="button"
                    onClick={() => {
                      onResetLayout();
                      soundEngine.playTap();
                    }}
                    className="text-[10px] text-stone-500 hover:text-stone-900 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                    title="Restablecer orden y visibilidad por defecto"
                  >
                    <RotateCcw size={10} />
                    <span>Restablecer por defecto</span>
                  </button>
                )}
                <span className="text-[10px] text-stone-500">Se guarda automáticamente</span>
              </div>
            </div>
            {widgetLayout.placements.map((placement, index) => {
              const widget = dynamicWidgets.find((w) => w.id === placement.widgetId);
              if (!widget) return null;
              return (
                <div
                  key={placement.widgetId}
                  className="flex flex-wrap items-center gap-2 border border-stone-200 bg-[#faf8f1] p-2 rounded-sm"
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePlacement(placement.widgetId, -1)}
                      disabled={index === 0}
                      className="p-1 border border-stone-300 bg-white text-stone-600 hover:text-stone-900 disabled:opacity-30 rounded-xs cursor-pointer"
                      title="Mover arriba"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePlacement(placement.widgetId, 1)}
                      disabled={index === widgetLayout.placements.length - 1}
                      className="p-1 border border-stone-300 bg-white text-stone-600 hover:text-stone-900 disabled:opacity-30 rounded-xs cursor-pointer"
                      title="Mover abajo"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  <span className="font-semibold text-stone-900 flex-1 min-w-[140px]">{widget.title}</span>
                  <span className="text-[10px] text-stone-600">{widget.moduleId}</span>

                  <select
                    value={placement.gridSpan}
                    onChange={(e) => setPlacement(placement.widgetId, { gridSpan: e.target.value as WidgetSpan })}
                    className="px-1.5 py-1 border border-stone-300 bg-white text-xs text-stone-700 rounded-sm"
                  >
                    <option value="half">Media columna</option>
                    <option value="full">Ancho completo</option>
                    <option value="third">Tercio</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setPlacement(placement.widgetId, { visible: !placement.visible })}
                    className={`px-2 py-1 border flex items-center gap-1 cursor-pointer text-[11px] rounded-sm ${
                      placement.visible
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'border-stone-300 bg-white text-stone-500'
                    }`}
                  >
                    {placement.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{placement.visible ? 'Visible' : 'Oculto'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Lista de Widgets */}
        {dynamicWidgets.length === 0 ? (
          <EmptyState
            id="dashboard-empty-state"
            title="No hay widgets en tu Dashboard"
            description="No tienes ningún módulo habilitado actualmente. Puedes activar los módulos predeterminados o instalar nuevos módulos personales desde el catálogo."
            actionLabel="Abrir gestión de módulos"
            onAction={() => onNavigate('/modules')}
            secondaryActionLabel="Restablecer configuración inicial"
            onSecondaryAction={onFullReset}
            variant="warning"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlacements.map((placement) => {
              const widget = dynamicWidgets.find((w) => w.id === placement.widgetId);
              if (!widget) return null;
              const WidgetComponent = widget.component;
              return (
                <div key={placement.widgetId} className={`w-full ${SPAN_CLASSES[placement.gridSpan]}`}>
                  <Suspense
                    fallback={
                      <div className="border border-stone-300 bg-white p-6 text-xs font-mono text-stone-500 animate-pulse rounded-sm">
                        Cargando widget… {widget.title}
                      </div>
                    }
                  >
                    <WidgetComponent onNavigate={onNavigate} />
                  </Suspense>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
