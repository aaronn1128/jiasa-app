// app.js (完整版 - 總指揮)

// 1. 從各部門引入需要的工具和狀態
import { CONFIG } from './config.js';
import { state, saveFilters, saveFavs, saveHistory } from './state.js';
import * as UI from './ui.js';
import { analytics } from './analytics.js';

// 2. 匯出需要給 ui.js 使用的函式 (解決模組循環依賴)

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
function metersToReadable(meters) {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
}

function transformPlaceData(p) {
    const photoRef = p.photos?.[0]?.name || null;
    return {
        id: p.id,
        name: p.displayName?.text || '',
        address: p.formattedAddress || '',
        rating: p.rating || 0,
        price: p.priceLevel || null,
        types: p.types || [],
        location: p.location || null,
        distance: p.distanceMeters || null,
        photoRef,
        opening_hours: { open_now: p.regularOpeningHours?.openNow ?? true },
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

// ✅ 改好的：帶 language + category 的 Nearby 查詢（免費版邏輯）
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
export async function buildPool() {
  try {
    state.isLoading = true;
    UI.setButtonsLoading(true);
    UI.renderLoading(true);

    // Demo 模式（如果有）
    if (state.demoMode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      state.allDemoData = generateDemoData();
      state.pool = [...state.allDemoData]; // Create a copy for manipulation
      if (!state.hasSeenOnboarding) state.pool.unshift(createOnboardingCard());
      state.index = 0;
      analytics.track('filter_apply', 'demo', { count: state.pool.length });
      state.isLoading = false;
      UI.setButtonsLoading(false);
      UI.renderStack();
      return;
    }

    // 取定位
    if (!state.userLocation) {
      UI.showToast(UI.t('searching'), 'info');
      await getUserLocation();
    }

    // 後端 Nearby：距離 + 類型 + 語言（一次取 20 筆）
    const allPlacesRaw = await fetchNearbyPlaces(state.userLocation, state.filters.distance);
    let allPlaces = allPlacesRaw.map(transformPlaceData);
    state.allDemoData = allPlaces;

    // ✅ 免費版：不在前端再硬卡評分/價位/types，直接用回傳清單
    state.pool = allPlaces;

    // 推薦排序（維持原體驗）
    const normalRestaurants = state.pool.filter(r => !r.isSponsored);
    const sortedNormal = recommender.sortPool(normalRestaurants);
    state.pool = sortedNormal;

    // Onboarding
    if (!state.hasSeenOnboarding) {
      state.pool.unshift(createOnboardingCard());
    }

    state.index = 0;
    analytics.track('filter_apply', 'nearby', { count: state.pool.length });
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

// 互動：左右滑
export function choose(liked) {
    const current = state.pool[state.index];
    if (current) {
        recommender.learn(current, liked);
        saveHistory(current, liked);
    }
    state.index++;
    if (state.index >= state.pool.length - 3) {
        UI.showToast(UI.t('loading_more'), 'info');
    }
    UI.renderStack();
}

export function nextCard() {
    state.index++;
    UI.renderStack();
}

// 設定面板
export function openModal() {
    // 建立 staged 狀態
    state.staged = {
        preview: { theme: state.currentTheme },
        filters: { 
          category: state.filters.category || 'restaurant',
          minRating: state.filters.minRating, 
          priceLevel: new Set(state.filters.priceLevel),
          distance: state.filters.distance, 
          types: new Set(state.filters.types), 
          cuisines: new Set(state.filters.cuisines) 
        },
        applied: false
    };

    UI.showModal(true);
    UI.syncUIFromStaged();
    // 讓類型選單顯示目前值
    const catSel = UI.$('#categorySelect');
    if (catSel && state.staged?.filters?.category) catSel.value = state.staged.filters.category;
}

// 套用設定
async function applySettings() {
    try {
        if (!state.staged) return;
        state.filters = { ...state.filters, ...state.staged.filters }; // ✅ 會把 category 也寫回
        saveFilters();
        analytics.track('settings_apply', 'filters', { distance: state.filters.distance, category: state.filters.category });
        await buildPool();
    } catch (e) {
        console.error(e);
        UI.showToast('Failed to apply settings', 'error');
    } finally {
        UI.showModal(false);
        state.staged = null;
    }
}

// 關閉設定
function closeModal() {
    UI.showModal(false);
    state.staged = null;
}

// 綁定事件
function setupEventHandlers() {
    // 卡片操作
    UI.$('#btnLike').addEventListener('click', () => choose(true));
    UI.$('#btnSkip').addEventListener('click', () => choose(false));
    UI.$('#btnNext').addEventListener('click', nextCard);

    // 開啟設定
    UI.$('#btnSettings').addEventListener('click', openModal);
    UI.$('#btnClose').addEventListener('click', closeModal);
    UI.$('#btnApply').addEventListener('click', applySettings);

    // 主題預覽
    UI.$("#themeSelect").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.theme = e.target.value;
        UI.applyTheme(e.target.value);
    });

    // ✅ 類型選單：寫進 staged.filters.category
    const catSel = UI.$('#categorySelect');
    if (catSel) {
      catSel.addEventListener('change', (e) => {
        if (!state.staged) return;
        if (!state.staged.filters) state.staged.filters = {};
        state.staged.filters.category = e.target.value || 'restaurant';
      });
    }

    // 以下舊有的評分/距離滑桿監聽可先保留（免費版不會用到評分）
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

    // Dynamic buttons in error state
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'retryBtn') retryBuildPool();
        if (e.target.id === 'adjustFiltersBtn') openModal();
    });
}

// 6. App 啟動點
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Jiasa] Initializing...');
  
  UI.applyTheme(state.currentTheme);

  // 初始語言渲染
  UI.renderText();

  // 初始距離/顯示
  const distSlider = UI.$('#distance');
  if (distSlider) {
    distSlider.value = state.filters.distance || 500;
    UI.$("#distanceShow").textContent = "≤ " + distSlider.value + "m";
    UI.updateSliderBackground(distSlider);
  }

  setupEventHandlers();

  // Splash
  const splashScreen = document.getElementById('splash');
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => splashScreen.remove(), 300);
    }, 800);
  }

  analytics.track('app_open', navigator.userAgent);
  await buildPool();
  UI.renderStack();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}

