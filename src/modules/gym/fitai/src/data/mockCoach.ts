import { ChatMessage } from '../types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_01',
    sender: 'coach',
    text: '¡Hola Carlos! Soy tu Coach IA. He analizado tu progreso y tus registros recientes. Hoy tienes programado "Empuje Dinámico" (Pecho y Tríceps). ¿En qué puedo ayudarte hoy para maximizar tu sesión?',
    timestamp: '10:30',
    category: 'motivation',
  },
  {
    id: 'msg_02',
    sender: 'user',
    text: '¿Debo aumentar el peso en el press de banca hoy?',
    timestamp: '10:32',
  },
  {
    id: 'msg_03',
    sender: 'coach',
    text: '¡Buena pregunta! En tu última sesión completaste 4 series de 8-10 reps con 82.5 kg manteniendo un RPE de 8.2 y sin molestias en hombros.\n\nMi recomendación:\n1. Mantén la primera serie en 82.5 kg como calentamiento activo.\n2. Si las repeticiones salen con velocidad y técnica estricta, sube a 85 kg para las series 2 y 3 buscando 7-8 repeticiones sólidas.\n3. Si la velocidad de barra cae por debajo de lo habitual, mantén 82.5 kg y busca 1 repetición más.',
    timestamp: '10:33',
    category: 'technique',
    suggestedAction: {
      label: 'Ver rutina de hoy',
      screen: 'routine',
    },
  },
];

export const FREQUENT_COACH_QUESTIONS = [
  '¿Cómo mejoro mi técnica en sentadilla?',
  '¿Qué puedo hacer si no tengo tiempo para entrenar hoy?',
  '¿Debo aumentar el peso esta semana?',
  '¿Qué ejercicio puedo usar en lugar del press de banca?',
  'Me siento cansado, ¿cómo adapto mi rutina?',
  '¿Cómo caliento adecuadamente los hombros?',
];
