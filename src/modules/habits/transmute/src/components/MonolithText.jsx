import React from 'react';
import { motion } from 'framer-motion';

/**
 * MonolithText — Tipografía monolítica alquímica.
 * Renderiza texto con el tratamiento visual de piedra angular del sistema Umbra Celestia.
 * Se usa en Auth, HabitCard, ErrorBoundary, Onboarding y el Dashboard.
 *
 * @param {string}  text     — Texto a renderizar
 * @param {boolean} isActive — Activa el tratamiento dorado / activo
 * @param {string}  className — Clases adicionales opcionales
 */
function MonolithText({ text, isActive = false, className = '' }) {
  return (
    <motion.span
      animate={isActive ? { opacity: 1 } : { opacity: 0.5 }}
      transition={{ duration: 0.4 }}
      className={`
        font-black font-serif tracking-tighter uppercase leading-none
        ${isActive
          ? 'text-[var(--color-midnight)]'
          : 'text-[var(--color-midnight)] opacity-30'
        }
        ${className}
      `}
    >
      {text}
    </motion.span>
  );
}

export default MonolithText;
