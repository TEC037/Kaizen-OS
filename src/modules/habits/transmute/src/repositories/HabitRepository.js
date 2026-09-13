import { supabase } from '../lib/supabase';

/**
 * Repository: EL PLANO MATERIAL
 * Capa de abstracción encargada de la persistencia y sincronización de datos.
 */
export const HabitRepository = {
  
  /**
   * Obtiene estadísticas globales desde la nube.
   */
  async getGlobalStats() {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    
    const { data: likesData } = await supabase
      .from('likes')
      .select('created_at, sender_id')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: compData } = await supabase
      .from('completions')
      .select('created_at, habit_id')
      .order('created_at', { ascending: false })
      .limit(5);

    return { totalUsers: count || 0, recentLikes: likesData || [], recentCompletions: compData || [] };
  },

  /**
   * Sincroniza un hábito individual (Añadir).
   */
  async createHabit(userId, name, metadata = {}) {
    const payload = { 
      name, 
      user_id: userId,
      icon: metadata.icon || 'diamond',
      description: metadata.description || '',
      area: metadata.area || 'Dominio del Ser',
      method: metadata.method || ''
    };

    const { data, error } = await supabase
      .from('habits')
      .insert([payload])
      .select();
    if (error) {
      console.error("Error detallado en createHabit:", error.message, error.details);
      throw error;
    }
    return data[0];
  },

  /**
   * Elimina un hábito de la persistencia remota.
   */
  async deleteHabit(userId, habitId) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /**
   * Transmuta la esencia de un hábito (Actualizar metadata).
   */
  async updateHabit(userId, habitId, updates) {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  /**
   * Registra o elimina una transmutación (Completación).
   */
  async syncCompletion(userId, habitId, date, isRemoving) {
    if (isRemoving) {
      return await supabase.from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_at', date)
        .eq('user_id', userId);
    } else {
      return await supabase.from('completions')
        .insert([{ habit_id: habitId, completed_at: date, user_id: userId }]);
    }
  },

  /**
   * Carga todo el sistema vital de un usuario.
   */
  async loadUserSystem(userId) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId);
    const { data: completions } = await supabase.from('completions').select('*').eq('user_id', userId);

    return { profile, habits: habits || [], completions: completions || [] };
  },

  /**
   * Envía una señal de respeto/resonancia a otro adepto.
   */
  async emitResonance(senderId, receiverId) {
    const { error } = await supabase
      .from('likes')
      .insert([{ sender_id: senderId, receiver_id: receiverId }]);
    if (error) throw error;
    return true;
  }
};
