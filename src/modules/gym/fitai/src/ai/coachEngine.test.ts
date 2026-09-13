import { describe, it, expect } from 'vitest';
import { generateCoachReply, CoachContext } from './coachEngine';
import {
  AllometricProfile,
  calculateAllometricProfile,
  resolveActivityLevel,
} from '../services/allometricService';

function buildContext(override: Partial<CoachContext> = {}): CoachContext {
  const weight = override.userWeight ?? 80;
  const allometric: AllometricProfile = calculateAllometricProfile(
    weight,
    28,
    175,
    'Masculino',
    resolveActivityLevel(4, 'hipertrofia')
  );
  return {
    userWeight: weight,
    daysPerWeek: override.daysPerWeek ?? 4,
    primaryGoal: override.primaryGoal ?? 'hipertrofia',
    experience: override.experience ?? 'intermedio',
    name: override.name ?? 'Carlos',
    allometric,
  };
}

describe('generateCoachReply', () => {
  it('responde sobre frecuencia cardíaca y escala -1/4', () => {
    const reply = generateCoachReply('¿Cómo calculo mi ritmo cardíaco?', buildContext());
    expect(reply.category).toBe('technique');
    expect(reply.text).toContain('Frecuencia Cardíaca');
    expect(reply.text).toContain('bpm');
  });

  it('responde sobre metabolismo con la Ley de Kleiber (x^(3/4))', () => {
    const reply = generateCoachReply('explicame la ley de Kleiber y mis calorías', buildContext());
    expect(reply.category).toBe('nutrition');
    expect(reply.text).toContain('Ley de Kleiber');
    expect(reply.text).toContain('TDEE Alométrico');
  });

  it('responde sobre fuerza alométrica (x^(2/3), Jaric)', () => {
    const reply = generateCoachReply('¿qué es la fuerza relativa 2/3?', buildContext());
    expect(reply.category).toBe('technique');
    expect(reply.text).toContain('Índice de Fuerza Alométrica');
    expect(reply.text).toContain('factor');
  });

  it('responde sobre sentadilla', () => {
    const reply = generateCoachReply('me duele al hacer sentadilla', buildContext());
    expect(reply.category).toBe('technique');
    expect(reply.text).toContain('sentadilla');
    expect(reply.text).toContain('Valsalva');
  });

  it('responde con estrategia exprés cuando hay poco tiempo', () => {
    const reply = generateCoachReply('no tengo tiempo, quiero algo rápido', buildContext());
    expect(reply.category).toBe('adaptation');
    expect(reply.text).toContain('Estrategia Exprés');
  });

  it('responde sobre sobrecarga progresiva con la regla 2 por 2', () => {
    const reply = generateCoachReply('¿cuándo aumento el peso?', buildContext());
    expect(reply.category).toBe('adaptation');
    expect(reply.text).toContain('2 por 2');
  });

  it('responde con alternativas al press de banca', () => {
    const reply = generateCoachReply('necesito un reemplazo para banca', buildContext());
    expect(reply.category).toBe('technique');
    expect(reply.text).toContain('Press con mancuernas');
  });

  it('responde sobre fatiga y dolor', () => {
    const reply = generateCoachReply('hoy estoy muy cansado y con dolor', buildContext());
    expect(reply.category).toBe('adaptation');
    expect(reply.text).toContain('RIR 2-3');
  });

  it('responde sobre calentamiento de hombro / manguito rotador', () => {
    const reply = generateCoachReply('calentamiento para hombro rotador', buildContext());
    expect(reply.category).toBe('technique');
    expect(reply.text).toContain('manguito rotador');
  });

  it('usa el fallback genérico para cualquier otra pregunta', () => {
    const ctx = buildContext({ name: 'María' });
    const reply = generateCoachReply('¿qué tal el clima?', ctx);
    expect(reply.category).toBe('motivation');
    expect(reply.text).toContain('María');
    expect(reply.text).toContain('hipertrofia');
  });

  it('personaliza el fallback con el objetivo y días del usuario', () => {
    const ctx = buildContext({ primaryGoal: 'fuerza', daysPerWeek: 3, experience: 'principiante' });
    const reply = generateCoachReply('hola', ctx);
    expect(reply.text).toContain('FUERZA');
    expect(reply.text).toContain('principiante');
    expect(reply.text).toContain('3 días/sem');
  });
});
