// js/app.js (安全版本 - 已移除 API Key)
import { CONFIG } from './config.js';
import { state, saveFilters, saveHistory } from './state.js';
import * as UI from './ui.js';
import { analytics } from './analytics.js';

export { choose, nextCard, openModal, buildPool, undoSwipe };

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

function transformPlaceData(p) {
    const photoRef = p.photos?.[0]?.name || null;
    // ✅ 修正: 使用後端代理 API
    const photoUrl = photoRef ? `/api/photo?photoName=${encodeURIComponent(photoRef)}` : null;
    
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
    };
}

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('您的瀏覽器不支援定位功能。'));
        }
        
        const timeoutId = setTimeout(() => {
            reject(new Error('定位請求超時，請檢查網路連線。'));
        }, CONFIG.API_TIMEOUT);

        navigator.geolocation.getCurrentPosition(
          position => {
            clearTimeout(timeoutId);
            state.userLocation = {
               lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            resolve(state.userLocation);
          },
          error => {
            clearTimeout(timeoutId);
            let errorMessage = '無法取得您的位置。';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '您已拒絕提供定位權限。請至瀏覽器設定開啟權限後再重試。';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '無法取得位置資訊，請確認 GPS 已開啟。';
                    break;
                case error.TIMEOUT:
                    errorMessage = '定位請求超時，請檢查網路連線後再試。';
                    break;
            }
            
            analytics.track('error', 'geolocation', { code: error.code, message: error.message });
            reject(new Error(errorMessage));
          },
          { 
            enableHighAccuracy: true, 
            timeout: 8000,
            maximumAge: 30000 // 允許使用 30 秒內的快取位置
          }
        );
    });
}

async function fetchNearbyPlaces(location, radius, category) {
  const { lat, lng } = location;
  const apiUrl = `/api/search?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}&lang=${state.lang}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
  
  try {
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', errorText);
      throw new Error(`API 請求失敗 (${response.status})`);
    }
    
    const data = await response.json();
    return data.places || [];
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('請求超時，請檢查網路連線。');
    }
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

    const placesRaw = await fetchNearbyPlaces(
      state.userLocation, 
      state.filters.distance, 
      state.filters.category
    );
    
    if (!placesRaw || placesRaw.length === 0) {
      state.pool = [];
      state.index = 0;
      analytics.track('search_result', 'empty', { ...state.filters });
      UI.renderStack();
      return;
    }
    
    state.pool = placesRaw.map(transformPlaceData);
    state.pool = recommender.sortPool(state.pool);
    state.index = 0;
    state.undoSlot = null;
    
    analytics.track('search_result', 'success', { 
      count: state.pool.length, 
      ...state.filters 
    });
    
    UI.renderStack();
  } catch (error) {
    console.error("Build Pool Error:", error);
    
    // 根據錯誤類型提供更準確的訊息
    let userMessage = '搜尋失敗，請稍後再試';
    if (error.message.includes('定位') || error.message.includes('位置')) {
      userMessage = error.message;
    } else if (error.message.includes('超時')) {
      userMessage = '網路連線不穩定，請檢查後重試';
    } else if (error.message.includes('API')) {
      userMessage = '服務暫時無法使用，請稍後再試';
    }
    
    analytics.track('error', 'build_pool', { 
      error: error.message,
      filters: state.filters
    });
    
    UI.renderError(userMessage);
  } finally {
    state.isLoading = false;
    UI.setButtonsLoading(false);
  }
}

function choose(liked) {
    if(state.index >= state.pool.length) return;
    const current = state.pool[state.index];
    if (current) {
        state.undoSlot = current;
        recommender.learn(current, liked);
        
        state.history.unshift(current);
        if (state.history.length > 50) state.history.pop();
        saveHistory();

        analytics.trackSwipe(current, liked ? 'like' : 'skip');
    }
    nextCard();
}

function nextCard() {
    state.index++;
    UI.renderStack();
}

function undoSwipe() {
    if (!state.undoSlot) return;
    state.index--;
    state.undoSlot = null;
    UI.renderStack();
    analytics.track('swipe_undo', 'undo');
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
    UI.$('#btnUndo').addEventListener('click', undoSwipe);
    UI.$('#btnChoose').addEventListener('click', () => choose(true));
    UI.$('#btnSkip').addEventListener('click', () => choose(false));
    UI.$('#navHome').addEventListener('click', () => {
        UI.closeAllModals();
        UI.show('swipe');
    });
    UI.$('#navFavs').addEventListener('click', UI.openFavModal);
    UI.$('#navHistory').addEventListener('click', UI.openHistModal);
    UI.$('#navSettings').addEventListener('click', openModal);
    UI.$('#navRefresh').addEventListener('click', buildPool);
    UI.$('#btnClose').addEventListener('click', closeModal);
    UI.$('#applySettings').addEventListener('click', applySettings);
    UI.$('#btnClearFilters').addEventListener('click', UI.clearAllFiltersInModal);

    UI.$("#langSelModal").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.lang = e.target.value;
        state.lang = e.target.value;
        localStorage.setItem(CONFIG.STORAGE_KEYS.lang, state.lang);
        UI.renderText();
        UI.syncUIFromStaged();
    });

    UI.$("#themeSelect").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.theme = e.target.value;
        UI.applyTheme(e.target.value);
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'retryBtn') buildPool();
        if (e.target.id === 'adjustFiltersBtn') openModal();
    });
    
    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        if (state.isLoading) return;
        
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            choose(false);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            choose(true);
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoSwipe();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Jiasa] Initializing...');
  
  UI.applyTheme(state.currentTheme);
  UI.renderText();
  setupEventHandlers();

  const splashScreen = document.getElementById('splashScreen');
  
  try {
    analytics.track('app_open', navigator.userAgent);
    await buildPool();
  } catch (error) {
    console.error('Initialization error:', error);
    UI.renderError('應用程式初始化失敗，請重新整理頁面。');
  } finally {
    // 移除啟動畫面
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
  }
});

// Service Worker 註冊
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}