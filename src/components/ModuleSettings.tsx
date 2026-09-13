/**
 * @file src/components/ModuleSettings.tsx
 * @description Panel de ajustes declarativos de un módulo en Kaizen OS.
 * Genera los campos a partir de `spec.settings` con paleta artesanal Wabi-Sabi y feedback auditivo.
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { ModuleSettingDef } from '../sdk/schema';
import { useModuleSettings } from '../core/moduleSettings';
import { soundEngine } from '../core/sound';

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
      <p className="text-[11px] font-mono text-stone-500 italic">
        Este módulo no declara ajustes personalizables.
      </p>
    );
  }

  const current = (def: ModuleSettingDef): unknown => values[def.id] ?? def.default;
  const fieldId = (def: ModuleSettingDef) => `${moduleId}-setting-${def.id}`;

  const handleChange = (id: string, val: unknown) => {
    soundEngine.playTap();
    setValue(id, val);
  };

  const handleReset = () => {
    soundEngine.playTap();
    reset();
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      {settings.map((def) => (
        <div key={def.id} className="flex items-center justify-between gap-3">
          <div>
            <label htmlFor={fieldId(def)} className="font-bold text-stone-800">
              {def.label}
            </label>
            {def.help && (
              <p className="text-[10px] text-stone-500 font-sans">{def.help}</p>
            )}
          </div>

          {def.type === 'boolean' && (
            <input
              id={fieldId(def)}
              type="checkbox"
              checked={Boolean(current(def))}
              onChange={(e) => handleChange(def.id, e.target.checked)}
              className="accent-stone-900 cursor-pointer w-4 h-4 rounded-xs"
            />
          )}

          {def.type === 'number' && (
            <input
              id={fieldId(def)}
              type="number"
              value={Number(current(def))}
              onChange={(e) => handleChange(def.id, Number(e.target.value))}
              className="w-24 px-2 py-1 border border-stone-300 bg-white text-xs font-mono text-stone-900 rounded-sm"
            />
          )}

          {def.type === 'text' && (
            <input
              id={fieldId(def)}
              type="text"
              value={String(current(def))}
              onChange={(e) => handleChange(def.id, e.target.value)}
              className="w-44 px-2 py-1 border border-stone-300 bg-white text-xs font-mono text-stone-900 rounded-sm"
            />
          )}

          {def.type === 'select' && (
            <select
              id={fieldId(def)}
              value={String(current(def))}
              onChange={(e) => handleChange(def.id, e.target.value)}
              className="px-2 py-1 border border-stone-300 bg-white text-xs font-mono text-stone-900 rounded-sm"
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

      <div className="pt-2 border-t border-dashed border-stone-200">
        <button
          type="button"
          onClick={handleReset}
          className="text-[10px] text-stone-500 hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
          title={`Restablecer ajustes de ${moduleName} a sus valores por defecto`}
        >
          <RotateCcw size={10} />
          <span>Restablecer ajustes de {moduleName} por defecto</span>
        </button>
      </div>
    </div>
  );
};