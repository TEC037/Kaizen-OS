import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hydrateAll,
  hydrateCustomRoutines,
  persistCustomRoutines,
  persistProfile,
  persistRoutines,
  signInDemo,
  signUpWithEmail,
  resetPassword
} from './supabaseService';
import { getSupabaseClient } from './supabaseClient';

vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn(),
}));

describe('supabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hydrateAll', () => {
    it('returns empty data when no client is available', async () => {
      vi.mocked(getSupabaseClient).mockResolvedValue(null);
      const data = await hydrateAll('user1');
      expect(data.profile).toBeNull();
      expect(data.routines).toEqual([]);
      expect(data.history).toEqual([]);
    });

    it('returns successful data without errors', async () => {
      const createBuilder = (mockData: any, mockError: any = null) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: mockError }),
          then: (resolve: any) => Promise.resolve({ data: mockData, error: mockError }).then(resolve),
        };
      };

      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: (table: string) => {
          if (table === 'profiles') return createBuilder({ id: 'user1', name: 'Test User' });
          if (table === 'routines') return createBuilder([{ day_number: 1, name: 'Routine 1' }]);
          return createBuilder([]);
        }
      } as any);

      const data = await hydrateAll('user1');
      expect(data.profile?.name).toBe('Test User');
      expect(data.routines.length).toBe(1);
      expect(data.errors).toEqual([]);
    });

    it('handles partial errors and populates errors array', async () => {
      const createBuilder = (mockData: any, mockError: any = null) => {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockData, error: mockError }),
          then: (resolve: any) => Promise.resolve({ data: mockData, error: mockError }).then(resolve),
        };
      };

      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: (table: string) => {
          if (table === 'profiles') return createBuilder(null, { message: 'Profile error' });
          if (table === 'routines') return createBuilder(null, { message: 'Routine error' });
          return createBuilder([]);
        }
      } as any);

      const data = await hydrateAll('user1');
      expect(data.errors).toContain('profiles: Profile error');
      expect(data.errors).toContain('routines: Routine error');
    });
  });

  describe('persist functions', () => {
    it('persistProfile handles success', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          upsert: mockUpsert,
        }),
      } as any);

      const result = await persistProfile({ id: 'user1', name: 'Test User' } as any);
      expect(result).toEqual({ ok: true, data: undefined });
    });

    it('persistProfile handles failure', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Upsert failed' } });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          upsert: mockUpsert,
        }),
      } as any);

      const result = await persistProfile({ id: 'user1', name: 'Test User' } as any);
      expect(result).toEqual({ ok: false, error: 'Upsert failed' });
    });
  });

  describe('persistRoutines guard', () => {
    it('does NOT clear the plan when routines is transiently empty', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          delete: () => ({ eq: mockDelete }),
        }),
      } as any);

      const result = await persistRoutines('user1', []);
      expect(result.ok).toBe(true);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('clears the plan only when allowClear is explicitly set', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          delete: () => ({ eq: mockDelete }),
        }),
      } as any);

      const result = await persistRoutines('user1', [], { allowClear: true });
      expect(result.ok).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('user_id', 'user1');
    });

    it('upserts routines and deletes stale days when non-empty', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockDelete = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          upsert: mockUpsert,
          delete: () => ({ eq: () => ({ not: mockDelete }) }),
        }),
      } as any);

      const result = await persistRoutines('user1', [{ dayNumber: 1, name: 'A' }] as any);
      expect(result.ok).toBe(true);
      expect(mockUpsert).toHaveBeenCalled();
    });
  });

  describe('custom routines (H3)', () => {
    it('hydrateCustomRoutines flattens payloads in order', async () => {
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              order: vi.fn().mockResolvedValue({
                data: [{ payload: { id: 'r1', name: 'Push' } }, { payload: { id: 'r2', name: 'Pull' } }],
                error: null,
              }),
            }),
          }),
        }),
      } as any);

      const res = await hydrateCustomRoutines('user1');
      expect(res.ok).toBe(true);
      expect(res.data).toEqual([
        { id: 'r1', name: 'Push' },
        { id: 'r2', name: 'Pull' },
      ]);
    });

    it('persistCustomRoutines does NOT clear when empty by default', async () => {
      const mockDelete = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          delete: () => ({ eq: mockDelete }),
        }),
      } as any);

      const res = await persistCustomRoutines('user1', []);
      expect(res.ok).toBe(true);
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('persistCustomRoutines upserts payload rows', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        from: () => ({
          upsert: mockUpsert,
          delete: () => ({ eq: () => ({ not: vi.fn().mockResolvedValue({ error: null }) }) }),
        }),
      } as any);

      const res = await persistCustomRoutines('user1', [{ id: 'r1', name: 'Push', category: 'todos', difficulty: 'Alta', durationMinutes: 45 }]);
      expect(res.ok).toBe(true);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ client_id: 'r1', name: 'Push' })]),
        { onConflict: 'user_id,client_id' }
      );
    });
  });

  describe('Auth functions', () => {
    it('signInDemo success', async () => {
      vi.mocked(getSupabaseClient).mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'demo1' } }, error: null }),
        }
      } as any);

      const result = await signInDemo();
      expect(result.userId).toBe('demo1');
      expect(result.error).toBeNull();
    });

    it('signInDemo auto-creation fallback', async () => {
      const signInMock = vi.fn()
        .mockResolvedValueOnce({ data: { user: null }, error: { message: 'invalid login credentials' } })
        .mockResolvedValueOnce({ data: { user: { id: 'demo-created' } }, error: null });
      
      const signUpMock = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(getSupabaseClient).mockResolvedValue({
        auth: {
          signInWithPassword: signInMock,
          signUp: signUpMock,
        }
      } as any);

      const result = await signInDemo();
      expect(signUpMock).toHaveBeenCalled();
      expect(signInMock).toHaveBeenCalledTimes(2);
      expect(result.userId).toBe('demo-created');
      expect(result.error).toBeNull();
    });

    it('signUpWithEmail success', async () => {
      vi.mocked(getSupabaseClient).mockResolvedValue({
        auth: {
          signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'new-user' }, session: {} }, error: null }),
        }
      } as any);

      const result = await signUpWithEmail('test@example.com', 'pass123', 'John');
      expect(result.userId).toBe('new-user');
      expect(result.error).toBeNull();
    });

    it('resetPassword success', async () => {
      const resetMock = vi.fn().mockResolvedValue({ error: null });
      vi.mocked(getSupabaseClient).mockResolvedValue({
        auth: {
          resetPasswordForEmail: resetMock,
        }
      } as any);

      const result = await resetPassword('test@example.com');
      expect(resetMock).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });
});
