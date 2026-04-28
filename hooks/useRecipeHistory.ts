
import { useState, useEffect } from 'react';
import { SavedRecipe } from '../types';

const STORAGE_KEY = 'michelin_chef_history';
const MAX_SAVED = 30;

export const useRecipeHistory = () => {
  const [history, setHistory] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const persist = (recipes: SavedRecipe[]) => {
    setHistory(recipes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    } catch {
      // quota exceeded or unavailable
    }
  };

  const saveRecipe = (recipe: SavedRecipe) => {
    persist([recipe, ...history.filter((r) => r.id !== recipe.id)].slice(0, MAX_SAVED));
  };

  const deleteRecipe = (id: string) => {
    persist(history.filter((r) => r.id !== id));
  };

  const isSaved = (id: string) => history.some((r) => r.id === id);

  return { history, saveRecipe, deleteRecipe, isSaved };
};
