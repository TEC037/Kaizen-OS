import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { haptics } from '../utils/haptics';
import { getRango, getProximoRango, getProgresoEnRango } from '../domain/InvocadorSystem';
import { Bell, BellOff, Vibrate, Moon, Sun, LogOut, AlertTriangle, Trash2, ChevronRight, Globe, Lock, Check, Pencil, X, Compass } from 'lucide-react';


const NOMBRE_DEFAULT = 'Adept #001';


function AlchemyToggle({ activo, onToggle, idHtml }) {
  return (
    <motion.button
      id={idHtml}
      onClick={onToggle}
      aria-pressed={activo}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 border
        ${activo
          ? 'bg-[var(--color-midnight)] border-[var(--color-midnight)]'
          : 'bg-transparent border-[var(--color-midnight)]/20'
        }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`absolute top-0.5 w-5 h-5 rounded-full
          ${activo ? 'bg-[var(--color-gold)] left-[calc(100%-22px)]' : 'bg-[var(--color-midnight)]/20 left-0.5'}`}
      />
    </motion.button>
  );
}


function FilaAjuste({ icono: Icono, titulo, subtitulo, accion, peligro = false, children }) {
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={accion}
      className={`flex items-center gap-4 py-4 px-1 ${accion ? 'cursor-pointer' : 'cursor-default'}
        ${peligro ? 'opacity-70 hover:opacity-100' : ''} transition-opacity`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
        ${peligro ? 'bg-red-500/10 border border-red-400/20' : 'bg-[var(--color-midnight)]/5 border border-[var(--color-midnight)]/8'}`}>
        <Icono size={16} className={peligro ? 'text-red-500' : 'opacity-60'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-black font-serif ${peligro ? 'text-red-500' : 'text-[var(--color-midnight)]'}`}>
          {titulo}
        </p>
        {subtitulo && (
          <p className="text-[9px] opacity-60 font-semibold uppercase tracking-widest mt-0.5 leading-tight">
            {subtitulo}
          </p>
        )}
      </div>
      {children
        ? <div className="flex-shrink-0">{children}</div>
        : accion && <ChevronRight size={14} className="opacity-20 flex-shrink-0" />
      }
    </motion.div>
  );
}


function Seccion({ titulo, children }) {
  return (
    <div className="mb-6">
      <span className="text-[9px] font-black uppercase tracking-[0.45em] opacity-60 font-serif px-1 block mb-1">
        {titulo}
      </span>
      <div className="glass-card border border-[var(--color-midnight)]/5 divide-y divide-[var(--color-midnight)]/5 px-4">
        {children}
      </div>
    </div>
  );
}


function ModalConfirmacion({ titulo, descripcion, textoConfirmar, onConfirmar, onCancelar, cargando }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-end justify-center p-4 bg-[var(--color-midnight)]/70 backdrop-blur-sm"
      onClick={onCancelar}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="w-full max-w-sm rounded-3xl p-6 bg-[var(--bg-porcelain)] border border-red-400/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-400/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h3 className="text-xl font-black font-serif text-center text-[var(--color-midnight)] mb-2">
          {titulo}
        </h3>
        <p className="text-xs text-center opacity-50 leading-relaxed mb-6">
          {descripcion}
        </p>
        <button
          onClick={onConfirmar}
          disabled={cargando}
          className="w-full py-3.5 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-3 disabled:opacity-50 transition-opacity hover:bg-red-600"
        >
          {cargando ? 'Procesando...' : textoConfirmar}
        </button>
        <button
          onClick={onCancelar}
          className="w-full py-3 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
        >
          Cancelar
        </button>
      </motion.div>
    </motion.div>
  );
}


/**
 * Muestra el rango actual del usuario, el ícono progresivo y la barra de
 * avance hacia el siguiente nivel. El rango es una función directa del XP
 * acumulado — que a su vez es función del esfuerzo real.
 */
function TarjetaRango({ xp }) {
  const rangoActual  = getRango(xp);
  const proximoRango = getProximoRango(xp);
  const progreso     = getProgresoEnRango(xp);

  
  const xpRestante = proximoRango ? proximoRango.min - xp : 0;

  return (
    <div className="glass-card border border-[var(--color-midnight)]/5 p-5 mb-6">
      <span className="text-[9px] font-black uppercase tracking-[0.45em] opacity-30 font-serif block mb-4">
        Rango de Invocador
      </span>

      {}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${rangoActual.color}18`, border: `1.5px solid ${rangoActual.color}40` }}
        >
          {rangoActual.icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p
            className="text-lg font-black font-serif leading-tight"
            style={{ color: rangoActual.color }}
          >
            {rangoActual.nombre}
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-60 mt-0.5">
            {rangoActual.subtitulo}
          </p>
          <p className="text-[10px] opacity-40 mt-1 leading-snug font-serif italic line-clamp-2">
            {rangoActual.descripcion}
          </p>
        </div>
      </div>

      {}
      {proximoRango ? (
        <>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[8px] opacity-30 font-semibold uppercase tracking-widest">
              {rangoActual.nombre}
            </span>
            <span className="text-[8px] font-black opacity-50 uppercase tracking-widest"
              style={{ color: proximoRango.color }}>
              {proximoRango.icon} {proximoRango.nombre}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-midnight)]/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: rangoActual.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progreso * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <p className="text-[8px] opacity-25 mt-1.5 text-right font-semibold">
            {xpRestante.toLocaleString()} XP para {proximoRango.nombre}
          </p>
        </>
      ) : (
        <div className="text-center py-2">
          <span className="text-[9px] font-black uppercase tracking-widest"
            style={{ color: rangoActual.color }}>
            Rango Máximo Alcanzado
          </span>
        </div>
      )}
    </div>
  );
}


/**
 * Ajustes: Panel de configuración del usuario.
 *
 * Fix aplicado: si el nombre es el valor por defecto ('Adept #001'),
 * el campo se abre automáticamente en modo edición para que el usuario
 * complete su identidad sin fricciones en la primera visita.
 */
function Ajustes() {
  const {
    settings,
    updateSettings,
    toggleTheme,
    theme,
    signOut,
    hardResetAccount,
    isResetting,
    session,
    xp,
  } = useStore();

  
  const esNombreDefault = !settings.displayName || settings.displayName === NOMBRE_DEFAULT;

  const [editandoNombre, setEditandoNombre]   = useState(esNombreDefault);
  const [nombreTemporal, setNombreTemporal]   = useState(
    esNombreDefault ? '' : (settings.displayName || '')
  );
  const [modalReset, setModalReset]           = useState(false);
  const [modalSignOut, setModalSignOut]       = useState(false);
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  const isDark = theme === 'nigredo';

  
  useEffect(() => {
    if (!editandoNombre) {
      setNombreTemporal(settings.displayName || '');
    }
  }, [settings.displayName]);

  
  const guardarNombre = async () => {
    const nombre = nombreTemporal.trim();
    if (!nombre || nombre.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (nombre.length > 30) {
      toast.error('Máximo 30 caracteres');
      return;
    }
    setGuardandoNombre(true);
    try {
      await updateSettings({ displayName: nombre });
      setEditandoNombre(false);
    } catch (e) {
      toast.error('Error al guardar el nombre');
    } finally {
      setGuardandoNombre(false);
    }
  };

  const toggleNotificaciones = () => updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  const toggleVibracion = () => {
    const nuevo = !settings.vibrationEnabled;
    updateSettings({ vibrationEnabled: nuevo });
    if (nuevo) haptics.impactMedium();
  };
  const togglePublico = () => updateSettings({ isPublic: !settings.isPublic });
  const toggleModoGuiado = () => updateSettings({ isGuidedMode: !settings.isGuidedMode });

  const ejecutarReset = async () => {
    const exito = await hardResetAccount();
    if (exito) setModalReset(false);
  };

  const ejecutarSignOut = async () => {
    setModalSignOut(false);
    await signOut();
  };

  return (
    <div className="min-h-screen pb-32 pt-4">
      {}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-4 mb-8"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30 font-serif">
          Configuración del
        </span>
        <h1 className="text-4xl font-black font-serif leading-none mt-1 text-[var(--color-midnight)]">
          Transmutador
        </h1>
        <p className="text-[11px] opacity-40 mt-1 font-serif uppercase tracking-widest">
          Calibra tu sistema de identidad y comportamiento
        </p>
      </motion.div>

      <div className="px-4">

        {}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.45em] opacity-30 font-serif px-1 block mb-1">
            Progresión
          </span>
          <TarjetaRango xp={xp} />
        </motion.div>

        {}
        <Seccion titulo="Identidad">
          {}
          <div className="py-4">
            <div className="flex items-start gap-4">
              {}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{
                  backgroundColor: `${getRango(xp).color}18`,
                  border: `1px solid ${getRango(xp).color}30`,
                }}
              >
                {getRango(xp).icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black font-serif text-[var(--color-midnight)]">
                  Nombre de Registro
                </p>

                {editandoNombre ? (
                  <div className="mt-2">
                    {esNombreDefault && (
                      <p className="text-[9px] opacity-40 mb-2 font-serif">
                        Elige cómo te identificará el sistema.
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        id="input-nombre-registro"
                        type="text"
                        value={nombreTemporal}
                        onChange={(e) => setNombreTemporal(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && guardarNombre()}
                        maxLength={30}
                        autoFocus
                        placeholder="Tu nombre..."
                        className="flex-1 bg-[var(--color-midnight)]/5 border border-[var(--color-midnight)]/15 rounded-lg px-3 py-2 text-sm font-serif focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors placeholder:opacity-30"
                      />
                      <button
                        onClick={guardarNombre}
                        disabled={guardandoNombre || !nombreTemporal.trim()}
                        className="w-8 h-8 rounded-lg bg-[var(--color-midnight)] text-[var(--bg-porcelain)] flex items-center justify-center disabled:opacity-30 transition-opacity"
                      >
                        <Check size={14} />
                      </button>
                      {!esNombreDefault && (
                        <button
                          onClick={() => {
                            setEditandoNombre(false);
                            setNombreTemporal(settings.displayName);
                          }}
                          className="w-8 h-8 rounded-lg bg-[var(--color-midnight)]/8 flex items-center justify-center opacity-50"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] opacity-40 font-semibold uppercase tracking-widest">
                      {settings.displayName}
                    </p>
                    <button
                      onClick={() => {
                        setEditandoNombre(true);
                        setNombreTemporal(settings.displayName);
                      }}
                      className="opacity-30 hover:opacity-70 transition-opacity"
                    >
                      <Pencil size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {}
          <FilaAjuste
            icono={settings.isPublic ? Globe : Lock}
            titulo={settings.isPublic ? 'Perfil Público' : 'Perfil Privado'}
            subtitulo={settings.isPublic ? 'Visible en el Conclave' : 'Solo tú puedes verte'}
          >
            <AlchemyToggle
              idHtml="toggle-perfil-publico"
              activo={settings.isPublic}
              onToggle={togglePublico}
            />
          </FilaAjuste>
        </Seccion>

        {}
        <Seccion titulo="Señales del Sistema">
          <FilaAjuste
            icono={settings.notificationsEnabled ? Bell : BellOff}
            titulo="Notificaciones"
            subtitulo="Recordatorios y alertas de hábitos"
          >
            <AlchemyToggle
              idHtml="toggle-notificaciones"
              activo={settings.notificationsEnabled ?? true}
              onToggle={toggleNotificaciones}
            />
          </FilaAjuste>

          <FilaAjuste
            icono={Vibrate}
            titulo="Vibración"
            subtitulo="Respuesta háptica en acciones"
          >
            <AlchemyToggle
              idHtml="toggle-vibracion"
              activo={settings.vibrationEnabled ?? true}
              onToggle={toggleVibracion}
            />
          </FilaAjuste>

          <FilaAjuste
            icono={Compass}
            titulo={settings.isGuidedMode ? 'Modo Guiado' : 'Modo Libre'}
            subtitulo={settings.isGuidedMode ? 'Tavira estructura tu interfaz' : 'Control absoluto de la matriz'}
          >
            <AlchemyToggle
              idHtml="toggle-modo-guiado"
              activo={settings.isGuidedMode ?? true}
              onToggle={toggleModoGuiado}
            />
          </FilaAjuste>
        </Seccion>

        {}
        <Seccion titulo="Apariencia">
          <FilaAjuste
            icono={isDark ? Moon : Sun}
            titulo={isDark ? 'Modo Oscuro' : 'Modo Claro'}
            subtitulo="Alterna entre los dos modos visuales"
            accion={toggleTheme}
          />
        </Seccion>

        {}
        <Seccion titulo="Acciones Críticas">
          <FilaAjuste
            icono={LogOut}
            titulo="Cerrar Sesión"
            subtitulo="Tu progreso permanece en la nube"
            accion={() => setModalSignOut(true)}
            peligro
          />
          <FilaAjuste
            icono={Trash2}
            titulo="Reinicio Total"
            subtitulo="Borra todos los datos. Irreversible."
            accion={() => setModalReset(true)}
            peligro
          />
        </Seccion>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-6"
        >
          <p className="text-[8px] font-semibold opacity-20 uppercase tracking-[0.4em] font-serif">
            {session?.user?.email || '—'}
          </p>
          <p className="text-[8px] opacity-15 uppercase tracking-widest mt-1">
            TRANSMUTE · Sistema de Progresión v2.0
          </p>
        </motion.div>
      </div>

      {}
      <AnimatePresence>
        {modalReset && (
          <ModalConfirmacion
            titulo="Reinicio Total"
            descripcion="Esta acción elimina permanentemente todos tus hábitos, rachas, logros y XP — tanto local como en la nube. No existe forma de recuperar los datos. ¿Confirmas el reinicio?"
            textoConfirmar="Reiniciar Todo"
            onConfirmar={ejecutarReset}
            onCancelar={() => setModalReset(false)}
            cargando={isResetting}
          />
        )}
        {modalSignOut && (
          <ModalConfirmacion
            titulo="Cerrar Sesión"
            descripcion="Tu sesión se cerrará en este dispositivo. Todos tus datos están seguros en la nube y podrás recuperarlos al volver a iniciar sesión."
            textoConfirmar="Cerrar Sesión"
            onConfirmar={ejecutarSignOut}
            onCancelar={() => setModalSignOut(false)}
            cargando={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Ajustes;
