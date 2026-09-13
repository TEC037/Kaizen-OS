/**
 * Motor de conocimientos del Coach IA de Punto Fuerte.
 *
 * Motor de reglas puro y sin dependencias de React que genera respuestas en
 * español para el asistente. Se usa de forma compartida entre:
 *  1. El cliente (fallback offline = 0 datos de red).
 *  2. La función serverless (functions/api/coach.ts) cuando se configura
 *     VITE_SERVERLESS_URL (mismo motor, mínimo payload de red).
 */

import { AllometricProfile } from '../services/allometricService';
import { ChatMessage } from '../types';

export interface CoachContext {
  /** Masa corporal del usuario en kg. */
  userWeight: number;
  /** Días de entrenamiento a la semana. */
  daysPerWeek: number;
  /** Objetivo principal (FitnessGoal). */
  primaryGoal: string;
  /** Nivel de experiencia. */
  experience: string;
  /** Nombre del usuario. */
  name: string;
  /** Perfil alométrico ya calculado (se reutiliza, no se recalcula). */
  allometric: AllometricProfile;
}

interface CoachReply {
  text: string;
  category: ChatMessage['category'];
}

const FALLBACK_REPLY = (ctx: CoachContext): CoachReply => ({
  text: `Entendido, ${ctx.name}. Como tu entrenador virtual, evalué tu perfil (${ctx.primaryGoal.toUpperCase()}, nivel ${ctx.experience}, ${ctx.daysPerWeek} días/sem) con biometría alométrica calibrada (escala x^(3/4) de Kleiber y x^(-1/4) cardíaca).\n\nPara maximizar tus resultados, recuerda que la tensión mecánica y el descanso recuperativo entre sesiones son los dos pilares de tu hipertrofia. ¿Deseas que analicemos algún ejercicio específico de tu rutina de hoy?`,
  category: 'motivation',
});

export function generateCoachReply(question: string, ctx: CoachContext): CoachReply {
  const lower = question.toLowerCase();

  if (
    lower.includes('ritmo') ||
    lower.includes('cardiac') ||
    lower.includes('1/4') ||
    lower.includes('corazon') ||
    lower.includes('pulso')
  ) {
    return {
      text: `**Frecuencia Cardíaca y Escala Alométrica (x^(-1/4) y x^(1/4))**:\n\nEn biología de sistemas (West, Brown & Enquist / Schmidt-Nielsen), la frecuencia cardíaca de los mamíferos escala con la masa corporal elevada a la **-1/4**: **f_HR ∝ M^(-1/4)**.\n\nPara tus **${ctx.userWeight} kg**:\n- **Frecuencia en reposo alométrica**: **${ctx.allometric.allometricRestingHr} bpm** (derivada de 68 × (M/70)^(-0.25)).\n- **Duración del ciclo cardíaco**: **${ctx.allometric.cardiacCycleDurationSec} s** por latido (escala x^(1/4)).\n- **Constante de recuperación cardíaca**: **${ctx.allometric.cardiacRecoveryHalfLifeSec} s** (el tiempo que tarda tu pulso en recuperar el 50% post-serie).\n- **HR Máxima teórica**: **${ctx.allometric.maxHeartRateBpm} bpm**.\n\nEsto garantiza que tus zonas de entrenamiento cardiovascular (Z1 a Z5) sean exactas para tu masa biológica real.`,
      category: 'technique',
    };
  }

  if (
    lower.includes('kleiber') ||
    lower.includes('3/4') ||
    lower.includes('caloria') ||
    lower.includes('metabol')
  ) {
    return {
      text: `**Ley de Kleiber y Gasto Metabólico (x^(3/4))**:\n\nMax Kleiber demostró en 1932 que la tasa metabólica no es proporcional a la masa lineal (x^1) ni a la superficie corporal (x^2/3), sino que escala con **M^(3/4)** debido a la geometría fractal de las redes capilares sanguíneas.\n\nEn tu perfil (${ctx.userWeight} kg):\n- **BMR según Ley de Kleiber**: **${ctx.allometric.kleiberBmrKcal} kcal/día** (70 × ${ctx.userWeight}^0.75).\n- **TDEE Alométrico**: **${ctx.allometric.allometricTdeeKcal} kcal/día** (con factor de actividad ${ctx.daysPerWeek} días/sem).\n- **Precisión vs Fórmula lineal**: El cálculo alométrico evita sobrestimar el gasto en personas pesadas o subestimarlo en ligeras (diferencia de ${ctx.allometric.bmrAllometricDeltaKcal > 0 ? '+' : ''}${ctx.allometric.bmrAllometricDeltaKcal} kcal respecto a Harris-Benedict).\n\nEn cada sesión, calculamos tus calorías activas integrando la potencia metabólica según esta ley de 3/4.`,
      category: 'nutrition',
    };
  }

  if (
    lower.includes('fuerza alometrica') ||
    lower.includes('2/3') ||
    lower.includes('jaric') ||
    lower.includes('relativa')
  ) {
    return {
      text: `**Índice de Fuerza Alométrica (x^(2/3) - Jaric/Siff)**:\n\nAl comparar levantadores, dividir el peso levantado entre el peso corporal (fuerza lineal) perjudica injustamente a quienes tienen mayor masa. La fuerza muscular depende del área de sección transversal del músculo, que escala geométricamente como **M^(2/3)**.\n\n- **Fórmula de Fuerza Alométrica**: **S = Carga / (M^(2/3))**.\n- Para normalizar cualquier levantamiento a un estándar de 70 kg usamos el factor **(70 / ${ctx.userWeight})^(2/3) = ${ctx.allometric.strengthScalingFactor}**.\n\nPor ejemplo, tu press de banca de 95 kg equivale a **${(95 * ctx.allometric.strengthScalingFactor).toFixed(1)} kg** para un atleta de 70 kg (un índice de fuerza de 5.19: Avanzado).`,
      category: 'technique',
    };
  }

  if (lower.includes('sentadilla') || lower.includes('squat')) {
    return {
      text: `Para mejorar tu sentadilla trasera:\n1. **Estabilidad del pie**: Imagina un trípode (talón, base del pulgar y meñique) empujando el suelo con fuerza constante.\n2. **Maniobra de Valsalva**: Inhala hondo diafragmáticamente y tensa el abdomen antes de descender.\n3. **Profundidad**: Busca romper el paralelo manteniendo la curvatura lumbar neutra.\n\n¿Quieres que adaptemos las repeticiones del día de piernas a 6-8 con mayor pausa abajo?`,
      category: 'technique',
    };
  }

  if (lower.includes('tiempo') || lower.includes('poco tiempo') || lower.includes('rapido')) {
    return {
      text: `¡No te preocupes! La consistencia supera a la perfección.\n\n**Estrategia Exprés (30 min)**:\n- Haz series efectivas en biseries (ej. Press de Banca alternado con Remo con mancuerna).\n- Reduce los descansos a 60 segundos.\n- Prioriza solo los dos ejercicios compuestos principales de hoy.\n\n¿Quieres que active el modo exprés para tu sesión?`,
      category: 'adaptation',
    };
  }

  if (lower.includes('aumentar') || lower.includes('peso') || lower.includes('sobrecarga')) {
    return {
      text: `Tu progreso reciente indica que completaste las series objetivo con un RPE de 8.\n\n**Regla del 2 por 2**: Si puedes completar 2 repeticiones extra en la última serie durante 2 entrenamientos seguidos, aumenta:\n- **+1.25 kg a +2.5 kg** en tren superior (presses y remos).\n- **+2.5 kg a +5 kg** en tren inferior (sentadilla y peso muerto).\n\n¡La técnica siempre debe ser innegociable antes de subir carga!`,
      category: 'adaptation',
    };
  }

  if (lower.includes('reemplazo') || lower.includes('banca') || lower.includes('alternativa')) {
    return {
      text: `Excelentes alternativas al press de banca plano con barra según disponibilidad o molestias:\n\n1. **Press con mancuernas en banco plano**: Mayor rango de estiramiento y menor estrés en muñecas.\n2. **Press en máquina convergente**: Estabilidad guiada ideal para fatiga alta o sin spotter.\n3. **Fondos en paralelas con ligera inclinación al frente**: Gran reclutamiento de pectoral inferior y deltoides anterior.`,
      category: 'technique',
    };
  }

  if (lower.includes('cansado') || lower.includes('fatiga') || lower.includes('dolor')) {
    return {
      text: `Escuchar a tu cuerpo es de atletas inteligentes.\n\nSi tu fatiga es muscular general:\n- Reduce 1 serie de cada ejercicio hoy (ej. de 4 series a 3).\n- Mantén el peso pero deja 2-3 repeticiones en recámara (RIR 2-3).\n\nSi sientes molestia en articulaciones o tendones, te recomiendo cambiar la sesión por el Día 3 de Movilidad y Recuperación Activa.`,
      category: 'adaptation',
    };
  }

  if (lower.includes('calentamiento') || lower.includes('hombro') || lower.includes('rotador')) {
    return {
      text: `Dado que tienes historial de molestia en manguito rotador:\n1. 2 series de 15 reps de rotaciones externas en polea o con mancuerna ligera.\n2. 10 dislocaciones de hombro con banda elástica.\n3. Series de aproximación progresivas (vacío, 50%, 70% de carga) antes de tu primera serie efectiva de press.`,
      category: 'technique',
    };
  }

  return FALLBACK_REPLY(ctx);
}
