import { describe, it, expect } from 'vitest';
import {
  resolveActivityLevel,
  calculateAllometricProfile,
  computeDynamicHeartRate,
  calculateAllometricWorkoutCalories,
  calculateAllometricStrengthScore,
  AllometricProfile,
  CardiacZone,
} from './allometricService';

export function getAllometricZoneForBpm(bpm: number, profile: AllometricProfile): CardiacZone {
  if (bpm < profile.zones[0].minBpm) {
    return {
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
  }

  for (let i = profile.zones.length - 1; i >= 0; i--) {
    if (bpm >= profile.zones[i].minBpm) {
      return profile.zones[i];
    }
  }

  return profile.zones[0];
}

describe('resolveActivityLevel', () => {
  it('mapea los días de entrenamiento semanales al PAL correcto', () => {
    expect(resolveActivityLevel(0, 'condicion_general')).toBe(1.2);
    expect(resolveActivityLevel(2, 'condicion_general')).toBe(1.38);
    expect(resolveActivityLevel(4, 'condicion_general')).toBe(1.55);
    expect(resolveActivityLevel(6, 'condicion_general')).toBe(1.73);
    expect(resolveActivityLevel(7, 'condicion_general')).toBe(1.9);
  });

  it('ajusta el PAL según el objetivo energético', () => {
    expect(resolveActivityLevel(0, 'perdida_grasa')).toBe(1.15);
    expect(resolveActivityLevel(4, 'hipertrofia')).toBe(1.6);
    expect(resolveActivityLevel(6, 'fuerza')).toBe(1.78);
  });

  it('clampa los días fuera del rango válido', () => {
    expect(resolveActivityLevel(-3, 'condicion_general')).toBe(1.2);
    expect(resolveActivityLevel(999, 'condicion_general')).toBe(1.9);
  });
});

describe('calculateAllometricProfile', () => {
  it('calcula el perfil de referencia de 70 kg', () => {
    const profile = calculateAllometricProfile(70, 28, 175, 'Masculino');

    expect(profile.weightKg).toBe(70);
    expect(profile.allometricRestingHr).toBe(68);
    expect(profile.cardiacCycleDurationSec).toBe(Number((60 / 68).toFixed(3)));
    expect(profile.maxHeartRateBpm).toBe(Math.round(208 - 0.7 * 28));
    expect(profile.heartRateReserve).toBe(188 - 68);
    expect(profile.cardiacRecoveryHalfLifeSec).toBe(42);
    expect(profile.strengthScalingFactor).toBe(1);
    expect(profile.zones).toHaveLength(5);
    expect(profile.zones[0].minBpm).toBe(Math.round(68 + (188 - 68) * 0.5));
    expect(profile.zones[4].maxBpm).toBe(profile.maxHeartRateBpm);
  });

  it('calcula el BMR de Kleiber (3/4) y su delta con Harris-Benedict', () => {
    const profile = calculateAllometricProfile(70, 28, 175, 'Masculino');

    expect(profile.kleiberBmrKcal).toBe(Math.round(70 * Math.pow(70, 0.75)));
    expect(profile.linearBmrComparisonKcal).toBe(
      Math.round(88.36 + 13.4 * 70 + 4.8 * 175 - 5.7 * 28)
    );
    expect(profile.bmrAllometricDeltaKcal).toBe(
      profile.kleiberBmrKcal - profile.linearBmrComparisonKcal
    );
    expect(profile.allometricTdeeKcal).toBe(Math.round(profile.kleiberBmrKcal * 1.55));
    expect(profile.allometricCalorieBurnPerMinuteAtMet6).toBe(6.9);
  });

  it('aplica la fórmula lineal de Harris-Benedict femenina', () => {
    const profile = calculateAllometricProfile(60, 35, 165, 'Femenino', 1.2);

    expect(profile.linearBmrComparisonKcal).toBe(
      Math.round(447.6 + 9.25 * 60 + 3.1 * 165 - 4.3 * 35)
    );
    expect(profile.allometricTdeeKcal).toBe(Math.round(profile.kleiberBmrKcal * 1.2));
  });

  it('reduce la frecuencia cardíaca alómétrica conforme aumenta la masa', () => {
    const light = calculateAllometricProfile(70).allometricRestingHr;
    const heavy = calculateAllometricProfile(120).allometricRestingHr;

    expect(heavy).toBeLessThan(light);
    expect(calculateAllometricProfile(120).cardiacRecoveryHalfLifeSec).toBeGreaterThan(
      calculateAllometricProfile(70).cardiacRecoveryHalfLifeSec
    );
  });

  it('clampa el peso y la edad fuera del rango permitido', () => {
    const tiny = calculateAllometricProfile(5, 5);
    expect(tiny.weightKg).toBe(35);
    expect(tiny.age).toBe(14);

    const huge = calculateAllometricProfile(500, 999);
    expect(huge.weightKg).toBe(220);
    expect(huge.age).toBe(95);
  });
});

describe('getAllometricZoneForBpm', () => {
  const profile = calculateAllometricProfile(70);

  it('devuelve reposo fisiológico cuando el BPM está bajo la primera zona', () => {
    const zone = getAllometricZoneForBpm(60, profile);
    expect(zone.zone).toBe(0);
    expect(zone.name).toBe('Reposo Fisiológico Basal');
  });

  it('devuelve la zona de Karvonen correcta para el BPM', () => {
    expect(getAllometricZoneForBpm(130, profile).zone).toBe(1);
    expect(getAllometricZoneForBpm(143, profile).zone).toBe(2);
    expect(getAllometricZoneForBpm(155, profile).zone).toBe(3);
    expect(getAllometricZoneForBpm(167, profile).zone).toBe(4);
    expect(getAllometricZoneForBpm(180, profile).zone).toBe(5);
  });
});

describe('computeDynamicHeartRate', () => {
  const profile: AllometricProfile = calculateAllometricProfile(70);

  it('sube el BPM en esfuerzo activo según el RPE y el músculo implicado', () => {
    const chest = computeDynamicHeartRate(profile, false, 8, 0, 'Pecho');
    expect(chest.currentBpm).toBe(
      Math.min(
        profile.maxHeartRateBpm,
        Math.max(
          profile.allometricRestingHr,
          Math.round(
            profile.allometricRestingHr +
              profile.heartRateReserve * Math.pow((8 - 4) / 6, 0.75) * 0.88 * 1.0
          )
        )
      )
    );

    const legs = computeDynamicHeartRate(profile, false, 8, 0, 'Pierna');
    expect(legs.currentBpm).toBeGreaterThan(chest.currentBpm);
  });

  it('decae exponencialmente durante el descanso hacia el valor basal', () => {
    const restingAt0 = computeDynamicHeartRate(profile, true, 8, 0, 'Pecho', 150);
    const restingAt60 = computeDynamicHeartRate(profile, true, 8, 60, 'Pecho', 150);

    expect(restingAt0.currentBpm).toBeGreaterThan(restingAt60.currentBpm);
    expect(restingAt60.currentBpm).toBeGreaterThan(profile.allometricRestingHr);
    expect(restingAt0.zone).toBeDefined();
    expect(restingAt0.cyclePeriodMs).toBe(Math.round(60000 / restingAt0.currentBpm));
  });
});

describe('calculateAllometricWorkoutCalories', () => {
  it('calcula el gasto alométrico de 60 min a RPE 8 en 70 kg', () => {
    const result = calculateAllometricWorkoutCalories(70, 60, 8, 15);

    const normalizedRpe = Math.min(10, Math.max(5, 8));
    const rpeIntensityFactor = 1.0 + Math.pow((normalizedRpe - 6) / 4, 0.75) * 0.45;
    const densityBonus = Math.min(1.25, 1.0 + (15 / 20) * 0.15);

    expect(result.kleiberScalingRatio).toBe(1);
    expect(result.allometricCalories).toBe(
      Math.round(60 * 7.2 * 1 * rpeIntensityFactor * densityBonus)
    );
    expect(result.linearCaloriesComparison).toBe(Math.round(60 * 7.5 * 1 * (8 / 8)));
    expect(result.metabolicPowerWatts).toBe(
      Math.round((result.allometricCalories * 4184) / (60 * 60))
    );
  });

  it('clampa la duración a 1 minuto mínimo', () => {
    const result = calculateAllometricWorkoutCalories(70, 0);
    expect(result.allometricCalories).toBeGreaterThan(0);
  });
});

describe('calculateAllometricStrengthScore', () => {
  it('normaliza la carga al equivalente de 70 kg', () => {
    const result = calculateAllometricStrengthScore(100, 70);

    expect(result.normalized70kgLoad).toBe(100);
    expect(result.linearStrengthRatio).toBe(1.43);
    expect(result.classification).toBe('Intermedio Consolidado');
  });

  it('clasifica según el índice Jaric de fuerza relativa', () => {
    expect(calculateAllometricStrengthScore(150, 70).classification).toBe('Élite Nacional');
    expect(calculateAllometricStrengthScore(100, 70).classification).toBe('Intermedio Consolidado');
    expect(calculateAllometricStrengthScore(50, 70).classification).toBe('Principiante');
  });

  it('favorece a los atletas pesados frente a la comparación lineal', () => {
    const heavy = calculateAllometricStrengthScore(200, 100);
    const light = calculateAllometricStrengthScore(110, 55);

    expect(heavy.linearStrengthRatio).toBe(2.0);
    expect(light.linearStrengthRatio).toBe(2.0);
    expect(heavy.normalized70kgLoad).toBeGreaterThan(light.normalized70kgLoad);
  });
});
