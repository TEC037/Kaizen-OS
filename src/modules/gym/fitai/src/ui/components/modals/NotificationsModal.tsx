import React from 'react';
import { Icon } from '../Icon';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onClear,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: '¡Hora de entrenar!',
      desc: 'Tu sesión programada "Torso Potencia" está lista para las 18:30.',
      time: 'Hace 15 min',
      icon: 'fitness_center',
      color: '#c3f400',
    },
    {
      id: 2,
      title: 'Nuevo Récord Personal',
      desc: 'Superaste tu marca en Press de Banca: 105 kg (+2.5 kg).',
      time: 'Hace 4 días',
      icon: 'emoji_events',
      color: '#4ae176',
    },
    {
      id: 3,
      title: 'Objetivo de descanso cumplido',
      desc: 'Registraste 7.8 horas de sueño profundo. Estado de recuperación: 94%.',
      time: 'Ayer 08:00',
      icon: 'bedtime',
      color: '#7bd0ff',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1d2026] p-5 border border-white/[0.1] shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="notifications" size={22} className="text-[#c3f400]" />
            <h3 className="font-headline text-lg text-white font-bold">
              Notificaciones
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-[#272a31]"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-[#191c22] border border-white/[0.04] flex items-start gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${n.color}20`, color: n.color }}
              >
                <Icon name={n.icon} size={18} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-xs font-bold text-white">
                  {n.title}
                </span>
                <span className="font-body text-xs text-[#c4c9ac] mt-0.5 leading-snug">
                  {n.desc}
                </span>
                <span className="font-headline text-[10px] text-[#8e9379] mt-1">
                  {n.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClear();
              onClose();
            }}
            className="flex-1 py-2 rounded-full bg-[#272a31] text-[#c4c9ac] font-headline text-xs font-semibold hover:text-white"
          >
            Marcar leídas
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-full bg-[#c3f400] text-[#161e00] font-headline text-xs font-bold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
