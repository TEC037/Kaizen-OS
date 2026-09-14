/**
 * @file src/modules/finance/manifest.ts
 * @description Manifiesto declarativo del módulo de Finanzas Personales para Kaizen OS.
 * Se incorpora dinámicamente mediante el registro de módulos.
 */

import { ModuleManifest } from '../../core/types';
import { FinancePage } from './FinancePage';
import { FinanceWidget } from './FinanceWidget';

export const financeManifest: ModuleManifest = {
  id: 'finance',
  name: 'Finanzas personales',
  description: 'Control de presupuesto por categorías, metas de ahorro y disciplina financiera Kaizen.',
  category: 'Finanzas',
  iconName: 'Wallet',
  defaultStatus: 'available', // Inicialmente disponible
  routes: [
    {
      path: '/finance',
      label: 'Finanzas',
      iconName: 'Wallet',
      component: FinancePage,
    },
  ],
  widgets: [
    {
      id: 'finance-budget-overview',
      title: 'Resumen Financiero',
      gridSpan: 'half',
      component: FinanceWidget,
    },
  ],
  permissions: ['storage:local'],
  optionalDependencies: [],
  version: '1.0.0',
  spec: {
    theme: {
      accent: '#166534', // Verde esmeralda financiero
      bg: '#f4f2ec',
    },
    storage: {
      scope: 'finance',
      version: 1,
      defaults: {},
    },
    events: {
      emits: [
        {
          name: 'finance:expense-logged',
          description: 'Registro de gasto presupuestario o aporte a meta de ahorro',
          points: 10,
          reason: 'Control presupuestario registrado',
        },
      ],
      listens: [],
    },
    settings: [
      {
        id: 'limiteGastoMensual',
        label: 'Límite de presupuesto mensual proyectado ($ COP)',
        type: 'number',
        default: 4500000,
        help: 'Tope máximo mensual asignado para control de gastos en pesos colombianos (COP)',
      },
    ],
  },
};
