export function withMinDelay<T>(promise: Promise<T>, minMs: number): Promise<T> {
  const minDelay = new Promise<void>((resolve) => setTimeout(resolve, minMs));
  return Promise.all([promise, minDelay]).then(([value]) => value);
}
