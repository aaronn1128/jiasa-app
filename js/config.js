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
    analytics: 'jiasa_analytics',
    onboarding: 'jiasa_seen_onboarding'
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
    back:"返回",
    hintKeys:"提示：可以左右滑動卡片", 
    noMatches:"沒有符合條件的店家", 
    retry:"重試", 
    adjustFilters:"調整篩選", 
    favorites:"收藏清單", 
    fav:"收藏",
    history:"歷史紀錄", 
    theme:"主題", 
    apply:"套用", 
    clearFilters:"清除全部", 
    searching:"搜尋中...", 
    searchError:"搜尋失敗", 
    filtersCleared:"已清除所有篩選",
    favoriteAdded:"已加入收藏",
    navHome: "首頁", 
    navFavorites: "收藏", 
    navRefresh: "刷新", 
    navHistory: "歷史", 
    navSettings: "設定",
    lblDistance: "搜尋距離", 
    lblCategory: "類型",
    lblFilters: "篩選條件",
    undo: "撤回",
    like: "選這家",
    nope: "略過",
    openMap: "開地圖",
    website: "官網",
    nowOpen: "營業中",
    nowClose: "休息中",
    showHours: "顯示營業時間",
    hideHours: "收起營業時間",
    emptyFav: "尚未收藏",
    emptyHist: "尚無紀錄",
    view: "查看",
    del: "刪除",
    sponsor: "贊助",
    onboard: {
      title: "歡迎使用 Jiasa",
      subtitle: "用滑的找餐廳，超簡單",
      instructions: [
        { icon: "settings", title: "設定條件", text: "點右上角設定預算、距離和喜好" },
        { icon: "swipeBoth", title: "滑動選擇", text: "左滑略過，右滑選擇喜歡的餐廳" },
        { icon: "heart", title: "收藏管理", text: "把喜歡的餐廳加入收藏清單" },
        { icon: "map", title: "查看資訊", text: "選定後可查看地圖、營業時間等" }
      ],
      swipeHint: "滑動卡片開始探索"
    }
  },
  en: { 
    settings:"Settings", 
    language:"Language", 
    skip:"Skip", 
    choose:"Choose", 
    back:"Back",
    hintKeys:"Tip: swipe or use arrow keys.", 
    noMatches:"No matches found", 
    retry:"Retry", 
    adjustFilters:"Adjust Filters", 
    favorites:"Favorites", 
    fav:"Favorite",
    history:"History", 
    theme:"Theme", 
    apply:"Apply", 
    clearFilters:"Clear All",
    searching:"Searching...", 
    searchError:"Search failed", 
    filtersCleared:"All filters cleared",
    favoriteAdded:"Added to favorites",
    navHome: "Home", 
    navFavorites: "Favorites", 
    navRefresh: "Refresh", 
    navHistory: "History", 
    navSettings: "Settings",
    lblDistance: "Search Radius", 
    lblCategory: "Category",
    lblFilters: "Filters",
    undo: "Undo",
    like: "Choose",
    nope: "Skip",
    openMap: "Open Map",
    website: "Website",
    nowOpen: "Open now",
    nowClose: "Closed",
    showHours: "Show hours",
    hideHours: "Hide hours",
    emptyFav: "No favorites yet",
    emptyHist: "No history yet",
    view: "View",
    del: "Delete",
    sponsor: "Sponsor",
    onboard: {
      title: "Welcome to Jiasa",
      subtitle: "Swipe to find restaurants",
      instructions: [
        { icon: "settings", title: "Set Preferences", text: "Tap settings to configure budget, distance & preferences" },
        { icon: "swipeBoth", title: "Swipe to Choose", text: "Swipe left to skip, right to select restaurants" },
        { icon: "heart", title: "Save Favorites", text: "Add restaurants you like to favorites list" },
        { icon: "map", title: "View Details", text: "Check map, hours, and more info after selection" }
      ],
      swipeHint: "Swipe to start exploring"
    }
  }
};

// ✅ 新增：Icons
export const ICONS = {
  settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.65 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.77 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.51.39 1.05.7 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.24 1.12-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58z"/><circle cx="12" cy="12" r="3.2"/></svg>`,
  swipeBoth: `<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7M12 19l-7-7 7-7"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
};
