/**
 * @file src/core/types.ts
 * @description Definición de contratos e interfaces para el sistema de módulos de Kaizen OS.
 * El núcleo del sistema solo interactúa con los módulos a través de estos contratos.
 */

import React from 'react';
import type { ModuleSpec } from '../sdk/schema';

/**
 * Componente de un módulo. Puede ser una función/clase normal o un componente
 * cargado de forma diferida (React.lazy) para code-splitting (Fase 3).
 */
export type ModuleComponent =
  | React.ComponentType
  | React.LazyExoticComponent<React.ComponentType<any>>;

/**
 * Estados posibles del ciclo de vida de un módulo:
 * - 'available': Módulo disponible en el catálogo para ser instalado.
 * - 'installed': Instalado pero aún no activado (estado de transición o listo para habilitar).
 * - 'enabled': Instalado y habilitado activamente en navegación, dashboard y rutas.
 * - 'suspended': Instalado pero temporalmente desactivado (no aparece en menú ni dashboard).
 */
export type ModuleStatus = 'available' | 'installed' | 'enabled' | 'suspended';

/**
 * Categorías funcionales de módulos en Kaizen OS
 */
export type ModuleCategory = 'Productividad' | 'Salud y Bienestar' | 'Aprendizaje' | 'Finanzas' | 'Organización';

/**
 * Definición de una ruta aportada por un módulo
 */
export interface ModuleRoute {
  path: string;            // Ruta relativa (ej: '/habits', '/gym')
  label: string;           // Etiqueta para el menú de navegación
  iconName: string;        // Identificador visual de icono
  component: ModuleComponent; // Componente de la vista completa (puede ser lazy)
  exact?: boolean;
}

/**
 * Propiedades estándar que recibe un widget de dashboard
 */
export interface ModuleWidgetProps {
  onNavigate: (path: string) => void;
}

/**
 * Definición de un widget para el dashboard principal
 */
export interface ModuleWidgetDef {
  id: string;
  title: string;
  gridSpan?: 'full' | 'half' | 'third'; // Distribución en el wireframe
  component: React.ComponentType<ModuleWidgetProps> | React.LazyExoticComponent<React.ComponentType<ModuleWidgetProps>>;
}

/**
 * Manifiesto oficial de un módulo en Kaizen OS.
 * Cada módulo declara de forma declarativa todo lo que necesita y aporta al sistema.
 */
export interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  iconName: string;
  defaultStatus: ModuleStatus;
  routes: ModuleRoute[];
  widgets: ModuleWidgetDef[];
  permissions: string[];
  optionalDependencies?: string[];
  version?: string;
  author?: string;
  /**
   * Especificación declarativa (Module Spec v2). Los campos opcionales se
   * completan con defaults al validar (ver `parseModuleSpec`). Incluye
   * `events.emits[].points` para el scoring declarativo (Fase 5).
   */
  spec?: Partial<ModuleSpec>;
}

/**
 * Estado guardado en persistencia (localStorage) por módulo
 */
export interface ModuleStateRecord {
  status: ModuleStatus;
  installedAt?: string;
  lastUpdatedAt?: string;
}

/**
 * Diccionario de estados de todos los módulos
 */
export type ModuleStateMap = Record<string, ModuleStateRecord>;

/**
 * Registro de un evento de puntuación Kaizen
 */
export interface ScoreLogEntry {
  id: string;
  timestamp: string;
  points: number;
  sourceModule: string; // 'habits' | 'projects' | 'gym' | 'reading' | 'finance' | 'system'
  reason: string;
}

/**
 * Estado general del sistema de puntuación Kaizen
 * El usuario inicia estrictamente con 0 puntos.
 */
export interface KaizenScoreState {
  totalPoints: number;              // Puntos acumulados totales (inicia en 0)
  todayPoints: number;              // Puntos ganados hoy
  dailyGoalPoints: number;          // Meta de puntos para el "+1% de avance diario" (ej: 50 pts)
  currentStreakDays: number;        // Racha de días con compromiso >= 1%
  lastActiveDate: string;           // Fecha del último avance registrado (YYYY-MM-DD)
  history: ScoreLogEntry[];         // Registro cronológico de acciones que otorgaron puntos
}

