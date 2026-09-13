/**
 * themeRoot.js — Gestión del atributo data-theme en el root del módulo.
 * En el modo embebible el atributo se aplica al contenedor .transmute-app
 * (no a document.documentElement) para no contaminar el shell de Kaizen OS.
 */

export const APP_ROOT_SELECTOR = '.transmute-app';

export const getAppRoot = () => {
  if (typeof document === 'undefined') return null;
  return document.querySelector(APP_ROOT_SELECTOR) || document.documentElement;
};

export const setThemeOnRoot = (theme) => {
  const el = getAppRoot();
  if (el) el.setAttribute('data-theme', theme);
};

export const getThemeFromRoot = () => {
  const el = getAppRoot();
  if (!el) return 'citrinitas';
  return el.getAttribute('data-theme') || 'citrinitas';
};