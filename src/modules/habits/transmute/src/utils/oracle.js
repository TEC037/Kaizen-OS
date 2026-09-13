import { haptics } from './haptics';

/**
 * El Oráculo - Motor de Precognición y Recordatorios Alquímicos
 * SIN CAPACITOR (modo local / web): usa la Notification API de la web.
 */
const getNotify = () => (typeof Notification !== 'undefined' ? Notification : null);

const showNotification = (title, body) => {
  try {
    const Notify = getNotify();
    if (Notify && Notify.permission === 'granted') {
      new Notify(title, { body });
    }
  } catch (e) { }
};

export const oracle = {
  async requestPermissions() {
    try {
      const Notify = getNotify();
      if (!Notify) return false;
      if (Notify.permission === 'granted') return true;
      if (Notify.permission === 'denied') return false;
      const result = await Notify.requestPermission();
      return result === 'granted';
    } catch (e) {
      return false;
    }
  },

  async scheduleHabitReminders(habits) {
    const today = new Date().toDateString();
    const pendingHabits = habits.filter(h => !h.completedDays || !h.completedDays[today]);

    if (pendingHabits.length === 0) return;

    const baseHours = [10, 14, 17, 20, 22];
    pendingHabits.forEach((habit, index) => {
      if (index >= baseHours.length) return;
      let targetHour = baseHours[index];
      const pushDate = new Date();
      pushDate.setHours(targetHour, 0, 0, 0);

      if (pushDate.getTime() > Date.now()) {
        const delay = pushDate.getTime() - Date.now();
        setTimeout(() => {
          showNotification('El Oráculo', `La inercia consume tu Athanor. Es hora de cargar el rayo para: ${habit.name}. Frena la decadencia.`);
        }, delay);
        haptics.notificationSuccess();
      }
    });

    const finalDate = new Date();
    finalDate.setHours(23, 0, 0, 0);
    if (finalDate.getTime() > Date.now() && pendingHabits.length > 0) {
      const delay = finalDate.getTime() - Date.now();
      setTimeout(() => {
        showNotification('El Cónclave de las Sombras', `El sol ha caído y ${pendingHabits.length} transmutaciones siguen inconclusas. ¿Dormirás en el plomo o forjarás el oro?`);
      }, delay);
    }
  },

  async scheduleCustom(title, body, date, id = Math.floor(Math.random() * 10000)) {
    try {
      const delay = Math.max(0, date.getTime() - Date.now());
      setTimeout(() => {
        showNotification('El Oráculo', `${title}: ${body}`);
      }, delay);
      return true;
    } catch (e) {
      return false;
    }
  },

  async cancelAll() {
    return;
  }
};