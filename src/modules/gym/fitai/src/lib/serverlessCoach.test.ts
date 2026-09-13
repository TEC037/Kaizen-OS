import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildServerlessPayload, fetchServerlessCoachReply } from './serverlessCoach';
import { CoachContext } from '../ai/coachEngine';

const FAKE_URL = 'https://fitai-serverless.example/api/coach';

const CTX = {
  userWeight: 80,
  daysPerWeek: 4,
  primaryGoal: 'hipertrofia',
  experience: 'intermedio',
  name: 'Carlos',
} as unknown as CoachContext;

describe('serverlessCoach', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('buildServerlessPayload reduce el contexto a claves compactas', () => {
    const payload = buildServerlessPayload('¿cómo mejoro mi press?', CTX);
    expect(payload).toEqual({
      q: '¿cómo mejoro mi press?',
      w: 80,
      days: 4,
      goal: 'hipertrofia',
      xp: 'intermedio',
    });
  });

  it('devuelve null sin URL configurada', async () => {
    const reply = await fetchServerlessCoachReply(buildServerlessPayload('hola', CTX), '');
    expect(reply).toBeNull();
  });

  it('devuelve la respuesta y su fuente del servidor', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ answer: 'Respuesta IA', source: 'llm' }), { status: 200 })
        )
    );

    const reply = await fetchServerlessCoachReply(buildServerlessPayload('hola', CTX), FAKE_URL);
    expect(reply).toEqual({ answer: 'Respuesta IA', source: 'llm' });
  });

  it('asume fuente engine si el servidor no la reporta (respuesta del motor local)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ answer: 'Respuesta local' }), { status: 200 })
        )
    );

    const reply = await fetchServerlessCoachReply(buildServerlessPayload('hola', CTX), FAKE_URL);
    expect(reply).toEqual({ answer: 'Respuesta local', source: 'engine' });
  });

  it('devuelve null ante respuesta no OK (cae al motor local)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));

    const reply = await fetchServerlessCoachReply(buildServerlessPayload('hola', CTX), FAKE_URL);
    expect(reply).toBeNull();
  });

  it('devuelve null ante error de red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const reply = await fetchServerlessCoachReply(buildServerlessPayload('hola', CTX), FAKE_URL);
    expect(reply).toBeNull();
  });

  it('devuelve null ante respuesta sin answer válido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"answer":""}', { status: 200 }))
    );

    const reply = await fetchServerlessCoachReply(buildServerlessPayload('hola', CTX), FAKE_URL);
    expect(reply).toBeNull();
  });
});
