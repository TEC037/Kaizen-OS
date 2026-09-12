/**
 * @file src/app/AppShell.tsx
 * @description Contenedor principal de Kaizen OS (Shell del Sistema).
 * Desacoplado por completo de módulos específicos:
 * - Genera el menú dinámicamente a partir de `getDynamicNavRoutes()`.
 * - Genera el dashboard dinámicamente a partir de `getDynamicWidgets()`.
 * - Integra el sistema de puntuación Kaizen (inicia en 0 pts, meta del 1% diario).
 * - Cero referencias cableadas o condicionales como `if (gymEnabled)`.
 */

import React, { useState } from 'react';
import { useModuleLifecycle } from '../core/moduleLifecycle';
import { useKaizenScore, DAILY_1_PERCENT_TARGET } from '../core/scoring';
import {
  getAllManifests,
  getEnabledManifests,
  getInstalledManifests,
  getAvailableManifests,
  getDynamicNavRoutes,
  getDynamicWidgets,
} from './moduleRegistry';
import { AppRouter } from './router';
import { ModuleCard } from '../components/ModuleCard';
import { EmptyState } from '../components/EmptyState';
import {
  LayoutDashboard,
  Layers,
  RotateCcw,
  CheckSquare,
  FolderKanban,
  Dumbbell,
  BookOpen,
  Wallet,
  Code2,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Star,
  Flame,
  Award,
  TrendingUp,
  History,
  X,
} from 'lucide-react';

/**
 * Mapeo visual de iconos para el menú dinámico sin acoplar componentes
 */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CheckSquare,
  FolderKanban,
  Dumbbell,
  BookOpen,
  Wallet,
};

export const AppShell: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [showArchInspector, setShowArchInspector] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [manualRouteInput, setManualRouteInput] = useState<string>('/gym');

  const {
    getStatus,
    installModule,
    suspendModule,
    activateModule,
    uninstallModule,
    resetToDefault,
  } = useModuleLifecycle();

  // Sistema de puntuación Kaizen
  const {
    scoreState,
    dailyPercent,
    lastToast,
    resetScore,
  } = useKaizenScore();

  // Navegación generada PURAMENTE desde manifiestos habilitados
  const dynamicNavRoutes = getDynamicNavRoutes(getStatus);

  // Widgets generados PURAMENTE desde manifiestos habilitados
  const dynamicWidgets = getDynamicWidgets(getStatus);

  // Catálogos para la pantalla de gestión de módulos
  const allManifests = getAllManifests();
  const installedManifests = getInstalledManifests(getStatus);
  const availableManifests = getAvailableManifests(getStatus);
  const enabledManifests = getEnabledManifests(getStatus);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFullReset = () => {
    resetToDefault();
    resetScore();
  };

  /**
   * Vista: Dashboard Principal
   */
  const renderDashboard = () => {
    const todayFormatted = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());

    const isDailyGoalAchieved = scoreState.todayPoints >= scoreState.dailyGoalPoints;

    return (
      <div className="space-y-6">
        {/* Banner de Bienvenida y Resumen del Día */}
        <div className="border border-zinc-300 bg-white p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-200 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  ESPACIO PERSONAL • KAIZEN OS
                </span>
                <span className="text-[10px] font-mono border border-emerald-300 bg-emerald-50 text-emerald-800 px-1.5 py-0.2">
                  {enabledManifests.length} módulos activos
                </span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mt-0.5">
                Hola, Alex
              </h1>
              <p className="text-xs text-zinc-500 capitalize">{todayFormatted}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-open-score-modal"
                onClick={() => setShowScoreModal(true)}
                className="px-3 py-2 text-xs font-mono border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 flex items-center gap-1.5 cursor-pointer"
                title="Ver detalle del sistema de puntos e historial Kaizen"
              >
                <Star size={13} className="text-amber-500 fill-amber-500" />
                <span className="font-bold">{scoreState.totalPoints} pts</span>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-600">+1% Hoy: {dailyPercent}%</span>
              </button>

              <button
                type="button"
                id="btn-goto-modules-dashboard"
                onClick={() => navigate('/modules')}
                className="px-3.5 py-2 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal size={14} />
                <span>Configuración de módulos</span>
              </button>
            </div>
          </div>

          {/* Resumen del Día y Filosofía Kaizen */}
          <div className="bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-zinc-500 shrink-0" />
              <span>
                Filosofía Kaizen: <strong>1% es suficiente avance por día</strong>. Acumulas puntos completando tareas y manteniendo consistencia.
              </span>
            </div>
            <span className="text-zinc-500">
              Modo: Wireframe funcional
            </span>
          </div>
        </div>

        {/* Tarjeta Wireframe: Compromiso de Mejora Continua (+1% Diario) */}
        <div className="border border-zinc-300 bg-white p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 border border-zinc-300 bg-zinc-100">
                <TrendingUp size={16} className="text-zinc-800" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 tracking-tight font-mono uppercase">
                  Compromiso de Mejora Continua (+1% Diario)
                </h2>
                <span className="text-[11px] text-zinc-500">
                  Meta del día: {DAILY_1_PERCENT_TARGET} puntos equivalen a tu 1% diario de mejora
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1 border border-zinc-200 px-2 py-0.5 bg-zinc-50">
                <Flame size={13} className="text-amber-600" />
                <span>Racha: <strong>{scoreState.currentStreakDays} {scoreState.currentStreakDays === 1 ? 'día' : 'días'}</strong></span>
              </div>
              <div className="flex items-center gap-1 border border-zinc-200 px-2 py-0.5 bg-zinc-50">
                <Award size={13} className="text-zinc-700" />
                <span>Hoy: <strong>{scoreState.todayPoints}/{scoreState.dailyGoalPoints} pts</strong></span>
              </div>
            </div>
          </div>

          {/* Barra de progreso de alambre hacia el 1% de hoy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-600">
                Avance hacia el hito del 1% de hoy:
              </span>
              <span className="font-bold text-zinc-900">
                {dailyPercent}% completado
              </span>
            </div>
            <div className="w-full h-3 border border-zinc-400 bg-zinc-100 p-0.5">
              <div
                className={`h-full transition-all duration-300 ${
                  isDailyGoalAchieved ? 'bg-emerald-700' : 'bg-zinc-800'
                }`}
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
          </div>

          {/* Estado de la meta y micro-acciones que otorgan puntos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <div className="text-zinc-600 font-mono text-[11px]">
              {isDailyGoalAchieved ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  ✓ ¡Meta del 1% alcanzada hoy! Has demostrado compromiso continuo (+25 pts de bono acreditados).
                </span>
              ) : (
                <span>
                  Te faltan <strong>{Math.max(0, scoreState.dailyGoalPoints - scoreState.todayPoints)} pts</strong> para alcanzar tu 1% de avance hoy.
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowScoreModal(true)}
              className="text-xs font-mono underline text-zinc-800 hover:text-zinc-950 cursor-pointer self-start sm:self-auto"
            >
              Ver desglose de puntos y reglas &rarr;
            </button>
          </div>
        </div>

        {/* Grid de Widgets del Dashboard generados DINÁMICAMENTE */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <span>Widgets activos en el Dashboard ({dynamicWidgets.length})</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              Generados a partir de los módulos habilitados
            </span>
          </div>

          {dynamicWidgets.length === 0 ? (
            <EmptyState
              id="dashboard-empty-state"
              title="No hay widgets en tu Dashboard"
              description="No tienes ningún módulo habilitado actualmente. Puedes activar los módulos predeterminados o instalar nuevos módulos personales desde el catálogo."
              actionLabel="Abrir gestión de módulos"
              onAction={() => navigate('/modules')}
              secondaryActionLabel="Restablecer configuración inicial"
              onSecondaryAction={handleFullReset}
              variant="warning"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dynamicWidgets.map((widget) => {
                const WidgetComponent = widget.component;
                return (
                  <div key={widget.id} className="w-full">
                    <WidgetComponent onNavigate={navigate} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Vista: Pantalla de Módulos (Gestión / Configuración)
   */
  const renderModulesManager = () => {
    return (
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="border border-zinc-300 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-800">
                CONFIGURACIÓN CENTRAL
              </span>
              <span className="font-mono text-xs text-zinc-500">
                {allManifests.length} módulos en catálogo
              </span>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mt-1 tracking-tight">
              Mis Módulos y Catálogo
            </h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Personaliza tu espacio instalando solo lo que necesitas. Los módulos desinstalados o suspendidos no ocupan espacio en el menú ni en el dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-reset-modules"
              onClick={handleFullReset}
              className="px-3 py-1.5 text-xs font-mono border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 flex items-center gap-1.5 cursor-pointer"
              title="Restablece la configuración inicial: Hábitos y Proyectos habilitados, otros disponibles"
            >
              <RotateCcw size={13} />
              <span>Restablecer módulos</span>
            </button>
          </div>
        </div>

        {/* Grupo 1: Módulos Instalados (Habilitados y Suspendidos) */}
        <div className="space-y-3">
          <div className="border-b border-zinc-300 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight uppercase font-mono">
                Módulos Instalados ({installedManifests.length})
              </h2>
              <span className="text-xs text-zinc-500">
                ({enabledManifests.length} habilitados, {installedManifests.length - enabledManifests.length} suspendidos)
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Forman parte de tu espacio
            </span>
          </div>

          {installedManifests.length === 0 ? (
            <EmptyState
              id="no-installed-modules-state"
              title="No tienes ningún módulo instalado"
              description="Tu espacio de trabajo está completamente vacío. Explora los módulos disponibles abajo para comenzar a armar tu sistema personal."
              actionLabel="Restablecer configuración por defecto"
              onAction={handleFullReset}
              variant="neutral"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installedManifests.map((manifest) => (
                <ModuleCard
                  key={manifest.id}
                  manifest={manifest}
                  status={getStatus(manifest.id)}
                  onInstall={installModule}
                  onSuspend={suspendModule}
                  onActivate={activateModule}
                  onUninstall={uninstallModule}
                  onNavigateToModule={navigate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Grupo 2: Módulos Disponibles para Instalar */}
        <div className="space-y-3 pt-4">
          <div className="border-b border-zinc-300 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight uppercase font-mono">
                Módulos Disponibles ({availableManifests.length})
              </h2>
              <span className="text-xs text-zinc-500">
                Listos para ser instalados en un click
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              Catálogo de extensión
            </span>
          </div>

          {availableManifests.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-xs text-zinc-600 font-mono">
              Todos los módulos del catálogo ya están instalados en tu sistema.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableManifests.map((manifest) => (
                <ModuleCard
                  key={manifest.id}
                  manifest={manifest}
                  status={getStatus(manifest.id)}
                  onInstall={installModule}
                  onSuspend={suspendModule}
                  onActivate={activateModule}
                  onUninstall={uninstallModule}
                  onNavigateToModule={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 font-sans antialiased flex flex-col">
      {/* Barra superior de Alambre / Header del Sistema */}
      <header className="border-b border-zinc-300 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo / Marca del Sistema */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <div className="w-7 h-7 border-2 border-zinc-900 bg-zinc-900 text-white flex items-center justify-center font-mono font-bold text-sm">
                K
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-zinc-900 group-hover:text-zinc-700">
                  Kaizen OS
                </span>
                <span className="text-[10px] font-mono text-zinc-500 block leading-none">
                  SISTEMA MODULAR v1.0
                </span>
              </div>
            </button>
          </div>

          {/* Menú de Navegación generado DINÁMICAMENTE */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            {/* Inicio / Dashboard */}
            <button
              type="button"
              id="nav-dashboard"
              onClick={() => navigate('/')}
              className={`px-3 py-1.5 border flex items-center gap-1.5 cursor-pointer transition-colors ${
                currentPath === '/'
                  ? 'border-zinc-900 bg-zinc-900 text-white font-semibold'
                  : 'border-transparent text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>

            {/* Rutas dinámicas de los módulos HABILITADOS */}
            {dynamicNavRoutes.map((route) => {
              const IconComponent = ICON_MAP[route.iconName] || ChevronRight;
              const isActive = currentPath === route.path;
              return (
                <button
                  key={route.path}
                  id={`nav-${route.moduleId}`}
                  type="button"
                  onClick={() => navigate(route.path)}
                  className={`px-3 py-1.5 border flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'border-zinc-900 bg-zinc-900 text-white font-semibold'
                      : 'border-transparent text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <IconComponent size={14} />
                  <span>{route.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Acciones de cabecera: Puntuación Kaizen, Gestión de Módulos e Inspector */}
          <div className="flex items-center gap-2">
            {/* Indicador de Puntos Kaizen */}
            <button
              type="button"
              id="header-score-button"
              onClick={() => setShowScoreModal(true)}
              className="px-2.5 py-1.5 text-xs font-mono border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 flex items-center gap-1.5 cursor-pointer"
              title="Sistema de puntuación y progreso diario"
            >
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span className="font-bold">{scoreState.totalPoints} pts</span>
              <span className="hidden sm:inline text-zinc-400">|</span>
              <span className="hidden sm:inline text-zinc-600 text-[11px]">
                1%: {dailyPercent}%
              </span>
            </button>

            <button
              type="button"
              id="nav-modules"
              onClick={() => navigate('/modules')}
              className={`px-3 py-1.5 text-xs font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                currentPath === '/modules'
                  ? 'border-zinc-900 bg-zinc-900 text-white font-semibold'
                  : 'border-zinc-300 bg-zinc-50 text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <Layers size={14} />
              <span>Mis Módulos</span>
              <span className="w-4 h-4 rounded-none bg-zinc-200 text-zinc-800 text-[10px] flex items-center justify-center font-bold">
                {enabledManifests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowArchInspector(!showArchInspector)}
              className="px-2.5 py-1.5 text-xs font-mono border border-zinc-300 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 flex items-center gap-1 cursor-pointer"
              title="Abrir inspector de arquitectura y pruebas de ruta"
            >
              <Code2 size={14} />
              <span className="hidden sm:inline">Inspector</span>
            </button>
          </div>
        </div>

        {/* Menú de navegación móvil para pantallas estrechas */}
        <div className="md:hidden border-t border-zinc-200 px-4 py-2 flex items-center gap-1 overflow-x-auto text-xs font-mono bg-zinc-50">
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`px-2.5 py-1 border shrink-0 ${
              currentPath === '/' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-300'
            }`}
          >
            Dashboard
          </button>
          {dynamicNavRoutes.map((route) => (
            <button
              key={route.path}
              type="button"
              onClick={() => navigate(route.path)}
              className={`px-2.5 py-1 border shrink-0 ${
                currentPath === route.path ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-300'
              }`}
            >
              {route.label}
            </button>
          ))}
        </div>
      </header>

      {/* Notificación flotante de alambre al ganar puntos */}
      {lastToast && (
        <aside aria-label="Notificación de puntos" className="fixed bottom-4 right-4 z-50 animate-in fade-in duration-200 font-mono text-xs">
          <div className="border-2 border-zinc-900 bg-white text-zinc-900 shadow-lg p-3 max-w-sm border-l-8 border-l-emerald-600">
            <div className="flex items-center gap-2 font-bold">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span>+{lastToast.points} PUNTOS KAIZEN</span>
            </div>
            <p className="text-zinc-600 text-[11px] mt-0.5">{lastToast.reason}</p>
            {lastToast.isMilestone && (
              <span className="block mt-1 font-bold text-emerald-700 text-[11px]">
                ★ ¡Hito alcanzado: 1% de mejora completado hoy!
              </span>
            )}
          </div>
        </aside>
      )}

      {/* Modal de Detalle del Sistema de Puntuación Kaizen */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="border-2 border-zinc-900 bg-white w-full max-w-2xl p-6 font-mono max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h2 className="text-base font-bold text-zinc-900">
                  SISTEMA DE PUNTUACIÓN KAIZEN
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="text-zinc-500 hover:text-zinc-900 border border-zinc-300 px-2 py-0.5"
              >
                <X size={14} />
              </button>
            </div>

            {/* Filosofía 1% */}
            <div className="border border-zinc-200 bg-zinc-50 p-4 text-xs space-y-2 text-zinc-700">
              <p className="font-bold text-zinc-900">
                Principio rector: 1% de mejora cada día
              </p>
              <p className="leading-relaxed">
                En la filosofía Kaizen, no se buscan transformaciones heroicas de la noche a la mañana. Mejorar apenas un 1% diario resulta matemáticamente en un crecimiento compuesto de 37 veces a lo largo de un año. El sistema recompensa la constancia y el avance incremental.
              </p>
            </div>

            {/* Métricas de puntuación */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="border border-zinc-300 p-3 bg-zinc-50">
                <span className="text-[10px] uppercase text-zinc-500 block">Puntos Totales</span>
                <span className="text-2xl font-bold text-zinc-900">{scoreState.totalPoints}</span>
                <span className="text-[10px] text-zinc-400 block">Inicia en 0 pts</span>
              </div>
              <div className="border border-zinc-300 p-3 bg-zinc-50">
                <span className="text-[10px] uppercase text-zinc-500 block">Puntos Hoy</span>
                <span className="text-2xl font-bold text-zinc-900">{scoreState.todayPoints}</span>
                <span className="text-[10px] text-zinc-400 block">Meta: {scoreState.dailyGoalPoints} pts</span>
              </div>
              <div className="border border-zinc-300 p-3 bg-zinc-50">
                <span className="text-[10px] uppercase text-zinc-500 block">Meta 1% Hoy</span>
                <span className="text-2xl font-bold text-emerald-700">{dailyPercent}%</span>
                <span className="text-[10px] text-zinc-400 block">
                  {scoreState.todayPoints >= scoreState.dailyGoalPoints ? 'Cumplido' : 'En progreso'}
                </span>
              </div>
              <div className="border border-zinc-300 p-3 bg-zinc-50">
                <span className="text-[10px] uppercase text-zinc-500 block">Racha Activa</span>
                <span className="text-2xl font-bold text-zinc-900">{scoreState.currentStreakDays}</span>
                <span className="text-[10px] text-zinc-400 block">Días seguidos</span>
              </div>
            </div>

            {/* Reglas de Puntuación por Módulo */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-zinc-900 border-b border-zinc-200 pb-1">
                Reglas de Recompensa Modular:
              </h3>
              <div className="text-xs space-y-1.5 text-zinc-600">
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Hábitos: Marcar hábito como cumplido hoy</span>
                  <span className="font-bold text-zinc-900">+10 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Hábitos: Definir un nuevo hábito en el sistema</span>
                  <span className="font-bold text-zinc-900">+5 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Proyectos: Estructurar nuevo proyecto con próxima acción</span>
                  <span className="font-bold text-zinc-900">+15 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Proyectos: Avanzar el estado de un proyecto</span>
                  <span className="font-bold text-zinc-900">+15 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Proyectos: Hito de finalizar un proyecto por completo</span>
                  <span className="font-bold text-zinc-900">+50 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Gimnasio: Registrar una sesión de entrenamiento</span>
                  <span className="font-bold text-zinc-900">+30 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Lectura: Completar sesión de lectura de páginas</span>
                  <span className="font-bold text-zinc-900">+15 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Lectura: Hito de finalizar un libro completo</span>
                  <span className="font-bold text-zinc-900">+45 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1">
                  <span>Finanzas: Registro y control presupuestario</span>
                  <span className="font-bold text-zinc-900">+10 pts</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 py-1 bg-emerald-50 px-2 font-semibold text-emerald-800">
                  <span>Hito Kaizen: Alcanzar la meta del 1% del día ({DAILY_1_PERCENT_TARGET} pts)</span>
                  <span>+25 pts bono</span>
                </div>
              </div>
            </div>

            {/* Historial de Puntos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                <h3 className="text-xs font-bold uppercase text-zinc-900 flex items-center gap-1.5">
                  <History size={13} />
                  <span>Historial de Puntos Registrados ({scoreState.history.length})</span>
                </h3>
              </div>

              {scoreState.history.length === 0 ? (
                <div className="p-4 border border-dashed border-zinc-300 text-center text-xs text-zinc-500">
                  Aún no has registrado acciones hoy. Tu puntuación actual es de 0 puntos. ¡Completa tu primer hábito o proyecto para comenzar a sumar!
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                  {scoreState.history.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-900 block">{item.reason}</span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span className="uppercase px-1 border border-zinc-300 bg-white">
                            {item.sourceModule}
                          </span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700 shrink-0">
                        +{item.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200 text-xs">
              <button
                type="button"
                onClick={resetScore}
                className="px-3 py-1.5 border border-zinc-300 text-zinc-600 hover:text-red-700 hover:border-red-300 cursor-pointer"
                title="Restablece la puntuación a 0 para pruebas de verificación"
              >
                Reiniciar puntuación a 0 pts
              </button>

              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-1.5 border border-zinc-900 bg-zinc-900 text-white font-bold cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspector de Arquitectura Modular (Panel de Creatividad y Evaluación Técnica) */}
      {showArchInspector && (
        <aside aria-label="Inspector de arquitectura del sistema" className="border-b-2 border-zinc-800 bg-zinc-900 text-zinc-100 p-4 font-mono text-xs">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-emerald-400" />
                <span className="font-bold text-white tracking-wide">
                  INSPECTOR DE ARQUITECTURA MODULAR • DIAGNÓSTICO EN TIEMPO REAL
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowArchInspector(false)}
                className="text-zinc-400 hover:text-white px-2 py-0.5 border border-zinc-700 cursor-pointer"
              >
                Cerrar [×]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Simulador de Navegación Directa para probar el Route Guard */}
              <div className="bg-zinc-800/80 p-3 border border-zinc-700 space-y-2">
                <span className="font-bold text-zinc-300 block">
                  1. Probar Route Guard / Acceso no autorizado:
                </span>
                <p className="text-[11px] text-zinc-400">
                  Escribe una ruta para comprobar cómo el enrutador bloquea rutas de módulos no habilitados (ej: /gym).
                </p>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={manualRouteInput}
                    onChange={(e) => setManualRouteInput(e.target.value)}
                    className="px-2 py-1 bg-zinc-950 text-white border border-zinc-600 text-xs w-full"
                    placeholder="/gym"
                  />
                  <button
                    type="button"
                    onClick={() => navigate(manualRouteInput)}
                    className="px-2.5 py-1 bg-zinc-200 text-zinc-950 font-bold hover:bg-white cursor-pointer shrink-0"
                  >
                    Ir
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap pt-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setManualRouteInput('/gym'); navigate('/gym'); }}
                    className="underline text-zinc-300 hover:text-white"
                  >
                    /gym
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualRouteInput('/reading'); navigate('/reading'); }}
                    className="underline text-zinc-300 hover:text-white"
                  >
                    /reading
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualRouteInput('/finance'); navigate('/finance'); }}
                    className="underline text-zinc-300 hover:text-white"
                  >
                    /finance
                  </button>
                </div>
              </div>

              {/* Matriz de estados actuales */}
              <div className="bg-zinc-800/80 p-3 border border-zinc-700 space-y-1.5">
                <span className="font-bold text-zinc-300 block">
                  2. Matriz de Estados de Módulos (storage):
                </span>
                <div className="space-y-1 text-[11px]">
                  {allManifests.map((m) => {
                    const st = getStatus(m.id);
                    const color =
                      st === 'enabled'
                        ? 'text-emerald-400'
                        : st === 'suspended'
                        ? 'text-zinc-400'
                        : 'text-amber-400';
                    return (
                      <div key={m.id} className="flex items-center justify-between border-b border-zinc-700/50 pb-0.5">
                        <span className="text-zinc-300">{m.name} ({m.id}):</span>
                        <span className={`font-bold ${color}`}>[{st.toUpperCase()}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contrato de modularidad y puntuación */}
              <div className="bg-zinc-800/80 p-3 border border-zinc-700 space-y-1.5">
                <span className="font-bold text-zinc-300 block">
                  3. Puntuación & Modularidad:
                </span>
                <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Puntuación actual: <strong>{scoreState.totalPoints} pts</strong></li>
                  <li>Avance Kaizen hoy: <strong>{dailyPercent}%</strong></li>
                  <li>Emisión desacoplada vía custom events.</li>
                  <li>Inicia estrictamente en 0 pts.</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Contenido Principal de la Aplicación */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <AppRouter
          currentPath={currentPath}
          onNavigate={navigate}
          statusResolver={getStatus}
          onInstallModule={installModule}
          onActivateModule={activateModule}
          dashboardComponent={renderDashboard()}
          modulesManagerComponent={renderModulesManager()}
        />
      </main>

      {/* Pie de página de Alambre */}
      <footer className="border-t border-zinc-300 bg-white py-4 mt-12 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800">Kaizen OS</span>
            <span>• Prototipo de baja fidelidad de arquitectura modular con sistema de puntos 1%</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowScoreModal(true)}
              className="hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
            >
              Puntos: {scoreState.totalPoints} pts
            </button>
            <button
              type="button"
              onClick={() => navigate('/modules')}
              className="hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
            >
              Configurar módulos
            </button>
            <button
              type="button"
              onClick={handleFullReset}
              className="hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
            >
              Restablecer módulos y puntos
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
