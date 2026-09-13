/**
 * @file src/modules/habits/HabitsPage.tsx
 * @description Módulo "TRANSMUTE": la aplicación completa de hábitos con
 * narrativa alquímica, embebida en `src/modules/habits/transmute` (100% local,
 * sin backend). Al completar un hábito se otorgan puntos Kaizen (vía evento).
 */

import React, { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import TransmuteApp from './transmute/src/App';
import './transmute/src/index.css';
import { setThemeOnRoot } from './transmute/src/lib/themeRoot';
import { awardKaizenPoints } from '../../core/scoring';
import { soundEngine } from '../../core/sound';

const TRANSMUTE_COMPLETED_EVENT = 'transmute:habit-completed';

const applyPersistedTheme = () => {
  try {
    const raw = localStorage.getItem('transmute-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: { theme?: string } };
    if (parsed.state?.theme) setThemeOnRoot(parsed.state.theme);
  } catch {
    /* tema por defecto */
  }
};

export const HabitsPage: React.FC = () => {
  useEffect(() => {
    applyPersistedTheme();

    const handleCompleted = (e: Event) => {
      const detail = (e as CustomEvent<{ name?: string }>).detail;
      soundEngine.playComplete();
      awardKaizenPoints(10, 'habits', `Hábito transmutado: ${detail?.name ?? 'la Gran Obra'}`);
    };
    window.addEventListener(TRANSMUTE_COMPLETED_EVENT, handleCompleted);
    return () => window.removeEventListener(TRANSMUTE_COMPLETED_EVENT, handleCompleted);
  }, []);

  return (
    <div className="transmute-app -mx-4 -my-4 sm:-mx-6 sm:-my-6">
      <MemoryRouter initialEntries={['/']}>
        <TransmuteApp />
        <Toaster position="top-center" richColors />
      </MemoryRouter>
    </div>
  );
};