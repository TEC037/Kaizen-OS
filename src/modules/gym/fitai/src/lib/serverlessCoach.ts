/**
 * Cliente serverless del Coach IA (mínimo consumo de datos).
 *
 * - Si VITE_SERVERLESS_URL no está configurado → nunca hay petición de red
 *   (la app funciona 100% local, 0 datos consumidos).
 * - El payload es lo más compacto posible (claves cortas, solo contexto mínimo).
 * - Timeout de 5 s: si el servidor tarda o falla, la app cae al motor local.
 */

import { CoachContext } from '../ai/coachEngine';

export const SERVERLESS_COACH_URL: string =
  (import.meta.env.VITE_SERVERLESS_URL as string | undefined) ?? '';

const SERVER_READ_TIMEOUT_MS = 5000;

interface ServerlessCoachPayload {
  /** pregunta del usuario */
  q: string;
  /** peso (kg) */
  w: number;
  /** días/semana */
  days: number;
  /** objetivo principal */
  goal: string;
  /** experiencia */
  xp: string;
}

/** Origen de la respuesta según el servidor. */
type ServerCoachReplySource = 'llm' | 'engine';

interface ServerCoachReply {
  answer: string;
  source: ServerCoachReplySource;
}

export function buildServerlessPayload(
  question: string,
  ctx: CoachContext
): ServerlessCoachPayload {
  return {
    q: question,
    w: ctx.userWeight,
    days: ctx.daysPerWeek,
    goal: ctx.primaryGoal,
    xp: ctx.experience,
  };
}

/**
 * Solicita la respuesta del coach al endpoint serverless.
 * Devuelve `ServerCoachReply | null`: null indica "usa el motor local" (no
 * configurado, error de red, timeout o respuesta inválida).
 *
 * `url` es inyectable para testeo; por defecto usa `SERVERLESS_COACH_URL`.
 */
export async function fetchServerlessCoachReply(
  payload: ServerlessCoachPayload,
  url: string = SERVERLESS_COACH_URL
): Promise<ServerCoachReply | null> {
  if (!url) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SERVER_READ_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    try {
      const data = (await response.json()) as { answer?: string; source?: string };
      if (typeof data.answer !== 'string' || data.answer.length === 0) return null;
      const source: ServerCoachReplySource = data.source === 'llm' ? 'llm' : 'engine';
      return { answer: data.answer, source };
    } catch {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
