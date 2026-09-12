/**
 * @file src/app/router.tsx
 * @description Enrutador declarativo y sistema de protección de rutas (Route Guard) para Kaizen OS.
 * Si un usuario intenta acceder a una ruta de un módulo no instalado o suspendido (ej: /gym),
 * se muestra una advertencia visual de acceso no permitido con opción de instalarlo o redirigir a módulos.
 */

import React, { useState, useEffect } from 'react';
import { getManifestByRoutePath } from './moduleRegistry';
import { ModuleStatus } from '../core/types';
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
    // Ruta no reconocida en el registro
    return (
      <div className="border border-zinc-300 bg-white p-8 text-center space-y-3">
        <span className="font-mono text-xs text-zinc-500 border border-zinc-200 px-2 py-0.5 bg-zinc-100">
          ERROR 404: RUTA DESCONOCIDA
        </span>
        <h2 className="text-lg font-bold text-zinc-900">
          La ruta <code className="font-mono text-zinc-800">{currentPath}</code> no está registrada
        </h2>
        <p className="text-xs text-zinc-600 max-w-md mx-auto">
          Ningún módulo en el registro de Kaizen OS declara esta ruta.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const moduleStatus = statusResolver(manifest.id);
  const matchedRoute = manifest.routes.find((r) => r.path === currentPath);

  // 4. Comprobación de acceso / Route Guard según estado del ciclo de vida
  if (moduleStatus === 'enabled' && matchedRoute) {
    const Component = matchedRoute.component;
    return <Component />;
  }

  // Si el módulo está SUSPENDIDO
  if (moduleStatus === 'suspended') {
    return (
      <div
        id="module-suspended-guard"
        className="border-2 border-dashed border-zinc-400 bg-zinc-100/70 p-8 text-center space-y-4 my-4"
      >
        <div className="w-12 h-12 border border-zinc-400 bg-white mx-auto flex items-center justify-center text-zinc-700">
          <ShieldAlert size={24} />
        </div>
        <div>
          <span className="inline-block font-mono text-[11px] px-2 py-0.5 bg-zinc-300 border border-zinc-400 text-zinc-800 uppercase tracking-wider mb-2">
            Acceso Interrumpido: Módulo Suspendido
          </span>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
            El módulo "{manifest.name}" está suspendido temporalmente
          </h2>
          <p className="text-xs text-zinc-600 max-w-md mx-auto mt-1 leading-relaxed">
            Has suspendido este módulo. Para acceder a sus pantallas, rutas ({currentPath})
            y widgets, debes reactivarlo en tu espacio de trabajo.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onActivateModule(manifest.id)}
            className="px-4 py-2 text-xs font-semibold border border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer inline-flex items-center gap-1.5"
          >
            <CheckCircle2 size={14} />
            <span>Reactivar módulo ahora</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/modules')}
            className="px-4 py-2 text-xs font-medium border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Layers size={14} />
            <span>Gestionar módulos</span>
          </button>
        </div>
      </div>
    );
  }

  // Si el módulo está DISPONIBLE (no instalado ni habilitado) -> Advertencia visual exigida por la pág. 4
  return (
    <div
      id="module-not-installed-guard"
      className="border-2 border-dashed border-amber-300 bg-amber-50/70 p-8 text-center space-y-4 my-4"
    >
      <div className="w-12 h-12 border border-amber-400 bg-white mx-auto flex items-center justify-center text-amber-700">
        <ShieldAlert size={24} />
      </div>
      <div>
        <span className="inline-block font-mono text-[11px] px-2 py-0.5 bg-amber-200 border border-amber-400 text-amber-900 uppercase tracking-wider mb-2">
          Advertencia: Módulo no instalado / no habilitado
        </span>
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
          No puedes acceder a la ruta "{currentPath}"
        </h2>
        <p className="text-xs text-zinc-700 max-w-md mx-auto mt-1 leading-relaxed">
          El módulo <strong>"{manifest.name}"</strong> no está instalado en tu espacio personal de Kaizen OS.
          Solo los módulos instalados y habilitados tienen rutas activas y widgets disponibles.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            onInstallModule(manifest.id);
          }}
          className="px-4 py-2 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer inline-flex items-center gap-1.5"
        >
          <Download size={14} />
          <span>Instalar "{manifest.name}" ahora</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/modules')}
          className="px-4 py-2 text-xs font-medium border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 cursor-pointer inline-flex items-center gap-1.5"
        >
          <Layers size={14} />
          <span>Ir a Configuración de módulos</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="px-4 py-2 text-xs font-mono text-zinc-600 hover:text-zinc-900 cursor-pointer underline underline-offset-2"
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
};
