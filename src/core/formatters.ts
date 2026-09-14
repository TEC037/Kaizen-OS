/**
 * @file src/core/formatters.ts
 * @description Utilidades de formateo numérico y de moneda para Kaizen OS.
 * Adaptado y homologado al formato del Peso Colombiano (COP):
 * - Separador de miles: punto (.) -> ej: $ 1.250.000
 * - Cero decimales (estándar bancario y transaccional en Colombia)
 * - Soporte para código de moneda explícito ($ 1.250.000 COP)
 * - Función de migración automática de magnitudes históricas en USD hacia COP
 */

export interface FormatCOPOptions {
  /** Añade sufijo " COP" al final del monto (ej: "$ 50.000 COP") */
  showCode?: boolean;
  /** Prefijo de moneda, por defecto "$ " */
  prefix?: string;
  /** Si debe mostrar centavos (en COP es prácticamente desuso, false por defecto) */
  showDecimals?: boolean;
}

/**
 * Formatea un número al estándar colombiano (COP).
 * Ejemplo: 1500000 -> "$ 1.500.000"
 */
export function formatCOP(amount: number, options: FormatCOPOptions = {}): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$ 0';
  }

  const { showCode = false, prefix = '$ ', showDecimals = false } = options;

  const formattedNumber = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(Math.round(amount));

  return `${prefix}${formattedNumber}${showCode ? ' COP' : ''}`;
}

/**
 * Convierte valores legados en escala USD (< 20.000) a magnitudes realistas en COP.
 * Tasa base de referencia: 1 USD ≈ 4.000 COP.
 */
export function migrateToCOP(amount: number): number {
  if (amount > 0 && amount < 20000) {
    return Math.round(amount * 4000);
  }
  return amount;
}
