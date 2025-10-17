// js/app.js (修正 API 呼叫版本)
import { CONFIG } from './config.js';
import { state, saveFilters } from './state.js';
import * as UI from './ui.js';
import { analytics } from './analytics.js';

export { choose, nextCard, openModal, buildPool };

class RecommendationEngine {
    constructor() {
        this.preferences = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.preferences) || "{}");
    }
    learn(restaurant, liked) {
        if (!this.preferences.types) this.preferences.types = {};
        if (!this.preferences.priceRange) this.preferences.priceRange = {};
        const weight = liked ? 1 : -0.5;
        restaurant.types.forEach(type => {
            this.preferences.types[type] = (this.preferences.types[type] || 0) + weight;
        });
        const priceKey = `price_${restaurant.price}`;
        this.preferences.priceRange[priceKey] = (this.preferences.priceRange[priceKey] || 0) + weight;
        localStorage.setItem(CONFIG.STORAGE_KEYS.preferences, JSON.stringify(this.preferences));
    }
    score(restaurant) {
        let score = 0;
        if (this.preferences.types) {
            restaurant.types.forEach(type => {
                score += this.preferences.types[type] || 0;
            });
        }
        if (this.preferences.priceRange) {
            const priceKey = `price_${restaurant.price}`;
            score += this.preferences.priceRange[priceKey] || 0;
        }
        const distanceScore = restaurant.distance ? 1 / (1 + restaurant.distance / 1000) : 0;
        const ratingScore = restaurant.rating || 0;
        score += 0.6 * distanceScore + 0.4 * ratingScore;
        return score;
    }
    sortPool(pool) {
        return pool.slice().sort((a, b) => this.score(b) - this.score(a));
    }
}

const recommender = new RecommendationEngine();

function transformPlaceData(p) {
    const photoRef = p.photos?.[0]?.name || null;
    // ✅ 前端 API Key 用於顯示照片
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
        distance: p.distanceMeters || null, // ✅ 加上距離資訊
        photoUrl,
        opening_hours: {
             open_now: p.regularOpeningHours?.openNow ?? null,
             weekday_text: p.regularOpeningHours?.weekdayDescriptions || null
        },
        website: p.websiteUri || '',
        googleMapsUrl: p.googleMapsUri || '',
    };
}

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('您的瀏覽器不支援定位功能。'));
        }
        navigator.geolocation.getCurrentPosition(
          position => {
            state.userLocation = { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            };
            console.log('[Jiasa] 使用者位置:', state.userLocation);
            resolve(state.userLocation);
          },
          error => {
            console.error('[Jiasa] 定位錯誤:', error);
            if (error.code === error.PERMISSION_DENIED) {
                reject(new Error('您已拒絕提供定位權限。請至瀏覽器設定開啟權限後再重試。'));
            } else {
                reject(new Error('無法取得您的位置。'));
            }
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
    });
}

async function fetchNearbyPlaces(location, radius, category) {
  const { lat, lng } = location;
  // ✅ 修正: 確保使用正確的 API 路徑
  const apiUrl = `/api/search?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}&lang=${state.lang}`;
  
  console.log('[Jiasa] 呼叫 API:', apiUrl);
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Jiasa] API 錯誤:', response.status, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('[Jiasa] API 回應:', data);
    
    return data.places || [];
  } catch (error) {
    console.error('[Jiasa] Fetch 錯誤:', error);
    throw error;
  }
}

async function buildPool() {
  try {
    state.isLoading = true;
    UI.setButtonsLoading(true);
    UI.renderLoading(true);

    if (!state.userLocation) {
        UI.showToast(UI.t('searching'), 'info');
        await getUserLocation();
    }

    console.log('[Jiasa] 開始搜尋餐廳...');
    const placesRaw = await fetchNearbyPlaces(
      state.userLocation, 
      state.filters.distance, 
      state.filters.category
    );
    
    console.log('[Jiasa] 找到餐廳數量:', placesRaw.length);
    
    state.pool = placesRaw.map(transformPlaceData);
    state.pool = recommender.sortPool(state.pool);
    state.index = 0;
    
    analytics.track('filter_apply', 'nearby', { 
      count: state.pool.length, 
      ...state.filters 
    });
    
    UI.renderStack();
    console.log('[Jiasa] 餐廳池已建立:', state.pool.length, '家');
    
  } catch (error) {
    console.error('[Jiasa] buildPool 錯誤:', error);
    UI.renderError(error.message || '搜尋失敗,請稍後再試');
  } finally {
    state.isLoading = false;
    UI.setButtonsLoading(false);
    UI.renderLoading(false);
  }
}

function choose(liked) {
    if (state.index >= state.pool.length) return;
    const current = state.pool[state.index];
    if (current) {
        recommender.learn(current, liked);
        analytics.trackSwipe(current, liked ? 'like' : 'skip');
    }
    nextCard();
}

function nextCard() {
    state.index++;
    UI.renderStack();
}

function openModal() {
    state.staged = {
        preview: { lang: state.lang, theme: state.currentTheme },
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
    
    state.currentTheme = state.staged.preview.theme;
    localStorage.setItem(CONFIG.STORAGE_KEYS.theme, state.currentTheme);
    UI.applyTheme(state.currentTheme);

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

function setupEventHandlers() {
    UI.$('#btnChoose').addEventListener('click', () => choose(true));
    UI.$('#btnSkip').addEventListener('click', () => choose(false));
    UI.$('#navHome').addEventListener('click', () => UI.show('swipe'));
    UI.$('#navFavs').addEventListener('click', UI.openFavModal);
    UI.$('#navHistory').addEventListener('click', UI.openHistModal);
    UI.$('#navSettings').addEventListener('click', openModal);
    UI.$('#navRefresh').addEventListener('click', buildPool);
    UI.$('#btnClose').addEventListener('click', closeModal);
    UI.$('#applySettings').addEventListener('click', applySettings);
    UI.$('#btnClearFilters').addEventListener('click', UI.clearAllFiltersInModal);
    
    // ✅ 關閉 modal 的按鈕
    const favClose = UI.$('#favClose');
    const histClose = UI.$('#histClose');
    if (favClose) favClose.addEventListener('click', UI.closeAllModals);
    if (histClose) histClose.addEventListener('click', UI.closeAllModals);
    
    // ✅ 點擊 overlay 關閉 modal
    UI.$('#overlay').addEventListener('click', closeModal);
    UI.$('#favOverlay').addEventListener('click', UI.closeAllModals);
    UI.$('#histOverlay').addEventListener('click', UI.closeAllModals);

    UI.$("#langSelModal").addEventListener("change", (e) => {
        if (!state.staged) return;
        state.staged.preview.lang = e.target.value;
        state.lang = e.target.value;
        UI.syncUIFromStaged();
    });

    UI.$("#themeSelect").addEventListener("change", (e) => {
        if (!state.staged) return;
        state.staged.preview.theme = e.target.value;
        UI.applyTheme(e.target.value);
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'retryBtn') buildPool();
        if (e.target.id === 'adjustFiltersBtn') openModal();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Jiasa] 應用程式初始化...');
  UI.applyTheme(state.currentTheme);
  UI.renderText();
  setupEventHandlers();

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[Jiasa] Service Worker 註冊成功'))
      .catch(err => console.error('[Jiasa] Service Worker 註冊失敗:', err));
  });
}