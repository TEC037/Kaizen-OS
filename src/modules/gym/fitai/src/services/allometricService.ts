/**
 * Allometric Scaling Engine (Escala Alométrica Biológica)
 *
 * Implementa las leyes de escala biológica basadas en alometría:
 * 1. Escala de 1/4 y -1/4 (Quarter-Power Law - West, Brown & Enquist / Schmidt-Nielsen):
 *    - Frecuencia cardíaca en reposo: f_HR ∝ M^(-1/4)
 *    - Periodo del ciclo cardíaco: τ ∝ M^(1/4)
 *    - Constante de tiempo de recuperación cardíaca: τ_rec ∝ M^(1/4)
 *
 * 2. Escala de 3/4 (Ley de Kleiber - 1932):
 *    - Tasa metabólica basal (BMR): BMR ∝ M^(3/4) = 70 * M^0.75 kcal/día
 *    - Gasto calórico activo y potencia metabólica en entrenamiento: P_met ∝ M^(3/4)
 *
 * 3. Escala geométrica de 2/3 (Jaric / Siff - Allometric Strength Index):
 *    - Fuerza muscular isométrica y transversal: S ∝ M^(2/3)
 *    - Normalización de fuerza relativa a masa de referencia (70 kg)
 */

// Perfil fisiológico de referencia (masa humana estándar internacional Ainsworth)
const REFERENCE_BODYWEIGHT_KG = 70;
const REFERENCE_RESTING_HR_BPM = 68;
const REFERENCE_HR_CYCLE_MIN_SEC = 60;
const REFERENCE_HEART_RATE_RECOVERY_SEC = 42;

// Límites de saneamiento antropométrico
const MIN_BODYWEIGHT_KG = 35;
const MAX_BODYWEIGHT_KG = 220;
const MIN_USER_AGE = 14;
const MAX_USER_AGE = 95;
const MIN_WORKOUT_DURATION_MIN = 1;

// Metabolismo alométrico (Ley de Kleiber x^3/4)
const KLEIBER_BMR_CONSTANT = 70;
const DEFAULT_ACTIVITY_LEVEL = 1.55;
const PAL_SEDENTARY = 1.2;
const PAL_LIGHT = 1.375;
const PAL_MODERATE = 1.55;
const PAL_VERY_ACTIVE = 1.725;
const PAL_ATHLETE = 1.9;
const ACTIVITY_GOAL_ADJUSTMENT = 0.05;
const CALORIE_BURN_RATE_PER_MIN_BASE = 7.2;
const CALORIE_MASS_SCALE_MET = 6.0;
const CALORIE_FLUX_FACTOR = 1.15;
const JOULES_PER_KCAL = 4184;

import { FitnessGoal } from '../types';
import { DEFAULT_AVERAGE_RPE } from '../config/constants';

export interface CardiacZone {
  zone: number;
  name: string;
  minBpm: number;
  maxBpm: number;
  percentRange: string;
  description: string;
  metabolicFuel: string;
  color: string;
  allometricFactor: number;
}

export interface AllometricProfile {
  // Parámetros antropométricos
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;

  // Escala -1/4 y 1/4: Dinámica Cardíaca
  allometricRestingHr: number; // f_HR ∝ M^(-0.25)
  cardiacCycleDurationSec: number; // τ ∝ M^(0.25)
  maxHeartRateBpm: number; // Tanaka / Gellish
  heartRateReserve: number; // HR_max - HR_rest
  cardiacRecoveryHalfLifeSec: number; // τ_rec ∝ M^(0.25)
  zones: CardiacZone[];

  // Escala 3/4: Metabolismo y Energía (Ley de Kleiber)
  kleiberBmrKcal: number; // 70 * M^(0.75)
  linearBmrComparisonKcal: number; // Harris-Benedict tradicional para contraste
  bmrAllometricDeltaKcal: number; // Diferencia de precisión
  allometricTdeeKcal: number; // TDEE = Kleiber BMR * PAL
  allometricCalorieBurnPerMinuteAtMet6: number; // Cal/min alométrica

  // Escala 2/3: Fuerza Isométrica y Transversal (Jaric / Siff)
  strengthScalingFactor: number; // (70 / M)^(2/3)
}

/**
 * Traduce los días de entrenamiento semanales a un factor de actividad física (PAL)
 * y aplica un ajuste según el objetivo del usuario. Vincula el TDEE real con el
 * perfil del usuario en vez de usar el PAL por defecto (1.55).
 */
export function resolveActivityLevel(
  daysPerWeek: number,
  goal: FitnessGoal = 'hipertrofia'
): number {
  const safeDays = Math.max(0, Math.min(7, daysPerWeek));

  const palLevels: [number, number][] = [
    [0, PAL_SEDENTARY],
    [2, PAL_LIGHT],
    [4, PAL_MODERATE],
    [6, PAL_VERY_ACTIVE],
    [7, PAL_ATHLETE],
  ];

  let pal = DEFAULT_ACTIVITY_LEVEL;
  for (let i = palLevels.length - 1; i >= 0; i--) {
    if (safeDays >= palLevels[i][0]) {
      pal = palLevels[i][1];
      break;
    }
  }

  // Ajuste por demanda energética del objetivo (déficit/superávit)
  if (goal === 'perdida_grasa') {
    pal -= ACTIVITY_GOAL_ADJUSTMENT;
  } else if (goal === 'hipertrofia' || goal === 'fuerza') {
    pal += ACTIVITY_GOAL_ADJUSTMENT;
  }

  return Number(pal.toFixed(2));
}

/**
 * Calcula el perfil fisiológico alométrico completo del usuario.
 */
export function calculateAllometricProfile(
  weightKg: number,
  age: number = 28,
  heightCm: number = 175,
  gender: string = 'Masculino',
  activityLevel: number = DEFAULT_ACTIVITY_LEVEL
): AllometricProfile {
  const safeWeight = Math.max(MIN_BODYWEIGHT_KG, Math.min(MAX_BODYWEIGHT_KG, weightKg));
  const safeAge = Math.max(MIN_USER_AGE, Math.min(MAX_USER_AGE, age));
  const refWeight = REFERENCE_BODYWEIGHT_KG;

  // 1. ESCALA -1/4 y 1/4: FRECUENCIA CARDÍACA Y CICLO BIOLÓGICO
  // f_HR(M) = f_0 * (M / 70)^(-0.25)
  // Referencia en reposo para 70kg: 68 bpm
  const allometricRestingHr = Math.round(
    REFERENCE_RESTING_HR_BPM * Math.pow(safeWeight / refWeight, -0.25)
  );

  // Duración del ciclo cardíaco: τ = 60 / f_HR ∝ M^(0.25)
  const cardiacCycleDurationSec = Number(
    (REFERENCE_HR_CYCLE_MIN_SEC / allometricRestingHr).toFixed(3)
  );

  // Frecuencia cardíaca máxima (Ecuación Tanaka / Gellish adaptada alométricamente)
  const maxHeartRateBpm = Math.round(208 - 0.7 * safeAge);

  // Reserva de frecuencia cardíaca (Karvonen)
  const heartRateReserve = Math.max(40, maxHeartRateBpm - allometricRestingHr);

  // Constante de tiempo de recuperación cardíaca post-esfuerzo: τ_rec ∝ M^(0.25)
  // Una persona de 70kg tiene una constante base de ~42 segundos
  const cardiacRecoveryHalfLifeSec = Math.round(
    REFERENCE_HEART_RATE_RECOVERY_SEC * Math.pow(safeWeight / refWeight, 0.25)
  );

  // Zonas cardíacas de Karvonen calibradas con factor alométrico
  const zones: CardiacZone[] = [
    {
      zone: 1,
      name: 'Zona 1: Recuperación Activa',
      percentRange: '50% - 60% HRR',
      minBpm: Math.round(allometricRestingHr + heartRateReserve * 0.5),
      maxBpm: Math.round(allometricRestingHr + heartRateReserve * 0.6),
      description:
        'Favorece el retorno venoso, eliminación de lactato y regeneración mitocondrial.',
      metabolicFuel: 'Lípidos (Ácidos grasos libres >85%)',
      color: '#38BDF8', // Celeste
      allometricFactor: Math.pow(safeWeight / refWeight, 0.75) * 0.55,
    },
    {
      zone: 2,
      name: 'Zona 2: Base Aeróbica / Fat Max',
      percentRange: '60% - 70% HRR',
      minBpm: Math.round(allometricRestingHr + heartRateReserve * 0.6),
      maxBpm: Math.round(allometricRestingHr + heartRateReserve * 0.7),
      description: 'Máxima tasa de oxidación de grasa por escala alométrica M^(3/4).',
      metabolicFuel: 'Oxidación lipídica óptima y glucosa basal',
      color: '#4ADE80', // Verde
      allometricFactor: Math.pow(safeWeight / refWeight, 0.75) * 0.65,
    },
    {
      zone: 3,
      name: 'Zona 3: Tempo / Umbral Aeróbico',
      percentRange: '70% - 80% HRR',
      minBpm: Math.round(allometricRestingHr + heartRateReserve * 0.7),
      maxBpm: Math.round(allometricRestingHr + heartRateReserve * 0.8),
      description: 'Equilibrio glucolítico aeróbico; ritmo de entrenamiento con pesas continuo.',
      metabolicFuel: '50% Glucógeno / 50% Lípidos',
      color: '#FACC15', // Amarillo
      allometricFactor: Math.pow(safeWeight / refWeight, 0.75) * 0.75,
    },
    {
      zone: 4,
      name: 'Zona 4: Umbral Anaeróbico (Lactato)',
      percentRange: '80% - 90% HRR',
      minBpm: Math.round(allometricRestingHr + heartRateReserve * 0.8),
      maxBpm: Math.round(allometricRestingHr + heartRateReserve * 0.9),
      description:
        'Acumulación de metabolitos, esfuerzo máximo sostenido en series pesadas (RPE 8-9).',
      metabolicFuel: 'Glucógeno muscular predominante (>80%)',
      color: '#FB923C', // Naranja
      allometricFactor: Math.pow(safeWeight / refWeight, 0.75) * 0.85,
    },
    {
      zone: 5,
      name: 'Zona 5: Máximo Esfuerzo / VO2 Peak',
      percentRange: '90% - 100% HRR',
      minBpm: Math.round(allometricRestingHr + heartRateReserve * 0.9),
      maxBpm: maxHeartRateBpm,
      description: 'Potencia neuromuscular pura y capacidad anaeróbica aláctica (RPE 9.5-10).',
      metabolicFuel: 'Fosfágenos (ATP-PC) y glucólisis rápida',
      color: '#EF4444', // Rojo
      allometricFactor: Math.pow(safeWeight / refWeight, 0.75) * 0.98,
    },
  ];

  // 2. ESCALA 3/4: METABOLISMO Y ENERGÍA (LEY DE KLEIBER)
  // BMR = 70 * M^(0.75) kcal/día
  const kleiberBmrKcal = Math.round(KLEIBER_BMR_CONSTANT * Math.pow(safeWeight, 0.75));

  // Comparativa con modelo lineal convencional (Harris-Benedict simplificado)
  const isMale = gender.toLowerCase() !== 'femenino';
  const linearBmrComparisonKcal = isMale
    ? Math.round(88.36 + 13.4 * safeWeight + 4.8 * heightCm - 5.7 * safeAge)
    : Math.round(447.6 + 9.25 * safeWeight + 3.1 * heightCm - 4.3 * safeAge);

  const bmrAllometricDeltaKcal = kleiberBmrKcal - linearBmrComparisonKcal;
  const allometricTdeeKcal = Math.round(kleiberBmrKcal * activityLevel);

  // Gasto calórico por minuto a MET 6.0 (entrenamiento con cargas convencional)
  // Tasa cal/min = 1.15 * (M / 70)^(0.75) * 6.0
  const allometricCalorieBurnPerMinuteAtMet6 = Number(
    (CALORIE_FLUX_FACTOR * Math.pow(safeWeight / refWeight, 0.75) * CALORIE_MASS_SCALE_MET).toFixed(
      2
    )
  );

  // 3. ESCALA 2/3: FUERZA ALOMÉTRICA (Jaric / Siff)
  // Factor para normalizar cualquier carga a la masa estándar de 70 kg:
  // Load_70kg = Load_actual * (70 / M)^(2/3)
  const strengthScalingFactor = Number(Math.pow(refWeight / safeWeight, 2 / 3).toFixed(4));

  return {
    weightKg: safeWeight,
    heightCm,
    age: safeAge,
    gender,
    allometricRestingHr,
    cardiacCycleDurationSec,
    maxHeartRateBpm,
    heartRateReserve,
    cardiacRecoveryHalfLifeSec,
    zones,
    kleiberBmrKcal,
    linearBmrComparisonKcal,
    bmrAllometricDeltaKcal,
    allometricTdeeKcal,
    allometricCalorieBurnPerMinuteAtMet6,
    strengthScalingFactor,
  };
}

/**
 * Simula de forma fisiológicamente fiel el pulso cardíaco alométrico dinámico.
 * Durante una serie activa: sube con la intensidad (RPE) y masa muscular según x^(3/4).
 * Durante el descanso: decae exponencialmente según la constante biológica de recuperación τ_rec ∝ M^(1/4).
 */
export function computeDynamicHeartRate(
  profile: AllometricProfile,
  isResting: boolean,
  currentRpe: number = 8,
  elapsedRestSeconds: number = 0,
  muscleGroup: string = 'Pecho',
  lastPeakBpm: number = 158
): { currentBpm: number; zone: CardiacZone; cyclePeriodMs: number } {
  // Factor de masa muscular involucrada (piernas y espalda reclutan mayor lecho vascular)
  let muscleFactor = 1.0;
  const lower = muscleGroup.toLowerCase();
  if (
    lower.includes('pierna') ||
    lower.includes('sentadilla') ||
    lower.includes('muerto') ||
    lower.includes('quad')
  ) {
    muscleFactor = 1.15; // Mayor gasto cardíaco
  } else if (lower.includes('espalda') || lower.includes('remo')) {
    muscleFactor = 1.08;
  } else if (lower.includes('brazo') || lower.includes('bíceps') || lower.includes('tríceps')) {
    muscleFactor = 0.92;
  }

  let calculatedBpm: number;

  if (isResting) {
    // Decaimiento exponencial alométrico durante el descanso:
    // HR(t) = HR_rest + (HR_peak - HR_rest) * e^(-t / τ_rec)
    const tau = profile.cardiacRecoveryHalfLifeSec;
    const decay = Math.exp(-elapsedRestSeconds / tau);
    const targetRestBpm = profile.allometricRestingHr + 15; // Ritmo cardíaco elevado post-ejercicio
    calculatedBpm = targetRestBpm + (lastPeakBpm - targetRestBpm) * decay;
  } else {
    // Esfuerzo activo: escala de 3/4 en demanda de oxígeno
    // Intensidad normalizada de 0 a 1 basada en RPE (6-10)
    const intensity = Math.min(1.0, Math.max(0.3, (currentRpe - 4) / 6));
    // Demanda metabólica no lineal: (Intensidad)^(3/4)
    const metabolicDrive = Math.pow(intensity, 0.75);

    calculatedBpm =
      profile.allometricRestingHr + profile.heartRateReserve * metabolicDrive * 0.88 * muscleFactor;
  }

  // Clampear entre reposo y HR max con pequeña variación biológica natural
  const boundedBpm = Math.min(
    profile.maxHeartRateBpm,
    Math.max(profile.allometricRestingHr, Math.round(calculatedBpm))
  );

  let zone: CardiacZone = profile.zones[0];
  if (boundedBpm < profile.zones[0].minBpm) {
    zone = {
      zone: 0,
      name: 'Reposo Fisiológico Basal',
      percentRange: '<50% HRR',
      minBpm: profile.allometricRestingHr,
      maxBpm: profile.zones[0].minBpm,
      description: 'Frecuencia cardíaca en reposo gobernada por escala de 1/4.',
      metabolicFuel: 'Lípidos basales',
      color: '#94A3B8', // Gris azulado
      allometricFactor: 0.3,
    };
  } else {
    for (let i = profile.zones.length - 1; i >= 0; i--) {
      if (boundedBpm >= profile.zones[i].minBpm) {
        zone = profile.zones[i];
        break;
      }
    }
  }
  // Periodo instantáneo del latido cardíaco: T = 60000 / BPM ms
  const cyclePeriodMs = Math.round(60000 / Math.max(40, boundedBpm));

  return {
    currentBpm: boundedBpm,
    zone,
    cyclePeriodMs,
  };
}

/**
 * Cálculo Alométrico de Calorías Quemadas en Entrenamiento (Ley de Kleiber x^(3/4)).
 * A diferencia del cálculo lineal estándar (MET * kg * horas), el gasto metabólico
 * se rige por la escala alométrica de masa M^(3/4), evitando sobreestimar calorías
 * en personas con mayor peso o subestimar en personas livianas.
 */
export function calculateAllometricWorkoutCalories(
  weightKg: number,
  durationMinutes: number,
  averageRpe: number = DEFAULT_AVERAGE_RPE,
  totalSets: number = 15
): {
  allometricCalories: number;
  linearCaloriesComparison: number;
  metabolicPowerWatts: number;
  kleiberScalingRatio: number;
} {
  const safeWeight = Math.max(MIN_BODYWEIGHT_KG, Math.min(MAX_BODYWEIGHT_KG, weightKg));
  const safeDuration = Math.max(MIN_WORKOUT_DURATION_MIN, durationMinutes);
  const refWeight = REFERENCE_BODYWEIGHT_KG;

  // Escala alométrica de masa para energía: (M / 70)^(3/4)
  const kleiberMassScale = Math.pow(safeWeight / refWeight, 0.75);

  // Intensidad por RPE: escala de potencia de 3/4
  const normalizedRpe = Math.min(10, Math.max(5, averageRpe));
  const rpeIntensityFactor = 1.0 + Math.pow((normalizedRpe - 6) / 4, 0.75) * 0.45;

  // Componente de volumen de series
  const densityBonus = Math.min(1.25, 1.0 + (totalSets / 20) * 0.15);

  // Tasa calórica alométrica base: ~7.2 kcal/min para 70kg a RPE 8
  const baseBurnRatePerMin = CALORIE_BURN_RATE_PER_MIN_BASE;
  const allometricCalories = Math.round(
    safeDuration * baseBurnRatePerMin * kleiberMassScale * rpeIntensityFactor * densityBonus
  );

  // Comparativa con modelo lineal ingenuo: (7.5 * duration * weight/70)
  const linearCaloriesComparison = Math.round(
    safeDuration * 7.5 * (safeWeight / refWeight) * (normalizedRpe / 8)
  );

  // Potencia metabólica media equivalente en Vatios (Watts)
  // 1 kcal = 4184 Joules; P = (E_joules) / (duration * 60)
  const totalJoules = allometricCalories * JOULES_PER_KCAL;
  const metabolicPowerWatts = Math.round(totalJoules / (safeDuration * 60));

  return {
    allometricCalories,
    linearCaloriesComparison,
    metabolicPowerWatts,
    kleiberScalingRatio: Number(kleiberMassScale.toFixed(3)),
  };
}

/**
 * Cálculo del Índice de Fuerza Alométrica (Allometric Strength Index - Jaric / Siff).
 * Fuerza transversal ∝ M^(2/3).
 * Normaliza cualquier levantamiento al equivalente de un atleta estándar de 70 kg.
 */
export function calculateAllometricStrengthScore(
  liftedWeightKg: number,
  bodyweightKg: number
): {
  allometricScore: number; // Load / M^(2/3)
  normalized70kgLoad: number; // Carga equivalente si pesara 70 kg
  linearStrengthRatio: number; // Carga / Peso corporal (lineal)
  classification: string;
} {
  const safeBodyweight = Math.max(MIN_BODYWEIGHT_KG, Math.min(MAX_BODYWEIGHT_KG, bodyweightKg));
  const safeLift = Math.max(0, liftedWeightKg);
  const refWeight = REFERENCE_BODYWEIGHT_KG;

  // Escala geométrica de sección transversal: M^(2/3)
  const geometricMuscleAreaFactor = Math.pow(safeBodyweight, 2 / 3);
  const allometricScore = Number((safeLift / geometricMuscleAreaFactor).toFixed(2));

  // Normalizado a atleta de 70 kg
  const normalized70kgLoad = Number(
    (safeLift * Math.pow(refWeight / safeBodyweight, 2 / 3)).toFixed(1)
  );

  // Relación lineal convencional (sesgada contra atletas pesados)
  const linearStrengthRatio = Number((safeLift / safeBodyweight).toFixed(2));

  // Clasificación basada en el índice Jaric de fuerza relativa
  let classification = 'Principiante';
  if (allometricScore >= 8.5) {
    classification = 'Élite Nacional';
  } else if (allometricScore >= 6.8) {
    classification = 'Avanzado Competitivo';
  } else if (allometricScore >= 5.0) {
    classification = 'Intermedio Consolidado';
  } else if (allometricScore >= 3.5) {
    classification = 'Novato / En Desarrollo';
  }

  return {
    allometricScore,
    normalized70kgLoad,
    linearStrengthRatio,
    classification,
  };
}
