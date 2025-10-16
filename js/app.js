// js/app.js
import { CONFIG } from './config.js';
import { state, saveFilters } from './state.js';
import * as UI from './ui.js';
import { analytics } from './analytics.js';

export { choose, nextCard, openModal, buildPool };

class RecommendationEngine {
    // ... (這部分程式碼沒有變動，保持原樣)
}
const recommender = new RecommendationEngine();

function transformPlaceData(p) {
    const photoRef = p.photos?.[0]?.name || null;
    const photoUrl = photoRef ? `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=400&maxWidthPx=400&key=AIzaSyDex4jcGsgso6jHfCdKD3pcD3PnU4cKjCY` : null;
    return {
        id: p.id,
        name: p.displayName?.text || '',
        address: p.formattedAddress || '',
        rating: p.rating || 0,
        price: p.priceLevel || null,
        types: p.types || [],
        location: p.location || null,
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
            resolve(state.userLocation);
          },
          error => {
            // ✅ 更新: 提供更清楚的錯誤訊息
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
  const apiUrl = `/api/search?lat=${lat}&lng=${lng}&radius=${radius}&category=${category}&lang=${state.lang}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const data = await response.json();
  return data.places || [];
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

    const placesRaw = await fetchNearbyPlaces(state.userLocation, state.filters.distance, state.filters.category);
    state.pool = placesRaw.map(transformPlaceData);
    state.allDemoData = state.pool; 
    
    state.pool = recommender.sortPool(state.pool);
    state.index = 0;
    analytics.track('filter_apply', 'nearby', { count: state.pool.length, ...state.filters });
    UI.renderStack();
  } catch (error) {
    console.error(error);
    UI.renderError(error.message || '搜尋失敗，請稍後再試');
  } finally {
    state.isLoading = false;
    UI.setButtonsLoading(false);
    UI.renderLoading(false);
  }
}

function choose(liked) {
    if(state.index >= state.pool.length) return;
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
    // ✅ 更新: state.staged 只儲存需要的篩選條件
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

    UI.$("#langSelModal").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.lang = e.target.value;
        state.lang = e.target.value; // 立即更新 state 以便 UI 文字即時變化
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
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Jiasa] Initializing...');
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
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}
