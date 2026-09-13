/**
 * @file src/components/ZenWorkspace.tsx
 * @description Entorno de Enfoque Profundo (Modo Zen) de Kaizen OS.
 * Elimina toda distracción cognitiva visual y enfoca al usuario en su avance del 1%,
 * temporizador de enfoque de 25m y su próxima acción concreta inmediata con ejecución en 1 clic.
 */

import React, { useState, useEffect } from 'react';
import { Minimize2, Check, Flame, ArrowRight, Sparkles, Play, Pause, RotateCcw, Clock, CloudRain, RefreshCw } from 'lucide-react';
import { KzRingProgress } from './ui/KzRingProgress';
import { KzButton } from './ui/KzButton';
import { KzCard } from './ui/KzCard';
import { KzBadge } from './ui/KzBadge';
import { soundEngine } from '../core/sound';
import { awardKaizenPoints } from '../core/scoring';
import { kaizenBus } from '../sdk/bus';
import { KaizenContracts } from '../sdk/contracts';
import { loadProjects, saveProjects } from '../modules/projects/forja/src/storage/forjaStorage';
import { seedProjects } from '../modules/projects/forja/src/data/seed';

interface ForjaProject {
  id: string;
  title: string;
  nextAction?: string;
  status: string;
  progressPercent?: number;
  [key: string]: unknown;
}

interface ZenWorkspaceProps {
  scorePoints: number;
  dailyPercent: number;
  streakDays: number;
  onExitZen: () => void;
  onNavigate: (path: string) => void;
}

export const ZenWorkspace: React.FC<ZenWorkspaceProps> = ({
  scorePoints,
  dailyPercent,
  streakDays,
  onExitZen,
  onNavigate,
}) => {
  const [projects, setProjects] = useState<ForjaProject[]>(() => loadProjects(seedProjects));
  const [justCompletedAction, setJustCompletedAction] = useState(false);

  // Temporizador de Foco Profundo (25 min Monozukuri)
  const FOCUS_SECONDS = 25 * 60;
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isRainActive, setIsRainActive] = useState(() => soundEngine.isAmbientActive());

  // Cleanup de sonido ambiente al desmontar o salir
  useEffect(() => {
    return () => {
      soundEngine.stopAmbientRain();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      soundEngine.playMilestone();
      awardKaizenPoints(15, 'projects', 'Bloque de Foco Profundo completado (25m)');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsLeft]);

  const toggleTimer = () => {
    soundEngine.playTap();
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    soundEngine.playTap();
    setIsTimerRunning(false);
    setSecondsLeft(FOCUS_SECONDS);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeProjects = projects.filter((p) => p.status !== 'Completado');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const activeProject =
    (selectedProjectId ? activeProjects.find((p) => p.id === selectedProjectId) : null) ||
    activeProjects.find((p) => p.status === 'En progreso') ||
    activeProjects[0] ||
    projects[0];

  const handleCycleProject = () => {
    if (activeProjects.length <= 1) return;
    const currentIndex = activeProjects.findIndex((p) => p.id === activeProject?.id);
    const nextIndex = (currentIndex + 1) % activeProjects.length;
    setSelectedProjectId(activeProjects[nextIndex].id);
    soundEngine.playTap();
  };

  const handleCompleteAction = () => {
    if (!activeProject) return;

    const updated = projects.map((p) => {
      if (p.id === activeProject.id) {
        const nextProgress = Math.min(100, (p.progressPercent || 10) + 20);
        const newStatus = nextProgress >= 100 ? 'Completado' : 'En progreso';
        return {
          ...p,
          progressPercent: nextProgress,
          status: newStatus,
          nextActionDoneAt: new Date().toISOString(),
        };
      }
      return p;
    });

    setProjects(updated);
    saveProjects(updated);

    soundEngine.playComplete();
    awardKaizenPoints(5, 'projects', `Próxima acción completada en Modo Zen: "${activeProject.nextAction || 'Acción en FORJA'}"`);

    kaizenBus.emit(KaizenContracts.ForjaNextActionDone, {
      projectId: activeProject.id,
      projectName: activeProject.title,
      taskTitle: activeProject.nextAction || 'Próxima acción',
    });

    setJustCompletedAction(true);
    setTimeout(() => setJustCompletedAction(false), 3000);
  };

  const timerProgress = Math.round(((FOCUS_SECONDS - secondsLeft) / FOCUS_SECONDS) * 100);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Botón flotante para salir del modo zen */}
      <div className="fixed top-6 right-6 z-40">
        <KzButton
          variant="craft"
          size="sm"
          onClick={() => {
            soundEngine.playTap();
            onExitZen();
          }}
          icon={<Minimize2 size={13} />}
          title="Salir de Modo Zen (tecla Z)"
        >
          Salir de Modo Zen [Z]
        </KzButton>
      </div>

      <div className="w-full max-w-xl space-y-6 text-center">
        {/* Anillo Central del 1% */}
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <KzRingProgress percent={dailyPercent} size={96} strokeWidth={7} />
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-stone-500 block">
              COMPROMISO DIARIO DE MEJORA CONTINUA
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 mt-0.5">
              {dailyPercent >= 100 ? '★ ¡Meta del 1% Cumplida!' : `${dailyPercent}% de Avance Hoy`}
            </h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-stone-600">
            <span className="flex items-center gap-1">
              <Flame size={13} className="text-amber-600" />
              Racha: <strong>{streakDays} {streakDays === 1 ? 'día' : 'días'}</strong>
            </span>
            <span>•</span>
            <span>Hoy: <strong>{scorePoints} pts</strong></span>
          </div>
        </div>

        {/* Temporizador de Foco Profundo (25m Pomodoro) */}
        <KzCard variant="surface" className="border-stone-300 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-700">
              <Clock size={13} className="text-amber-700" />
              <span className="font-bold uppercase tracking-wider">Bloque de Foco Profundo</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  const next = soundEngine.toggleAmbientRain();
                  setIsRainActive(next);
                }}
                className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono border rounded-xs transition-colors cursor-pointer ${
                  isRainActive
                    ? 'border-cyan-400 bg-cyan-50 text-cyan-900 font-semibold'
                    : 'border-stone-300 bg-stone-50 text-stone-600 hover:text-stone-900 hover:border-stone-400'
                }`}
                title={isRainActive ? 'Desactivar lluvia relajante' : 'Activar sonido de lluvia relajante para foco'}
              >
                <CloudRain size={11} className={isRainActive ? 'text-cyan-600' : 'text-stone-400'} />
                <span>{isRainActive ? 'Lluvia Zen: On' : 'Lluvia Zen'}</span>
              </button>
              <span className="text-[10px] font-mono text-stone-500">25 min</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="text-3xl sm:text-4xl font-mono font-bold text-stone-900 tracking-wider">
              {formatTime(secondsLeft)}
            </div>

            <div className="flex items-center gap-2">
              <KzButton
                variant={isTimerRunning ? 'craft' : 'primary'}
                size="sm"
                onClick={toggleTimer}
                icon={isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
              >
                {isTimerRunning ? 'Pausar' : 'Iniciar'}
              </KzButton>
              <button
                type="button"
                onClick={resetTimer}
                className="p-2 border border-stone-300 text-stone-600 hover:text-stone-900 rounded-sm cursor-pointer hover:bg-stone-100"
                title="Reiniciar temporizador"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          <div className="w-full bg-stone-200 h-1.5 rounded-xs overflow-hidden">
            <div
              className="bg-amber-700 h-full transition-all duration-300"
              style={{ width: `${timerProgress}%` }}
            />
          </div>
        </KzCard>

        {/* Tarjeta de Foco: La Próxima Acción Inmediata */}
        <KzCard variant="surface" className="text-left border-stone-300 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <div className="flex items-center gap-2">
              <KzBadge variant="accent">FOCO INMEDIATO</KzBadge>
              <span className="text-xs font-mono text-stone-600">FORJA · Taller de Proyectos</span>
            </div>
            <div className="flex items-center gap-2">
              {activeProjects.length > 1 && (
                <button
                  type="button"
                  onClick={handleCycleProject}
                  className="flex items-center gap-1 text-[11px] font-mono text-stone-600 hover:text-stone-900 border border-stone-300 bg-white px-1.5 py-0.5 rounded-xs cursor-pointer hover:border-stone-400"
                  title="Cambiar al siguiente proyecto activo"
                >
                  <RefreshCw size={11} className="text-stone-500" />
                  <span>Otro proyecto ({activeProjects.length})</span>
                </button>
              )}
              <Sparkles size={14} className="text-amber-600" />
            </div>
          </div>

          {activeProject ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-600 uppercase tracking-wider block">
                  Proyecto: {activeProject.title}
                </span>
                <span className="text-[10px] font-mono border border-stone-200 px-1.5 py-0.2 rounded-xs bg-[#faf8f1] text-stone-700">
                  {activeProject.progressPercent || 10}%
                </span>
              </div>

              <p className="text-base sm:text-lg font-bold text-stone-900 font-mono">
                &ldquo;{activeProject.nextAction || 'Definir siguiente paso'}&rdquo;
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-2">
                <KzButton
                  variant="primary"
                  size="md"
                  onClick={handleCompleteAction}
                  icon={<Check size={14} />}
                  disabled={justCompletedAction}
                >
                  {justCompletedAction ? '✓ ¡Acción Forjada! (+5 pts)' : '✓ Hecho (+5 pts)'}
                </KzButton>

                <KzButton
                  variant="craft"
                  size="md"
                  onClick={() => {
                    soundEngine.playTap();
                    onExitZen();
                    onNavigate('/projects');
                  }}
                  icon={<ArrowRight size={13} />}
                >
                  Abrir Taller FORJA
                </KzButton>
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-500 italic py-2">
              No hay proyectos activos en FORJA. Puedes abrir el taller para forjar una nueva pieza.
            </div>
          )}
        </KzCard>

        <p className="text-xs font-mono text-stone-600">
          Tip de maestría: 1% es suficiente. No necesitas hacer todo hoy; solo necesitas dar el siguiente paso.
        </p>
      </div>
    </div>
  );
};
