import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import MonolithText from './MonolithText';

/**
 * ErrorBoundary v660.5: FALLA EN LA MATRIZ
 * - Estética Brutalista de Emergencia.
 * - Ley de Pureza v600.0 (Sin cursivas, sin redondeos).
 * - Calibración Maestra.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Falla en la Matriz:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-porcelain)] flex items-center justify-center p-12 text-center font-sans transition-colors duration-1000">
          <div className="bg-[var(--bg-porcelain)] border-4 border-red-600 p-16 shadow-2xl max-w-xl flex flex-col items-center gap-12 rounded-none">
            <div className="w-24 h-24 bg-red-600 flex items-center justify-center text-[var(--bg-porcelain)] shadow-xl">
              <AlertTriangle size={48} />
            </div>
            
            <div className="flex flex-col gap-6">
              <span className="text-[10px] font-black uppercase tracking-[1em] text-red-600 opacity-60 font-serif">Alerta Sistémica</span>
              <h2 className="text-6xl font-serif font-black leading-none uppercase tracking-tighter text-[var(--color-midnight)]">
                <MonolithText text="FALLA EN LA" isActive={true} /><br/>
                <span className="text-red-600"><MonolithText text="MATRIZ" isActive={true} /></span>
              </h2>
              <p className="text-xl font-serif opacity-50 uppercase font-black leading-relaxed px-8">
                La materia ha colapsado. Se ha detectado una disonancia crítica en la configuración de la realidad.
              </p>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="mt-4 w-full h-24 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] font-black uppercase tracking-[0.6em] text-[12px] flex items-center justify-center gap-6 hover:bg-red-600 transition-all shadow-solar-in border-none"
            >
              <RefreshCcw size={20} />
              PURIFICAR SISTEMA
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
