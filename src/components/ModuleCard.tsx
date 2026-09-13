/**
 * @file src/components/ModuleCard.tsx
 * @description Tarjeta de gestión del ciclo de vida de un módulo en Kaizen OS.
 * Integra componentes atómicos KzCard, KzButton, KzBadge y feedback auditivo táctil.
 */

import React from 'react';
import { ModuleManifest, ModuleStatus } from '../core/types';
import { soundEngine } from '../core/sound';
import { KzCard } from './ui/KzCard';
import { KzButton } from './ui/KzButton';
import { KzBadge } from './ui/KzBadge';
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
  const getStatusBadge = () => {
    switch (status) {
      case 'enabled':
        return <KzBadge variant="success">Habilitado</KzBadge>;
      case 'suspended':
        return <KzBadge variant="dim">Suspendido</KzBadge>;
      case 'installed':
        return <KzBadge variant="info">Instalado</KzBadge>;
      case 'available':
      default:
        return <KzBadge variant="accent">Disponible</KzBadge>;
    }
  };

  const primaryRoute = manifest.routes[0]?.path;

  const handleAction = (action: () => void) => {
    soundEngine.playTap();
    action();
  };

  return (
    <KzCard
      id={`module-card-${manifest.id}`}
      variant="surface"
      className="p-5 flex flex-col justify-between border-stone-300 font-mono text-xs"
    >
      <div>
        {/* Cabecera de la tarjeta: Título, categoría y estado */}
        <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight font-mono">
                {manifest.name}
              </h3>
              <span className="text-[10px] text-stone-500 border border-stone-200 px-1.5 py-0.2 bg-[#faf8f1] rounded-xs">
                {manifest.id}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Categoría: {manifest.category}
            </p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Descripción del módulo */}
        <p className="text-xs text-stone-700 mb-4 leading-relaxed font-sans">
          {manifest.description}
        </p>

        {/* Capacidades que aporta el módulo */}
        <div className="mb-4 bg-[#faf8f1] border border-stone-200 p-3 space-y-2 rounded-sm text-xs">
          <div className="font-semibold text-stone-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Box size={13} className="text-stone-500" />
            <span>Capacidades aportadas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
            <div>
              <span className="font-bold text-stone-800 text-[11px]">Rutas ({manifest.routes.length}):</span>
              <ul className="list-disc list-inside mt-0.5 text-[10px] text-stone-600">
                {manifest.routes.map((r) => (
                  <li key={r.path}>{r.path}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-stone-800 text-[11px]">Widgets ({manifest.widgets.length}):</span>
              <ul className="list-disc list-inside mt-0.5 text-[10px] text-stone-600">
                {manifest.widgets.map((w) => (
                  <li key={w.id}>{w.title}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Permisos simulados */}
          {manifest.permissions.length > 0 && (
            <div className="pt-2 border-t border-stone-200/70 mt-2 flex items-center gap-1.5 flex-wrap">
              <ShieldCheck size={13} className="text-stone-500 shrink-0" />
              <span className="font-bold text-stone-800 text-[10px]">Permisos:</span>
              {manifest.permissions.map((p) => (
                <span
                  key={p}
                  className="text-[9px] bg-white px-1 py-0.2 text-stone-600 border border-stone-300 rounded-xs"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botonera de acciones según el estado del ciclo de vida */}
      <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {status === 'available' && (
            <KzButton
              variant="primary"
              size="sm"
              onClick={() => handleAction(() => onInstall(manifest.id))}
              icon={<Download size={13} />}
            >
              Instalar módulo
            </KzButton>
          )}

          {status === 'enabled' && (
            <>
              <KzButton
                variant="craft"
                size="sm"
                onClick={() => handleAction(() => onSuspend(manifest.id))}
                icon={<PauseCircle size={13} />}
                title="Desactiva temporalmente el módulo del menú y dashboard"
              >
                Suspender
              </KzButton>

              <KzButton
                variant="destructive"
                size="sm"
                onClick={() => handleAction(() => onUninstall(manifest.id))}
                icon={<Trash2 size={13} />}
                title="Desinstala el módulo y lo devuelve al catálogo"
              >
                Desinstalar
              </KzButton>
            </>
          )}

          {status === 'suspended' && (
            <>
              <KzButton
                variant="primary"
                size="sm"
                onClick={() => handleAction(() => onActivate(manifest.id))}
                icon={<CheckCircle2 size={13} />}
              >
                Reactivar módulo
              </KzButton>

              <KzButton
                variant="destructive"
                size="sm"
                onClick={() => handleAction(() => onUninstall(manifest.id))}
                icon={<Trash2 size={13} />}
              >
                Desinstalar
              </KzButton>
            </>
          )}

          {status === 'installed' && (
            <>
              <KzButton
                variant="primary"
                size="sm"
                onClick={() => handleAction(() => onActivate(manifest.id))}
                icon={<CheckCircle2 size={13} />}
              >
                Habilitar módulo
              </KzButton>

              <KzButton
                variant="destructive"
                size="sm"
                onClick={() => handleAction(() => onUninstall(manifest.id))}
                icon={<Trash2 size={13} />}
              >
                Desinstalar
              </KzButton>
            </>
          )}
        </div>

        {/* Si está habilitado, acceso directo opcional */}
        {status === 'enabled' && primaryRoute && onNavigateToModule && (
          <button
            type="button"
            onClick={() => onNavigateToModule(primaryRoute)}
            className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer underline underline-offset-2"
          >
            <span>Ir a {primaryRoute}</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
    </KzCard>
  );
};
