// Constantes de dominio (Punto Fuerte)

// Valores por defecto de sesión
export const DEFAULT_REST_SECONDS = 90;
export const DEFAULT_AVERAGE_RPE = 8;
export const FALLBACK_TOTAL_SETS = 12;
export const FALLBACK_TOTAL_VOLUME_KG = 8400;
export const FRESH_START_COMPLIANCE = 25; // % al completar onboarding
export const MIN_DURATION_REPORT_MIN = 1;

// Rutinas (tiempo por ejercicio y piso estimado)
export const MINUTES_PER_EXERCISE = 10;
export const MIN_ROUTINE_ESTIMATED_MINUTES = 15;

// Cumplimiento semanal
export const COMPLIANCE_INCREMENT_PER_WORKOUT = 10;

// Coach IA
export const COACH_THINKING_DELAY_MS = 900; // latencia mínima de "pensando"

export const STORAGE_KEYS = {
  USER: 'fitai_user_v2',
  AUTH: 'fitai_auth_v2',
  HISTORY: 'fitai_history_v2',
  SCREEN: 'fitai_screen_v2',
  ROUTINES: 'fitai_routines_v3',
  CHAT: 'fitai_chat_v2',
  WORKOUT: 'fitai_workout_v2',
  DEMO: 'fitai_demo_v2',
} as const;

// Claves de la edición demo (/demo): aisladas de las de una cuenta real para
// que la demo nunca lea ni escriba datos del usuario auténtico.
export const DEMO_STORAGE_KEYS: Record<keyof typeof STORAGE_KEYS, string> = {
  USER: 'fitai_demo_user',
  AUTH: 'fitai_demo_auth',
  HISTORY: 'fitai_demo_history',
  SCREEN: 'fitai_demo_screen',
  ROUTINES: 'fitai_demo_routines',
  CHAT: 'fitai_demo_chat',
  WORKOUT: 'fitai_demo_workout',
  DEMO: 'fitai_demo_flag',
};

// Supabase (Auth + base de datos)
// Lectura con guarda: el módulo también se bundlea en Cloudflare Pages
// Functions (workerd), donde `import.meta.env` no existe.
const ENV = ((typeof import.meta !== 'undefined' && import.meta.env) ||
  {}) as Record<string, string | undefined>;
export const SUPABASE_URL = ENV.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY as string | undefined;

// Cuenta demo con la que entra el botón circular (se crea en el seeder SQL).
export const DEMO_EMAIL = 'demo@fitai.app';
export const DEMO_PASSWORD = 'fitai-demo-2026';
