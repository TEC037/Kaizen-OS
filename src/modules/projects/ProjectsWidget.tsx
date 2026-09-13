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
import { ArrowRight, PlayCircle, Check, Sparkles } from 'lucide-react';

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
          <p className="text-xs text-stone-500 italic py-2">
            No hay piezas activas con acciones pendientes en el taller.
          </p>
        ) : (
          <div className="space-y-2">
            {activeProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="p-3 border border-stone-200 bg-[#faf8f1] rounded-sm space-y-2 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 truncate">
                    {project.title}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded-xs border border-stone-300 bg-white text-stone-700">
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 bg-white p-2 border border-stone-200 rounded-sm">
                  <div className="flex items-start gap-1.5 min-w-0">
                    <PlayCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight text-stone-800 truncate">
                      {project.nextAction}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => completeNextAction(e, project.id)}
                    disabled={recentlyDoneId === project.id}
                    className={`px-2 py-1 rounded-xs text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                      recentlyDoneId === project.id
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                        : 'bg-amber-50 hover:bg-emerald-50 text-amber-950 hover:text-emerald-900 border border-amber-300 hover:border-emerald-300'
                    }`}
                    title="Completar esta próxima acción ahora (+5 pts Kaizen)"
                  >
                    <Check size={11} />
                    <span>{recentlyDoneId === project.id ? '¡Forjado!' : 'Hecho'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span>Avance:</span>
                    <div className="w-16 h-1.5 bg-stone-200 rounded-xs overflow-hidden">
                      <div
                        className="bg-amber-700 h-full transition-all duration-300"
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                    <span className="font-bold text-stone-800">{project.progressPercent}%</span>
                  </div>
                  {project.dueDate && <span>Plazo: {project.dueDate}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/projects')}
            className="text-xs font-mono text-stone-700 hover:text-stone-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Abrir taller FORJA</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};