/**
 * @file src/components/ModuleSettings.tsx
 * @description Panel de ajustes declarativos de un módulo (Fase 6).
 * Genera los campos a partir de `spec.settings` (ModuleSettingDef): number,
 * boolean, text y select. Los valores de usuario viven en el store del core.
 */

import React from 'react';
import type { ModuleSettingDef } from '../sdk/schema';
import { useModuleSettings } from '../core/moduleSettings';

interface ModuleSettingsProps {
  moduleId: string;
  moduleName: string;
  settings: ModuleSettingDef[];
}

export const ModuleSettings: React.FC<ModuleSettingsProps> = ({
  moduleId,
  moduleName,
  settings,
}) => {
  const { values, setValue, reset } = useModuleSettings(moduleId);

  if (settings.length === 0) {
    return (
      <p className="text-[11px] font-mono text-zinc-500 italic">
        Este módulo no declara ajustes personalizables.
      </p>
    );
  }

  const current = (def: ModuleSettingDef): unknown => values[def.id] ?? def.default;
  const fieldId = (def: ModuleSettingDef) => `${moduleId}-setting-${def.id}`;

  return (
    <div className="space-y-3">
      {settings.map((def) => (
        <div key={def.id} className="flex items-center justify-between gap-3 text-xs">
          <div>
            <label htmlFor={fieldId(def)} className="font-semibold text-zinc-800">
              {def.label}
            </label>
            {def.help && (
              <p className="text-[10px] font-mono text-zinc-500">{def.help}</p>
            )}
          </div>

          {def.type === 'boolean' && (
            <input
              id={fieldId(def)}
              type="checkbox"
              checked={Boolean(current(def))}
              onChange={(e) => setValue(def.id, e.target.checked)}
              className="accent-zinc-900 cursor-pointer"
            />
          )}

          {def.type === 'number' && (
            <input
              id={fieldId(def)}
              type="number"
              value={Number(current(def))}
              onChange={(e) => setValue(def.id, Number(e.target.value))}
              className="w-24 px-1.5 py-1 border border-zinc-300 bg-white text-xs font-mono text-zinc-800"
            />
          )}

          {def.type === 'text' && (
            <input
              id={fieldId(def)}
              type="text"
              value={String(current(def))}
              onChange={(e) => setValue(def.id, e.target.value)}
              className="w-44 px-1.5 py-1 border border-zinc-300 bg-white text-xs font-mono text-zinc-800"
            />
          )}

          {def.type === 'select' && (
            <select
              id={fieldId(def)}
              value={String(current(def))}
              onChange={(e) => setValue(def.id, e.target.value)}
              className="px-1.5 py-1 border border-zinc-300 bg-white text-xs font-mono text-zinc-800"
            >
              {(def.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <div className="pt-1.5 border-t border-dashed border-zinc-200">
        <button
          type="button"
          onClick={reset}
          className="text-[10px] font-mono text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
        >
          Restablecer ajustes de {moduleName} a los valores por defecto
        </button>
      </div>
    </div>
  );
};