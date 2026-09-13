import { useSyncExternalStore } from 'react';
import {
  subscribeFavorites,
  getFavoriteIds,
  isFavorite,
  toggleFavorite,
} from '../store/favoritesStore';

export function useFavorites() {
  const favoriteIds = useSyncExternalStore(subscribeFavorites, getFavoriteIds);
  return { favoriteIds, isFavorite, toggleFavorite };
}