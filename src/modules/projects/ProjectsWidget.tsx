/**
 * @file src/modules/projects/ProjectsWidget.tsx
 * @description Widget de FORJA para el Dashboard de Kaizen OS.
 * Muestra las próximas acciones inmediatas y permite completarlas con 1 clic (reducción de fricción Kaizen).
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { ProjectItem, INITIAL_PROJECTS } from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { awardKaizenPoints } from '../../core/scoring';
import { ArrowRight, PlayCircle, Check } from 'lucide-react';
import { KzButton, KzBadge } from '../../components/ui';

function loadProjects(): ProjectItem[] {
  const fromForja = loadCustomData<ProjectItem[] | null>('forja_projects_v1', null);
  if (fromForja) return fromForja;
  return loadCustomData<ProjectItem[]>('projects_list', INITIAL_PROJECTS);
}

export const ProjectsWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(loadProjects);
  const [recentlyDoneId, setRecentlyDoneId] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = () => setProjects(loadProjects());
    window.addEventListener('storage_projects_updated', handleStorage);
    return () => window.removeEventListener('storage_projects_updated', handleStorage);
  }, []);

  const completeNextAction = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const targetProject = projects.find((p) => p.id === projectId);
    if (!targetProject) return;

    const nextProgress = Math.min(100, (targetProject.progressPercent || 10) + 25);
    const isCompleted = nextProgress >= 100;
    const newStatus: ProjectItem['status'] = isCompleted ? 'Completado' : 'En progreso';

    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          progressPercent: nextProgress,
          status: newStatus,
          nextActionDoneAt: new Date().toISOString(),
          nextAction: isCompleted ? 'Pieza forjada y finalizada' : p.nextAction,
        };
      }
      return p;
    });

    setProjects(updated);
    saveCustomData('forja_projects_v1', updated);
    window.dispatchEvent(new Event('storage_projects_updated'));

    setRecentlyDoneId(projectId);
    setTimeout(() => setRecentlyDoneId(null), 2500);

    if (isCompleted) {
      soundEngine.playMilestone();
      kaizenBus.emit(KaizenContracts.ForjaProjectCompleted, {
        projectId,
        name: targetProject.title,
      });
    } else {
      soundEngine.playComplete();
      awardKaizenPoints(5, 'projects', `Próxima acción completada: "${targetProject.nextAction || 'Acción en FORJA'}"`);
      kaizenBus.emit(KaizenContracts.ForjaNextActionDone, {
        projectId,
        projectName: targetProject.title,
        taskTitle: targetProject.nextAction || 'Próxima acción',
      });
    }
  };

  const activeProjects = projects.filter((p) => p.status !== 'Completado');

  return (
    <ModuleWidget
      id="projects-next-actions"
      moduleId="projects"
      title="FORJA · Próximas Acciones"
      targetPath="/projects"
      onNavigate={onNavigate}
    >
      <div className="space-y-3 font-mono text-xs">
        {activeProjects.length === 0 ? (
          <p className="text-xs text-kz-ink-dim italic py-2">
            No hay piezas activas con acciones pendientes en el taller.
          </p>
        ) : (
          <div className="space-y-2">
            {activeProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="p-3 border border-kz-line bg-kz-surface-2 rounded-sm space-y-2 hover:border-kz-line-strong transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-kz-ink truncate">
                    {project.title}
                  </span>
                  <KzBadge variant="dim">
                    {project.status}
                  </KzBadge>
                </div>

                <div className="flex items-center justify-between gap-2 bg-kz-surface p-2 border border-kz-line rounded-sm">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <PlayCircle size={14} className="text-kz-accent shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight text-kz-ink truncate">
                      {project.nextAction}
                    </span>
                  </div>

                  <KzButton
                    variant={recentlyDoneId === project.id ? 'primary' : 'craft'}
                    size="sm"
                    onClick={(e) => completeNextAction(e, project.id)}
                    disabled={recentlyDoneId === project.id}
                    icon={<Check size={11} />}
                    title="Completar esta próxima acción ahora (+5 pts Kaizen)"
                  >
                    {recentlyDoneId === project.id ? '¡Forjado!' : 'Hecho'}
                  </KzButton>
                </div>

                <div className="flex items-center justify-between text-[10px] text-kz-ink-dim pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span>Avance:</span>
                    <div className="w-16 h-1.5 bg-kz-line rounded-xs overflow-hidden">
                      <div
                        className="bg-kz-accent h-full transition-all duration-300"
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                    <span className="font-bold text-kz-ink">{project.progressPercent}%</span>
                  </div>
                  {project.dueDate && <span>Plazo: {project.dueDate}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <KzButton
            variant="ghost"
            size="sm"
            onClick={() => {
              soundEngine.playTap();
              onNavigate('/projects');
            }}
          >
            <span>Abrir taller FORJA</span>
            <ArrowRight size={12} />
          </KzButton>
        </div>
      </div>
    </ModuleWidget>
  );
};