/**
 * @file src/app/router.tsx
 * @description Enrutador declarativo y sistema de protección de rutas (Route Guard) para Kaizen OS.
 * Aplica componentes atómicos KzCard, KzButton, KzBadge y feedback auditivo.
 */

import React, { Suspense } from 'react';
import { getManifestByRoutePath } from './moduleRegistry';
import { ModuleStatus } from '../core/types';
import { soundEngine } from '../core/sound';
import { KzCard } from '../components/ui/KzCard';
import { KzButton } from '../components/ui/KzButton';
import { KzBadge } from '../components/ui/KzBadge';
import { ShieldAlert, Download, CheckCircle2, ArrowLeft, Layers } from 'lucide-react';

interface RouterProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  statusResolver: (id: string) => ModuleStatus;
  onInstallModule: (id: string) => void;
  onActivateModule: (id: string) => void;
  dashboardComponent: React.ReactNode;
  modulesManagerComponent: React.ReactNode;
}

export const AppRouter: React.FC<RouterProps> = ({
  currentPath,
  onNavigate,
  statusResolver,
  onInstallModule,
  onActivateModule,
  dashboardComponent,
  modulesManagerComponent,
}) => {
  // 1. Ruta raíz -> Dashboard Principal
  if (currentPath === '/' || currentPath === '') {
    return <>{dashboardComponent}</>;
  }

  // 2. Ruta de configuración de módulos -> Pantalla de Módulos
  if (currentPath === '/modules') {
    return <>{modulesManagerComponent}</>;
  }

  // 3. Resolución dinámica de rutas de módulos
  const manifest = getManifestByRoutePath(currentPath);

  if (!manifest) {
    // Ruta no reconocida en el registro (404)
    return (
      <KzCard variant="surface" className="p-8 text-center space-y-3 font-mono border-stone-300">
        <KzBadge variant="default">ERROR 404: RUTA DESCONOCIDA</KzBadge>
        <h2 className="text-base sm:text-lg font-bold text-stone-900">
          La ruta <code className="bg-[#faf8f1] px-1.5 py-0.5 border border-stone-200 rounded-xs">{currentPath}</code> no está registrada
        </h2>
        <p className="text-xs text-stone-600 max-w-md mx-auto font-sans">
          Ningún módulo activo en el registro de Kaizen OS declara esta ruta.
        </p>
        <div className="pt-2">
          <KzButton
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/')}
            icon={<ArrowLeft size={13} />}
          >
            Volver al Dashboard
          </KzButton>
        </div>
      </KzCard>
    );
  }

  const moduleStatus = statusResolver(manifest.id);
  const matchedRoute = manifest.routes.find((r) => r.path === currentPath);

  // 4. Comprobación de acceso / Route Guard según estado del ciclo de vida
  if (moduleStatus === 'enabled' && matchedRoute) {
    const Component = matchedRoute.component;
    return (
      <Suspense
        fallback={
          <div className="border border-stone-300 bg-white p-8 text-center text-xs font-mono text-stone-500 animate-pulse rounded-sm">
            Cargando {manifest.name}…
          </div>
        }
      >
        <Component />
      </Suspense>
    );
  }

  // Si el módulo está SUSPENDIDO
  if (moduleStatus === 'suspended') {
    return (
      <KzCard
        id="module-suspended-guard"
        variant="dashed"
        className="p-8 text-center space-y-4 my-4 font-mono"
      >
        <div className="w-12 h-12 border border-stone-300 bg-white mx-auto flex items-center justify-center text-stone-700 rounded-sm">
          <ShieldAlert size={22} />
        </div>
        <div>
          <KzBadge variant="warning" className="mb-2">
            MÓDULO SUSPENDIDO
          </KzBadge>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            El módulo &ldquo;{manifest.name}&rdquo; está suspendido temporalmente
          </h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto mt-1.5 leading-relaxed font-sans">
            Has suspendido este módulo. Para acceder a sus pantallas, rutas ({currentPath})
            y widgets, debes reactivarlo en tu espacio de trabajo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <KzButton
            variant="primary"
            size="sm"
            onClick={() => {
              soundEngine.playComplete();
              onActivateModule(manifest.id);
            }}
            icon={<CheckCircle2 size={13} />}
          >
            Reactivar módulo ahora
          </KzButton>

          <KzButton
            variant="craft"
            size="sm"
            onClick={() => onNavigate('/modules')}
            icon={<Layers size={13} />}
          >
            Gestionar módulos
          </KzButton>
        </div>
      </KzCard>
    );
  }

  // Si el módulo está DISPONIBLE (no instalado ni habilitado) -> Route Guard
  return (
    <KzCard
      id="module-not-installed-guard"
      variant="dashed"
      className="p-8 text-center space-y-4 my-4 font-mono border-amber-300 bg-amber-50/40"
    >
      <div className="w-12 h-12 border border-amber-300 bg-white mx-auto flex items-center justify-center text-amber-800 rounded-sm shadow-xs">
        <ShieldAlert size={22} />
      </div>
      <div>
        <KzBadge variant="accent" className="mb-2">
          MÓDULO NO INSTALADO
        </KzBadge>
        <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
          No puedes acceder a la ruta &ldquo;{currentPath}&rdquo;
        </h2>
        <p className="text-xs text-stone-700 max-w-md mx-auto mt-1.5 leading-relaxed font-sans">
          El módulo <strong>&ldquo;{manifest.name}&rdquo;</strong> no está instalado en tu espacio de Kaizen OS.
          Solo los módulos instalados y habilitados tienen rutas activas y widgets disponibles.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <KzButton
          variant="primary"
          size="sm"
          onClick={() => {
            soundEngine.playComplete();
            onInstallModule(manifest.id);
          }}
          icon={<Download size={13} />}
        >
          Instalar &ldquo;{manifest.name}&rdquo; ahora
        </KzButton>

        <KzButton
          variant="craft"
          size="sm"
          onClick={() => onNavigate('/modules')}
          icon={<Layers size={13} />}
        >
          Configuración de módulos
        </KzButton>

        <KzButton
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('/')}
        >
          Volver al Dashboard
        </KzButton>
      </div>
    </KzCard>
  );
};
