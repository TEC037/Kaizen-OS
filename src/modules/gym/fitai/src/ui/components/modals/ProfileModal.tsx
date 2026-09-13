import React, { useState } from 'react';
import { useUiData } from '../../data/store';
import { Icon } from '../Icon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, logoutUser, isAuthenticated, isDemoMode } = useUiData();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      setDeleteConfirmed(true);
      return;
    }
    setIsDeletingAccount(true);
    try {
      // Eliminar datos del usuario y cerrar sesión
      await logoutUser();
      localStorage.clear();
      window.location.reload();
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const weight = profile.weight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-between w-full">
          <span className="font-headline text-xs uppercase font-bold text-[#c3f400]">
            Perfil de Atleta
          </span>
          <div className="flex items-center gap-1.5">
            {isDemoMode && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#c3f400]/15 border border-[#c3f400]/25 text-[#c3f400] font-headline text-[9px] font-bold uppercase tracking-wider">
                Ejemplo
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="relative">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.firstName}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-[#c3f400]/40 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#272a31] ring-4 ring-[#c3f400]/40 shadow-xl flex items-center justify-center text-[#c3f400] font-headline text-2xl font-bold">
              {profile.firstName
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#4ae176] ring-2 ring-[#1d2026] flex items-center justify-center text-[10px] text-[#002109] font-bold">
            ✓
          </span>
        </div>

        <div>
          <h3 className="font-headline text-xl text-white font-bold">
            {profile.name}
          </h3>
          <p className="font-body text-xs text-[#c4c9ac] mt-0.5">
            {profile.phase} • {isAuthenticated ? profile.email : 'Perfil de ejemplo'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full pt-1">
          <div className="p-2.5 bg-[#101319] rounded-xl border border-white/[0.04]">
            <span className="font-headline text-xs text-[#c4c9ac]">Peso</span>
            <p className="font-headline text-sm font-bold text-white mt-0.5">
              {weight} kg
            </p>
          </div>
          <div className="p-2.5 bg-[#101319] rounded-xl border border-white/[0.04]">
            <span className="font-headline text-xs text-[#c4c9ac]">Grasa</span>
            <p className="font-headline text-sm font-bold text-[#4ae176] mt-0.5">
              {profile.bodyFatPercent !== null ? `${profile.bodyFatPercent}%` : '—'}
            </p>
          </div>
          <div className="p-2.5 bg-[#101319] rounded-xl border border-white/[0.04]">
            <span className="font-headline text-xs text-[#c4c9ac]">Racha</span>
            <p className="font-headline text-sm font-bold text-[#c3f400] mt-0.5">
              {profile.currentStreakDays}d
            </p>
          </div>
        </div>

        {isAuthenticated && !isDemoMode && (
          <div className="flex flex-col gap-2 w-full pt-1">
            <button
              type="button"
              onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
              className="text-[11px] font-headline text-[#c4c9ac] hover:text-white underline"
            >
              {showPrivacyPolicy ? 'Ocultar Política de Privacidad' : 'Ver Política de Privacidad y Datos'}
            </button>

            {showPrivacyPolicy && (
              <div className="p-3 bg-[#101319] rounded-xl text-left text-[10px] text-[#c4c9ac] space-y-1.5 border border-white/[0.04]">
                <p className="font-bold text-white">Política de Tratamiento de Datos (Punto Fuerte):</p>
                <p>1. Sus datos de entrenamiento, peso y progreso se usan exclusivamente para personalizar su experiencia y generar recomendaciones.</p>
                <p>2. No vendemos ni cedemos sus datos a terceros.</p>
                <p>3. Puede solicitar la exportación o eliminación total de su cuenta en cualquier momento.</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-2.5 rounded-full bg-[#2a1414] hover:bg-[#3a1c1c] text-[#ff9b9b] font-headline text-xs font-bold transition-colors border border-[#ff6b6b]/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="w-full py-2 rounded-full bg-red-950/40 hover:bg-red-900/60 text-red-400 font-headline text-[11px] font-semibold border border-red-500/20 cursor-pointer"
            >
              {deleteConfirmed
                ? isDeletingAccount
                  ? 'Eliminando datos…'
                  : '¿Confirmar eliminación permanente de cuenta?'
                : 'Eliminar mi cuenta y datos'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold hover:brightness-105"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
