// ====== CONFIG ======
const CONFIG = {
  API_TIMEOUT: 10000,
  API_MAX_RETRIES: 2,
  CACHE_TTL: 4 * 60 * 60 * 1000,  // ✅ 改成 4 小時（餐廳資訊變動不大）
  PHOTO_MAX_WIDTH: 800,
  DEMO_MODE: false,
  STORAGE_KEYS: {
    lang: 'jiasa_lang',
    theme: 'jiasa_theme',
    filters: 'jiasa_filters',
    favs: 'jiasa_favs',
    hist: 'jiasa_hist',
    configured: 'jiasa_configured',
    onboarding: 'jiasa_seen_onboarding',
    preferences: 'jiasa_preferences',
    analytics: 'jiasa_analytics'
  },
  DEFAULT_FILTERS: {
    // ✅ 移除 openNow（因為現在是強制行為，不需要設定）
    minRating: 3,
    priceLevel: [],
    distance: 1500,
    types: [],
    cuisines: []
  }
};
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (REDUCED && navigator.vibrate) navigator.vibrate = ()=>{};
// ====== ICONS ======
const ICONS = {
  settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.65 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.77 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.51.39 1.05.7 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.24 1.12-.55-1.63.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58z"/><circle cx="12" cy="12" r="3.2"/></svg>`,
  swipeBoth: `<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7M12 19l-7-7 7-7"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
};
// ====== I18N ======
const I18N = {
  zh: { 
    settings:"設定", language:"語言", skip:"略過", choose:"選這家", back:"返回",
    hintKeys:"提示：可以左右滑動卡片，或用 ← → 鍵操作。", 
    noMatches:"沒有符合條件的店家", retry:"重試", adjustFilters:"調整篩選",
    hours:"營業時間", distance:"搜尋距離（需允許定位權限。）", favorites:"收藏清單", fav:"收藏",
    history:"歷史紀錄", emptyFav:"尚未收藏", emptyHist:"尚無紀錄",
    like:"選這家", nope:"略過", openMap:"開地圖", website:"官網",
    nowOpen:"營業中", nowClose:"休息中", hoursUnknown:"營業時間未提供",
    view:"查看", del:"刪除", showHours:"顯示營業時間", hideHours:"收起營業時間",
    theme:"主題", apply:"套用", clearFilters:"清除全部",
    minRating:"最低評分（只顯示評分高於此值的餐廳。）", priceLevel:"價格範圍（$ 便宜 | $$ 中等 | $$$ 較貴 | $$$$ 昂貴）",
    types:"餐廳類型（未選表示全部。）", cuisines:"料理風格（作為搜尋關鍵字使用。）",
    hintRating:"只顯示評分高於此值的餐廳。", 
    hintPrice:"$ 便宜 | $$ 中等 | $$$ 較貴 | $$$$ 昂貴", 
    hintDistance:"需允許定位權限。", 
    hintTypes:"可選擇多個類型，未選表示全部。", 
    hintCuisine:"作為搜尋關鍵字使用。",
    typeText:{ restaurant:"餐廳", cafe:"咖啡廳", bar:"酒吧", bakery:"烘焙坊", meal_takeaway:"外帶", meal_delivery:"外送" },
    cuText:{ japanese:"日式", chinese:"中式", italian:"義式", thai:"泰式", korean:"韓式", vietnamese:"越南", western:"西餐", vegetarian:"蔬食", seafood:"海鮮", bbq:"燒烤", hotpot:"火鍋", noodles:"麵食" },
    searching:"搜尋中...", searchError:"搜尋失敗", offline:"目前離線", usingCache:"使用快取資料",
    refreshing:"更新中...", filtersCleared:"已清除所有篩選", favoriteAdded:"已加入收藏", 
    onlineAgain:"已恢復連線", refreshed:"已更新",
    onboard: {
      title: "歡迎使用 Jiasa", subtitle: "用滑的找餐廳，超簡單",
      instructions: [
        { icon: "settings", title: "設定條件", text: "點右上角設定預算、距離和喜好" },
        { icon: "swipeBoth", title: "滑動選擇", text: "左滑略過，右滑選擇喜歡的餐廳" },
        { icon: "heart", title: "收藏管理", text: "把喜歡的餐廳加入收藏清單" },
        { icon: "map", title: "查看資訊", text: "選定後可查看地圖、營業時間等" }
      ],
      swipeHint: "滑動卡片開始探索"
    },
    sponsor: "贊助",
    navHome: "首頁",
    navFavorites: "收藏",
    navRefresh: "刷新",
    navHistory: "歷史",
    navSettings: "設定"
  },
  en: {
    settings:"Settings", language:"Language", skip:"Skip", choose:"Choose", back:"Back",
    hintKeys:"Tip: swipe or use ← → keys.", 
    noMatches:"No matches", retry:"Retry", adjustFilters:"Adjust Filters",
    hours:"Hours", distance:"Search Radius (Location permission required.)", favorites:"Favorites", fav:"Favorite",
    history:"History", emptyFav:"No favorites yet", emptyHist:"No history yet",
    like:"Choose", nope:"Skip", openMap:"Open Map", website:"Website",
    nowOpen:"Open now", nowClose:"Closed", hoursUnknown:"Hours not available",
    view:"View", del:"Delete", showHours:"Show hours", hideHours:"Hide hours",
    theme:"Theme", apply:"Apply", clearFilters:"Clear All",
    openNow:"Open Now Only", minRating:"Minimum Rating (Show only places rated above this.)", priceLevel:"Price Range ($ Cheap | $$ Moderate | $$$ Expensive | $$$$ Very Expensive)",
    types:"Restaurant Types (Select multiple or none for all.)", cuisines:"Cuisine Keywords (Used as search keywords.)",
    hintRating:"Show only places rated above this.", 
    hintPrice:"$ Cheap | $$ Moderate | $$$ Expensive | $$$$ Very Expensive",
    hintDistance:"Location permission required.", 
    hintTypes:"Select multiple types, or none for all.", 
    hintCuisine:"Used as search keywords.",
    typeText:{ restaurant:"Restaurant", cafe:"Cafe", bar:"Bar", bakery:"Bakery", meal_takeaway:"Takeout", meal_delivery:"Delivery" },
    cuText:{ japanese:"Japanese", chinese:"Chinese", italian:"Italian", thai:"Thai", korean:"Korean", vietnamese:"Vietnamese", western:"Western", vegetarian:"Vegetarian", seafood:"Seafood", bbq:"BBQ", hotpot:"Hot Pot", noodles:"Noodles" },
    searching:"Searching...", searchError:"Search failed", offline:"Offline", usingCache:"Using cached data",
    refreshing:"Refreshing...", filtersCleared:"All filters cleared", favoriteAdded:"Added to favorites",
    onlineAgain:"Back online", refreshed:"Refreshed",
    onboard: {
      title: "Welcome to Jiasa", subtitle: "Swipe to find restaurants",
      instructions: [
        { icon: "settings", title: "Set Preferences", text: "Tap settings to configure budget, distance & preferences" },
        { icon: "swipeBoth", title: "Swipe to Choose", text: "Swipe left to skip, right to select restaurants" },
        { icon: "heart", title: "Save Favorites", text: "Add restaurants you like to favorites list" },
        { icon: "map", title: "View Details", text: "Check map, hours, and more info after selection" }
      ],
      swipeHint: "Swipe to start exploring"
    },
    sponsor: "Sponsor",
    navHome: "Home",
    navFavorites: "Favorites",
    navRefresh: "Refresh",
    navHistory: "History",
    navSettings: "Settings"
  }
};
// ====== STATE ======
let lang = localStorage.getItem(CONFIG.STORAGE_KEYS.lang) || "zh";
let currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'classic';
let filters = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.filters) || JSON.stringify(CONFIG.DEFAULT_FILTERS));
filters.types = new Set(filters.types || []);
filters.cuisines = new Set(filters.cuisines || []);
filters.priceLevel = new Set(filters.priceLevel || []); 

let pool = []; 
let index = 0; 
let current = null;
let favs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.favs)||"[]");
let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.hist)||"[]");
let hasConfigured = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.configured) || "false");
let hasSeenOnboarding = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.onboarding) || "false");
let undoSlot = null;
let isOnline = navigator.onLine;
let staged = null;
let isLoading = false;
// ====== ANALYTICS ======
class Analytics {
  constructor() {
    this.events = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.analytics) || "[]");
    this.session = { id: Date.now(), start: Date.now(), events: [] };
  }
  track(event, label, payload = {}) {
    const record = { event, label, timestamp: Date.now(), session_id: this.session.id, lang, theme: currentTheme, ...payload };
    this.session.events.push(record);
    this.events.push(record);
    if (this.events.length > 1000) this.events = this.events.slice(-1000);
    localStorage.setItem(CONFIG.STORAGE_KEYS.analytics, JSON.stringify(this.events));
    console.log(`[Analytics] ${event}:`, label, payload);
  }
  trackSwipe(restaurant, direction) {
    this.track(`swipe_${direction}`, restaurant.id, { place_id: restaurant.place_id, name: restaurant.name, rating: restaurant.rating, price: restaurant.price, types: restaurant.types, isSponsored: restaurant.isSponsored });
  }
  trackSponsor(restaurant, action) {
    if (!restaurant.isSponsored) return;
    this.track(`sponsor_${action}`, restaurant.id, { place_id: restaurant.place_id, name: restaurant.name });
  }
  getStats() {
    const swipes = this.session.events.filter(e => e.event.startsWith('swipe_'));
    const likes = swipes.filter(e => e.event === 'swipe_like').length;
    const skips = swipes.filter(e => e.event === 'swipe_skip').length;
    return { totalSwipes: swipes.length, likes, skips, likeRate: likes / (likes + skips) || 0 };
  }
}
const analytics = new Analytics();
// ====== RECOMMENDATION ENGINE ======
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
  save() { localStorage.setItem(CONFIG.STORAGE_KEYS.preferences, JSON.stringify(this.preferences));
  }
}
const recommender = new RecommendationEngine();
// ====== OFFLINE SUPPORT ======
window.addEventListener('online', () => {
  isOnline = true;
  $("#offlineBadge").classList.remove('show');
  showToast(t('onlineAgain'), 'success');
  buildPool().then(() => renderStack());
});
window.addEventListener('offline', () => {
  isOnline = false;
  $("#offlineBadge").classList.add('show');
  showToast(t('offline'), 'offline');
});
// ====== GOOGLE PLACES API ======
let userLocation = null;
let placesService = null;
let map = null;

async function initPlacesService() {
  try {
    if (window.google?.maps?.importLibrary) {
      // 預先載入 places library
      await google.maps.importLibrary("places");
      console.log('[Jiasa] New Places API ready');
    } else {
      console.warn('[Jiasa] importLibrary not available, waiting for API load...');
    }
  } catch (error) {
    console.error('[Jiasa] Failed to initialize Places API:', error);
  }
}

async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
           lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        resolve(userLocation);
      },
      error => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}


async function fetchNearbyPlaces(location, radius = 1500) {
  // 這是我們「中間人」的網址。
  // 我們把經緯度和半徑資訊，附加在網址後面送過去
  const apiUrl = `/api/search?lat=${location.lat}&lng=${location.lng}&radius=${radius}`;

  try {
    // 去跟我們的「中間人」溝通
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    
    // 新版 Google API 回傳的資料結構是 { places: [...] }
    // 我們需要處理這種格式，並把 places 陣列回傳
    return data.places || [];

  } catch (error) {
    console.error('Search error via proxy:', error);
    throw error;
  }
}

// ====== 價格等級轉換 ======
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

// ====== 請從這裡開始複製 ======
function transformPlaceData(place) {
  // 從新 API 回傳的資料中提取所需資訊
  const types = place.types || ['restaurant'];
  const name = place.displayName?.text || place.formattedAddress || 'Unknown Name';
  
  // 猜測料理風格（這部分邏輯可以保留）
  const cuisineGuess = [];
  const nameLower = name.toLowerCase();
  if (nameLower.includes('japanese') || nameLower.includes('sushi') || nameLower.includes('ramen') || nameLower.includes('日式') || nameLower.includes('日本')) cuisineGuess.push('japanese');
  if (nameLower.includes('chinese') || nameLower.includes('dim sum') || nameLower.includes('中式') || nameLower.includes('中國')) cuisineGuess.push('chinese');
  if (nameLower.includes('italian') || nameLower.includes('pizza') || nameLower.includes('pasta') || nameLower.includes('義式')) cuisineGuess.push('italian');
  if (nameLower.includes('thai') || nameLower.includes('泰式')) cuisineGuess.push('thai');
  if (nameLower.includes('korean') || nameLower.includes('bbq') || nameLower.includes('韓式')) cuisineGuess.push('korean');
  if (nameLower.includes('vietnamese') || nameLower.includes('pho') || nameLower.includes('越南')) cuisineGuess.push('vietnamese');

  // 處理照片
  let photoUrl = null;
  if (place.photos && place.photos.length > 0) {
    // 新版 API 的照片名稱格式為 "places/xxxxx/photos/yyyyy"
    // 我們需要自己組合出可以顯示的網址
    const photoName = place.photos[0].name;
    // 這裡我們暫時暴露 API Key 是為了顯示圖片，但我們之後可以設定 HTTP 來源限制來保護它
    const apiKeyForPhotos = 'AIzaSyBUqTZXhK9NfLmpCl04abAcxZej7LDdyGI'; 
    photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${CONFIG.PHOTO_MAX_WIDTH}&key=${apiKeyForPhotos}`;
  }

  return {
    id: place.id,
    place_id: place.id, // place_id 和 id 相同
    name: name,
    rating: place.rating || 0,
    price: convertPriceLevel(place.priceLevel), // convertPriceLevel 函式可以繼續使用
    address: place.formattedAddress || '',
    types: types,
    cuisines: cuisineGuess,
    location: place.location, // 新版 API 直接提供 { latitude, longitude }
    photoUrl: photoUrl,
    opening_hours: {
      open_now: place.regularOpeningHours ? place.regularOpeningHours.openNow : null,
      weekday_text: place.regularOpeningHours ? place.regularOpeningHours.weekdayDescriptions : null
    },
    website: place.websiteUri || null,
    googleMapsUrl: place.googleMapsUri || null,
    isSponsored: false // 您的資料中沒有贊助商資訊，所以設為 false
  };
}
// ====== 請複製到這裡結束 ======

// ✅ 延遲載入詳細資訊：只在用戶選擇餐廳時才呼叫
async function getPlaceDetails(placeId) {
  try {
    const { Place } = await google.maps.importLibrary("places");
    const place = new Place({
      id: placeId
    });
    // ✅ 正確的欄位名稱
    await place.fetchFields({
      fields: ['photos', 'websiteURI', 'googleMapsURI', 'regularOpeningHours']
    });
    console.log(`[API] Fetched details for place: ${placeId}`);
    
    // 取得營業時間文字
    let weekdayText = null;
    if (place.regularOpeningHours && place.regularOpeningHours.weekdayDescriptions) {
      weekdayText = place.regularOpeningHours.weekdayDescriptions;
    }
    
    // 再次檢查營業狀態
    let isCurrentlyOpen = null;
    try {
      if (typeof place.isOpen === 'function') {
        isCurrentlyOpen = place.isOpen();
      }
    } catch (e) {
      console.warn('[API] isOpen() failed:', e);
    }
    
    return {
      photos: place.photos || [],
      photoUrl: place.photos?.[0]?.getURI({ maxWidth: CONFIG.PHOTO_MAX_WIDTH }) || null,
      website: place.websiteURI || null,
      googleMapsUrl: place.googleMapsURI || null,
      opening_hours: {
        open_now: isCurrentlyOpen,
        weekday_text: weekdayText
      }
    };
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

// ====== DEMO DATA ======
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
    
    const openingHours = {
      open_now: i % 3 !== 0,
      weekday_text: [
        "星期一: 11:00 – 21:00", "星期二: 11:00 – 21:00", "星期三: 11:00 – 21:00",
        "星期四: 11:00 – 21:00", "星期五: 11:00 – 22:00", "星期六: 10:00 – 22:00",
        "星期日: 10:00 – 21:00"
      ]
    };
    return { 
      id, place_id: id, name: names[i%5] + ' ' + (i+1), rating, price, 
      address: "台北市信義區 Sample St. " + (i+1), types, cuisines,
      location: {lat: 25.04 + i*0.001, lng: 121.56 + i*0.001},
      photos: [], photoUrl: null, opening_hours: openingHours,
      website: websites[i % 5], isSponsored: isSponsored
    };
  });
}

// ====== UTILITIES ======
const $ = s => document.querySelector(s);
function t(k){ return I18N[lang][k]; }
function nameOf(r){ return r.name || "Unknown";
}
function saveFilters(){ 
  localStorage.setItem(CONFIG.STORAGE_KEYS.filters, JSON.stringify({ 
    // ✅ 移除 openNow
    minRating: filters.minRating, priceLevel: [...filters.priceLevel],
    distance: filters.distance, types: [...filters.types], cuisines: [...filters.cuisines] 
  }));
}
function applyTheme(theme){ 
  document.body.className = ""; 
  if(theme!=="classic"){ document.body.classList.add("theme-"+theme);
  } 
}

function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 20px)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function createOnboardingCard() {
  return { id: '__onboarding__', isOnboarding: true, type: 'onboarding' };
}

// ====== SKELETON ======
function showSkeletonLoader() {
  const stack = $("#stack");
  stack.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-box skeleton-photo"></div>
      <div class="skeleton-box skeleton-title"></div>
      <div class="skeleton-box skeleton-meta"></div>
      <div class="skeleton-chips">
        <div class="skeleton-box skeleton-chip"></div>
        <div class="skeleton-box skeleton-chip"></div>
        <div class="skeleton-box skeleton-chip"></div>
      </div>
    </div>
  `;
}

// ====== BUILD POOL ======
async function buildPool() {
  try {
    isLoading = true;
    setButtonsLoading(true);
    showSkeletonLoader();
    
    let allPlaces;
    
    if (CONFIG.DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      allPlaces = generateDemoData();
    } else {
      try {
        if (!userLocation) {
          showToast(lang === 'zh' ? '正在取得位置...' : 'Getting location...', 'info');
          await getUserLocation();
        }
        
        showToast(t('searching'), 'info');
        const places = await fetchNearbyPlaces(userLocation, filters.distance);
        
        if (places.length === 0) {
          allPlaces = [];
        } else {
          allPlaces = places.map(transformPlaceData);
        }
        
        localStorage.setItem('jiasa_cache', JSON.stringify({
          data: allPlaces,
          timestamp: Date.now(),
          location: userLocation
        }));
      } catch (error) {
        console.error('API error:', error);
        const cache = localStorage.getItem('jiasa_cache');
        if (cache) {
          const cached = JSON.parse(cache);
          if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
            showToast(t('usingCache'), 'offline');
            allPlaces = cached.data;
          } else {
            throw new Error('Cache expired and API unavailable');
          }
        } else {
          throw error;
        }
      }
    }
    
    window.allDemoData = allPlaces;
    // ✅ 前端篩選 - 加入除錯訊息
    pool = allPlaces.filter(r => {
      // ✅ 只保留明確「營業中」的餐廳，排除休息中或狀態未知的
      if (r.opening_hours?.open_now !== true) {
        console.log(`[Filter] Excluded ${r.name}: not open (status: ${r.opening_hours?.open_now})`);
        return false;
      }
      
       // 評分篩選
      if (r.rating < filters.minRating) return false;
      
      // 價格篩選
      if (filters.priceLevel.size > 0 && !filters.priceLevel.has(r.price)) return false;
      
      // 類型篩選
      if (filters.types.size > 0) {
        const hasMatchingType = r.types.some(t => filters.types.has(t));
        if (!hasMatchingType) return false;
      }
      
      // 料理風格篩選（前端用名稱模糊比對）
      if (filters.cuisines.size > 0) {
        const nameLower = r.name.toLowerCase();
        const addressLower = (r.address || '').toLowerCase();
        const searchText = nameLower + ' ' + addressLower;
        
        const cuMap = {
          japanese: ['japanese', 'sushi', 'ramen', '日式', '日本', '壽司', '拉麵'],
          chinese: ['chinese', 'dim sum', '中式', '中國', '港式', '粵菜'],
          italian: ['italian', 'pizza', 'pasta', '義式', '披薩', '義大利'],
          thai: ['thai', '泰式', '泰國'],
          korean: ['korean', 'bbq', '韓式', '韓國', '烤肉'],
          vietnamese: ['vietnamese', 'pho', '越南', '河粉'],
          western: ['western', 'steak', '西餐', '牛排'],
          vegetarian: ['vegetarian', 'vegan', '蔬食', '素食'],
          seafood: ['seafood', '海鮮'],
          bbq: ['bbq', 'barbecue', '燒烤', '烤肉'],
          hotpot: ['hotpot', 'hot pot', '火鍋'],
          noodles: ['noodle', '麵', '麵食']
        };
        const hasMatchingCuisine = Array.from(filters.cuisines).some(cuisine => {
          const keywords = cuMap[cuisine] || [cuisine];
          return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        });
        if (!hasMatchingCuisine) return false;
      }
      
      return true;
    });

    console.log(`[Filter] Results: ${pool.length} out of ${allPlaces.length} places`);
    
    const normalRestaurants = pool.filter(r => !r.isSponsored);
    const sponsoredRestaurants = pool.filter(r => r.isSponsored);
    const sortedNormal = recommender.sortPool(normalRestaurants);
    pool = sortedNormal;
    
    sponsoredRestaurants.forEach((sponsor, idx) => {
      const insertPos = 5 + (idx * 6);
      if (insertPos < pool.length) pool.splice(insertPos, 0, sponsor);
      else pool.push(sponsor);
    });
    if (!hasSeenOnboarding) {
      pool.unshift(createOnboardingCard());
    }
    
    index = 0;
    if (pool.length === 0) {
      showErrorState(t('noMatches'));
    }
    
    analytics.track('filter_apply', 'completed', { count: pool.length });
  } catch (error) {
    console.error('Build pool error:', error);
    
    let errorMessage = t('searchError');
    if (error.message === 'User denied Geolocation') {
      errorMessage = lang === 'zh' ? '需要位置權限才能搜尋餐廳' : 'Location permission required';
    } else if (error.message.includes('OVER_QUERY_LIMIT')) {
      errorMessage = lang === 'zh' ? 'API 配額已用盡，請稍後再試' : 'API quota exceeded, please try again later';
    } else if (error.message.includes('REQUEST_DENIED')) {
      errorMessage = lang === 'zh' ? 'API 請求被拒絕，請檢查設定' : 'API request denied, please check settings';
    }
    
    showErrorState(errorMessage);
    analytics.track('api_error', 'build_pool_failed', { error: error.message });
  } finally {
    isLoading = false;
    setButtonsLoading(false);
  }
}

function setButtonsLoading(loading) {
  $("#applySettings").disabled = loading;
  $("#btnSkip").disabled = loading;
  $("#btnChoose").disabled = loading;
}

function showErrorState(message) {
  const stack = $("#stack");
  // ✅ 特別處理「找不到營業中餐廳」的情況
  // ✅ 永遠檢查是否因為「只顯示營業中」導致沒結果
  const isOpenNowIssue = message.includes('符合條件');
  const hint = isOpenNowIssue ? 
    `<div style="color:var(--muted); font-size:13px; margin-top:4px;">💡 試試擴大搜尋範圍或稍後再試</div>` : '';
  stack.innerHTML = `
    <div class="empty-with-action">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${ICONS.search}
      </svg>
      <div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${message}</div>
      ${hint}

      <button class="btn primary" onclick="retryBuildPool()" style="min-width:120px;">${t('retry')}</button>
      <button class="btn" onclick="openModal()" style="min-width:120px;">${t('adjustFilters')}</button>
      ${CONFIG.DEMO_MODE ? '' : '<button class="btn" onclick="switchToDemoMode()" style="min-width:120px; margin-top:8px;">' + (lang === 'zh' ? '使用示範模式' : 'Use Demo Mode') + '</button>'}
    </div>
  `;
}

window.switchToDemoMode = function() {
  CONFIG.DEMO_MODE = true;
  window.allDemoData = generateDemoData();
  showToast(lang === 'zh' ? '已切換到示範模式' : 'Switched to demo mode', 'info');
  analytics.track('action', 'switch_demo_mode');
  retryBuildPool();
};
async function retryBuildPool() {
  analytics.track('action', 'retry_search');
  await buildPool();
  renderStack();
}

// ====== RENDERING (Part 1) ======
function updateThemeLabel() { 
  const lbl = $("#lblTheme");
  if(lbl) lbl.textContent = t("theme"); 
}

function updateThemeOptions() {
  const sel = $("#themeSelect");
  if (!sel) return;
  Array.from(sel.options).forEach(opt=>{
    const themeValue = opt.value; 
    if (!opt.getAttribute('data-zh')) {
      let zhText; 
      switch(themeValue){
        case'classic':zhText='經典';break;
        case'mocha':zhText='摩卡';break;
        case'olive':zhText='橄欖';break;
        case'sakura':zhText='櫻花';break;
        default:zhText=themeValue;
      }
      opt.setAttribute('data-zh', zhText);
    }
    opt.textContent = (lang==='zh') ? opt.getAttribute('data-zh') : (themeValue.charAt(0).toUpperCase() + themeValue.slice(1));
  });
}

function renderText(){
  $("#btnSkip").textContent=t("skip"); 
  $("#btnChoose").textContent=t("choose"); 
  $("#btnBackText").textContent=t("back"); 
  $("#btnFavText").textContent=t("fav");
  $("#btnMapText").textContent = t("openMap");
  $("#btnWebText").textContent = t("website");
  const btnUndo = $("#btnUndo"); 
  if (btnUndo) btnUndo.textContent = `↩︎ ${lang === 'zh' ? '撤回' : 'Undo'}`;
  $("#hintKeys").textContent=t("hintKeys");
  $("#mTitle").textContent=t("settings"); 
  $("#lblLang").textContent=t("language");
  $("#lblMinRating").textContent=t("minRating");
  $("#lblPrice").textContent=t("priceLevel");
  $("#lblDistance").textContent=t("distance");
  $("#lblTypes").textContent=t("types");
  $("#lblCuisine").textContent=t("cuisines");
  $("#hintRating").textContent=t("hintRating");
  $("#hintPrice").textContent=t("hintPrice");
  $("#hintDistance").textContent=t("hintDistance");
  $("#hintTypes").textContent=t("hintTypes");
  $("#hintCuisine").textContent=t("hintCuisine");
  $("#favTitle").textContent=t("favorites"); 
  $("#histTitle").textContent=t("history");
  $("#toggleHours").textContent = t("showHours");
  $("#offlineBadge").textContent = t("offline");
  $("#btnClearFilters").textContent = t("clearFilters");
  updateThemeLabel(); 
  updateThemeOptions();
  const applySpan = $("#applySettings").querySelector("span"); 
  if(applySpan) applySpan.textContent=t("apply");
  
  const navLabels = document.querySelectorAll('.nav-label');
  if (navLabels[0]) navLabels[0].textContent = t("navHome");
  if (navLabels[1]) navLabels[1].textContent = t("navFavorites");
  if (navLabels[2]) navLabels[2].textContent = t("navRefresh");
  if (navLabels[3]) navLabels[3].textContent = t("navHistory");
  if (navLabels[4]) navLabels[4].textContent = t("navSettings");
  if(pool.length > 0) renderStack();
}

function renderStack(){
  const stack=$("#stack"); 
  stack.innerHTML="";
  const topN = pool.slice(index, index+3);
  
  if(!topN.length){ 
    stack.innerHTML = `<div class="empty">${t("noMatches")}</div>`; 
    return;
  }
  
  const typeMap = I18N[lang].typeText;
  for(let j = Math.min(2, topN.length-1); j>=0; j--){
    const r = topN[j];
    const depth = j;
    const card=document.createElement("div"); 
    
    if (r.isOnboarding) {
      card.className="swipe-card onboard-card";
      const onboard = I18N[lang].onboard;
      const instructionsHTML = onboard.instructions.map(inst => `
        <div class="instruction-item">
          <div class="instruction-icon">${ICONS[inst.icon]}</div>
          <div class="instruction-text">
            <strong>${inst.title}</strong>
            <span>${inst.text}</span>
          </div>
        </div>
      `).join('');
      card.innerHTML = `
        <div class="onboard-content">
          <div class="onboard-title">${onboard.title}</div>
          <div class="onboard-subtitle">${onboard.subtitle}</div>
          ${instructionsHTML}
          <div class="swipe-hint-box">${onboard.swipeHint}</div>
        </div>
      `;
      if (j === 0) analytics.track('onboarding', 'view');
      
    } else {
      card.className = r.isSponsored ? "swipe-card sponsor-card" : "swipe-card";
      
      const title = nameOf(r); 
      const priceSymbols = '$'.repeat(Math.max(1, r.price || 1));
      const meta = `⭐ ${(r.rating || 0).toFixed(1)} • ${r.address || ''}`;
      
      const mainTypes = r.types.filter(t => typeMap[t]).slice(0, 5);
      const chips = mainTypes.map(t => `<span class="chip">${typeMap[t] || t}</span>`).join("");
      const priceChip = `<span class="chip" style="background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:#220b07; font-weight:800;">${priceSymbols}</span>`;
      const allChips = priceChip + chips;
      
      const photoHtml = r.photoUrl ? `<img src="${r.photoUrl}" class="card-photo" alt="${title}" loading="lazy"/>` : 
        `<div class="photo-placeholder">${ICONS.image}</div>`;
      const openBadge = r.opening_hours?.open_now ? `<span style="color:var(--ok); font-size:12px;">● ${t("nowOpen")}</span>` : 
                        r.opening_hours?.open_now === false ? `<span style="color:var(--bad); font-size:12px;">● ${t("nowClose")}</span>` : '';
      
      const sponsorBadge = r.isSponsored ? `<div class="sponsor-badge">${t("sponsor")}</div>` : '';
      card.innerHTML = `${sponsorBadge}
        <div class="badge like">${t("like")}</div>
        <div class="badge nope">${t("nope")}</div>
        ${photoHtml}
        <div class="title">${title}</div>
        <div class="meta">${meta}</div>
        <div class="row">${allChips}</div>
        ${openBadge ? `<div style="margin-top:4px;">${openBadge}</div>` : ''}`;
      
      if (r.isSponsored && j === 0) analytics.trackSponsor(r, 'view');
    }
    
    if (depth===1) { 
      card.style.transform = `translateY(${depth*8}px) scale(${1-depth*0.02})`;
      card.style.filter = "brightness(1.02)"; 
      card.style.boxShadow = "0 10px 30px rgba(0,0,0,.45)"; 
    } else { 
      card.style.transform=`translateY(${depth*8}px) scale(${1-depth*0.02})`;
    }
    
    card.style.opacity=1-depth*0.05;
    card.style.zIndex = String(100 - depth);
      
    if(j===0) attachDrag(card);
    stack.appendChild(card);
  }
  updateUndoBtn();
}

function show(screen){ 
  if(screen==="swipe"){ 
    $("#swipe").style.display="flex";
    $("#result").style.display="none"; 
    renderStack(); 
  } else { 
    $("#swipe").style.display="none"; 
    $("#result").style.display="block";
  } 
}

function renderBaseResult(r){
  const typeMap = I18N[lang].typeText;
  const rname = nameOf(r); 
  const rating = `⭐ ${(r.rating || 0).toFixed(1)}`; 
  const priceSymbols = '$'.repeat(Math.max(1, r.price || 1));
  const hero = $("#hero"); 
  if (r.photoUrl) {
    hero.src = r.photoUrl;
    hero.style.display = "block";
  } else {
    hero.style.display = "none";
  }
  
  const mainTypes = r.types.filter(t => typeMap[t]).slice(0, 5);
  const typeChips = mainTypes.map(t => `<span class="chip">${typeMap[t] || t}</span>`).join("");
  const priceChip = `<span class="chip" style="background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:#220b07; font-weight:800;">${priceSymbols}</span>`;
  const sponsorBadge = r.isSponsored ? `<div style="display:inline-block; background:linear-gradient(135deg, var(--sponsor), #ffed4e); color:#1b0f0a; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; margin-left:8px;">${t("sponsor")}</div>` : '';
  $("#resultBody").innerHTML = `<div class="title">${rname}${sponsorBadge}</div>
    <div class="meta" style="margin:6px 0 10px;">${rating}</div>
    <div class="row">${priceChip}${typeChips}</div>
    <div class="divider"></div>
    <div style="color:#ffe7d6;">${r.address || ''}</div>`;
    
  $("#gEnrich").innerHTML = ""; 
  
  const hoursBadge = $("#hoursBadge");
  const hoursBox = $("#hoursBox");
  const toggleHours = $("#toggleHours");
  if (r.opening_hours?.open_now !== undefined) {
    hoursBadge.textContent = r.opening_hours.open_now ? `● ${t("nowOpen")}` : `● ${t("nowClose")}`;
    hoursBadge.className = r.opening_hours.open_now ? "hours-badge open" : "hours-badge closed";
  } else {
    hoursBadge.textContent = "";
  }
  
  if (r.opening_hours?.weekday_text) {
    const hoursHTML = r.opening_hours.weekday_text.map(day => {
      const parts = day.split(': ');
      return `<div class="hours-row"><span class="hours-day">${parts[0]}</span><span>${parts[1] || ''}</span></div>`;
    }).join('');
    hoursBox.innerHTML = hoursHTML;
    toggleHours.style.display = "block";
  } else if (!CONFIG.DEMO_MODE && r.place_id && !r.isOnboarding) {
    // ✅ 只在用戶點擊時才載入詳細資訊（cost down）
    toggleHours.textContent = lang === 'zh' ? '載入營業時間...' : 'Loading hours...';
    toggleHours.style.display = "block";
    toggleHours.disabled = true;
    getPlaceDetails(r.place_id).then(details => {
      if (!details) {
        toggleHours.style.display = "none";
        return;
      }
      
      // 更新所有補充資訊
      if (details.opening_hours?.weekday_text) {
        const hoursHTML = details.opening_hours.weekday_text.map(day => {
          const parts = day.split(': ');
          return `<div class="hours-row"><span class="hours-day">${parts[0]}</span><span>${parts[1] || ''}</span></div>`;
        }).join('');
        hoursBox.innerHTML = hoursHTML;
        toggleHours.textContent = t("showHours");
        toggleHours.disabled = false;
        r.opening_hours = details.opening_hours;
      } else {
        toggleHours.style.display = "none";
      }
      
      if (details.website) {
        r.website = details.website;
        $("#btnWebsite").style.display = "flex";
        $("#btnWebsite").href = details.website;
      }
      
      if (details.googleMapsUrl) {
        r.googleMapsUrl = details.googleMapsUrl;
      }
      
      if (details.photoUrl && !r.photoUrl) {
        r.photoUrl = details.photoUrl;
        hero.src = r.photoUrl;
        hero.style.display = "block";
      }
      
      console.log(`[API] Details loaded for ${r.name}`);
    }).catch(error => {
      console.error('[API] Failed to load details:', error);
      toggleHours.style.display = "none";
    });
  } else {
    hoursBox.innerHTML = "";
    toggleHours.style.display = "none";
  }
  
  toggleHours.onclick = () => {
    hoursBox.classList.toggle("show");
    toggleHours.textContent = hoursBox.classList.contains("show") ? t("hideHours") : t("showHours");
  };
  
  hoursBox.classList.remove("show");
  
  $("#btnMap").disabled = false;
  $("#btnMap").onclick = ()=> {
    // ✅ 優先使用 Google 官方提供的 URL（這會開啟完整餐廳資訊頁）
    if (r.googleMapsUrl) {
      window.open(r.googleMapsUrl, "_blank");
    } 
    // 備用方案 1：使用 place_id + 名稱
    else if (r.place_id && r.name) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}&query_place_id=${r.place_id}`, "_blank");
    }
    // 備用方案 2：使用座標
    else if (r.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${r.location.lat},${r.location.lng}`, "_blank");
    } 
    // 最後備用：用名稱搜尋
    else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rname)}`, "_blank");
    }
    
    analytics.track('action', 'map_click', { place_id: r.id });
    if (r.isSponsored) analytics.trackSponsor(r, 'map');
  };
  
  const btnWebsite = $("#btnWebsite");
  if (r.website) {
    btnWebsite.style.display = "flex";
    btnWebsite.href = r.website;
    btnWebsite.onclick = () => {
      analytics.track('action', 'website_click', { place_id: r.id });
      if (r.isSponsored) analytics.trackSponsor(r, 'website');
    };
  } else {
    btnWebsite.style.display = "none";
  }
  
  analytics.track('result_view', r.id, { name: r.name });
}

function firstCharThumb(r){ return (nameOf(r)[0]||"•").toUpperCase(); }

function renderFavs(){
  const list = $("#favList");
  list.innerHTML="";
  if(!favs.length){ 
    list.innerHTML = `<div class="empty">${t("emptyFav")}</div>`; 
    return;
  }
  favs.forEach(id=>{
    const r = pool.find(x=>x.id===id) || (window.allDemoData && window.allDemoData.find(x=>x.id===id)); 
    if(!r) return;
    const row = document.createElement("div"); 
    row.className="list-item";
    const left = document.createElement("div"); 
    left.className="list-left";
    const thumb = document.createElement("div"); 
    thumb.className="thumb"; 
    
    if (r.photoUrl) {
      const img = document.createElement("img");
      img.src = r.photoUrl;
      thumb.appendChild(img);
    } else {
      thumb.textContent = firstCharThumb(r);
    }
    const textWrap = document.createElement("div"); 
    textWrap.style.minWidth="0";
    textWrap.innerHTML = `<div class="list-title">${nameOf(r)}</div><div class="list-meta">⭐ ${(r.rating||0).toFixed(1)} · ${'$'.repeat(r.price||1)}</div>`;
    left.appendChild(thumb); 
    left.appendChild(textWrap);
    const actions = document.createElement("div");
    actions.className="row-actions";
    const viewBtn = document.createElement("button"); 
    viewBtn.className="i-btn"; 
    viewBtn.textContent = t("view");
    const delBtn = document.createElement("button"); 
    delBtn.className="i-btn"; 
    delBtn.textContent = t("del");
    actions.appendChild(viewBtn); 
    actions.appendChild(delBtn);
    viewBtn.onclick = ()=>{ choose(r); closeAllModals(); };
    delBtn.onclick = ()=>{ 
      favs = favs.filter(x=>x!==id);
      localStorage.setItem(CONFIG.STORAGE_KEYS.favs, JSON.stringify(favs)); 
      renderFavs(); 
      analytics.track('fav_remove', r.id);
    };
    row.appendChild(left); 
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function addFav(r){ 
  if(!favs.includes(r.id)){ 
    favs.unshift(r.id);
    localStorage.setItem(CONFIG.STORAGE_KEYS.favs, JSON.stringify(favs)); 
    analytics.track('fav_add', r.id);
    showToast(t('favoriteAdded'), 'success');
  } 
}

function renderHistory(){
  const list = $("#histList");
  list.innerHTML="";
  if(!history.length){ 
    list.innerHTML = `<div class="empty">${t("emptyHist")}</div>`; 
    return;
  }
  history.forEach(item=>{
    const r = pool.find(x=>x.id===item.id) || (window.allDemoData && window.allDemoData.find(x=>x.id===item.id)); 
    if(!r) return;
    const row = document.createElement("div"); 
    row.className="list-item";
    const left = document.createElement("div"); 
    left.className="list-left";
    const thumb = document.createElement("div"); 
    thumb.className="thumb"; 
    
    if (r.photoUrl) {
      const img = document.createElement("img");
      img.src = r.photoUrl;
      thumb.appendChild(img);
    } else {
      thumb.textContent = firstCharThumb(r);
    }
    const timeStr = new Date(item.ts).toLocaleString(lang==="zh"?"zh-TW":"en-US");
    const textWrap = document.createElement("div"); 
    textWrap.style.minWidth="0";
    textWrap.innerHTML = `<div class="list-title">${nameOf(r)}</div><div class="list-meta">${timeStr}</div>`;
    left.appendChild(thumb); 
    left.appendChild(textWrap);
    const actions = document.createElement("div"); 
    actions.className="row-actions";
    const viewBtn = document.createElement("button"); 
    viewBtn.className="i-btn"; 
    viewBtn.textContent = t("view");
    const delBtn = document.createElement("button"); 
    delBtn.className="i-btn";
    delBtn.textContent = t("del");
    actions.appendChild(viewBtn); 
    actions.appendChild(delBtn);
    viewBtn.onclick = ()=>{ choose(r); closeAllModals(); };
    delBtn.onclick = ()=>{ 
      history = history.filter(x=>x.ts!==item.ts); 
      localStorage.setItem(CONFIG.STORAGE_KEYS.hist, JSON.stringify(history)); 
      renderHistory(); 
    };
    row.appendChild(left); 
    row.appendChild(actions);
    list.appendChild(row);
  });
}

// ====== MODALS ======
function setFocusToCloseButton(modalId) {
  setTimeout(() => {
    let closeBtn;
    if (modalId === 'modal') closeBtn = $("#btnClose");
    else if (modalId === 'favModal') closeBtn = $("#favClose");
    else if (modalId === 'histModal') closeBtn = $("#histClose");
    if (closeBtn) closeBtn.focus();
  }, 100);
}

function closeAllModals(){
  document.querySelectorAll('.modal.active, .overlay.active').forEach(el => el.classList.remove('active'));
  if(staged && !staged.applied){
    lang = staged.original.lang;
    currentTheme = staged.original.theme;
    applyTheme(currentTheme);
    renderText();
  }
  staged = null;
  updateNavActive('navHome');
}

function updateNavActive(activeId) {
  ['navHome', 'navFavs', 'navHistory', 'navSettings'].forEach(id => {
    const el = $("#" + id);
    if (el) {
      if (id === activeId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

function openModal(){
  closeAllModals();
  staged = {
    original: { lang, theme: currentTheme },
    preview: { lang, theme: currentTheme },
    filters: { 
      // ✅ 移除 openNow
      minRating: filters.minRating, priceLevel: new Set(filters.priceLevel),
      distance: filters.distance, types: new Set(filters.types), cuisines: new Set(filters.cuisines) 
    },
    applied: false
  };
  $("#overlay").classList.add("active"); 
  $("#modal").classList.add("active");
  syncUIFromStaged();
  setFocusToCloseButton('modal');
  analytics.track('modal_open', 'settings');
}

function syncUIFromStaged(){
  $("#langSelModal").value = staged.preview.lang;
  $("#themeSelect").value = staged.preview.theme;
  const ratingSlider = $("#minRating");
  ratingSlider.value = staged.filters.minRating;
  $("#ratingShow").textContent = staged.filters.minRating.toFixed(1) + "+";
  updateSliderBackground(ratingSlider);

  const distanceSlider = $("#distance");
  distanceSlider.value = staged.filters.distance;
  $("#distanceShow").textContent = "≤ " + staged.filters.distance + "m";
  updateSliderBackground(distanceSlider);
  
  renderText();
  renderOptionPillsFromStaged();
}

function renderOptionPillsFromStaged(){
  const typeKeys = ["restaurant", "cafe", "bar", "bakery", "meal_takeaway", "meal_delivery"];
  const cuisineKeys = ["japanese", "chinese", "italian", "thai", "korean", "vietnamese", "western", "vegetarian", "seafood", "bbq", "hotpot", "noodles"];
  const priceKeys = [1, 2, 3, 4];
  const priceLabels = ['$', '$$', '$$$', '$$$$'];
  
  const typesRow = $("#typesRow");
  const cuRow = $("#cuisineRow");
  const priceRow = $("#priceRow");
  typesRow.innerHTML=""; 
  cuRow.innerHTML="";
  priceRow.innerHTML="";
  
  const currentLang = staged ? staged.preview.lang : lang;
  const typeMap = I18N[currentLang].typeText;
  const cuMap = I18N[currentLang].cuText;
  
  priceKeys.forEach((level, idx)=>{
    const btn = document.createElement("button"); 
    btn.className="pill"; 
    btn.textContent=priceLabels[idx];
    if(staged.filters.priceLevel.has(level)){  // ✅ 複選判斷
      btn.style.background="linear-gradient(180deg, var(--primary), var(--primary-2))"; 
      btn.style.color="#220b07"; 
    }
    btn.onclick = ()=>{  // ✅ 複選邏輯
      if(staged.filters.priceLevel.has(level)) {
        staged.filters.priceLevel.delete(level);
      } else {
        staged.filters.priceLevel.add(level);
      }
      renderOptionPillsFromStaged(); 
    };
    priceRow.appendChild(btn);
  });
  typeKeys.forEach(k=>{
    const btn = document.createElement("button"); 
    btn.className="pill"; 
    btn.textContent=typeMap[k] || k;
    if(staged.filters.types.has(k)){ 
      btn.style.background="linear-gradient(180deg, var(--primary), var(--primary-2))"; 
      btn.style.color="#220b07"; 
    }
    btn.onclick = ()=>{ 
      if(staged.filters.types.has(k)) staged.filters.types.delete(k); 
      else staged.filters.types.add(k); 
      renderOptionPillsFromStaged(); 
    };
    typesRow.appendChild(btn);
  });
  cuisineKeys.forEach(k=>{
    const btn = document.createElement("button"); 
    btn.className="pill"; 
    btn.textContent=cuMap[k] || k;
    if(staged.filters.cuisines.has(k)){ 
      btn.style.background="linear-gradient(180deg, var(--primary), var(--primary-2))"; 
      btn.style.color="#220b07"; 
    }
    btn.onclick = ()=>{ 
      if(staged.filters.cuisines.has(k)) staged.filters.cuisines.delete(k); 
      else staged.filters.cuisines.add(k); 
      renderOptionPillsFromStaged(); 
    };
    cuRow.appendChild(btn);
  });
}

function clearAllFilters() {
  if (!staged) return;
  staged.filters.minRating = CONFIG.DEFAULT_FILTERS.minRating;
  staged.filters.priceLevel.clear();
  // ✅ 改成 clear()
  staged.filters.distance = CONFIG.DEFAULT_FILTERS.distance;
  staged.filters.types.clear();
  staged.filters.cuisines.clear();
  syncUIFromStaged();
  showToast(t('filtersCleared'), 'success');
  analytics.track('filters', 'clear_all');
}

function openFavModal(){
  closeAllModals();
  $("#favOverlay").classList.add("active"); 
  $("#favModal").classList.add("active");
  $("#btnFavs").classList.add("active");
  renderFavs();
  setFocusToCloseButton('favModal');
  analytics.track('modal_open', 'favorites');
}

function openHistModal(){
  closeAllModals();
  $("#histOverlay").classList.add("active"); 
  $("#histModal").classList.add("active");
  $("#btnHistory").classList.add("active");
  renderHistory();
  setFocusToCloseButton('histModal');
  analytics.track('modal_open', 'history');
}

// ====== SWIPE ======
function attachDrag(card){
  const likeBadge = card.querySelector('.badge.like');
  const nopeBadge = card.querySelector('.badge.nope');
  const DIST_THRESHOLD = 90, FLICK_VX = 0.55, MAX_ROT = 18, SCALE_GAIN = 0.02;
  let dragging=false, startX=0, lastX=0, lastT=0, vx=0;
  
  const onStart = (x)=>{ 
    dragging=true; startX=lastX=x;
    lastT=performance.now(); 
    card.style.transition="none"; 
    if(likeBadge) likeBadge.style.opacity=0; 
    if(nopeBadge) nopeBadge.style.opacity=0; 
  };
  
  const onMove = (x)=>{
    if(!dragging) return;
    const now=performance.now(); 
    const dx=x-lastX; const dt=Math.max(1, now-lastT); 
    vx=dx/dt; lastX=x; lastT=now;
    const offset = x - startX;
    const prog = Math.min(1, Math.abs(offset)/150); 
    const rot=(offset/150)*MAX_ROT; 
    const scale=1+prog*SCALE_GAIN;
    card.style.transform = `translate(${offset}px,0) rotate(${rot}deg) scale(${scale})`; 
    card.style.opacity = String(Math.max(0.35, 1 - Math.abs(offset)/320));
    if(likeBadge && nopeBadge) {
      if(offset>0){ likeBadge.style.opacity=prog; nopeBadge.style.opacity=0;
      } 
      else { likeBadge.style.opacity=0; nopeBadge.style.opacity=prog;
      }
    }
  };
  const flyOut = (liked)=>{
    const toX = liked ? 480 : -480;
    card.style.transition = REDUCED ? "transform .18s ease-out" : "transform .18s cubic-bezier(.2,.8,.2,1)";
    card.style.transform = `translate(${toX}px,0) rotate(${liked?15:-15}deg)`;
    if(navigator.vibrate) try{ navigator.vibrate(12);
    }catch(e){}
    setTimeout(()=> nextCard(liked), 160);
  };
  const springBack = ()=>{ 
    card.style.transition = REDUCED ? "transform .15s ease-out" : "transform .38s cubic-bezier(.2,.8,.2,1)"; 
    card.style.transform = ""; card.style.opacity="1"; 
    if(likeBadge) likeBadge.style.opacity=0; 
    if(nopeBadge) nopeBadge.style.opacity=0; 
  };
  const onEnd = ()=>{ 
    if(!dragging) return; 
    dragging=false;
    const total = lastX - startX; 
    if (Math.abs(total) > DIST_THRESHOLD || Math.abs(vx) > FLICK_VX) flyOut(total>0); 
    else springBack(); 
  };
  const moveHandler = (e)=> onMove(e.clientX);
  const upHandler = ()=>{ 
    onEnd(); 
    window.removeEventListener('mousemove', moveHandler);
    window.removeEventListener('mouseup', upHandler); 
  };
  
  card.onmousedown = (e)=>{ 
    onStart(e.clientX); 
    window.addEventListener('mousemove', moveHandler, {passive:true});
    window.addEventListener('mouseup', upHandler, {once:true}); 
  };
  card.ontouchstart = (e)=> onStart(e.touches[0].clientX);
  card.ontouchmove = (e)=> onMove(e.touches[0].clientX);
  card.ontouchend = onEnd;
}

// ====== FLOW ======
function choose(r){
  if (r.isOnboarding) {
    hasSeenOnboarding = true;
    localStorage.setItem(CONFIG.STORAGE_KEYS.onboarding, "true");
    analytics.track('onboarding', 'complete');
    index++;
    renderStack();
    return;
  }
  
  current = r;
  history.unshift({id:r.id, ts: Date.now()}); 
  history = history.slice(0,50); 
  localStorage.setItem(CONFIG.STORAGE_KEYS.hist, JSON.stringify(history));
  
  const chosenIndex = pool.findIndex(item => item.id === r.id);
  if (chosenIndex !== -1) { 
    pool.splice(chosenIndex, 1);
    if (index >= pool.length && pool.length > 0) index = 0; 
    if (pool.length === 0) index = 0;
  }
  undoSlot = null; 
  updateUndoBtn();
  
  analytics.trackSwipe(r, 'like');
  recommender.learn(r, true);
  if (r.isSponsored) analytics.trackSponsor(r, 'like');
  
  renderBaseResult(r); 
  show("result");
}

function nextCard(liked){
  const r = pool[index]; 
  if(!r){ return;
  }
  
  if (r.isOnboarding) {
    hasSeenOnboarding = true;
    localStorage.setItem(CONFIG.STORAGE_KEYS.onboarding, "true");
    analytics.track('onboarding', liked ? 'liked' : 'skipped');
    index++;
    renderStack();
    return;
  }
  
  if(!liked){ 
    undoSlot = { indexBefore: index };
    analytics.trackSwipe(r, 'skip');
    recommender.learn(r, false);
  } else { 
    undoSlot = null;
  }
  
  if(liked){ choose(r); return;
  }
  index = (index+1) % pool.length; 
  renderStack(); 
  updateUndoBtn();
}

function updateUndoBtn(){ $("#btnUndo").disabled = !undoSlot; }

// ====== KEYBOARD NAV ======
function setupKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const anyModalOpen = document.querySelector('.modal.active');
      if (anyModalOpen) {
        closeAllModals();
        analytics.track('keyboard_action', 'escape');
      }
    }
    
    if (!document.querySelector('.modal.active')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        $("#btnSkip").click();
        analytics.track('keyboard_action', 'arrow_left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        $("#btnChoose").click();
        analytics.track('keyboard_action', 'arrow_right');
      } else if (e.key === 'ArrowUp' && undoSlot) {
        e.preventDefault();
        $("#btnUndo").click();
        analytics.track('keyboard_action', 'arrow_up');
      }
    }
  });
}

// ====== SLIDER BACKGROUND ======
function updateSliderBackground(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const percentage = ((val - min) / (max - min)) * 100;
  // Rating slider: gray on left (filtered out), colored on right (included)
  // Distance slider: colored on left (within range), gray on right (excluded)
  if (slider.id === 'distance') {
    slider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--disabled) ${percentage}%, var(--disabled) 100%)`;
  } else {
    slider.style.background = `linear-gradient(to right, var(--disabled) 0%, var(--disabled) ${percentage}%, var(--primary) ${percentage}%, var(--primary) 100%)`;
  }
}

// ====== INIT ======
document.addEventListener('DOMContentLoaded', async ()=>{
  console.log('[Jiasa] Initializing...');
  
  // ========== 開場動畫控制 ==========
  const splashScreen = document.getElementById('splashScreen');
  const hasSeenSplash = sessionStorage.getItem('jiasa_seen_splash');
  
  if (!hasSeenSplash) {
    // 第一次訪問 - 顯示完整動畫（3秒）
    setTimeout(() => {
      splashScreen.classList.add('fade-out');
      setTimeout(() => {
        splashScreen.style.display = 'none';
      }, 500);
      sessionStorage.setItem('jiasa_seen_splash', 'true');
    }, 3000);
  } else {
    // 已經看過 - 立即隱藏
    splashScreen.style.display = 'none';
  }
  
  // =====================================
  
  // Wait for Google Maps API
  if (!CONFIG.DEMO_MODE) {
    await new Promise(resolve => {
      if (window.google?.maps?.importLibrary) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (window.google?.maps?.importLibrary) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        setTimeout(() => { 
          clearInterval(checkInterval); 
          console.warn('[Jiasa] API load timeout');
          resolve(); 
        }, 10000);
      }
    });
    
    if (window.google?.maps?.importLibrary) {
      await initPlacesService();
      console.log('[Jiasa] Google Places Service initialized');
    } else {
      console.error('[Jiasa] Google Maps API failed to load');
      CONFIG.DEMO_MODE = true; // 自動切換到 demo 模式
    }
  }
  
  if (CONFIG.DEMO_MODE) {
    window.allDemoData = generateDemoData();
  } else {
    window.allDemoData = [];
  }
  
  applyTheme(currentTheme); 
  renderText();
  setupKeyboardNav();

  updateSliderBackground($("#minRating"));
  updateSliderBackground($("#distance"));
  
  analytics.track('app_open', navigator.userAgent);
  await buildPool();
  renderStack();

  // Event handlers
  $("#navHome").addEventListener('click', () => {
    if ($("#swipe").style.display === "none") {
      show('swipe');
      renderStack();
    }
    closeAllModals();
    updateNavActive('navHome');
    analytics.track('nav', 'home');
  });
  $("#navFavs").addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openFavModal();
    updateNavActive('navFavs');
    analytics.track('nav', 'favorites');
  });
  $("#navRefresh").addEventListener('click', async () => {
    if (isLoading) return;
    showToast(t('refreshing'), 'info');
    analytics.track('nav', 'refresh');
    await buildPool();
    renderStack();
    showToast(t('refreshed'), 'success');
  });
  $("#navHistory").addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHistModal();
    updateNavActive('navHistory');
    analytics.track('nav', 'history');
  });
  $("#navSettings").addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal();
    updateNavActive('navSettings');
    analytics.track('nav', 'settings');
  });
  $("#btnClose").addEventListener('click', closeAllModals);
  $("#favClose").addEventListener('click', closeAllModals);
  $("#histClose").addEventListener('click', closeAllModals);

  $("#overlay").addEventListener('click', (e) => { if (e.target === $("#overlay")) closeAllModals(); });
  $("#favOverlay").addEventListener('click', (e) => { if (e.target === $("#favOverlay")) closeAllModals(); });
  $("#histOverlay").addEventListener('click', (e) => { if (e.target === $("#histOverlay")) closeAllModals(); });
  $("#langSelModal").addEventListener("change", (e)=>{
    if(!staged) return;
    staged.preview.lang = e.target.value;
    lang = staged.preview.lang;
    renderText();
    renderOptionPillsFromStaged();
  });
  $("#themeSelect").addEventListener("change", (e)=>{
    if(!staged) return;
    staged.preview.theme = e.target.value;
    currentTheme = staged.preview.theme;
    applyTheme(staged.preview.theme);
  });
  $("#minRating").addEventListener("input", (e)=>{ 
    if(!staged) return; 
    staged.filters.minRating = +e.target.value; 
    $("#ratingShow").textContent = (+e.target.value).toFixed(1) + "+"; 
    updateSliderBackground(e.target); 
  });
  $("#distance").addEventListener("input", (e)=>{ 
    if(!staged) return; 
    staged.filters.distance = +e.target.value; 
    $("#distanceShow").textContent = "≤ " + e.target.value + "m"; 
    updateSliderBackground(e.target); 
  });
  $("#btnClearFilters").addEventListener("click", clearAllFilters);

  $("#applySettings").addEventListener("click", async ()=>{
    if(!staged) return;
    
    lang = staged.preview.lang; 
    localStorage.setItem(CONFIG.STORAGE_KEYS.lang, lang);
    currentTheme = staged.preview.theme; 
    localStorage.setItem(CONFIG.STORAGE_KEYS.theme, currentTheme); 
    applyTheme(currentTheme);
    
    filters.minRating = staged.filters.minRating;
    filters.priceLevel = new Set(staged.filters.priceLevel); 
    // ✅ 改這裡
    filters.distance = staged.filters.distance;
    filters.types = new Set(staged.filters.types); 
    filters.cuisines = new Set(staged.filters.cuisines);
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.configured, "true"); 
    saveFilters();
    hasConfigured = true; 
    
    staged.applied = true; 
    
    closeAllModals();
    
    show('swipe');
    renderText();
    
    await buildPool();
    renderStack();
  });
  $("#btnSkip").onclick = ()=> nextCard(false);
  $("#btnChoose").onclick = ()=> nextCard(true);
  $("#btnUndo").onclick = ()=>{ 
    if(!undoSlot) return;
    index = undoSlot.indexBefore; 
    undoSlot = null; 
    renderStack(); 
    updateUndoBtn();
    analytics.track('action', 'undo');
  };
  $("#btnBack").onclick = ()=>{ show("swipe"); renderStack(); };
  $("#btnFav").onclick = ()=>{ 
    if(current){ addFav(current);
    } 
    show("swipe"); 
    renderStack(); 
  };
  window.addEventListener('beforeunload', () => {
    const stats = analytics.getStats();
    analytics.track('session_end', 'app_close', stats);
  });
  console.log('[Jiasa] Initialized successfully');
});

// 新增：Service Worker 註冊
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}