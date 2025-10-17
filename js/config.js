// js/config.js
export const CONFIG = {
  API_TIMEOUT: 10000,
  API_MAX_RETRIES: 2,
  CACHE_TTL: 4 * 60 * 60 * 1000,
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
  // ✅ 更新: 定義篩選器選項
  FILTER_OPTIONS: {
    distance: [
      { label: '300m', value: 300 },
      { label: '500m', value: 500 },
      { label: '1km', value: 1000 },
      { label: '1.5km', value: 1500 },
      { label: '2km', value: 2000 },
    ],
    category: [
      { label_zh: '餐廳', label_en: 'Restaurant', value: 'restaurant' },
      { label_zh: '下午茶＆輕食', label_en: 'Cafe & Dessert', value: 'cafe_dessert' },
      { label_zh: '酒吧', label_en: 'Bar', value: 'bar' },
    ]
  },
  // ✅ 更新: 簡化預設篩選器
  DEFAULT_FILTERS: {
    distance: 500,
    category: 'restaurant',
  }
};

export const I18N = {
  zh: { 
    settings:"設定", language:"語言", skip:"略過", choose:"選這家", back:"返回", hintKeys:"提示：可以左右滑動卡片，或用 ← → 鍵操作。", 
    noMatches:"沒有符合條件的店家", retry:"重試", adjustFilters:"調整篩選", hours:"營業時間", favorites:"收藏清單", fav:"收藏", 
    history:"歷史紀錄", emptyFav:"尚未收藏", emptyHist:"尚無紀錄", like:"選這家", nope:"略過", openMap:"開地圖", website:"官網", 
    nowOpen:"營業中", nowClose:"休息中", hoursUnknown:"營業時間未提供", view:"查看", del:"刪除", showHours:"顯示營業時間", 
    hideHours:"收起營業時間", theme:"主題", apply:"套用", clearFilters:"清除全部", 
    searching:"搜尋中...", searchError:"搜尋失敗", offline:"目前離線", usingCache:"使用快取資料", 
    refreshing:"更新中...", filtersCleared:"已清除所有篩選", favoriteAdded:"已加入收藏", onlineAgain:"已恢復連線", refreshed:"已更新",
    navHome: "首頁", navFavorites: "收藏", navRefresh: "刷新", navHistory: "歷史", navSettings: "設定",
    lblDistance: "搜尋距離", lblCategory: "類型"
  },
  en: { 
    settings:"Settings", language:"Language", skip:"Skip", choose:"Choose", back:"Back", hintKeys:"Tip: swipe or use ← → keys.", 
    noMatches:"No matches", retry:"Retry", adjustFilters:"Adjust Filters", hours:"Hours", favorites:"Favorites", fav:"Favorite", 
    history:"History", emptyFav:"No favorites yet", emptyHist:"No history yet", like:"Choose", nope:"Skip", openMap:"Open Map", 
    website:"Website", nowOpen:"Open now", nowClose:"Closed", hoursUnknown:"Hours not available", view:"View", del:"Delete", 
    showHours:"Show hours", hideHours:"Hide hours", theme:"Theme", apply:"Apply", clearFilters:"Clear All",
    searching:"Searching...", searchError:"Search failed", offline:"Offline", usingCache:"Using cached data", 
    refreshing:"Refreshing...", filtersCleared:"All filters cleared", favoriteAdded:"Added to favorites", onlineAgain:"Back online", refreshed:"Refreshed",
    navHome: "Home", navFavorites: "Favorites", navRefresh: "Refresh", navHistory: "History", navSettings: "Settings",
    lblDistance: "Search Radius", lblCategory: "Category"
  }
};
