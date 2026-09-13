import React from 'react';
import { useUiData } from '../data/store';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  hasUnreadNotifications?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
  hasUnreadNotifications = true,
}) => {
  const { profile, isDemoMode } = useUiData();
  const initials = profile.firstName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#101319]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)] pt-[env(safe-area-inset-top,0px)] border-b border-white/[0.04]">
      <div className="h-16 max-w-2xl mx-auto px-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1d2026] flex items-center justify-center p-1 border border-white/[0.08] shadow-[0_0_12px_rgba(195,244,0,0.15)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c3f400"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 drop-shadow-[0_0_6px_rgba(195,244,0,0.6)]"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="font-headline text-xl text-white tracking-tight font-bold">
            Punto Fuerte
          </span>
          {isDemoMode && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#c3f400]/15 border border-[#c3f400]/25 text-[#c3f400] font-headline text-[9px] font-bold uppercase tracking-wider">
              Ejemplo
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            id="notifications-btn"
            onClick={onOpenNotifications}
            aria-label="Notificaciones"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#c4c9ac] hover:text-white hover:bg-[#1d2026] transition-colors relative"
          >
            <Icon name="notifications" size={22} />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#c3f400] ring-2 ring-[#101319] shadow-[0_0_6px_#c3f400]"></span>
            )}
          </button>

          <button
            id="profile-btn"
            onClick={onOpenProfile}
            aria-label="Perfil de usuario"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity ring-1 ring-white/10 hover:ring-[#c3f400]/40 overflow-hidden"
          >
            {profile.avatarUrl ? (
              <img
                alt={profile.firstName}
                className="w-8 h-8 rounded-full object-cover"
                src={profile.avatarUrl}
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-[#272a31] text-[#c3f400] flex items-center justify-center font-headline text-xs font-bold">
                {initials}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};