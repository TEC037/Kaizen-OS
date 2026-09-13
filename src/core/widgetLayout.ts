/**
 * @file src/core/widgetLayout.ts
 * @description Layout configurable del dashboard de Kaizen OS.
 * El usuario decide qué widgets ve, en qué orden y con qué tamaño (gridSpan).
 * Se persiste en `kaizen:system:dashboard-layout` vía el SDK de storage.
 * Los widgets nuevos habilitados se añaden al final con sus valores por defecto.
 */

import React from 'react';
import { createModuleStorage } from '../sdk/storage';

export type WidgetSpan = 'full' | 'half' | 'third';

export interface WidgetPlacement {
  widgetId: string;
  gridSpan: WidgetSpan;
  visible: boolean;
}

export interface WidgetLayout {
  placements: WidgetPlacement[];
}

export interface WidgetLike {
  id: string;
  gridSpan?: WidgetSpan;
}

/** Display en grid del dashboard según el span. */
export const SPAN_CLASSES: Record<WidgetSpan, string> = {
  full: 'md:col-span-2',
  half: 'md:col-span-1',
  third: 'md:col-span-1',
};

/** Storage namespaced del shell (scope 'system'). */
const layoutStorage = createModuleStorage<WidgetLayout>({
  scope: 'system',
  version: 2,
  defaults: { placements: [] },
  storageKey: 'kaizen:system:dashboard-layout',
  eventName: 'system:dashboard-layout-changed',
});

function validSpan(span: string | undefined): WidgetSpan | undefined {
  return span === 'full' || span === 'half' || span === 'third' ? span : undefined;
}

function toPlacement(widget: WidgetLike): WidgetPlacement {
  return {
    widgetId: widget.id,
    gridSpan: widget.gridSpan ?? 'half',
    visible: true,
  };
}

/**
 * Concilia el layout persistido con los widgets actualmente habilitados:
 * - Conserva visible/span/orden de los widgets conocidos.
 * - Descartan placements huérfanos.
 * - Añade al final los widgets nuevos.
 */
export function reconcileWidgetLayout(widgets: WidgetLike[]): WidgetLayout {
  const stored = layoutStorage.load();
  const byId = new Map(stored.placements.map((p) => [p.widgetId, p]));

  return {
    placements: widgets.map((widget) => {
      const prev = byId.get(widget.id);
      if (!prev) return toPlacement(widget);
      return {
        widgetId: widget.id,
        gridSpan: validSpan(prev.gridSpan) ?? toPlacement(widget).gridSpan,
        visible: prev.visible,
      };
    }),
  };
}

export function saveWidgetLayout(layout: WidgetLayout): void {
  layoutStorage.save(layout);
}

export function resetWidgetLayout(): void {
  layoutStorage.reset();
}

/** Hook que carga y reacciona al layout persistido. */
export function useWidgetLayout(widgets: WidgetLike[]): {
  layout: WidgetLayout;
  setPlacement: (widgetId: string, patch: Partial<Omit<WidgetPlacement, 'widgetId'>>) => void;
  movePlacement: (widgetId: string, direction: -1 | 1) => void;
} {
  const [layout, setLayout] = React.useState<WidgetLayout>(() => reconcileWidgetLayout(widgets));

  React.useEffect(() => {
    const refresh = () => setLayout(reconcileWidgetLayout(widgets));
    const unsubscribe = layoutStorage.subscribe(refresh);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: WidgetLayout) => {
    setLayout(next);
    saveWidgetLayout(next);
  };

  const setPlacement = (widgetId: string, patch: Partial<Omit<WidgetPlacement, 'widgetId'>>) => {
    persist({
      placements: layout.placements.map((p) => (p.widgetId === widgetId ? { ...p, ...patch } : p)),
    });
  };

  const movePlacement = (widgetId: string, direction: -1 | 1) => {
    const idx = layout.placements.findIndex((p) => p.widgetId === widgetId);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= layout.placements.length) return;
    const placements = [...layout.placements];
    const [item] = placements.splice(idx, 1);
    placements.splice(target, 0, item);
    persist({ placements });
  };

  return { layout, setPlacement, movePlacement };
}