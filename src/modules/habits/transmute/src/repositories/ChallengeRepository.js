import { supabase } from '../lib/supabase';

/**
 * ChallengeRepository.js — EL CONCILIO DE RETOS
 * Capa de acceso a datos para retos colectivos y participantes.
 * Los retos son creados por el equipo; aquí solo se lee y participa.
 */
export const ChallengeRepository = {

  /**
   * Obtiene todos los retos activos ordenados por fecha de inicio.
   * @returns {Promise<Array>}
   */
  async getActiveChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error obteniendo retos del Concilio:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Obtiene un reto por ID con conteo de participantes.
   * @param {string} challengeId
   * @returns {Promise<object|null>}
   */
  async getChallengeById(challengeId) {
    const [{ data: challenge }, { count }] = await Promise.all([
      supabase.from('challenges').select('*').eq('id', challengeId).single(),
      supabase
        .from('challenge_participants')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challengeId),
    ]);

    if (!challenge) return null;
    return { ...challenge, participantCount: count || 0 };
  },

  /**
   * Une al usuario a un reto (si no está ya inscrito).
   * @param {string} challengeId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async joinChallenge(challengeId, userId) {
    const { error } = await supabase
      .from('challenge_participants')
      .insert([{ challenge_id: challengeId, user_id: userId }]);

    
    if (error && error.code !== '23505') {
      console.error('Error uniéndose al Concilio:', error);
      return false;
    }
    return true;
  },

  /**
   * Verifica si el usuario ya está inscrito en un reto.
   * @param {string} challengeId
   * @param {string} userId
   * @returns {Promise<object|null>} La participación o null
   */
  async getParticipation(challengeId, userId) {
    const { data } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();
    return data || null;
  },

  /**
   * Obtiene todos los retos en los que participa el usuario.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getUserChallenges(userId) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        progress,
        completed,
        joined_at,
        challenges:challenge_id (*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo retos del adepto:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Obtiene el leaderboard de un reto (top 20 participantes por progreso).
   * @param {string} challengeId
   * @returns {Promise<Array>}
   */
  async getChallengeLeaderboard(challengeId) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        progress,
        completed,
        joined_at,
        profiles:user_id ( display_name, avatar, level )
      `)
      .eq('challenge_id', challengeId)
      .order('progress', { ascending: false })
      .order('joined_at', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error obteniendo el Coliseo del reto:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Obtiene el conteo de participantes de un reto.
   * @param {string} challengeId
   * @returns {Promise<number>}
   */
  async getParticipantCount(challengeId) {
    const { count } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challengeId);
    return count || 0;
  },
};
