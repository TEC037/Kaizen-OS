/**
 * @file src/app/layout/ShellModals.tsx
 * @description Orquestador de modales del Shell de Kaizen OS:
 * - Modal de Puntuación Kaizen (Historial, Filosofía 1%, Reglas de Puntos)
 * - Inspector de Arquitectura y Route Guard
 * - Modal de Atajos de Teclado
 * - Centro de Mando / Omnibar (Cmd+K)
 */

import React, { useState } from 'react';
import {
  Star,
  X,
  History,
  Code2,
  Download,
  Upload,
} from 'lucide-react';
import { exportKaizenBackup, importKaizenBackup } from '../../core/backup';
import { DAILY_1_PERCENT_TARGET } from '../../core/scoring';
import { ModuleManifest, KaizenScoreState } from '../../core/types';
import { soundEngine } from '../../core/sound';
import { ShellCommandBar } from './ShellCommandBar';
import { ShortcutsModal } from '../../components/ShortcutsModal';

interface ShellModalsProps {
  // Score Modal
  showScoreModal: boolean;
  onCloseScoreModal: () => void;
  scoreState: KaizenScoreState;
  dailyPercent: number;
  onResetScore: () => void;

  // Inspector
  showArchInspector: boolean;
  onCloseArchInspector: () => void;
  allManifests: ModuleManifest[];
  getStatus: (id: string) => string;
  onNavigate: (path: string) => void;

  // Shortcuts
  showShortcutsModal: boolean;
  onCloseShortcutsModal: () => void;

  // Omnibar
  showCommandBar: boolean;
  onCloseCommandBar: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenScoreModal: () => void;
  onOpenInspector: () => void;
}

export const ShellModals: React.FC<ShellModalsProps> = ({
  showScoreModal,
  onCloseScoreModal,
  scoreState,
  dailyPercent,
  onResetScore,
  showArchInspector,
  onCloseArchInspector,
  allManifests,
  getStatus,
  onNavigate,
  showShortcutsModal,
  onCloseShortcutsModal,
  showCommandBar,
  onCloseCommandBar,
  zenMode,
  onToggleZenMode,
  soundEnabled,
  onToggleSound,
  onOpenScoreModal,
  onOpenInspector,
}) => {
  const [manualRouteInput, setManualRouteInput] = useState<string>('/gym');
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await importKaizenBackup(file);
    if (res.success) {
      window.alert(`¡Respaldo restaurado con éxito! Se sincronizaron ${res.count} claves. La aplicación se recargará para aplicar los cambios.`);
      window.location.reload();
    } else {
      window.alert(`Error al restaurar: ${res.error || 'Archivo inválido'}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredHistory = historyFilter === 'all'
    ? scoreState.history
    : scoreState.history.filter((item) => item.sourceModule === historyFilter);

  return (
    <>
      {/* Omnibar Global (Cmd+K) */}
      <ShellCommandBar
        isOpen={showCommandBar}
        onClose={onCloseCommandBar}
        onNavigate={onNavigate}
        zenMode={zenMode}
        onToggleZenMode={onToggleZenMode}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onOpenScoreModal={onOpenScoreModal}
        onOpenInspector={onOpenInspector}
      />

      {/* Modal de Atajos de Teclado (?) */}
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={onCloseShortcutsModal}
      />

      {/* Modal de Detalle del Sistema de Puntuación Kaizen */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="border border-stone-300 bg-[#fffdf8] w-full max-w-2xl p-6 font-mono max-h-[90vh] overflow-y-auto space-y-5 rounded-sm shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <h2 className="text-sm sm:text-base font-bold text-stone-900 uppercase tracking-wide">
                  SISTEMA DE PUNTUACIÓN KAIZEN
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  onCloseScoreModal();
                  soundEngine.playTap();
                }}
                className="text-stone-500 hover:text-stone-900 border border-stone-300 px-2 py-0.5 rounded-sm cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Filosofía 1% */}
            <div className="border border-stone-200 bg-[#faf8f1] p-4 text-xs space-y-2 text-stone-700 rounded-sm">
              <p className="font-bold text-stone-900">
                Principio rector: 1% de mejora cada día
              </p>
              <p className="leading-relaxed">
                En la filosofía Kaizen, no se buscan transformaciones heroicas de la noche a la mañana. Mejorar apenas un 1% diario resulta matemáticamente en un crecimiento compuesto de 37 veces a lo largo de un año. El sistema recompensa la constancia y el avance incremental.
              </p>
            </div>

            {/* Métricas de puntuación */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="border border-stone-200 p-3 bg-[#faf8f1] rounded-sm">
                <span className="text-[10px] uppercase text-stone-600 block">Puntos Totales</span>
                <span className="text-2xl font-bold text-stone-900">{scoreState.totalPoints}</span>
                <span className="text-[10px] text-stone-600 block">Inicia en 0 pts</span>
              </div>
              <div className="border border-stone-200 p-3 bg-[#faf8f1] rounded-sm">
                <span className="text-[10px] uppercase text-stone-600 block">Puntos Hoy</span>
                <span className="text-2xl font-bold text-stone-900">{scoreState.todayPoints}</span>
                <span className="text-[10px] text-stone-600 block">Meta: {scoreState.dailyGoalPoints} pts</span>
              </div>
              <div className="border border-stone-200 p-3 bg-[#faf8f1] rounded-sm">
                <span className="text-[10px] uppercase text-stone-600 block">Meta 1% Hoy</span>
                <span className="text-2xl font-bold text-emerald-700">{dailyPercent}%</span>
                <span className="text-[10px] text-stone-600 block">
                  {scoreState.todayPoints >= scoreState.dailyGoalPoints ? 'Cumplido' : 'En progreso'}
                </span>
              </div>
              <div className="border border-stone-200 p-3 bg-[#faf8f1] rounded-sm">
                <span className="text-[10px] uppercase text-stone-600 block">Racha Activa</span>
                <span className="text-2xl font-bold text-stone-900">{scoreState.currentStreakDays}</span>
                <span className="text-[10px] text-stone-600 block">Días seguidos</span>
              </div>
            </div>

            {/* Reglas de Puntuación por Módulo */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-stone-900 border-b border-stone-200 pb-1">
                Reglas de Recompensa Modular:
              </h3>
              <div className="text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Hábitos: Marcar hábito como cumplido hoy</span>
                  <span className="font-bold text-stone-900">+10 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Hábitos: Definir un nuevo hábito en el sistema</span>
                  <span className="font-bold text-stone-900">+5 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Proyectos: Estructurar nuevo proyecto con próxima acción</span>
                  <span className="font-bold text-stone-900">+15 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Proyectos: Avanzar el estado de un proyecto</span>
                  <span className="font-bold text-stone-900">+15 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Proyectos: Completar la próxima acción inmediata</span>
                  <span className="font-bold text-stone-900">+5 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Proyectos: Hito de finalizar un proyecto por completo</span>
                  <span className="font-bold text-stone-900">+50 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Gimnasio: Registrar una sesión de entrenamiento</span>
                  <span className="font-bold text-stone-900">+30 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Lectura: Completar sesión de lectura de páginas</span>
                  <span className="font-bold text-stone-900">+15 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Lectura: Hito de finalizar un libro completo</span>
                  <span className="font-bold text-stone-900">+45 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1">
                  <span>Finanzas: Registro y control presupuestario</span>
                  <span className="font-bold text-stone-900">+10 pts</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-1 bg-emerald-50 px-2 font-semibold text-emerald-800 rounded-sm">
                  <span>Hito Kaizen: Alcanzar la meta del 1% del día ({DAILY_1_PERCENT_TARGET} pts)</span>
                  <span>+25 pts bono</span>
                </div>
              </div>
            </div>

            {/* Historial de Puntos */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-1.5">
                <h3 className="text-xs font-bold uppercase text-stone-900 flex items-center gap-1.5">
                  <History size={13} />
                  <span>Historial de Puntos ({filteredHistory.length})</span>
                </h3>

                {/* Micro-filtros por módulo */}
                <div className="flex items-center gap-1 text-[10px]">
                  {(['all', 'habits', 'projects', 'gym', 'reading', 'finance', 'system'] as const).map((mod) => {
                    const count = mod === 'all'
                      ? scoreState.history.length
                      : scoreState.history.filter((h) => h.sourceModule === mod).length;
                    if (count === 0 && mod !== 'all') return null;
                    const labels: Record<string, string> = {
                      all: 'Todos',
                      habits: 'Hábitos',
                      projects: 'FORJA',
                      gym: 'Gym',
                      reading: 'Lectura',
                      finance: 'Finanzas',
                      system: 'Hito',
                    };
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => {
                          setHistoryFilter(mod);
                          soundEngine.playTap();
                        }}
                        className={`px-1.5 py-0.5 rounded-xs transition-colors cursor-pointer ${
                          historyFilter === mod
                            ? 'bg-stone-900 text-stone-100 font-bold'
                            : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {labels[mod]} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {scoreState.history.length === 0 ? (
                <div className="p-4 border border-dashed border-stone-300 text-center text-xs text-stone-500 rounded-sm">
                  Aún no has registrado acciones hoy. Tu puntuación actual es de 0 puntos. ¡Completa tu primer hábito o proyecto para comenzar a sumar!
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-4 border border-dashed border-stone-300 text-center text-xs text-stone-500 rounded-sm">
                  No hay acciones registradas en esta categoría.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 border border-stone-200 bg-[#faf8f1] flex items-center justify-between gap-2 rounded-sm"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-900 block">{item.reason}</span>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                          <span className="uppercase px-1 border border-stone-300 bg-white rounded-xs">
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
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetScore();
                    soundEngine.playTap();
                  }}
                  className="px-3 py-1.5 border border-stone-300 text-stone-600 hover:text-red-700 hover:border-red-300 rounded-sm cursor-pointer"
                  title="Restablece la puntuación a 0 para pruebas de verificación"
                >
                  Reiniciar puntos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    exportKaizenBackup();
                  }}
                  className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 rounded-sm cursor-pointer"
                  title="Descargar copia de seguridad en JSON con todos los datos"
                >
                  <Download size={13} />
                  <span>Descargar Respaldo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playTap();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 rounded-sm cursor-pointer"
                  title="Restaurar copia de seguridad desde un archivo JSON"
                >
                  <Upload size={13} />
                  <span>Restaurar</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  onCloseScoreModal();
                  soundEngine.playTap();
                }}
                className="px-4 py-1.5 border border-[#211d19] bg-[#211d19] text-[#faf8f1] font-bold rounded-sm cursor-pointer hover:bg-stone-800"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspector de Arquitectura Modular */}
      {showArchInspector && (
        <aside aria-label="Inspector de arquitectura del sistema" className="border-b border-stone-700 bg-stone-900 text-stone-100 p-4 font-mono text-xs">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between border-b border-stone-700 pb-2">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-emerald-400" />
                <span className="font-bold text-white tracking-wide">
                  INSPECTOR DE ARQUITECTURA MODULAR • DIAGNÓSTICO EN TIEMPO REAL
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseArchInspector}
                className="text-stone-400 hover:text-white px-2 py-0.5 border border-stone-700 rounded-sm cursor-pointer"
              >
                Cerrar [×]
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Simulador de Route Guard */}
              <div className="bg-stone-800/80 p-3 border border-stone-700 space-y-2 rounded-sm">
                <span className="font-bold text-stone-300 block">
                  1. Probar Route Guard / Acceso no autorizado:
                </span>
                <p className="text-[11px] text-stone-400">
                  Escribe una ruta para comprobar cómo el enrutador bloquea rutas de módulos no habilitados (ej: /gym).
                </p>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={manualRouteInput}
                    onChange={(e) => setManualRouteInput(e.target.value)}
                    className="px-2 py-1 bg-stone-950 text-white border border-stone-600 text-xs w-full rounded-sm"
                    placeholder="/gym"
                  />
                  <button
                    type="button"
                    onClick={() => onNavigate(manualRouteInput)}
                    className="px-2.5 py-1 bg-stone-200 text-stone-950 font-bold hover:bg-white rounded-sm cursor-pointer shrink-0"
                  >
                    Ir
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap pt-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setManualRouteInput('/gym'); onNavigate('/gym'); }}
                    className="underline text-stone-300 hover:text-white"
                  >
                    /gym
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualRouteInput('/reading'); onNavigate('/reading'); }}
                    className="underline text-stone-300 hover:text-white"
                  >
                    /reading
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualRouteInput('/finance'); onNavigate('/finance'); }}
                    className="underline text-stone-300 hover:text-white"
                  >
                    /finance
                  </button>
                </div>
              </div>

              {/* Matriz de estados actuales */}
              <div className="bg-stone-800/80 p-3 border border-stone-700 space-y-1.5 rounded-sm">
                <span className="font-bold text-stone-300 block">
                  2. Matriz de Estados de Módulos (storage):
                </span>
                <div className="space-y-1 text-[11px]">
                  {allManifests.map((m) => {
                    const st = getStatus(m.id);
                    const color =
                      st === 'enabled'
                        ? 'text-emerald-400'
                        : st === 'suspended'
                        ? 'text-stone-400'
                        : 'text-amber-400';
                    return (
                      <div key={m.id} className="flex items-center justify-between border-b border-stone-700/50 pb-0.5">
                        <span className="text-stone-300">{m.name} ({m.id}):</span>
                        <span className={`font-bold ${color}`}>[{st.toUpperCase()}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contrato de modularidad y puntuación */}
              <div className="bg-stone-800/80 p-3 border border-stone-700 space-y-1.5 rounded-sm">
                <span className="font-bold text-stone-300 block">
                  3. Puntuación & Modularidad:
                </span>
                <ul className="text-[11px] text-stone-400 space-y-1 list-disc list-inside">
                  <li>Puntuación actual: <strong>{scoreState.totalPoints} pts</strong></li>
                  <li>Avance Kaizen hoy: <strong>{dailyPercent}%</strong></li>
                  <li>Malla reactiva desacoplada activa.</li>
                  <li>Inicia estrictamente en 0 pts.</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};
