/**
 * @file src/app/views/ModulesManagerView.tsx
 * @description Vista del Catálogo y Gestión Central de Módulos de Kaizen OS.
 */

import React, { useState, useMemo } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import { ModuleManifest, ModuleStatus } from '../../core/types';
import { ModuleCard } from '../../components/ModuleCard';
import { EmptyState } from '../../components/EmptyState';
import { ModuleSettings } from '../../components/ModuleSettings';
import { KzCard } from '../../components/ui/KzCard';
import { KzButton } from '../../components/ui/KzButton';
import { KzBadge } from '../../components/ui/KzBadge';
import { soundEngine } from '../../core/sound';

interface ModulesManagerViewProps {
  allManifests: ModuleManifest[];
  installedManifests: ModuleManifest[];
  availableManifests: ModuleManifest[];
  enabledManifests: ModuleManifest[];
  getStatus: (id: string) => ModuleStatus;
  installModule: (id: string) => void;
  suspendModule: (id: string) => void;
  activateModule: (id: string) => void;
  uninstallModule: (id: string) => void;
  onFullReset: () => void;
  onNavigate: (path: string) => void;
}

export const ModulesManagerView: React.FC<ModulesManagerViewProps> = ({
  allManifests,
  installedManifests,
  availableManifests,
  enabledManifests,
  getStatus,
  installModule,
  suspendModule,
  activateModule,
  uninstallModule,
  onFullReset,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    allManifests.forEach((m) => {
      if (m.category) cats.add(m.category);
    });
    return Array.from(cats);
  }, [allManifests]);

  const filterManifest = (m: ModuleManifest) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

    return matchesQuery && matchesCategory;
  };

  const filteredInstalled = installedManifests.filter(filterManifest);
  const filteredAvailable = availableManifests.filter(filterManifest);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Encabezado */}
      <KzCard variant="surface" className="border-stone-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KzBadge variant="default">CONFIGURACIÓN CENTRAL</KzBadge>
            <span className="font-mono text-xs text-stone-500">
              {allManifests.length} módulos en catálogo
            </span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mt-1 tracking-tight font-mono">
            Mis Módulos y Catálogo
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Personaliza tu espacio instalando solo lo que necesitas. Los módulos desinstalados o suspendidos no ocupan espacio en el menú ni en el dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <KzButton
            variant="craft"
            size="sm"
            onClick={() => {
              soundEngine.playTap();
              onFullReset();
            }}
            icon={<RotateCcw size={13} />}
            title="Restablece la configuración inicial: Hábitos y Proyectos habilitados, otros disponibles"
          >
            Restablecer módulos
          </KzButton>
        </div>
      </KzCard>

      {/* Barra de Búsqueda Rápida y Filtro por Categorías */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar módulo por nombre o categoría..."
            className="w-full pl-8 pr-7 py-1.5 border border-stone-300 bg-white text-stone-900 rounded-sm outline-none focus:border-stone-500 placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                soundEngine.playTap();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Chips de Categorías */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              soundEngine.playTap();
            }}
            className={`px-2 py-1 rounded-xs border text-[11px] cursor-pointer transition-colors ${
              selectedCategory === 'all'
                ? 'bg-stone-900 border-stone-900 text-stone-100 font-bold'
                : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
            }`}
          >
            Todos ({allManifests.length})
          </button>
          {allCategories.map((cat) => {
            const count = allManifests.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  soundEngine.playTap();
                }}
                className={`px-2 py-1 rounded-xs border text-[11px] cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-900 border-stone-900 text-stone-100 font-bold'
                    : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grupo 1: Módulos Instalados (Habilitados y Suspendidos) */}
      <div className="space-y-3">
        <div className="border-b border-stone-300 pb-2 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight uppercase">
              Módulos Instalados ({filteredInstalled.length})
            </h2>
            <span className="text-xs text-stone-500">
              ({enabledManifests.length} habilitados, {installedManifests.length - enabledManifests.length} suspendidos)
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            Forman parte de tu espacio
          </span>
        </div>

        {installedManifests.length === 0 ? (
          <EmptyState
            id="no-installed-modules-state"
            title="No tienes ningún módulo instalado"
            description="Tu espacio de trabajo está completamente vacío. Explora los módulos disponibles abajo para comenzar a armar tu sistema personal."
            actionLabel="Restablecer configuración por defecto"
            onAction={onFullReset}
            variant="neutral"
          />
        ) : filteredInstalled.length === 0 ? (
          <div className="border border-dashed border-stone-300 bg-[#faf8f1] p-6 text-center text-xs text-stone-600 font-mono rounded-sm">
            No se encontraron módulos instalados que coincidan con &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInstalled.map((manifest) => (
              <ModuleCard
                key={manifest.id}
                manifest={manifest}
                status={getStatus(manifest.id)}
                onInstall={installModule}
                onSuspend={suspendModule}
                onActivate={activateModule}
                onUninstall={uninstallModule}
                onNavigateToModule={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grupo 1.5: Ajustes declarativos por módulo */}
      <div className="space-y-3 pt-4">
        <div className="border-b border-stone-300 pb-2 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight uppercase">
              Ajustes por Módulo ({enabledManifests.filter((m) => (m.spec?.settings ?? []).length > 0).length})
            </h2>
            <span className="text-xs text-stone-500">
              Generados desde el spec declarativo de cada módulo
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            Persisten en tu navegador
          </span>
        </div>

        {enabledManifests.filter((m) => (m.spec?.settings ?? []).length > 0).length === 0 ? (
          <div className="border border-dashed border-stone-300 bg-[#faf8f1] p-6 text-center text-xs text-stone-600 font-mono rounded-sm">
            Ningún módulo habilitado declara ajustes. Declara <span className="font-bold">spec.settings</span> en el manifiesto para habilitar este panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enabledManifests
              .filter((m) => (m.spec?.settings ?? []).length > 0)
              .map((manifest) => (
                <div key={manifest.id} className="border border-stone-300 bg-white p-4 rounded-sm">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-800">
                      {manifest.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{manifest.id}</span>
                  </div>
                  <ModuleSettings
                    moduleId={manifest.id}
                    moduleName={manifest.name}
                    settings={manifest.spec?.settings ?? []}
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Grupo 2: Módulos Disponibles para Instalar */}
      <div className="space-y-3 pt-4">
        <div className="border-b border-stone-300 pb-2 flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight uppercase">
              Módulos Disponibles ({filteredAvailable.length})
            </h2>
            <span className="text-xs text-stone-500">
              Listos para ser instalados en un click
            </span>
          </div>
          <span className="text-[11px] text-stone-500">
            Catálogo de extensión
          </span>
        </div>

        {availableManifests.length === 0 ? (
          <div className="border border-dashed border-stone-300 bg-[#faf8f1] p-6 text-center text-xs text-stone-600 font-mono rounded-sm">
            Todos los módulos del catálogo ya están instalados en tu sistema.
          </div>
        ) : filteredAvailable.length === 0 ? (
          <div className="border border-dashed border-stone-300 bg-[#faf8f1] p-6 text-center text-xs text-stone-600 font-mono rounded-sm">
            No se encontraron módulos disponibles que coincidan con &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAvailable.map((manifest) => (
              <ModuleCard
                key={manifest.id}
                manifest={manifest}
                status={getStatus(manifest.id)}
                onInstall={installModule}
                onSuspend={suspendModule}
                onActivate={activateModule}
                onUninstall={uninstallModule}
                onNavigateToModule={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
