/**
 * Contexto y hook de la aplicación.
 *
 * Se mantienen en un módulo exclusivamente de código (sin componentes React)
 * para no romper el fast-refresh: AppContext.tsx solo exporta el componente
 * `AppProvider` y aquí viven `AppContext` (el objeto) y el hook `useApp`.
 */

import { createContext, useContext } from 'react';
import type { AppContextType } from './AppContext';

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
