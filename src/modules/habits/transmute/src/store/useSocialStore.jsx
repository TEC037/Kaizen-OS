/**
 * useSocialStore.jsx — EL ESTADO DE LA TROPA
 * Store independiente para todas las funcionalidades sociales de TRANSMUTE.
 * Separado de useStore.jsx para mantener el código modular y manejable.
 * Usa Supabase Free Tier: 1 canal Realtime, polling para secundarios.
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { SocialRepository } from '../repositories/SocialRepository';
import { toast } from 'sonner';


export const REACTION_TYPES = {
  resonance: { id: 'resonance', label: 'Resonar',   icon: '✦', xpReward: 5,  color: 'var(--color-gold)'    },
  fire:       { id: 'fire',      label: 'Ignición',  icon: '🔥', xpReward: 10, color: '#e05c00'              },
  celestial:  { id: 'celestial', label: 'Aether',    icon: '⭐', xpReward: 15, color: '#a0a0ff'              },
};

export const useSocialStore = create((set, get) => ({

  
  feed: [],                      
  feedCursor: null,              
  hasMoreFeed: true,             
  isLoadingFeed: false,          
  allies: [],                    
  allianceCounts: { following: 0, followers: 0 },
  collectiveStats: { totalUsers: 0, totalCompletions: 0 },
  realtimeChannel: null,         

  

  /**
   * Carga la primera página del feed de aliados.
   * Llama esto al montar el componente Accountability.
   * @param {string} userId
   */
  loadFeed: async (userId) => {
    if (!userId) return;
    set({ isLoadingFeed: true, feed: [], feedCursor: null, hasMoreFeed: true });

    const items = await SocialRepository.getAllyFeed(userId, null, 20);

    set({
      feed: items,
      feedCursor: items.length > 0 ? items[items.length - 1].created_at : null,
      hasMoreFeed: items.length === 20,
      isLoadingFeed: false,
    });
  },

  /**
   * Carga la siguiente página del feed (scroll infinito).
   * @param {string} userId
   */
  loadMoreFeed: async (userId) => {
    const { feedCursor, hasMoreFeed, isLoadingFeed, feed } = get();
    if (!hasMoreFeed || isLoadingFeed || !feedCursor) return;

    set({ isLoadingFeed: true });
    const items = await SocialRepository.getAllyFeed(userId, feedCursor, 20);

    set({
      feed: [...feed, ...items],
      feedCursor: items.length > 0 ? items[items.length - 1].created_at : feedCursor,
      hasMoreFeed: items.length === 20,
      isLoadingFeed: false,
    });
  },

  /**
   * Prepende un nuevo item al feed en tiempo real (sin recargar todo).
   * @param {object} newItem
   */
  prependFeedItem: (newItem) => {
    set((state) => ({ feed: [newItem, ...state.feed] }));
  },

  /**
   * Publica un evento en el feed de actividad.
   * Llamar después de completar un hábito, desbloquear logro, etc.
   * @param {string} userId
   * @param {string} type
   * @param {object} payload
   */
  publishActivity: async (userId, type, payload) => {
    await SocialRepository.publishToFeed(userId, type, payload);
  },

  

  /**
   * Suscribe al canal Realtime para recibir nuevos eventos del feed en vivo.
   * Solo registra 1 canal global para respetar el límite del Free Tier.
   * @param {string} userId - ID del usuario para filtrar eventos relevantes
   * @param {Array<string>} allyIds - Lista de IDs de aliados para filtrar
   */
  subscribeToFeed: (userId, allyIds) => {
    
    get().unsubscribeFromFeed();

    if (!allyIds || allyIds.length === 0) return;

    const channel = supabase
      .channel('feed-realtime-v1')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        (payload) => {
          
          if (allyIds.includes(payload.new.user_id)) {
            
            SocialRepository.getAllyFeed(userId, null, 1).then((items) => {
              if (items.length > 0) {
                get().prependFeedItem(items[0]);
              }
            });
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  /**
   * Desuscribe del canal Realtime. Llamar al desmontar el componente.
   */
  unsubscribeFromFeed: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  

  /**
   * Emite una reacción alquímica a un item del feed.
   * @param {string} reactorId
   * @param {string} feedItemId
   * @param {string} reactionType - 'resonance' | 'fire' | 'celestial'
   */
  emitReaction: async (reactorId, feedItemId, reactionType = 'resonance') => {
    const reactionInfo = REACTION_TYPES[reactionType];
    const success = await SocialRepository.emitReaction(reactorId, feedItemId, reactionType);

    if (success) {
      toast.success(`${reactionInfo.icon} ${reactionInfo.label}`, {
        description: `Tu energía ha resonado con el adepto.`,
      });
    } else {
      toast.error('Ya resonaste con este adepto hoy.');
    }

    return success;
  },

  

  /**
   * Carga la lista de aliados del usuario actual.
   * @param {string} userId
   */
  loadAlliances: async (userId) => {
    const [allies, counts] = await Promise.all([
      SocialRepository.getAlliances(userId),
      SocialRepository.getAllianceCounts(userId),
    ]);
    set({ allies, allianceCounts: counts });
  },

  /**
   * Forja una nueva alianza con otro adepto.
   * @param {string} followerId
   * @param {string} followingId
   * @param {string} followingName - Para el mensaje de confirmación
   */
  forgeAlliance: async (followerId, followingId, followingName = 'este adepto') => {
    const success = await SocialRepository.forgeAlliance(followerId, followingId);

    if (success) {
      
      await SocialRepository.publishToFeed(followerId, 'alliance_forged', {
        allyId: followingId,
        allyName: followingName,
      });

      toast.success('⚗️ Alianza Forjada', {
        description: `Has unido tu camino al de ${followingName}.`,
      });

      
      get().loadAlliances(followerId);
    } else {
      toast.error('La alianza ya fue forjada con anterioridad.');
    }

    return success;
  },

  /**
   * Disuelve una alianza existente.
   * @param {string} followerId
   * @param {string} followingId
   */
  dissolveAlliance: async (followerId, followingId) => {
    const success = await SocialRepository.dissolveAlliance(followerId, followingId);

    if (success) {
      toast.success('Alianza disuelta', {
        description: 'Los caminos se han separado.',
      });
      get().loadAlliances(followerId);
    }

    return success;
  },

  

  /**
   * Carga las estadísticas colectivas (La Tropa).
   * Usar con polling cada 30s, no con Realtime.
   */
  loadCollectiveStats: async () => {
    const stats = await SocialRepository.getCollectiveStats();
    set({ collectiveStats: stats });
  },
}));
