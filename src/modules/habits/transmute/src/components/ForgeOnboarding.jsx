/**
 * ELEMENTO: ForgeOnboarding.jsx
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Experiencia de inicio y configuración inicial (Onboarding).
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import TaviraSpirit from './TaviraSpirit';
import { ArrowRight, SkipForward, Bell, BellOff, Vibrate, Plus, Trash2, Check, RotateCcw } from 'lucide-react';

const C = {
  bg: 'var(--bg-porcelain)',
  emerald: '#10b981',
  emeraldDim: 'rgba(16,185,129,0.35)',
  white: 'var(--color-midnight)',
  dim: 'color-mix(in srgb, var(--color-midnight) 60%, transparent)',
  dimmer: 'color-mix(in srgb, var(--color-midnight) 20%, transparent)',
  border: 'color-mix(in srgb, var(--color-midnight) 10%, transparent)',
  font: 'Inter, sans-serif',
  serif: 'Georgia, serif',
  oswald: 'Oswald, Inter, sans-serif',
};

// [ESTRUCTURA]: Definición de pasos del flujo de Onboarding
const STEPS = [
  {
    id: 'presentacion',
    label: 'Contacto',
    title: 'Protocolo de Inicialización',
    voice: 'Soy Tavira. He venido a dar luz a tu voluntad para que cristalice en disciplina. Antes de encender el Atanor y comenzar tu transmutación, debemos reconocernos.',
    button: 'Iniciar Resonancia',
    type: 'dialogue',
  },
  {
    id: 'designacion',
    label: 'Registro',
    title: 'Designación de Identidad',
    voice: 'Todo proceso necesita un centro. Para guardar tu progreso y medir tu evolución, el sistema requiere un nombre. ¿Bajo qué identidad forjaremos tu disciplina?',
    button: 'Fijar Nombre',
    type: 'input',
  },
  {
    id: 'preferencias',
    label: 'Sintonía',
    title: 'Configuración del Sistema',
    voice: 'Para guiarte sin romper tu enfoque, debemos ajustar cómo me comunico contigo. Configura las notificaciones y la vibración de tu dispositivo según tu preferencia.',
    button: 'Confirmar Ajustes',
    type: 'prefs',
  },
  {
    id: 'lore',
    label: 'Método',
    title: 'La Ciencia del Hábito',
    voice: 'Cada hábito es una acción clave. Si lo repites con constancia, dejará de requerir esfuerzo y se volverá automático. TRANSMUTE no genera motivación; forja disciplina.',
    button: 'Asimilar Método',
    type: 'dialogue',
  },
  {
    id: 'tutorial',
    label: 'Protocolo',
    title: 'Simulación de Interfaz',
    voice: 'Esta será tu pantalla principal. Observa la mecánica básica: primero añade el hábito que deseas construir, y luego elimina aquello que ya no te sirve.',
    button: 'Comenzar Transmutación',
    type: 'wireframe',
  },
  {
    id: 'mode',
    label: 'Dirección',
    title: 'Parámetros de Navegación',
    voice: 'Debes definir tu nivel de autonomía. El Modo Guiado te estructurará a través de pasos predefinidos. El Modo Libre otorga control absoluto sobre tu matriz. Podrás alterar esta decisión en los ajustes.',
    button: 'Finalizar Reconocimiento',
    type: 'mode',
  },
];

/* ─── TYPEWRITER ─────────────────────────────────────────────── */
function useTypewriter(text, speed = 35) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);
  const tid = useRef(null);

  const complete = () => {
    clearInterval(tid.current);
    idx.current = text.length;
    setDisplayed(text);
  };

  useEffect(() => {
    setDisplayed('');
    idx.current = 0;
    clearInterval(tid.current);
    tid.current = setInterval(() => {
      if (idx.current < text.length) {
        idx.current++;
        setDisplayed(text.slice(0, idx.current));
      } else {
        clearInterval(tid.current);
      }
    }, speed);
    return () => clearInterval(tid.current);
  }, [text, speed]);

  return { displayed, isDone: displayed.length === text.length, complete };
}

/* ─── TOGGLE ─────────────────────────────────────────────────── */
function Toggle({ on, onChange, label, icon }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: '10px 0', width: '100%',
    }}>
      <span style={{ color: on ? C.emerald : C.dimmer, transition: 'color 0.2s' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left', fontSize: 13, color: C.white, fontFamily: C.font }}>{label}</span>
      <div style={{
        width: 42, height: 24, borderRadius: 12,
        background: on ? C.emerald : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'background 0.25s',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: on ? 21 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: on ? '#000' : 'rgba(255,255,255,0.4)',
          transition: 'left 0.25s, background 0.25s',
        }} />
      </div>
    </button>
  );
}

/* ─── WIREFRAME DE TUTORIAL ──────────────────────────────────── */
/*
  Replica fielmente el flujo real de TRANSMUTE:
  CREAR → Botón "Materializar Ritual" → panel inferior (Drawer) → input + "Establecer"
  ELIMINAR → tap en HabitCard → panel inferior → botón "Calcinar"
*/
function WireframeTutorial() {
  const [playKey, setPlayKey] = useState(0);
  // Estado del tutorial
  const [habits, setHabits] = useState(['Meditación matutina', 'Lectura diaria']);
  const [phase, setPhase] = useState('idle');
  // Fases: idle → highlight_add → drawer_open → typing → habit_added
  //        → highlight_card → card_drawer → calcinar → habit_deleted → done
  const [newName, setNewName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cardDrawerOpen, setCardDrawerOpen] = useState(false);
  const [targetHabit] = useState('Meditación matutina');

  // Secuencia automática que replica el flujo real de la app
  useEffect(() => {
    // Reset state before starting
    setHabits(['Meditación matutina', 'Lectura diaria']);
    setPhase('idle');
    setNewName('');
    setDrawerOpen(false);
    setCardDrawerOpen(false);

    const seq = [
      { delay: 600, fn: () => setPhase('highlight_add') },          // 1. Pulsa "Materializar Ritual"
      { delay: 1500, fn: () => { setDrawerOpen(true); setPhase('drawer_open'); } },   // 2. Abre Drawer
      { delay: 2400, fn: () => setPhase('typing') },                  // 3. Empieza a escribir
      { delay: 2500, fn: () => setNewName('E') },
      { delay: 2600, fn: () => setNewName('Ej') },
      { delay: 2700, fn: () => setNewName('Eje') },
      { delay: 2800, fn: () => setNewName('Ejer') },
      { delay: 2900, fn: () => setNewName('Ejerc') },
      { delay: 3000, fn: () => setNewName('Ejerci') },
      { delay: 3100, fn: () => setNewName('Ejercic') },
      { delay: 3200, fn: () => setNewName('Ejercici') },
      { delay: 3300, fn: () => setNewName('Ejercicio') },
      {
        delay: 3900, fn: () => {                                      // 4. "Establecer"
          setHabits(h => [...h, 'Ejercicio']);
          setDrawerOpen(false); setNewName('');
          setPhase('habit_added');
        }
      },
      { delay: 5000, fn: () => setPhase('highlight_card') },          // 5. Señala la tarjeta a eliminar
      { delay: 5900, fn: () => { setCardDrawerOpen(true); setPhase('card_drawer'); } }, // 6. Abre su Drawer
      { delay: 7000, fn: () => setPhase('calcinar') },                // 7. Resalta "Calcinar"
      {
        delay: 7900, fn: () => {                                      // 8. Elimina
          setHabits(h => h.filter(x => x !== targetHabit));
          setCardDrawerOpen(false); setPhase('done');
        }
      },
    ];
    const timers = seq.map(({ delay, fn }) => setTimeout(fn, delay));
    return () => timers.forEach(clearTimeout);
  }, [playKey]);

  const isHighlightAdd = phase === 'highlight_add';
  const isCalcinar = phase === 'calcinar';

  return (
    <div style={{ width: '100%', maxWidth: 340, position: 'relative' }}>

      {/* ── LISTA DE HÁBITOS (estilo HabitCard real) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AnimatePresence>
          {habits.map((h) => (
            <motion.div key={h}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                border: `1px solid ${h === targetHabit && phase === 'highlight_card' ? 'rgba(239,68,68,0.4)' : C.border}`,
                borderRadius: 14,
                background: h === targetHabit && phase === 'highlight_card'
                  ? 'rgba(239,68,68,0.06)' : 'transparent',
                transition: 'border 0.3s, background 0.3s',
              }}
            >
              {/* Botón circular (como el toggle real de la app) */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${C.dimmer}`,
                background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }} />
              {/* Nombre */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.white, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                <div style={{ fontSize: 9, color: C.dimmer, fontFamily: C.font, marginTop: 2 }}>Racha: 0</div>
              </div>
              {/* Settings (como la tarjeta real) */}
              <div style={{ opacity: 0.15, fontSize: 10 }}>⚙</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── BOTÓN "MATERIALIZAR RITUAL" (réplica exacta del dashboard) ── */}
      <motion.div
        animate={isHighlightAdd
          ? { boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 16px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0)'] }
          : { boxShadow: '0 0 0px rgba(16,185,129,0)' }
        }
        transition={{ duration: 0.7, repeat: isHighlightAdd ? Infinity : 0 }}
        style={{
          marginTop: 10,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', borderRadius: 16,
          border: `1px solid rgba(16,185,129,${isHighlightAdd ? '0.5' : '0.15'})`,
          background: `rgba(16,185,129,${isHighlightAdd ? '0.08' : '0.03'})`,
          cursor: 'default', transition: 'border 0.3s, background 0.3s',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.emerald,
        }}>
          <Plus size={14} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, color: C.emerald, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Materializar Ritual</div>
          <div style={{ fontSize: 8, color: C.dimmer, fontFamily: C.font, marginTop: 1 }}>Añadir nueva esencia al atanor</div>
        </div>
      </motion.div>

      {/* ── DRAWER DE CREAR HÁBITO ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute', bottom: -8, left: 0, right: 0,
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: '16px 16px 0 0',
              padding: '14px 16px 18px',
              zIndex: 10,
            }}
          >
            {/* Handle */}
            <div style={{ width: 28, height: 3, borderRadius: 9999, background: C.border, margin: '0 auto 12px' }} />
            <div style={{ fontSize: 9, fontWeight: 900, color: C.dimmer, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 12 }}>
              Diseñar Hábito
            </div>
            {/* Input de nombre */}
            <div style={{
              borderBottom: `1px solid ${C.border}`,
              padding: '6px 0', marginBottom: 12,
              fontSize: 14, fontWeight: 900, color: C.white, fontFamily: C.font,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              minHeight: 28,
            }}>
              {newName || <span style={{ opacity: 0.2 }}>Nombre...</span>}
              {phase === 'typing' && (
                <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ display: 'inline-block', width: 1, height: '0.9em', background: C.emerald, marginLeft: 2, verticalAlign: 'middle' }}
                />
              )}
            </div>
            {/* Botón Establecer */}
            <motion.div
              animate={phase === 'typing' && newName.length === 9
                ? { background: [C.bg, C.emerald, C.bg] }
                : {}
              }
              transition={{ duration: 0.4, delay: 0.5 }}
              style={{
                width: '100%', padding: '10px 0', textAlign: 'center',
                background: newName.length > 0 ? C.emerald : C.border,
                borderRadius: 10, cursor: 'default',
                fontSize: 10, fontWeight: 900, color: newName.length > 0 ? C.bg : C.dimmer,
                fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.2em',
                transition: 'background 0.3s, color 0.3s',
              }}
            >
              Establecer
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DRAWER DE ELIMINAR (Calcinar) ── */}
      <AnimatePresence>
        {cardDrawerOpen && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute', bottom: -8, left: 0, right: 0,
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: '16px 16px 0 0',
              padding: '14px 16px 18px',
              zIndex: 10,
            }}
          >
            <div style={{ width: 28, height: 3, borderRadius: 9999, background: C.border, margin: '0 auto 12px' }} />
            <div style={{ fontSize: 11, fontWeight: 900, color: C.white, fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              {targetHabit}
            </div>
            {/* Botón Calcinar */}
            <motion.div
              animate={isCalcinar
                ? { boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 14px rgba(239,68,68,0.5)', '0 0 0px rgba(239,68,68,0)'] }
                : {}
              }
              transition={{ duration: 0.6, repeat: isCalcinar ? Infinity : 0 }}
              style={{
                width: '100%', padding: '10px 0', textAlign: 'center',
                background: isCalcinar ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.06)',
                border: `1px solid rgba(239,68,68,${isCalcinar ? '0.5' : '0.2'})`,
                borderRadius: 10, cursor: 'default',
                fontSize: 10, fontWeight: 900,
                color: `rgba(239,68,68,${isCalcinar ? '1' : '0.5'})`,
                fontFamily: C.font, textTransform: 'uppercase', letterSpacing: '0.2em',
                transition: 'all 0.3s',
              }}
            >
              🔥 Calcinar Hábito
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda y Botón de Repetir */}
      <div style={{ display: 'flex', gap: 16, marginTop: 14, justifyContent: 'center', minHeight: 24, alignItems: 'center' }}>
        {phase === 'done' ? (
          <button
            onClick={() => setPlayKey(k => k + 1)}
            style={{
              background: 'rgba(16,185,129,0.1)', border: `1px solid ${C.emeraldDim}`,
              color: C.emerald, fontSize: 9, fontWeight: 900, fontFamily: C.font,
              padding: '6px 16px', borderRadius: 999, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.1em'
            }}
          >
            <RotateCcw size={10} /> Repetir Simulación
          </button>
        ) : (
          <>
            <span style={{ fontSize: 8, color: C.emerald, fontFamily: C.font }}>
              {['idle', 'highlight_add', 'drawer_open', 'typing'].includes(phase) ? '① Materializar Ritual' : '✓ Ritual establecido'}
            </span>
            <span style={{ fontSize: 8, color: 'rgb(239,68,68)', fontFamily: C.font }}>
              {['idle', 'habit_added', 'highlight_card', 'card_drawer'].includes(phase) ? '② Calcinar Hábito' : '✓ Elemento calcinado'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── CAJA DE DIÁLOGO ─────────────────────────────────────────── */
function DialogueBox({ displayed, isDone }) {
  // Palabras clave a resaltar
  const keywords = ['Tavira', 'voluntad', 'disciplina', 'Atanor', 'transmutación', 'progreso', 'evolución', 'identidad', 'enfoque', 'notificaciones', 'vibración', 'hábito', 'esfuerzo', 'automático', 'motivación', 'mecánica', 'autonomía', 'Modo Guiado', 'Modo Libre', 'control absoluto', 'ajustes'];
  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = displayed.split(regex);

  return (
    <div style={{
      width: '100%', maxWidth: 460, position: 'relative',
      border: `1px solid ${C.border}`, borderRadius: 8,
      background: 'rgba(16,185,129,0.04)',
      boxShadow: 'inset 0 0 20px rgba(16,185,129,0.02)'
    }}>
      {/* Etiqueta TAVIRA */}
      <div style={{
        position: 'absolute', top: -13, left: 14,
        background: '#10b981',
        padding: '2px 12px', borderRadius: 4,
        boxShadow: '0 0 10px rgba(16,185,129,0.2)'
      }}>
        <span style={{
          fontSize: 9, fontWeight: 900, letterSpacing: '0.4em',
          color: '#000', textTransform: 'uppercase', fontFamily: C.oswald,
        }}>
          Tavira
        </span>
      </div>

      {/* Área de texto con altura fija */}
      <div style={{
        padding: '22px 18px 16px',
        minHeight: 120,
        maxHeight: 140,
        overflow: 'hidden',
        display: 'flex', alignItems: 'flex-start',
      }}>
        <p style={{
          margin: 0, fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
          fontFamily: "'Courier New', Courier, monospace", // Gamified / Terminal
          fontWeight: 600,
          color: C.dim, lineHeight: 1.6,
          textTransform: 'uppercase', // Refuerza el estilo terminal
        }}>
          {parts.map((part, i) =>
            keywords.some(k => k.toLowerCase() === part.toLowerCase())
              ? <span key={i} style={{ color: C.emerald, fontWeight: 900, textShadow: '0 0 8px rgba(16,185,129,0.3)' }}>{part}</span>
              : part
          )}
          {!isDone && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.55, repeat: Infinity }}
              style={{ display: 'inline-block', width: 6, height: '1.1em', background: C.emerald, marginLeft: 6, verticalAlign: 'middle' }}
            />
          )}
        </p>
      </div>
    </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────────── */
export default function ForgeOnboarding() {
  const navigate = useNavigate();
  const { updateSettings } = useStore();
  const [stepIndex, setStep] = useState(0);
  const [name, setName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [prefs, setPrefs] = useState({ notifications: true, vibration: true, guidedMode: true });

  const step = STEPS[stepIndex];
  const { displayed, isDone, complete } = useTypewriter(step.voice);

  const handleSkip = async () => {
    await updateSettings({ hasFinishedOnboarding: true });
    navigate('/');
  };

  const handleNext = async () => {
    // Primer clic completa el texto, segundo clic avanza
    if (!isDone) { complete(); return; }
    if (step.type === 'input' && !name.trim()) return;

    if (stepIndex === 1) {
      // Micro-interacción entre nombre y preferencias
      setRegistering(true);
      setTimeout(() => { setRegistering(false); setStep(2); }, 2000);
      return;
    }

    if (stepIndex < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Paso final: guardar todo y navegar
      await updateSettings({
        displayName: name.trim() || 'Adepto',
        hasFinishedOnboarding: true,
        notificationsEnabled: prefs.notifications,
        vibrationEnabled: prefs.vibration,
        isGuidedMode: prefs.guidedMode,
      });
      navigate('/');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: C.bg,
      display: 'grid', gridTemplateRows: '42vh 58vh',
    }}>
      {/* Fondo ambiental */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 45% at 50% 28%, rgba(16,185,129,0.07) 0%, transparent 70%)',
      }} />

      {/* Botón Saltar */}
      <button onClick={handleSkip} style={{
        position: 'absolute', top: 18, right: 18, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'transparent', border: 'none',
        color: C.dimmer, fontSize: 9, fontWeight: 700,
        letterSpacing: '0.25em', textTransform: 'uppercase',
        fontFamily: C.font, cursor: 'pointer', padding: '8px 10px',
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
        onMouseLeave={e => e.currentTarget.style.color = C.dimmer}
      >
        Saltar <SkipForward size={10} />
      </button>

      {/* ── FILA 1: Tavira ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', paddingBottom: 10, position: 'relative', zIndex: 1,
      }}>
        <TaviraSpirit size={110} />
        <motion.p
          animate={{ opacity: [0.18, 0.36, 0.18] }}
          transition={{ duration: 4, repeat: Infinity }}
          style={{
            marginTop: 8, fontSize: 9, fontWeight: 900,
            letterSpacing: '0.42em', color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase', fontFamily: C.font,
          }}
        >
          Tavira · Guía de Evolución
        </motion.p>
        <div style={{
          width: 1, height: 20, marginTop: 14,
          background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.3), transparent)',
        }} />
      </div>

      {/* ── FILA 2: Contenido ── */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">

          {/* Micro-interacción de registro */}
          {registering && (
            <motion.div key="reg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
            >
              <motion.svg viewBox="0 0 80 80" style={{ width: 58, height: 58 }}
                animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="0.5" />
                <polygon points="40,6 70,58 10,58" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="0.8" />
                <polygon points="40,74 70,22 10,22" fill="none" stroke="rgba(16,185,129,0.5)" strokeWidth="0.8" />
                <motion.circle cx="40" cy="40" r="3" fill={C.emerald}
                  animate={{ r: [2, 4.5, 2], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </motion.svg>
              <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.6em', color: C.emerald, textTransform: 'uppercase', fontFamily: C.font }}>
                Registrando Identidad...
              </p>
            </motion.div>
          )}

          {/* Paso normal */}
          {!registering && (
            <motion.div key={step.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
                paddingTop: 10, paddingLeft: 20, paddingRight: 20, gap: 12,
                overflowY: 'auto',
              }}
            >
              {/* Título */}
              <p style={{
                margin: 0, fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                fontFamily: C.oswald, fontWeight: 700,
                color: 'rgba(16,185,129,0.65)', letterSpacing: '0.25em', textTransform: 'uppercase',
              }}>
                {step.title}
              </p>

              {/* Caja de diálogo (todos los pasos la tienen) */}
              <DialogueBox displayed={displayed} isDone={isDone} />

              {/* Contenido específico del tipo de paso */}

              {/* Paso 2: Input de nombre */}
              {step.type === 'input' && (
                <input autoFocus type="text" value={name} placeholder="Tu nombre..."
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  style={{
                    width: '100%', maxWidth: 200, background: 'transparent', border: 'none',
                    borderBottom: `1px solid ${C.emeraldDim}`,
                    padding: '7px 4px', textAlign: 'center',
                    fontSize: '1rem', fontFamily: C.serif, color: C.white, outline: 'none',
                  }}
                />
              )}

              {/* Paso 3: Preferencias */}
              {step.type === 'prefs' && (
                <div style={{
                  width: '100%', maxWidth: 300,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '4px 16px',
                  background: 'rgba(16,185,129,0.03)',
                }}>
                  <Toggle
                    on={prefs.notifications}
                    onChange={v => setPrefs(p => ({ ...p, notifications: v }))}
                    label="Notificaciones"
                    icon={prefs.notifications ? <Bell size={15} /> : <BellOff size={15} />}
                  />
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />
                  <Toggle
                    on={prefs.vibration}
                    onChange={v => setPrefs(p => ({ ...p, vibration: v }))}
                    label="Vibración"
                    icon={<Vibrate size={15} />}
                  />
                </div>
              )}

              {/* Paso 5: Tutorial wireframe */}
              {step.type === 'wireframe' && <WireframeTutorial />}

              {/* Paso 6: Selección de Modo */}
              {step.type === 'mode' && (
                <div style={{
                  width: '100%', maxWidth: 300,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '8px',
                  background: 'rgba(16,185,129,0.03)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <button onClick={() => setPrefs(p => ({ ...p, guidedMode: true }))} style={{
                    background: prefs.guidedMode ? 'rgba(16,185,129,0.15)' : 'transparent',
                    border: `1px solid ${prefs.guidedMode ? C.emerald : C.border}`,
                    borderRadius: 6, padding: '12px 14px', color: prefs.guidedMode ? C.emerald : C.white,
                    fontFamily: C.font, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modo Guiado</div>
                    <div style={{ fontSize: 10, lineHeight: 1.4, color: prefs.guidedMode ? C.emerald : C.dim }}>
                      Tavira estructurará tus rituales de forma progresiva. Ideal para iniciar.
                    </div>
                  </button>
                  <button onClick={() => setPrefs(p => ({ ...p, guidedMode: false }))} style={{
                    background: !prefs.guidedMode ? 'rgba(16,185,129,0.15)' : 'transparent',
                    border: `1px solid ${!prefs.guidedMode ? C.emerald : C.border}`,
                    borderRadius: 6, padding: '12px 14px', color: !prefs.guidedMode ? C.emerald : C.white,
                    fontFamily: C.font, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modo Libre</div>
                    <div style={{ fontSize: 10, lineHeight: 1.4, color: !prefs.guidedMode ? C.emerald : C.dim }}>
                      Control total sin restricciones de aprendizaje.
                    </div>
                  </button>
                </div>
              )}

              {/* Botón de acción */}
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 26px', background: 'transparent',
                  border: `1px solid ${C.emeraldDim}`, borderRadius: 999,
                  color: C.emerald, fontSize: 9, fontWeight: 900,
                  letterSpacing: '0.3em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: C.font, transition: 'background 0.25s, color 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.emerald; e.currentTarget.style.color = C.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.emerald; }}
              >
                {!isDone ? (
                  <>Acelerar Mensaje <SkipForward size={11} /></>
                ) : (
                  <>{step.button} <ArrowRight size={11} /></>
                )}
              </motion.button>

              {/* Indicador de progreso */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingBottom: 8 }}>
                {STEPS.map((s, i) => (
                  <div key={s.id} style={{
                    height: 3, borderRadius: 9999, transition: 'all 0.4s ease',
                    background: i === stepIndex ? C.emerald : i < stepIndex ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                    width: i === stepIndex ? 20 : 6,
                  }} />
                ))}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
