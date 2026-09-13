/**
 * Endpoint serverless del Coach IA.
 *
 * Compatible con Cloudflare Pages Functions (`onRequestPost`) y Cloudflare
 * Workers (`export default { fetch }`).
 *
 * - Sin configuración: usa el MISMO motor rule-based que el cliente
 *   (src/ai/coachEngine.ts), respuesta idéntica con o sin servidor.
 * - Con `COACH_LLM_API_URL` + `COACH_LLM_API_KEY`: delega en un LLM
 *   OpenAI-style y, ante cualquier fallo o timeout, cae al motor local.
 *
 * Mínimo consumo de datos: el cliente solo envía { q, w, days, goal, xp, n }.
 * Respuesta: { answer, source } con source ∈ 'llm' | 'engine' (la UI puede
 * mostrar al usuario de dónde vino la respuesta).
 */

import { CoachContext, generateCoachReply } from '../../src/ai/coachEngine';
import {
  calculateAllometricProfile,
  resolveActivityLevel,
} from '../../src/services/allometricService';
import { ExperienceLevel, FitnessGoal } from '../../src/types';
import { fetchLlmReply, CoachLlmEnv } from '../lib/llm';
import { badRequest, json } from './shared';

const VALID_GOALS: FitnessGoal[] = [
  'hipertrofia',
  'perdida_grasa',
  'fuerza',
  'resistencia',
  'condicion_general',
];

const VALID_EXPERIENCE: ExperienceLevel[] = ['principiante', 'intermedio', 'avanzado'];

const MAX_QUESTION_CHARS = 500;

export async function handle(request: Request, env?: CoachLlmEnv | null): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('invalid_json');
  }

  const b = (body ?? {}) as Record<string, unknown>;

  const question = typeof b.q === 'string' ? b.q.trim() : '';
  if (!question || question.length > MAX_QUESTION_CHARS) {
    return badRequest('invalid_question');
  }

  const weight = typeof b.w === 'number' && b.w > 0 ? b.w : 70;
  const days = typeof b.days === 'number' ? Math.max(0, Math.min(7, Math.round(b.days))) : 3;
  const goal: FitnessGoal = VALID_GOALS.includes(b.goal as FitnessGoal)
    ? (b.goal as FitnessGoal)
    : 'hipertrofia';
  const experience: ExperienceLevel = VALID_EXPERIENCE.includes(b.experience as ExperienceLevel)
    ? (b.experience as ExperienceLevel)
    : 'intermedio';
  const name = typeof b.n === 'string' && b.n.trim() ? b.n.trim().slice(0, 40) : 'Atleta';

  const activityLevel = resolveActivityLevel(days, goal);
  const allometric = calculateAllometricProfile(weight, 28, 175, 'Masculino', activityLevel);

  const ctx: CoachContext = {
    userWeight: weight,
    daysPerWeek: days,
    primaryGoal: goal,
    experience,
    name,
    allometric,
  };

  const localReply = generateCoachReply(question, ctx);
  const llmReply = await fetchLlmReply(question, ctx, env);
  return json({ answer: llmReply ?? localReply.text, source: llmReply ? 'llm' : 'engine' });
}

export const onRequestPost = (context: {
  request: Request;
  env?: CoachLlmEnv;
}): Promise<Response> => handle(context.request, context.env);

export default {
  fetch: (request: Request, env?: CoachLlmEnv): Promise<Response> => handle(request, env),
};
