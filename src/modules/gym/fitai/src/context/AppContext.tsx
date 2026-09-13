import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppContext } from './useApp';
import {
  UserProfile,
  DailyRoutine,
  Exercise,
  WorkoutSessionLog,
  PersonalRecord,
  ChatMessage,
  AppScreen,
  LoggedSet,
} from '../types';
import { INITIAL_USER } from '../data/mockUser';
import { INITIAL_CHAT_MESSAGES } from '../data/mockCoach';
import { MOCK_ROUTINES } from '../data/mockRoutines';
import { MOCK_HISTORY, MOCK_PRS, MOCK_WEIGHT_HISTORY } from '../data/mockProgress';
import {
  calculateAllometricProfile,
  calculateAllometricWorkoutCalories,
  resolveActivityLevel,
  AllometricProfile,
} from '../services/allometricService';
import {
  COACH_THINKING_DELAY_MS,
  COMPLIANCE_INCREMENT_PER_WORKOUT,
  DEFAULT_AVERAGE_RPE,
  DEFAULT_REST_SECONDS,
  DEMO_STORAGE_KEYS,
  FALLBACK_TOTAL_SETS,
  FALLBACK_TOTAL_VOLUME_KG,
  FRESH_START_COMPLIANCE,
  MINUTES_PER_EXERCISE,
  MIN_ROUTINE_ESTIMATED_MINUTES,
  MIN_DURATION_REPORT_MIN,
  STORAGE_KEYS,
} from '../config/constants';
import { generateCoachReply, CoachContext } from '../ai/coachEngine';
import { buildServerlessPayload, fetchServerlessCoachReply } from '../lib/serverlessCoach';
import { withMinDelay } from '../utils/withMinDelay';
import { derivePersonalRecords } from '../utils/personalRecords';
import { formatClock, getLocalDateStamp } from '../utils/format';
import { usePersistedState } from '../hooks/usePersistedState';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import {
  getSessionUserId,
  hydrateAll,
  persistProfile,
  persistRoutines,
  persistHistory,
  persistRecords,
  persistWeightHistory,
  persistChat,
  signInDemo,
  signInWithEmail,
  signUpWithEmail,
  signOutSession,
  ensureDemoData,
  onAuthStateChange,
} from '../lib/supabaseService';

import { translateAuthError } from '../utils/authErrors';
import { DEMO_EMAIL } from '../config/constants';

export interface AppContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isDemoUser: boolean;
  isHydrating: boolean;
  currentScreen: AppScreen;
  routines: DailyRoutine[];
  selectedDay: number;
  history: WorkoutSessionLog[];
  personalRecords: PersonalRecord[];
  weightHistory: { date: string; weight: number }[];
  chatMessages: ChatMessage[];
  isCoachTyping: boolean;

  // Biometría Alométrica (Escalas x^(3/4), x^(1/4), x^(2/3))
  allometricProfile: AllometricProfile;

  // Active workout state
  isWorkoutActive: boolean;
  activeRoutine: DailyRoutine | null;
  activeExerciseIndex: number;
  activeSetIndex: number;
  activeWorkoutSets: LoggedSet[];
  workoutElapsedTime: number; // in seconds
  restTimerSeconds: number;
  isRestTimerActive: boolean;

  // Actions
  navigateTo: (screen: AppScreen) => void;
  setSelectedDay: (day: number) => void;
  loginDemoUser: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  registerWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetToDemoData: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: (
    newProfileData: Partial<UserProfile>,
    generatedRoutines?: DailyRoutine[]
  ) => void;

  // Workout Actions
  startWorkout: (routineDay?: number) => void;
  cancelWorkout: () => void;
  logActiveSet: (weightKg: number, reps: number, rpe: number, sensation: string) => void;
  goToNextExercise: () => void;
  goToPreviousExercise: () => void;
  startRestTimer: (seconds?: number) => void;
  pauseRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  finishWorkout: (
    notes: string,
    averageRpe: number,
    customAvgHr?: number,
    customMaxHr?: number
  ) => WorkoutSessionLog;

  // Routine Actions
  addExerciseToRoutine: (dayNumber: number, exercise: Exercise) => void;
  replaceRoutineExercise: (dayNumber: number, oldExerciseId: string, newExercise: Exercise) => void;
  removeExerciseFromRoutine: (dayNumber: number, exerciseId: string) => void;
  resetRoutines: () => void;
  duplicateRoutineDay: (dayNumber: number) => number | undefined;
  /** Reemplaza la rutina completa por una importada (p. ej. desde texto compartido). */
  importRoutines: (routines: DailyRoutine[]) => void;

  // Coach AI Actions
  sendCoachMessage: (text: string) => void;
}

export interface PersistedWorkoutState {
  isWorkoutActive: boolean;
  activeRoutine: DailyRoutine | null;
  activeExerciseIndex: number;
  activeSetIndex: number;
  activeWorkoutSets: LoggedSet[];
  workoutStartedAt: number;
  restTimerDeadline: number;
  isRestTimerActive: boolean;
}

function loadWorkoutSnapshot(key: string): PersistedWorkoutState | null {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as PersistedWorkoutState) : null;
  } catch {
    return null;
  }
}

function parseScreen(raw: string): AppScreen {
  let value = raw;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === 'string') value = parsed;
  } catch {
    // Formato legado: SCREEN se guardaba como texto plano sin JSON. 
  }
  if (
    value === 'landing' ||
    value === 'auth' ||
    value === 'onboarding' ||
    value === 'routine' ||
    value === 'exercises' ||
    value === 'profile'
  ) {
    return value;
  }
  return 'routine';
}

export const AppProvider: React.FC<{
  children: React.ReactNode;
  demoEdition?: boolean;
}> = ({ children, demoEdition = false }) => {
  // La edición demo (/demo) usa sus propias claves de almacenamiento y arranca
  // directamente con los seeds de "Atleta Ejemplo". Nunca toca las claves de
  // una cuenta real ni escribe en Supabase (activeUserId permanece null).
  const S = demoEdition ? DEMO_STORAGE_KEYS : STORAGE_KEYS;

  const [user, setUser] = usePersistedState<UserProfile>(S.USER, INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = usePersistedState<boolean>(
    S.AUTH,
    demoEdition
  );
  const [isHydrating, setIsHydrating] = useState<boolean>(isSupabaseEnabled && !demoEdition);
  const [isDemoUser, setIsDemoUser] = usePersistedState<boolean>(
    S.DEMO,
    demoEdition
  );
  const [currentScreen, setCurrentScreen] = usePersistedState<AppScreen>(
    S.SCREEN,
    demoEdition ? 'routine' : 'landing',
    { parse: parseScreen }
  );
  const [routines, setRoutines] = usePersistedState<DailyRoutine[]>(
    S.ROUTINES,
    demoEdition ? MOCK_ROUTINES : []
  );
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [history, setHistory] = usePersistedState<WorkoutSessionLog[]>(
    S.HISTORY,
    demoEdition ? MOCK_HISTORY : []
  );
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(
    demoEdition ? MOCK_PRS : []
  );
  const [weightHistory, setWeightHistory] = useState<{ date: string; weight: number }[]>(
    demoEdition ? MOCK_WEIGHT_HISTORY : []
  );
  const [chatMessages, setChatMessages] = usePersistedState<ChatMessage[]>(
    S.CHAT,
    demoEdition ? INITIAL_CHAT_MESSAGES : []
  );
  const [isCoachTyping, setIsCoachTyping] = useState<boolean>(false);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const hydratedRef = React.useRef(false);

  // Active workout state (persistido para recuperar sesiones en curso tras recarga).
  // El snapshot se lee UNA sola vez; los estados iniciales comparten la misma lectura.
  const [workoutSnapshot] = useState<PersistedWorkoutState | null>(() =>
    loadWorkoutSnapshot(S.WORKOUT)
  );

  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(() => {
    const s = workoutSnapshot;
    return s?.isWorkoutActive ?? false;
  });
  const [activeRoutine, setActiveRoutine] = useState<DailyRoutine | null>(() => {
    const s = workoutSnapshot;
    return s?.isWorkoutActive ? s.activeRoutine : null;
  });
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(() => {
    const s = workoutSnapshot;
    return s?.isWorkoutActive ? s.activeExerciseIndex : 0;
  });
  const [activeSetIndex, setActiveSetIndex] = useState<number>(() => {
    const s = workoutSnapshot;
    return s?.isWorkoutActive ? s.activeSetIndex : 1;
  });
  const [activeWorkoutSets, setActiveWorkoutSets] = useState<LoggedSet[]>(() => {
    const s = workoutSnapshot;
    return s?.isWorkoutActive ? s.activeWorkoutSets : [];
  });
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number>(() => {
    const s = workoutSnapshot;
    return s?.isWorkoutActive && s.workoutStartedAt > 0 ? s.workoutStartedAt : 0;
  });
  const [workoutElapsedTime, setWorkoutElapsedTime] = useState<number>(() => {
    const s = workoutSnapshot;
    if (s?.isWorkoutActive && s.workoutStartedAt > 0) {
      return Math.floor((Date.now() - s.workoutStartedAt) / 1000);
    }
    return 0;
  });
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(() => {
    const s = workoutSnapshot;
    if (s?.isRestTimerActive && s.restTimerDeadline > 0) {
      return Math.max(0, Math.floor((s.restTimerDeadline - Date.now()) / 1000));
    }
    return 0;
  });
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(() => {
    const s = workoutSnapshot;
    if (!s?.isRestTimerActive) return false;
    return s.restTimerDeadline > Date.now();
  });

  // Workout snapshot persistido
  useEffect(() => {
    const snapshot: PersistedWorkoutState = {
      isWorkoutActive,
      activeRoutine,
      activeExerciseIndex,
      activeSetIndex,
      activeWorkoutSets,
      workoutStartedAt: isWorkoutActive ? workoutStartedAt : 0,
      restTimerDeadline: isRestTimerActive ? Date.now() + restTimerSeconds * 1000 : 0,
      isRestTimerActive,
    };
    localStorage.setItem(S.WORKOUT, JSON.stringify(snapshot));
  }, [
    isWorkoutActive,
    activeRoutine,
    activeExerciseIndex,
    activeSetIndex,
    activeWorkoutSets,
    workoutStartedAt,
    restTimerSeconds,
    isRestTimerActive,
  ]);

  // Workout stopwatch ticker
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorkoutActive]);

  // Rest countdown timer
  useEffect(() => {
    let restInterval: ReturnType<typeof setInterval> | null = null;
    if (isRestTimerActive && restTimerSeconds > 0) {
      restInterval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isRestTimerActive, restTimerSeconds]);

  // Sincronización con Supabase: sesión inicial + cambios de auth
  const applyHydration = useCallback(async (userId: string) => {
    setIsHydrating(true);
    const data = await hydrateAll(userId);
    if (data.profile) setUser(data.profile);
    setRoutines(data.routines);
    setHistory(data.history);
    setPersonalRecords(data.personalRecords);
    setWeightHistory(data.weightHistory);
    setChatMessages(data.chatMessages);
    setActiveUserId(userId);
    hydratedRef.current = true;
    setIsDemoUser(data.profile?.email === DEMO_EMAIL);
    setIsAuthenticated(true);
    setCurrentScreen((prev) => (prev === 'landing' || prev === 'auth' ? 'routine' : prev));
    setIsHydrating(false);
  }, [setUser, setRoutines, setHistory, setChatMessages, setCurrentScreen, setIsAuthenticated, setIsDemoUser]);

  useEffect(() => {
    if (demoEdition || !isSupabaseEnabled) {
      return;
    }

    let active = true;
    getSessionUserId().then((userId) => {
      if (!active) return;
      if (userId) {
        void applyHydration(userId);
      } else {
        setIsHydrating(false);
        setCurrentScreen((prev) => (prev === 'routine' ? 'landing' : prev));
      }
    });

    let unsubscribe: (() => void) | null = null;
    void onAuthStateChange((userId) => {
      if (!active) return;
      if (userId) {
        void applyHydration(userId);
      } else {
        setActiveUserId(null);
        hydratedRef.current = false;
        setIsAuthenticated(false);
        setIsHydrating(false);
        setCurrentScreen('landing');
      }
    }).then((u) => {
      if (active) unsubscribe = u;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [applyHydration, setCurrentScreen, setIsAuthenticated]);

  // Write-through: cada entidad se persiste tras hidratar la sesión
  useEffect(() => {
    if (!isSupabaseEnabled || !isAuthenticated || !activeUserId || !hydratedRef.current) return;
    void persistProfile(user);
  }, [user, isAuthenticated, activeUserId]);

  useEffect(() => {
    if (!isSupabaseEnabled || !isAuthenticated || !activeUserId || !hydratedRef.current) return;
    void persistRoutines(activeUserId, routines);
  }, [routines, isAuthenticated, activeUserId]);

  useEffect(() => {
    if (!isSupabaseEnabled || !isAuthenticated || !activeUserId || !hydratedRef.current) return;
    void persistHistory(activeUserId, history);
  }, [history, isAuthenticated, activeUserId]);

  useEffect(() => {
    if (!isSupabaseEnabled || !isAuthenticated || !activeUserId || !hydratedRef.current) return;
    void persistRecords(activeUserId, personalRecords);
  }, [personalRecords, isAuthenticated, activeUserId]);

  // El historial de peso vive en memoria hasta fusionarse en las sesiones; se
  // persiste por si la sesión se cierra antes de registrar un entrenamiento.
  useEffect(() => {
    if (!isSupabaseEnabled || !isAuthenticated || !activeUserId || !hydratedRef.current) return;
    void persistWeightHistory(activeUserId, weightHistory);
  }, [weightHistory, isAuthenticated, activeUserId]);

  useEffect(() => {
    if (!isSupabaseEnabled || !isAuthenticated || !activeUserId || !hydratedRef.current) return;
    void persistChat(activeUserId, chatMessages);
  }, [chatMessages, isAuthenticated, activeUserId]);

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loginDemoUser = async () => {
    if (isSupabaseEnabled) {
      setIsHydrating(true);
      const { userId, error } = await signInDemo();
      if (!error && userId) {
        await ensureDemoData(userId);
        await applyHydration(userId);
        navigateTo('routine');
      } else {
        // Fallback: demo local si Supabase falla
        setUser(INITIAL_USER);
        setRoutines(MOCK_ROUTINES);
        setIsDemoUser(true);
        setIsAuthenticated(true);
        navigateTo('routine');
      }
      setIsHydrating(false);
      return;
    }
    setUser(INITIAL_USER);
    setRoutines(MOCK_ROUTINES);
    setHistory(MOCK_HISTORY);
    setPersonalRecords(MOCK_PRS);
    setWeightHistory(MOCK_WEIGHT_HISTORY);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setIsDemoUser(true);
    setIsAuthenticated(true);
    navigateTo('routine');
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      setUser(INITIAL_USER);
      setIsDemoUser(false);
      setIsAuthenticated(true);
      navigateTo('routine');
      return { error: null };
    }
    const { userId, error } = await signInWithEmail(email, password);
    if (error || !userId) return { error: translateAuthError(error ?? 'No se pudo iniciar sesión.') };
    await applyHydration(userId);
    setIsDemoUser(false);
    navigateTo('routine');
    return { error: null };
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (!isSupabaseEnabled) {
      setUser({ ...INITIAL_USER, name, email });
      setRoutines([]);
      setIsDemoUser(false);
      setIsAuthenticated(true);
      navigateTo('onboarding');
      return { error: null };
    }
    const { userId, error } = await signUpWithEmail(email, password, name);
    if (error) return { error: translateAuthError(error) };
    if (userId) {
      await applyHydration(userId);
      setIsDemoUser(false);
      navigateTo('onboarding');
    }
    return { error: null };
  };

  const logout = async () => {
    if (isSupabaseEnabled) await signOutSession();
    setActiveUserId(null);
    hydratedRef.current = false;
    setIsDemoUser(false);
    setIsAuthenticated(false);
    setCurrentScreen('landing');
  };

  const resetToDemoData = () => {
    setUser(INITIAL_USER);
    setHistory(MOCK_HISTORY);
    setWeightHistory(MOCK_WEIGHT_HISTORY);
    setPersonalRecords(MOCK_PRS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setRoutines(MOCK_ROUTINES);
    setIsDemoUser(true);
    localStorage.removeItem(S.ROUTINES);
    localStorage.removeItem(S.CHAT);
    localStorage.removeItem(S.WORKOUT);
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(0);
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    navigateTo('routine');
  };

  const addExerciseToRoutine = (dayNumber: number, exercise: Exercise) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: [...r.exercises, exercise],
            estimatedMinutes: r.estimatedMinutes + MINUTES_PER_EXERCISE,
          };
        }
        return r;
      })
    );
  };

  const replaceRoutineExercise = (
    dayNumber: number,
    oldExerciseId: string,
    newExercise: Exercise
  ) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: r.exercises.map((ex) => (ex.id === oldExerciseId ? newExercise : ex)),
          };
        }
        return r;
      })
    );
  };

  const removeExerciseFromRoutine = (dayNumber: number, exerciseId: string) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.dayNumber === dayNumber) {
          return {
            ...r,
            exercises: r.exercises.filter((ex) => ex.id !== exerciseId),
            estimatedMinutes: Math.max(
              MIN_ROUTINE_ESTIMATED_MINUTES,
              r.estimatedMinutes - MINUTES_PER_EXERCISE
            ),
          };
        }
        return r;
      })
    );
  };

  const resetRoutines = () => {
    setRoutines(MOCK_ROUTINES);
  };

  const duplicateRoutineDay = (dayNumber: number): number | undefined => {
    const source = routines.find((r) => r.dayNumber === dayNumber);
    if (!source) return undefined;
    let nextDay = 1;
    const taken = new Set(routines.map((r) => r.dayNumber));
    while (taken.has(nextDay)) nextDay += 1;
    const stamp = Date.now();
    const copy: DailyRoutine = {
      ...source,
      dayNumber: nextDay,
      name: `Copia de ${source.name}`,
      exercises: source.exercises.map((ex, i) => ({
        ...ex,
        id: `${ex.id}_dup_${stamp}_${i}`,
      })),
    };
    setRoutines((prev) => [...prev, copy].sort((a, b) => a.dayNumber - b.dayNumber));
    return nextDay;
  };

  const importRoutines = (imported: DailyRoutine[]) => {
    setRoutines(imported);
    setSelectedDay(imported[0]?.dayNumber ?? 1);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    if (updates.weight) {
      setWeightHistory((prev) => [
        ...prev,
        {
          date: 'Hoy',
          weight: updates.weight!,
        },
      ]);
    }
  };

  const completeOnboarding = (
    newProfileData: Partial<UserProfile>,
    generatedRoutines?: DailyRoutine[]
  ) => {
    const mergedUser: UserProfile = {
      ...user,
      ...newProfileData,
      weeklyCompliance: FRESH_START_COMPLIANCE,
    };
    setUser(mergedUser);
    if (generatedRoutines && generatedRoutines.length > 0) {
      setRoutines(
        [...generatedRoutines].sort((a, b) => a.dayNumber - b.dayNumber)
      );
      setSelectedDay(generatedRoutines[0].dayNumber ?? 1);
    }
    setIsAuthenticated(true);
    navigateTo('routine');
  };

  // Workout management
  const startWorkout = (routineDay?: number) => {
    const day = routineDay !== undefined ? routineDay : selectedDay;
    const targetRoutine = routines.find((r) => r.dayNumber === day) || routines[0];
    setActiveRoutine(targetRoutine);
    setActiveExerciseIndex(0);
    setActiveSetIndex(1);
    setActiveWorkoutSets([]);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(Date.now());
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    setIsWorkoutActive(true);
  };

  const cancelWorkout = () => {
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(0);
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);
    navigateTo('routine');
  };

  const logActiveSet = (weightKg: number, reps: number, rpe: number, sensation: string) => {
    if (!activeRoutine) return;
    const currentEx = activeRoutine.exercises[activeExerciseIndex];
    if (!currentEx) return;

    const newSet: LoggedSet = {
      exerciseId: currentEx.id,
      exerciseName: currentEx.name,
      setNumber: activeSetIndex,
      weightKg,
      reps,
      rpe,
      sensation,
      completedAt: formatClock(new Date()),
    };

    setActiveWorkoutSets((prev) => [...prev, newSet]);

    if (activeSetIndex < currentEx.sets) {
      setActiveSetIndex((prev) => prev + 1);
      startRestTimer(currentEx.restSeconds || DEFAULT_REST_SECONDS);
    } else {
      if (activeExerciseIndex < activeRoutine.exercises.length - 1) {
        setActiveExerciseIndex((prev) => prev + 1);
        setActiveSetIndex(1);
        startRestTimer(currentEx.restSeconds || DEFAULT_REST_SECONDS);
      }
    }
  };

  const goToNextExercise = () => {
    if (!activeRoutine) return;
    if (activeExerciseIndex < activeRoutine.exercises.length - 1) {
      setActiveExerciseIndex((prev) => prev + 1);
      setActiveSetIndex(1);
      setIsRestTimerActive(false);
      setRestTimerSeconds(0);
    }
  };

  const goToPreviousExercise = () => {
    if (activeExerciseIndex > 0) {
      setActiveExerciseIndex((prev) => prev - 1);
      setActiveSetIndex(1);
      setIsRestTimerActive(false);
      setRestTimerSeconds(0);
    }
  };

  const startRestTimer = (seconds: number = 90) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
  };

  const pauseRestTimer = () => {
    setIsRestTimerActive(false);
  };

  const allometricProfile = useMemo(
    () =>
      calculateAllometricProfile(
        user.weight,
        user.age,
        user.height,
        user.gender,
        resolveActivityLevel(user.daysPerWeek, user.primaryGoal)
      ),
    [user.weight, user.age, user.height, user.gender, user.daysPerWeek, user.primaryGoal]
  );

  const adjustRestTimer = (deltaSeconds: number) => {
    setRestTimerSeconds((prev) => Math.max(0, prev + deltaSeconds));
  };

  const finishWorkout = (
    notes: string,
    averageRpe: number,
    customAvgHr?: number,
    customMaxHr?: number
  ): WorkoutSessionLog => {
    const routine = activeRoutine || routines[0];
    const durationMin = Math.max(MIN_DURATION_REPORT_MIN, Math.round(workoutElapsedTime / 60));

    const totalVolume = activeWorkoutSets.reduce(
      (acc, s) => acc + (s.weightKg > 0 ? s.weightKg * s.reps : 0),
      0
    );

    const { allometricCalories, metabolicPowerWatts } = calculateAllometricWorkoutCalories(
      user.weight,
      durationMin,
      averageRpe || DEFAULT_AVERAGE_RPE,
      activeWorkoutSets.length || FALLBACK_TOTAL_SETS
    );

    const finalAvgHr =
      customAvgHr ||
      Math.round(allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.68);
    const finalMaxHr =
      customMaxHr ||
      Math.min(
        allometricProfile.maxHeartRateBpm,
        Math.round(
          allometricProfile.allometricRestingHr + allometricProfile.heartRateReserve * 0.92
        )
      );

    let feedback = `¡Gran trabajo, ${user.name.split(' ')[0]}! Has completado ${activeWorkoutSets.length} series de ${routine?.focus ?? 'entrenamiento'}. `;
    feedback += `Gasto metabólico alométrico: ${allometricCalories} kcal (según escala M^(3/4) de Kleiber, ${metabolicPowerWatts} W de potencia media). `;
    feedback += `Tu ritmo cardíaco promedio fue de ${finalAvgHr} bpm (pico: ${finalMaxHr} bpm) calibrado con tu basal alométrico (${allometricProfile.allometricRestingHr} bpm). `;

    if (totalVolume > 10000) {
      feedback +=
        'Has movido un volumen extraordinario (>10 toneladas), excelente estímulo hipertrófico.';
    } else if (averageRpe >= 8.5) {
      feedback +=
        'La intensidad fue elevada (esfuerzo percibido > 8.5). Asegura al menos 2 gramos de proteína por kilo de peso corporal hoy y descanso de calidad.';
    } else {
      feedback += 'Sesión limpia y controlada con esfuerzo percibido adecuado para asimilar la técnica y fatiga.';
    }

    const newSession: WorkoutSessionLog = {
      id: `wlog_${Date.now()}`,
      date: getLocalDateStamp(new Date()),
      routineName: `${routine.name} (${routine.focus})`,
      durationMinutes: durationMin,
      totalVolumeKg: totalVolume || FALLBACK_TOTAL_VOLUME_KG,
      exercisesCompleted: activeExerciseIndex + 1,
      totalSets: activeWorkoutSets.length || FALLBACK_TOTAL_SETS,
      averageRpe: averageRpe || DEFAULT_AVERAGE_RPE,
      caloriesBurned: allometricCalories,
      averageHeartRate: finalAvgHr,
      peakHeartRate: finalMaxHr,
      allometricPowerWatts: metabolicPowerWatts,
      allometricCalories: allometricCalories,
      userObservations: notes || 'Sesión completada con éxito según lo planificado.',
      aiCoachFeedback: feedback,
      completedSets: activeWorkoutSets,
    };

    setHistory((prev) => [newSession, ...prev]);
    setPersonalRecords(derivePersonalRecords([newSession, ...history], personalRecords));
    setIsWorkoutActive(false);
    setActiveRoutine(null);
    setWorkoutElapsedTime(0);
    setWorkoutStartedAt(0);
    setRestTimerSeconds(0);
    setIsRestTimerActive(false);

    setUser((prev) => ({
      ...prev,
      weeklyCompliance: Math.min(100, prev.weeklyCompliance + COMPLIANCE_INCREMENT_PER_WORKOUT),
    }));

    return newSession;
  };

  const sendCoachMessage = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: 'user',
        text,
        timestamp: formatClock(new Date()),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsCoachTyping(true);

      const coachContext: CoachContext = {
        userWeight: user.weight,
        daysPerWeek: user.daysPerWeek,
        primaryGoal: user.primaryGoal,
        experience: user.experience,
        name: user.name,
        allometric: allometricProfile,
      };

      const localReply = generateCoachReply(text, coachContext);

      void (async () => {
        const coachReply = await withMinDelay(
          fetchServerlessCoachReply(buildServerlessPayload(text, coachContext)),
          COACH_THINKING_DELAY_MS
        );

        const coachMsg: ChatMessage = {
          id: `coach_${Date.now()}`,
          sender: 'coach',
          text: coachReply?.answer ?? localReply.text,
          timestamp: formatClock(new Date()),
          category: localReply.category,
          source: coachReply?.source ?? 'local',
        };

        setChatMessages((prev) => [...prev, coachMsg]);
        setIsCoachTyping(false);
      })();
    },
    [user, allometricProfile, setChatMessages]
  );

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isDemoUser,
      isHydrating,
      currentScreen,
      routines,
      selectedDay,
      history,
      personalRecords,
      weightHistory,
      chatMessages,
      isCoachTyping,

      allometricProfile,

      isWorkoutActive,
      activeRoutine,
      activeExerciseIndex,
      activeSetIndex,
      activeWorkoutSets,
      workoutElapsedTime,
      restTimerSeconds,
      isRestTimerActive,

      navigateTo,
      setSelectedDay,
      loginDemoUser,
      loginWithEmail,
      registerWithEmail,
      logout,
      resetToDemoData,
      updateUserProfile,
      completeOnboarding,

      startWorkout,
      cancelWorkout,
      logActiveSet,
      goToNextExercise,
      goToPreviousExercise,
      startRestTimer,
      pauseRestTimer,
      adjustRestTimer,
      finishWorkout,

      addExerciseToRoutine,
      replaceRoutineExercise,
      removeExerciseFromRoutine,
      resetRoutines,
      duplicateRoutineDay,
      importRoutines,

      sendCoachMessage,
    }),
    [
      user,
      isAuthenticated,
      isDemoUser,
      isHydrating,
      currentScreen,
      routines,
      selectedDay,
      history,
      personalRecords,
      weightHistory,
      chatMessages,
      isCoachTyping,
      allometricProfile,
      isWorkoutActive,
      activeRoutine,
      activeExerciseIndex,
      activeSetIndex,
      activeWorkoutSets,
      workoutElapsedTime,
      restTimerSeconds,
      isRestTimerActive,
      navigateTo,
      setSelectedDay,
      loginDemoUser,
      loginWithEmail,
      registerWithEmail,
      logout,
      resetToDemoData,
      updateUserProfile,
      completeOnboarding,
      startWorkout,
      cancelWorkout,
      logActiveSet,
      goToNextExercise,
      goToPreviousExercise,
      startRestTimer,
      pauseRestTimer,
      adjustRestTimer,
      finishWorkout,
      addExerciseToRoutine,
      replaceRoutineExercise,
      removeExerciseFromRoutine,
      resetRoutines,
      duplicateRoutineDay,
      importRoutines,
      sendCoachMessage,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;