import { supabase } from '../lib/supabase';

/**
 * oracle.js — EL CLIENTE DEL ORÁCULO DE HERMES
 * Servicio que llama a la Edge Function oracle-insight.
 * Cache de 24h en localStorage para no gastar cuota de Gemini.
 */

const CACHE_KEY = 'transmute_oracle_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; 



const FALLBACK_INSIGHTS = [
  {
    insight: '',
    suggestion: 'Continúa con la Gran Obra. Tu constancia es el único camino.',
    quote: '',
  }
];

/**
 * Construye el objeto de stats necesario para el Oráculo.
 */
const buildStats = (storeData) => {
  const { habits, level, xp, bestStreak, perfectDaysCount } = storeData;

  const totalDone = habits.reduce(
    (acc, h) => acc + Object.keys(h.completedDays || {}).length, 0
  );
  const totalPossible = habits.length * 30;
  const completionRate = totalPossible > 0 ? totalDone / totalPossible : 0;

  const topHabit = habits.reduce(
    (top, h) => (h.streak || 0) > (top?.streak || 0) ? h : top, null
  );

  const weakHabit = habits.reduce((weak, h) => {
    const rate = totalPossible > 0
      ? Object.keys(h.completedDays || {}).length / 30 : 0;
    const weakRate = totalPossible > 0
      ? Object.keys(weak?.completedDays || {}).length / 30 : 1;
    return rate < weakRate ? h : weak;
  }, habits[0] || null);

  let phase = 'nigredo';
  if (level >= 51) phase = 'rubedo';
  else if (level >= 26) phase = 'citrinitas';
  else if (level >= 11) phase = 'albedo';

  return {
    level,
    phase,
    rank: level >= 99 ? 'Magister del Opus Supremo' : `Nivel ${level}`,
    bestStreak: bestStreak || 0,
    completionRate,
    topHabit: topHabit?.name,
    weakHabit: weakHabit?.name,
    perfectDays: perfectDaysCount || 0,
    habitCount: habits.length,
  };
};

const getCached = (mode) => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const entry = cache[mode];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch { return null; }
};

const setCache = (mode, data) => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    cache[mode] = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { }
};

/**
 * Llama al Oráculo de Hermes (Edge Function).
 */
export const askOracle = async (mode, storeData) => {
  const cached = getCached(mode);
  if (cached) return { data: cached, fromCache: true };

  if (!storeData.habits || storeData.habits.length === 0) {
    return { data: FALLBACK_INSIGHTS[0], fromCache: false, isFallback: true };
  }

  try {
    const stats = buildStats(storeData);
    const { data, error } = await supabase.functions.invoke('oracle-insight', {
      body: { mode, stats },
    });

    if (error || !data?.success) {
      const fallback = FALLBACK_INSIGHTS[0];
      return { data: fallback, fromCache: false, isFallback: true };
    }

    setCache(mode, data.data);
    return { data: data.data, fromCache: false };
  } catch (err) {
    const fallback = FALLBACK_INSIGHTS[0];
    return { data: fallback, fromCache: false, isFallback: true };
  }
};

export const clearOracleCache = () => {
  try { localStorage.removeItem(CACHE_KEY); } catch { }
};
