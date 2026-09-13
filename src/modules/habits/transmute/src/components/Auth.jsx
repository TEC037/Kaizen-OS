import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Sun, Moon, FlaskConical, Sparkles, ShieldCheck } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { useStore } from '../store/useStore.jsx';
import { setThemeOnRoot } from '../lib/themeRoot';
import MonolithText from './MonolithText';
import AlchemyBackground from './AlchemyBackground';

/**
 * AUTH v6.0: MOBILE-FIRST & ELEGANCIA MÍSTICA
 * - Redimensionamiento de todos los elementos para un ajuste perfecto en móviles.
 * - Estética sublimada: menos pesada, más elegante.
 * - Enlace de registro restaurado a una estética textual premium que no rompe la armonía.
 */
function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { theme, setTheme, setSession, initializeSync } = useStore();

  useEffect(() => {
    setThemeOnRoot(theme);
  }, [theme]);

  const toggleTheme = () => {
    haptics.impactLight();
    setTheme(theme === 'nigredo' ? 'citrinitas' : 'nigredo');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    haptics.impactMedium();
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) {
          setSession(data.session);
          await initializeSync();
        }
        toast.info("RESONANCIA ESTABLECIDA", {
          description: "La materia ha reconocido tu firma vibracional.",
        });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("VERIFICACIÓN ENVIADA", {
          description: "Revisa tu canal de identidad para sellar el pacto.",
        });
      }
    } catch (error) {
      haptics.notificationError();
      toast.error("VIBRACIÓN DISONANTE", {
        description: error.message || "La matriz ha rechazado la integración.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center p-4 py-8 md:p-8 relative overflow-x-hidden overflow-y-auto transition-colors duration-1000">
      <AlchemyBackground />

      {}
      <div className="absolute top-4 right-4 md:fixed md:top-6 md:right-6 z-50">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 md:w-12 md:h-12 glass-card rounded-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-none shadow-md"
          title="Cambiar Fase del Atanor"
        >
          {theme === 'nigredo' ? <Sun size={18} className="text-[var(--color-gold)]" /> : <Moon size={18} className="opacity-40" />}
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="glass-card w-full max-w-sm md:max-w-md p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-solar-out relative z-10 flex flex-col gap-6 my-auto shrink-0"
      >
        {}
        <header className="flex flex-col items-center text-center gap-4">
           <div className="w-14 h-14 bg-[var(--color-gold)]/10 rounded-2xl flex items-center justify-center text-[var(--color-gold)] shadow-inner">
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <FlaskConical className="w-7 h-7" strokeWidth={1.5} />
              </motion.div>
           </div>
           
           <div className="flex flex-col gap-1">
             <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tighter leading-none uppercase">
                <MonolithText text={isLogin ? "Portal de" : "Génesis de"} isActive={true} /><br/>
                <MonolithText text="Transmutación" isActive={true} />
             </h1>
             <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 font-serif mt-1">
               {isLogin ? "Acceso al Sistema" : "Sacrificio de la Forma Original"}
             </p>
           </div>
        </header>

        {}
        <form onSubmit={handleAuth} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-4">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adepto@transmute.com"
                    required
                    className="w-full bg-[var(--color-midnight)]/5 hover:bg-[var(--color-midnight)]/10 focus:bg-[var(--bg-porcelain)] h-12 md:h-14 px-5 rounded-2xl text-sm md:text-base font-bold outline-none transition-all uppercase font-serif text-[var(--color-midnight)] placeholder:opacity-20"
                  />
               </div>

               <div className="flex flex-col gap-2 relative">
                  <label className="text-[9px] font-black uppercase tracking-widest opacity-40 px-4">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[var(--color-midnight)]/5 hover:bg-[var(--color-midnight)]/10 focus:bg-[var(--bg-porcelain)] h-12 md:h-14 px-5 rounded-2xl text-base md:text-lg font-bold outline-none transition-all font-serif text-[var(--color-midnight)] placeholder:opacity-20 tracking-wider"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity">
                      {showPass ? <EyeOff size={18} className="text-[var(--color-midnight)]" /> : <Eye size={18} className="text-[var(--color-midnight)]" />}
                    </button>
                  </div>
               </div>
            </div>

            {}
            {isLogin && (
              <div className="flex items-center justify-center gap-3">
                 <button 
                  type="button"
                  onClick={() => { setRememberMe(!rememberMe); haptics.impactLight(); }} 
                  className={`w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center ${rememberMe ? 'bg-[var(--color-gold)] border-[var(--color-gold)]' : 'border-[var(--color-midnight)]/20'}`}
                 >
                    {rememberMe && <ShieldCheck size={12} className="text-white" />}
                 </button>
                 <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">Permanecer en Sintonía</span>
              </div>
            )}

            {}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full h-14 md:h-16 bg-transparent border border-[var(--color-midnight)]/10 hover:border-[var(--color-gold)]/50 text-[var(--color-midnight)] rounded-2xl flex items-center justify-center gap-3 font-serif font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[12px] md:text-[13px] transition-all hover:bg-[var(--color-gold)]/5 shadow-sm"
            >
               <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 1, rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <motion.div key={isLogin ? 'login' : 'register'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                       <ArrowRight size={16} className="text-[var(--color-gold)]" />
                       <span>{isLogin ? 'INICIAR TRANSMUTACIÓN' : 'ACTIVAR ATANOR'}</span>
                    </motion.div>
                  )}
               </AnimatePresence>
            </motion.button>
        </form>

        {}
        <footer className="pt-4 border-t border-black/5 flex flex-col items-center gap-1">
           <button 
             onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); haptics.impactLight(); }}
             type="button"
             className="text-center group flex flex-col items-center gap-1 pb-1"
           >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-50 transition-opacity">
                {isLogin ? "¿Aún no has sido iniciado?" : "¿Ya formas parte del Concilio?"}
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-gold)] font-serif border-b border-transparent group-hover:border-[var(--color-gold)]/40 transition-all">
                {isLogin ? "FORJAR IDENTIDAD" : "REGRESAR AL SANCTUM"}
              </span>
           </button>
           
        </footer>
      </motion.div>
    </div>
  );
}

export default Auth;
