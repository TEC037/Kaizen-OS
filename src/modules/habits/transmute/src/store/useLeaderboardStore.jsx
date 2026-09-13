import { create } from 'zustand';
import { LeaderboardRepository, NotificationRepository } from '../repositories/LeaderboardRepository';
import { supabase } from '../lib/supabase';

/**
 * useLeaderboardStore.jsx — EL REGISTRO SUPREMO
 * Gestión de ranking global y sistema de notificaciones en tiempo real.
 */
export const useLeaderboardStore = create((set, get) => ({
  
  
  topAdeptos: [],
  myRanking: null,
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  
  
  loadLeaderboard: async (userId) => {
    set({ isLoading: true });
    const [top, me] = await Promise.all([
      LeaderboardRepository.getTopAdeptos(),
      userId ? LeaderboardRepository.getMyRanking(userId) : Promise.resolve(null)
    ]);
    set({ topAdeptos: top, myRanking: me, isLoading: false });
  },

  

  loadNotifications: async (userId) => {
    if (!userId) return;
    const [list, count] = await Promise.all([
      NotificationRepository.getNotifications(userId),
      NotificationRepository.getUnreadCount(userId)
    ]);
    set({ notifications: list, unreadCount: count });
  },

  markAllAsRead: async (userId) => {
    const { notifications } = get();
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await NotificationRepository.markAsRead(unreadIds);
      set({ 
        unreadCount: 0, 
        notifications: notifications.map(n => ({ ...n, is_read: true }))
      });
    }
  },

  /**
   * Suscripción Realtime a nuevas notificaciones
   */
  subscribeToNotifications: (userId) => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          
          await get().loadNotifications(userId);
          
          
          if (Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.content,
              icon: '/icon-192x192.png'
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  requestNotificationPermission: async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  }
}));
