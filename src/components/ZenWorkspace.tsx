/**
 * @file src/components/ZenWorkspace.tsx
 * @description Entorno de Enfoque Profundo (Modo Zen) de Kaizen OS.
 * Elimina toda distracción cognitiva visual y enfoca al usuario en su avance del 1%
 * y su próxima acción concreta inmediata.
 */

import React from 'react';
import { Minimize2, CheckCircle2, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { KzRingProgress } from './ui/KzRingProgress';
import { KzButton } from './ui/KzButton';
import { KzCard } from './ui/KzCard';
import { KzBadge } from './ui/KzBadge';
import { loadProjects } from '../modules/projects/forja/src/storage/forjaStorage';
import { seedProjects } from '../modules/projects/forja/src/data/seed';

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
  const projects = loadProjects(seedProjects);
  const activeProject = projects.find((p) => p.status === 'En progreso') || projects[0];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Botón flotante para salir del modo zen */}
      <div className="fixed top-6 right-6 z-40">
        <KzButton
          variant="craft"
          size="sm"
          onClick={onExitZen}
          icon={<Minimize2 size={13} />}
          title="Salir de Modo Zen (tecla Z)"
        >
          Salir de Modo Zen [Z]
        </KzButton>
      </div>

      <div className="w-full max-w-xl space-y-8 text-center">
        {/* Anillo Central del 1% */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <KzRingProgress percent={dailyPercent} size={110} strokeWidth={8} />
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500 block">
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
            <span>Hoy: <strong>{scorePoints} pts acumulados</strong></span>
          </div>
        </div>

        {/* Tarjeta de Foco: La Próxima Acción Inmediata */}
        <KzCard variant="surface" className="text-left border-stone-300 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
            <div className="flex items-center gap-2">
              <KzBadge variant="accent">FOCO INMEDIATO</KzBadge>
              <span className="text-xs font-mono text-stone-600">FORJA · Taller de Proyectos</span>
            </div>
            <Sparkles size={14} className="text-amber-600" />
          </div>

          {activeProject ? (
            <div className="space-y-2">
              <span className="text-xs font-mono text-stone-600 uppercase tracking-wider block">
                Proyecto: {activeProject.title}
              </span>
              <p className="text-base sm:text-lg font-bold text-stone-900">
                &ldquo;{activeProject.nextAction}&rdquo;
              </p>
              <p className="text-xs text-stone-600">
                Dedica tu atención únicamente a concluir esta acción. Al forjarla, emitirás el avance y te acercarás al siguiente hito.
              </p>
              <div className="pt-3 flex gap-2">
                <KzButton
                  variant="primary"
                  size="md"
                  onClick={() => {
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
              No hay proyectos activos en FORJA. Puedes abrir el taller para definir tu siguiente pieza.
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
