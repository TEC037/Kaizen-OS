import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Dashboard  = React.lazy(() => import('./components/AlchemistDashboard'));
const Stats      = React.lazy(() => import('./components/Stats'));
const Logros     = React.lazy(() => import('./components/Logros'));
const Conclave   = React.lazy(() => import('./components/Conclave'));
const Ajustes    = React.lazy(() => import('./components/Ajustes'));
const Auth       = React.lazy(() => import('./components/Auth'));
const Onboarding = React.lazy(() => import('./components/ForgeOnboarding'));
import AppLayout from './components/AppLayout';
import { supabase, IS_LOCAL_MODE } from './lib/supabase';
import { initAnalytics } from './utils/analytics';
import ErrorBoundary from './components/ErrorBoundary';
import BugReportFAB from './components/BugReportFAB';
import ScrollToTop from './components/ScrollToTop';
import { SystemRepository } from './repositories/SystemRepository';
import { useStore } from './store/useStore';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, setSession, initializeSync, settings, isSessionLoading, isResetting } = useStore();

  useEffect(() => {
    initAnalytics();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        initializeSync();
        if (!IS_LOCAL_MODE) {
          SystemRepository.initializeApp(newSession.user.id).catch(e => console.error("Error init:", e));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [setSession, initializeSync]);

  useEffect(() => {
    const urlListener = null;
    return () => {
      if (urlListener) urlListener();
    };
  }, [navigate]);

  useEffect(() => {
    if (session && settings && !isSessionLoading && !isResetting) {
      const hasFinished = settings.hasFinishedOnboarding === true;
      const isConfigPath = location.pathname === '/onboarding';

      if (!hasFinished && !isConfigPath) {
        navigate('/onboarding', { replace: true });
      } else if (hasFinished && (isConfigPath || location.pathname === '/auth')) {
        navigate('/', { replace: true });
      }
    }
  }, [session, settings?.hasFinishedOnboarding, location.pathname, navigate, isSessionLoading, isResetting]);

  // PROTECCIÓN ABSOLUTA: Si no hay sesión o se está reiniciando, solo existe Auth
  if ((!isSessionLoading && !session) || isResetting) return <Auth />;

  // Si está cargando sesión o no hay settings todavía, mostrar splash
  if (isSessionLoading || (session && !settings)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-porcelain)]">
        <div className="flex flex-col items-center gap-8">
          <div className="w-12 h-12 border border-black/5 border-t-[var(--color-gold)] rounded-none animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 animate-pulse font-serif">Sintonizando Realidad</span>
        </div>
      </div>
    );
  }

  
  const isFullscreenPage = location.pathname === '/onboarding' || location.pathname === '/auth';

  const AppContent = (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-porcelain)]">
        <div className="flex flex-col items-center gap-8">
          <div className="w-12 h-12 border border-black/5 border-t-[var(--color-gold)] rounded-none animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 animate-pulse font-serif">Sintonizando Realidad</span>
        </div>
      </div>
    }>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {}
          <Route path="/"          element={<PageWrapper><Dashboard /></PageWrapper>} />
          {}
          <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />
          {}
          <Route path="/stats"     element={<PageWrapper><Stats /></PageWrapper>} />
          {}
          <Route path="/logros"    element={<PageWrapper><Logros /></PageWrapper>} />
          {}
          <Route path="/conclave"  element={<PageWrapper><Conclave /></PageWrapper>} />
          {}
          <Route path="/ajustes"   element={<PageWrapper><Ajustes /></PageWrapper>} />
          {}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </React.Suspense>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-porcelain)] text-[var(--color-midnight)] selection:bg-[var(--color-gold)] selection:text-white">
      <ErrorBoundary>
        <ScrollToTop />
        {isFullscreenPage ? AppContent : <AppLayout>{AppContent}</AppLayout>}
        
        {}
        {!isSessionLoading && !session && location.pathname !== '/auth' && (
          <div className="fixed inset-0 z-[1000] bg-[var(--bg-porcelain)] flex flex-col items-center justify-center p-12 text-[var(--color-midnight)]">
            <span className="text-[12px] font-black uppercase tracking-[1em] opacity-40 mb-10 font-serif">Aviso del Adepto</span>
            <h1 className="text-7xl font-serif font-black tracking-tighter uppercase mb-6">Impureza en el Atanor</h1>
            <p className="text-xl font-serif opacity-40 uppercase font-black text-center max-w-xl">
              "La materia no ha podido ser procesada. El vínculo con el centro de la Gran Obra se ha debilitado."
            </p>
            <button onClick={() => window.location.reload()} className="mt-16 transmute-btn h-20 px-16 !bg-[var(--color-midnight)] !text-[var(--bg-porcelain)]">
               Reencender el Fuego
            </button>
          </div>
        )}
      </ErrorBoundary>

      {}
      <svg style={{ visibility: 'hidden', position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
            <feBlend in="SourceGraphic" in2="gooey" />
          </filter>
          <filter id="glitch-displacement">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.9" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}


function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default App;
