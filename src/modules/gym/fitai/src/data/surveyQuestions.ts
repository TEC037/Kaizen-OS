import { LucideIcon } from 'lucide-react';
import {
  Target,
  GraduationCap,
  CalendarDays,
  Clock,
  Dumbbell,
  ListChecks,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

export interface SurveyOption {
  value: string;
  label: string;
  desc?: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  hint?: string;
  icon: LucideIcon;
  type: 'single' | 'multi';
  options: SurveyOption[];
}

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'goal',
    title: '¿Cuál es tu objetivo principal?',
    hint: 'Define cómo se ajustarán el volumen, las repeticiones y los descansos.',
    icon: Target,
    type: 'single',
    options: [
      { value: 'hipertrofia', label: 'Ganar Masa', desc: '8-12 reps, 3-4 series' },
      { value: 'perdida_grasa', label: 'Perder Grasa', desc: 'déficit y densidad' },
      { value: 'fuerza', label: 'Fuerza Máxima', desc: '3-6 reps, descansos largos' },
      { value: 'resistencia', label: 'Resistencia', desc: '15-20 reps' },
      { value: 'condicion_general', label: 'Condición General', desc: 'salud y tono' },
    ],
  },
  {
    id: 'experience',
    title: '¿Cuál es tu nivel de experiencia?',
    hint: 'Ajusta la dificultad técnica y el RPE sugerido de cada ejercicio.',
    icon: GraduationCap,
    type: 'single',
    options: [
      { value: 'principiante', label: 'Principiante', desc: '< 1 año entrenando' },
      { value: 'intermedio', label: 'Intermedio', desc: '1 a 3 años' },
      { value: 'avanzado', label: 'Avanzado', desc: '3+ años' },
    ],
  },
  {
    id: 'days',
    title: '¿Cuántos días por semana puedes entrenar?',
    hint: 'Forzamos rutinas realistas: nunca te diremos 5 días si solo tienes 3.',
    icon: CalendarDays,
    type: 'single',
    options: [
      { value: '2', label: '2 días', desc: 'Full body A/B' },
      { value: '3', label: '3 días', desc: 'Empuje / Tirón / Pierna' },
      { value: '4', label: '4 días', desc: 'Superior / Inferior x2' },
      { value: '5', label: '5 días', desc: 'Empuje / Tirón / Pierna + brazo y core' },
      { value: '6', label: '6 días', desc: 'Empuje / Tirón / Pierna x2' },
    ],
  },
  {
    id: 'minutes',
    title: '¿Cuánto dura cada sesión?',
    hint: 'Controla el número de ejercicios por día.',
    icon: Clock,
    type: 'single',
    options: [
      { value: '30', label: '30 min', desc: '3 ejercicios' },
      { value: '45', label: '45 min', desc: '4 ejercicios' },
      { value: '60', label: '60 min', desc: '5 ejercicios' },
      { value: '75', label: '75 min', desc: '6 ejercicios' },
      { value: '90', label: '90 min', desc: '6 ejercicios' },
    ],
  },
  {
    id: 'equipment',
    title: '¿Qué equipamiento tienes disponible?',
    hint: 'Solo sugeriremos ejercicios que puedas hacer (puedes elegir varias).',
    icon: Dumbbell,
    type: 'multi',
    options: [
      { value: 'gimnasio', label: 'Gimnasio completo', desc: 'todo disponible' },
      { value: 'barras', label: 'Barra y discos', desc: 'básicos olímpicos' },
      { value: 'mancuernas', label: 'Mancuernas', desc: 'y banco ajustable' },
      { value: 'maquinas', label: 'Máquinas guiadas', desc: 'jalón, prensa, etc.' },
      { value: 'poleas', label: 'Poleas y cables', desc: 'cruzamientos, polea alta' },
      { value: 'calistenia', label: 'Calistenia / peso corporal', desc: 'dominadas, fondos, colchoneta' },
    ],
  },
  {
    id: 'muscles',
    title: '¿Qué zonas quieres priorizar?',
    hint: 'Reciben un extra de ejercicios en tu rutina.',
    icon: ListChecks,
    type: 'multi',
    options: [
      { value: 'Pecho', label: 'Pecho' },
      { value: 'Espalda', label: 'Espalda' },
      { value: 'Hombros', label: 'Hombros' },
      { value: 'Brazos', label: 'Brazos' },
      { value: 'Piernas', label: 'Piernas' },
      { value: 'Glúteos', label: 'Glúteos' },
      { value: 'Abdomen y Core', label: 'Abdomen y Core' },
    ],
  },
  {
    id: 'limitations',
    title: '¿Tienes alguna lesión o limitación?',
    hint: 'Aplicaremos un filtro de seguridad para evitar patrones de riesgo.',
    icon: ShieldAlert,
    type: 'multi',
    options: [
      { value: 'ninguna', label: 'Ninguna', desc: 'sin restricciones' },
      { value: 'rodillas', label: 'Rodillas', desc: 'evitar sentadillas/zancadas hondas' },
      { value: 'espalda', label: 'Zona lumbar', desc: 'evitar peso muerto y remos forzados' },
      { value: 'hombros', label: 'Hombros', desc: 'evitar press por encima de la cabeza' },
      { value: 'cervical', label: 'Cervical', desc: 'evitar cargas sobre el cuello' },
    ],
  },
  {
    id: 'style',
    title: '¿Qué estilo de entrenamiento prefieres?',
    hint: 'Modula la selección de ejercicios y el orden de prioridad.',
    icon: SlidersHorizontal,
    type: 'single',
    options: [
      { value: 'compound', label: 'Básicos compuestos', desc: 'press, remos, sentadillas' },
      { value: 'balanced', label: 'Mix equilibrado', desc: 'compuestos + aislamiento' },
      { value: 'isolation', label: 'Aislamiento y máquinas', desc: 'máquinas guiadas y poleas' },
    ],
  },
];