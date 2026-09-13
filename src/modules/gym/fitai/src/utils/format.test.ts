import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatNumber,
  formatVolumeKg,
  formatIsoDate,
  formatClock,
  getLocalDateStamp,
} from './format';

describe('formatTime', () => {
  it('formatea segundos como MM:SS', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(597)).toBe('09:57');
  });
});

describe('formatNumber', () => {
  it('usa separador de miles con locale estable es-ES', () => {
    expect(formatNumber(1324)).toBe('1.324');
    expect(formatNumber(12450)).toBe('12.450');
    expect(formatNumber(1000000)).toBe('1.000.000');
    expect(formatNumber(42)).toBe('42');
  });
});

describe('formatVolumeKg', () => {
  it('redondea y formatea volúmenes en kg', () => {
    expect(formatVolumeKg(12450)).toBe('12.450');
    expect(formatVolumeKg(12450.6)).toBe('12.451');
    expect(formatVolumeKg(0)).toBe('0');
  });
});

describe('formatIsoDate', () => {
  it('convierte ISO YYYY-MM-DD a DD MMM YYYY en es-ES', () => {
    expect(formatIsoDate('2026-09-02')).toBe('02 sep 2026');
    expect(formatIsoDate('2026-08-15')).toBe('15 ago 2026');
  });

  it('devuelve el input intacto ante formatos no ISO', () => {
    expect(formatIsoDate('15 Ago 2026')).toBe('15 Ago 2026');
    expect(formatIsoDate('Hoy')).toBe('Hoy');
    expect(formatIsoDate('not-a-date')).toBe('not-a-date');
    expect(formatIsoDate('2026-13-40')).toBe('2026-13-40');
  });
});

describe('formatClock', () => {
  it('formatea un epoch a HH:MM local', () => {
    expect(formatClock(new Date(2026, 8, 6, 18, 15).getTime())).toBe('18:15');
  });

  it('acepta un Date y usa la hora actual sin argumento', () => {
    expect(formatClock(new Date(2026, 8, 6, 9, 5))).toBe('09:05');
    const now = formatClock();
    expect(now).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('getLocalDateStamp', () => {
  it('devuelve la fecha local en YYYY-MM-DD sin el sesgo UTC de toISOString', () => {
    expect(getLocalDateStamp(new Date(2026, 8, 6, 23, 30))).toBe('2026-09-06');
    expect(getLocalDateStamp(new Date(2026, 0, 3, 0, 5))).toBe('2026-01-03');
  });

  it('usa la fecha de hoy sin argumento', () => {
    expect(getLocalDateStamp()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
