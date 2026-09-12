/**
 * @file src/modules/projects/ProjectsPage.tsx
 * @description Pantalla completa del módulo de Proyectos en Kaizen OS.
 * Lista de proyectos, estados, prioridades, próxima acción Kaizen y estado vacío.
 */

import React, { useState } from 'react';
import { ProjectItem, INITIAL_PROJECTS } from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { awardKaizenPoints } from '../../core/scoring';
import { EmptyState } from '../../components/EmptyState';
import { Plus, Trash2, RotateCcw, PlayCircle, Calendar, CheckCircle2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    loadCustomData<ProjectItem[]>('projects_list', INITIAL_PROJECTS)
  );
  const [showNewModal, setShowNewModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [status, setStatus] = useState<ProjectItem['status']>('En progreso');

  const updateProjects = (items: ProjectItem[]) => {
    setProjects(items);
    saveCustomData('projects_list', items);
    window.dispatchEvent(new Event('storage_projects_updated'));
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !nextAction.trim()) return;

    const newProject: ProjectItem = {
      id: `p-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Sin descripción adicional.',
      status,
      nextAction: nextAction.trim(),
      progressPercent: status === 'Completado' ? 100 : 25,
      priority,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    };

    updateProjects([newProject, ...projects]);
    awardKaizenPoints(15, 'projects', `Nuevo proyecto estructurado: ${newProject.title}`);
    setTitle('');
    setDescription('');
    setNextAction('');
    setShowNewModal(false);
  };

  const handleAdvanceStatus = (id: string) => {
    const statusCycle: Record<ProjectItem['status'], ProjectItem['status']> = {
      'Por iniciar': 'En progreso',
      'En progreso': 'En revisión',
      'En revisión': 'Completado',
      'Completado': 'Por iniciar',
    };

    let targetTitle = '';
    let isCompleted = false;
    let newStatusLabel = '';

    const updated = projects.map((p) => {
      if (p.id !== id) return p;
      targetTitle = p.title;
      const nextStatus = statusCycle[p.status];
      isCompleted = nextStatus === 'Completado';
      newStatusLabel = nextStatus;
      let percent = p.progressPercent;
      if (nextStatus === 'Por iniciar') percent = 10;
      if (nextStatus === 'En progreso') percent = 50;
      if (nextStatus === 'En revisión') percent = 85;
      if (nextStatus === 'Completado') percent = 100;
      return { ...p, status: nextStatus, progressPercent: percent };
    });
    updateProjects(updated);

    if (isCompleted) {
      awardKaizenPoints(50, 'projects', `¡Hito completado! Proyecto concluido: ${targetTitle}`);
    } else {
      awardKaizenPoints(15, 'projects', `Avance de estado (${newStatusLabel}) en: ${targetTitle}`);
    }
  };

  const handleDeleteProject = (id: string) => {
    updateProjects(projects.filter((p) => p.id !== id));
  };

  const clearAllProjects = () => {
    updateProjects([]);
  };

  const restoreInitialProjects = () => {
    updateProjects(INITIAL_PROJECTS);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="border border-zinc-300 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-800">
              MÓDULO: /projects
            </span>
            <span className="font-mono text-xs text-zinc-500">v1.0.0</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mt-1 tracking-tight">
            Proyectos Personales
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Organización orientada a la acción. Cada proyecto requiere una próxima acción concreta definida.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowNewModal(!showNewModal)}
            className="px-3 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Nuevo proyecto</span>
          </button>

          {projects.length > 0 ? (
            <button
              type="button"
              onClick={clearAllProjects}
              className="px-3 py-1.5 text-xs font-mono border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 flex items-center gap-1 cursor-pointer"
              title="Permite probar el estado vacío requerido"
            >
              <Trash2 size={13} />
              Vaciar proyectos (Probar estado vacío)
            </button>
          ) : (
            <button
              type="button"
              onClick={restoreInitialProjects}
              className="px-3 py-1.5 text-xs font-mono border border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              Cargar proyectos de muestra
            </button>
          )}
        </div>
      </div>

      {/* Formulario desplegable para nuevo proyecto */}
      {showNewModal && (
        <form
          onSubmit={handleCreateProject}
          className="border border-zinc-400 bg-zinc-50 p-4 space-y-3"
        >
          <div className="font-mono text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Crear nuevo proyecto
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Título del proyecto *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Automatización de reportes semanales"
                required
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:border-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Próxima acción inmediata *
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="Ej: Redactar script en TypeScript de 20 líneas"
                required
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:border-zinc-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Descripción o propósito
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve resumen del objetivo final..."
              className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:border-zinc-800"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-0.5">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="px-2 py-1 text-xs border border-zinc-300 bg-white text-zinc-800"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-600 mb-0.5">
                Estado inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-2 py-1 text-xs border border-zinc-300 bg-white text-zinc-800"
              >
                <option value="Por iniciar">Por iniciar</option>
                <option value="En progreso">En progreso</option>
                <option value="En revisión">En revisión</option>
                <option value="Completado">Completado</option>
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
              >
                Guardar proyecto
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Si no hay proyectos, mostrar Estado Vacío requerido */}
      {projects.length === 0 ? (
        <EmptyState
          id="projects-empty-state"
          title="No hay proyectos registrados en tu espacio"
          description="Actualmente no tienes proyectos activos ni pendientes. El enfoque Kaizen divide objetivos grandes en proyectos claros con una próxima acción inmediata."
          actionLabel="Cargar proyectos de demostración"
          onAction={restoreInitialProjects}
          variant="neutral"
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="border border-zinc-300 bg-white p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-zinc-200">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                        {proj.title}
                      </h3>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Vence: {proj.dueDate}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(proj.id)}
                      className="text-[11px] font-mono px-2 py-0.5 border border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 cursor-pointer"
                      title="Click para avanzar estado"
                    >
                      {proj.status}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-600 mb-3 line-clamp-2">
                    {proj.description}
                  </p>

                  <div className="bg-zinc-50 border border-zinc-200 p-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-800 text-xs font-medium">
                      <PlayCircle size={13} className="text-zinc-600 shrink-0" />
                      <span>Próxima acción:</span>
                    </div>
                    <p className="text-xs font-mono text-zinc-700 bg-white p-1.5 border border-zinc-200">
                      {proj.nextAction}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-600">
                    <span>Avance: {proj.progressPercent}%</span>
                    <span className="text-[10px] px-1.5 py-0.2 border border-zinc-200 bg-zinc-50">
                      Prioridad: {proj.priority}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 h-1.5 border border-zinc-300">
                    <div
                      className="bg-zinc-800 h-full"
                      style={{ width: `${proj.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-xs text-zinc-400 hover:text-red-700 flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <Trash2 size={12} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
