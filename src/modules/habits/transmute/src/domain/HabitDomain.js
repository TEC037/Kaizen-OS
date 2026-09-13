/**
 * ELEMENTO: HabitDomain.js
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Funciones puras que definen las reglas de cálculo, rachas y logros de los hábitos.
 */


export { calculateLevelFromXp } from './XPDomain';

const toLocalIso = (d = new Date()) => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

/**
 * Calcula la racha actual basada en los días completados.
 * Tolerante a huecos del día actual: si hoy no está completado,
 * revisa ayer antes de romper la racha.
 * @param {object} completedDays - Mapa de fechas (dateStr → true)
 * @returns {number} Racha en días
 */
export const calculateStreak = (completedDays) => {
  if (!completedDays) return 0;
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = toLocalIso(d);

    if (completedDays[dateStr]) {
      streak++;
    } else {
      
      if (i > 0) break;
    }
  }
  return streak;
};



/**
 * Verifica si se han desbloqueado logros nuevos.
 * Soporta múltiples tipos de condición para el sistema expandido (40 logros).
 * @param {Array} habits
 * @param {number} bestStreak
 * @param {Array<string>} existingAchievements - IDs ya obtenidos
 * @param {Array} definitions - Definiciones de logros
 * @returns {Array} Nuevos logros desbloqueados
 */
export const checkAchievements = (habits, bestStreak, existingAchievements, definitions) => {
  const newAchievements = [];
  const totalCompletions = habits.reduce(
    (sum, h) => sum + Object.keys(h.completedDays || {}).length,
    0
  );

  
  const activeAreas = new Set(
    habits
      .filter((h) => Object.keys(h.completedDays || {}).length > 0)
      .map((h) => h.area || 'Dominio del Ser')
  );

  definitions.forEach((ach) => {
    if (existingAchievements.includes(ach.id)) return;

    let conditionMet = false;

    switch (ach.conditionType) {
      case 'total_completions':
        
        conditionMet = totalCompletions >= ach.conditionValue;
        break;

      case 'max_streak':
        
        conditionMet = bestStreak >= ach.conditionValue;
        break;

      case 'tree_completed':
        
        conditionMet =
          habits.filter((h) => Object.keys(h.completedDays || {}).length > 0).length >=
          ach.conditionValue;
        break;

      case 'unique_areas':
        
        conditionMet = activeAreas.size >= ach.conditionValue;
        break;

      case 'habit_count':
        
        conditionMet = habits.length >= ach.conditionValue;
        break;

      default:
        break;
    }

    if (conditionMet) {
      newAchievements.push(ach);
    }
  });

  return newAchievements;
};

/**
 * Verifica si el día especificado fue un "Día Perfecto"
 * (todos los hábitos activos completados).
 * @param {Array} habits
 * @param {string} dateStr - Formato toDateString()
 * @returns {boolean}
 */
export const isPerfectDay = (habits, dateStr) => {
  if (!habits || habits.length === 0) return false;
  return habits.every((h) => h.completedDays && h.completedDays[dateStr]);
};

/**
 * Calcula la tasa de completación del día de hoy (0–1).
 * @param {Array} habits
 * @returns {number}
 */
export const getTodayCompletionRate = (habits) => {
  if (!habits || habits.length === 0) return 0;
  const today = toLocalIso();
  const completed = habits.filter((h) => h.completedDays && h.completedDays[today]).length;
  return completed / habits.length;
};

/**
 * Agrupa las completaciones por área de vida para el RadarChart.
 * @param {Array} habits
 * @param {number} days - Ventana de tiempo en días (default: 30)
 * @returns {Array<{ area: string, completions: number, habits: number }>}
 */
export const getCompletionsByArea = (habits, days = 30) => {
  const dateWindow = new Set();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateWindow.add(toLocalIso(d));
  }

  const areaMap = {};

  habits.forEach((h) => {
    const area = h.area || 'Dominio del Ser';
    if (!areaMap[area]) areaMap[area] = { area, completions: 0, habits: 0 };
    areaMap[area].habits++;
    Object.keys(h.completedDays || {}).forEach((date) => {
      if (dateWindow.has(date)) areaMap[area].completions++;
    });
  });

  return Object.values(areaMap);
};
/**
 * Evoluciona el título de un hábito basado en su definición y racha actual.
 * @param {object} habit - Instancia del hábito del usuario
 * @param {Array} definitions - Biblioteca de definiciones
 * @returns {string} Título evolucionado
 */
export const evolveHabitTitle = (habit, definitions) => {
  if (!habit || !definitions) return habit?.name || '';
  
  
  const def = definitions.find(d => d.name === habit.name || d.id === habit.definitionId);
  
  
  if (!def || !def.intensity) {
    return (habit.name || '').replace(/\{v\}/g, "X");
  }

  let evolved = def.name;
  const totalCompletions = Object.keys(habit.completedDays || {}).length;

  Object.keys(def.intensity).forEach(key => {
    
    const value = def.intensity[key](habit.streak || 0, totalCompletions);
    
    evolved = evolved.split(`{${key}}`).join(value);
  });
  
  return evolved;
};

/**
 * Evoluciona el método de un hábito basado en su definición y racha actual.
 */
export const evolveHabitMethod = (habit, definitions) => {
  if (!habit || !definitions) return habit?.method || '';
  const def = definitions.find(d => d.name === habit.name || d.id === habit.definitionId);
  if (!def || !def.intensity) {
    return (habit.method || '').replace(/\{v\}/g, "X");
  }

  let evolved = def.method;
  const totalCompletions = Object.keys(habit.completedDays || {}).length;

  Object.keys(def.intensity).forEach(key => {
    const value = def.intensity[key](habit.streak || 0, totalCompletions);
    evolved = evolved.split(`{${key}}`).join(value);
  });
  
  return evolved;
};
