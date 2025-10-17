// js/analytics.js
// 職責：獨立建立並提供 analytics 工具

import { CONFIG } from './config.js';
import { state } from './state.js';

class Analytics {
  constructor() {
    this.events = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.analytics) || "[]");
    this.session = { id: Date.now(), start: Date.now(), events: [] };
  }
  track(event, label, payload = {}) {
    const record = { event, label, timestamp: Date.now(), session_id: this.session.id, lang: state.lang, theme: state.currentTheme, ...payload };
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

// 建立唯一的 analytics 實例並匯出
export const analytics = new Analytics();