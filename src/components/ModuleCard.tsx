/**
 * @file src/components/ModuleCard.tsx
 * @description Tarjeta de baja fidelidad (wireframe) para la gestión del ciclo de vida de un módulo.
 * Muestra el manifiesto, permisos, capacidades y acciones contextuales (instalar, suspender, reactivar, desinstalar).
 */

import React from 'react';
import { ModuleManifest, ModuleStatus } from '../core/types';
import { CheckCircle2, PauseCircle, Download, Trash2, ArrowRight, ShieldCheck, Box } from 'lucide-react';

interface ModuleCardProps {
  manifest: ModuleManifest;
  status: ModuleStatus;
  onInstall: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onUninstall: (id: string) => void;
  onNavigateToModule?: (path: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  manifest,
  status,
  onInstall,
  onSuspend,
  onActivate,
  onUninstall,
  onNavigateToModule,
}) => {
  // Estado visual sobrio
  const getStatusBadge = () => {
    switch (status) {
      case 'enabled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-medium border border-emerald-400 bg-emerald-50 text-emerald-800">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full inline-block"></span>
            Habilitado
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-medium border border-zinc-400 bg-zinc-100 text-zinc-700">
            <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full inline-block"></span>
            Suspendido
          </span>
        );
      case 'installed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-medium border border-sky-400 bg-sky-50 text-sky-800">
            <span className="w-1.5 h-1.5 bg-sky-600 rounded-full inline-block"></span>
            Instalado
          </span>
        );
      case 'available':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono font-medium border border-amber-300 bg-amber-50 text-amber-900">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"></span>
            Disponible
          </span>
        );
    }
  };

  const primaryRoute = manifest.routes[0]?.path;

  return (
    <div
      id={`module-card-${manifest.id}`}
      className="border border-zinc-300 bg-white p-5 flex flex-col justify-between hover:border-zinc-400 transition-colors shadow-none"
    >
      <div>
        {/* Cabecera de la tarjeta: Título, categoría y estado */}
        <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-900 tracking-tight">
                {manifest.name}
              </h3>
              <span className="text-[11px] font-mono text-zinc-500 border border-zinc-200 px-1.5 py-0.2 bg-zinc-50">
                id: {manifest.id}
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">
              Categoría: {manifest.category}
            </p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Descripción del módulo */}
        <p className="text-sm text-zinc-700 mb-4 leading-relaxed">
          {manifest.description}
        </p>

        {/* Capacidades que aporta el módulo */}
        <div className="mb-4 bg-zinc-50 border border-zinc-200 p-3 space-y-2 text-xs">
          <div className="font-mono font-semibold text-zinc-700 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Box size={13} className="text-zinc-500" />
            Capacidades aportadas
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600">
            <div>
              <span className="font-semibold text-zinc-800">Rutas ({manifest.routes.length}):</span>
              <ul className="list-disc list-inside mt-0.5 font-mono text-[11px] text-zinc-700">
                {manifest.routes.map((r) => (
                  <li key={r.path}>{r.path}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold text-zinc-800">Widgets ({manifest.widgets.length}):</span>
              <ul className="list-disc list-inside mt-0.5 text-[11px] text-zinc-700">
                {manifest.widgets.map((w) => (
                  <li key={w.id}>{w.title}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Permisos simulados */}
          {manifest.permissions.length > 0 && (
            <div className="pt-2 border-t border-zinc-200 mt-2 flex items-center gap-1.5 flex-wrap">
              <ShieldCheck size={13} className="text-zinc-500 shrink-0" />
              <span className="font-semibold text-zinc-800 text-[11px]">Permisos:</span>
              {manifest.permissions.map((p) => (
                <span
                  key={p}
                  className="font-mono text-[10px] bg-zinc-200/80 px-1 py-0.5 text-zinc-700 border border-zinc-300"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botonera de acciones según el estado del ciclo de vida */}
      <div className="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {status === 'available' && (
            <button
              id={`btn-install-${manifest.id}`}
              type="button"
              onClick={() => onInstall(manifest.id)}
              className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              Instalar módulo
            </button>
          )}

          {status === 'enabled' && (
            <>
              <button
                id={`btn-suspend-${manifest.id}`}
                type="button"
                onClick={() => onSuspend(manifest.id)}
                className="px-3 py-1.5 text-xs font-medium border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Desactiva temporalmente el módulo del menú y dashboard"
              >
                <PauseCircle size={14} className="text-zinc-600" />
                Suspender
              </button>

              <button
                id={`btn-uninstall-${manifest.id}`}
                type="button"
                onClick={() => onUninstall(manifest.id)}
                className="px-3 py-1.5 text-xs font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer flex items-center gap-1.5 transition-colors"
                title="Desinstala el módulo y lo devuelve a disponibles"
              >
                <Trash2 size={14} />
                Desinstalar
              </button>
            </>
          )}

          {status === 'suspended' && (
            <>
              <button
                id={`btn-activate-${manifest.id}`}
                type="button"
                onClick={() => onActivate(manifest.id)}
                className="px-3.5 py-1.5 text-xs font-semibold border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={14} />
                Reactivar / Habilitar
              </button>

              <button
                id={`btn-uninstall-suspended-${manifest.id}`}
                type="button"
                onClick={() => onUninstall(manifest.id)}
                className="px-3 py-1.5 text-xs font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                Desinstalar
              </button>
            </>
          )}

          {status === 'installed' && (
            <>
              <button
                id={`btn-enable-installed-${manifest.id}`}
                type="button"
                onClick={() => onActivate(manifest.id)}
                className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={14} />
                Habilitar módulo
              </button>

              <button
                id={`btn-uninstall-installed-${manifest.id}`}
                type="button"
                onClick={() => onUninstall(manifest.id)}
                className="px-3 py-1.5 text-xs font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                Desinstalar
              </button>
            </>
          )}
        </div>

        {/* Si está habilitado, acceso directo opcional para inspeccionar */}
        {status === 'enabled' && primaryRoute && onNavigateToModule && (
          <button
            type="button"
            onClick={() => onNavigateToModule(primaryRoute)}
            className="text-xs text-zinc-600 hover:text-zinc-900 font-mono flex items-center gap-1 cursor-pointer underline underline-offset-2"
          >
            <span>Ir a {primaryRoute}</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
};
