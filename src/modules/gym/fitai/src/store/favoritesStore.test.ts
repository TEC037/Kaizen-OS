import { describe, it, expect, beforeEach } from 'vitest';
import {
  isFavorite,
  toggleFavorite,
  resetFavorites,
  getFavoriteIds,
  subscribeFavorites,
} from './favoritesStore';

describe('favoritesStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFavorites();
  });

  it('alterna y persiste ids de favoritos', () => {
    expect(isFavorite('0001')).toBe(false);

    toggleFavorite('0001');
    expect(isFavorite('0001')).toBe(true);
    expect(getFavoriteIds()).toEqual(new Set(['0001']));
    expect(window.localStorage.getItem('fitai.favoriteExercises')).toBe('["0001"]');

    toggleFavorite('0001');
    expect(isFavorite('0001')).toBe(false);
    expect(window.localStorage.getItem('fitai.favoriteExercises')).toBe('[]');
  });

  it('mantiene varios favoritos a la vez y los limpia con reset', () => {
    toggleFavorite('0001');
    toggleFavorite('0002');
    expect(getFavoriteIds()).toEqual(new Set(['0001', '0002']));

    resetFavorites();
    expect(isFavorite('0001')).toBe(false);
    expect(isFavorite('0002')).toBe(false);
    expect(window.localStorage.getItem('fitai.favoriteExercises')).toBe('[]');
  });

  it('notifica a los suscriptores al cambiar', () => {
    const listener = (): void => {};
    const spy = {
      original: listener,
      calls: 0,
    };
    const wrapped = () => {
      spy.calls += 1;
    };
    const unsubscribe = subscribeFavorites(wrapped);

    toggleFavorite('0001');
    expect(spy.calls).toBe(1);

    unsubscribe();
    toggleFavorite('0001');
    expect(spy.calls).toBe(1);
  });
});