/**
 * analytics.js — DESACTIVADO (sin PostHog en modo local)
 * API neutra conservada para no tocar los puntos de llamada.
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';

export const initAnalytics = () => {
  if (POSTHOG_KEY) {
    console.warn("PostHog configurado pero desactivado en modo local.");
  }
};

export const trackEvent = () => {};

export const identifyUser = () => {};

export const resetAnalytics = () => {};