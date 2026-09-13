import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialRepository } from '../repositories/SocialRepository';
import { haptics } from '../utils/haptics';
import { Sparkles, Flame, Shield, Eye, Crown, Zap, Star, Lock, Trophy, Sun, Gem, X } from 'lucide-react';

const LOGROS_CONSTELACION = [
  { id: 'ach_first_spark',     group: 'Voluntad', x: 50, y: 55, icon: Sparkles, color: '#fef3c7' }, 
  { id: 'ach_ten_acts',        group: 'Voluntad', x: 50, y: 70, icon: Zap,      color: '#fde68a' },
  { id: 'ach_fifty_acts',      group: 'Maestría', x: 45, y: 82, icon: Eye,      color: '#fbbf24' },
  { id: 'ach_century',         group: 'Maestría', x: 55, y: 82, icon: Trophy,   color: '#f59e0b' },
  { id: 'ach_first_streak',    group: 'Fuego',    x: 35, y: 45, icon: Flame,    color: '#fca5a5' },
  { id: 'ach_week_streak',     group: 'Fuego',    x: 24, y: 38, icon: Flame,    color: '#f87171' },
  { id: 'ach_fortnight_streak', group: 'Fuego',    x: 18, y: 28, icon: Shield,   color: '#ef4444' },
  { id: 'ach_perfect_day',     group: 'Aire',     x: 65, y: 45, icon: Star,     color: '#93c5fd' },
];

const REQUIREMENTS = {
  ach_first_spark:      { type: 'completions', val: 1,    name: 'El Acto Primordial' },
  ach_ten_acts:         { type: 'completions', val: 10,   name: 'Inercia del Éxito' },
  ach_fifty_acts:       { type: 'completions', val: 50,   name: 'Sello de la Persistencia' },
  ach_century:          { type: 'completions', val: 100,  name: 'Centurión del Enfoque' },
  ach_first_streak:     { type: 'streak', val: 3,  name: 'Umbral de la Disciplina' },
  ach_week_streak:      { type: 'streak', val: 7,  name: 'Sintonía Semanal' },
  ach_fortnight_streak: { type: 'streak', val: 21, name: 'Arquitecto de la Rutina' },
  ach_perfect_day:      { type: 'perfect', val: 1,  name: 'Día de Alto Rendimiento' },
};

function AdeptFirmament({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const essence = await SocialRepository.getAdeptEssence(userId);
      setData(essence);
      setLoading(false);
    };
    load();
  }, [userId]);

  const astros = useMemo(() => {
    if (!data) return [];
    const stats = {
      completions: data.habits.reduce((n, h) => n + Object.keys(h.completedDays||{}).length, 0),
      streak: data.profile?.best_streak || 0,
      perfect: data.profile?.perfect_days || 0,
      habits: data.habits.length
    };

    return LOGROS_CONSTELACION.map(a => {
      const req = REQUIREMENTS[a.id];
      let actual = 0;
      if (req.type === 'completions') actual = stats.completions;
      if (req.type === 'streak')      actual = stats.streak;
      if (req.type === 'perfect')     actual = stats.perfect;
      if (req.type === 'habits')      actual = stats.habits;

      return {
        ...a,
        unlocked: actual >= req.val,
        progress: { actual, objetivo: req.val }
      };
    });
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-white"
    >
      <button onClick={onClose} className="absolute top-8 right-8 p-3 glass-card rounded-full opacity-40 hover:opacity-100 transition-opacity">
        <X size={20} />
      </button>

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Zap className="animate-spin text-[var(--color-gold)]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40">Leyendo Firmamento...</p>
        </div>
      ) : (
        <>
          <header className="text-center mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-[var(--color-gold)] block mb-4">Firmamento Ajeno</span>
            <h2 className="text-3xl font-black font-serif uppercase tracking-tighter mb-1">
              {data.profile?.display_name || 'Adepto incógnito'}
            </h2>
            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">Nivel {data.profile?.level || 1} · {astros.filter(a => a.unlocked).length} Estrellas</p>
          </header>

          <div className="relative w-full aspect-square max-w-sm">
            <div className="absolute inset-0">
               {astros.map(a => (
                 <div 
                   key={a.id} 
                   style={{ left: `${a.x}%`, top: `${a.y}%` }}
                   className="absolute -translate-x-1/2 -translate-y-1/2"
                 >
                   <div className={`
                     w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-1000
                     ${a.unlocked ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'opacity-10 border-white/20'}
                   `}
                   style={{ borderColor: a.unlocked ? a.color : undefined }}
                   >
                     {a.unlocked ? <a.icon size={14} style={{ color: a.color }} /> : <Lock size={10} />}
                   </div>
                 </div>
               ))}
            </div>
          </div>
          
          <footer className="mt-8 text-center px-12">
            <p className="text-[11px] font-serif italic text-white/40 leading-relaxed">
              "Observar el firmamento de otro adepto es contemplar el mapa de su voluntad."
            </p>
          </footer>
        </>
      )}
    </motion.div>
  );
}

export default AdeptFirmament;
