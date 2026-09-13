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
import { Wallet, Plus, Target, DollarSign, AlertCircle } from 'lucide-react';

export const FinancePage: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(() =>
    loadCustomData<ExpenseCategoryItem[]>('finance_cats', INITIAL_EXPENSE_CATEGORIES)
  );
  const [goals, setGoals] = useState<FinancialGoalItem[]>(() =>
    loadCustomData<FinancialGoalItem[]>('finance_goals', INITIAL_FINANCIAL_GOALS)
  );
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || '');
  const [expenseAmount, setExpenseAmount] = useState(25);

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
    awardKaizenPoints(10, 'finance', `Control presupuestario: $${expenseAmount} registrado en ${targetCat?.category || 'gastos'}`);
    kaizenBus.emit(KaizenContracts.FinanceExpenseLogged, {
      category: targetCat?.category || 'General',
      amount: expenseAmount,
      description: `Registro presupuestario en ${targetCat?.category || 'gastos'}`,
    });
    setShowExpenseModal(false);
  };

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0);
  const totalAllocated = categories.reduce((acc, c) => acc + c.allocated, 0);
  const totalSavingsTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSavedCurrent = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado del Módulo */}
      <div className="border border-zinc-300 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 border border-zinc-400 bg-zinc-100 text-zinc-800">
              MÓDULO: /finance
            </span>
            <span className="font-mono text-xs text-zinc-500">v1.0.0</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mt-1 tracking-tight flex items-center gap-2">
            <Wallet size={20} />
            <span>Finanzas Personales y Metas de Ahorro</span>
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Presupuesto consciente y acumulación gradual de reservas. (Datos simulados, sin conexión bancaria).
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              setShowExpenseModal(!showExpenseModal);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Registrar gasto rápido</span>
          </button>
        </div>
      </div>

      {/* Modal simulado de gasto rápido */}
      {showExpenseModal && (
        <form
          onSubmit={handleAddExpense}
          className="border border-zinc-400 bg-zinc-50 p-4 space-y-3"
        >
          <div className="font-mono text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Simulación de registro de gasto
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Categoría destino
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-800"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Monto ($ USD simulados)
              </label>
              <input
                type="number"
                min={1}
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-900"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                soundEngine.playTap();
                setShowExpenseModal(false);
              }}
              className="px-3 py-1.5 text-xs border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
            >
              Confirmar gasto
            </button>
          </div>
        </form>
      )}

      {/* Métricas de nivel superior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-zinc-300 bg-white p-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Total Gastado / Mes
          </span>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">
            ${totalSpent.toLocaleString()} / ${totalAllocated.toLocaleString()}
          </p>
        </div>
        <div className="border border-zinc-300 bg-white p-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Margen Presupuestario
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-0.5">
            +${(totalAllocated - totalSpent).toLocaleString()}
          </p>
        </div>
        <div className="border border-zinc-300 bg-white p-3">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
            Ahorro Acumulado en Metas
          </span>
          <p className="text-xl font-bold text-zinc-900 mt-0.5">
            ${totalSavedCurrent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Grid: Categorías de Gasto y Objetivos Financieros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorías */}
        <div className="border border-zinc-300 bg-white p-4 space-y-3">
          <div className="border-b border-zinc-200 pb-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight font-mono">
              Presupuesto por Categorías
            </h2>
            <p className="text-xs text-zinc-500">Consumo mensual frente al límite asignado</p>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const pct = Math.round((cat.spent / cat.allocated) * 100);
              const isOver = pct > 100;
              return (
                <div key={cat.id} className="p-3 border border-zinc-200 bg-zinc-50/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-900">{cat.category}</span>
                    <span className="font-mono text-zinc-700">
                      ${cat.spent} / ${cat.allocated} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-200 h-2 border border-zinc-300">
                    <div
                      className={`h-full ${isOver ? 'bg-red-700' : pct > 85 ? 'bg-amber-600' : 'bg-zinc-800'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metas de ahorro */}
        <div className="border border-zinc-300 bg-white p-4 space-y-3">
          <div className="border-b border-zinc-200 pb-2">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight font-mono">
              Objetivos Financieros
            </h2>
            <p className="text-xs text-zinc-500">Metas Kaizen de acumulación a mediano plazo</p>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
              return (
                <div key={goal.id} className="p-3 border border-zinc-200 bg-zinc-50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-900">{goal.title}</h3>
                      <span className="text-[11px] font-mono text-zinc-500">
                        Fecha objetivo: {goal.deadline}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.2">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full bg-zinc-200 h-2 border border-zinc-300">
                    <div
                      className="bg-emerald-700 h-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600">
                    <span>Acumulado: ${goal.currentAmount.toLocaleString()}</span>
                    <span>Meta: ${goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
