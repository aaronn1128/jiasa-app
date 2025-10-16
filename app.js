// app.js (最終修正版 - 總指揮)

// 1. 從各部門引入需要的工具和狀態
import { CONFIG } from './js/config.js';
import { state, saveFilters, saveFavs, saveHistory } from './js/state.js';
import * as UI from './js/ui.js';
import { analytics } from './js/analytics.js';

// ✅ 修正 #2: 將核心函式匯出，這樣 ui.js 才能呼叫它們
export { choose, nextCard, openModal, buildPool };

// 3. 定義核心類別
class RecommendationEngine {
    constructor() {
        this.preferences = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.preferences) || "{}");
    }
    learn(restaurant, liked) {
        if (!this.preferences.types) this.preferences.types = {};
        if (!this.preferences.cuisines) this.preferences.cuisines = {};
        if (!this.preferences.priceRange) this.preferences.priceRange = {};
        const weight = liked ? 1 : -0.5;
        restaurant.types.forEach(type => {
            this.preferences.types[type] = (this.preferences.types[type] || 0) + weight;
        });
        if (restaurant.cuisines) {
            restaurant.cuisines.forEach(cuisine => {
                this.preferences.cuisines[cuisine] = (this.preferences.cuisines[cuisine] || 0) + weight;
            });
        }
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
        if (this.preferences.cuisines) {
            if (restaurant.cuisines) {
                restaurant.cuisines.forEach(cuisine => {
                    score += this.preferences.cuisines[cuisine] || 0;
                });
            }
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

// 4. 工具函式
function transformPlaceData(p) {
    const photoRef = p.photos?.[0]?.name || null;
    // 注意: 這裡的 API 金鑰應該要用環境變數來管理，避免直接寫在程式碼裡
    const photoUrl = photoRef ? `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=400&key=YOUR_FRONTEND_API_KEY` : null;

    return {
        id: p.id,
        name: p.displayName?.text || '',
        address: p.formattedAddress || '',
        rating: p.rating || 0,
        price: p.priceLevel || null,
        types: p.types || [],
        location: p.location || null,
        distance: p.distanceMeters || null,
        photoUrl,
        opening_hours: {
             open_now: p.regularOpeningHours?.openNow ?? null, // 避免預設為 true
             weekday_text: p.regularOpeningHours?.weekdayDescriptions || null
        },
        website: p.websiteUri || '',
        googleMapsUrl: p.googleMapsUri || '',
        isSponsored: false
    };
}

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
        navigator.geolocation.getCurrentPosition(
          position => {
            state.userLocation = {
               lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            resolve(state.userLocation);
          },
          error => reject(error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    });
}

async function fetchNearbyPlaces(location, radius = 500) {
  const { lat, lng } = location || {};
  const lang = state.lang || 'zh';
  const category = state.filters?.category || 'restaurant';

  const apiUrl =
    `/api/search?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${radius}` +
    `&lang=${encodeURIComponent(lang)}&category=${encodeURIComponent(category)}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const data = await response.json();
  return data.places || [];
}

// 5. 主流程：建立卡片池
async function buildPool() {
  try {
    state.isLoading = true;
    UI.setButtonsLoading(true);
    UI.renderLoading(true);

    if (state.demoMode) {
      console.log("DEMO mode is not implemented yet.");
      state.pool = [];
    } else {
        if (!state.userLocation) {
          UI.showToast(UI.t('searching'), 'info');
          await getUserLocation();
        }

        const allPlacesRaw = await fetchNearbyPlaces(state.userLocation, state.filters.distance);
        let allPlaces = allPlacesRaw.map(p => transformPlaceData(p));
        state.allDemoData = allPlaces; 

        state.pool = allPlaces;
        const sortedNormal = recommender.sortPool(state.pool);
        state.pool = sortedNormal;

        if (!state.hasSeenOnboarding) {
          // state.pool.unshift(createOnboardingCard()); // 如有教學卡片
        }
    }

    state.index = 0;
    analytics.track('filter_apply', state.demoMode ? 'demo' : 'nearby', { count: state.pool.length });
    UI.renderStack();
  } catch (error) {
    console.error(error);
    UI.renderError(error?.message || 'Loading failed');
  } finally {
    state.isLoading = false;
    UI.setButtonsLoading(false);
    UI.renderLoading(false);
  }
}

// 互動：左右滑或點擊按鈕
function choose(liked) {
    if(state.index >= state.pool.length) return;
    const current = state.pool[state.index];
    if (current) {
        if (!current.isOnboarding) {
            recommender.learn(current, liked);
            // 注意: saveHistory 需要兩個參數
            // saveHistory(current, liked ? 'liked' : 'skipped'); 
            analytics.trackSwipe(current, liked ? 'like' : 'skip');
        } else {
            state.hasSeenOnboarding = true;
            localStorage.setItem(CONFIG.STORAGE_KEYS.onboarding, 'true');
        }
    }
    nextCard();
}

function nextCard() {
    state.index++;
    if (state.index >= state.pool.length - 3 && !state.isLoading) {
        // UI.showToast(UI.t('loading_more'), 'info');
    }
    UI.renderStack();
}

// 設定面板
function openModal() {
    state.staged = {
        preview: { lang: state.lang, theme: state.currentTheme },
        filters: {
          category: state.filters.category || 'restaurant',
          minRating: state.filters.minRating,
          priceLevel: new Set(state.filters.priceLevel),
          distance: state.filters.distance,
          types: new Set(state.filters.types),
          cuisines: new Set(state.filters.cuisines)
        },
        applied: false,
        original: { lang: state.lang, theme: state.currentTheme }
    };
    UI.showModal(true);
    UI.syncUIFromStaged();
}

async function applySettings() {
    try {
        if (!state.staged) return;
        state.currentTheme = state.staged.preview.theme;
        localStorage.setItem(CONFIG.STORAGE_KEYS.theme, state.currentTheme);
        UI.applyTheme(state.currentTheme);

        state.filters = { ...state.filters, ...state.staged.filters };
        saveFilters();
        analytics.track('settings_apply', 'filters', { distance: state.filters.distance, category: state.filters.category });
        UI.showModal(false);
        await buildPool();

    } catch (e) {
        console.error(e);
        UI.showToast('Failed to apply settings', 'error');
    } finally {
        state.staged = null;
    }
}

function closeModal() {
    UI.showModal(false);
}

// 綁定事件
function setupEventHandlers() {
    // ✅ 修正 #1: 使用 index.html 中正確的 ID
    // --- 主畫面按鈕 ---
    UI.$('#btnChoose').addEventListener('click', () => choose(true));
    UI.$('#btnSkip').addEventListener('click', () => choose(false));

    // --- 底部導航列 ---
    UI.$('#navHome').addEventListener('click', () => {
        UI.closeAllModals();
        UI.show('swipe');
    });
    UI.$('#navFavs').addEventListener('click', UI.openFavModal);
    UI.$('#navHistory').addEventListener('click', UI.openHistModal);
    UI.$('#navSettings').addEventListener('click', openModal);
    UI.$('#navRefresh').addEventListener('click', buildPool);

    // --- 設定 Modal ---
    UI.$('#btnClose').addEventListener('click', closeModal);
    UI.$('#applySettings').addEventListener('click', applySettings);
    UI.$('#btnClearFilters').addEventListener('click', UI.clearAllFiltersInModal);

    UI.$("#themeSelect").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.theme = e.target.value;
        UI.applyTheme(e.target.value);
    });

    const catSel = UI.$('#categorySelect');
    if (catSel) {
      catSel.addEventListener('change', (e) => {
        if (!state.staged || !state.staged.filters) return;
        state.staged.filters.category = e.target.value || 'restaurant';
      });
    }

    UI.$("#minRating").addEventListener("input", (e)=>{
        if(!state.staged) return;
        state.staged.filters.minRating = +e.target.value;
        UI.$("#ratingShow").textContent = (+e.target.value).toFixed(1) + "+";
        UI.updateSliderBackground(e.target);
    });
    UI.$("#distance").addEventListener("input", (e)=>{
        if(!state.staged) return;
        state.staged.filters.distance = +e.target.value;
        UI.$("#distanceShow").textContent = "≤ " + e.target.value + "m";
        UI.updateSliderBackground(e.target);
    });

    // 動態錯誤畫面的按鈕
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'retryBtn') buildPool();
        if (e.target.id === 'adjustFiltersBtn') openModal();
    });
}

// 6. App 啟動點
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Jiasa] Initializing...');

  UI.applyTheme(state.currentTheme);
  UI.renderText();

  const distSlider = UI.$('#distance');
  if (distSlider) {
    distSlider.value = state.filters.distance || 1500;
    UI.$("#distanceShow").textContent = "≤ " + distSlider.value + "m";
    UI.updateSliderBackground(distSlider);
  }
  
  // 必須先綁定好所有事件，才能處理後續邏輯
  setupEventHandlers();

  // ✅ 修正 #1: 使用正確的 ID 'splashScreen'
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

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}

