/**
 * ELEMENTO: useStore.jsx
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Gestión del estado global, persistencia y sincronización de datos de TRANSMUTE.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { toast } from 'sonner';
import { Award, Sparkles, Zap, Flame, Shield, Crown, Sprout, Trees } from 'lucide-react';
import React from 'react';

import { supabase, IS_LOCAL_MODE, LOCAL_SESSION } from '../lib/supabase';
import { setThemeOnRoot } from '../lib/themeRoot';
import { habitDefinitions, achievementsDefinitions } from '../data/habitDefinitions';
import { trackEvent, identifyUser } from '../utils/analytics';
import { oracle } from '../utils/oracle';


import { HabitRepository } from '../repositories/HabitRepository';
import { SocialRepository } from '../repositories/SocialRepository';
import {
  calculateStreak,
  calculateLevelFromXp,
  checkAchievements,
  isPerfectDay,
} from '../domain/HabitDomain';
import {
  calculateCompletionXp,
  calculateEntropyPenalty,
  getStreakPhaseName,
  XP_ACTIONS,
} from '../domain/XPDomain';

const habitSchema = z.object({
  name: z.string().min(1, "El nombre del elemento no puede estar vacío").max(50, "El nombre es demasiado largo para ser estable"),
});

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: IS_LOCAL_MODE ? LOCAL_SESSION : null,
      habits: [],
      selectedDate: (function(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })(),
      xp: 0,
      level: 1,
      achievements: [],
      readArticles: [],
      bestStreak: 0,
      perfectDaysCount: 0,         
      isOnline: true,
      theme: 'citrinitas', 
      pulseEvent: { id: 0, x: 0, y: 0 }, 
      triggerPulse: (x, y) => set({ pulseEvent: { id: Date.now(), x, y } }),
      settings: {
        notificationsEnabled: true,  
        vibrationEnabled: true,       
        audioEnabled: true,
        displayName: (typeof window !== 'undefined' && localStorage.getItem('kz:user_name')) || 'Alex',
        avatar: 'User',
        isPublic: true,
        hasFinishedOnboarding: false,
        isGuidedMode: true,
        appMode: 'Aventura',
        profiling: {
          focusArea: 'Mente', // 'Cuerpo' | 'Mente' | 'Espíritu'
          disciplineLevel: 'Templada', // 'Frágil' | 'Templada' | 'Inquebrantable'
          ritualFrequency: 'Sutil', // 'Sutil' | 'Intenso' | 'Magistral'
        }
      },
      installationDate: (function(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })(),
      globalStats: { totalUsers: 0, recentLikes: [], recentCompletions: [] },
      isResetting: false,
      pendingSyncs: [],
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      
      setOnline: (status) => {
        set({ isOnline: status });
        if (status) {
          get().processPendingSyncs();
        }
      },

      processPendingSyncs: async () => {
        const { session, pendingSyncs, isOnline } = get();
        if (!session || !isOnline || !pendingSyncs || pendingSyncs.length === 0) return;

        
        const queue = [...pendingSyncs];
        set({ pendingSyncs: [] });
        
        for (const op of queue) {
          try {
            if (op.type === 'completion') {
              await HabitRepository.syncCompletion(session.user.id, op.habitId, op.date, op.isRemoving);
            } else if (op.type === 'add_habit') {
              if (!op.name) {
                console.warn("Saltando sincronización de hábito sin nombre:", op);
                continue;
              }
              const h = await HabitRepository.createHabit(session.user.id, op.name, op.metadata);
              
              set(state => ({
                habits: state.habits.map(hab => hab.id === op.habitId ? { ...hab, id: h.id } : hab)
              }));
            } else if (op.type === 'delete_habit') {
              if (!op.habitId.startsWith('tmp-')) {
                await HabitRepository.deleteHabit(session.user.id, op.habitId);
              }
            } else if (op.type === 'update_habit') {
              if (!op.habitId.startsWith('tmp-')) {
                await HabitRepository.updateHabit(session.user.id, op.habitId, op.updates);
              }
            }
          } catch (err) {
            console.error("Fallo de sync offline, reenviando a entropía:", err.message || err);
            
            
            if (err?.status !== 400) {
              set(state => ({ pendingSyncs: [...state.pendingSyncs, op] }));
            }
            
            if (err?.status === 401 || err?.status === 403) break;
          }
        }
      },
      
      fetchGlobalStats: async () => {
        try {
          const stats = await HabitRepository.getGlobalStats();
          set({ globalStats: stats });
        } catch (e) {
          console.error("Error en las crónicas globales:", e);
        }
      },
      
      addXp: (amount, articleId) => {
        const { xp, readArticles } = get();
        if (articleId && readArticles.includes(articleId)) return;

        set((state) => {
          let safeAmount = Number(amount);
          if (Number.isNaN(safeAmount) || safeAmount < 0) safeAmount = 0;
          
          let safeXp = Number(state.xp);
          if (Number.isNaN(safeXp) || safeXp < 0) safeXp = 0;
          
          const MAX_XP = 100000;
          const newXp = Math.min(MAX_XP, Math.max(0, safeXp + safeAmount));
          const newLevel = calculateLevelFromXp(newXp);
          const newRead = articleId ? [...state.readArticles, articleId] : state.readArticles;
          
          if (articleId) trackEvent('education_distilled', { articleId, xpGained: amount });
          
          return { xp: newXp, level: newLevel, readArticles: newRead };
        });

        toast.success(`Esencia Destilada`, {
          description: `+${amount} Esencia extraída de los saberes.`,
          icon: <Sparkles className="text-oro" size={16} />
        });
      },
      
      setSelectedDate: (date) => set({ selectedDate: date }),

      toggleHabit: (id, dateStr) => {
        const { selectedDate, session } = get();
        const date = dateStr || selectedDate;

        set((state) => {
          const habit = state.habits.find((h) => h.id === id);
          if (!habit) return state;

          const isCompleting = !(habit.completedDays && habit.completedDays[date]);
          trackEvent(isCompleting ? 'habit_completed' : 'habit_uncompleted', { habitName: habit.name });

          if (isCompleting) {
            try {
              window.dispatchEvent(new CustomEvent('transmute:habit-completed', { detail: { habitId: habit.id, name: habit.name } }));
            } catch (e) { }
          }

          
          const newHabits = state.habits.map((h) => {
            if (h.id !== id) return h;
            const newCompletedDays = { ...(h.completedDays || {}) };
            if (newCompletedDays[date]) {
              delete newCompletedDays[date];
            } else {
              newCompletedDays[date] = true;
            }
            return { ...h, completedDays: newCompletedDays, streak: calculateStreak(newCompletedDays) };
          });

          
          const updatedHabit = newHabits.find((h) => h.id === id);
          let xpGainedLocal = 0;
          if (isCompleting) {
            const { total } = calculateCompletionXp(XP_ACTIONS.habit_completed, updatedHabit.streak || 0);
            xpGainedLocal = total;

            
            // [LÓGICA]: Evaluar estado de "Día Perfecto"
            const wasAlreadyPerfect = isPerfectDay(state.habits, date);
            const isNowPerfect = isPerfectDay(newHabits, date);
            
            if (!wasAlreadyPerfect && isNowPerfect) {
              xpGainedLocal += XP_ACTIONS.perfect_day;
              toast.success("¡Día Perfecto!", { description: "El Atanor brilla con una pureza absoluta." });
            }

            const phaseName = getStreakPhaseName(updatedHabit.streak || 0);
            if ([7, 14, 30, 66].includes(updatedHabit.streak)) {
              toast.success(`${phaseName} alcanzada`, { icon: '🔥' });
            }
          } else {
            xpGainedLocal = calculateEntropyPenalty(habit.streak || 0);
            
            // [LÓGICA]: Revertir bono de "Día Perfecto" si se rompe la perfección
            const wasPerfect = isPerfectDay(state.habits, date);
            const isNowPerfect = isPerfectDay(newHabits, date);
            
            if (wasPerfect && !isNowPerfect) {
              xpGainedLocal -= XP_ACTIONS.perfect_day;
            }
            
            toast.error("Racha interrumpida", { description: "La entropía gana terreno." });
          }

          let safeLocalXp = Number(xpGainedLocal);
          if (Number.isNaN(safeLocalXp)) safeLocalXp = 0;
          
          let safeXp = Number(state.xp);
          if (Number.isNaN(safeXp) || safeXp < 0) safeXp = 0;
          
          const MAX_XP = 100000;
          const newXp = Math.min(MAX_XP, Math.max(0, Math.round(safeXp + safeLocalXp)));
          const newLevel = calculateLevelFromXp(newXp);
          const maxStreak = newHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
          const newBestStreak = Math.max(state.bestStreak || 0, maxStreak);

          
          const earnedAch = checkAchievements(newHabits, newBestStreak, state.achievements, achievementsDefinitions);
          const newAchievements = [...state.achievements];
          earnedAch.forEach((ach) => {
            newAchievements.push(ach.id);
            toast.success('¡Eón Sincronizado!', { 
              description: `Logro desbloqueado: ${ach.name}`, 
              icon: ach.icon 
            });
          });

          
          const allDates = new Set();
          newHabits.forEach((h) => Object.keys(h.completedDays || {}).forEach((d) => allDates.add(d)));
          let perfectDaysCount = 0;
          allDates.forEach((d) => { if (isPerfectDay(newHabits, d)) perfectDaysCount++; });

          return {
            habits: newHabits,
            xp: newXp,
            level: newLevel,
            achievements: newAchievements,
            bestStreak: newBestStreak,
            perfectDaysCount,
          };
        });

        
        const updatedHabit = get().habits.find((h) => h.id === id);
        get().syncCompletionToDb(id, date, !updatedHabit?.completedDays?.[date]);

        
        if (session && get().settings.isPublic) {
          const h = get().habits.find((h) => h.id === id);
          if (h && h.completedDays?.[date]) {
            SocialRepository.publishToFeed(session.user.id, 'habit_completed', {
              habitName: h.name,
              streak: h.streak || 0,
              area: h.area || 'Dominio del Ser',
            });
          }
        }

        if (get().settings.notificationsEnabled) {
          oracle.scheduleHabitReminders(get().habits);
        }
        get().evaluateRPGSystem();
      },

      toggleTheme: () => set((state) => {
        const nextTheme = state.theme === 'nigredo' ? 'citrinitas' : 'nigredo';
        if (typeof document !== 'undefined') {
          setThemeOnRoot(nextTheme);
        }
        return { theme: nextTheme };
      }),
      
      addHabit: async (definition, customData = {}) => {
        const name = typeof definition === 'object' ? definition.name : definition;
        const metadata = typeof definition === 'object' ? { ...definition, ...customData } : customData;
        
        habitSchema.parse({ name });
        const { session, isOnline } = get();
        let newId = `tmp-${Date.now()}`;
        const operation = { type: 'add_habit', habitId: newId, name, metadata, timestamp: Date.now() };

        if (!IS_LOCAL_MODE && session && isOnline) {
          try {
            const data = await HabitRepository.createHabit(session.user.id, name, metadata);
            newId = data.id;
          } catch (err) {
            set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
          }
        } else if (!IS_LOCAL_MODE && session) {
          set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
        }

        set((state) => ({
          habits: [
            ...state.habits,
            { 
              id: newId, name,
              area: metadata.area || 'Dominio del Ser',
              description: metadata.description || '',
              method: metadata.method || '',
              icon: metadata.icon || 'diamond',
              completedDays: {}, streak: 0 
            }
          ]
        }));
      },

      materializeHabit: async (definitionId) => {
        const { session, isOnline, habits } = get();
        const definition = habitDefinitions.find(d => d.id === definitionId);
        if (!definition) return;

        if (habits.find(h => h.name === definition.name)) {
          toast.error("Proceso ya activo", { description: "Esta intención ya está en tu flujo." });
          return;
        }

        let newId = `tmp-${Date.now()}`;
        const metadata = { 
          icon: definition.icon, 
          method: definition.method, 
          area: definition.area 
        };
        const operation = { type: 'add_habit', habitId: newId, name: definition.name, metadata, timestamp: Date.now() };

        
        set((state) => ({
          habits: [...state.habits, { 
            id: newId, 
            name: definition.name, 
            ...metadata,
            completedDays: {}, streak: 0 
          }]
        }));
        toast.success("Gracia Alcanzada", { description: `${definition.name} ha sido añadido a tu obra.` });

        
        if (!IS_LOCAL_MODE && session && isOnline) {
          try {
             const data = await HabitRepository.createHabit(session.user.id, definition.name, metadata);
             
             set((state) => ({
               habits: state.habits.map(h => h.id === newId ? { ...h, id: data.id } : h)
             }));
          } catch (e) {
             set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
          }
        } else if (!IS_LOCAL_MODE && session) {
             set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
        }
      },

      updateSettings: async (newSettings) => {
        const { session } = get();
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));

        if (!IS_LOCAL_MODE && session) {
          const { error } = await supabase.from('profiles').update({ 
            settings: { ...get().settings, ...newSettings },
            display_name: newSettings.displayName || get().settings.displayName,
            avatar: newSettings.avatar || get().settings.avatar
          }).eq('id', session.user.id);
          
          if (error) console.error("Error sincronizando sintonía:", error);
        }
        
        toast.success("Sintonía Actualizada");
      },
      
      deleteHabit: async (id) => {
        const { session, isOnline } = get();
        const operation = { type: 'delete_habit', habitId: id, timestamp: Date.now() };

        
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id)
        }));
        toast.success("Proceso Disuelto", { description: "El elemento ha vuelto al vacío." });

        
        if (!IS_LOCAL_MODE && session && isOnline && id !== 'tutorial-habit' && !id.toString().startsWith('tmp-')) {
          try {
            await HabitRepository.deleteHabit(session.user.id, id);
          } catch (err) {
            set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
          }
        } else if (!IS_LOCAL_MODE && session && id !== 'tutorial-habit' && !id.toString().startsWith('tmp-')) {
          set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
        }
      },

      updateHabit: async (id, updates) => {
        const { session, isOnline } = get();
        const operation = { type: 'update_habit', habitId: id, updates, timestamp: Date.now() };

        
        set((state) => ({
          habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h)
        }));

        if (!IS_LOCAL_MODE && session && isOnline && id !== 'tutorial-habit') {
          try {
            await HabitRepository.updateHabit(session.user.id, id, updates);
          } catch (err) {
            set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
          }
        } else if (!IS_LOCAL_MODE && session && id !== 'tutorial-habit') {
          set(state => ({ pendingSyncs: [...state.pendingSyncs, operation] }));
        }
      },

      setSession: (session) => set({ session, user: session?.user || null }),

      getHabitData: (name) => {
        return habitDefinitions.find(h => h.name === name) || { level: 1, coach_education: "Proceso alquímico personalizado." };
      },

      getDynamicCoachMessage: (habitName, streak) => {
        const data = habitDefinitions.find(h => h.name === habitName);
        if (!data) return "La constancia es la base de la transmutación.";
        
        if (data.daily_messages && data.daily_messages[streak]) return data.daily_messages[streak];

        if (streak === 0) return data.coach_education;
        if (streak >= 1 && streak < 3) return `Órbita Lunar: ${data.benefits?.day_1 || 'Tu cuerpo está empezando a notar el cambio'}.`;
        if (streak >= 3 && streak < 7) return `Ascenso Solar: ${data.benefits?.day_3 || 'La claridad mental aumenta con cada repetición'}.`;
        if (streak >= 7 && streak < 14) return `Cristalización Estelar: ${data.benefits?.day_7 || 'Tus conexiones neuronales se están solidificando'}.`;
        if (streak >= 14) return `Fase de Aetheria: Estás transmutando tu realidad permanentemente.`;
        
        return data.coach_education;
      },

      initializeSync: async () => {
        if (IS_LOCAL_MODE) return;
        const { session, processPendingSyncs } = get();
        if (!session) return;
        
        try {
          
          await processPendingSyncs();

          identifyUser(session.user.id, { email: session.user.email });
          trackEvent('app_initialized');

          const { profile, habits: hData, completions } = await HabitRepository.loadUserSystem(session.user.id);
          
          if (profile) {
            set((state) => {
              const remoteSettings = profile.settings || {};
              
              const hasFinishedOnboarding = state.settings.hasFinishedOnboarding || remoteSettings.hasFinishedOnboarding || false;
              
              return { 
                xp: Math.max(state.xp, profile.xp || 0), 
                level: Math.max(state.level, profile.level || 1), 
                readArticles: profile.read_articles || [],
                settings: { 
                  ...state.settings, 
                  ...remoteSettings, 
                  hasFinishedOnboarding,
                  displayName: profile.display_name || state.settings.displayName,
                  avatar: profile.avatar || state.settings.avatar
                }
              };
            });
          }

          const syncedHabits = hData.map(h => {
             const hComps = completions.filter(c => c.habit_id === h.id);
             const completedDays = {};
             
             hComps.forEach(c => {
                 const pureDate = c.completed_at.split('T')[0];
                 completedDays[pureDate] = true;
             });
             
             
             
             const definition = habitDefinitions.find(d => d.name === h.name) || {};

             return { 
                id: h.id, 
                name: h.name, 
                completedDays, 
                streak: calculateStreak(completedDays),
                definitionId: h.definition_id || definition.id || null,
                icon: h.icon || definition.icon || "diamond", 
                method: h.method || definition.method || "",
                description: h.description || definition.description || "",
                area: h.area || definition.area || "Dominio del Ser"
              };
          });

          set({ habits: syncedHabits });
        } catch (err) {
          console.error("Error en sincronización inicial:", err);
        }
      },

      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) set({ session: null, habits: [], xp: 0, level: 1 });
        return { error };
      },

      hardResetAccount: async () => {
        const { session, signOut } = get();
        if (!session) return;
        set({ isResetting: true });
        toast.loading("Purificando el Plomo...", { id: 'reset-toast' });

        try {
          // [ACCIÓN]: Limpieza de datos en Supabase (omitida en modo local)
          if (!IS_LOCAL_MODE) {
            try {
              await supabase.from('completions').delete().eq('user_id', session.user.id);
              await supabase.from('habits').delete().eq('user_id', session.user.id);
            } catch (e) { console.warn("Fallo en limpieza remota de hábitos"); }

            try {
              await supabase.from('profiles').update({ 
                xp: 0, level: 1, read_articles: [],
                display_name: 'Adept #001', avatar: 'User',
                settings: { hasFinishedOnboarding: false, displayName: 'Adept #001', avatar: 'User' } 
              }).eq('id', session.user.id);
            } catch (e) { console.warn("Fallo en limpieza remota de perfil"); }
          }

          // [ACCIÓN]: Reset de estado local
          set({ 
            habits: [], xp: 0, level: 1, 
            achievements: [], readArticles: [], bestStreak: 0,
            settings: { 
              ...get().settings, 
              hasFinishedOnboarding: false, 
              displayName: 'Adept #001',
              avatar: 'User'
            } 
          });
          
          toast.success("Gran Obra Reiniciada", { id: 'reset-toast' });
          await new Promise(r => setTimeout(r, 1000)); 
          await signOut();
          set({ isResetting: false });
          return true;
        } catch (e) {
          console.error("Fallo la calcinación:", e);
          toast.error("Fallo la calcinación grave", { id: 'reset-toast' });
          set({ isResetting: false });
          return false;
        }
      },

      giveRespect: async (receiverId) => {
        const { session, achievements } = get();
        if (!session || session.user.id === receiverId) return;

        try {
          await HabitRepository.emitResonance(session.user.id, receiverId);
          if (!achievements.includes('respect_emitted')) {
            set({ achievements: [...achievements, 'respect_emitted'] });
            toast.success("Gracia Alcanzada", { description: "Reflejo Galante" });
          }
          toast.success("Reflejo de Respeto Enviado");
          return true;
        } catch (err) { return false; }
      },

      syncCompletionToDb: async (habitId, date, isRemoving) => {
        const { session, isOnline } = get();
        if (!session || habitId === 'tutorial-habit') return;

        if (!isOnline) {
          set(state => ({ pendingSyncs: [...state.pendingSyncs, { type: 'completion', habitId, date, isRemoving, timestamp: Date.now() }] }));
          return;
        }

        try {
          await HabitRepository.syncCompletion(session.user.id, habitId, date, isRemoving);
        } catch (err) {
          set(state => ({ pendingSyncs: [...state.pendingSyncs, { type: 'completion', habitId, date, isRemoving, timestamp: Date.now() }] }));
        }
      },

      getAdvancedStats: () => {
        const { habits } = get();
        if (habits.length === 0) return null;
        const stats = habits.map(h => ({ name: h.name, completions: Object.keys(h.completedDays || {}).length }));
        const mostCompleted = stats.reduce((prev, current) => (prev.completions > current.completions) ? prev : current);
        return { mostCompleted };
      },

      evaluateRPGSystem: () => {
        const { habits, settings } = get();
        if (settings.appMode === 'Libre') return;
        
        const newlyUnlocked = habitDefinitions.filter(def => {
          if (!def.prerequisiteId) return false;
          const alreadyHas = habits.some(h => h.name === def.name);
          if (alreadyHas) return false;
          const prereqDef = habitDefinitions.find(d => d.id === def.prerequisiteId);
          const h = habits.find(h => h.name === prereqDef.name);
          return h && (h.streak >= 1 || Object.keys(h.completedDays).length >= 1);
        });
        
        if (newlyUnlocked.length > 0) {
           toast.success("Nueva Trayectoria Revelada", {
             description: `Has desbloqueado el acceso a: ${newlyUnlocked.map(h => h.name).join(', ')}.`,
             icon: <Award size={20} className="text-oro" />
           });
        }
      },

      getAvailableDefinitions: () => {
        const { habits } = get();
        return habitDefinitions.filter(def => !habits.some(h => h.name === def.name));
      },
      
      setTheme: (newTheme) => set({ theme: newTheme }),
    }),
    {
      name: 'transmute-storage',
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Corrupción de LocalStorage detectada en Transmute:", error);
          localStorage.removeItem('transmute-storage');
        } else {
          state.setHasHydrated(true);
        }
      },
      partialize: (state) => ({
        habits: state.habits,
        xp: state.xp,
        level: state.level,
        achievements: state.achievements,
        readArticles: state.readArticles,
        bestStreak: state.bestStreak,
        perfectDaysCount: state.perfectDaysCount,
        settings: state.settings,
        theme: state.theme,
        installationDate: state.installationDate,
        pendingSyncs: state.pendingSyncs || [],
      }),
    }
  )
);

// Sincronización reactiva con la identidad global de Kaizen OS
if (typeof window !== 'undefined') {
  const syncGlobalName = () => {
    try {
      const globalName = localStorage.getItem('kz:user_name');
      if (globalName && globalName.trim()) {
        const current = useStore.getState().settings?.displayName;
        if (current !== globalName.trim()) {
          useStore.getState().updateSettings({ displayName: globalName.trim() });
        }
      }
    } catch {
      // no-op
    }
  };

  window.addEventListener('kz:user_name_changed', (e) => {
    const customEvt = e;
    const newName = customEvt.detail?.userName;
    if (newName) {
      useStore.getState().updateSettings({ displayName: newName });
    } else {
      syncGlobalName();
    }
  });

  window.addEventListener('storage', (e) => {
    if (!e.key || e.key === 'kz:user_name') {
      syncGlobalName();
    }
  });

  setTimeout(syncGlobalName, 0);
}
