import { describe, it, expect, vi, afterEach } from 'vitest';
import { withMinDelay } from './withMinDelay';

describe('withMinDelay', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resuelve con el valor de la fuente sin bajar del tiempo mínimo', async () => {
    vi.useFakeTimers();
    let resolveFast!: (v: string) => void;
    const fast = new Promise<string>((resolve) => {
      resolveFast = resolve;
    });

    const result = withMinDelay(fast, 900);
    resolveFast('ok');
    await vi.advanceTimersByTimeAsync(900);

    await expect(result).resolves.toBe('ok');
  });

  it('no retrasa más del mínimo si la fuente tarda más en resolverse', async () => {
    vi.useFakeTimers();
    let resolveSlow!: (v: number) => void;
    const slow = new Promise<number>((resolve) => {
      resolveSlow = resolve;
    });

    const result = withMinDelay(slow, 100);
    await vi.advanceTimersByTimeAsync(100);
    resolveSlow(42);

    await expect(result).resolves.toBe(42);
  });

  it('propaga el rechazo de la promesa fuente', async () => {
    vi.useFakeTimers();
    let rejectSource!: (err: Error) => void;
    const failing = new Promise<never>((_, reject) => {
      rejectSource = reject;
    });

    const result = withMinDelay(failing, 50);
    await vi.advanceTimersByTimeAsync(50);
    rejectSource(new Error('boom'));

    await expect(result).rejects.toThrow('boom');
  });
});
