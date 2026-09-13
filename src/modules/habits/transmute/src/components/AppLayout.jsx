import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore.jsx';
import {
  Home,
  BarChart3,
  Settings,
  Swords,
  ShieldCheck,
  Moon,
  Sun,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsCenter from './NotificationsCenter';
import AlchemicalBackground from './AlchemicalBackground';
import BugReportFAB from './BugReportFAB';
import { getThemeFromRoot } from '../lib/themeRoot';

/**
 * APPLAYOUT v5.0 — MOBILE FIRST: NAVEGACION NATIVA
 * - Header superior minimal: avatar + tema.
 * - Bottom navigation bar al estilo nativo iOS/Android.
 * - Sin sidebar lateral: el contenido ocupa todo el ancho.
 * - Barra de progreso diario integrada en la nav inferior.
 */
const AppLayout = ({ children }) => {
  const {
    habits,
    selectedDate,
    isTransmuting,
    toggleTheme,
    settings,
    level,
  } = useStore();

  const location  = useLocation();
  const navigate  = useNavigate();

  
  const navItems = [
    { id: '/',         label: 'Altar',    icon: Home        },
    { id: '/stats',    label: 'Espejo',   icon: BarChart3   },
    { id: '/logros',   label: 'Cenit',    icon: Swords      },
    { id: '/conclave', label: 'Conclave', icon: ShieldCheck },
    { id: '/ajustes',  label: 'Ajustes',  icon: Settings    },
  ];

  
  const done     = (habits || []).filter(h => h?.completedDays?.[selectedDate]).length;
  const total    = habits?.length || 0;
  const progress = total > 0 ? (done / total) * 100 : 0;

  
  const isDark = getThemeFromRoot() === 'nigredo';

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden relative bg-[var(--bg-porcelain)] text-[var(--color-midnight)]">

      {}
      <AlchemicalBackground />

      {}
      <AnimatePresence>
        {isTransmuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {}
      <header className="glass-card border-b border-[var(--color-midnight)]/5 z-40 flex items-center justify-between px-5 pt-safe h-[calc(4rem+var(--safe-area-top))] flex-shrink-0">

        {}
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 border-2 border-[var(--color-midnight)] flex items-center justify-center font-black font-serif text-lg active:scale-90 transition-transform"
        >
          T
        </button>

        {}
        <div className="flex items-center gap-3">
          {}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center opacity-30 hover:opacity-70 active:opacity-100 transition-opacity"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {}
          <NotificationsCenter />

          {}
          <button
            onClick={() => navigate('/ajustes')}
            className="w-9 h-9 glass-card rounded-full border border-[var(--color-midnight)]/10 flex items-center justify-center font-black text-sm font-serif text-[var(--color-gold)] active:scale-90 transition-transform"
          >
            {settings.displayName?.[0]?.toUpperCase() || 'A'}
          </button>
        </div>
      </header>

      {}
      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10">
        <div className="px-4 py-6 md:px-8 md:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {}
      <nav 
        className="glass-card border-t border-[var(--color-midnight)]/5 z-50 flex-shrink-0 safe-area-bottom"
      >

        {}
        <div className="h-[2px] w-full bg-[var(--color-midnight)]/5">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[var(--color-gold)]"
          />
        </div>

        {}
        <div className="flex items-center px-2 pb-safe pt-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = location.pathname === id;
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all duration-300 active:scale-90 ${
                  isActive ? 'text-[var(--color-gold)]' : 'text-[var(--color-midnight)] opacity-50 hover:opacity-100'
                }`}
              >
                {}
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-gold)]"
                    />
                  )}
                </div>
                {}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] font-black uppercase tracking-widest leading-none"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </nav>

      {}
      <div className="fixed bottom-[84px] left-0 right-0 flex justify-center pointer-events-none z-0 opacity-10">
        <span className="text-[7px] font-black uppercase tracking-[0.5em] font-serif">
          Universal Synthesis — TRANSMUTE v5.0
        </span>
      </div>
      <BugReportFAB />

      {}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-[999] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
};

export default AppLayout;
