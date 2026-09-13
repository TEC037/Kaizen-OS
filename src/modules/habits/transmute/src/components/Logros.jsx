import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { haptics } from '../utils/haptics';
import { Sparkles, Flame, Shield, Eye, Crown, Zap, Star, Lock, Trophy, Sun, Gem } from 'lucide-react';

/**
 * ─── EL FIRMAMENTO DE LA OBRA v2.1 (Expandido) ───────────────────────────
 * Cartografía estelar de la evolución del adepto.
 */

const LOGROS_CONSTELACION = [
  // ── VOLUNTAD (Actos acumulados) — Dorados/Ámbar ──
  { id: 'ach_first_spark',     group: 'Voluntad', x: 50, y: 55, icon: Sparkles, color: '#d97706', rarity: 'common' }, 
  { id: 'ach_ten_acts',        group: 'Voluntad', x: 50, y: 70, icon: Zap,      color: '#b45309', rarity: 'common' },
  { id: 'ach_fifty_acts',      group: 'Maestría', x: 45, y: 82, icon: Eye,      color: '#92400e', rarity: 'rare' },
  { id: 'ach_century',         group: 'Maestría', x: 55, y: 82, icon: Trophy,   color: '#78350f', rarity: 'epic' },
  { id: 'ach_five_hundred',    group: 'Gloria',   x: 50, y: 92, icon: Gem,      color: '#a16207', rarity: 'epic' },
  { id: 'ach_titan_acts',      group: 'Gloria',   x: 50, y: 10, icon: Crown,    color: '#854d0e', rarity: 'legendary' }, 

  // ── FUEGO (Rachas) — Rojos/Carmesí ──
  { id: 'ach_first_streak',    group: 'Fuego',    x: 35, y: 45, icon: Flame,    color: '#dc2626', rarity: 'common' },
  { id: 'ach_week_streak',     group: 'Fuego',    x: 24, y: 38, icon: Flame,    color: '#b91c1c', rarity: 'rare' },
  { id: 'ach_fortnight_streak', group: 'Fuego',    x: 18, y: 28, icon: Shield,   color: '#991b1b', rarity: 'rare' },
  { id: 'ach_month_streak',    group: 'Fuego',    x: 12, y: 18, icon: Star,     color: '#7f1d1d', rarity: 'epic' },
  { id: 'ach_solar_streak',    group: 'Fuego',    x: 8,  y: 8,  icon: Sun,      color: '#450a0a', rarity: 'legendary' },

  // ── AIRE (Días perfectos) — Azules/Índigo ──
  { id: 'ach_perfect_day',     group: 'Aire',     x: 65, y: 45, icon: Sparkles, color: '#2563eb', rarity: 'common' },
  { id: 'ach_seven_perfect',   group: 'Aire',     x: 76, y: 38, icon: Crown,    color: '#1d4ed8', rarity: 'rare' },
  { id: 'ach_master_perfect',  group: 'Aire',     x: 88, y: 28, icon: Sun,      color: '#1e40af', rarity: 'epic' },
  { id: 'ach_five_habits',     group: 'Aire',     x: 75, y: 55, icon: Trophy,   color: '#1e3a8a', rarity: 'rare' },
];

const CONEXIONES = [
  ['ach_first_spark', 'ach_ten_acts'],
  ['ach_ten_acts', 'ach_fifty_acts'],
  ['ach_ten_acts', 'ach_century'],
  ['ach_century', 'ach_five_hundred'],
  ['ach_five_hundred', 'ach_titan_acts'],

  ['ach_first_spark', 'ach_first_streak'],
  ['ach_first_streak', 'ach_week_streak'],
  ['ach_week_streak', 'ach_fortnight_streak'],
  ['ach_fortnight_streak', 'ach_month_streak'],
  ['ach_month_streak', 'ach_solar_streak'],

  ['ach_first_spark', 'ach_perfect_day'],
  ['ach_perfect_day', 'ach_seven_perfect'],
  ['ach_seven_perfect', 'ach_master_perfect'],
  ['ach_perfect_day', 'ach_five_habits']
];

const REQUIREMENTS = {
  ach_first_spark:      { type: 'completions', val: 1,    name: 'El Acto Primordial', lore: 'Inicia la Gran Obra completando tu primer hábito de alto impacto.' },
  ach_ten_acts:         { type: 'completions', val: 10,   name: 'Inercia del Éxito', lore: 'Has acumulado 10 actos de disciplina. La inercia del éxito empieza a trabajar a tu favor.' },
  ach_fifty_acts:       { type: 'completions', val: 50,   name: 'Sello de la Persistencia', lore: '50 repeticiones. Has cruzado el valle de la deserción que detiene a la mayoría.' },
  ach_century:          { type: 'completions', val: 100,  name: 'Centurión del Enfoque', lore: '100 actos de poder. El enfoque profundo se ha convertido en tu estado natural.' },
  ach_five_hundred:     { type: 'completions', val: 500,  name: 'Maestría del Destino', lore: '500 transmutaciones. Ya no sigues hábitos; has diseñado tu propia realidad.' },
  ach_titan_acts:       { type: 'completions', val: 1000, name: 'Soberano de la Acción', lore: '1.000 actos de voluntad. Tu capacidad de ejecución es ahora legendaria.' },

  ach_first_streak:     { type: 'streak', val: 3,  name: 'Umbral de la Disciplina', lore: '3 días consecutivos. El caos inicial ha sido dominado por el orden del hábito.' },
  ach_week_streak:      { type: 'streak', val: 7,  name: 'Sintonía Semanal', lore: '7 días sin interrupción. Has completado un ciclo de alto rendimiento.' },
  ach_fortnight_streak: { type: 'streak', val: 21, name: 'Arquitecto de la Rutina', lore: '21 días. El tiempo sagrado donde el esfuerzo se convierte en identidad.' },
  ach_month_streak:     { type: 'streak', val: 30, name: 'Inviolabilidad del Carácter', lore: '30 días. Has demostrado poseer un carácter inquebrantable frente a las distracciones.' },
  ach_solar_streak:     { type: 'streak', val: 90, name: 'Legado de la Constancia', lore: '90 días. Un trimestre de excelencia. Has transmutado tu vida por completo.' },

  ach_perfect_day:      { type: 'perfect', val: 1,  name: 'Día de Alto Rendimiento', lore: '100% de efectividad. Has logrado la sintonía perfecta entre intención y acción.' },
  ach_seven_perfect:    { type: 'perfect', val: 7,  name: 'Sintonía del Dominio', lore: '7 días perfectos. El dominio sobre tu tiempo y energía es absoluto.' },
  ach_master_perfect:   { type: 'perfect', val: 50, name: 'Santo de la Ejecución', lore: '50 días perfectos. Eres un maestro en la ciencia de la realización personal.' },
  ach_five_habits:      { type: 'habits',  val: 5,  name: 'Equilibrio del Sistema', lore: '5 hábitos activos. Has equilibrado las áreas críticas de tu desarrollo personal.' },
};

function Estrella({ astro, unlocked, progress, onClick }) {
  const Icon = astro.icon;
  const rarity = astro.rarity || 'common';

  // Configuración de efectos por rareza
  const rarityConfig = {
    common:    { glowSize: 15, borderWidth: 2, auraScale: 1.15 },
    rare:      { glowSize: 25, borderWidth: 2.5, auraScale: 1.3 },
    epic:      { glowSize: 35, borderWidth: 3, auraScale: 1.5 },
    legendary: { glowSize: 50, borderWidth: 3.5, auraScale: 1.8 },
  };
  const rc = rarityConfig[rarity];

  return (
    <motion.div
      style={{ left: `${astro.x}%`, top: `${astro.y}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <motion.button
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => { onClick(astro); haptics.impactMedium(); }}
        className="relative group"
      >
        {/* Resplandor en hover */}
        <div 
          className="absolute inset-[-20px] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ backgroundColor: astro.color }}
        />

        {/* ── EFECTOS POR RAREZA (solo si desbloqueado) ── */}
        {unlocked && (
          <>
            {/* Aura base — todas las rarezas */}
            <motion.div
              animate={{ scale: [1, rc.auraScale, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 3 + (rarity === 'legendary' ? 0 : 1), repeat: Infinity }}
              className="absolute inset-[-12px] rounded-full blur-xl pointer-events-none"
              style={{ backgroundColor: `${astro.color}40` }}
            />

            {/* Anillo rotante — epic y legendary */}
            {(rarity === 'epic' || rarity === 'legendary') && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: rarity === 'legendary' ? 4 : 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-6px] rounded-full pointer-events-none z-0"
                style={{
                  border: `1.5px dashed ${astro.color}66`,
                }}
              />
            )}

            {/* Segundo anillo — solo legendary */}
            {rarity === 'legendary' && (
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-12px] rounded-full pointer-events-none z-0"
                style={{
                  border: `1px solid ${astro.color}33`,
                }}
              />
            )}

            {/* Pulso de rareza raro+ */}
            {(rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') && (
              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{ duration: rarity === 'rare' ? 3 : 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: `2px solid ${astro.color}` }}
              />
            )}

            {/* Borde arcoíris — solo legendary */}
            {rarity === 'legendary' && (
              <motion.div
                animate={{
                  background: [
                    `conic-gradient(from 0deg, ${astro.color}, #f59e0b, #ef4444, #8b5cf6, #3b82f6, ${astro.color})`,
                    `conic-gradient(from 120deg, ${astro.color}, #f59e0b, #ef4444, #8b5cf6, #3b82f6, ${astro.color})`,
                    `conic-gradient(from 240deg, ${astro.color}, #f59e0b, #ef4444, #8b5cf6, #3b82f6, ${astro.color})`,
                    `conic-gradient(from 360deg, ${astro.color}, #f59e0b, #ef4444, #8b5cf6, #3b82f6, ${astro.color})`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-[-3px] rounded-full pointer-events-none z-0 blur-[2px] opacity-70"
              />
            )}
          </>
        )}

        {/* Aura latente para bloqueados */}
        {!unlocked && (
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-[-8px] rounded-full blur-lg pointer-events-none"
            style={{ backgroundColor: `${astro.color}20` }}
          />
        )}

        {/* ── NÚCLEO DEL ASTRO ── */}
        <div className={`
          w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-1000 relative z-10
          ${unlocked 
            ? 'glass-card shadow-lg scale-110' 
            : 'bg-[var(--bg-porcelain)]/50 dark:bg-[var(--color-midnight)]/10 opacity-70 scale-90'
          }
        `}
        style={{ 
          borderWidth: unlocked ? `${rc.borderWidth}px` : '1.5px',
          borderStyle: 'solid',
          borderColor: unlocked ? `${astro.color}CC` : 'var(--color-midnight)',
          borderOpacity: unlocked ? 1 : 0.12,
          boxShadow: unlocked 
            ? `0 8px 24px -4px ${astro.color}44, 0 0 ${rc.glowSize}px ${astro.color}22` 
            : 'none'
        }}
        >
          {unlocked ? (
            <Icon 
              size={28} 
              style={{ color: astro.color }} 
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
            />
          ) : (
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.85, 1.1, 0.85],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="flex items-center justify-center"
            >
              <Lock size={20} className="text-[var(--color-midnight)] opacity-60 drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_0_10px_var(--color-gold)]" />
            </motion.div>
          )}
        </div>

        {/* Barra de progreso para logros parciales */}
        {!unlocked && progress.actual > 0 && (
           <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8">
             <div className="h-0.5 bg-[var(--color-midnight)]/5 w-full rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${Math.min((progress.actual / progress.objetivo) * 100, 100)}%` }}
                 className="h-full bg-[var(--color-gold)]/60" 
               />
             </div>
           </div>
        )}
      </motion.button>
    </motion.div>
  );
}

function Logros() {
  const { achievements, habits, bestStreak, perfectDaysCount } = useStore();
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);

  const stats = useMemo(() => {
    const totalComps = habits.reduce((n, h) => n + Object.keys(h.completedDays||{}).length, 0);
    return {
      completions: totalComps,
      streak: bestStreak || 0,
      perfect: perfectDaysCount || 0,
      habits: habits.length
    };
  }, [habits, bestStreak, perfectDaysCount]);

  const astros = useMemo(() => {
    return LOGROS_CONSTELACION.map(a => {
      const req = REQUIREMENTS[a.id];
      let actual = 0;
      if (req.type === 'completions') actual = stats.completions;
      if (req.type === 'streak')      actual = stats.streak;
      if (req.type === 'perfect')     actual = stats.perfect;
      if (req.type === 'habits')      actual = stats.habits;

      return {
        ...a,
        unlocked: achievements.includes(a.id) || actual >= req.val,
        progress: { actual, objetivo: req.val, lore: req.lore }
      };
    });
  }, [achievements, stats]);

  return (
    <div className="min-h-[95vh] flex flex-col bg-[var(--bg-porcelain)] -mt-4 -mx-4 pb-32 relative overflow-hidden transition-colors duration-1000">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000">
        {/* Capa de Profundidad de Papel/Piedra */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-gold)]/[0.03] to-transparent" />
        
        {/* Rejilla de Coordenadas Alquímicas — Estética de Tinta */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.05]" 
          style={{ 
            backgroundImage: `radial-gradient(var(--color-midnight) 1.2px, transparent 1.2px), linear-gradient(to right, var(--color-midnight) 0.5px, transparent 0.5px), linear-gradient(to bottom, var(--color-midnight) 0.5px, transparent 0.5px)`,
            backgroundSize: '100px 100px, 50px 50px, 50px 50px',
            backgroundPosition: 'center center'
          }}
        />

        {/* Aura Central de Poder */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--color-gold)]/[0.04] dark:bg-[var(--color-gold)]/[0.08] blur-[160px] rounded-full" />
        
        {/* Textura Orgánica */}
        <div className="absolute inset-0 opacity-[0.1] dark:opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] mix-blend-multiply dark:mix-blend-overlay" />
      </div>

      <header className="relative z-30 p-8 pt-16 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-midnight)] opacity-60 font-serif block mb-2">
          Firmamento de la Obra
        </span>
        <h1 className="text-5xl font-black font-serif text-[var(--color-midnight)] tracking-tighter uppercase leading-none">
          Logros
        </h1>
        <div className="h-px w-12 bg-[var(--color-gold)]/30 mx-auto mt-6" />
        <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--color-gold)] mt-8 bg-[var(--color-gold)]/10 py-2.5 px-8 rounded-full inline-block border border-[var(--color-gold)]/20 shadow-lg shadow-[var(--color-gold)]/5">
          {astros.filter(a => a.unlocked).length} Eones Alineados
        </p>
      </header>

      <main className="relative z-10 w-full aspect-[3/4] md:aspect-square lg:aspect-video overflow-visible cursor-crosshair px-6">
        <div className="absolute inset-0" ref={containerRef}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            {CONEXIONES.map(([fromId, toId]) => {
              const from = astros.find(a => a.id === fromId);
              const to = astros.find(a => a.id === toId);
              if (!from || !to) return null;
              const active = from.unlocked && to.unlocked;
              return (
                <motion.line
                  key={`${fromId}-${toId}`}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`}   y2={`${to.y}%`}
                  stroke={active ? 'var(--color-gold)' : 'var(--color-midnight)'}
                  strokeOpacity={active ? 0.6 : 0.12}
                  strokeWidth={active ? "2.5" : "1.5"}
                  strokeDasharray={active ? "none" : "6 10"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              );
            })}
          </svg>

          {astros.map((astro) => (
            <Estrella
              key={astro.id}
              astro={astro}
              unlocked={astro.unlocked}
              progress={astro.progress}
              onClick={setSelected}
            />
          ))}
        </div>
      </main>

      <footer className="relative z-30 p-12 text-center">
         <div className="inline-flex flex-col items-center gap-1 opacity-20">
           <Zap size={14} />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">
             Explora tu Constelación
           </p>
         </div>
      </footer>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[var(--bg-porcelain)]/95 backdrop-blur-3xl"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="w-full max-w-sm flex flex-col items-center text-center"
              onClick={e => e.stopPropagation()}
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-10 border shadow-2xl bg-[var(--color-midnight)]/5"
                style={{ borderColor: selected.unlocked ? `${selected.color}66` : 'var(--color-midnight)/10' }}
              >
                <selected.icon size={44} style={{ color: selected.unlocked ? selected.color : 'var(--color-midnight)/10' }} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-midnight)] opacity-40 mb-4 font-serif">
                {selected.group}
              </span>
              
              <h2 className="text-4xl font-black font-serif text-[var(--color-midnight)] tracking-tighter uppercase mb-2 leading-none">
                {REQUIREMENTS[selected.id].val} {selected.id.includes('streak') ? 'Días' : selected.id.includes('perfect') ? 'Perfectos' : 'Actos'}
              </h2>
              <h3 className="text-xl font-black font-serif text-[var(--color-gold)] uppercase tracking-tighter mb-6 opacity-100 italic">
                {REQUIREMENTS[selected.id].name}
              </h3>

              <p className="text-[13px] font-serif italic text-[var(--color-midnight)] opacity-70 leading-relaxed mb-12 px-6">
                "{selected.progress.lore}"
              </p>

              <div className="flex flex-col gap-4 w-full max-w-[240px]">
                {!selected.unlocked && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-[var(--color-midnight)] opacity-30">
                      <span>Proyección</span>
                      <span>{selected.progress.actual} / {selected.progress.objetivo}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--color-midnight)]/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(selected.progress.actual / selected.progress.objetivo) * 100}%` }}
                        className="h-full bg-[var(--color-gold)] shadow-[0_0_10px_rgba(var(--color-gold-rgb),0.3)]"
                      />
                    </div>
                  </div>
                )}
                {selected.unlocked && (
                  <div className="flex items-center justify-center gap-2 text-emerald-500">
                    <Sparkles size={16} />
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Eón Sincronizado</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelected(null)}
                className="mt-16 text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-midnight)] opacity-30 hover:opacity-100 transition-all border-b border-transparent hover:border-[var(--color-midnight)]/20 pb-1"
              >
                Cerrar Mapa
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Logros;
