import { getSupabaseClient } from './supabaseClient';
import {
  ChatMessage,
  DailyRoutine,
  PersonalRecord,
  UserProfile,
  WorkoutSessionLog,
  Result,
} from '../types';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config/constants';
import { INITIAL_USER } from '../data/mockUser';
import { MOCK_ROUTINES } from '../data/mockRoutines';
import { INITIAL_CHAT_MESSAGES } from '../data/mockCoach';
import { MOCK_HISTORY, MOCK_PRS, MOCK_WEIGHT_HISTORY } from '../data/mockProgress';

interface HydratedData {
  profile: UserProfile | null;
  routines: DailyRoutine[];
  history: WorkoutSessionLog[];
  personalRecords: PersonalRecord[];
  weightHistory: { date: string; weight: number }[];
  chatMessages: ChatMessage[];
  errors: string[];
}

// ---------- Mappers ----------

function profileRowToUser(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? INITIAL_USER.name),
    email: String(row.email ?? ''),
    age: Number(row.age ?? INITIAL_USER.age),
    gender: row.gender ? String(row.gender) : INITIAL_USER.gender,
    height: Number(row.height ?? INITIAL_USER.height),
    weight: Number(row.weight ?? INITIAL_USER.weight),
    experience: (row.experience as UserProfile['experience']) || INITIAL_USER.experience,
    daysPerWeek: Number(row.days_per_week ?? INITIAL_USER.daysPerWeek),
    avgDuration: Number(row.avg_duration ?? INITIAL_USER.avgDuration),
    primaryGoal: (row.primary_goal as UserProfile['primaryGoal']) || INITIAL_USER.primaryGoal,
    targetMuscles: (row.target_muscles as string[]) || INITIAL_USER.targetMuscles,
    equipment: (row.equipment as string[]) || INITIAL_USER.equipment,
    injuries: String(row.injuries ?? ''),
    weeklyCompliance: Number(row.weekly_compliance ?? INITIAL_USER.weeklyCompliance),
    unitSystem: (row.unit_system as 'metric' | 'imperial') || 'metric',
    notifications: (row.notifications as UserProfile['notifications']) ||
      INITIAL_USER.notifications,
  };
}

function userToProfileRow(user: UserProfile) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    height: user.height,
    weight: user.weight,
    experience: user.experience,
    days_per_week: user.daysPerWeek,
    avg_duration: user.avgDuration,
    primary_goal: user.primaryGoal,
    target_muscles: user.targetMuscles,
    equipment: user.equipment,
    injuries: user.injuries,
    weekly_compliance: user.weeklyCompliance,
    unit_system: user.unitSystem,
    notifications: user.notifications,
  };
}

function routineRowToRoutine(row: Record<string, unknown>): DailyRoutine {
  return {
    dayNumber: Number(row.day_number ?? 1),
    name: String(row.name ?? ''),
    focus: String(row.focus ?? ''),
    description: String(row.description ?? ''),
    estimatedMinutes: Number(row.estimated_minutes ?? 0),
    difficulty: (row.difficulty as DailyRoutine['difficulty']) || 'principiante',
    targetMuscles: (row.target_muscles as string[]) || [],
    exercises: (row.exercises as DailyRoutine['exercises']) || [],
    isRestDay: Boolean(row.is_rest_day),
  };
}

function routineToRow(userId: string, r: DailyRoutine, position: number) {
  return {
    user_id: userId,
    day_number: r.dayNumber,
    name: r.name,
    focus: r.focus,
    description: r.description,
    estimated_minutes: r.estimatedMinutes,
    difficulty: r.difficulty,
    target_muscles: r.targetMuscles,
    exercises: r.exercises,
    is_rest_day: r.isRestDay ?? false,
    position,
  };
}

function sessionToRow(userId: string, s: WorkoutSessionLog) {
  return {
    id: s.id,
    user_id: userId,
    date: s.date,
    routine_name: s.routineName,
    duration_minutes: s.durationMinutes,
    total_volume_kg: s.totalVolumeKg,
    exercises_completed: s.exercisesCompleted,
    total_sets: s.totalSets,
    average_rpe: s.averageRpe,
    calories_burned: s.caloriesBurned,
    average_heart_rate: s.averageHeartRate ?? null,
    peak_heart_rate: s.peakHeartRate ?? null,
    allometric_power_watts: s.allometricPowerWatts ?? null,
    allometric_calories: s.allometricCalories ?? null,
    user_observations: s.userObservations,
    ai_coach_feedback: s.aiCoachFeedback,
    completed_sets: s.completedSets,
  };
}

function rowToSession(row: Record<string, unknown>): WorkoutSessionLog {
  return {
    id: String(row.id ?? ''),
    date: String(row.date ?? ''),
    routineName: String(row.routine_name ?? ''),
    durationMinutes: Number(row.duration_minutes ?? 0),
    totalVolumeKg: Number(row.total_volume_kg ?? 0),
    exercisesCompleted: Number(row.exercises_completed ?? 0),
    totalSets: Number(row.total_sets ?? 0),
    averageRpe: Number(row.average_rpe ?? 0),
    caloriesBurned: Number(row.calories_burned ?? 0),
    averageHeartRate: row.average_heart_rate != null ? Number(row.average_heart_rate) : undefined,
    peakHeartRate: row.peak_heart_rate != null ? Number(row.peak_heart_rate) : undefined,
    allometricPowerWatts:
      row.allometric_power_watts != null ? Number(row.allometric_power_watts) : undefined,
    allometricCalories:
      row.allometric_calories != null ? Number(row.allometric_calories) : undefined,
    userObservations: String(row.user_observations ?? ''),
    aiCoachFeedback: String(row.ai_coach_feedback ?? ''),
    completedSets: (row.completed_sets as WorkoutSessionLog['completedSets']) || [],
  };
}

function prToRow(userId: string, pr: PersonalRecord) {
  return {
    id: pr.id,
    user_id: userId,
    exercise_name: pr.exerciseName,
    record_value: pr.recordValue,
    date: pr.date,
    category: pr.category,
    previous_value: pr.previousValue,
    progress_percent: pr.progressPercent,
    allometric_score: pr.allometricScore ?? null,
    normalized_70kg_load: pr.normalized70kgLoad ?? null,
  };
}

function rowToPr(row: Record<string, unknown>): PersonalRecord {
  return {
    id: String(row.id ?? ''),
    exerciseName: String(row.exercise_name ?? ''),
    recordValue: String(row.record_value ?? ''),
    date: String(row.date ?? ''),
    category: String(row.category ?? ''),
    previousValue: String(row.previous_value ?? ''),
    progressPercent: Number(row.progress_percent ?? 0),
    allometricScore: row.allometric_score != null ? Number(row.allometric_score) : undefined,
    normalized70kgLoad:
      row.normalized_70kg_load != null ? Number(row.normalized_70kg_load) : undefined,
  };
}

function chatToRow(userId: string, m: ChatMessage) {
  return {
    id: m.id,
    user_id: userId,
    sender: m.sender,
    text: m.text,
    timestamp: m.timestamp,
    category: m.category ?? null,
    source: m.source ?? null,
    suggested_action: m.suggestedAction ?? null,
  };
}

function rowToChat(row: Record<string, unknown>): ChatMessage {
  const suggested = row.suggested_action as ChatMessage['suggestedAction'] | null;
  return {
    id: String(row.id ?? ''),
    sender: (row.sender as ChatMessage['sender']) || 'coach',
    text: String(row.text ?? ''),
    timestamp: String(row.timestamp ?? ''),
    category: (row.category as ChatMessage['category']) || undefined,
    source: (row.source as ChatMessage['source']) || undefined,
    suggestedAction: suggested ?? undefined,
  };
}

function weightToRow(userId: string, w: { date: string; weight: number }) {
  return { user_id: userId, date: w.date, weight: w.weight };
}

// ---------- Auth ----------

export async function signInWithEmail(email: string, password: string) {
  const client = await getSupabaseClient();
  if (!client) return { error: 'Supabase no configurado' };
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  return { userId: data.user?.id ?? null, error: error?.message ?? null };
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const client = await getSupabaseClient();
  if (!client) return { error: 'Supabase no configurado' };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: origin },
  });
  return {
    userId: data.user?.id ?? null,
    session: data.session,
    error: error?.message ?? null,
  };
}

export async function signInDemo() {
  const client = await getSupabaseClient();
  if (!client) return { error: 'Supabase no configurado' };

  const { data, error } = await client.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (!error && data.user) {
    return { userId: data.user.id, error: null };
  }

  // La cuenta demo aún no existe: créala y reintenta.
  if (error?.message?.toLowerCase().includes('invalid login credentials')) {
    const { error: signUpError } = await client.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      options: { data: { name: 'Carlos Ramírez' } },
    });
    if (!signUpError) {
      const retry = await client.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (retry.data.user) return { userId: retry.data.user.id, error: null };
      return { error: 'No se pudo crear la cuenta demo. Revisa la confirmación de email.' };
    }
  }

  return { userId: null, error: error?.message ?? null };
}

export async function signOutSession(): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  const { error } = await client.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function resetPassword(email: string) {
  const client = await getSupabaseClient();
  if (!client) return { error: 'Supabase no configurado' };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/?type=recovery`,
  });
  return { error: error?.message ?? null };
}

export async function getSessionUserId(): Promise<string | null> {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function onAuthStateChange(
  cb: (userId: string | null) => void
): Promise<(() => void) | null> {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    cb(session?.user?.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}

// ---------- Datos ----------

export async function hydrateAll(userId: string): Promise<HydratedData> {
  const empty: HydratedData = {
    profile: null,
    routines: [],
    history: [],
    personalRecords: [],
    weightHistory: [],
    chatMessages: [],
    errors: [],
  };
  const client = await getSupabaseClient();
  if (!client) return empty;

  const [profileRes, routinesRes, sessionsRes, prsRes, weightRes, chatRes] = await Promise.all([
    client.from('profiles').select('*').eq('id', userId).maybeSingle(),
    client.from('routines').select('*').eq('user_id', userId).order('day_number'),
    client.from('workout_sessions').select('*').eq('user_id', userId).order('created_at'),
    client.from('personal_records').select('*').eq('user_id', userId),
    client.from('weight_history').select('*').eq('user_id', userId).order('date'),
    client.from('chat_messages').select('*').eq('user_id', userId).order('timestamp'),
  ]);

  const errors: string[] = [];
  if (profileRes.error) errors.push(`profiles: ${profileRes.error.message}`);
  if (routinesRes.error) errors.push(`routines: ${routinesRes.error.message}`);
  if (sessionsRes.error) errors.push(`workout_sessions: ${sessionsRes.error.message}`);
  if (prsRes.error) errors.push(`personal_records: ${prsRes.error.message}`);
  if (weightRes.error) errors.push(`weight_history: ${weightRes.error.message}`);
  if (chatRes.error) errors.push(`chat_messages: ${chatRes.error.message}`);

  return {
    profile: profileRes.data ? profileRowToUser(profileRes.data) : null,
    routines: (routinesRes.data as Record<string, unknown>[])?.map(routineRowToRoutine).sort(
      (a, b) => a.dayNumber - b.dayNumber
    ) ?? [],
    history: (sessionsRes.data as Record<string, unknown>[])?.map(rowToSession).reverse() ?? [],
    personalRecords: (prsRes.data as Record<string, unknown>[])?.map(rowToPr) ?? [],
    weightHistory: (weightRes.data as { date: string; weight: number }[]) ?? [],
    chatMessages: (chatRes.data as Record<string, unknown>[])?.map(rowToChat) ?? [],
    errors,
  };
}

export async function persistProfile(user: UserProfile): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  const { error } = await client.from('profiles').upsert(userToProfileRow(user), { onConflict: 'id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function persistRoutines(
  userId: string,
  routines: DailyRoutine[],
  options?: { allowClear?: boolean }
): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  if (routines.length === 0) {
    // Solo se borra el plan cuando el caller lo pide explícitamente
    // (p.ej. reset de plan). Un array vacío transitorio NO debe vaciar la DB.
    if (!options?.allowClear) return { ok: true, data: undefined };
    const { error } = await client.from('routines').delete().eq('user_id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: undefined };
  }
  const rows = routines.map((r, i) => routineToRow(userId, r, i));
  const { error: upsertError } = await client.from('routines').upsert(rows, { onConflict: 'user_id,day_number' });
  if (upsertError) return { ok: false, error: upsertError.message };
  
  // Remove stale days that no longer exist in the plan
  const activeDays = routines.map((r) => r.dayNumber);
  if (activeDays.length > 0) {
    const { error: deleteError } = await client.from('routines').delete().eq('user_id', userId).not('day_number', 'in', `(${activeDays.join(',')})`);
    if (deleteError) return { ok: false, error: deleteError.message };
  }
  return { ok: true, data: undefined };
}

export async function hydrateCustomRoutines(
  userId: string
): Promise<{ ok: boolean; data: Record<string, unknown>[]; error?: string }> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: [] };
  const { data, error } = await client
    .from('custom_routines')
    .select('payload')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  if (error) return { ok: false, error: error.message, data: [] };
  return { ok: true, data: ((data ?? []) as { payload: Record<string, unknown> }[]).map((r) => r.payload) };
}

export async function persistCustomRoutines(
  userId: string,
  routines: Record<string, unknown>[],
  options?: { allowClear?: boolean }
): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  if (routines.length === 0) {
    // Mismo resguardo que persistRoutines: un vacío transitorio no borra la DB.
    if (!options?.allowClear) return { ok: true, data: undefined };
    const { error } = await client.from('custom_routines').delete().eq('user_id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: undefined };
  }
  const rows = routines.map((r, i) => ({
    user_id: userId,
    client_id: String(r.id ?? `${r.name ?? 'custom'}-${i}`),
    name: String(r.name ?? 'Rutina personalizada'),
    category: String(r.category ?? 'todos'),
    difficulty: String(r.difficulty ?? 'Moderada'),
    duration_minutes: Number(r.durationMinutes ?? 0),
    payload: r,
    position: i,
  }));
  const { error: upsertError } = await client
    .from('custom_routines')
    .upsert(rows, { onConflict: 'user_id,client_id' });
  if (upsertError) return { ok: false, error: upsertError.message };

  const activeIds = routines.map((r) => String(r.id ?? `${r.name ?? 'custom'}-${0}`));
  if (activeIds.length > 0) {
    const { error: deleteError } = await client
      .from('custom_routines')
      .delete()
      .eq('user_id', userId)
      .not('client_id', 'in', `(${activeIds.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')})`);
    if (deleteError) return { ok: false, error: deleteError.message };
  }
  return { ok: true, data: undefined };
}

export async function persistHistory(userId: string, history: WorkoutSessionLog[]): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  if (history.length === 0) return { ok: true, data: undefined };
  const { error } = await client.from('workout_sessions').upsert(
    history.map((s) => sessionToRow(userId, s)),
    { onConflict: 'id' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function persistRecords(userId: string, prs: PersonalRecord[]): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  if (prs.length === 0) return { ok: true, data: undefined };
  const { error } = await client.from('personal_records').upsert(
    prs.map((pr) => prToRow(userId, pr)),
    { onConflict: 'id' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function persistWeightHistory(
  userId: string,
  weightHistory: { date: string; weight: number }[]
): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  if (weightHistory.length === 0) return { ok: true, data: undefined };
  const { error } = await client.from('weight_history').upsert(
    weightHistory.map((w) => weightToRow(userId, w)),
    { onConflict: 'user_id,date' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function persistChat(userId: string, messages: ChatMessage[]): Promise<Result<void>> {
  const client = await getSupabaseClient();
  if (!client) return { ok: true, data: undefined };
  if (messages.length === 0) return { ok: true, data: undefined };
  const { error } = await client.from('chat_messages').upsert(
    messages.map((m) => chatToRow(userId, m)),
    { onConflict: 'id' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

/** Si el usuario (típicamente la demo) no tiene rutinas, sembra los datos demo. */
export async function ensureDemoData(userId: string) {
  const client = await getSupabaseClient();
  if (!client) return;
  const { data } = await client.from('routines').select('day_number').eq('user_id', userId);
  if (data && data.length > 0) return;
  await persistRoutines(userId, MOCK_ROUTINES);
  await persistHistory(userId, MOCK_HISTORY);
  await persistRecords(userId, MOCK_PRS);
  await persistWeightHistory(userId, MOCK_WEIGHT_HISTORY);
  await persistChat(userId, INITIAL_CHAT_MESSAGES);
}