/**
 * @file src/modules/finance/FinanceWidget.tsx
 * @description Widget de Finanzas Personales para el Dashboard de Kaizen OS.
 */

import React, { useState, useEffect } from 'react';
import { ModuleWidgetProps } from '../../core/types';
import { ModuleWidget } from '../../components/ModuleWidget';
import {
  ExpenseCategoryItem,
  FinancialGoalItem,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_FINANCIAL_GOALS,
} from '../../data/demoData';
import { loadCustomData } from '../../core/storage';
import { Wallet, ArrowRight } from 'lucide-react';

export const FinanceWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [categories] = useState<ExpenseCategoryItem[]>(() =>
    loadCustomData<ExpenseCategoryItem[]>('finance_cats', INITIAL_EXPENSE_CATEGORIES)
  );
  const [goals] = useState<FinancialGoalItem[]>(() =>
    loadCustomData<FinancialGoalItem[]>('finance_goals', INITIAL_FINANCIAL_GOALS)
  );

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
  const totalAllocated = categories.reduce((acc, c) => acc + c.allocated, 0);
  const budgetPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const primaryGoal = goals[0];
  const goalPercent = primaryGoal
    ? Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100)
    : 0;

  return (
    <ModuleWidget
      id="finance-overview"
      moduleId="finance"
      title="Resumen de Finanzas"
      targetPath="/finance"
      onNavigate={onNavigate}
    >
      <div className="space-y-3">
        {/* Presupuesto mensual consumido */}
        <div className="p-2.5 border border-zinc-200 bg-zinc-50/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-900">Presupuesto Mensual:</span>
            <span className="font-mono text-zinc-700">
              ${totalSpent.toLocaleString()} / ${totalAllocated.toLocaleString()} ({budgetPercent}%)
            </span>
          </div>
          <div className="w-full bg-zinc-200 h-1.5 border border-zinc-300">
            <div
              className={`h-full ${budgetPercent > 90 ? 'bg-amber-600' : 'bg-zinc-800'}`}
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
        </div>

        {/* Meta destacada */}
        {primaryGoal && (
          <div className="p-2.5 border border-zinc-200 bg-zinc-50/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-900 truncate">
                Meta: {primaryGoal.title}
              </span>
              <span className="font-mono text-zinc-700 text-[11px]">
                {goalPercent}%
              </span>
            </div>
            <div className="w-full bg-zinc-200 h-1.5 border border-zinc-300">
              <div
                className="bg-emerald-700 h-full"
                style={{ width: `${Math.min(100, goalPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>${primaryGoal.currentAmount.toLocaleString()} de ${primaryGoal.targetAmount.toLocaleString()}</span>
              <span>Plazo: {primaryGoal.deadline}</span>
            </div>
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/finance')}
            className="text-xs font-mono text-zinc-800 hover:text-zinc-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Ver categorías y metas</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};
