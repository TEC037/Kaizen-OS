/**
 * @file src/core/senseiAI.ts
 * @description Servicio del Sensei Kaizen impulsado por Google Gen AI (@google/genai).
 * Conecta los módulos del usuario para generar síntesis holísticas personalizadas.
 * En caso de no haber API key o error de red, recurre a heurísticas sabias instantáneas.
 */

import { GoogleGenAI } from '@google/genai';

export interface SenseiContextData {
  userName: string;
  trainedToday: boolean;
  dailyPercent: number;
  scorePoints: number;
  streakDays: number;
  activeProjectTitle?: string;
  activeProjectNextAction?: string;
}

export interface SenseiInsight {
  title: string;
  body: string;
  principio: string;
  isAiGenerated?: boolean;
}

const STORAGE_KEY_API_KEY = 'kz:gemini_api_key';

export function getGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  const envKey = (import.meta.env?.VITE_GEMINI_API_KEY as string | undefined)?.trim();
  if (envKey) return envKey;
  return localStorage.getItem(STORAGE_KEY_API_KEY) || null;
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY_API_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}

export function getFallbackInsights(ctx: SenseiContextData): SenseiInsight[] {
  return [
    {
      title: ctx.trainedToday
        ? 'Sinergia Físico-Cognitiva Activa'
        : 'Micro-disciplina del 1%',
      body: ctx.trainedToday
        ? `Has registrado entrenamiento físico hoy. Tu claridad dopaminérgica está en su pico: es el momento idóneo para abordar la próxima acción en FORJA: "${ctx.activeProjectNextAction || 'Estructurar proyecto'}" sin postergación.`
        : ctx.dailyPercent >= 100
        ? `¡Has alcanzado la meta del 1% hoy! En Kaizen, la moderación es virtud: no te satures. Consolida lo ganado y prepara el terreno para mañana.`
        : `Tienes un avance del ${ctx.dailyPercent}% hacia tu meta del día. Recuerda: una sola acción de 2 minutos basta para mantener el impulso. Lo compuesto vence a lo heroico.`,
      principio: '“Mejorar un 1% cada día es multiplicar por 37 tus capacidades en un año.”',
      isAiGenerated: false,
    },
    {
      title: 'Enfoque Monotarea',
      body: ctx.activeProjectTitle
        ? `En el taller FORJA tienes "${ctx.activeProjectTitle}". En lugar de dispersarte en 10 tareas, enfoca tu siguiente bloque de 25 minutos exclusivamente en: "${ctx.activeProjectNextAction}".`
        : 'Simplifica tu entorno. Identifica tu única próxima acción inmediata y ejecútala antes de abrir más frentes.',
      principio: '“El artesano no forja diez espadas a la vez; golpea un solo hierro con total presencia.”',
      isAiGenerated: false,
    },
    {
      title: 'Consistencia y No-Culpa',
      body: `Tu racha actual es de ${ctx.streakDays} ${ctx.streakDays === 1 ? 'día' : 'días'}. Si hoy tu energía es baja, haz una pausa consciente o realiza un micro-hábito mínimo. En Kaizen, el descanso reflexivo también es progreso.`,
      principio: '“El agua suave desgasta la roca dura, no por fuerza, sino por perseverancia.”',
      isAiGenerated: false,
    },
  ];
}

export async function generateSenseiInsight(ctx: SenseiContextData): Promise<SenseiInsight> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const fallback = getFallbackInsights(ctx)[0];
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Eres el Sensei Kaizen de Kaizen OS, una filosofía artesanal Wabi-Sabi donde el crecimiento del 1% diario vence al esfuerzo heroico desmedido.
Contexto actual del usuario (${ctx.userName}):
- Puntos Kaizen hoy: ${ctx.scorePoints} (${ctx.dailyPercent}% de la meta del 1%)
- Racha activa: ${ctx.streakDays} días consecutivos
- Entrenó hoy en gimnasio: ${ctx.trainedToday ? 'Sí' : 'Aún no'}
- Proyecto activo en FORJA: "${ctx.activeProjectTitle || 'Ninguno'}" con próxima acción: "${ctx.activeProjectNextAction || 'Ninguna'}"

Genera una reflexión breve, sobria y motivadora conectando estos datos reales.
Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "title": "Título corto y sobrio (3 a 5 palabras)",
  "body": "Párrafo de orientación práctica y psicológica (2 a 3 oraciones)",
  "principio": "“Aforismo clásico de maestría o constancia entre comillas”"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Respuesta vacía del modelo');
    }

    const parsed = JSON.parse(text) as { title?: string; body?: string; principio?: string };
    if (parsed.title && parsed.body && parsed.principio) {
      return {
        title: parsed.title,
        body: parsed.body,
        principio: parsed.principio,
        isAiGenerated: true,
      };
    }
    throw new Error('Estructura JSON incompleta');
  } catch (err) {
    console.warn('[SenseiAI] Error al consultar Gemini, usando sabiduría heurística:', err);
    return getFallbackInsights(ctx)[0];
  }
}
