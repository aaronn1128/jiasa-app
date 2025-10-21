// js/app.js (完整版 - 修正餐廳錯位)
import { CONFIG } from './config.js';
import { state, saveFilters, saveHistory, saveFavs } from './state.js';
import * as UI from './ui.js';
import { analytics } from './analytics.js';

export { choose, nextCard, openModal, buildPool, undoSwipe, addFav };

// ==================== 推薦引擎 ====================
class RecommendationEngine {
  constructor() {
    this.preferences = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.preferences) || "{}");
  }
  
  learn(restaurant, liked) {
    if (!this.preferences.types) this.preferences.types = {};
    const weight = liked ? 1 : -0.5;
    restaurant.types.forEach(type => {
      this.preferences.types[type] = (this.preferences.types[type] || 0) + weight;
    });
    localStorage.setItem(CONFIG.STORAGE_KEYS.preferences, JSON.stringify(this.preferences));
  }
  
  score(restaurant) {
    let score = 0;
    if (this.preferences.types) {
      restaurant.types.forEach(type => {
        score += this.preferences.types[type] || 0;
      });
    }
    return score;
  }
  
  sortPool(pool) {
    return pool.slice().sort((a, b) => this.score(b) - this.score(a));
  }
}

const recommender = new RecommendationEngine();

// ==================== 資料轉換 ====================
function transformPlaceData(p) {
  const photoRef = p.photos?.[0]?.name || null;
  const photoUrl = photoRef 
    ? `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=400&key=AIzaSyDex4jcGsgso6jHfCdKD3pcD3PnU4cKjCY` 
    : null;
  
  return {
    id: p.id,
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    rating: p.rating || 0,
    price: p.priceLevel || null,
    types: p.types || [],
    location: p.location || null,
    distanceMeters: p.distanceMeters || null,
    photoUrl,
    opening_hours: {
      open_now: p.regularOpeningHours?.openNow ?? null,
      weekday_text: p.regularOpeningHours?.weekdayDescriptions || null
    },
    website: p.websiteUri || '',
    googleMapsUrl: p.googleMapsUri || '',
    isSponsored: false
  };
}

// ==================== 定位功能 ====================
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('您的瀏覽器不支持定位功能。'));
    }
    
    navigator.geolocation.getCurrentPosition(
      position => {
        state.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        resolve(state.userLocation);
      },
      error => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error('您已拒絕提供定位權限。請至瀏覽器設定開啟權限後再重試。'));
        } else {
          reject(new Error('無法取得您的位置,請檢查網路連線或稍後再試。'));
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

// ==================== API 請求 ====================
async function fetchNearbyPlaces(location, radius, category) {
  const { lat, lng } = location;
  const apiUrl = `/api/search?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}&lang=${state.lang}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    console.error('API Response Error:', await response.text());
    throw new Error(`API 請求失敗: ${response.status}`);
  }
  
  const data = await response.json();
  return data.places || [];
}

// ==================== 建立餐廳池 ====================
async function buildPool() {
  try {
    state.isLoading = true;
    UI.setButtonsLoading(true);
    UI.renderLoading(true);

    if (!state.userLocation) {
      UI.showToast(UI.t('searching'), 'info');
      await getUserLocation();
    }

    const placesRaw = await fetchNearbyPlaces(
      state.userLocation, 
      state.filters.distance, 
      state.filters.category
    );
    
    state.pool = placesRaw.map(transformPlaceData);
    state.pool = recommender.sortPool(state.pool);
    state.index = 0;
    state.undoStack = [];
    
    analytics.track('filter_apply', 'nearby', { 
      count: state.pool.length, 
      ...state.filters 
    });
    
  } catch (error) {
    console.error("Build Pool Error:", error);
    UI.renderError(error.message || '搜尋失敗,請稍後再試');
  } finally {
    state.isLoading = false;
    UI.setButtonsLoading(false);
    UI.renderStack();
  }
}

// ==================== 卡片選擇邏輯 ====================
function choose(liked, restaurantFromSwipe = null) {
  if (state.index >= state.pool.length) return;
  
  // 確保取得正確的當前餐廳
  const current = restaurantFromSwipe || state.pool[state.index];
  if (!current) {
    console.error('[App] No restaurant at current index:', state.index);
    return;
  }
  
  console.log('[App] Choose called - liked:', liked, 'restaurant:', current.name, 'id:', current.id);
  
  // 儲存到撤銷槽
  if (!state.undoStack) state.undoStack = [];
  state.undoStack.push(current);
  
  // 學習偏好
  recommender.learn(current, liked);
  
  // 加入歷史記錄
  state.history.unshift({ id: current.id, ts: Date.now() });
  if (state.history.length > 50) state.history.pop();
  saveHistory();

  // 追蹤分析
  analytics.trackSwipe(current, liked ? 'like' : 'skip');
  
  if (liked) {
    // 喜歡：顯示詳情頁,不推進索引
    state.current = current;
    console.log('[App] Setting state.current to:', state.current.name);
    UI.renderResult(current);
  } else {
    // 跳過：立即推進到下一張
    nextCard();
  }
}

function nextCard() {
  state.index++;
  UI.renderStack();
}

// ==================== 撤銷功能 ====================
function undoSwipe() {
  if (!state.undoStack || state.undoStack.length === 0) return;

  // 從堆疊中彈出剛剛滑過的卡片
  state.undoStack.pop();
  
  // 索引倒退
  state.index--;
  
  // 重新渲染卡片
  UI.renderStack();
  analytics.track('swipe_undo', 'undo');
}

// ==================== 收藏功能 ====================
function addFav(r) {
  if (!state.favs.includes(r.id)) {
    state.favs.unshift(r.id);
    saveFavs();
    analytics.track('fav_add', r.id);
    UI.showToast(UI.t('favoriteAdded'), 'success');
  }
}

// ==================== 設定 Modal ====================
function openModal() {
  state.staged = {
    preview: { 
      lang: state.lang, 
      theme: state.currentTheme 
    },
    filters: {
      distance: state.filters.distance,
      category: state.filters.category,
    },
  };
  UI.showModal(true);
  UI.syncUIFromStaged();
}

async function applySettings() {
  if (!state.staged) return;
  
  // 套用主題
  state.currentTheme = state.staged.preview.theme;
  localStorage.setItem(CONFIG.STORAGE_KEYS.theme, state.currentTheme);
  UI.applyTheme(state.currentTheme);

  // 套用篩選條件
  state.filters.distance = state.staged.filters.distance;
  state.filters.category = state.staged.filters.category;
  saveFilters();
  
  UI.showModal(false);
  await buildPool();
  state.staged = null;
}

function closeModal() {
  UI.showModal(false);
  state.staged = null;
}

// ==================== 事件處理器 ====================
function setupEventHandlers() {
  // 全局滑卡處理函數
  window.handleCardSwipe = (liked, restaurant) => {
    console.log('[App] handleCardSwipe called - liked:', liked, 'restaurant:', restaurant?.name);
    choose(liked, restaurant);
  };
  
  // 卡片滑動事件（保留作為備用）
  document.addEventListener('cardSwiped', (e) => {
    choose(e.detail.liked);
  });
  
  // 主要按鈕事件
  UI.$('#btnUndo').addEventListener('click', undoSwipe);
  UI.$('#btnChoose').addEventListener('click', () => choose(true));
  UI.$('#btnSkip').addEventListener('click', () => choose(false));
  
  // 導航事件
  UI.$('#navHome').addEventListener('click', () => {
    UI.closeAllModals();
    UI.show('swipe');
  });
  UI.$('#navFavs').addEventListener('click', UI.openFavModal);
  UI.$('#navHistory').addEventListener('click', UI.openHistModal);
  UI.$('#navSettings').addEventListener('click', openModal);
  UI.$('#navRefresh').addEventListener('click', buildPool);
  
  // Modal 事件
  UI.$('#btnClose').addEventListener('click', closeModal);
  UI.$('#applySettings').addEventListener('click', applySettings);
  UI.$('#btnClearFilters').addEventListener('click', UI.clearAllFiltersInModal);
  
  // 收藏和歷史 Modal 關閉
  UI.$('#favClose').addEventListener('click', UI.closeAllModals);
  UI.$('#histClose').addEventListener('click', UI.closeAllModals);
  
  // Overlay 點擊關閉
  UI.$('#overlay').addEventListener('click', (e) => {
    if (e.target === UI.$('#overlay')) UI.closeAllModals();
  });
  UI.$('#favOverlay').addEventListener('click', (e) => {
    if (e.target === UI.$('#favOverlay')) UI.closeAllModals();
  });
  UI.$('#histOverlay').addEventListener('click', (e) => {
    if (e.target === UI.$('#histOverlay')) UI.closeAllModals();
  });

  // 語言和主題切換
  UI.$("#langSelModal").addEventListener("change", (e) => {
    if (!state.staged) return;
    state.staged.preview.lang = e.target.value;
    state.lang = e.target.value;
    UI.renderText();
    UI.syncUIFromStaged();
  });

  UI.$("#themeSelect").addEventListener("change", (e) => {
    if (!state.staged) return;
    state.staged.preview.theme = e.target.value;
    UI.applyTheme(e.target.value);
  });

  // 結果頁面按鈕
  UI.$('#btnBack').addEventListener('click', () => {
    nextCard();  // 在返回時推進到下一張卡片
    UI.show('swipe');
  });
  
  UI.$('#btnFav').addEventListener('click', () => {
    if (state.current) {
      console.log('[App] Adding favorite:', state.current.name);
      addFav(state.current);
    } else {
      console.error('[App] No current restaurant to favorite');
    }
    nextCard();  // 在返回時推進到下一張卡片
    UI.show('swipe');
  });
  
  // 錯誤頁面的按鈕
  document.body.addEventListener('click', (e) => {
    if (e.target.id === 'retryBtn') buildPool();
    if (e.target.id === 'adjustFiltersBtn') openModal();
  });
}

// ==================== 應用初始化 ====================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Jiasa] Initializing...');
  
  UI.applyTheme(state.currentTheme);
  UI.renderText();
  setupEventHandlers();

  // 啟動畫面處理
  const splashScreen = document.getElementById('splashScreen');
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        if (splashScreen.parentNode) {
          splashScreen.parentNode.removeChild(splashScreen);
        }
      }, 500);
    }, 800);
  }

  analytics.track('app_open', navigator.userAgent);
  await buildPool();
});

// ==================== Service Worker ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
