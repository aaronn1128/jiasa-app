// js/config.js
export const CONFIG = {
  API_TIMEOUT: 10000,
  PHOTO_MAX_WIDTH: 800,
  STORAGE_KEYS: {
    lang: 'jiasa_lang',
    theme: 'jiasa_theme',
    filters: 'jiasa_filters',
    favs: 'jiasa_favs',
    hist: 'jiasa_hist',
    preferences: 'jiasa_preferences',
    analytics: 'jiasa_analytics'
  },
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
  DEFAULT_FILTERS: {
    distance: 500,
    category: 'restaurant',
  }
};

export const I18N = {
  zh: { 
    settings:"設定", 
    language:"語言", 
    skip:"略過", 
    choose:"選這家", 
    hintKeys:"提示：可以左右滑動卡片", 
    noMatches:"沒有符合條件的店家", 
    retry:"重試", 
    adjustFilters:"調整篩選", 
    favorites:"收藏清單", 
    history:"歷史紀錄", 
    theme:"主題", 
    apply:"套用", 
    clearFilters:"清除全部", 
    searching:"搜尋中...", 
    searchError:"搜尋失敗", 
    filtersCleared:"已清除所有篩選",
    navHome: "首頁", 
    navFavorites: "收藏", 
    navRefresh: "刷新", 
    navHistory: "歷史", 
    navSettings: "設定",
    lblDistance: "搜尋距離", 
    lblCategory: "類型",
    lblFilters: "篩選條件",
    undo: "撤回",
    like: "喜歡",
    nope: "略過"
  },
  en: { 
    settings:"Settings", 
    language:"Language", 
    skip:"Skip", 
    choose:"Choose", 
    hintKeys:"Tip: swipe or use arrow keys.", 
    noMatches:"No matches found", 
    retry:"Retry", 
    adjustFilters:"Adjust Filters", 
    favorites:"Favorites", 
    history:"History", 
    theme:"Theme", 
    apply:"Apply", 
    clearFilters:"Clear All",
    searching:"Searching...", 
    searchError:"Search failed", 
    filtersCleared:"All filters cleared",
    navHome: "Home", 
    navFavorites: "Favorites", 
    navRefresh: "Refresh", 
    navHistory: "History", 
    navSettings: "Settings",
    lblDistance: "Search Radius", 
    lblCategory: "Category",
    lblFilters: "Filters",
    undo: "Undo",
    like: "Like",
    nope: "Nope"
  }
};