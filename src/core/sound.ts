/**
 * @file src/core/sound.ts
 * @description Motor de síntesis háptica y acústica basado en Web Audio API pura.
 * No requiere archivos MP3 externos. Proporciona micro-sonidos orgánicos y cálidos:
 * - Clic táctil de madera/piedra
 * - Campanita sutil de tarea completada
 * - Acorde cálido armónico al alcanzar el 1% diario
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kz:sound:enabled';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.enabled = saved !== null ? saved === 'true' : true;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(val));
    }
  }

  /**
   * Clic táctil orgánico (madera/pergamino)
   */
  public playTap() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  /**
   * Tono suave de acción/hábito completado
   */
  public playComplete() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    // Dos notas sutiles en intervalo armónico (G5 -> C6)
    [784, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.07, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.25);
    });
  }

  /**
   * Campana ceremonial de logro (+1% diario o hito mayor)
   */
  public playMilestone() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    // Acorde mayor de campana zen (C5, E5, G5, C6)
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.08, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + idx * 0.07 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.85);
    });
  }
}

export const soundEngine = new SoundEngine();

export function useSound() {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => soundEngine.isEnabled());

  useEffect(() => {
    setSoundEnabledState(soundEngine.isEnabled());
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundEngine.isEnabled();
    soundEngine.setEnabled(next);
    setSoundEnabledState(next);
    if (next) {
      soundEngine.playTap();
    }
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playTap: () => soundEngine.playTap(),
    playComplete: () => soundEngine.playComplete(),
    playMilestone: () => soundEngine.playMilestone(),
  };
}
