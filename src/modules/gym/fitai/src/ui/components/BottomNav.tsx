import React from 'react';
import { TabType } from '../types';
import { Icon } from './Icon';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isTrainingActive?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  isTrainingActive = true,
}) => {
  const tabs: { id: TabType; label: string; icon: string; liveDot?: boolean }[] = [
    { id: 'ejercicios', label: 'Ejercicios', icon: 'fitness_center' },
    { id: 'rutina', label: 'Rutina', icon: 'format_list_bulleted' },
    { id: 'entrenamiento', label: 'Entrenamiento', icon: 'play_circle_filled', liveDot: isTrainingActive },
    { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom,0px)] bg-[#0b0e14]/92 backdrop-blur-xl border-t border-white/[0.06] shadow-[0_-2px_20px_rgba(0,0,0,0.6)]"
    >
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-w-[70px] h-12 px-2.5 rounded-full transition-all duration-200 relative ${
                isActive
                  ? 'text-[#c3f400] bg-[#272a31] shadow-[0_0_14px_rgba(195,244,0,0.2)]'
                  : 'text-[#c4c9ac] hover:text-[#e1e2eb]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon name={tab.icon} size={22} />
                {tab.liveDot && !isActive && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#4ae176] animate-pulse" />
                )}
              </div>
              <span className="font-headline text-[10px] uppercase font-bold tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
