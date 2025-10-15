// app.js (完整版 - 總指揮)

// 1. 從各部門引入需要的工具和狀態
import { CONFIG } from './js/config.js';
import { state, saveFilters, saveFavs, saveHistory } from './js/state.js';
import * as UI from './js/ui.js';
import { analytics } from './js/analytics.js';

// 2. 匯出需要給 ui.js 使用的函式 (解決模組循環依賴)
export { choose, nextCard, openModal };

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
        if (liked && restaurant.rating) {
            this.preferences.minRatingPreferred = Math.max(this.preferences.minRatingPreferred || 0, restaurant.rating);
        }
        this.save();
    }
    score(restaurant) {
        let score = 0;
        restaurant.types.forEach(type => { score += this.preferences.types?.[type] || 0; });
        if (restaurant.cuisines) {
            restaurant.cuisines.forEach(cuisine => { score += this.preferences.cuisines?.[cuisine] || 0; });
        }
        const priceKey = `price_${restaurant.price}`;
        score += this.preferences.priceRange?.[priceKey] || 0;
        if (restaurant.rating >= (this.preferences.minRatingPreferred || 4.0)) score += 2;
        return score;
    }
    sortPool(restaurants) {
        return restaurants.filter(r => !r.isOnboarding && !r.isSponsored).sort((a, b) => this.score(b) - this.score(a));
    }
    save() { localStorage.setItem(CONFIG.STORAGE_KEYS.preferences, JSON.stringify(this.preferences)); }
}
const recommender = new RecommendationEngine();

// 4. 核心商業邏輯
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
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

async function fetchNearbyPlaces(location, radius = 1500) {
  const { lat, lng } = location || {};
  const lang = state.lang || 'zh';

  const apiUrl =
    `/api/search?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${radius}&lang=${encodeURIComponent(lang)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error('Search error via proxy:', error);
    throw error;
  }
}

function transformPlaceData(place) {
  const types = place.types || ['restaurant'];
  const name = place.displayName?.text || place.formattedAddress || 'Unknown Name';
  const cuisineGuess = [];
  const nameLower = name.toLowerCase();

  if (nameLower.includes('japanese') || nameLower.includes('sushi') || nameLower.includes('ramen') || nameLower.includes('日式') || nameLower.includes('日本')) cuisineGuess.push('japanese');
  if (nameLower.includes('chinese') || nameLower.includes('dim sum') || nameLower.includes('中式') || nameLower.includes('中國')) cuisineGuess.push('chinese');
  if (nameLower.includes('italian') || nameLower.includes('pizza') || nameLower.includes('pasta') || nameLower.includes('義式')) cuisineGuess.push('italian');
  if (nameLower.includes('thai') || nameLower.includes('泰式')) cuisineGuess.push('thai');
  if (nameLower.includes('korean') || nameLower.includes('bbq') || nameLower.includes('韓式')) cuisineGuess.push('korean');
  if (nameLower.includes('vietnamese') || nameLower.includes('pho') || nameLower.includes('越南')) cuisineGuess.push('vietnamese');

  // ✅ 先宣告，避免成為未定義變數
  let photoUrl = null;
  if (place.photos && place.photos.length > 0) {
const photoName = place.photos[0].name; // e.g. "places/ChIJ.../photos/AbCd"
const BROWSER_PLACES_KEY = 'AIzaSyDex4jcGsgso6jHfCdKD3pcD3PnU4cKjCY';
// 不要對整個 name 做 encode，保留斜線
photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${CONFIG.PHOTO_MAX_WIDTH || 1200}&key=${BROWSER_PLACES_KEY}`;
  }

  return {
    id: place.id,
    place_id: place.id,
    name,
    rating: place.rating || 0,
    price: convertPriceLevel(place.priceLevel),
    address: place.formattedAddress || '',
    types,
    cuisines: cuisineGuess,
    location: place.location,
    photoUrl, // ✅ 正常帶出
    opening_hours: {
      open_now: place.regularOpeningHours ? place.regularOpeningHours.openNow : null,
      weekday_text: place.regularOpeningHours ? place.regularOpeningHours.weekdayDescriptions : null
    },
    website: place.websiteUri || null,
    googleMapsUrl: place.googleMapsUri || null,
    isSponsored: false
  };
}

function convertPriceLevel(priceLevel) {
    if (!priceLevel) return 2;
    const priceMap = {
        'PRICE_LEVEL_FREE': 1,
        'PRICE_LEVEL_INEXPENSIVE': 1,
        'PRICE_LEVEL_MODERATE': 2,
        'PRICE_LEVEL_EXPENSIVE': 3,
        'PRICE_LEVEL_VERY_EXPENSIVE': 4
    };
    return priceMap[priceLevel] || 2;
}

function generateDemoData() {
    return Array.from({length:20}).map((_,i)=>{
        const id = 'demo_' + (i+1);
        const types = [["restaurant"],["cafe"],["restaurant","bar"],["bakery"],["restaurant","meal_takeaway"]][i%5];
        const cuisines = [["japanese"],["chinese"],["italian"],["thai"],["korean"]][i%5];
        const price = [1,2,2,3,4][i%5];
        const rating = [4.0,4.5,4.2,3.8,4.7][i%5];
        const names = ["示範餐廳","測試咖啡","Sample Restaurant","Test Cafe","デモ店"];
        const websites = ["https://example.com/restaurant1", "https://example.com/cafe1", null, "https://example.com/bakery1", "https://example.com/restaurant2"];
        const isSponsored = (i+1) % 7 === 0;
        const openingHours = { open_now: i % 3 !== 0, weekday_text: [ "星期一: 11:00 – 21:00", "星期二: 11:00 – 21:00", "星期三: 11:00 – 21:00", "星期四: 11:00 – 21:00", "星期五: 11:00 – 22:00", "星期六: 10:00 – 22:00", "星期日: 10:00 – 21:00" ] };
        return { id, place_id: id, name: names[i%5] + ' ' + (i+1), rating, price, address: "台北市信義區 Sample St. " + (i+1), types, cuisines, location: {lat: 25.04 + i*0.001, lng: 121.56 + i*0.001}, photos: [], photoUrl: null, opening_hours: openingHours, website: websites[i % 5], isSponsored: isSponsored };
    });
}

function createOnboardingCard() {
    return { id: '__onboarding__', isOnboarding: true, type: 'onboarding' };
}

async function buildPool() {
  state.isLoading = true;
  UI.setButtonsLoading(true);
  UI.showSkeletonLoader();
  
  let allPlacesRaw;
  
  if (CONFIG.DEMO_MODE) {
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
  
  try {
    if (!state.userLocation) {
      UI.showToast(UI.t('searching'), 'info');
      await getUserLocation();
    }
    
    allPlacesRaw = await fetchNearbyPlaces(state.userLocation, state.filters.distance);
    let allPlaces = allPlacesRaw.map(transformPlaceData);
    state.allDemoData = allPlaces;
    
    state.pool = allPlaces.filter(r => {
        if (r.opening_hours?.open_now !== true) return false;
        if (r.rating < state.filters.minRating) return false;
        if (state.filters.priceLevel.size > 0 && !state.filters.priceLevel.has(r.price)) return false;
        if (state.filters.types.size > 0 && !r.types.some(t => state.filters.types.has(t))) return false;
        // ... (cuisine filter logic can be added here)
        return true;
    });

    const normalRestaurants = state.pool.filter(r => !r.isSponsored);
    const sortedNormal = recommender.sortPool(normalRestaurants);
    state.pool = sortedNormal;
    
    if (!state.hasSeenOnboarding) {
      state.pool.unshift(createOnboardingCard());
    }
    
    state.index = 0;
    if (state.pool.length === 0) {
      UI.showErrorState(UI.t('noMatches'));
    }
    
    analytics.track('filter_apply', 'completed', { count: state.pool.length });
  } catch (error) {
    console.error('Build pool error:', error);
    UI.showErrorState(UI.t('searchError'));
    analytics.track('api_error', 'build_pool_failed', { error: error.message });
  } finally {
    state.isLoading = false;
    UI.setButtonsLoading(false);
  }
}

function choose(r) {
  if (r.isOnboarding) {
    state.hasSeenOnboarding = true;
    localStorage.setItem(CONFIG.STORAGE_KEYS.onboarding, "true");
    analytics.track('onboarding', 'complete');
    state.index++;
    UI.renderStack();
    return;
  }
  
  state.current = r;
  if (!state.history.some(item => item.id === r.id)) {
      state.history.unshift({id:r.id, ts: Date.now()}); 
      state.history = state.history.slice(0,50); 
      saveHistory();
  }
  
  const chosenIndex = state.pool.findIndex(item => item.id === r.id);
  if (chosenIndex !== -1) { 
    state.pool.splice(chosenIndex, 1);
    if (state.index >= state.pool.length && state.pool.length > 0) state.index = 0; 
  }
  state.undoSlot = null; 
  UI.updateUndoBtn();
  
  analytics.trackSwipe(r, 'like');
  recommender.learn(r, true);
  if (r.isSponsored) analytics.trackSponsor(r, 'like');
  
  UI.renderBaseResult(r); 
  UI.show("result");
}

function nextCard(liked) {
  const r = state.pool[state.index]; 
  if(!r) return;
  
  if (r.isOnboarding) {
    state.hasSeenOnboarding = true;
    localStorage.setItem(CONFIG.STORAGE_KEYS.onboarding, "true");
    analytics.track('onboarding', liked ? 'liked' : 'skipped');
    state.index++;
    UI.renderStack();
    return;
  }
  
  if(!liked){ 
    state.undoSlot = { indexBefore: state.index, restaurant: r };
    analytics.trackSwipe(r, 'skip');
    recommender.learn(r, false);
  } else { 
    state.undoSlot = null;
  }
  
  if(liked){ choose(r); return; }

  state.index++;
  if (state.index >= state.pool.length) {
      if (state.pool.length > 0) state.index = 0; // Loop back
      else UI.showErrorState(UI.t('noMatches'));
  }
  
  UI.renderStack(); 
}

function addFav(r) {
    if(!state.favs.includes(r.id)){ 
        state.favs.unshift(r.id);
        saveFavs();
        analytics.track('fav_add', r.id);
        UI.showToast(UI.t('favoriteAdded'), 'success');
    } 
}

// 5. 事件與流程控制
function openModal() {
    UI.closeAllModals();
    state.staged = {
        original: { lang: state.lang, theme: state.currentTheme },
        preview: { lang: state.lang, theme: state.currentTheme },
        filters: { 
          minRating: state.filters.minRating, priceLevel: new Set(state.filters.priceLevel),
          distance: state.filters.distance, types: new Set(state.filters.types), cuisines: new Set(state.filters.cuisines) 
        },
        applied: false
    };
    UI.$("#overlay").classList.add("active"); 
    UI.$("#modal").classList.add("active");
    UI.syncUIFromStaged();
    analytics.track('modal_open', 'settings');
}

async function applySettings() {
    if(!state.staged) return;
    
    state.lang = state.staged.preview.lang; 
    localStorage.setItem(CONFIG.STORAGE_KEYS.lang, state.lang);
    state.currentTheme = state.staged.preview.theme; 
    localStorage.setItem(CONFIG.STORAGE_KEYS.theme, state.currentTheme); 
    UI.applyTheme(state.currentTheme);
    
    state.filters = { ...state.filters, ...state.staged.filters };
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.configured, "true"); 
    saveFilters();
    state.hasConfigured = true; 
    state.staged.applied = true; 
    
    UI.closeAllModals();
    UI.show('swipe');
    UI.renderText();
    
    await buildPool();
    UI.renderStack();
}

async function retryBuildPool() {
    analytics.track('action', 'retry_search');
    await buildPool();
    UI.renderStack();
}

function setupEventHandlers() {
    UI.$("#btnSkip").onclick = () => nextCard(false);
    UI.$("#btnChoose").onclick = () => nextCard(true);
    UI.$("#btnBack").onclick = () => { UI.show("swipe"); };
    UI.$("#btnFav").onclick = () => { if(state.current) addFav(state.current); UI.show("swipe"); };
    UI.$("#btnUndo").onclick = ()=>{ 
        if(!state.undoSlot) return;
        state.index = state.undoSlot.indexBefore; 
        state.undoSlot = null; 
        UI.renderStack(); 
        analytics.track('action', 'undo');
    };

    // Nav buttons
    UI.$("#navHome").addEventListener('click', () => {
        if (UI.$("#swipe").style.display === "none") UI.show('swipe');
        UI.closeAllModals();
        UI.updateNavActive('navHome');
    });
    UI.$("#navFavs").addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); UI.openFavModal(); });
    UI.$("#navHistory").addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); UI.openHistModal(); });
    UI.$("#navSettings").addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openModal(); });
    UI.$("#navRefresh").addEventListener('click', async () => {
        if (state.isLoading) return;
        UI.showToast(UI.t('refreshing'), 'info');
        analytics.track('nav', 'refresh');
        await buildPool();
        UI.renderStack();
        UI.showToast(UI.t('refreshed'), 'success');
    });
    
    // Modals
    UI.$("#btnClose").addEventListener('click', UI.closeAllModals);
    UI.$("#favClose").addEventListener('click', UI.closeAllModals);
    UI.$("#histClose").addEventListener('click', UI.closeAllModals);
    UI.$("#overlay").addEventListener('click', (e) => { if (e.target === UI.$("#overlay")) UI.closeAllModals(); });
    UI.$("#favOverlay").addEventListener('click', (e) => { if (e.target === UI.$("#favOverlay")) UI.closeAllModals(); });
    UI.$("#histOverlay").addEventListener('click', (e) => { if (e.target === UI.$("#histOverlay")) UI.closeAllModals(); });
    
    // Settings Modal
    UI.$("#applySettings").addEventListener("click", applySettings);
    UI.$("#btnClearFilters").addEventListener("click", UI.clearAllFiltersInModal);
    UI.$("#langSelModal").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.lang = e.target.value;
        state.lang = e.target.value; // Preview language change immediately
        UI.renderText();
        UI.renderOptionPillsFromStaged();
    });
    UI.$("#themeSelect").addEventListener("change", (e)=>{
        if(!state.staged) return;
        state.staged.preview.theme = e.target.value;
        UI.applyTheme(e.target.value);
    });
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
  UI.renderText();
  setupEventHandlers();
  
  const splashScreen = UI.$('#splashScreen');
  const hasSeenSplash = sessionStorage.getItem('jiasa_seen_splash');
  if (!hasSeenSplash) {
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => { splashScreen.style.display = 'none'; }, 500);
      sessionStorage.setItem('jiasa_seen_splash', 'true');
    }, 3000);
  } else {
    splashScreen.style.display = 'none';
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