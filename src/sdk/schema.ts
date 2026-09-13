/**
 * @file src/sdk/schema.ts
 * @description Contrato formal (Module Spec v2) para los módulos de Kaizen OS.
 * Extiende el manifiesto actual con capacidades declarativas para:
 * - Tema (overrides sobre tokens unificados)
 * - Storage (scope namespaced + versión)
 * - Eventos (emits / listens con validación de payload)
 * - Settings (esquema de personalización generable en el módulos manager)
 * - Scoring (mapeo evento → puntos Kaizen)
 *
 * Los módulos existentes pueden seguir usando `ModuleManifest` (v1); este schema
 * es el objetivo al que se migra incrementalmente.
 */

import { z } from 'zod';

/** Categorías funcionales equivalentes a `ModuleCategory` del core. */
export const MODULE_CATEGORIES = [
  'Productividad',
  'Salud y Bienestar',
  'Aprendizaje',
  'Finanzas',
  'Organización',
] as const;

/** Estados del ciclo de vida equivalentes a `ModuleStatus` del core. */
export const MODULE_STATUSES = ['available', 'installed', 'enabled', 'suspended'] as const;

/** Tipos de campo soportados para los settings de un módulo. */
export const SETTING_TYPES = ['text', 'number', 'boolean', 'select'] as const;

/**
 * Definición de un setting personalizable de módulo.
 * El modules manager genera el formulario a partir de esto (Fase 6).
 */
export const moduleSettingSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(SETTING_TYPES),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional()
    .describe('Obligatorio si type === select'),
  help: z.string().optional(),
  default: z.unknown().optional(),
});
export type ModuleSettingDef = z.infer<typeof moduleSettingSchema>;

/**
 * Contrato de un evento de módulo. `payloadSchema` valida el payload en tiempo
 * de emisión/escucha (si no está presente no se valida).
 */
export const moduleEventSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9]+:[a-z0-9-]:?[a-z0-9-]*$/i, 'Formato: <modulo>:<evento> (ej: forja:project-created)'),
  description: z.string().optional(),
  payloadSchema: z.custom<z.ZodType<unknown>>().optional(),
  /** Puntos Kaizen otorgados al emitir este evento (Fase 5). */
  points: z.number().nonnegative().optional(),
  reason: z.string().optional(),
});
export type ModuleEventSpec = z.infer<typeof moduleEventSchema>;

/**
 * Schema formal del módulo (v2). Todos los campos v1 siguen existiendo para
 * que la migración sea un superset compatible.
 */
export const moduleSpecSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  iconName: z.string(),
  version: z.string().optional(),
  author: z.string().optional(),
  category: z.enum(MODULE_CATEGORIES),
  defaultStatus: z.enum(MODULE_STATUSES),
  /** Declaración de la ruta principal del módulo. */
  entry: z
    .object({
      path: z.string().startsWith('/').optional(),
      /** Carga diferida del sub-app (Fase 3/4). */
      lazy: z.boolean().default(true),
    })
    .optional(),
  /** Overrides sobre los tokens de diseño unificados. */
  theme: z
    .object({
      accent: z.string().optional(),
      bg: z.string().optional(),
    })
    .default({}),
  /** Storage namespaced. `scope` es el namespace obligatorio (Fase 2). */
  storage: z
    .object({
      scope: z.string().min(1),
      version: z.number().int().nonnegative().default(1),
      defaults: z.record(z.string(), z.unknown()).default({}),
    })
    .optional(),
  /** Eventos que el módulo EMITE y que ESCUCHA (contratos).
   *  `emits` con `points`/`reason` alimenta el scoring declarativo (Fase 5). */
  events: z
    .object({
      emits: z.array(moduleEventSchema).default([]),
      listens: z.array(moduleEventSchema).default([]),
    })
    .default({ emits: [], listens: [] }),
  /** Esquema de personalización por usuario (Fase 6). */
  settings: z.array(moduleSettingSchema).default([]),
});
export type ModuleSpec = z.infer<typeof moduleSpecSchema>;

/** Valida un spec declarativo y lanza un error descriptivo si es inválido. */
export function parseModuleSpec(spec: unknown): ModuleSpec {
  const result = moduleSpecSchema.safeParse(spec);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join(' · ');
    throw new Error(`[KaizenOS:Spec] Spec de módulo inválido → ${issues}`);
  }
  return result.data;
}