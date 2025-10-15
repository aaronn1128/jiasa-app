// js/state.js
// 職責：集中管理 App 的所有「記憶」（會變動的資料）。

import { CONFIG } from './config.js';

const savedFilters = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.filters) || '{}');

export const state = {
  lang: localStorage.getItem(CONFIG.STORAGE_KEYS.lang) || "zh",
  currentTheme: localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'classic',
  filters: {
    ...CONFIG.DEFAULT_FILTERS,
    ...savedFilters,
    types: new Set(savedFilters.types || []),
    cuisines: new Set(savedFilters.cuisines || []),
    priceLevel: new Set(savedFilters.priceLevel || []),
  },
  
  pool: [],
  index: 0,
  current: null,
  favs: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.favs) || "[]"),
  history: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.hist) || "[]"),
  hasConfigured: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.configured) || "false"),
  hasSeenOnboarding: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.onboarding) || "false"),
  
  undoSlot: null,
  isOnline: navigator.onLine,
  staged: null,
  isLoading: false,

  userLocation: null,
  allDemoData: [] 
};

export function saveFilters() {
  const filtersToSave = {
    minRating: state.filters.minRating,
    priceLevel: [...state.filters.priceLevel],
    distance: state.filters.distance,
    types: [...state.filters.types],
    cuisines: [...state.filters.cuisines],
  };
  localStorage.setItem(CONFIG.STORAGE_KEYS.filters, JSON.stringify(filtersToSave));
}

export function saveFavs() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.favs, JSON.stringify(state.favs));
}

export function saveHistory() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.hist, JSON.stringify(state.history));
}