import { describe, it, expect, vi, afterEach } from 'vitest';
import { handle } from './coach';

function post(body: unknown): Promise<Response> {
  return handle(
    new Request('https://fitai.example/api/coach', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );
}

const LLM_ENV = {
  COACH_LLM_API_URL: 'https://llm.example/v1/chat/completions',
  COACH_LLM_API_KEY: 'sk-test',
};

describe('functions/api/coach', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('responde el mismo contenido que el motor local (hipertrofia → Kleiber)', async () => {
    const res = await post({
      q: 'dale kleiber',
      w: 80,
      days: 4,
      goal: 'hipertrofia',
      xp: 'intermedio',
      n: 'Carlos',
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string; source: string };
    expect(data.answer).toContain('Ley de Kleiber');
    expect(data.answer).toContain('80 kg');
    expect(data.source).toBe('engine');
  });

  it('calcula el perfil alométrico y responde sobre frecuencia cardíaca', async () => {
    const res = await post({
      q: 'ritmo cardiaco',
      w: 70,
      days: 3,
      goal: 'perdida_grasa',
      xp: 'avanzado',
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string };
    expect(data.answer).toContain('Frecuencia Cardíaca');
    expect(data.answer).toContain('bpm');
  });

  it('usa el fallback para preguntas desconocidas con el perfil reducido', async () => {
    const res = await post({ q: 'hola', w: 90, days: 6, goal: 'fuerza', xp: 'principiante' });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string };
    expect(data.answer).toContain('FUERZA');
    expect(data.answer).toContain('6 días/sem');
  });

  it('rechaza JSON inválido con 400', async () => {
    const res = await post({ q: '' });
    expect(res.status).toBe(400);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBe('invalid_question');
  });

  it('rechaza métodos no permitidos con 405', async () => {
    const res = await handle(new Request('https://fitai.example/api/coach', { method: 'PUT' }));
    expect(res.status).toBe(405);
  });

  it('expone el adaptador de Cloudflare Pages Functions y Workers', async () => {
    const mod = await import('./coach');
    expect(typeof mod.onRequestPost).toBe('function');
    expect(typeof mod.default.fetch).toBe('function');
  });

  it('usa el LLM si está configurado y devuelve su respuesta', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Respuesta del LLM para tu sentadilla.' } }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await handle(
      new Request('https://fitai.example/api/coach', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          q: '¿cómo mejoro la sentadilla?',
          w: 80,
          days: 4,
          goal: 'hipertrofia',
          xp: 'intermedio',
        }),
      }),
      LLM_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string; source: string };
    expect(data.answer).toBe('Respuesta del LLM para tu sentadilla.');
    expect(data.source).toBe('llm');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const init = fetchMock.mock.calls[0]?.[1] as
      { headers?: Record<string, string>; body?: string } | undefined;
    expect(init?.headers?.authorization).toBe('Bearer sk-test');
    expect(init?.body).toContain('¿cómo mejoro la sentadilla?');
  });

  it('cae al motor local si el LLM responde con error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));

    const res = await handle(
      new Request('https://fitai.example/api/coach', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          q: 'dale kleiber',
          w: 80,
          days: 4,
          goal: 'hipertrofia',
          xp: 'intermedio',
        }),
      }),
      LLM_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string };
    expect(data.answer).toContain('Ley de Kleiber');
    expect(data.answer).toContain('80 kg');
  });

  it('cae al motor local si el LLM lanza una excepción (timeout/red)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const res = await handle(
      new Request('https://fitai.example/api/coach', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ q: 'hola', w: 70, days: 3, goal: 'fuerza', xp: 'avanzado' }),
      }),
      LLM_ENV
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as { answer: string };
    expect(data.answer).toContain('FUERZA');
  });
});
