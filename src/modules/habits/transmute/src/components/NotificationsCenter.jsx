import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, Sparkles, Swords, Check, X } from 'lucide-react';

/**
 * NotificationsCenter.jsx — EL HERALDO REAL
 * Panel desplegable de notificaciones con Realtime.
 */
const NotificationsCenter = ({ isOpen, onClose }) => {
  const { session } = useStore();
  const { notifications, unreadCount, markAllAsRead, loadNotifications } = useLeaderboardStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.id && isOpen) {
      loadNotifications(session.user.id);
    }
  }, [session?.user?.id, isOpen]);

  const handleAction = (link) => {
    if (link) navigate(link);
    onClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'follow': return <Users size={14} className="text-blue-400" />;
      case 'reaction': return <Sparkles size={14} className="text-[var(--color-gold)]" />;
      case 'challenge_goal': return <Swords size={14} className="text-red-400" />;
      default: return <Bell size={14} className="opacity-30" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {}
          <div className="fixed inset-0 z-[100]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-32 right-12 w-96 z-[110] bg-[var(--bg-porcelain)] shadow-2xl border border-black/5 flex flex-col overflow-hidden"
          >
            {}
            <div className="p-8 border-b border-black/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-black uppercase tracking-tight leading-none">
                  El Heraldo
                </h3>
                <span className="text-[11px] font-black uppercase tracking-widest opacity-60 mt-1 block">
                  {unreadCount} nuevas resonancias
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => markAllAsRead(session?.user?.id)}
                  className="w-8 h-8 flex items-center justify-center opacity-20 hover:opacity-100 transition-all hover:text-emerald-500"
                  title="Marcar todo como leído"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center opacity-20 hover:opacity-100 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {}
            <div className="max-h-[500px] overflow-y-auto no-scrollbar bg-black/5">
              {notifications.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center gap-6">
                  <Bell size={32} className="opacity-10" />
                  <span className="text-[11px] font-black font-serif uppercase opacity-60 tracking-widest leading-relaxed">
                    El Éter está en silencio.<br />No hay nuevas señales.
                  </span>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleAction(n.link)}
                    className={`w-full p-8 flex gap-6 text-left border-b border-black/5 transition-all relative ${
                      !n.is_read ? 'bg-white' : 'opacity-60 grayscale hover:grayscale-0'
                    }`}
                  >
                    {!n.is_read && (
                      <div className="absolute top-8 left-0 w-1 h-12 bg-[var(--color-gold)]" />
                    )}
                    
                    {}
                    <div className="w-12 h-12 flex-shrink-0 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] flex items-center justify-center font-black shadow-lg font-serif">
                      {n.actor?.display_name?.[0].toUpperCase() || getIcon(n.type)}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-sm font-serif font-black uppercase tracking-tight">
                          {n.title}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-70 font-serif">
                        {n.content}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {}
            {}
            <button
              onClick={() => handleAction('/conclave')}
              className="p-6 bg-[var(--color-midnight)] text-[var(--bg-porcelain)] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[var(--color-gold)] transition-all"
            >
              Entrar al Conclave
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsCenter;
