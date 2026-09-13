const DEFAULT_LOCALE = 'es-ES';

// Meses abreviados en español, fijos para que la salida no dependa del ICU del navegador.
const MONTH_ABBR = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea un número con separador de miles en 'es-ES' (punto) de forma
 * determinista (sin depender del ICU del navegador). P.ej. 1324 -> '1.324'.
 */
export function formatNumber(value: number, decimals: number = 0): string {
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart ? `${grouped},${decPart}` : grouped;
}

/** Volumen en kg con separador de miles, p.ej. "12.450". */
export function formatVolumeKg(volumeKg: number): string {
  return formatNumber(Math.round(volumeKg));
}

/**
 * Formatea una fecha ISO 'YYYY-MM-DD' a 'DD MMM YYYY' (es-ES), p.ej. '2026-09-02' -> '02 sep 2026'.
 * Devuelve el texto original si no es una fecha ISO válida.
 */
export function formatIsoDate(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return dateStr;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return dateStr;
  const mm = `${day}`.padStart(2, '0');
  return `${mm} ${MONTH_ABBR[month]} ${year}`;
}

/**
 * Hora 'HH:MM' local. Acepta un Date o un epoch en ms; sin argumento usa la hora actual.
 */
export function formatClock(dateOrEpoch: number | Date = new Date()): string {
  const date = dateOrEpoch instanceof Date ? dateOrEpoch : new Date(dateOrEpoch);
  return date.toLocaleTimeString(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Fecha LOCAL como 'YYYY-MM-DD'. A diferencia de `new Date().toISOString().split('T')[0]`,
 * no usa UTC: evita el sesgo de ±1 día en sesiones cerca de medianoche local.
 */
export function getLocalDateStamp(dateOrEpoch: number | Date = new Date()): string {
  const date = dateOrEpoch instanceof Date ? dateOrEpoch : new Date(dateOrEpoch);
  const yy = `${date.getFullYear()}`;
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
