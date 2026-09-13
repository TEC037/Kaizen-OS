/**
 * @file src/modules/projects/ProjectsWidget.tsx
 * @description Widget de FORJA para el Dashboard de Kaizen OS.
 * Muestra las próximas acciones inmediatas de las piezas en curso,
 * leyendo la nueva capa de almacenamiento de FORJA (con respaldo del wireframe).
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import { ProjectItem, INITIAL_PROJECTS } from '../../data/demoData';
import { loadCustomData } from '../../core/storage';
import { ArrowRight, PlayCircle } from 'lucide-react';

function loadProjects(): ProjectItem[] {
  const fromForja = loadCustomData<ProjectItem[] | null>('forja_projects_v1', null);
  if (fromForja) return fromForja;
  return loadCustomData<ProjectItem[]>('projects_list', INITIAL_PROJECTS);
}

export const ProjectsWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(loadProjects);

  useEffect(() => {
    const handleStorage = () => setProjects(loadProjects());
    window.addEventListener('storage_projects_updated', handleStorage);
    return () => window.removeEventListener('storage_projects_updated', handleStorage);
  }, []);

  const activeProjects = projects.filter((p) => p.status !== 'Completado');

  return (
    <ModuleWidget
      id="projects-next-actions"
      moduleId="projects"
      title="FORJA · Próximas Acciones"
      targetPath="/projects"
      onNavigate={onNavigate}
    >
      <div className="space-y-3">
        {activeProjects.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-2">
            No hay piezas activas con acciones pendientes.
          </p>
        ) : (
          <div className="space-y-2">
            {activeProjects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="p-2.5 border border-zinc-200 bg-zinc-50/50 space-y-1 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-900 truncate">
                    {project.title}
                  </span>
                  <span className="text-[10px] font-mono border border-zinc-200 px-1.5 py-0.2 bg-white text-zinc-600">
                    {project.status}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-zinc-700 bg-white p-1.5 border border-zinc-200">
                  <PlayCircle size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight font-mono">
                    {project.nextAction}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                  <span>Avance: {project.progressPercent}%</span>
                  <span className="flex items-center gap-1 font-mono">
                    {project.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/projects')}
            className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Abrir taller FORJA</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};