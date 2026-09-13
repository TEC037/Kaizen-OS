/**
 * @file src/app/AppShell.tsx
 * @description Contenedor principal de Kaizen OS (Shell del Sistema).
 * Arquitectura modular desacoplada:
 * - Providers especializados (ShellLayoutProvider, scoring, lifecycle)
 * - Malla reactiva de sinergias cruzadas (useMeshSynergies)
 * - Navegación Keyboard-First y Omnibar (Cmd+K)
 * - Vistas y widgets generados dinámicamente desde el registry
 * - Modo Zen y Sensei Kaizen integrados
 */

import React, { useState, useMemo } from 'react';
import { useModuleLifecycle } from '../core/moduleLifecycle';
import {
  useKaizenScore,
  collectScoringRules,
  useDeclarativeScoring,
} from '../core/scoring';
import { useWidgetLayout } from '../core/widgetLayout';
import { useMeshSynergies } from '../core/meshSynergies';
import { useKeyboardShortcuts } from '../core/useKeyboardShortcuts';
import {
  getAllManifests,
  getEnabledManifests,
  getInstalledManifests,
  getAvailableManifests,
  getDynamicNavRoutes,
  getDynamicWidgets,
} from './moduleRegistry';
import { AppRouter } from './router';
import { ShellLayoutProvider, useShellLayout } from './providers/ShellLayoutProvider';
import { ShellHeader } from './layout/ShellHeader';
import { ShellModals } from './layout/ShellModals';
import { DashboardView } from './views/DashboardView';
import { ModulesManagerView } from './views/ModulesManagerView';
import { Star } from 'lucide-react';

const InnerShell: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('/');

  const {
    getStatus,
    installModule,
    suspendModule,
    activateModule,
    uninstallModule,
    resetToDefault,
  } = useModuleLifecycle();

  // Sistema de puntuación Kaizen
  const { scoreState, dailyPercent, lastToast, resetScore } = useKaizenScore();

  // Estado visual del Shell y preferencias
  const {
    zenMode,
    toggleZenMode,
    setZenMode,
    contextMode,
    setContextMode,
    showCommandBar,
    setShowCommandBar,
    showScoreModal,
    setShowScoreModal,
    showArchInspector,
    setShowArchInspector,
    showShortcutsModal,
    setShowShortcutsModal,
    showDashboardCustomize,
    setShowDashboardCustomize,
    soundEnabled,
    toggleSound,
    closeAllModals,
  } = useShellLayout();

  // Activar la Malla Entramada de Sinergias Cruzadas (Gym -> Hábitos -> Proyectos)
  useMeshSynergies();

  // Navegación generada dinámicamente desde manifiestos habilitados
  const dynamicNavRoutes = getDynamicNavRoutes(getStatus);
  const dynamicWidgets = getDynamicWidgets(getStatus);
  const { layout: widgetLayout, setPlacement, movePlacement } = useWidgetLayout(dynamicWidgets);

  // Catálogos para la pantalla de gestión de módulos
  const allManifests = getAllManifests();
  const installedManifests = getInstalledManifests(getStatus);
  const availableManifests = getAvailableManifests(getStatus);
  const enabledManifests = getEnabledManifests(getStatus);

  // Scoring declarativo (Fase 5)
  const enabledModuleSpecsKey = enabledManifests
    .map(
      (m) =>
        `${m.id}::${(m.spec?.events?.emits ?? [])
          .map((e) => `${e.name}:${e.points}`)
          .join(',')}`
    )
    .sort()
    .join('|');

  const scoringRules = useMemo(
    () =>
      enabledManifests.flatMap((m) =>
        collectScoringRules(m.id, m.spec?.events?.emits)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabledModuleSpecsKey]
  );
  useDeclarativeScoring(scoringRules);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFullReset = () => {
    resetToDefault();
    resetScore();
  };

  // Atajos globales de teclado
  useKeyboardShortcuts({
    onToggleCommandBar: () => setShowCommandBar(!showCommandBar),
    onToggleZenMode: toggleZenMode,
    onToggleShortcutsModal: () => setShowShortcutsModal(!showShortcutsModal),
    onToggleSound: toggleSound,
    onNavigate: navigate,
    onCloseModals: closeAllModals,
  });

  return (
    <div className="min-h-screen bg-[#f4f2ec] text-[#211d19] font-sans antialiased flex flex-col selection:bg-amber-200 selection:text-amber-950">
      {/* Cabecera del Sistema (oculta en Modo Zen para foco absoluto) */}
      {!zenMode && (
        <ShellHeader
          currentPath={currentPath}
          onNavigate={navigate}
          dynamicNavRoutes={dynamicNavRoutes}
          enabledModulesCount={enabledManifests.length}
          totalPoints={scoreState.totalPoints}
          dailyPercent={dailyPercent}
          zenMode={zenMode}
          onToggleZenMode={toggleZenMode}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          contextMode={contextMode}
          onSelectContextMode={setContextMode}
          onOpenCommandBar={() => setShowCommandBar(true)}
          onOpenScoreModal={() => setShowScoreModal(true)}
          onOpenInspector={() => setShowArchInspector(!showArchInspector)}
          isInspectorOpen={showArchInspector}
        />
      )}

      {/* Notificación flotante al ganar puntos */}
      {lastToast && (
        <aside aria-label="Notificación de puntos" className="fixed bottom-4 right-4 z-50 animate-in fade-in duration-200 font-mono text-xs">
          <div className="border border-stone-300 bg-[#fffdf8] text-stone-900 shadow-xl p-3 max-w-sm rounded-sm border-l-4 border-l-emerald-600">
            <div className="flex items-center gap-2 font-bold">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span>+{lastToast.points} PUNTOS KAIZEN</span>
            </div>
            <p className="text-stone-600 text-[11px] mt-0.5">{lastToast.reason}</p>
            {lastToast.isMilestone && (
              <span className="block mt-1 font-bold text-emerald-700 text-[11px]">
                ★ ¡Hito alcanzado: 1% de mejora completado hoy!
              </span>
            )}
          </div>
        </aside>
      )}

      {/* Orquestador de Modales y Omnibar */}
      <ShellModals
        showScoreModal={showScoreModal}
        onCloseScoreModal={() => setShowScoreModal(false)}
        scoreState={scoreState}
        dailyPercent={dailyPercent}
        onResetScore={resetScore}
        showArchInspector={showArchInspector}
        onCloseArchInspector={() => setShowArchInspector(false)}
        allManifests={allManifests}
        getStatus={getStatus}
        onNavigate={navigate}
        showShortcutsModal={showShortcutsModal}
        onCloseShortcutsModal={() => setShowShortcutsModal(false)}
        showCommandBar={showCommandBar}
        onCloseCommandBar={() => setShowCommandBar(false)}
        zenMode={zenMode}
        onToggleZenMode={toggleZenMode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenScoreModal={() => setShowScoreModal(true)}
        onOpenInspector={() => setShowArchInspector(true)}
      />

      {/* Contenido Principal de la Aplicación */}
      <main className={`flex-1 w-full mx-auto p-4 sm:p-6 ${zenMode ? 'max-w-4xl' : 'max-w-7xl'}`}>
        <AppRouter
          currentPath={currentPath}
          onNavigate={navigate}
          statusResolver={getStatus}
          onInstallModule={installModule}
          onActivateModule={activateModule}
          dashboardComponent={
            <DashboardView
              scoreState={scoreState}
              dailyPercent={dailyPercent}
              dynamicWidgets={dynamicWidgets}
              widgetLayout={widgetLayout}
              setPlacement={setPlacement}
              movePlacement={movePlacement}
              showDashboardCustomize={showDashboardCustomize}
              onToggleDashboardCustomize={() => setShowDashboardCustomize((v) => !v)}
              enabledManifests={enabledManifests}
              onNavigate={navigate}
              onOpenScoreModal={() => setShowScoreModal(true)}
              onFullReset={handleFullReset}
              zenMode={zenMode}
              onExitZen={() => setZenMode(false)}
              contextMode={contextMode}
            />
          }
          modulesManagerComponent={
            <ModulesManagerView
              allManifests={allManifests}
              installedManifests={installedManifests}
              availableManifests={availableManifests}
              enabledManifests={enabledManifests}
              getStatus={getStatus}
              installModule={installModule}
              suspendModule={suspendModule}
              activateModule={activateModule}
              uninstallModule={uninstallModule}
              onFullReset={handleFullReset}
              onNavigate={navigate}
            />
          }
        />
      </main>

      {/* Pie de página Editorial (oculto en Modo Zen) */}
      {!zenMode && (
        <footer className="border-t border-[#d9d3c5] bg-[#fffdf8] py-4 mt-12 text-xs font-mono text-stone-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">Kaizen OS</span>
              <span>• Entorno de mejora continua sistemática (+1% diario)</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(true)}
                className="hover:text-stone-900 underline underline-offset-2 cursor-pointer"
              >
                Atajos [?]
              </button>
              <button
                type="button"
                onClick={() => setShowScoreModal(true)}
                className="hover:text-stone-900 underline underline-offset-2 cursor-pointer"
              >
                Puntos: {scoreState.totalPoints} pts
              </button>
              <button
                type="button"
                onClick={() => navigate('/modules')}
                className="hover:text-stone-900 underline underline-offset-2 cursor-pointer"
              >
                Módulos
              </button>
              <button
                type="button"
                onClick={handleFullReset}
                className="hover:text-stone-900 underline underline-offset-2 cursor-pointer"
              >
                Restablecer sistema
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export const AppShell: React.FC = () => {
  return (
    <ShellLayoutProvider>
      <InnerShell />
    </ShellLayoutProvider>
  );
};
