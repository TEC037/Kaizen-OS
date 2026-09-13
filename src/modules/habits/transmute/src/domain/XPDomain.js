/**
 * ELEMENTO: XPDomain.js
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Definición de valores de XP, penalizaciones por entropía y progresión de niveles.
 */

export const XP_ACTIONS = {
  habit_completed:              50,    
  article_read:                 30,    
  challenge_completed:         200,    
  pact_milestone:              150,    
  perfect_day:                 100,    
  perfect_week:                500,    
  perfect_month:              2000,    
  social_reaction_given:         5,    
  social_reaction_received:     10,    
};


export const ENTROPY_RULES = {
  habit_missed:                 -10,   
  habit_reverted:               -15,   
  biological_inertia_penalty:   2.0,   
};

/**
 * Los 7 Estadios del Proceso Alquímico (Mapping de Niveles)
 * 1-10: Calcination (Fase Nigredo)
 * 11-20: Dissolution (Fase Albedo - Primera Limpieza)
 * 21-30: Separation (Fase Albedo - Diferenciación)
 * 31-40: Conjunction (Fase Citrinitas - Unión)
 * 41-50: Fermentation (Fase Citrinitas - Renacimiento)
 * 51-60: Distillation (Fase Rubedo - Purificación Final)
 * 61+: Coagulation (Fase Rubedo - Manifestación)
 */
export const STAGES = [
  { id: 'calcination', name: 'Calcinación', levels: [1, 10], goal: 'Quemar el Ego' },
  { id: 'dissolution', name: 'Disolución', levels: [11, 20], goal: 'Purificar las Emociones' },
  { id: 'separation', name: 'Separación', levels: [21, 30], goal: 'Filtrar la Verdad' },
  { id: 'conjunction', name: 'Conjunción', levels: [31, 40], goal: 'Unión de Opuestos' },
  { id: 'fermentation', name: 'Fermentación', levels: [41, 50], goal: 'Muerte y Renacimiento' },
  { id: 'distillation', name: 'Destilación', levels: [51, 60], goal: 'Pureza Absoluta' },
  { id: 'coagulation', name: 'Coagulación', levels: [61, 100], goal: 'El Ser de Oro' },
];

export const getStreakMultiplier = (streak) => {
  if (streak >= 66) return 4.0;  
  if (streak >= 30) return 3.0;  
  if (streak >= 14) return 2.0;  
  if (streak >= 7)  return 1.5;  
  return 1.0;                    
};

/**
 * [ACCIÓN]: Obtener nombre de fase según racha.
 */
export const getStreakPhaseName = (streak) => {
  if (streak >= 66) return 'Opus Absolutus';
  if (streak >= 30) return 'Materia Fija';
  if (streak >= 14) return 'Momentum Ardentio';
  if (streak >= 7)  return 'Primera Digestión';
  return 'Materia Prima';
};

export const calculateCompletionXp = (baseXp, streak) => {
  const multiplier = getStreakMultiplier(streak);
  const streakBonus = Math.floor(streak * 8); 
  const total = Math.round(baseXp * multiplier) + streakBonus;
  return { total, base: baseXp, bonus: streakBonus + Math.round(baseXp * (multiplier - 1)), multiplier };
};

export const calculateEntropyPenalty = (streak) => {
  
  
  
  const completionXp = calculateCompletionXp(XP_ACTIONS.habit_completed, streak).total;
  return -completionXp;
};

export const xpForLevel = (level) => {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(i * 100 * Math.pow(1.08, i));
  }
  return total;
};

export const calculateLevelFromXp = (xp) => {
  if (xp <= 0) return 1;
  let level = 1;
  while (level < 100 && xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
};

export const getLevelProgress = (xp) => {
  const level = calculateLevelFromXp(xp);
  if (level >= 100) return { level: 100, progress: 1, currentLevelXp: xp, nextLevelXp: xp };
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
  return { level, progress: Math.min(1, Math.max(0, progress)), currentLevelXp, nextLevelXp };
};

export const ALCHEMICAL_PHASES = [
  { id: 'nigredo', name: 'Nigredo', subtitle: 'La Muerte del Plomo', levelRange: [1, 10] },
  { id: 'albedo', name: 'Albedo', subtitle: 'La Aurora de Plata', levelRange: [11, 30] },
  { id: 'citrinitas', name: 'Citrinitas', subtitle: 'El Sol de la Voluntad', levelRange: [31, 50] },
  { id: 'rubedo', name: 'Rubedo', subtitle: 'La Piedra del Ser', levelRange: [51, 100] },
];

export const getAlchemicalPhase = (level) => {
  return ALCHEMICAL_PHASES.find((phase) => level >= phase.levelRange[0] && level <= phase.levelRange[1]) || ALCHEMICAL_PHASES[0];
};

export const ALCHEMICAL_RANKS = [
  { minLevel: 1,   maxLevel: 5,   title: 'Plomo Opaco' },
  { minLevel: 6,   maxLevel: 10,  title: 'Crisol Ardentio' },
  { minLevel: 11,  maxLevel: 15,  title: 'Materia Disuelta' },
  { minLevel: 16,  maxLevel: 20,  title: 'Filtro de Esencia' },
  { minLevel: 21,  maxLevel: 25,  title: 'Plata Primaria' },
  { minLevel: 26,  maxLevel: 30,  title: 'Luz Lunar' },
  { minLevel: 31,  maxLevel: 35,  title: 'Adepto del Sol' },
  { minLevel: 36,  maxLevel: 40,  title: 'Forjador de Oro' },
  { minLevel: 41,  maxLevel: 50,  title: 'Maestro de Materia' },
  { minLevel: 51,  maxLevel: 60,  title: 'Esencia Destilada' },
  { minLevel: 61,  maxLevel: 100, title: 'El Oro Eterno' },
];

export const getAlchemicalRank = (level) => {
  return ALCHEMICAL_RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) || ALCHEMICAL_RANKS[0];
};

export const isPerfectDay = (habits, dateStr) => {
  if (!habits || habits.length === 0) return false;
  return habits.every((h) => h.completedDays && h.completedDays[dateStr]);
};

export const countPerfectDays = (habits) => {
  if (!habits || habits.length === 0) return 0;
  const allDates = new Set();
  habits.forEach((h) => {
    Object.keys(h.completedDays || {}).forEach((d) => allDates.add(d));
  });
  let count = 0;
  allDates.forEach((date) => { if (isPerfectDay(habits, date)) count++; });
  return count;
};

export const getPerfectDayStreak = (habits) => {
  if (!habits || habits.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    if (isPerfectDay(habits, dateStr)) { streak++; } else { if (i > 0) break; }
  }
  return streak;
};
