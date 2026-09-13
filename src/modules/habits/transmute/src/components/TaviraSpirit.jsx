import React from 'react';
import { motion } from 'framer-motion';

/**
 * TaviraSpirit v20.0 — SILUETA ESTILIZADA
 * Alas más delgadas en la base del torso para una apariencia grácil.
 * Perfeccionamiento de la curvatura para máxima elegancia.
 */
const TaviraSpirit = ({ size = 110 }) => {
  const colors = {
    forest: '#10b981',
    glow: '#34d399',
    white: '#ffffff',
    gold: '#f59e0b'
  };

  const masterDuration = 4; 
  const pulseDuration = 1;   
  const masterEase = [0.4, 0, 0.2, 1];

  return (
    <div className="relative flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
      
      {/* Aura Atmosférica */}
      <motion.div 
        animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: masterEase }}
        className="absolute inset-0 rounded-full blur-[45px]"
        style={{ backgroundColor: colors.forest }}
      />

      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="wing-grad-pro-R" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.white} />
            <stop offset="20%" stopColor={colors.glow} />
            <stop offset="100%" stopColor={colors.forest} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wing-grad-pro-L" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={colors.white} />
            <stop offset="20%" stopColor={colors.glow} />
            <stop offset="100%" stopColor={colors.forest} stopOpacity="0" />
          </linearGradient>

          <filter id="fairy-bloom-pro">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grupo de Entidad */}
        <motion.g 
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: masterDuration, repeat: Infinity, ease: "easeInOut" }}
          filter="url(#fairy-bloom-pro)"
        >
          
          {/* ALAS (Estilizadas y delgadas en la base) */}
          {[ -1, 1 ].map((side) => (
            <motion.g
              key={side}
              style={{ transformOrigin: '50px 48px' }}
              animate={{ rotate: [side * -10, side * 0, side * -10] }}
              transition={{ duration: pulseDuration, repeat: Infinity, ease: masterEase }}
            >
              <path
                // Trazo refinado: más estrecho al nacer en 50,48
                d={side === 1 
                  ? "M50 48 C95 20 105 85 50 48 Z" 
                  : "M50 48 C5 20 -5 85 50 48 Z"
                }
                fill={side === 1 ? "url(#wing-grad-pro-R)" : "url(#wing-grad-pro-L)"}
                opacity="0.85"
              />
            </motion.g>
          ))}

          {/* EL TORSO */}
          <motion.g
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: pulseDuration, repeat: Infinity, ease: masterEase }}
          >
            {/* CORONA */}
            {[ -12, 0, 12 ].map((angle) => (
              <motion.circle 
                key={angle}
                cx={50 + Math.sin(angle * Math.PI / 180) * 8}
                cy={40 - Math.cos(angle * Math.PI / 180) * 3}
                r="1"
                fill={colors.gold}
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: pulseDuration, repeat: Infinity, ease: masterEase }}
              />
            ))}

            <circle cx="50" cy="47.5" r="9" fill={colors.forest} opacity="0.2" />
            <circle cx="50" cy="47.5" r="6" fill={colors.white} />
            <circle cx="50" cy="47.5" r="3" fill={colors.glow} />
          </motion.g>
          
        </motion.g>

        {/* Estela */}
        {[1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            r="0.4"
            fill={colors.gold}
            animate={{ x: [50, 50 + (i % 2 === 0 ? 25 : -25)], y: [50, 95], opacity: [0, 0.5, 0] }}
            transition={{ duration: masterDuration, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </svg>
    </div>
  );
};

export default TaviraSpirit;
