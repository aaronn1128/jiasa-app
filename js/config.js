// js/config.js
// 職責：存放所有不會變動的設定資料，如 API 設定、圖示、多國語言文字。

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
  DEFAULT_FILTERS: {
    // 免費版預設：距離 & 類型（其餘保留結構相容）
    distance: 500,                 // 300 / 500 / 1000 / 1500 / 2000
    category: 'restaurant',        // 'restaurant' | 'cafe_dessert' | 'bar'

    // 以下欄位先保留，讓 state / UI 舊程式不會炸（免費版不使用）
    minRating: 0,
    priceLevel: [],
    types: [],
    cuisines: []
  }
};

export const ICONS = {
  settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.24-1.12.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.65 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.77 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.51.39 1.05.7 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.58-.24 1.12-.55-1.63.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58z"/><circle cx="12" cy="12" r="3.2"/></svg>`,
  swipeBoth: `<svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7M12 19l-7-7 7-7"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
};

export const I18N = {
  zh: { 
    settings:"設定", language:"語言", skip:"略過", choose:"選這家", back:"返回", hintKeys:"提示：可以左右滑動卡片，或用 ← → 鍵操作。", noMatches:"沒有符合條件的店家", retry:"重試", adjustFilters:"調整篩選", hours:"營業時間", distance:"搜尋距離（需允許定位權限。）", favorites:"收藏清單", fav:"收藏", history:"歷史紀錄", emptyFav:"尚未收藏", emptyHist:"尚無紀錄", like:"選這家", nope:"略過", openMap:"開地圖", website:"官網", nowOpen:"營業中", nowClose:"休息中", hoursUnknown:"營業時間未提供", view:"查看", del:"刪除", showHours:"顯示營業時間", hideHours:"收起營業時間", theme:"主題", apply:"套用", clearFilters:"清除全部", minRating:"最低評分（只顯示評分高於此值的餐廳。）", priceLevel:"價格範圍（$ 便宜 | $$ 中等 | $$$ 較貴 | $$$$ 昂貴）", types:"餐廳類型（未選表示全部。）", cuisines:"料理風格（作為搜尋關鍵字使用。）", hintRating:"只顯示評分高於此值的餐廳。", hintPrice:"$ 便宜 | $$ 中等 | $$$ 較貴 | $$$$ 昂貴", hintDistance:"需允許定位權限。", hintTypes:"可選擇多個類型，未選表示全部。", hintCuisine:"作為搜尋關鍵字使用。", typeText:{ restaurant:"餐廳", cafe:"咖啡廳", bar:"酒吧", bakery:"烘焙坊", meal_takeaway:"外帶", meal_delivery:"外送" }, cuText:{ japanese:"日式", chinese:"中式", italian:"義式", thai:"泰式", korean:"韓式", vietnamese:"越南", western:"西餐", vegetarian:"蔬食", seafood:"海鮮", bbq:"燒烤", hotpot:"火鍋", noodles:"麵食" }, searching:"搜尋中...", searchError:"搜尋失敗", offline:"目前離線", usingCache:"使用快取資料", refreshing:"更新中...", filtersCleared:"已清除所有篩選", favoriteAdded:"已加入收藏", onlineAgain:"已恢復連線", refreshed:"已更新", onboard: { title: "歡迎使用 Jiasa", subtitle: "用滑的找餐廳，超簡單", instructions: [ { icon: "settings", title: "設定條件", text: "點右上角設定預算、距離和喜好" }, { icon: "swipeBoth", title: "滑動選擇", text: "左滑略過，右滑選擇喜歡的餐廳" }, { icon: "heart", title: "收藏管理", text: "把喜歡的餐廳加入收藏清單" }, { icon: "map", title: "查看資訊", text: "選定後可查看地圖、營業時間等" } ], swipeHint: "滑動卡片開始探索" }, sponsor: "贊助", navHome: "首頁", navFavorites: "收藏", navRefresh: "刷新", navHistory: "歷史", navSettings: "設定" },
  en: { settings:"Settings", language:"Language", skip:"Skip", choose:"Choose", back:"Back", hintKeys:"Tip: swipe or use ← → keys.", noMatches:"No matches", retry:"Retry", adjustFilters:"Adjust Filters", hours:"Hours", distance:"Search Radius (Location permission required.)", favorites:"Favorites", fav:"Favorite", history:"History", emptyFav:"No favorites yet", emptyHist:"No history yet", like:"Choose", nope:"Skip", openMap:"Open Map", website:"Website", nowOpen:"Open now", nowClose:"Closed", hoursUnknown:"Hours not available", view:"View", del:"Delete", showHours:"Show hours", hideHours:"Hide hours", theme:"Theme", apply:"Apply", clearFilters:"Clear All", openNow:"Open Now Only", minRating:"Minimum Rating (Show only places rated above this.)", priceLevel:"Price Range ($ Cheap | $$ Moderate | $$$ Expensive | $$$$ Very Expensive)", types:"Restaurant Types (Select multiple or none for all.)", cuisines:"Cuisine Keywords (Used as search keywords.)", hintRating:"Show only places rated above this.", hintPrice:"$ Cheap | $$ Moderate | $$$ Expensive | $$$$ Very Expensive", hintDistance:"Location permission required.", hintTypes:"Select multiple types, or none for all.", hintCuisine:"Used as search keywords.", typeText:{ restaurant:"Restaurant", cafe:"Cafe", bar:"Bar", bakery:"Bakery", meal_takeaway:"Takeout", meal_delivery:"Delivery" }, cuText:{ japanese:"Japanese", chinese:"Chinese", italian:"Italian", thai:"Thai", korean:"Korean", vietnamese:"Vietnamese", western:"Western", vegetarian:"Vegetarian", seafood:"Seafood", bbq:"BBQ", hotpot:"Hot Pot", noodles:"Noodles" }, searching:"Searching...", searchError:"Search failed", offline:"Offline", usingCache:"Using cached data", refreshing:"Refreshing...", filtersCleared:"All filters cleared", favoriteAdded:"Added to favorites", onlineAgain:"Back online", refreshed:"Refreshed", onboard: { title: "Welcome to Jiasa", subtitle: "Swipe to find restaurants", instructions: [ { icon: "settings", title: "Set Preferences", text: "Tap settings to configure budget, distance & preferences" }, { icon: "swipeBoth", title: "Swipe to Choose", text: "Swipe left to skip, right to select restaurants" }, { icon: "heart", title: "Save Favorites", text: "Add restaurants you like to favorites list" }, { icon: "map", title: "View Details", text: "Check map, hours, and more info after selection" } ], swipeHint: "Swipe to start exploring" }, sponsor: "Sponsor", navHome: "Home", navFavorites: "Favorites", navRefresh: "Refresh", navHistory: "History", navSettings: "Settings" }
};