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

  /**
   * Generador de Ruido Rosa / Lluvia Zen sutil para trabajo profundo.
   */
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientPlaying: boolean = false;

  public isAmbientActive(): boolean {
    return this.ambientPlaying;
  }

  public startAmbientRain() {
    if (!this.enabled || this.ambientPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Buffer de 3 segundos de ruido rosa looping
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filtro pasa bajos para emular lluvia suave en tejado de madera
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.2);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    this.ambientSource = source;
    this.ambientGain = gain;
    this.ambientPlaying = true;
  }

  public stopAmbientRain() {
    if (!this.ambientPlaying || !this.ambientGain || !this.ambientSource) return;
    const ctx = this.getContext();
    if (ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      const source = this.ambientSource;
      setTimeout(() => {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // ignore
        }
      }, 850);
    } else {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
    }
    this.ambientSource = null;
    this.ambientGain = null;
    this.ambientPlaying = false;
  }

  public toggleAmbientRain(): boolean {
    if (this.ambientPlaying) {
      this.stopAmbientRain();
      return false;
    } else {
      this.startAmbientRain();
      return true;
    }
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
