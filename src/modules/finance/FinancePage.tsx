/**
 * @file src/modules/finance/FinancePage.tsx
 * @description Pantalla completa del módulo de Finanzas Personales en Kaizen OS.
 * Desglose presupuestario por categoría, progreso hacia metas y registro simulado.
 * No utiliza datos bancarios reales.
 */

import React, { useState, useEffect } from 'react';
import {
  ExpenseCategoryItem,
  FinancialGoalItem,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_FINANCIAL_GOALS,
} from '../../data/demoData';
import { loadCustomData, saveCustomData } from '../../core/storage';
import { awardKaizenPoints } from '../../core/scoring';
import { soundEngine } from '../../core/sound';
import { kaizenBus } from '../../sdk/bus';
import { KaizenContracts } from '../../sdk/contracts';
import { Wallet, Plus } from 'lucide-react';
import { KzButton, KzCard, KzBadge } from '../../components/ui';
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

export const FinancePage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(loadCategoriesData);
  const [goals, setGoals] = useState<FinancialGoalItem[]>(loadGoalsData);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [expenseAmount, setExpenseAmount] = useState(50000);

  useEffect(() => {
    if (!showExpenseModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playTap();
        setShowExpenseModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExpenseModal]);

  const updateCategories = (cats: ExpenseCategoryItem[]) => {
    setCategories(cats);
    saveCustomData('finance_cats', cats);
    window.dispatchEvent(new Event('storage_finance_updated'));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCat = categories.find((c) => c.id === selectedCategory);
    const updated = categories.map((c) =>
      c.id === selectedCategory ? { ...c, spent: c.spent + expenseAmount } : c
    );
    soundEngine.playComplete();
    updateCategories(updated);
    awardKaizenPoints(
      10,
      'finance',
      `Control presupuestario: ${formatCOP(expenseAmount, { showCode: true })} registrado en ${targetCat?.category || 'gastos'}`
    );
    kaizenBus.emit(KaizenContracts.FinanceExpenseLogged, {
      category: targetCat?.category || 'General',
      amount: expenseAmount,
      description: `Registro presupuestario en ${targetCat?.category || 'gastos'}`,
    });
    setShowExpenseModal(false);
  };

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
  const totalAllocated = categories.reduce((acc, c) => acc + c.allocated, 0);
  const totalSavedCurrent = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo con delegación de layout al AppShell */}
      <KzCard variant="surface" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-kz-line">
        <div>
          <div className="flex items-center gap-2">
            <KzBadge variant="info">MÓDULO: /finance</KzBadge>
            <KzBadge variant="accent">Moneda: COP</KzBadge>
            <KzBadge variant="dim">v1.0.0</KzBadge>
          </div>
          <h1 className="text-xl font-bold text-kz-ink mt-1 tracking-tight flex items-center gap-2 font-mono">
            <Wallet size={20} className="text-kz-accent" />
            <span>Finanzas Personales y Metas de Ahorro</span>
          </h1>
          <p className="text-xs text-kz-ink-soft mt-0.5">
            Presupuesto consciente en Pesos Colombianos (COP) y acumulación gradual de reservas (+1% financiero).
          </p>
        </div>

        <div>
          <KzButton
            variant="primary"
            size="md"
            icon={<Plus size={14} />}
            onClick={() => {
              soundEngine.playTap();
              setShowExpenseModal(!showExpenseModal);
            }}
          >
            Registrar gasto rápido
          </KzButton>
        </div>
      </KzCard>

      {/* Modal simulado de gasto rápido */}
      {showExpenseModal && (
        <KzCard variant="sunken" className="p-4 space-y-3 border-kz-line-strong">
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="font-mono text-xs font-bold text-kz-ink uppercase tracking-wider">
              Simulación de registro de gasto (COP)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-medium text-kz-ink-soft mb-1">
                  Categoría destino
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono border border-kz-line bg-kz-surface text-kz-ink rounded-sm focus:outline-none focus:border-kz-line-strong"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-kz-ink-soft mb-1">
                  Monto ($ COP)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-kz-line bg-kz-surface text-kz-ink rounded-sm focus:outline-none focus:border-kz-line-strong"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <KzButton
                variant="craft"
                size="sm"
                type="button"
                onClick={() => {
                  soundEngine.playTap();
                  setShowExpenseModal(false);
                }}
              >
                Cancelar
              </KzButton>
              <KzButton
                variant="primary"
                size="sm"
                type="submit"
              >
                Confirmar gasto
              </KzButton>
            </div>
          </form>
        </KzCard>
      )}

      {/* Métricas de nivel superior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KzCard variant="surface" className="p-3 border-kz-line">
          <span className="text-[11px] font-mono text-kz-ink-dim uppercase tracking-wider block">
            Total Gastado / Mes
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-kz-ink mt-0.5">
            {formatCOP(totalSpent)} / {formatCOP(totalAllocated)}
          </p>
        </KzCard>
        <KzCard variant="surface" className="p-3 border-kz-line">
          <span className="text-[11px] font-mono text-kz-ink-dim uppercase tracking-wider block">
            Margen Presupuestario
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-kz-success mt-0.5">
            +{formatCOP(Math.max(0, totalAllocated - totalSpent))}
          </p>
        </KzCard>
        <KzCard variant="surface" className="p-3 border-kz-line">
          <span className="text-[11px] font-mono text-kz-ink-dim uppercase tracking-wider block">
            Ahorro Acumulado en Metas
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-kz-ink mt-0.5">
            {formatCOP(totalSavedCurrent)}
          </p>
        </KzCard>
      </div>

      {/* Grid: Categorías de Gasto y Objetivos Financieros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorías */}
        <KzCard variant="surface" className="p-4 space-y-3 border-kz-line">
          <div className="border-b border-kz-line pb-2">
            <h2 className="text-sm font-bold text-kz-ink uppercase tracking-tight font-mono">
              Presupuesto por Categorías (COP)
            </h2>
            <p className="text-xs text-kz-ink-soft">Consumo mensual frente al límite asignado</p>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const pct = Math.round((cat.spent / cat.allocated) * 100);
              const isOver = pct > 100;
              return (
                <KzCard key={cat.id} variant="sunken" className="p-3 space-y-1.5 border-kz-line">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-kz-ink font-mono">{cat.category}</span>
                    <span className="font-mono text-kz-ink-soft">
                      {formatCOP(cat.spent)} / {formatCOP(cat.allocated)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-kz-line h-2 rounded-xs overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-xs ${isOver ? 'bg-kz-danger' : pct > 85 ? 'bg-kz-warning' : 'bg-kz-accent'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </KzCard>
              );
            })}
          </div>
        </KzCard>

        {/* Metas de ahorro */}
        <KzCard variant="surface" className="p-4 space-y-3 border-kz-line">
          <div className="border-b border-kz-line pb-2">
            <h2 className="text-sm font-bold text-kz-ink uppercase tracking-tight font-mono">
              Objetivos Financieros (COP)
            </h2>
            <p className="text-xs text-kz-ink-soft">Metas Kaizen de acumulación a mediano plazo</p>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              return (
                <KzCard key={goal.id} variant="sunken" className="p-3 space-y-2 border-kz-line">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-kz-ink font-mono">{goal.title}</h3>
                      <span className="text-[11px] font-mono text-kz-ink-dim">
                        Fecha objetivo: {goal.deadline}
                      </span>
                    </div>
                    <KzBadge variant="success">
                      {pct}%
                    </KzBadge>
                  </div>

                  <div className="w-full bg-kz-line h-2 rounded-xs overflow-hidden">
                    <div
                      className="bg-kz-success h-full transition-all duration-300 rounded-xs"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-kz-ink-soft">
                    <span>Acumulado: {formatCOP(goal.currentAmount)}</span>
                    <span>Meta: {formatCOP(goal.targetAmount)}</span>
                  </div>
                </KzCard>
              );
            })}
          </div>
        </KzCard>
      </div>
    </div>
  );
};
