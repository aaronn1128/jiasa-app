// js/state.js
import { CONFIG } from './config.js';

const savedFilters = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.filters) || '{}');

export const state = {
  lang: localStorage.getItem(CONFIG.STORAGE_KEYS.lang) || "zh",
  currentTheme: localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'classic',
  filters: {
    ...CONFIG.DEFAULT_FILTERS,
    ...savedFilters,
  },
  
  pool: [],
  index: 0,
  favs: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.favs) || "[]"),
  history: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.hist) || "[]"),
  
  undoSlot: null,
  isOnline: navigator.onLine,
  staged: null,
  isLoading: false,
  userLocation: null,
};

export function saveFilters() {
  const filtersToSave = {
    distance: state.filters.distance,
    category: state.filters.category,
  };
  localStorage.setItem(CONFIG.STORAGE_KEYS.filters, JSON.stringify(filtersToSave));
}

export function saveFavs() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.favs, JSON.stringify(state.favs));
}

export function saveHistory() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.hist, JSON.stringify(state.history));
}

