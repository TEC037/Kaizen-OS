/**
 * @file src/sdk/contracts.ts
 * @description Contratos fuertemente tipados de eventos para la Malla Entramada (Event Mesh) de Kaizen OS.
 * Define la especificación formal de eventos que viajan por el bus reactivo.
 */

import { contract, EventContract } from './bus';

export interface GymSessionCompletedPayload {
  sessionId?: string;
  routineName?: string;
  durationMinutes: number;
  caloriesBurned?: number;
  volumeKg?: number;
  intensity?: 'low' | 'mid' | 'high';
  timestamp?: string;
}

export interface HabitToggledPayload {
  habitId: string;
  habitTitle: string;
  completed: boolean;
  streak: number;
}

export interface HabitsAllDailyDonePayload {
  date: string;
  count: number;
}

export interface ForjaNextActionDonePayload {
  projectId: string;
  projectName?: string;
  taskTitle: string;
}

export interface ForjaProjectCompletedPayload {
  projectId: string;
  name: string;
  milestoneCount?: number;
}

export interface ReadingSessionFinishedPayload {
  bookTitle: string;
  pagesRead: number;
  minutesSpent?: number;
}

export interface FinanceExpenseLoggedPayload {
  category: string;
  amount: number;
  description?: string;
}

export interface KaizenGoalReachedPayload {
  totalToday: number;
  goal: number;
  streakDays: number;
}

/**
 * Catálogo central de contratos de eventos de la Malla Reactiva
 */
export const KaizenContracts = {
  // Gimnasio (Punto Fuerte)
  GymSessionCompleted: contract<GymSessionCompletedPayload>('gym:session-completed'),

  // Hábitos (TRANSMUTE)
  HabitToggled: contract<HabitToggledPayload>('habits:toggled'),
  HabitsAllDailyDone: contract<HabitsAllDailyDonePayload>('habits:all-daily-done'),

  // Proyectos (FORJA)
  ForjaNextActionDone: contract<ForjaNextActionDonePayload>('forja:next-action-done'),
  ForjaProjectCompleted: contract<ForjaProjectCompletedPayload>('forja:project-completed'),

  // Lectura
  ReadingSessionFinished: contract<ReadingSessionFinishedPayload>('reading:session-finished'),

  // Finanzas
  FinanceExpenseLogged: contract<FinanceExpenseLoggedPayload>('finance:expense-logged'),

  // Sistema Kaizen
  KaizenGoalReached: contract<KaizenGoalReachedPayload>('kaizen:daily-goal-reached'),
} as const;
