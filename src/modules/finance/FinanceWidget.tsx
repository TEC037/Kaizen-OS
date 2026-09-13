/**
 * @file src/modules/finance/FinanceWidget.tsx
 * @description Widget de Finanzas Personales para el Dashboard de Kaizen OS.
 * Incluye aporte rápido a metas de ahorro con 1 tap (+ $25 / + $50) y puntos Kaizen inmediatos.
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
import { loadCustomData, saveCustomData } from '../../core/storage';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { awardKaizenPoints } from '../../core/scoring';
import { Wallet, ArrowRight, Target, Plus, CheckCircle2, RefreshCw } from 'lucide-react';

export const FinanceWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(() =>
    loadCustomData<ExpenseCategoryItem[]>('finance_cats', INITIAL_EXPENSE_CATEGORIES)
  );
  const [goals, setGoals] = useState<FinancialGoalItem[]>(() =>
    loadCustomData<FinancialGoalItem[]>('finance_goals', INITIAL_FINANCIAL_GOALS)
  );
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);

  useEffect(() => {
    const handleStorage = () => {
      setCategories(loadCustomData<ExpenseCategoryItem[]>('finance_cats', INITIAL_EXPENSE_CATEGORIES));
      setGoals(loadCustomData<FinancialGoalItem[]>('finance_goals', INITIAL_FINANCIAL_GOALS));
    };
    window.addEventListener('storage_finance_updated', handleStorage);
    return () => window.removeEventListener('storage_finance_updated', handleStorage);
  }, []);

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
  const totalAllocated = categories.reduce((acc, c) => acc + c.allocated, 0);
  const budgetPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  
  const activeGoal = goals[activeGoalIndex % (goals.length || 1)] || goals[0];
  const isGoalReached = Boolean(activeGoal && activeGoal.currentAmount >= activeGoal.targetAmount);
  const goalPercent = activeGoal
    ? Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)
    : 0;

  const cycleNextGoal = () => {
    soundEngine.playTap();
    if (goals.length <= 1) return;
    setActiveGoalIndex((prev) => (prev + 1) % goals.length);
  };

  const contributeToGoal = (amount: number) => {
    if (!activeGoal) return;
    const nextAmount = Math.min(activeGoal.targetAmount, activeGoal.currentAmount + amount);
    const willBeReached = nextAmount >= activeGoal.targetAmount;

    const updated = goals.map((g) => (g.id === activeGoal.id ? { ...g, currentAmount: nextAmount } : g));
    setGoals(updated);
    saveCustomData('finance_goals', updated);
    window.dispatchEvent(new Event('storage_finance_updated'));

    if (willBeReached) {
      soundEngine.playMilestone();
      awardKaizenPoints(40, 'finance', `Hito Financiero: ¡Meta alcanzada "${activeGoal.title}"!`);
    } else {
      soundEngine.playComplete();
      awardKaizenPoints(15, 'finance', `Ahorro registrado: +$${amount} hacia "${activeGoal.title}"`);
    }

    kaizenBus.emit(KaizenContracts.FinanceExpenseLogged, {
      category: 'Ahorro / Metas',
      amount,
      description: activeGoal.title,
    });
  };

  return (
    <ModuleWidget
      id="finance-overview"
      moduleId="finance"
      title="Resumen de Finanzas"
      targetPath="/finance"
      onNavigate={onNavigate}
    >
      <div className="space-y-3 font-mono text-xs">
        {/* Presupuesto mensual consumido */}
        <div className="p-3 border border-stone-200 bg-[#faf8f1] rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-900">Presupuesto Mensual:</span>
            <span className="text-stone-700">
              ${totalSpent.toLocaleString()} / ${totalAllocated.toLocaleString()} ({budgetPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-200 h-1.5 rounded-xs overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-xs ${
                budgetPercent > 90 ? 'bg-amber-600' : 'bg-stone-800'
              }`}
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
            <span>
              {totalAllocated >= totalSpent ? (
                <>Disponible: <strong className="text-emerald-800 font-semibold">${(totalAllocated - totalSpent).toLocaleString()}</strong></>
              ) : (
                <>Excedente: <strong className="text-amber-700 font-semibold">+${(totalSpent - totalAllocated).toLocaleString()}</strong></>
              )}
            </span>
            <span className={budgetPercent >= 100 ? 'text-amber-700 font-semibold' : 'text-stone-500'}>
              {budgetPercent >= 100 ? 'Límite alcanzado' : `${100 - budgetPercent}% restante`}
            </span>
          </div>
        </div>

        {/* Meta destacada con aporte rápido en 1 click */}
        {activeGoal && (
          <div className="p-3 border border-stone-200 bg-[#faf8f1] rounded-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Target size={13} className="text-emerald-700 shrink-0" />
                <span className="font-bold text-stone-900 truncate">
                  {activeGoal.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleNextGoal}
                    className="p-1 border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 rounded-xs text-[10px] cursor-pointer"
                    title="Alternar entre metas financieras"
                  >
                    <RefreshCw size={11} />
                  </button>
                )}
                <span
                  className={`text-[10px] font-bold border px-1.5 py-0.2 rounded-xs ${
                    isGoalReached
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-900'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {goalPercent}%
                </span>
              </div>
            </div>

            <div className="w-full bg-stone-200 h-1.5 rounded-xs overflow-hidden">
              <div
                className="bg-emerald-700 h-full transition-all duration-300 rounded-xs"
                style={{ width: `${Math.min(100, goalPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-600">
              <span>${activeGoal.currentAmount.toLocaleString()} de ${activeGoal.targetAmount.toLocaleString()}</span>
              <span>Plazo: {activeGoal.deadline}</span>
            </div>

            {/* Acciones de aporte rápido (+ $25 y + $50) o estado de meta cumplida */}
            {isGoalReached ? (
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                  <span>¡Meta alcanzada! (+40 pts)</span>
                </div>
                {goals.length > 1 && (
                  <button
                    type="button"
                    onClick={cycleNextGoal}
                    className="px-2 py-0.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 rounded-xs text-[10px] font-bold cursor-pointer"
                  >
                    Siguiente meta →
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <span className="text-[10px] text-stone-500">Aporte rápido:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => contributeToGoal(25)}
                    className="px-2 py-0.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 rounded-xs text-[10px] font-bold cursor-pointer transition-colors"
                    title="Aportar $25 a esta meta (+15 pts Kaizen)"
                  >
                    +$25
                  </button>
                  <button
                    type="button"
                    onClick={() => contributeToGoal(50)}
                    className="px-2 py-0.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xs text-[10px] font-bold cursor-pointer transition-colors"
                    title="Aportar $50 a esta meta (+15 pts Kaizen)"
                  >
                    +$50
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/finance')}
            className="text-xs font-mono text-stone-700 hover:text-stone-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
          >
            <span>Ver categorías y metas</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </ModuleWidget>
  );
};
