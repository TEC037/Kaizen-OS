import { supabase } from '../lib/supabase';

/**
 * LeaderboardRepository.js — EL COLISEO DEL ETER
 * Acceso al ranking global de adeptos.
 */
export const LeaderboardRepository = {
  
  /**
   * Obtiene la cúspide de la Gran Obra (Top 50).
   * @returns {Promise<Array>}
   */
  async getTopAdeptos() {
    const { data, error } = await supabase
      .from('global_leaderboard')
      .select('*')
      .limit(50);
      
    if (error) {
      console.error('Error invocando el Coliseo:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Busca la posición exacta de un adepto específico.
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async getMyRanking(userId) {
    const { data, error } = await supabase
      .from('global_leaderboard')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  }
};

/**
 * NotificationRepository.js — EL HERALDO DE TRANSMUTE
 * Gestión de alertas y resonancias sociales.
 */
export const NotificationRepository = {
  
  /**
   * Obtiene las notificaciones del usuario.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:actor_id ( display_name, avatar )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error llamando al Heraldo:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Marca notificaciones como leídas.
   * @param {string[]} ids
   */
  async markAsRead(ids) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids);
    
    if (error) console.error('Error al silenciar al Heraldo:', error);
  },

  /**
   * Obtiene el conteo de no leídas.
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) return 0;
    return count || 0;
  }
};
