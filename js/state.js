// js/state.js - 完整版
import { CONFIG } from './config.js';

// 從 localStorage 載入已儲存的篩選條件
const savedFilters = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.filters) || '{}');

// 主要應用程式狀態
export const state = {
  // 語言設定
  lang: localStorage.getItem(CONFIG.STORAGE_KEYS.lang) || "zh",
  
  // 主題設定
  currentTheme: localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'classic',
  
  // 篩選條件（合併預設值和已儲存的值）
  filters: {
    ...CONFIG.DEFAULT_FILTERS,
    ...savedFilters,
  },
  
  // 餐廳池和索引
  pool: [],                    // 所有餐廳的陣列
  index: 0,                    // 當前顯示的卡片索引
  current: null,               // 當前選中的餐廳（用於結果頁面）
  
  // 收藏和歷史
  favs: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.favs) || "[]"),
  history: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.hist) || "[]"),
  
  // 撤銷功能
  undoStack: [],              // 儲存上一個滑過的卡片，用於撤銷
  
  // 網路狀態
  isOnline: navigator.onLine,  // 是否在線上
  
  // Modal 暫存狀態
  staged: null,                // 在 Modal 中暫存的設定（套用前）
  
  // 載入狀態
  isLoading: false,            // 是否正在載入資料
  
  // 使用者位置
  userLocation: null,          // { lat, lng } 或 null
  
  // Onboarding 狀態
  hasSeenOnboarding: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.onboarding) || "false"),
};

// 儲存篩選條件到 localStorage
export function saveFilters() {
  const filtersToSave = {
    distance: state.filters.distance,
    category: state.filters.category,
  };
  localStorage.setItem(CONFIG.STORAGE_KEYS.filters, JSON.stringify(filtersToSave));
}

// 儲存收藏清單到 localStorage
export function saveFavs() {
  localStorage.setItem(CONFIG.STORAGE_KEYS.favs, JSON.stringify(state.favs));
}

// 儲存歷史紀錄到 localStorage
export function saveHistory() {
  localStorage.setItem(CONFIG.STORAGE_KEYS.hist, JSON.stringify(state.history));
}

// 儲存 Onboarding 狀態到 localStorage
export function saveOnboarding() {
  localStorage.setItem(CONFIG.STORAGE_KEYS.onboarding, JSON.stringify(state.hasSeenOnboarding));
}

// 重置所有篩選條件為預設值
export function resetFilters() {
  state.filters = { ...CONFIG.DEFAULT_FILTERS };
  saveFilters();
}

// 清空收藏清單
export function clearFavs() {
  state.favs = [];
  saveFavs();
}

// 清空歷史紀錄
export function clearHistory() {
  state.history = [];
  saveHistory();
}

// 切換語言
export function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem(CONFIG.STORAGE_KEYS.lang, lang);
}

// 切換主題
export function setTheme(theme) {
  state.currentTheme = theme;
  localStorage.setItem(CONFIG.STORAGE_KEYS.theme, theme);
}
