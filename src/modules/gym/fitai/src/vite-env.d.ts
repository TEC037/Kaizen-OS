/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * URL base del endpoint serverless del Coach IA.
   * Vacío/ausente (valor por defecto) = la app funciona 100% local sin gastar datos.
   * Ejemplo: https://fitai-worker.<tu-subdominio>.workers.dev/api/coach
   */
  readonly VITE_SERVERLESS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
