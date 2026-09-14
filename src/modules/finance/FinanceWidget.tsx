/**
 * @file src/modules/finance/FinanceWidget.tsx
 * @description Widget de Finanzas Personales para el Dashboard de Kaizen OS.
 * Incluye aporte rápido a metas de ahorro con 1 tap (+ $ 50.000 / + $ 100.000 COP) y puntos Kaizen inmediatos.
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
import { ArrowRight, Target, CheckCircle2, RefreshCw } from 'lucide-react';
import { KzButton, KzBadge } from '../../components/ui';
import { formatCOP, migrateToCOP } from '../../core/formatters';

const loadCategoriesData = (): ExpenseCategoryItem[] => {
  const loaded = loadCustomData<ExpenseCategoryItem[]>('finance_cats', INITIAL_EXPENSE_CATEGORIES);
  const needsMigration = loaded.some((c) => c.allocated > 0 && c.allocated < 20000);
  if (needsMigration) {
    const migrated = loaded.map((c) => ({
      ...c,
      spent: migrateToCOP(c.spent),
      allocated: migrateToCOP(c.allocated),
    }));
    saveCustomData('finance_cats', migrated);
    return migrated;
  }
  return loaded;
};

const loadGoalsData = (): FinancialGoalItem[] => {
  const loaded = loadCustomData<FinancialGoalItem[]>('finance_goals', INITIAL_FINANCIAL_GOALS);
  const needsMigration = loaded.some((g) => g.targetAmount > 0 && g.targetAmount < 50000);
  if (needsMigration) {
    const migrated = loaded.map((g) => ({
      ...g,
      currentAmount: migrateToCOP(g.currentAmount),
      targetAmount: migrateToCOP(g.targetAmount),
    }));
    saveCustomData('finance_goals', migrated);
    return migrated;
  }
  return loaded;
};

export const FinanceWidget: React.FC<ModuleWidgetProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(loadCategoriesData);
  const [goals, setGoals] = useState<FinancialGoalItem[]>(loadGoalsData);
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);

  useEffect(() => {
    const handleStorage = () => {
      setCategories(loadCategoriesData());
      setGoals(loadGoalsData());
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
      awardKaizenPoints(15, 'finance', `Ahorro registrado: +${formatCOP(amount, { showCode: true })} hacia "${activeGoal.title}"`);
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
        <div className="p-3 border border-kz-line bg-kz-surface-2 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-kz-ink">Presupuesto Mensual:</span>
            <span className="text-kz-ink-soft">
              {formatCOP(totalSpent)} / {formatCOP(totalAllocated)} ({budgetPercent}%)
            </span>
          </div>
          <div className="w-full bg-kz-line h-1.5 rounded-xs overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-xs ${
                budgetPercent > 90 ? 'bg-kz-warning' : 'bg-kz-ink'
              }`}
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-kz-ink-dim pt-0.5">
            <span>
              {totalAllocated >= totalSpent ? (
                <>Disponible: <strong className="text-kz-success font-semibold">{formatCOP(totalAllocated - totalSpent)}</strong></>
              ) : (
                <>Excedente: <strong className="text-kz-warning font-semibold">+{formatCOP(totalSpent - totalAllocated)}</strong></>
              )}
            </span>
            <span className={budgetPercent >= 100 ? 'text-kz-danger font-semibold' : 'text-kz-ink-dim'}>
              {budgetPercent >= 100 ? 'Límite alcanzado' : `${100 - budgetPercent}% restante`}
            </span>
          </div>
        </div>

        {/* Meta destacada con aporte rápido en 1 click */}
        {activeGoal && (
          <div className="p-3 border border-kz-line bg-kz-surface-2 rounded-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Target size={13} className="text-kz-success shrink-0" />
                <span className="font-bold text-kz-ink truncate">
                  {activeGoal.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {goals.length > 1 && (
                  <KzButton
                    variant="craft"
                    size="sm"
                    className="p-1 min-w-0 h-6"
                    onClick={cycleNextGoal}
                    icon={<RefreshCw size={11} />}
                    title="Alternar entre metas financieras"
                  />
                )}
                <KzBadge variant={isGoalReached ? 'success' : 'accent'}>
                  {goalPercent}%
                </KzBadge>
              </div>
            </div>

            <div className="w-full bg-kz-line h-1.5 rounded-xs overflow-hidden">
              <div
                className="bg-kz-success h-full transition-all duration-300 rounded-xs"
                style={{ width: `${Math.min(100, goalPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-kz-ink-soft">
              <span>{formatCOP(activeGoal.currentAmount)} de {formatCOP(activeGoal.targetAmount)}</span>
              <span>Plazo: {activeGoal.deadline}</span>
            </div>

            {/* Acciones de aporte rápido (+ $ 50.000 y + $ 100.000) o estado de meta cumplida */}
            {isGoalReached ? (
              <div className="flex items-center justify-between pt-1 border-t border-kz-line/60">
                <div className="flex items-center gap-1.5 text-kz-success font-bold text-[11px]">
                  <CheckCircle2 size={13} className="text-kz-success shrink-0" />
                  <span>¡Meta alcanzada! (+40 pts)</span>
                </div>
                {goals.length > 1 && (
                  <KzButton
                    variant="craft"
                    size="sm"
                    onClick={cycleNextGoal}
                  >
                    Siguiente meta →
                  </KzButton>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-kz-line/60">
                <span className="text-[10px] text-kz-ink-dim">Aporte rápido:</span>
                <div className="flex items-center gap-1.5">
                  <KzButton
                    variant="craft"
                    size="sm"
                    onClick={() => contributeToGoal(50000)}
                    title="Aportar $ 50.000 COP a esta meta (+15 pts Kaizen)"
                  >
                    +$ 50.000
                  </KzButton>
                  <KzButton
                    variant="primary"
                    size="sm"
                    onClick={() => contributeToGoal(100000)}
                    title="Aportar $ 100.000 COP a esta meta (+15 pts Kaizen)"
                  >
                    +$ 100.000
                  </KzButton>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <KzButton
            variant="ghost"
            size="sm"
            onClick={() => {
              soundEngine.playTap();
              onNavigate('/finance');
            }}
          >
            <span>Ver categorías y metas</span>
            <ArrowRight size={12} />
          </KzButton>
        </div>
      </div>
    </ModuleWidget>
  );
};
