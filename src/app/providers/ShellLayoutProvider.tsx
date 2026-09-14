/**
 * @file src/app/providers/ShellLayoutProvider.tsx
 * @description Contexto y estado de presentación para el Shell de Kaizen OS:
 * Modos de contexto (Mañana, Foco Profundo, Cierre Nocturno), Modo Zen, Modales y Sonido.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSound } from '../../core/sound';

export type DashboardContextMode = 'all' | 'morning' | 'deepwork' | 'evening';

interface ShellLayoutContextValue {
  zenMode: boolean;
  setZenMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleZenMode: () => void;

  contextMode: DashboardContextMode;
  setContextMode: (mode: DashboardContextMode) => void;

  showCommandBar: boolean;
  setShowCommandBar: (val: boolean) => void;

  showScoreModal: boolean;
  setShowScoreModal: (val: boolean) => void;

  showArchInspector: boolean;
  setShowArchInspector: (val: boolean) => void;

  showShortcutsModal: boolean;
  setShowShortcutsModal: (val: boolean) => void;

  showProfileModal: boolean;
  setShowProfileModal: (val: boolean) => void;

  showDashboardCustomize: boolean;
  setShowDashboardCustomize: (val: boolean | ((prev: boolean) => boolean)) => void;

  soundEnabled: boolean;
  toggleSound: () => void;
  playTap: () => void;
  playComplete: () => void;
  playMilestone: () => void;

  closeAllModals: () => void;
}

const ShellLayoutContext = createContext<ShellLayoutContextValue | null>(null);

export const ShellLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [contextMode, setContextMode] = useState<DashboardContextMode>('all');
  const [showCommandBar, setShowCommandBar] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showArchInspector, setShowArchInspector] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showDashboardCustomize, setShowDashboardCustomize] = useState<boolean>(false);

  const { soundEnabled, toggleSound, playTap, playComplete, playMilestone } = useSound();

  const toggleZenMode = () => setZenMode((prev) => !prev);

  const closeAllModals = () => {
    setShowCommandBar(false);
    setShowScoreModal(false);
    setShowArchInspector(false);
    setShowShortcutsModal(false);
    setShowProfileModal(false);
  };

  return (
    <ShellLayoutContext.Provider
      value={{
        zenMode,
        setZenMode,
        toggleZenMode,
        contextMode,
        setContextMode,
        showCommandBar,
        setShowCommandBar,
        showScoreModal,
        setShowScoreModal,
        showArchInspector,
        setShowArchInspector,
        showShortcutsModal,
        setShowShortcutsModal,
        showProfileModal,
        setShowProfileModal,
        showDashboardCustomize,
        setShowDashboardCustomize,
        soundEnabled,
        toggleSound,
        playTap,
        playComplete,
        playMilestone,
        closeAllModals,
      }}
    >
      {children}
    </ShellLayoutContext.Provider>
  );
};

export function useShellLayout(): ShellLayoutContextValue {
  const ctx = useContext(ShellLayoutContext);
  if (!ctx) {
    throw new Error('useShellLayout debe usarse dentro de un ShellLayoutProvider');
  }
  return ctx;
}
