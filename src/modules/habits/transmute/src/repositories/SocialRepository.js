/**
 * SocialRepository.js — EL ESPEJO COLECTIVO
 * Abstracción de todas las operaciones de persistencia social:
 * feed de actividad, alianzas, reacciones y perfiles.
 * Para Supabase Free Tier: paginación cursor-based y 1 canal Realtime por vista.
 */

import { supabase } from '../lib/supabase';

export const SocialRepository = {

  
  
  

  /**
   * Inserta un evento en el feed de actividad global.
   * Llamar desde el cliente después de cada acción significativa.
   * @param {string} userId
   * @param {string} type - 'habit_completed' | 'streak_milestone' | 'level_up' | 'rank_achieved' | 'challenge_joined' | 'alliance_forged'
   * @param {object} payload - Datos contextuales del evento
   */
  async publishToFeed(userId, type, payload) {
    const { error } = await supabase
      .from('activity_feed')
      .insert([{ user_id: userId, type, payload }]);
    if (error) console.error('Error publicando en el feed colectivo:', error);
  },

  /**
   * Obtiene el feed de actividad de los aliados del usuario (paginado).
   * Solo devuelve eventos de usuarios que el caller sigue.
   * @param {string} userId - ID del usuario que lee el feed
   * @param {string|null} cursor - Timestamp del último item visto (para cursor pagination)
   * @param {number} limit - Máximo de items a devolver
   * @returns {Promise<Array>}
   */
  async getAllyFeed(userId, cursor = null, limit = 20) {
    
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!follows || follows.length === 0) return [];

    const allyIds = follows.map((f) => f.following_id);

    
    let query = supabase
      .from('activity_feed')
      .select(`
        id,
        user_id,
        type,
        payload,
        created_at,
        profiles:user_id ( display_name, avatar, level )
      `)
      .in('user_id', allyIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error obteniendo el feed de aliados:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Obtiene las reacciones de un item del feed.
   * @param {string} feedItemId
   * @returns {Promise<Array>}
   */
  async getFeedReactions(feedItemId) {
    const { data } = await supabase
      .from('feed_reactions')
      .select('type, reactor_id, profiles:reactor_id(display_name)')
      .eq('feed_item_id', feedItemId);
    return data || [];
  },

  
  
  

  /**
   * Envía una reacción alquímica a un item del feed.
   * Regla: Máx 1 reacción por (reactor, feedItem) por día.
   * @param {string} reactorId
   * @param {string} feedItemId
   * @param {string} type - 'resonance' | 'fire' | 'celestial'
   * @returns {Promise<boolean>}
   */
  async emitReaction(reactorId, feedItemId, type = 'resonance') {
    
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('feed_reactions')
      .select('id')
      .eq('reactor_id', reactorId)
      .eq('feed_item_id', feedItemId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .limit(1);

    if (existing && existing.length > 0) {
      return false; 
    }

    const { error } = await supabase
      .from('feed_reactions')
      .insert([{ feed_item_id: feedItemId, reactor_id: reactorId, type }]);

    if (error) {
      console.error('Error emitiendo reacción alquímica:', error);
      return false;
    }
    return true;
  },

  
  
  

  /**
   * Forja una alianza (follow unidireccional).
   * @param {string} followerId - Quien sigue
   * @param {string} followingId - A quien sigue
   * @returns {Promise<boolean>}
   */
  async forgeAlliance(followerId, followingId) {
    if (followerId === followingId) return false;

    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);

    
    if (error && error.code !== '23505') {
      console.error('Error forjando alianza:', error);
      return false;
    }
    return true;
  },

  /**
   * Disuelve una alianza (unfollow).
   * @param {string} followerId
   * @param {string} followingId
   * @returns {Promise<boolean>}
   */
  async dissolveAlliance(followerId, followingId) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      console.error('Error disolviendo alianza:', error);
      return false;
    }
    return true;
  },

  /**
   * Verifica si el usuario sigue a otro.
   * @param {string} followerId
   * @param {string} followingId
   * @returns {Promise<boolean>}
   */
  async isFollowing(followerId, followingId) {
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .limit(1);
    return data && data.length > 0;
  },

  /**
   * Obtiene la lista de aliados de un usuario (a quienes sigue).
   * @param {string} userId
   * @returns {Promise<Array>} Lista de perfiles
   */
  async getAlliances(userId) {
    const { data } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles:following_id ( id, display_name, avatar, level, settings )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  },

  /**
   * Obtiene el contador de aliados y seguidores.
   * @param {string} userId
   * @returns {Promise<{ following: number, followers: number }>}
   */
  async getAllianceCounts(userId) {
    const [{ count: following }, { count: followers }] = await Promise.all([
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    ]);
    return { following: following || 0, followers: followers || 0 };
  },

  
  
  

  /**
   * Carga el perfil público de un usuario (solo aliados pueden ver detalles).
   * @param {string} profileId - ID del perfil a cargar
   * @returns {Promise<object|null>}
   */
  async getPublicProfile(profileId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, level, xp, settings, created_at')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error cargando perfil público:', error);
      return null;
    }
    return data;
  },

  /**
   * Busca usuarios por nombre (solo entre aliados existentes por ahora).
   * Sin descubribilidad global en v1 — modelo privado.
   * @param {string} currentUserId
   * @param {string} query - Texto de búsqueda
   * @returns {Promise<Array>}
   */
  /**
   * Busca usuarios de forma global para expandir las alianzas.
   * @param {string} query - Texto de búsqueda (mín 3 letras)
   * @returns {Promise<Array>}
   */
  async searchGlobal(query) {
    if (!query || query.length < 3) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, level')
      .ilike('display_name', `%${query}%`)
      .limit(10);

    if (error) console.error('Error en búsqueda global:', error);
    return data || [];
  },

  
  
  

  async getCollectiveStats() {
    const [
      { count: totalUsers },
      { count: totalCompletions },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('completions').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalUsers: totalUsers || 0,
      totalCompletions: totalCompletions || 0,
    };
  },

  
  
  

  /**
   * Se suscribe a nuevos eventos en el feed de actividad.
   * @param {string} userId - ID del usuario actual (para filtrar si es necesario)
   * @param {function} onNewEvent - Callback cuando llega un evento
   * @returns {object} Subscription channel
   */
  subscribeToFeed(onNewEvent) {
    return supabase
      .channel('public:activity_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        async (payload) => {
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar, level')
            .eq('id', payload.new.user_id)
            .single();
          
          const eventWithProfile = {
            ...payload.new,
            profiles: profile
          };
          onNewEvent(eventWithProfile);
        }
      )
      .subscribe();
  },
  /**
   * Obtiene la esencia pública de un adepto (Logros y Stats).
   * @param {string} userId - ID del adepto a consultar
   */
  async getAdeptEssence(userId) {
    const [profile, habits, completions] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('habits').select('*').eq('user_id', userId),
      supabase.from('completions').select('*').eq('user_id', userId)
    ]);

    return {
      profile: profile.data,
      habits: habits.data || [],
      completions: completions.data || []
    };
  },
};
