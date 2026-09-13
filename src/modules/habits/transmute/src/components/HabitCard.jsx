import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Settings, Plus } from 'lucide-react';
import { HABIT_ICONS, resolveHabitIcon } from '../constants/habitIcons';
import { useStore } from '../store/useStore';
import { haptics } from '../utils/haptics';
import MonolithText from './MonolithText';
import { getAlchemicalPhase, getAlchemicalRank, calculateLevelFromXp, getLevelProgress } from '../domain/XPDomain';
import { evolveHabitTitle, evolveHabitMethod } from '../domain/HabitDomain';
import { habitDefinitions } from '../data/habitDefinitions';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "./ui/drawer"
import { toast } from 'sonner';


/**
 * ELEMENTO: HabitCard.jsx
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Representación individual de cada hábito con controles de ejecución y edición rápida.
 */
const HabitCard = React.memo(({ habit, selectedDate }) => {
  const toggleHabit = useStore((state) => state.toggleHabit);
  const deleteHabit = useStore((state) => state.deleteHabit);
  const updateHabit = useStore((state) => state.updateHabit);
  const isGuidedMode = useStore((state) => state.settings.isGuidedMode);
  const xp = useStore((state) => state.xp);
  const triggerPulse = useStore((state) => state.triggerPulse);
  const nodeRef = React.useRef(null);
  
  const [isCalcinating, setIsCalcinating] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  
  const [editedName, setEditedName] = React.useState(habit.name);
  const [editedMethod, setEditedMethod] = React.useState(habit.method || '');
  const [editedIcon, setEditedIcon] = React.useState(habit.icon);
  const [showIconPicker, setShowIconPicker] = React.useState(false);

  
  React.useEffect(() => {
    if (isDrawerOpen) {
      setEditedName(habit.name);
      setEditedMethod(habit.method || '');
      setEditedIcon(habit.icon);
      setShowIconPicker(false);
    }
  }, [isDrawerOpen, habit.name, habit.icon]);

  const isDone = habit.completedDays && habit.completedDays[selectedDate];
  const racha = habit.streak || 0;

  const { level, progress } = getLevelProgress(xp);
  const phase = getAlchemicalPhase(level);

  const handleToggle = (e) => {
    e.stopPropagation();
    haptics.impactMedium();
    
    
    if (!isDone) {
      const rect = nodeRef.current?.getBoundingClientRect();
      if (rect) {
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerPulse(x, y);
      }
    }
    
    toggleHabit(habit.id, selectedDate);
  };

  const handleCalcination = () => {
    setIsCalcinating(true);
    haptics.notificationError();
    setIsDrawerOpen(false); 
    setTimeout(() => {
      deleteHabit(habit.id);
      toast.error("Hábito Calcinado", { description: "El elemento ha vuelto al vacío.", icon: '🔥' });
    }, 600);
  };

  return (
    <div 
      className={`relative w-full py-4 group ${
        isCalcinating ? 'glitch-visceral pointer-events-none' : ''
      }`}
    >

      <div className="flex items-center min-h-[100px] px-6 md:px-14 relative z-10 gap-6 md:gap-10">
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, y: 15 }}
          onClick={handleToggle}
          style={{ 
            transform: isDone ? 'translateY(12px) translateX(8px)' : 'translateY(0px)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className={`relative z-20 w-[5rem] h-[5rem] md:w-[6.5rem] md:h-[6.5rem] rounded-full flex items-center justify-center text-4xl transition-all duration-300 flex-shrink-0 group/node focus:outline-none ${
            isDone 
              ? 'bg-green-500 text-white border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4),inset_0_8px_15px_rgba(0,0,0,0.2)]' 
              : 'bg-[var(--bg-porcelain)] text-[var(--color-midnight)] border-2 border-[var(--color-midnight)]/15 shadow-[0_-8px_30px_rgba(0,0,0,0.15),0_-2px_8px_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_-12px_40px_rgba(0,0,0,0.2),inset_0_-1px_0_rgba(255,255,255,0.9)] hover:scale-[1.03]'
          }`}
        >
          <AnimatePresence mode="wait">
             {isDone ? (
               <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                 <Check className="w-10 h-10 md:w-14 md:h-14 opacity-80" strokeWidth={4} />
               </motion.div>
             ) : (
               <motion.div key="pending" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} className="relative flex items-center justify-center w-full h-full overflow-hidden rounded-full">
                 {}
                 <motion.div 
                   animate={{ scale: [1, 0], opacity: [0, 0.15, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeOut" }}
                   className="absolute inset-0 rounded-full border-[2px] border-red-500 pointer-events-none"
                 />
                 <motion.div 
                   animate={{ scale: [1, 0], opacity: [0, 0.15, 0] }}
                   transition={{ duration: 5, repeat: Infinity, delay: 2.5, ease: "easeOut" }}
                   className="absolute inset-0 rounded-full border-[2px] border-red-500 pointer-events-none"
                 />
                 {}
                 <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_30%,var(--color-midnight)_100%)] opacity-5 pointer-events-none" />
               </motion.div>
             )}
          </AnimatePresence>

          {}
          {isDone && (
             <motion.div 
               animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.95, 1.05, 0.95] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute inset-0 rounded-full -z-10 pointer-events-none"
               style={{
                 boxShadow: "0 0 40px 15px rgba(34, 197, 94, 0.25), 0 0 80px 30px rgba(34, 197, 94, 0.1)"
               }}
             />
          )}
        </motion.button>

        {}
         <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <div className={`glass-card flex-1 flex flex-col justify-center p-4 md:p-6 md:px-8 rounded-3xl relative overflow-hidden cursor-pointer transition-all duration-500 min-h-[5rem] ${
              isDone ? '!bg-green-500/10 !border-green-500/20' : 'hover:brightness-95'
            }`}>
              
              {}
              <div className={`absolute -top-4 -right-2 md:-top-6 md:-right-4 pointer-events-none transition-all duration-1000 flex items-center justify-center ${
                 isDone 
                   ? 'opacity-[0.14] text-green-500 scale-[1.1] rotate-[15deg]' 
                   : 'opacity-[0.06] text-red-500 group-hover:opacity-[0.12] group-hover:scale-110 group-hover:-rotate-3'
              }`}>
                 {resolveHabitIcon(habit.icon, "w-[8rem] h-[8rem] md:w-[10rem] md:h-[10rem]")}
              </div>
              
              <div className="relative z-10 flex flex-col transition-all">
                 <h3 className={`text-2xl md:text-4xl font-serif font-black tracking-tight leading-none uppercase transition-all duration-1000 ${
                   isDone ? 'text-green-600 opacity-80' : 'text-[var(--color-midnight)]'
                 }`}>
                     <MonolithText text={evolveHabitTitle(habit, habitDefinitions)} isActive={isDone} />
                 </h3>
                 {(habit.method || habitDefinitions.find(d => d.name === habit.name)?.method) && (
                   <span className="text-[11px] md:text-[12px] font-sans font-black uppercase tracking-widest opacity-60 mt-1 md:mt-2 line-clamp-1">
                      {evolveHabitMethod(habit, habitDefinitions)}
                   </span>
                 )}

                 {}
                 <div className="flex items-center gap-3 mt-3">
                   <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-500 border ${
                       isDone 
                         ? 'bg-green-500/10 text-green-600 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                         : (habit.streak > 0 
                              ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                              : 'bg-[var(--color-midnight)]/5 text-[var(--color-midnight)] border-transparent opacity-50'
                           )
                   }`}>
                       <Star size={12} fill={isDone || habit.streak > 0 ? "currentColor" : "transparent"} className={habit.streak > 0 && !isDone ? "animate-pulse" : ""} />
                       <span className="text-[11px] md:text-xs font-sans font-black uppercase tracking-widest opacity-80">
                         Racha: {habit.streak || 0}
                       </span>
                   </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-black/10 transition-colors">
                        <Settings size={14} className={isGuidedMode && habit.definitionId ? "opacity-10" : "opacity-40"} />
                    </div>
                 </div>
              </div>
            </div>
          </DrawerTrigger>          <DrawerContent aria-describedby={undefined} className="bg-[var(--bg-porcelain)] border-t border-[var(--color-gold)]/20 text-[var(--color-midnight)] h-fit max-h-[88vh] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] outline-none rounded-t-[3rem] p-4 md:p-10 pb-12 overflow-y-auto custom-scrollbar">
             <DrawerTitle className="sr-only">Ajustes de {habit.name}</DrawerTitle>
             <div className="max-w-lg mx-auto w-full flex flex-col gap-8">
             
             {(() => {
                const level = calculateLevelFromXp(xp);
                const phase = getAlchemicalPhase(level);
                const rank = getAlchemicalRank(level);
                const phaseColors = {
                  nigredo: '#60a5fa',
                  albedo: '#94A3B8',
                  citrinitas: 'var(--color-gold)',
                  rubedo: '#EF4444'
                };
                
                const activeColor = phaseColors[phase.id] || 'var(--color-gold)';

                return (
                  <div className="flex flex-col items-center gap-6 mt-4">
                     <div className="relative">
                        <div 
                          className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center shadow-2xl border border-white/10"
                          style={{ color: activeColor }}
                        >
                          {resolveHabitIcon(editedIcon, 'w-12 h-12')}
                        </div>
                        <button 
                          onClick={() => { setShowIconPicker(!showIconPicker); haptics.impactLight(); }}
                          className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border-2 border-[var(--color-midnight)] transition-all ${
                            showIconPicker 
                              ? 'bg-[var(--color-gold)] text-[var(--color-midnight)] scale-110' 
                              : 'bg-[var(--color-midnight)] text-[var(--bg-porcelain)]'
                          }`}
                        >
                          {showIconPicker ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                        </button>
                     </div>
                     <div className="text-center">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 block mb-1">Rango del Adepto</span>
                       <span className="text-sm font-black uppercase tracking-widest" style={{ color: activeColor }}>
                         {phase.name} · {rank.title}
                       </span>
                     </div>
                  </div>
                );
             })()}

                <AnimatePresence>
                  {showIconPicker && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/5 rounded-[32px] p-6 border border-white/5"
                    >
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {HABIT_ICONS.map((icon) => (
                          <button
                            key={icon.key}
                            onClick={() => { setEditedIcon(icon.key); haptics.impactLight(); }}
                            className={`flex flex-col items-center justify-center h-14 rounded-2xl transition-all ${
                              editedIcon === icon.key ? 'bg-[var(--color-gold)] text-[var(--color-midnight)]' : 'bg-white/5 opacity-40 hover:opacity-100 hover:bg-white/10'
                            }`}
                          >
                            <icon.Component size={20} strokeWidth={1.5} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-30 text-left px-1">Materia Prima</label>
                     <input 
                        type="text" 
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        disabled={isGuidedMode && habit.definitionId}
                        className="w-full bg-transparent border-b-2 border-white/10 focus:border-[var(--color-gold)] outline-none py-4 text-3xl font-serif font-black uppercase tracking-tight transition-all disabled:opacity-30"
                        placeholder="Nombre de la esencia..."
                      />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-30 text-left px-1">Fórmula de Transmutación</label>
                     <textarea 
                        value={editedMethod}
                        onChange={(e) => setEditedMethod(e.target.value)}
                        placeholder="Define el método de esta transmutación..."
                        rows={2}
                        className="w-full bg-transparent border-b border-white/10 focus:border-[var(--color-gold)] outline-none py-2 text-sm font-serif italic transition-all resize-none"
                     />
                  </div>
                </div>
                
                <div className="flex flex-col gap-6 pt-4">
                   <div className="flex gap-4">
                      {(!isGuidedMode || !habit.definitionId) && (
                        <button 
                          onClick={handleCalcination}
                          className="flex-1 h-16 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-500/20"
                        >
                          Calcinar
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          updateHabit(habit.id, { 
                            name: editedName, 
                            icon: editedIcon,
                            method: editedMethod 
                          });
                          setIsDrawerOpen(false);
                          haptics.notificationSuccess();
                        }}
                        className="flex-[2] h-16 bg-[var(--color-gold)] text-[var(--color-midnight)] rounded-xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl active:scale-95 transition-all"
                      >
                        Fijar Esencia
                      </button>
                   </div>
                   
                   <p className="text-[10px] font-serif opacity-30 italic text-center leading-relaxed px-4">
                      "La forma debe morir para que la esencia nazca. Cada ajuste es un paso hacia la perfección de la Gran Obra."
                   </p>
                </div>
             </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
});

export default HabitCard;
