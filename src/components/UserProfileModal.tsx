/**
 * @file src/components/UserProfileModal.tsx
 * @description Modal global para personalizar el nombre de usuario de Kaizen OS.
 * Aplica el cambio a nivel de sistema para que todos los módulos consuman
 * la misma identidad de forma reactiva e inmediata.
 */

import React, { useState, useEffect } from 'react';
import { User, Sparkles, Check, X, Shield, Dumbbell, Flame } from 'lucide-react';
import { KzButton, KzCard, KzBadge } from './ui';
import { useGlobalUserName } from '../core/profile';
import { soundEngine } from '../core/sound';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [globalName, setGlobalName] = useGlobalUserName();
  const [tempName, setTempName] = useState(globalName);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempName(globalName);
      setHasSaved(false);
    }
  }, [isOpen, globalName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playTap();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempName.trim() || 'Alex';
    setGlobalName(trimmed);
    soundEngine.playMilestone();
    setHasSaved(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#fffdf8] border-2 border-stone-800 rounded-2xl shadow-[4px_4px_0_#211d19] p-6 space-y-5 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-stone-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-amber-900/40 text-amber-950 flex items-center justify-center font-mono font-bold text-lg shadow-[2px_2px_0_#78350f]">
              {tempName.trim().charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <h2 id="user-profile-title" className="text-lg font-bold font-mono text-stone-900">
                Perfil de Usuario Global
              </h2>
              <p className="text-xs font-mono text-stone-500">
                Identidad centralizada para todo Kaizen OS
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playTap();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info card */}
        <div className="p-3 bg-stone-100/80 border border-stone-300/80 rounded-xl text-xs font-mono text-stone-700 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <Sparkles size={14} className="text-amber-600" />
            <span>Sincronización Unificada</span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-600">
            Tu nombre se propaga automáticamente a <strong>todos los módulos activos</strong> (Hábitos, Gimnasio, Sensei AI, Proyectos, Finanzas). No requieres configurarlo módulo por módulo.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="input-global-username" className="block text-xs font-mono font-bold text-stone-800">
              Nombre o Alias
            </label>
            <div className="relative">
              <input
                id="input-global-username"
                type="text"
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={30}
                placeholder="Ej: Alex, Sensei, Artesano..."
                className="w-full px-3.5 py-2.5 bg-white border-2 border-stone-800 rounded-xl font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-stone-900 shadow-[2px_2px_0_rgba(0,0,0,0.06)]"
              />
              <span className="absolute right-3 top-3 text-[10px] font-mono text-stone-400">
                {tempName.length}/30
              </span>
            </div>
          </div>

          {/* Módulos que consumen esta identidad */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
              Módulos vinculados a esta identidad:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <KzBadge variant="default">
                <Flame size={10} className="text-amber-600" />
                <span>Hábitos</span>
              </KzBadge>
              <KzBadge variant="default">
                <Dumbbell size={10} className="text-emerald-700" />
                <span>Gimnasio</span>
              </KzBadge>
              <KzBadge variant="default">
                <Sparkles size={10} className="text-indigo-600" />
                <span>Sensei AI</span>
              </KzBadge>
              <KzBadge variant="default">
                <Shield size={10} className="text-sky-700" />
                <span>Dashboard</span>
              </KzBadge>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-stone-200/80">
            <KzButton
              type="button"
              variant="craft"
              size="md"
              onClick={() => {
                soundEngine.playTap();
                onClose();
              }}
            >
              Cancelar
            </KzButton>
            <KzButton
              type="submit"
              variant="primary"
              size="md"
              disabled={!tempName.trim()}
              icon={hasSaved ? <Check size={14} /> : undefined}
            >
              {hasSaved ? '¡Guardado!' : 'Guardar Globalmente'}
            </KzButton>
          </div>
        </form>
      </div>
    </div>
  );
};
