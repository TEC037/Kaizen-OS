const STORAGE_KEY = 'fitai.favoriteExercises';

let favoriteIds: Set<string> = new Set(readFromStorage());
const listeners = new Set<() => void>();

function readFromStorage(): string[] {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function persist(): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favoriteIds]));
  } catch {
    // Almacenamiento no disponible: se conserva el estado en memoria.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function isFavorite(id: string): boolean {
  return favoriteIds.has(id);
}

export function toggleFavorite(id: string): void {
  favoriteIds = new Set(favoriteIds);
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
  } else {
    favoriteIds.add(id);
  }
  persist();
  emit();
}

export function resetFavorites(): void {
  favoriteIds = new Set();
  persist();
  emit();
}

export function getFavoriteIds(): Set<string> {
  return favoriteIds;
}

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}