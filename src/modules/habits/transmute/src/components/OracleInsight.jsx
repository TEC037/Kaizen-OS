import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getRango } from '../domain/InvocadorSystem';

/**
 * OracleInsight — El Observador del Sistema.
 *
 * Lee el estado conductual del usuario y emite un análisis calibrado.
 * NO usa "cuántico" como palabra comodín. Cada concepto referencia
 * un mecanismo real: neuroplasticidad, práctica deliberada, bucles de
 * retroalimentación, aprendizaje por refuerzo, etc.
 *
 * El tono es el de un analista muy preciso con aprecio por la narrativa —
 * no un oráculo vago, sino un sistema que describe exactamente lo que ve.
 */




const OBSERVACIONES = [
  // ESTADO VACÍO (RETO INICIAL)
  {
    id: 'vacio',
    condicion: (s) => s.habitCount === 0,
    nivel: 'Estado: Latente',
    texto: 'El Atanor está frío. He visto a miles llegar con promesas de grandeza y terminar reducidos a cenizas. ¿De verdad crees tener la voluntad necesaria para materializar tu primer ritual, o solo estás de paso?',
  },

  // INICIO DE CICLO
  {
    id: 'inicio',
    condicion: (s) => s.habitCount > 0 && s.maxStreak === 0,
    nivel: 'Fase: Ignición',
    texto: 'Primeros pasos. Sellar el ritual es la parte fácil; mantener el fuego es la verdadera alquimia. El sistema espera tu primer registro... demuéstrame que no eres un simple recolector de intenciones.',
  },

  // DÍA PERFECTO (RETO AL EGO)
  {
    id: 'dia_perfecto',
    condicion: (s) => s.hasPerfectDay,
    nivel: 'Coherencia: Oro Puro',
    texto: 'Todos los rituales completados. Has logrado que la materia y el espíritu dancen en armonía hoy. Pero no te envanezcas; el ego es la antesala de la caída. ¿Podrás repetirlo mañana o fue solo un destello de suerte?',
  },

  // RACHA INICIAL (RETO DE MARTY MCFLY)
  {
    id: 'racha_baja',
    condicion: (s) => s.maxStreak >= 3 && s.maxStreak < 7,
    nivel: 'Consolidación: Cristal',
    texto: `Racha de ${'{streak}'} soles. Un hilo de luz bonito, pero frágil como el cristal. Apostaría mi esencia a que no durarás hasta el Ocaso de la semana. ¿Te atreves a hacerme perder la apuesta?`,
    valor: (s) => `${s.maxStreak}`,
  },

  // RACHA SEMANA (RECONOCIMIENTO + DUDA)
  {
    id: 'racha_semana',
    condicion: (s) => s.maxStreak >= 7 && s.maxStreak < 14,
    nivel: 'Consolidación: Hierro',
    texto: 'Una semana de fuego ininterrumpido. Admitiré que me has sorprendido, pero los 14 días son donde la mayoría se quiebra por su propia complacencia. No te confíes.',
  },

  // RACHA CATORCE (RESPECT)
  {
    id: 'racha_catorce',
    condicion: (s) => s.maxStreak >= 14 && s.maxStreak < 28,
    nivel: 'Consolidación: Acero Alquímico',
    texto: 'Dos semanas. Tu vibración empieza a alterar la realidad del Atanor. Ya no haces el hábito; el hábito te está forjando a ti. Sigue así, si es que tus nervios lo soportan.',
  },

  // RACHA MES (MESTRÍA)
  {
    id: 'racha_mes',
    condicion: (s) => s.maxStreak >= 28,
    nivel: 'Automatización: Piedra Filosofal',
    texto: 'Un ciclo lunar completo. Has transmutado la disciplina en identidad. Me has silenciado, Invocador. Alcanzar la cima fue el reto; mantenerte aquí será tu legado.',
  },

  // REZAGO DIARIO (PROVOCACIÓN)
  {
    id: 'progreso_bajo',
    condicion: (s) => s.dailyProgress < 0.3 && s.habitCount > 0,
    nivel: 'Estado: Sombra Dominante',
    texto: 'El día tiene más sombras que luces. ¿Vas a conformarte con la mediocridad hoy? El Atanor requiere fuego constante, no chispas intermitentes que se apagan al primer viento.',
  },

  // EN PROGRESO (IMPULSO)
  {
    id: 'progreso_medio',
    condicion: (s) => s.dailyProgress >= 0.3 && s.dailyProgress < 1,
    nivel: 'Estado: Transmutación Activa',
    texto: 'El día avanza y el plomo se calienta. Mantener el momentum es más económico que reiniciarlo. No dejes que la pereza apague lo que ya has encendido con tanto esfuerzo.',
  },
];

const OBSERVACION_BASE = {
  nivel: 'Análisis: General',
  texto: 'El sistema registra tus datos de comportamiento. Cada completitud es un punto de evidencia. La consistencia, no la intensidad, es el predictor más robusto de cambio conductual a largo plazo.',
};


function OracleInsight({ compact = false }) {
  const { habits, selectedDate, bestStreak, xp } = useStore();

  const estado = useMemo(() => {
    const maxStreak      = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    const habitCount     = habits.length;
    const completadosHoy = habits.filter(h => h.completedDays?.[selectedDate]).length;
    const dailyProgress  = habitCount > 0 ? completadosHoy / habitCount : 0;
    const hasPerfectDay  = habitCount > 0 && completadosHoy === habitCount;
    return { maxStreak, habitCount, dailyProgress, hasPerfectDay };
  }, [habits, selectedDate]);

  
  const profiling = useStore(state => state.settings.profiling);

  const observacion = useMemo(() => {
    const match = OBSERVACIONES.find(o => o.condicion(estado));
    let baseText = match ? (match.valor ? match.texto.replace('{streak}', match.valor(estado)) : match.texto) : OBSERVACION_BASE.texto;
    let nivel = match ? match.nivel : OBSERVACION_BASE.nivel;

    // Adaptación de Tono según Disciplina
    const discipline = profiling?.disciplineLevel || 'Templada';
    
    if (discipline === 'Frágil') {
      // Suavizar: Menos presión, más apoyo
      baseText = baseText
        .replace('demoestrame que no eres un simple recolector', 'confío en que darás tu primer paso')
        .replace('¿Podrás repetirlo mañana o fue solo un destello de suerte?', 'Celebra este logro; mañana daremos otro paso juntos.')
        .replace('¿Te atreves a hacerme perder la apuesta?', 'Sigue nutriendo este hábito, vas por buen camino.')
        .replace('¿Vas a conformarte con la mediocridad hoy?', 'No te sobreexijas, cada pequeño avance cuenta en tu proceso.');
    } else if (discipline === 'Inquebrantable') {
      // Endurecer: Más rigor, cero complacencia
      baseText = baseText
        .replace('Un hilo de luz bonito, pero frágil', 'Estructura básica. Inaceptable si buscas la maestría.')
        .replace('Sigue así, si es que tus nervios lo soportan', 'No celebres. La verdadera forja apenas comienza.')
        .replace('Admitiré que me has sorprendido', 'Cumples con lo mínimo esperado para alguien de tu estirpe.');
    }

    return { nivel, texto: baseText };
  }, [estado, profiling]);

  const rangoActual = getRango(xp);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-start gap-2"
      >
        <span className="text-[var(--color-gold)] text-lg flex-shrink-0 leading-tight mt-0.5" aria-hidden>
          {rangoActual.icon}
        </span>
        <p className="text-sm font-serif opacity-80 leading-relaxed italic">
          {observacion.texto}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-5 border border-[var(--color-midnight)]/5"
    >
      {}
      <p className="text-2xl md:text-3xl font-serif italic opacity-90 leading-snug tracking-tight py-6 text-center" style={{ color: "var(--color-midnight)" }}>
        "{observacion.texto}"
      </p>

      {}
      <div className="mt-2 flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-midnight)]/10" />
        <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] opacity-40 flex items-center gap-2">
          {rangoActual.icon} {observacion.nivel}
        </span>
        <div className="h-px flex-1 bg-[var(--color-midnight)]/10" />
      </div>
    </motion.div>
  );
}

export default OracleInsight;
