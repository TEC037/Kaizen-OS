import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart3, Swords, ShieldCheck, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Navbar: "El Sendero del Alquimista" — Navegación entre los 5 planos.
 * Rutas transmutadas según la equivalencia de intercambio.
 */
const navItems = [
  { path: '/',         icon: Home,       label: 'Altar',    sublabel: 'Actos'    },
  { path: '/stats',    icon: BarChart3,  label: 'Espejo',   sublabel: 'Evolución'},
  { path: '/logros',   icon: Swords,     label: 'Cenit',    sublabel: 'Logros'   },
  { path: '/conclave', icon: ShieldCheck,label: 'Conclave', sublabel: 'Sincronía'},
  { path: '/ajustes',  icon: Settings,   label: 'Ajustes',  sublabel: 'Fuerza'   },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      aria-label="Navegación Alquímica"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around px-2 pb-4 pt-0"
    >
      <div className="relative flex w-full max-w-md mx-auto items-center justify-around bg-[var(--color-midnight)]/90 backdrop-blur-3xl border border-white/5 rounded-[2rem] px-3 py-2 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
            || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center py-3 px-4 min-w-[65px] group"
            >
              <AnimatePresence>
                {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className="absolute inset-0 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 shadow-lg"
                    />
                )}
              </AnimatePresence>

              <motion.div
                animate={isActive ? { scale: 1.2, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-[var(--color-gold)]' : 'text-white/40 group-hover:text-white/80'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
              </motion.div>

              <motion.span
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-gold)] mt-1 relative z-10 font-serif opacity-80"
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Navbar;
