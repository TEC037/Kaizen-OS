/**
 * haptics.js — SIN CAPACITOR (modo local / web)
 * Usa navigator.vibrate cuando está disponible.
 */

const tryVibrate = (pattern) => {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) { }
};

const impactLight = async () => { tryVibrate(10); };
const impactMedium = async () => { tryVibrate([10, 30, 10]); };
const impactHeavy = async () => { tryVibrate([20, 50, 20]); };
const notificationSuccess = async () => { tryVibrate([15, 40, 15]); };
const notificationError = async () => { tryVibrate([30, 60, 30, 60, 30]); };
const vibrate = async () => { tryVibrate(30); };

export const haptics = {
  impactLight,
  impactMedium,
  impactHeavy,
  notificationSuccess,
  notificationError,
  vibrate,
};