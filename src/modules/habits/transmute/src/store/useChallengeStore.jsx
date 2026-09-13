import { create } from 'zustand';
import { ChallengeRepository } from '../repositories/ChallengeRepository';
import { SocialRepository } from '../repositories/SocialRepository';
import { toast } from 'sonner';

/**
 * useChallengeStore.jsx — EL ESTADO DEL CONCILIO
 * Gestión de retos colectivos separada de useStore para mantener
 * el código modular. Sin Realtime — polling cada 60s.
 */
export const useChallengeStore = create((set, get) => ({

  
  activeChallenges: [],        
  userChallenges: [],          
  selectedChallenge: null,     
  leaderboard: [],             
  isLoading: false,

  

  /**
   * Carga los retos activos y los del usuario.
   * @param {string} userId
   */
  loadChallenges: async (userId) => {
    set({ isLoading: true });

    const [activeChallenges, userChallenges] = await Promise.all([
      ChallengeRepository.getActiveChallenges(),
      userId ? ChallengeRepository.getUserChallenges(userId) : Promise.resolve([]),
    ]);

    
    const enriched = await Promise.all(
      activeChallenges.map(async (ch) => {
        const count = await ChallengeRepository.getParticipantCount(ch.id);
        
        const isJoined = userChallenges.some(
          (uc) => uc.challenges?.id === ch.id
        );
        const participation = userChallenges.find((uc) => uc.challenges?.id === ch.id);
        return { ...ch, participantCount: count, isJoined, userProgress: participation?.progress || 0 };
      })
    );

    set({ activeChallenges: enriched, userChallenges, isLoading: false });
  },

  /**
   * Abre un reto y carga su leaderboard.
   * @param {object} challenge
   */
  selectChallenge: async (challenge) => {
    set({ selectedChallenge: challenge, leaderboard: [] });
    const lb = await ChallengeRepository.getChallengeLeaderboard(challenge.id);
    set({ leaderboard: lb });
  },

  /**
   * Cierra el reto seleccionado.
   */
  clearSelectedChallenge: () => set({ selectedChallenge: null, leaderboard: [] }),

  

  /**
   * Une al usuario al reto seleccionado y publica en el feed.
   * @param {string} userId
   * @param {string} challengeId
   * @param {string} challengeTitle
   */
  joinChallenge: async (userId, challengeId, challengeTitle) => {
    const ok = await ChallengeRepository.joinChallenge(challengeId, userId);

    if (ok) {
      
      await SocialRepository.publishToFeed(userId, 'challenge_joined', {
        challengeId,
        challengeTitle,
      });

      toast.success('⚔️ Alianza con el Concilio', {
        description: `Te has unido al reto: ${challengeTitle}`,
      });

      
      set((state) => ({
        activeChallenges: state.activeChallenges.map((ch) =>
          ch.id === challengeId
            ? { ...ch, isJoined: true, participantCount: (ch.participantCount || 0) + 1 }
            : ch
        ),
      }));
    } else {
      toast.error('Ya estás inscrito en este reto del Concilio.');
    }

    return ok;
  },
}));
