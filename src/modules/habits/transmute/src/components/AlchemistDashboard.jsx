import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore.jsx';
import HabitCard from './HabitCard';
import { Plus, Camera, BookOpen, Zap, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { haptics } from '../utils/haptics';
import { toPng } from 'html-to-image';
import { ExportManuscriptView } from './ExportManuscriptView';
import { Check } from 'lucide-react';
import OracleInsight from './OracleInsight';
import MonolithText from './MonolithText';
import AlchemicalGeode from './AlchemicalGeode';
import { HABIT_ICONS, ICON_CATEGORIES, resolveHabitIcon } from '../constants/habitIcons';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "./ui/drawer"
import { getRango, getProgresoEnRango } from '../domain/InvocadorSystem';
import { habitDefinitions } from '../data/habitDefinitions';
import { evolveHabitTitle } from '../domain/HabitDomain';



/**
 * ELEMENTO: AlchemistDashboard.jsx
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Interfaz principal (Atanor) para la gestión diaria de hábitos, visualización de progreso y acceso al Oráculo.
 */
function AlchemistDashboard() {
  const {
    habits, level, xp, selectedDate, setSelectedDate, settings,
    fetchGlobalStats, isResetting, materializeHabit, addHabit,
    _hasHydrated, pulseEvent
  } = useStore();

  const geodeRef = useRef(null);
  const [activeParticles, setActiveParticles] = useState([]);

  // [ACCIÓN]: Sincronización de partículas con eventos de pulso
  useEffect(() => {
    if (pulseEvent && pulseEvent.id > 0) {
      const targetRect = geodeRef.current?.getBoundingClientRect();
      if (targetRect) {
        const particle = {
          id: pulseEvent.id,
          startX: pulseEvent.x,
          startY: pulseEvent.y,
          endX: targetRect.left + targetRect.width / 2,
          endY: targetRect.top + targetRect.height / 2
        };
        setActiveParticles(prev => [...prev, particle]);
        
        setTimeout(() => {
          setActiveParticles(prev => prev.filter(p => p.id !== particle.id));
        }, 1200);
      }
    }
  }, [pulseEvent]);

  
  const [customName, setCustomName]               = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedIcon, setSelectedIcon]           = useState('diamond');
  const [showIconPicker, setShowIconPicker]       = useState(false);
  const [drawerView, setDrawerView]               = useState('menu'); 
  const [isLibraryOpen, setIsLibraryOpen]         = useState(false);
  const [isCapturing, setIsCapturing]             = useState(false);
  const manuscriptRef = useRef(null);

  // [ACCIÓN]: Generación de captura de pantalla (Códice)
  useEffect(() => {
    if (!isCapturing) return;
    const handleCapture = async () => {
      const element = manuscriptRef.current;
      if (!element) {
        toast.error("Error: Altar de captura no encontrado");
        setIsCapturing(false);
        return;
      }

      // Guardar estilo original para restaurarlo después
      const originalStyle = element.style.cssText;

      try {
        toast.loading("Emanando Códice del Ser...", { id: 'capture' });
        
        // HACK: Forzar visibilidad y posición para que el motor de renderizado lo procese
        element.style.opacity = "1";
        element.style.position = "fixed";
        element.style.left = "0";
        element.style.top = "0";
        element.style.zIndex = "9999";
        element.style.visibility = "visible";
        element.style.display = "block";

        // Esperar a que el navegador realice el layout y pinte
        await new Promise(r => setTimeout(r, 1200)); 
        
        const dataUrl = await toPng(element, { 
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#EBE9E4'
        });

        // Restaurar estilo original inmediatamente
        element.style.cssText = originalStyle;

        if (!dataUrl || dataUrl.length < 500) {
          throw new Error("La transmutación produjo un pergamino vacío");
        }
        
        // [LÓGICA]: En WEB siempre descargar para evitar bloqueos de "User Gesture"
        const link = document.createElement('a');
        link.download = `Codice-Transmute-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Códice Emanado", { id: 'capture' });
      } catch (err) { 
        toast.error("Fallo en la transmutación visual", { id: 'capture', description: err.message }); 
      } finally { 
        setIsCapturing(false); 
      }
    };
    handleCapture();
  }, [isCapturing]);

  
  const stableHabits = useMemo(() => {
    return [...habits].sort((a, b) => (a.id > b.id ? 1 : -1));
  }, [habits]);

  const availableDefinitions = useMemo(() => {
    return habitDefinitions.filter(def => !habits.some(h => h.name === def.name));
  }, [habits]);

  const rangoActual = useMemo(() => getRango(xp), [xp]);
  const progresoRango = useMemo(() => getProgresoEnRango(xp), [xp]);

  useEffect(() => { fetchGlobalStats(); }, [fetchGlobalStats]);

  
  const dayNumbers = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    return {
      num: d.getDate(),
      label: d.toLocaleDateString('es-ES', { weekday: 'short' })[0].toUpperCase(),
      dateStr: isoDate,
      isToday: i === 6,
    };
  });

  const done = habits.filter(h => h?.completedDays?.[selectedDate]).length;
  const completionRate = habits.length > 0 ? done / habits.length : 0;
  const xpProgress = progresoRango * 100;

  return (
    <>
      <div className="max-w-2xl mx-auto flex flex-col pb-32 relative z-10">

        {/* ─────────────────────────────────────────────────────────────
            TRANSICIÓN: RESET
        ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isResetting && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 z-[1000] bg-[var(--bg-porcelain)] flex flex-col items-center justify-center p-8 text-[var(--color-midnight)] font-serif text-6xl tracking-tighter uppercase font-black"
            >
              CALCINANDO MATERIA
            </motion.div>
          )}
        </AnimatePresence>

        {/* [LÓGICA]: Contenedor de captura (Invisible pero presente para el renderizador) */}
        <div 
          className="fixed pointer-events-none opacity-0" 
          style={{ zIndex: -1000, left: 0, top: 0, width: '600px' }}
        >
          <ExportManuscriptView ref={manuscriptRef} habits={habits} date={selectedDate} userName={settings.displayName} />
        </div>

        <motion.div animate={{ opacity: isResetting || isCapturing ? 0.3 : 1 }} className="flex flex-col">

          {/* ─────────────────────────────────────────────────────────────
              ENCABEZADO: LA GRAN OBRA
          ───────────────────────────────────────────────────────────── */}
          <header 
            className="px-5 pt-6 mb-4"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-gold)] font-serif block opacity-80">
                {settings.profiling?.disciplineLevel === 'Inquebrantable' ? 'Senda del Rigor Absoluto' : 'Proceso de Alquimia Individual'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black font-serif leading-none mt-1 tracking-tighter uppercase">
                <MonolithText 
                  text={
                    settings.profiling?.focusArea === 'Cuerpo' ? "El Templo" :
                    settings.profiling?.focusArea === 'Espíritu' ? "El Santuario" :
                    "La Gran Obra"
                  } 
                  isActive={true} 
                />
              </h2>
              <div className="flex items-center gap-1.5 mt-2 opacity-60">
                <span className="text-[11px] font-sans font-black uppercase tracking-[0.2em]">
                  {settings.profiling?.disciplineLevel === 'Frágil' ? 'Un paso a la vez,' : 'Transmutación de'}
                </span>
                <span className="text-[12px] font-sans font-black uppercase tracking-widest text-[var(--color-gold)]">
                  {settings.displayName || "Adepto"}
                </span>
              </div>
              <div className="h-0.5 w-12 bg-[var(--color-gold)] mt-4 opacity-50" />
            </div>
          </header>

          {/* ─────────────────────────────────────────────────────────────
              TIRA DE FECHAS
          ───────────────────────────────────────────────────────────── */}
          <div className="sticky top-0 z-30 glass-card border-b border-[var(--color-midnight)]/5 px-2 py-2 flex items-center gap-1 mb-6">
            {dayNumbers.map(d => {
              const isSelected = d.dateStr === selectedDate;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => { setSelectedDate(d.dateStr); haptics.impactLight(); }}
                  className={`flex-1 h-14 flex flex-col items-center justify-center rounded-xl transition-all duration-300 relative ${
                    isSelected
                      ? 'bg-[var(--color-midnight)] text-[var(--bg-porcelain)]'
                      : 'opacity-50 hover:opacity-80 active:opacity-100'
                  }`}
                >
                  <span className="text-[11px] font-sans font-black uppercase tracking-widest leading-none mb-1 opacity-80">{d.label}</span>
                  <span className="text-xl font-serif font-black tabular-nums leading-tight">{d.num}</span>
                  {isSelected && (
                    <motion.div layoutId="day-pill" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-gold)]" />
                  )}
                </button>
              );
            })}
            
            <button
              onClick={() => setIsCapturing(true)}
              className="w-14 h-14 flex items-center justify-center opacity-30 hover:opacity-100 hover:text-[var(--color-gold)] transition-all ml-1 flex-shrink-0"
            >
              <Camera size={18} />
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              HABITOS
          ───────────────────────────────────────────────────────────── */}
          <section 
            className="flex flex-col gap-3 px-3"
          >
            <AnimatePresence mode="popLayout">
              {stableHabits.length > 0 ? stableHabits.map(habit => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <HabitCard habit={habit} selectedDate={selectedDate} />
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center flex flex-col items-center gap-6 glass-card border-dashed border-2 border-[var(--color-midnight)]/10 rounded-[3rem] mx-4"
                >
                  <div className="w-20 h-20 bg-gradient-to-t from-[var(--color-gold)]/20 to-transparent flex items-center justify-center rounded-3xl shadow-inner mb-2">
                    <BookOpen size={36} className="text-[var(--color-gold)] opacity-40 animate-pulse" strokeWidth={1} />
                  </div>
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    <span className="text-xl font-serif opacity-40 uppercase font-black tracking-[0.3em]">Sin Forma</span>
                    <p className="text-[10px] font-sans opacity-30 uppercase leading-loose font-black tracking-widest px-8">
                      El atanor está frío. Se requiere voluntad para iniciar la transmutación.
                    </p>
                    <button
                      onClick={() => { 
                        setDrawerView(settings.isGuidedMode ? 'menu' : 'custom');
                        setIsLibraryOpen(true); 
                        haptics.impactHeavy(); 
                      }}
                      className="mt-6 px-8 py-4 bg-[var(--color-gold)] text-[var(--color-midnight)] text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--color-gold)]/20"
                    >
                      Iniciar Gran Obra
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => { 
                setDrawerView(settings.isGuidedMode ? 'menu' : 'custom');
                setIsLibraryOpen(true); 
                haptics.impactMedium(); 
              }}
              className="group relative flex items-center gap-5 px-6 py-5 rounded-[2rem] border border-[var(--color-gold)]/20 bg-gradient-to-br from-[var(--color-gold)]/5 to-transparent text-[var(--color-gold)] hover:border-[var(--color-gold)]/40 transition-all duration-500 w-full mt-4 active:scale-[0.98] shadow-lg shadow-black/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-gold)]/0 via-[var(--color-gold)]/5 to-[var(--color-gold)]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0 group-hover:rotate-90 transition-transform duration-500 border border-[var(--color-gold)]/20">
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[13px] font-serif font-black uppercase tracking-[0.15em] leading-tight">Materializar Ritual</span>
                <span className="text-[9px] font-sans font-black uppercase tracking-widest opacity-40 mt-0.5">Añadir nueva esencia al atanor</span>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-2 group-hover:translate-x-0">
                <Zap size={14} className="animate-pulse" />
              </div>
            </button>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              ESTADO DE LA MATERIA
          ───────────────────────────────────────────────────────────── */}
          <section className="mx-3 mt-10">
            <div className="flex items-center gap-2 mb-6 opacity-30 px-1 justify-center">
              <span className="text-xs font-sans font-black uppercase tracking-[0.3em] opacity-80">La Piedra Filosofal</span>
            </div>
            <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-8 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent pointer-events-none" />
              <div className="relative transform scale-125 my-4" ref={geodeRef}>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 bg-[var(--color-gold)] blur-3xl rounded-full pointer-events-none" 
                />
                <AlchemicalGeode progress={completionRate} />
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <span className="text-base font-black uppercase tracking-widest" style={{ color: rangoActual.color }}>{rangoActual.nombre}</span>
                <span className="text-xs font-serif italic tracking-wider opacity-60" style={{ color: rangoActual.color }}>{rangoActual.subtitulo}</span>
                {!_hasHydrated ? (
                  <div className="mt-2 w-4 h-4 border-2 border-[var(--color-gold)]/20 border-t-[var(--color-gold)] rounded-full animate-spin" />
                ) : (
                  <div className="mt-2 text-sm font-sans font-black uppercase tracking-tighter opacity-90">{xp.toLocaleString()} XP</div>
                )}
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              ORÁCULO (Sólo visible en Modo Guiado)
          ───────────────────────────────────────────────────────────── */}
          {settings.isGuidedMode && (
            <section 
              className="mx-3 mt-4 pb-20"
            >
              <OracleInsight />
            </section>
          )}

          {!settings.isGuidedMode && (
            <div className="pb-20" />
          )}
        </motion.div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ELEMENTOS FIJOS
      ───────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {activeParticles.map(p => (
            <motion.div
              key={p.id}
              initial={{ left: p.startX, top: p.startY, scale: 0, opacity: 0, boxShadow: '0 0 20px var(--color-gold)' }}
              animate={{ left: [p.startX, p.endX], top: [p.startY, p.endY], scale: [1, 2, 0.5], opacity: [0, 1, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute w-4 h-4 bg-[var(--color-gold)] rounded-full"
            />
          ))}
        </AnimatePresence>
      </div>

      <Drawer open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DrawerContent className="bg-[var(--bg-porcelain)] border-t border-black/5 text-[var(--color-midnight)] h-fit max-h-[92vh] outline-none rounded-t-[32px] overflow-hidden shadow-2xl">
          <DrawerTitle className="sr-only">Nuevo habito</DrawerTitle>
          <div className="max-w-2xl mx-auto w-full p-6 pb-12 overflow-y-auto max-h-[92vh]">
            <AnimatePresence mode="wait">
              {drawerView === 'menu' && (
                <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <button onClick={() => setDrawerView('custom')} className="flex items-center gap-4 p-5 glass-card rounded-2xl border border-[var(--color-gold)]/20 active:scale-[0.98] group">
                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-[var(--color-midnight)]/20 flex items-center justify-center group-hover:border-[var(--color-gold)]">
                      <Plus size={20} className="opacity-40 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-lg font-serif font-black uppercase">Hábito propio</span>
                      <span className="text-[11px] uppercase tracking-widest opacity-60 font-black mt-0.5">Personalizado</span>
                    </div>
                  </button>
                  <div className="flex flex-col gap-2">
                    {availableDefinitions.map((def) => (
                      <button key={def.id} onClick={() => { materializeHabit(def.id); setIsLibraryOpen(false); }} className="flex items-center gap-4 p-4 text-left glass-card rounded-2xl border border-transparent active:scale-[0.98]">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center opacity-40">
                          {resolveHabitIcon(def.icon, 'w-6 h-6')}
                        </div>
                        <span className="text-base font-serif font-black uppercase leading-tight">{def.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {drawerView === 'custom' && (
                <motion.div key="custom" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    {settings.isGuidedMode && (
                      <button onClick={() => setDrawerView('menu')} className="opacity-30"><ArrowLeft size={18} /></button>
                    )}
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Diseñar Hábito</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className="w-20 h-20 glass-card rounded-[28px] flex items-center justify-center text-[var(--color-gold)] hover:scale-105 active:scale-95 transition-transform"
                    >
                      {resolveHabitIcon(selectedIcon, 'w-10 h-10')}
                    </button>
                    <span className="text-[9px] uppercase tracking-widest opacity-30 font-black">Sello</span>
                  </div>

                  {showIconPicker && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-4 glass-card rounded-2xl max-h-48 overflow-y-auto">
                      {HABIT_ICONS.map(icon => (
                        <button
                          key={icon.key}
                          onClick={() => { setSelectedIcon(icon.key); setShowIconPicker(false); }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedIcon === icon.key ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]' : 'opacity-40 hover:opacity-100 hover:bg-[var(--color-midnight)]/5'}`}
                        >
                          <icon.Component size={18} strokeWidth={1.5} />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-5">
                    <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Nombre..." className="w-full bg-transparent border-b border-[var(--color-midnight)]/10 text-xl font-serif font-black uppercase focus:outline-none focus:border-[var(--color-gold)] transition-colors" />
                    <input type="text" value={customDescription} onChange={e => setCustomDescription(e.target.value)} placeholder="Descripción (opcional)..." className="w-full bg-transparent border-b border-[var(--color-midnight)]/10 text-sm font-sans opacity-70 focus:outline-none focus:border-[var(--color-gold)] transition-colors" />
                  </div>
                  <button onClick={() => { 
                    if (!customName.trim()) { toast.error("El nombre es requerido"); return; }
                    addHabit({ name: customName, icon: selectedIcon, description: customDescription }); 
                    setIsLibraryOpen(false);
                    setCustomName(''); setCustomDescription(''); setSelectedIcon('diamond');
                    toast.success("Ritual Establecido", { description: `Has sellado tu intención: «${customName}».` });
                  }} className="w-full py-4 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] font-black uppercase rounded-2xl mt-2 hover:opacity-90 active:scale-[0.98] transition-all">Establecer</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default AlchemistDashboard;
