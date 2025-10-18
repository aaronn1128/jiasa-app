// js/ui.js - 完整修復版
import { I18N, CONFIG, ICONS } from './config.js';
import { state, saveFavs, saveHistory, saveOnboarding } from './state.js';
import { analytics } from './analytics.js';

export const $ = s => document.querySelector(s);
export function t(k) { 
  const keys = k.split('.');
  let value = I18N[state.lang];
  for (const key of keys) {
    value = value?.[key];
  }
  return value || k;
}

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

export function renderLoading(on) {
  if (on) {
    $("#stack").innerHTML = `
      <div class="skeleton-card">
        <div class="skeleton-box skeleton-photo"></div>
        <div class="skeleton-box skeleton-title"></div>
        <div class="skeleton-box skeleton-meta"></div>
      </div>`;
  }
}

export function renderError(message) {
  $("#stack").innerHTML = `
    <div class="empty-with-action">
      <div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${message}</div>
      <button class="btn primary" id="retryBtn">${t('retry')}</button>
      <button class="btn" id="adjustFiltersBtn">${t('adjustFilters')}</button>
    </div>`;
}

function renderEmptyState() {
  $("#stack").innerHTML = `
    <div class="empty-with-action">
      <div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${t('noMatches')}</div>
      <button class="btn primary" id="retryBtn">${t('retry')}</button>
      <button class="btn" id="adjustFiltersBtn">${t('adjustFilters')}</button>
    </div>`;
}

export function setButtonsLoading(loading) {
  if ($('#applySettings')) $('#applySettings').disabled = loading;
  if ($('#btnSkip')) $('#btnSkip').disabled = loading;
  if ($('#btnChoose')) $('#btnChoose').disabled = loading;
  if ($('#btnUndo')) $('#btnUndo').disabled = loading;
}

export function renderText() {
  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };
  set("#btnUndo", `↩︎ ${t("undo")}`);
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
  set("#btnBackText", t("back"));
  set("#btnFavText", t("fav"));
  set("#btnMapText", t("openMap"));
  set("#btnWebText", t("website"));
  set("#toggleHours", t("showHours"));
  
  document.querySelectorAll('.nav-label').forEach((el, i) => {
    const keys = ["navHome", "navFavorites", "navRefresh", "navHistory", "navSettings"];
    el.textContent = t(keys[i]);
  });
}

function createOnboardingCard() {
  const onboard = t('onboard');
  const card = document.createElement('div');
  card.className = 'swipe-card onboard-card';
  
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
  
  return card;
}

export function renderStack(){
  const stack = $("#stack"); 
  if (!stack) return;
  
  if ($('#btnUndo')) $('#btnUndo').disabled = !state.undoSlot;

  if (state.isLoading) {
    renderLoading(true);
    return;
  }
  
  if (!state.pool.length || state.index >= state.pool.length) {
    renderEmptyState();
    return;
  }

  stack.innerHTML = "";
  
  if (state.index === 0 && !state.hasSeenOnboarding) {
    const onboardCard = createOnboardingCard();
    onboardCard.style.zIndex = '101';
    stack.appendChild(onboardCard);
    attachDragToOnboarding(onboardCard);
    return;
  }
  
  const topN = state.pool.slice(state.index, state.index + 3).reverse();

  topN.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = r.isSponsored ? 'swipe-card sponsor-card' : 'swipe-card';
    card.style.zIndex = 100 - i;
    
    if (i > 0) {
      card.style.transform = `translateY(${-i * 8}px) scale(${1 - i * 0.04})`;
    }

    const title = r.name || 'Unknown';
    const rating = r.rating ? `⭐ ${r.rating.toFixed(1)}` : '';
    const distance = r.distanceMeters ? `${(r.distanceMeters/1000).toFixed(1)}km` : '';
    const meta = [rating, distance].filter(Boolean).join(' · ');
    
    const priceSymbols = '$'.repeat(Math.max(1, r.price || 1));
    const priceChip = `<span class="chip" style="background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:#220b07; font-weight:800;">${priceSymbols}</span>`;
    
    const typeMap = {
      restaurant: state.lang === 'zh' ? '餐廳' : 'Restaurant',
      cafe: state.lang === 'zh' ? '咖啡廳' : 'Cafe',
      bar: state.lang === 'zh' ? '酒吧' : 'Bar',
      bakery: state.lang === 'zh' ? '烘焙坊' : 'Bakery'
    };
    
    const typeChips = r.types
      .filter(t => typeMap[t])
      .slice(0, 3)
      .map(t => `<span class="chip">${typeMap[t]}</span>`)
      .join('');
    
    const openBadge = r.opening_hours?.open_now 
      ? `<span style="color:var(--ok); font-size:12px;">● ${t("nowOpen")}</span>` 
      : r.opening_hours?.open_now === false 
      ? `<span style="color:var(--bad); font-size:12px;">● ${t("nowClose")}</span>` 
      : '';
    
    const sponsorBadge = r.isSponsored 
      ? `<div class="sponsor-badge">${t("sponsor")}</div>` 
      : '';
    
    const photoHtml = r.photoUrl 
      ? `<img src="${r.photoUrl}" class="card-photo" alt="${title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="photo-placeholder" style="display:none;">${ICONS.image}</div>`
      : `<div class="photo-placeholder">${ICONS.image}</div>`;

    // ✅ 修改：圖片在上，文字在下
    card.innerHTML = `
      ${sponsorBadge}
      <div class="badge like">${t('like')}</div>
      <div class="badge nope">${t('nope')}</div>
      ${photoHtml}
      <div class="card-content">
        <div class="title">${title}</div>
        <div class="meta">${meta}</div>
        <div class="row">${priceChip}${typeChips}</div>
        ${openBadge ? `<div style="margin-top:4px;">${openBadge}</div>` : ''}
      </div>
    `;
    
    stack.appendChild(card);
    
    if (i === topN.length - 1) {
      attachDrag(card);
    }
  });
}

function attachDragToOnboarding(card) {
  let startX = 0, dx = 0;
  
  function onPointerDown(e) {
    e.preventDefault();
    startX = e.clientX;
    card.style.transition = 'none';
    card.setPointerCapture(e.pointerId);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
  }

  function onPointerMove(e) {
    dx = e.clientX - startX;
    const rotation = dx * 0.1;
    card.style.transform = `translate(${dx}px, 0) rotate(${rotation}deg)`;
  }

  function onPointerUp(e) {
    card.releasePointerCapture(e.pointerId);
    card.removeEventListener('pointermove', onPointerMove);
    card.removeEventListener('pointerup', onPointerUp);
    
    if (Math.abs(dx) > card.offsetWidth * 0.4) {
      state.hasSeenOnboarding = true;
      saveOnboarding();
      analytics.track('onboarding', 'complete');
      
      card.style.transition = 'all .4s ease-out';
      card.style.transform = `translate(${dx > 0 ? 1000 : -1000}px, 0)`;
      card.style.opacity = 0;
      
      setTimeout(() => renderStack(), 400);
    } else {
      card.style.transition = 'all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = '';
    }
  }
  
  card.addEventListener('pointerdown', onPointerDown);
}

function attachDrag(card) {
  let startX = 0, startY = 0, dx = 0, dy = 0;
  const ROTATION_FACTOR = 0.1;

  function onPointerDown(e) {
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
    const opacity = Math.abs(dx) / (card.offsetWidth / 2);
    card.querySelector('.like').style.opacity = dx > 0 ? opacity : 0;
    card.querySelector('.nope').style.opacity = dx < 0 ? opacity : 0;
  }

  function onPointerUp(e) {
    card.releasePointerCapture(e.pointerId);
    card.removeEventListener('pointermove', onPointerMove);
    card.removeEventListener('pointerup', onPointerUp);
    card.removeEventListener('pointercancel', onPointerUp);
    
    if (Math.abs(dx) > card.offsetWidth * 0.4) {
      flyOut(dx > 0);
    } else {
      card.style.transition = 'all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      card.style.transform = '';
      card.querySelector('.like').style.opacity = 0;
      card.querySelector('.nope').style.opacity = 0;
    }
  }

  // ✅ 修改：直接調用全局函數
  const flyOut = (liked) => {
    const endX = liked ? card.offsetWidth * 1.5 : -card.offsetWidth * 1.5;
    const endRotation = (endX / (card.offsetWidth / 2)) * 15;
    card.style.transition = 'all .4s ease-out';
    card.style.transform = `translate(${endX}px, ${dy}px) rotate(${endRotation}deg)`;
    card.style.opacity = 0;
    if(navigator.vibrate) try { navigator.vibrate(12); } catch(e){}
    
    setTimeout(() => {
      if (window.handleCardSwipe) {
        window.handleCardSwipe(liked);
      }
    }, 160);
  };
  
  card.addEventListener('pointerdown', onPointerDown);
}

export function show(screen){ 
  if (screen === 'swipe') {
    $("#swipe").style.display = 'flex';
    $("#result").style.display = 'none';
    renderStack();
  } else if (screen === 'result') {
    $("#swipe").style.display = 'none';
    $("#result").style.display = 'flex';
  }
}

export function renderResult(r) {
  const rname = r.name || 'Unknown';
  const rating = r.rating ? `⭐ ${r.rating.toFixed(1)}` : '';
  const priceSymbols = '$'.repeat(Math.max(1, r.price || 1));
  
  const hero = $("#hero");
  if (r.photoUrl) {
    hero.src = r.photoUrl;
    hero.style.display = "block";
  } else {
    hero.style.display = "none";
  }
  
  const typeMap = {
    restaurant: state.lang === 'zh' ? '餐廳' : 'Restaurant',
    cafe: state.lang === 'zh' ? '咖啡廳' : 'Cafe',
    bar: state.lang === 'zh' ? '酒吧' : 'Bar',
    bakery: state.lang === 'zh' ? '烘焙坊' : 'Bakery'
  };
  
  const typeChips = r.types
    .filter(t => typeMap[t])
    .map(t => `<span class="chip">${typeMap[t]}</span>`)
    .join('');
  
  const priceChip = `<span class="chip" style="background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:#220b07; font-weight:800;">${priceSymbols}</span>`;
  
  const sponsorBadge = r.isSponsored 
    ? `<div style="display:inline-block; background:linear-gradient(135deg, var(--sponsor), #ffed4e); color:#1b0f0a; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; margin-left:8px;">${t("sponsor")}</div>` 
    : '';
  
  $("#resultBody").innerHTML = `
    <div class="title">${rname}${sponsorBadge}</div>
    <div class="meta" style="margin:6px 0 10px;">${rating}</div>
    <div class="row">${priceChip}${typeChips}</div>
    <div class="divider"></div>
    <div style="color:#ffe7d6;">${r.address || ''}</div>
  `;
  
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
  } else {
    hoursBox.innerHTML = "";
    toggleHours.style.display = "none";
  }
  
  toggleHours.onclick = () => {
    hoursBox.classList.toggle("show");
    toggleHours.textContent = hoursBox.classList.contains("show") ? t("hideHours") : t("showHours");
  };
  
  hoursBox.classList.remove("show");
  
  $("#btnMap").onclick = () => {
    if (r.googleMapsUrl) {
      window.open(r.googleMapsUrl, "_blank");
    } else if (r.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${r.location.lat},${r.location.lng}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rname)}`, "_blank");
    }
    analytics.track('action', 'map_click', { place_id: r.id });
  };
  
  const btnWebsite = $("#btnWebsite");
  if (r.website) {
    btnWebsite.style.display = "flex";
    btnWebsite.href = r.website;
  } else {
    btnWebsite.style.display = "none";
  }
  
  show('result');
}

export function renderFavs() {
  const list = $("#favList");
  list.innerHTML = "";
  
  if (!state.favs.length) {
    list.innerHTML = `<div class="empty">${t("emptyFav")}</div>`;
    return;
  }
  
  state.favs.forEach(id => {
    const r = state.pool.find(x => x.id === id);
    if (!r) return;
    
    const row = document.createElement("div");
    row.className = "list-item";
    
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    if (r.photoUrl) {
      const img = document.createElement("img");
      img.src = r.photoUrl;
      thumb.appendChild(img);
    } else {
      thumb.textContent = (r.name[0] || "•").toUpperCase();
    }
    
    const textWrap = document.createElement("div");
    textWrap.style.minWidth = "0";
    textWrap.innerHTML = `
      <div class="list-title">${r.name}</div>
      <div class="list-meta">⭐ ${(r.rating || 0).toFixed(1)} · ${'$'.repeat(r.price || 1)}</div>
    `;
    
    const actions = document.createElement("div");
    actions.className = "row-actions";
    
    const viewBtn = document.createElement("button");
    viewBtn.className = "i-btn";
    viewBtn.textContent = t("view");
    viewBtn.onclick = () => {
      state.current = r;
      renderResult(r);
      closeAllModals();
    };
    
    const delBtn = document.createElement("button");
    delBtn.className = "i-btn";
    delBtn.textContent = t("del");
    delBtn.onclick = () => {
      state.favs = state.favs.filter(x => x !== id);
      saveFavs();
      renderFavs();
    };
    
    const left = document.createElement("div");
    left.className = "list-left";
    left.appendChild(thumb);
    left.appendChild(textWrap);
    
    actions.appendChild(viewBtn);
    actions.appendChild(delBtn);
    
    row.appendChild(left);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

export function renderHistory() {
  const list = $("#histList");
  list.innerHTML = "";
  
  if (!state.history.length) {
    list.innerHTML = `<div class="empty">${t("emptyHist")}</div>`;
    return;
  }
  
  state.history.forEach(item => {
    const r = state.pool.find(x => x.id === item.id);
    if (!r) return;
    
    const row = document.createElement("div");
    row.className = "list-item";
    
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    if (r.photoUrl) {
      const img = document.createElement("img");
      img.src = r.photoUrl;
      thumb.appendChild(img);
    } else {
      thumb.textContent = (r.name[0] || "•").toUpperCase();
    }
    
    const timeStr = new Date(item.ts).toLocaleString(state.lang === "zh" ? "zh-TW" : "en-US");
    const textWrap = document.createElement("div");
    textWrap.style.minWidth = "0";
    textWrap.innerHTML = `
      <div class="list-title">${r.name}</div>
      <div class="list-meta">${timeStr}</div>
    `;
    
    const actions = document.createElement("div");
    actions.className = "row-actions";
    
    const viewBtn = document.createElement("button");
    viewBtn.className = "i-btn";
    viewBtn.textContent = t("view");
    viewBtn.onclick = () => {
      state.current = r;
      renderResult(r);
      closeAllModals();
    };
    
    const delBtn = document.createElement("button");
    delBtn.className = "i-btn";
    delBtn.textContent = t("del");
    delBtn.onclick = () => {
      state.history = state.history.filter(x => x.ts !== item.ts);
      saveHistory();
      renderHistory();
    };
    
    const left = document.createElement("div");
    left.className = "list-left";
    left.appendChild(thumb);
    left.appendChild(textWrap);
    
    actions.appendChild(viewBtn);
    actions.appendChild(delBtn);
    
    row.appendChild(left);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

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
  renderFavs();
  analytics.track('modal_open', 'favorites');
}

export function openHistModal(){
  closeAllModals();
  $("#histOverlay").classList.add("active"); 
  $("#histModal").classList.add("active");
  updateNavActive('navHistory');
  renderHistory();
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
    if (String(option.value) === String(selectedValue)) {
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
  if (show) {
    closeAllModals();
    $("#overlay").classList.add("active");
    $("#modal").classList.add("active");
    updateNavActive('navSettings');
  } else {
    closeAllModals();
  }
}
