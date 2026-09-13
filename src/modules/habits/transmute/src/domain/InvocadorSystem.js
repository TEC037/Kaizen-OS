/**
 * ELEMENTO: InvocadorSystem.js
 * FASE: Beta (Estabilidad Crítica)
 * PROPÓSITO: Sistema de rangos y títulos dinámicos basados en la experiencia acumulada.
 */

export const INVOCADOR_TIERS = [
  {
    id: 'aprendiz',
    min: 0,
    max: 999,
    icon: '🧪',
    nombre: 'Aprendiz',
    subtitulo: 'Primeras hipótesis',
    descripcion: 'Observas el sistema desde afuera. El método todavía es ajeno.',
    color: '#94a3b8',
    colorHex: '#94a3b8',
  },
  {
    id: 'observador',
    min: 1000,
    max: 2499,
    icon: '🔬',
    nombre: 'Observador',
    subtitulo: 'Método empírico activo',
    descripcion: 'Registras datos reales sobre tu comportamiento. El autoconocimiento empieza a tener estructura.',
    color: '#64748b',
    colorHex: '#64748b',
  },
  {
    id: 'tecnico',
    min: 2500,
    max: 4999,
    icon: '⚗️',
    nombre: 'Técnico',
    subtitulo: 'Laboratorio personal',
    descripcion: 'Tus hábitos son experimentos con variables controladas. Empiezas a detectar señal entre el ruido.',
    color: '#78716c',
    colorHex: '#78716c',
  },
  {
    id: 'biologo',
    min: 5000,
    max: 8999,
    icon: '🧬',
    nombre: 'Biólogo de Hábitos',
    subtitulo: 'Neuroplasticidad aplicada',
    descripcion: 'Comprendes que los hábitos son rutas neurales que se refuerzan por repetición. Entrenas el cerebro con datos.',
    color: '#0d9488',
    colorHex: '#0d9488',
  },
  {
    id: 'explorador',
    min: 9000,
    max: 14999,
    icon: '🔭',
    nombre: 'Explorador',
    subtitulo: 'Cartografía conductual',
    descripcion: 'Mapeas tus patrones con precisión. Sabes dónde falla el sistema y corriges con evidencia, no con culpa.',
    color: '#0284c7',
    colorHex: '#0284c7',
  },
  {
    id: 'analista',
    min: 15000,
    max: 22999,
    icon: '🧠',
    nombre: 'Analista',
    subtitulo: 'Modelos predictivos',
    descripcion: 'Puedes predecir en qué condiciones fallas. Tus intervenciones sobre ti mismo son calibradas y deliberadas.',
    color: '#7c3aed',
    colorHex: '#7c3aed',
  },
  {
    id: 'ingeniero',
    min: 23000,
    max: 34999,
    icon: '⚡',
    nombre: 'Ingeniero',
    subtitulo: 'Sistemas optimizados',
    descripcion: 'No solo haces hábitos — diseñas entornos que hacen que el comportamiento deseado sea el camino de menor resistencia.',
    color: '#d97706',
    colorHex: '#d97706',
  },
  {
    id: 'arquitecto',
    min: 35000,
    max: 49999,
    icon: '🌀',
    nombre: 'Arquitecto',
    subtitulo: 'Identidad deliberada',
    descripcion: 'Tu identidad no es algo que descubriste — es algo que construiste con evidencia y repetición consciente.',
    color: '#dc2626',
    colorHex: '#dc2626',
  },
  {
    id: 'maestro',
    min: 50000,
    max: 74999,
    icon: '🔥',
    nombre: 'Maestro',
    subtitulo: 'Práctica deliberada',
    descripcion: 'La disciplina ya no requiere fuerza de voluntad bruta. El sistema está tan bien diseñado que el incumplimiento resulta incómodo.',
    color: '#ea580c',
    colorHex: '#ea580c',
  },
  {
    id: 'transmutador',
    min: 75000,
    max: Infinity,
    icon: '💎',
    nombre: 'Transmutador',
    subtitulo: 'Cambio irreversible',
    descripcion: 'Eres evidencia viva de que la conducta humana es plástica. La transformación ya no es una meta — es un estado base.',
    color: '#b8860b',
    colorHex: '#b8860b',
  },
];

/**
 * Obtiene el rango actual del usuario basado en su XP total.
 * @param {number} xp — XP acumulado del usuario
 * @returns {object} El tier correspondiente
 */
export function getRango(xp = 0) {
  const safe = Math.max(0, xp);
  return (
    INVOCADOR_TIERS.slice().reverse().find(t => safe >= t.min) ||
    INVOCADOR_TIERS[0]
  );
}

/**
 * Obtiene el siguiente rango (o null si ya es el máximo).
 * @param {number} xp
 * @returns {object|null}
 */
export function getProximoRango(xp = 0) {
  const actual = getRango(xp);
  const idx = INVOCADOR_TIERS.findIndex(t => t.id === actual.id);
  return idx < INVOCADOR_TIERS.length - 1 ? INVOCADOR_TIERS[idx + 1] : null;
}

/**
 * Calcula el progreso (0–1) dentro del rango actual.
 * @param {number} xp
 * @returns {number} valor entre 0 y 1
 */
export function getProgresoEnRango(xp = 0) {
  const actual = getRango(xp);
  if (actual.max === Infinity) return 1;
  const rango = actual.max - actual.min;
  const avance = xp - actual.min;
  return Math.min(1, Math.max(0, avance / rango));
}
