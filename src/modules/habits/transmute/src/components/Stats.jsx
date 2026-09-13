import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Flame, Trophy, Target, Zap, ChevronLeft, ChevronRight } from 'lucide-react';


const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];


function diasEnMes(anio, mes) {
  return new Date(anio, mes + 1, 0).getDate();
}


function OuroborosCalendar({ anio, mes, habitosActivos }) {
  const totalDias = diasEnMes(anio, mes);
  const hoy = new Date();
  const esHoy = (d) =>
    hoy.getDate() === d && hoy.getMonth() === mes && hoy.getFullYear() === anio;

  
  const completitudPorDia = useMemo(() => {
    const mapa = {};
    for (let d = 1; d <= totalDias; d++) {
      const key = `${anio}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const completados = habitosActivos.filter(h => h.completedDays?.[key]).length;
      mapa[d] = habitosActivos.length > 0 ? completados / habitosActivos.length : 0;
    }
    return mapa;
  }, [anio, mes, habitosActivos, totalDias]);

  
  const cx = 170;
  const cy = 170;
  const radioBase = 110; 
  const svgSize = 340;

  
  const cuencas = useMemo(() => {
    const arr = Array.from({ length: totalDias }, (_, i) => {
      const dia = i + 1;
      const ratio = completitudPorDia[dia] || 0;
      
      
      const t = 1 - (dia - 1) / (totalDias - 1);
      
      
      const anguloBase = -90 + (dia - 1) * (360 / totalDias);
      const curvaturaGiro = anguloBase; 
      
      
      const radioCuenca = 10;
      
      
      const distCentro = radioBase;
      
      const rad = (curvaturaGiro * Math.PI) / 180;
      return {
        dia,
        ratio,
        esHoy: esHoy(dia),
        radio: radioCuenca,
        x: cx + distCentro * Math.cos(rad),
        y: cy + distCentro * Math.sin(rad),
        anguloBase
      };
    });
    
    return arr;
  }, [totalDias, completitudPorDia]);

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  
  const porcentajeMensual = Math.round(
    (Object.values(completitudPorDia).reduce((a, b) => a + b, 0) / totalDias) * 100
  );

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="w-full max-w-[340px] select-none"
        style={{ overflow: 'visible' }}
      >
        {}
        <text
          x={cx} y={cy - 12}
          textAnchor="middle"
          fontSize="36"
          fontWeight="900"
          fontFamily="serif"
          fill="var(--color-midnight)"
          opacity={0.9}
          className="uppercase tracking-tighter"
        >
          {MESES[mes].slice(0,3)}
        </text>
        <text
          x={cx} y={cy + 16}
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fontFamily="serif"
          fill="var(--color-midnight)"
          opacity={0.3}
          letterSpacing="4"
        >
          {anio}
        </text>
        <text
          x={cx} y={cy + 36}
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="serif"
          fill="var(--color-gold)"
          opacity={1}
          letterSpacing="2"
        >
          {porcentajeMensual}% ALINEACIÓN
        </text>

        {}
        <circle
          cx={cx} cy={cy} r={radioBase - 4}
          fill="none"
          stroke="var(--color-midnight)"
          strokeWidth={0.5}
          strokeDasharray="4 6"
          opacity={0.15}
        />

        {}
        {cuencas.map((c, index) => {
          
          const completadoPleno = c.ratio >= 1;
          const enProceso = c.ratio > 0 && c.ratio < 1;
          
          const fill = completadoPleno ? 'var(--color-gold)'
                     : enProceso ? `rgba(180, 140, 60, ${0.1 + c.ratio * 0.7})`
                     : 'var(--bg-porcelain)';
                     
          const stroke = c.esHoy ? 'var(--color-midnight)'
                       : completadoPleno ? 'var(--color-gold)'
                       : enProceso ? 'rgba(180, 140, 60, 0.4)'
                       : 'rgba(0,0,0,0.15)';

          return (
            <g
              key={c.dia}
              onClick={() => setDiaSeleccionado(diaSeleccionado === c.dia ? null : c.dia)}
              style={{ cursor: 'pointer' }}
            >
              {}
              <motion.circle
                cx={c.x} cy={c.y} r={c.radio}
                fill={fill}
                stroke={stroke}
                strokeWidth={c.esHoy ? 2.5 : 1}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                
                transition={{ delay: (totalDias - index) * 0.012, duration: 0.5, type: "spring", bounce: 0.3 }}
                whileHover={{ scale: 1.15 }}
              />

              {}
              {c.radio >= 9 && (
                <text
                  x={c.x}
                  y={c.y + 0.5} 
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={c.radio * 0.75}
                  fontWeight="700"
                  fontFamily="serif"
                  fill={completadoPleno ? 'var(--bg-porcelain)' : 'var(--color-midnight)'}
                  opacity={completadoPleno || c.esHoy ? 1 : 0.4}
                  style={{ pointerEvents: 'none' }}
                >
                  {c.dia}
                </text>
              )}
            </g>
          );
        })}

        {}
        <AnimatePresence>
          {diaSeleccionado !== null && (
            <motion.g
              key="oraculo-tooltip"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
            >
              {}
              <text
                x={cx} y={cy + 64}
                textAnchor="middle"
                fontSize="9"
                fontWeight="900"
                fontFamily="serif"
                fill="var(--color-midnight)"
                opacity={0.5}
                letterSpacing="1"
              >
                DÍA {diaSeleccionado} ·{' '}
                {Math.round((completitudPorDia[diaSeleccionado] || 0) * 100)}% SELLADO
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}


function StatCard({ icon: Icon, label, value, sublabel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16,1,0.3,1] }}
      className="glass-card p-5 flex flex-col gap-2 border border-[var(--color-midnight)]/5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 font-serif">{label}</span>
        <Icon size={16} className="text-[var(--color-gold)] opacity-70" />
      </div>
      <span className="text-3xl font-black font-serif text-[var(--color-midnight)]">{value}</span>
      {sublabel && (
        <span className="text-[9px] font-semibold uppercase tracking-widest opacity-30">{sublabel}</span>
      )}
    </motion.div>
  );
}


function AreaChart({ habits, selectedDate }) {
  const areas = useMemo(() => {
    const mapa = {};
    habits.forEach(h => {
      const area = h.area || 'Dominio del Ser';
      if (!mapa[area]) mapa[area] = { total: 0, completados: 0 };
      mapa[area].total++;
      if (h.completedDays?.[selectedDate]) mapa[area].completados++;
    });
    return Object.entries(mapa).sort((a,b) => b[1].total - a[1].total);
  }, [habits, selectedDate]);

  if (areas.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 font-serif">
        Dominios Activos
      </h3>
      {areas.map(([area, { total, completados }], i) => {
        const ratio = total > 0 ? completados / total : 0;
        return (
          <motion.div
            key={area}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col gap-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold font-serif opacity-70">{area}</span>
              <span className="text-[10px] font-black text-[var(--color-gold)]">
                {completados}/{total}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-[var(--color-midnight)]/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--color-gold)]"
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}


/**
 * Stats:Espejo de Evolución — muestra el progreso histórico del alquimista
 * mediante el Calendario Ouroboros y estadísticas agregadas.
 */
function Stats() {
  const { habits, xp, level, bestStreak, perfectDaysCount, selectedDate } = useStore();

  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());

  
  const rachaMayor = useMemo(() => {
    return habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
  }, [habits]);

  
  const totalCompletadas = useMemo(() => {
    return habits.reduce((acc, h) => acc + Object.keys(h.completedDays || {}).length, 0);
  }, [habits]);

  
  const irMesAnterior = () => {
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };
  const irMesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
    else setMesActual(m => m + 1);
  };

  return (
    <div className="min-h-screen pb-32 pt-4 px-0">
      {}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 mb-8"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 font-serif">
          Espejo de
        </span>
        <h1 className="text-4xl font-black font-serif leading-none mt-1 text-[var(--color-midnight)]">
          Evolución
        </h1>
        <p className="text-[11px] opacity-40 mt-1 font-serif uppercase tracking-widest">
          El tiempo es el único alquimista verdadero
        </p>
      </motion.div>

      {}
      <div className="grid grid-cols-2 gap-3 px-4 mb-8">
        <StatCard
          icon={Flame}
          label="Racha Activa"
          value={rachaMayor}
          sublabel="días consecutivos"
          delay={0.1}
        />
        <StatCard
          icon={Trophy}
          label="Mejor Racha"
          value={bestStreak || 0}
          sublabel="máximo histórico"
          delay={0.15}
        />
        <StatCard
          icon={Target}
          label="Días Perfectos"
          value={perfectDaysCount || 0}
          sublabel="100% completitud"
          delay={0.2}
        />
        <StatCard
          icon={Zap}
          label="Esencia Total"
          value={xp}
          sublabel={`Nivel ${level}`}
          delay={0.25}
        />
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mx-4 glass-card p-6 mb-8 border border-[var(--color-midnight)]/5"
      >
        {}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={irMesAnterior}
            className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 font-serif block">
              Ciclo Lunar
            </span>
            <span className="text-base font-black font-serif text-[var(--color-midnight)]">
              {MESES[mesActual]} {anioActual}
            </span>
          </div>

          <button
            onClick={irMesSiguiente}
            className="w-8 h-8 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
            disabled={mesActual === hoy.getMonth() && anioActual === hoy.getFullYear()}
          >
            <ChevronRight size={18} className={
              mesActual === hoy.getMonth() && anioActual === hoy.getFullYear()
                ? 'opacity-20' : ''
            } />
          </button>
        </div>

        {}
        <OuroborosCalendar
          anio={anioActual}
          mes={mesActual}
          habitosActivos={habits}
        />

        {}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-gold)]" />
            <span className="text-[9px] font-semibold opacity-40 uppercase tracking-widest">Sellado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-gold)]/25" />
            <span className="text-[9px] font-semibold opacity-40 uppercase tracking-widest">Parcial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm border border-[var(--color-midnight)]/15" />
            <span className="text-[9px] font-semibold opacity-40 uppercase tracking-widest">Vacío</span>
          </div>
        </div>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mx-4 glass-card p-5 mb-8 border border-[var(--color-midnight)]/5"
      >
        <AreaChart habits={habits} selectedDate={selectedDate} />
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mx-4 glass-card p-5 border border-[var(--color-midnight)]/5 text-center"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 font-serif block mb-1">
          Actos Totales Consumados
        </span>
        <span className="text-5xl font-black font-serif text-[var(--color-midnight)]">
          {totalCompletadas}
        </span>
        <span className="text-[10px] opacity-30 block mt-1 uppercase tracking-widest font-serif">
          marcas en el tejido del tiempo
        </span>
      </motion.div>
    </div>
  );
}

export default Stats;
