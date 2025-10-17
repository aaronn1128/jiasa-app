// js/ui.js
import { I18N, CONFIG } from './config.js';
import { state, saveFavs, saveHistory } from './state.js';
import { analytics } from './analytics.js';
import { choose, nextCard, openModal as openSettingsModal } from './app.js';

export const $ = s => document.querySelector(s);
export function t(k) { return I18N[state.lang][k] || k; }
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function showSkeletonLoader() {
  $("#stack").innerHTML = `<div class="skeleton-card"><div class="skeleton-box skeleton-photo"></div><div class="skeleton-box skeleton-title"></div><div class="skeleton-box skeleton-meta"></div><div class="skeleton-chips"><div class="skeleton-box skeleton-chip"></div><div class="skeleton-box skeleton-chip"></div></div></div>`;
}

export function showErrorState(message) {
  $("#stack").innerHTML = `<div class="empty-with-action"><div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${message}</div><button class="btn primary" id="retryBtn">${t('retry')}</button><button class="btn" id="adjustFiltersBtn">${t('adjustFilters')}</button></div>`;
}

export function setButtonsLoading(loading) {
  const applyBtn = $('#applySettings');
  const skipBtn = $('#btnSkip');
  const chooseBtn = $('#btnChoose');
  if (applyBtn) applyBtn.disabled = loading;
  if (skipBtn) skipBtn.disabled = loading;
  if (chooseBtn) chooseBtn.disabled = loading;
}

export function renderText() {
  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
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
  set("#offlineBadge", t("offline"));
  set("#lblDistance", t("lblDistance"));
  set("#lblCategory", t("lblCategory"));
  
  document.querySelectorAll('.nav-label').forEach((el, i) => {
    const keys = ["navHome", "navFavorites", "navRefresh", "navHistory", "navSettings"];
    el.textContent = t(keys[i]);
  });
}

function attachDrag(card) {
  let startX = 0, currentX = 0, isDragging = false;
  
  const flyOut = (liked) => {
    const toX = liked ? 480 : -480;
    card.style.transition = REDUCED ? "transform .18s ease-out" : "transform .18s cubic-bezier(.2,.8,.2,1)";
    card.style.transform = `translate(${toX}px,0) rotate(${liked ? 15 : -15}deg)`;
    if (navigator.vibrate) try { navigator.vibrate(12); } catch(e) {}
    setTimeout(() => choose(liked), 160);
  };

  const onStart = (e) => {
    isDragging = true;
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    card.style.transition = 'none';
  };

  const onMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    currentX = (e.type.includes('mouse') ? e.clientX : e.touches[0].clientX) - startX;
    const rotation = currentX * 0.03;
    card.style.transform = `translate(${currentX}px, 0) rotate(${rotation}deg)`;
    
    const badge = card.querySelector('.badge');
    if (badge) {
      if (currentX > 50) {
        badge.classList.add('like');
        badge.classList.remove('nope');
        badge.style.opacity = '1';
      } else if (currentX < -50) {
        badge.classList.add('nope');
        badge.classList.remove('like');
        badge.style.opacity = '1';
      } else {
        badge.style.opacity = '0';
      }
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    
    if (Math.abs(currentX) > 100) {
      flyOut(currentX > 0);
    } else {
      card.style.transition = 'transform .25s ease';
      card.style.transform = '';
      const badge = card.querySelector('.badge');
      if (badge) badge.style.opacity = '0';
    }
    currentX = 0;
  };

  card.addEventListener('mousedown', onStart);
  card.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

export function renderStack() {
  const stack = $("#stack"); 
  if (!stack) return;
  stack.innerHTML = "";
  const topN = state.pool.slice(state.index, state.index + 3);
  
  if (!topN.length) { 
    if (!state.isLoading) stack.innerHTML = `<div class="empty">${t("noMatches")}</div>`; 
    return;
  }
  
  topN.forEach((place, idx) => {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.style.zIndex = 100 - idx;
    if (idx > 0) {
      card.style.transform = `scale(${1 - idx * 0.05}) translateY(${idx * 8}px)`;
      card.style.opacity = 1 - idx * 0.3;
    }

    const photoHTML = place.photoUrl 
      ? `<img src="${place.photoUrl}" class="card-photo" alt="${place.name}" />`
      : `<div class="photo-placeholder"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;

    // ✅ 使用 SVG 圖示
    const ratingHTML = place.rating 
      ? `<span class="meta-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="#ffd700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${place.rating}</span>` 
      : '';
    
    const priceHTML = place.price 
      ? `<span class="meta-icon">${'<svg viewBox="0 0 24 24" width="14" height="14" fill="#4ade80"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9h-4.5a2.5 2.5 0 0 0 0 5H13a2.5 2.5 0 0 1 0 5H9" stroke="#000" stroke-width="2" fill="none"/></svg>'.repeat(place.price)}</span>` 
      : '';
    
    const distanceHTML = place.distance 
      ? `<span class="meta-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="#ef4444"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg> ${(place.distance / 1000).toFixed(1)}km</span>` 
      : '';

    card.innerHTML = `
      <div class="badge like">LIKE</div>
      <div class="badge nope">NOPE</div>
      ${photoHTML}
      <div class="title">${place.name}</div>
      <div class="meta">
        ${ratingHTML}
        ${priceHTML}
        ${distanceHTML}
      </div>
      <div class="row">
        ${place.types.slice(0, 3).map(t => `<span class="chip">${t}</span>`).join('')}
      </div>
    `;

    if (idx === 0) attachDrag(card);
    stack.appendChild(card);
  });
}

export function show(screen) { 
  $("#swipe").style.display = screen === 'swipe' ? 'flex' : 'none';
  if (screen === 'swipe' && state.pool.length > 0) renderStack();
}

export function closeAllModals() {
  document.querySelectorAll('.modal.active, .overlay.active').forEach(el => el.classList.remove('active'));
  updateNavActive('navHome');
}

export function updateNavActive(activeId) {
  ['navHome', 'navFavs', 'navHistory', 'navSettings'].forEach(id => {
    const el = $("#" + id);
    if (el) el.classList.toggle('active', id === activeId);
  });
}

export function openFavModal() {
  closeAllModals();
  $("#favOverlay").classList.add("active"); 
  $("#favModal").classList.add("active");
  updateNavActive('navFavs');
  analytics.track('modal_open', 'favorites');
}

export function openHistModal() {
  closeAllModals();
  $("#histOverlay").classList.add("active"); 
  $("#histModal").classList.add("active");
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
    btn.textContent = state.lang === 'zh' ? (option.label_zh || option.label) : (option.label_en || option.label);
    if (option.value === selectedValue) {
      btn.classList.add("active");
    }
    btn.onclick = () => {
      onSelect(option.value);
      container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    };
    container.appendChild(btn);
  });
}

export function syncUIFromStaged() {
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
  if (show) {
    closeAllModals();
    $("#overlay").classList.add("active");
    $("#modal").classList.add("active");
    updateNavActive('navSettings');
  } else {
    closeAllModals();
  }
}

export function renderLoading(on) {
  if (on) showSkeletonLoader();
}

export function renderError(msg) {
  showErrorState(msg || t('searchError'));
}