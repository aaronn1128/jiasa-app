// js/ui.js (改進版 - 加入記憶體清理與效能優化)
import { I18N, CONFIG } from './config.js';
import { state } from './state.js';
import { analytics } from './analytics.js';
import { choose, nextCard, undoSwipe } from './app.js';

export const $ = s => document.querySelector(s);
export function t(k) { return I18N[state.lang][k] || k; }
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ========== 全域變數: 追蹤當前卡片的清理函數 ==========
let currentCardCleanup = null;

export function applyTheme(theme) {
  document.body.className = "";
  if (theme !== "classic") {
    document.body.classList.add("theme-" + theme);
  }
}

export function showToast(message, type = 'info') {
  const existing = $('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  document.body.appendChild(toast);
  
  // 使用 requestAnimationFrame 確保動畫流暢
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function renderLoading(on) {
  if (on) {
    $("#stack").innerHTML = `<div class="skeleton-card">
      <div class="skeleton-box skeleton-photo"></div>
      <div class="skeleton-box skeleton-title"></div>
      <div class="skeleton-box skeleton-meta"></div>
    </div>`;
  }
}

export function renderError(message) {
  $("#stack").innerHTML = `<div class="empty-with-action">
    <div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${message}</div>
    <button class="btn primary" id="retryBtn">${t('retry')}</button>
    <button class="btn" id="adjustFiltersBtn">${t('adjustFilters')}</button>
  </div>`;
}

function renderEmptyState() {
   $("#stack").innerHTML = `<div class="empty-with-action">
    <div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${t('noMatches')}</div>
    <button class="btn primary" id="retryBtn">${t('retry')}</button>
    <button class="btn" id="adjustFiltersBtn">${t('adjustFilters')}</button>
  </div>`;
}

export function setButtonsLoading(loading) {
  const buttons = ['#applySettings', '#btnSkip', '#btnChoose', '#btnUndo'];
  buttons.forEach(selector => {
    const btn = $(selector);
    if (btn) btn.disabled = loading;
  });
}

export function renderText() {
  const set = (sel, text) => { 
    const el = $(sel); 
    if (el) el.textContent = text; 
  };
  
  set("#btnUndo", t("undo"));
  set("#btnSkip", t("skip"));
  set("#btnChoose", t("choose"));
  set("#hintKeys", t("hintKeys"));
  set("#mTitle", t("settings"));
  set("#lblLang", t("language"));
  set("#lblTheme", t("theme"));
  set("#applyText", t("apply"));
  set("#btnClearFilters", t("clearFilters"));
  set("#favTitle", t("favorites"));
  set("#histTitle", t("history"));
  set("#lblDistance", t("lblDistance"));
  set("#lblCategory", t("lblCategory"));
  set("#lblFilters", t("lblFilters"));
  
  document.querySelectorAll('.nav-label').forEach((el, i) => {
    const keys = ["navHome", "navFavorites", "navRefresh", "navHistory", "navSettings"];
    el.textContent = t(keys[i]);
  });
}

// ========== 改進版拖曳功能（加入清理機制）==========
function attachDrag(card) {
  let startX = 0, startY = 0, dx = 0, dy = 0;
  const ROTATION_FACTOR = 0.1;
  const SWIPE_THRESHOLD = 0.4;
  
  const likeBadge = card.querySelector('.like');
  const nopeBadge = card.querySelector('.nope');

  function onPointerDown(e) {
    if (e.target.closest('button')) return; // 避免與按鈕衝突
    
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    card.style.transition = 'none';
    card.setPointerCapture(e.pointerId);
    
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    e.preventDefault();
    dx = e.clientX - startX;
    dy = e.clientY - startY;
    
    const rotation = dx * ROTATION_FACTOR;
    card.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;
    
    const opacity = Math.min(Math.abs(dx) / (card.offsetWidth / 2), 1);
    
    if (likeBadge) likeBadge.style.opacity = dx > 0 ? opacity : 0;
    if (nopeBadge) nopeBadge.style.opacity = dx < 0 ? opacity : 0;
  }

  function onPointerUp(e) {
    card.releasePointerCapture(e.pointerId);
    card.removeEventListener('pointermove', onPointerMove);
    card.removeEventListener('pointerup', onPointerUp);
    card.removeEventListener('pointercancel', onPointerUp);
    
    const swipeDistance = Math.abs(dx);
    const threshold = card.offsetWidth * SWIPE_THRESHOLD;
    
    if (swipeDistance > threshold) {
      flyOut(dx > 0);
    } else {
      // 彈回原位
      card.style.transition = 'all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = '';
      if (likeBadge) likeBadge.style.opacity = 0;
      if (nopeBadge) nopeBadge.style.opacity = 0;
    }
  }

  const flyOut = (liked) => {
    const endX = liked ? card.offsetWidth * 1.5 : -card.offsetWidth * 1.5;
    const endRotation = (endX / (card.offsetWidth / 2)) * 15;
    
    card.style.transition = 'all .4s ease-out';
    card.style.transform = `translate(${endX}px, ${dy}px) rotate(${endRotation}deg)`;
    card.style.opacity = 0;
    
    // 觸覺回饋
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch(e) {}
    }
    
    setTimeout(() => choose(liked), 160);
  };
  
  card.addEventListener('pointerdown', onPointerDown);
  
  // ========== 返回清理函數 ==========
  return () => {
    card.removeEventListener('pointerdown', onPointerDown);
    card.removeEventListener('pointermove', onPointerMove);
    card.removeEventListener('pointerup', onPointerUp);
    card.removeEventListener('pointercancel', onPointerUp);
  };
}

export function renderStack(){
  const stack = $("#stack"); 
  if (!stack) return;
  
  // ========== 清理舊卡片的事件監聽器 ==========
  if (currentCardCleanup) {
    currentCardCleanup();
    currentCardCleanup = null;
  }
  
  if ($('#btnUndo')) {
    $('#btnUndo').disabled = !state.undoSlot;
  }

  if (state.isLoading) {
    renderLoading(true);
    return;
  }
  
  if (!state.pool.length || state.index >= state.pool.length) {
    renderEmptyState();
    return;
  }

  stack.innerHTML = "";
  const topN = state.pool.slice(state.index, state.index + 3).reverse();

  topN.forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'swipe-card';
      card.style.zIndex = 100 - i;
      card.setAttribute('role', 'article');
      card.setAttribute('aria-label', `餐廳: ${r.name}`);
      
      if (i > 0) {
        card.style.transform = `translateY(${-i * 8}px) scale(${1 - i * 0.04})`;
        card.style.pointerEvents = 'none'; // 只有最上層卡片可互動
      }

      const ratingStars = r.rating ? '⭐'.repeat(Math.round(r.rating)) : '';
      const distance = r.distanceMeters 
        ? `${(r.distanceMeters/1000).toFixed(1)}km` 
        : '';

      card.innerHTML = `
          <div class="badge like" aria-hidden="true">${t('like')}</div>
          <div class="badge nope" aria-hidden="true">${t('nope')}</div>
          <div class="card-content">
            <div class="title">${escapeHtml(r.name)}</div>
            <div class="meta">${r.rating || ''} ${ratingStars} · ${distance}</div>
          </div>
          ${r.photoUrl 
            ? `<img src="${r.photoUrl}" class="card-photo" alt="${escapeHtml(r.name)}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="photo-placeholder" style="display:none;">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                   <path d="M21.3 16.5l-4-4a2 2 0 00-2.8 0l-4.3 4.3a2 2 0 01-2.8 0l-1.4-1.4a2 2 0 00-2.8 0L3 21.2"/>
                 </svg>
               </div>` 
            : `<div class="photo-placeholder">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                   <path d="M21.3 16.5l-4-4a2 2 0 00-2.8 0l-4.3 4.3a2 2 0 01-2.8 0l-1.4-1.4a2 2 0 00-2.8 0L3 21.2"/>
                 </svg>
               </div>`}
      `;
      
      stack.appendChild(card);
      
      // 只為最上層的卡片附加拖曳功能
      if (i === topN.length - 1) {
          currentCardCleanup = attachDrag(card);
      }
  });
}

// ========== 輔助函數: HTML 轉義 ==========
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function show(screen){ 
    $("#swipe").style.display = screen === 'swipe' ? 'flex' : 'none';
    if (screen === 'swipe') renderStack();
}

export function closeAllModals() {
  document.querySelectorAll('.modal.active, .overlay.active').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
  });
  updateNavActive('navHome');
}

export function updateNavActive(activeId) {
  ['navHome', 'navFavs', 'navHistory', 'navSettings'].forEach(id => {
    const el = $("#" + id);
    if(el) {
      const isActive = id === activeId;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    }
  });
}

export function openFavModal(){
  closeAllModals();
  const overlay = $("#favOverlay");
  const modal = $("#favModal");
  
  overlay.classList.add("active");
  overlay.setAttribute('aria-hidden', 'false');
  modal.classList.add("active");
  modal.setAttribute('aria-hidden', 'false');
  
  updateNavActive('navFavs');
  analytics.track('modal_open', 'favorites');
}

export function openHistModal(){
  closeAllModals();
  const overlay = $("#histOverlay");
  const modal = $("#histModal");
  
  overlay.classList.add("active");
  overlay.setAttribute('aria-hidden', 'false');
  modal.classList.add("active");
  modal.setAttribute('aria-hidden', 'false');
  
  updateNavActive('navHistory');
  analytics.track('modal_open', 'history');
}

function renderPillGroup(containerId, options, selectedValue, onSelect) {
  const container = $(`#${containerId}`);
  if (!container) return;
  
  container.innerHTML = '';
  
  options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "pill";
    btn.dataset.value = option.value;
    btn.textContent = state.lang === 'zh' 
      ? (option.label_zh || option.label) 
      : (option.label_en || option.label);
    
    const isActive = String(option.value) === String(selectedValue);
    if (isActive) {
      btn.classList.add("active");
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.setAttribute('aria-pressed', 'false');
    }
    
    btn.onclick = () => {
      onSelect(option.value);
      container.querySelectorAll('.pill').forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    };
    
    container.appendChild(btn);
  });
}

export function syncUIFromStaged(){
  if (!state.staged) return;
  
  $("#langSelModal").value = state.staged.preview.lang;
  $("#themeSelect").value = state.staged.preview.theme;

  renderPillGroup('distancePills', CONFIG.FILTER_OPTIONS.distance, state.staged.filters.distance, (value) => {
    state.staged.filters.distance = value;
  });

  renderPillGroup('categoryPills', CONFIG.FILTER_OPTIONS.category, state.staged.filters.category, (value) => {
    state.staged.filters.category = value;
  });

  renderText();
}

export function clearAllFiltersInModal() {
  if (!state.staged) return;
  state.staged.filters.distance = CONFIG.DEFAULT_FILTERS.distance;
  state.staged.filters.category = CONFIG.DEFAULT_FILTERS.category;
  syncUIFromStaged();
  showToast(t('filtersCleared'), 'success');
  analytics.track('filters', 'clear_all');
}

export function showModal(show) {
  const overlay = $("#overlay");
  const modal = $("#modal");
  
  if (show) {
    closeAllModals();
    overlay.classList.add("active");
    overlay.setAttribute('aria-hidden', 'false');
    modal.classList.add("active");
    modal.setAttribute('aria-hidden', 'false');
    updateNavActive('navSettings');
    
    // Focus trap
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  } else {
    closeAllModals();
  }
}