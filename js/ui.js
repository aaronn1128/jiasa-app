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
  $('#applySettings').disabled = loading;
  $('#btnSkip').disabled = loading;
  $('#btnChoose').disabled = loading;
}

// ✅ 更新: 根據新的篩選器項目來渲染文字
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

function attachDrag(card){
    // ... (這部分程式碼沒有變動，保持原樣)
    const flyOut = (liked)=>{
        const toX = liked ? 480 : -480;
        card.style.transition = REDUCED ? "transform .18s ease-out" : "transform .18s cubic-bezier(.2,.8,.2,1)";
        card.style.transform = `translate(${toX}px,0) rotate(${liked?15:-15}deg)`;
        if(navigator.vibrate) try{ navigator.vibrate(12); }catch(e){}
        setTimeout(()=> choose(liked), 160); // ✅ 已修正為 choose
    };
    // ... (其餘拖曳邏輯不變)
}

export function renderStack(){
  const stack=$("#stack"); 
  if (!stack) return;
  stack.innerHTML="";
  const topN = state.pool.slice(state.index, state.index+3);
  
  if(!topN.length){ 
    if(!state.isLoading) stack.innerHTML = `<div class="empty">${t("noMatches")}</div>`; 
    return;
  }
  
  // ... (卡片渲染邏輯不變)
}

export function show(screen){ 
    $("#swipe").style.display = screen === 'swipe' ? 'flex' : 'none';
    if (screen === 'swipe' && state.pool.length > 0) renderStack();
}

// ===== MODALS =====
export function closeAllModals() {
  document.querySelectorAll('.modal.active, .overlay.active').forEach(el => el.classList.remove('active'));
  updateNavActive('navHome');
}

export function updateNavActive(activeId) {
  ['navHome', 'navFavs', 'navHistory', 'navSettings'].forEach(id => {
    const el = $("#" + id);
    if(el) el.classList.toggle('active', id === activeId);
  });
}

export function openFavModal(){
  closeAllModals();
  $("#favOverlay").classList.add("active"); 
  $("#favModal").classList.add("active");
  updateNavActive('navFavs');
  // renderFavs();
  analytics.track('modal_open', 'favorites');
}

export function openHistModal(){
  closeAllModals();
  $("#histOverlay").classList.add("active"); 
  $("#histModal").classList.add("active");
  updateNavActive('navHistory');
  // renderHistory();
  analytics.track('modal_open', 'history');
}

// ✅ 新增: 動態渲染膠囊按鈕
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
      // 更新外觀
      container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    };
    container.appendChild(btn);
  });
}

// ✅ 更新: 同步 UI 與新的篩選器結構
export function syncUIFromStaged(){
  if (!state.staged) return;
  
  // 語言和主題
  $("#langSelModal").value = state.staged.preview.lang;
  $("#themeSelect").value = state.staged.preview.theme;

  // 渲染距離膠囊按鈕
  renderPillGroup('distancePills', CONFIG.FILTER_OPTIONS.distance, state.staged.filters.distance, (value) => {
    state.staged.filters.distance = value;
  });

  // 渲染類型膠囊按鈕
  renderPillGroup('categoryPills', CONFIG.FILTER_OPTIONS.category, state.staged.filters.category, (value) => {
    state.staged.filters.category = value;
  });

  renderText();
}

export function clearAllFiltersInModal() {
  if (!state.staged) return;
  state.staged.filters.distance = CONFIG.DEFAULT_FILTERS.distance;
  state.staged.filters.category = CONFIG.DEFAULT_FILTERS.category;
  syncUIFromStaged(); // 重新渲染 UI
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
