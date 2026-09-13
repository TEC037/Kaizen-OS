import React, { useState } from 'react';
import { useUiData } from '../data/store';
import { Icon } from './Icon';

type AuthMode = 'login' | 'register' | 'recovery';

const inputClass =
  'w-full pl-4 pr-10 py-3 bg-[#272a31] rounded-xl font-body text-sm text-[#e1e2eb] placeholder:text-[#c4c9ac]/70 focus:outline-none focus:ring-1 focus:ring-[#c3f400] transition-colors shadow-sm border border-white/[0.04]';

export const AuthScreen: React.FC = () => {
  const ui = useUiData();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);

    if (mode !== 'recovery' && !email.trim()) {
      setError('Introduce tu correo electrónico.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Introduce tu nombre.');
      return;
    }
    if (mode !== 'recovery' && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const res = await ui.login(email, password);
        if (res.error) setError(res.error);
      } else if (mode === 'register') {
        const res = await ui.register(email, password, name);
        if (res.error) setError(res.error);
      } else {
        const res = await ui.requestPasswordReset(email);
        if (res.error) {
          setError(res.error);
        } else {
          setInfo('Correo de recuperación enviado si la cuenta existe. Revisa tu bandeja.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // La demo vive aislada en /demo; navegamos a esa edición sin simular
      // una cuenta real ni golpear Supabase.
      window.location.assign('./demo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101319] text-[#e1e2eb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1d2026] p-5 sm:p-6 border border-white/[0.1] shadow-2xl flex flex-col gap-4">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1d2026] flex items-center justify-center border border-white/[0.08] shadow-[0_0_16px_rgba(195,244,0,0.15)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c3f400"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 drop-shadow-[0_0_6px_rgba(195,244,0,0.6)]"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h1 className="font-headline text-2xl text-white font-bold tracking-tight">
              Punto Fuerte
            </h1>
            <p className="font-body text-xs text-[#c4c9ac] mt-0.5">
              Tu entrenamiento, tus datos, sin sorpresas.
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#101319] border border-white/[0.05]">
          {(
            [
              { id: 'login', label: 'Entrar' },
              { id: 'register', label: 'Registrarse' },
            ] as { id: AuthMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              type="button"
              className={`flex-1 py-2 rounded-lg font-headline text-xs font-bold transition-all cursor-pointer ${
                mode === m.id
                  ? 'bg-[#c3f400] text-[#161e00] shadow-md'
                  : 'text-[#c4c9ac] hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#2a1414] border border-[#ff6b6b]/25 text-[#ff9b9b] font-body text-xs">
            <Icon name="error" size={16} className="mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#13241a] border border-[#4ae176]/25 text-[#7ae0a0] font-body text-xs">
            <Icon name="check_circle" size={16} className="mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col gap-2.5">
          {mode === 'register' && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              autoComplete="name"
              className={inputClass}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            autoComplete="email"
            className={inputClass}
          />
          {mode !== 'recovery' && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Contraseña (mín. 6 caracteres)' : 'Contraseña'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              className={inputClass}
            />
          )}
        </div>

        {mode !== 'recovery' && (
          <button
            onClick={switchMode.bind(null, 'recovery')}
            type="button"
            className="self-start font-headline text-xs text-[#c4c9ac] hover:text-[#c3f400] hover:underline font-semibold cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-sm font-bold shadow-[0_0_20px_rgba(195,244,0,0.25)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting
            ? 'Procesando…'
            : mode === 'login'
              ? 'Iniciar sesión'
              : mode === 'register'
                ? 'Crear cuenta'
                : 'Enviar enlace de recuperación'}
        </button>

        {mode !== 'recovery' && (
          <button
            type="button"
            onClick={handleDemo}
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-[#272a31] hover:bg-[#32353c] text-white font-headline text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer border border-white/[0.06] flex items-center justify-center gap-2"
          >
            <Icon name="science" size={18} className="text-[#c3f400]" />
            Explorar ejemplo
          </button>
        )}
      </div>
    </div>
  );
};