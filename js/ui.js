// js/ui.js (完整版)
// 職責：負責所有畫面的渲染、更新、顯示、隱藏、動畫等操作。

import { I18N, ICONS, CONFIG } from './config.js';
import { state, saveFavs, saveHistory } from './state.js';
import { analytics } from './analytics.js';
// 從 app.js 引入需要回呼的核心邏輯函式
import { choose, nextCard, openModal as openSettingsModal } from './app.js';

// ===== UTILITIES (只跟 UI 有關) =====
export const $ = s => document.querySelector(s);
export function t(k) { return I18N[state.lang][k] || k; }
function nameOf(r) { return r.name || "Unknown"; }
function firstCharThumb(r) { return (nameOf(r)[0] || "•").toUpperCase(); }

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== THEME & TOAST =====
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
    toast.style.transform = 'translate(-50%, 20px)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ===== SKELETON & ERROR STATES =====
export function showSkeletonLoader() {
  const stack = $("#stack");
  if (!stack) return;
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

export function showErrorState(message) {
  const stack = $("#stack");
  if (!stack) return;
  stack.innerHTML = `
    <div class="empty-with-action">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${ICONS.search}
      </svg>
      <div style="color:var(--muted); font-size:16px; margin-bottom:8px;">${message}</div>
      <button class="btn primary" id="retryBtn" style="min-width:120px;">${t('retry')}</button>
      <button class="btn" id="adjustFiltersBtn" style="min-width:120px;">${t('adjustFilters')}</button>
      ${CONFIG.DEMO_MODE ? '' : '<button class="btn" id="demoModeBtn" style="min-width:120px; margin-top:8px;">' + (state.lang === 'zh' ? '使用示範模式' : 'Use Demo Mode') + '</button>'}
    </div>
  `;
}

// ===== BUTTONS & CONTROLS STATE =====
export function setButtonsLoading(loading) {
  if ($("#applySettings")) $("#applySettings").disabled = loading;
  if ($("#btnSkip")) $("#btnSkip").disabled = loading;
  if ($("#btnChoose")) $("#btnChoose").disabled = loading;
}

export function updateUndoBtn() { 
  if ($("#btnUndo")) $("#btnUndo").disabled = !state.undoSlot; 
}

export function updateSliderBackground(slider) {
  if (!slider) return;
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const percentage = ((val - min) / (max - min)) * 100;
  if (slider.id === 'distance') {
    slider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--disabled) ${percentage}%, var(--disabled) 100%)`;
  } else {
    slider.style.background = `linear-gradient(to right, var(--disabled) 0%, var(--disabled) ${percentage}%, var(--primary) ${percentage}%, var(--primary) 100%)`;
  }
}

// ===== MAIN RENDERING =====
function updateThemeLabel() { 
  const lbl = $("#lblTheme");
  if(lbl) lbl.textContent = t("theme"); 
}

function updateThemeOptions() {
  const sel = $("#themeSelect");
  if (!sel) return;
  Array.from(sel.options).forEach(opt=>{
    const themeValue = opt.value; 
    opt.textContent = (state.lang==='zh')
      ? (opt.getAttribute('data-zh') || themeValue)
      : (themeValue.charAt(0).toUpperCase() + themeValue.slice(1));
  });
}

// ✅ 改良：元素存在才設定文字；同時處理類型下拉與主題選單的語系文字
export function renderText() {
  const set = (sel, text) => { const el = $(sel); if (el) el.textContent = text; };

  set("#btnSkip", t("skip"));
  set("#btnChoose", t("choose"));
  set("#btnBackText", t("back"));
  set("#btnFavText", t("fav"));
  set("#btnMapText", t("openMap"));
  set("#btnWebText", t("website"));

  const undoBtn = $("#btnUndo");
  if (undoBtn) undoBtn.textContent = `↩︎ ${state.lang === 'zh' ? '撤回' : 'Undo'}`;

  set("#hintKeys", t("hintKeys"));
  set("#mTitle", t("settings"));
  set("#lblLang", t("language"));
  set("#lblMinRating", t("minRating"));
  set("#lblPrice", t("priceLevel"));
  set("#lblDistance", t("distance"));

  // 舊的：#lblTypes / #lblCuisine 可能已不存在 → 安全地跳過
  set("#lblTypes", t("types"));
  set("#lblCuisine", t("cuisines"));
  set("#hintRating", t("hintRating"));
  set("#hintPrice", t("hintPrice"));
  set("#hintDistance", t("hintDistance"));
  set("#hintTypes", t("hintTypes"));
  set("#hintCuisine", t("hintCuisine"));
  set("#favTitle", t("favorites"));
  set("#histTitle", t("history"));
  set("#toggleHours", t("showHours"));
  set("#offlineBadge", t("offline"));
  set("#btnClearFilters", t("clearFilters"));

  // 免費版新增：類型（單選）標籤（有就設）
  set("#lblCategory", state.lang === 'zh' ? '類型' : 'Category');

  // 類型選單的 option 文案跟隨語言
  const catSel = $("#categorySelect");
  if (catSel) {
    Array.from(catSel.options).forEach(opt=>{
      const zh = opt.getAttribute('data-zh');
      opt.textContent = (state.lang === 'zh' && zh) ? zh : opt.textContent.replace(/\s*&.+?$/, '').trim();
      // 英文保持你原本寫在 <option> 的文字
    });
  }

  updateThemeLabel(); 
  updateThemeOptions();

  const applyBtn = $("#applySettings");
  if (applyBtn) {
    const span = applyBtn.querySelector("span");
    if (span) span.textContent = t("apply");
  }
  
  const navLabels = document.querySelectorAll('.nav-label');
  if (navLabels[0]) navLabels[0].textContent = t("navHome");
  if (navLabels[1]) navLabels[1].textContent = t("navFavorites");
  if (navLabels[2]) navLabels[2].textContent = t("navRefresh");
  if (navLabels[3]) navLabels[3].textContent = t("navHistory");
  if (navLabels[4]) navLabels[4].textContent = t("navSettings");
}

// ===== 卡片拖曳/堆疊 =====
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
      if(offset>0){ likeBadge.style.opacity=prog; nopeBadge.style.opacity=0; } 
      else { likeBadge.style.opacity=0; nopeBadge.style.opacity=prog; }
    }
  };
  
  const flyOut = (liked)=>{
    const toX = liked ? 480 : -480;
    card.style.transition = REDUCED ? "transform .18s ease-out" : "transform .18s cubic-bezier(.2,.8,.2,1)";
    card.style.transform = `translate(${toX}px,0) rotate(${liked?15:-15}deg)`;
    if(navigator.vibrate) try{ navigator.vibrate(12); }catch(e){}
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

export function renderStack(){
  const stack=$("#stack"); 
  if (!stack) return;
  stack.innerHTML="";
  const topN = state.pool.slice(state.index, state.index+3);
  
  if(!topN.length){ 
    if(!state.isLoading) stack.innerHTML = `<div class="empty">${t("noMatches")}</div>`; 
    return;
  }
  
  const typeMap = I18N[state.lang].typeText;
  for(let j = Math.min(2, topN.length-1); j>=0; j--){
    const r = topN[j];
    const depth = j;
    const card=document.createElement("div"); 
    
    if (r.isOnboarding) {
      card.className="swipe-card onboard-card";
      const onboard = I18N[state.lang].onboard;
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

export function show(screen){ 
  if(screen==="swipe"){ 
    if ($("#swipe")) $("#swipe").style.display="flex";
    if ($("#result")) $("#result").style.display="none"; 
    if (state.pool.length > 0) renderStack();
  } else { 
    if ($("#swipe")) $("#swipe").style.display="none"; 
    if ($("#result")) $("#result").style.display="flex";
  } 
}

// ===== RESULT & LISTS RENDERING =====
export function renderBaseResult(r) {
  const typeMap = I18N[state.lang].typeText;
  const rname = nameOf(r); 
  const rating = `⭐ ${(r.rating || 0).toFixed(1)}`; 
  const priceSymbols = '$'.repeat(Math.max(1, r.price || 1));
  const hero = $("#hero"); 
  if (hero) {
    if (r.photoUrl) {
      hero.src = r.photoUrl;
      hero.style.display = "block";
    } else {
      hero.style.display = "none";
    }
  }
  
  const mainTypes = r.types.filter(t => typeMap[t]).slice(0, 5);
  const typeChips = mainTypes.map(t => `<span class="chip">${typeMap[t] || t}</span>`).join("");
  const priceChip = `<span class="chip" style="background:linear-gradient(135deg,var(--primary),var(--primary-2)); color:#220b07; font-weight:800;">${priceSymbols}</span>`;
  const sponsorBadge = r.isSponsored ? `<div style="display:inline-block; background:linear-gradient(135deg, var(--sponsor), #ffed4e); color:#1b0f0a; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; margin-left:8px;">${t("sponsor")}</div>` : '';
  const resultBody = $("#resultBody");
  if (resultBody) {
    resultBody.innerHTML = `<div class="title">${rname}${sponsorBadge}</div>
      <div class="meta" style="margin:6px 0 10px;">${rating}</div>
      <div class="row">${priceChip}${typeChips}</div>
      <div class="divider"></div>
      <div style="color:#ffe7d6;">${r.address || ''}</div>`;
  }
    
  const hoursBadge = $("#hoursBadge");
  const hoursBox = $("#hoursBox");
  const toggleHours = $("#toggleHours");
  if (hoursBadge) {
    if (r.opening_hours?.open_now !== undefined && r.opening_hours?.open_now !== null) {
      hoursBadge.textContent = r.opening_hours.open_now ? `● ${t("nowOpen")}` : `● ${t("nowClose")}`;
      hoursBadge.className = r.opening_hours.open_now ? "hours-badge open" : "hours-badge closed";
    } else {
      hoursBadge.textContent = "";
    }
  }
  
  if (hoursBox && toggleHours) {
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
  }
  
  const btnMap = $("#btnMap");
  if (btnMap) {
    btnMap.disabled = false;
    btnMap.onclick = ()=> {
      if (r.googleMapsUrl) {
        window.open(r.googleMapsUrl, "_blank");
      } else if (r.location) {
        const lat = r.location.lat || r.location.latitude;
        const lng = r.location.lng || r.location.longitude;
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
      } else {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rname)}`, "_blank");
      }
      analytics.track('action', 'map_click', { place_id: r.id });
      if (r.isSponsored) analytics.trackSponsor(r, 'map');
    };
  }
  
  const btnWebsite = $("#btnWebsite");
  if (btnWebsite) {
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
  }
  
  analytics.track('result_view', r.id, { name: r.name });
}

export function renderFavs() {
  const list = $("#favList");
  if (!list) return;
  list.innerHTML="";
  if(!state.favs.length){ 
      list.innerHTML = `<div class="empty">${t("emptyFav")}</div>`; 
      return;
  }
  state.favs.forEach(id=>{
      const r = state.allDemoData.find(x=>x.id===id); // Favorites should be persistent
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
      
      delBtn.onclick = ()=>{ 
        state.favs = state.favs.filter(x=>x!==id);
        saveFavs(); 
        renderFavs(); 
        analytics.track('fav_remove', r.id);
      };
      viewBtn.onclick = () => { choose(r); closeAllModals(); };
      row.appendChild(left); 
      row.appendChild(actions);
      list.appendChild(row);
  });
}

export function renderHistory() {
  const list = $("#histList");
  if (!list) return;
  list.innerHTML="";
  if(!state.history.length){ 
      list.innerHTML = `<div class="empty">${t("emptyHist")}</div>`; 
      return;
  }
  state.history.forEach(item=>{
      const r = state.allDemoData.find(x=>x.id===item.id); // History should be persistent
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
      const timeStr = new Date(item.ts).toLocaleString(state.lang==="zh"?"zh-TW":"en-US");
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
      viewBtn.onclick = () => { choose(r); closeAllModals(); };
      delBtn.onclick = ()=>{ 
        state.history = state.history.filter(x=>x.ts!==item.ts); 
        saveHistory(); 
        renderHistory(); 
      };
      row.appendChild(left); 
      row.appendChild(actions);
      list.appendChild(row);
  });
}

// ===== MODALS =====
function setFocusToCloseButton(modalId) {
  setTimeout(() => {
      let closeBtn;
      if (modalId === 'modal') closeBtn = $("#btnClose");
      else if (modalId === 'favModal') closeBtn = $("#favClose");
      else if (modalId === 'histModal') closeBtn = $("#histClose");
      if (closeBtn) closeBtn.focus();
  }, 100);
}

export function closeAllModals() {
  document.querySelectorAll('.modal.active, .overlay.active').forEach(el => el.classList.remove('active'));
  if(state.staged && !state.staged.applied){
    state.lang = state.staged.original?.lang ?? state.lang;
    state.currentTheme = state.staged.original?.theme ?? state.currentTheme;
    applyTheme(state.currentTheme);
    renderText();
  }
  state.staged = null;
  updateNavActive('navHome');
}

export function updateNavActive(activeId) {
  ['navHome', 'navFavs', 'navHistory', 'navSettings'].forEach(id => {
    const el = $("#" + id);
    if (el) {
      if (id === activeId) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
}

export function openFavModal(){
  closeAllModals();
  if ($("#favOverlay")) $("#favOverlay").classList.add("active"); 
  if ($("#favModal")) $("#favModal").classList.add("active");
  updateNavActive('navFavs');
  renderFavs();
  setFocusToCloseButton('favModal');
  analytics.track('modal_open', 'favorites');
}

export function openHistModal(){
  closeAllModals();
  if ($("#histOverlay")) $("#histOverlay").classList.add("active"); 
  if ($("#histModal")) $("#histModal").classList.add("active");
  updateNavActive('navHistory');
  renderHistory();
  setFocusToCloseButton('histModal');
  analytics.track('modal_open', 'history');
}

// ✅ 加防呆：元素不存在就跳過（你已移除 types/cuisine 的 DOM）
export function syncUIFromStaged(){
  if (!state.staged) return;
  const langSel = $("#langSelModal");
  if (langSel) langSel.value = state.staged.preview.lang;
  const themeSel = $("#themeSelect");
  if (themeSel) themeSel.value = state.staged.preview.theme;

  const ratingSlider = $("#minRating");
  if (ratingSlider) {
    ratingSlider.value = state.staged.filters.minRating;
    const ratingShow = $("#ratingShow");
    if (ratingShow) ratingShow.textContent = state.staged.filters.minRating.toFixed(1) + "+";
    updateSliderBackground(ratingSlider);
  }

  const distanceSlider = $("#distance");
  if (distanceSlider) {
    distanceSlider.value = state.staged.filters.distance;
    const distanceShow = $("#distanceShow");
    if (distanceShow) distanceShow.textContent = "≤ " + state.staged.filters.distance + "m";
    updateSliderBackground(distanceSlider);
  }
  
  // 類型（單選）下拉：若存在就帶值
  const catSel = $("#categorySelect");
  if (catSel && state.staged.filters?.category) {
    catSel.value = state.staged.filters.category;
  }

  renderText();
  renderOptionPillsFromStaged();
}

// ✅ 加防呆：沒有 rows 就直接 return（免費版可無此區）
export function renderOptionPillsFromStaged(){
  if (!state.staged) return;

  const typeKeys = ["restaurant", "cafe", "bar", "bakery", "meal_takeaway", "meal_delivery"];
  const cuisineKeys = ["japanese", "chinese", "italian", "thai", "korean", "vietnamese", "western", "vegetarian", "seafood", "bbq", "hotpot", "noodles"];
  const priceKeys = [1, 2, 3, 4];
  const priceLabels = ['$', '$$', '$$$', '$$$$'];
  
  const typesRow = $("#typesRow");
  const cuRow = $("#cuisineRow");
  const priceRow = $("#priceRow");

  const currentLang = state.staged ? state.staged.preview.lang : state.lang;
  const typeMap = I18N[currentLang].typeText;
  const cuMap = I18N[currentLang].cuText;

  // 如果這些區塊不存在（免費版），就不渲染
  if (!typesRow && !cuRow && !priceRow) return;

  if (priceRow) {
    priceRow.innerHTML="";
    priceKeys.forEach((level, idx)=>{
      const btn = document.createElement("button"); 
      btn.className="pill"; 
      btn.textContent=priceLabels[idx];
      if(state.staged.filters.priceLevel.has(level)){
        btn.style.background="linear-gradient(180deg, var(--primary), var(--primary-2))"; 
        btn.style.color="#220b07"; 
      }
      btn.onclick = ()=>{
        if(state.staged.filters.priceLevel.has(level)) {
          state.staged.filters.priceLevel.delete(level);
        } else {
          state.staged.filters.priceLevel.add(level);
        }
        renderOptionPillsFromStaged(); 
      };
      priceRow.appendChild(btn);
    });
  }

  if (typesRow) {
    typesRow.innerHTML="";
    typeKeys.forEach(k=>{
      const btn = document.createElement("button"); 
      btn.className="pill"; 
      btn.textContent=typeMap[k] || k;
      if(state.staged.filters.types.has(k)){ 
        btn.style.background="linear-gradient(180deg, var(--primary), var(--primary-2))"; 
        btn.style.color="#220b07"; 
      }
      btn.onclick = ()=>{ 
        if(state.staged.filters.types.has(k)) state.staged.filters.types.delete(k); 
        else state.staged.filters.types.add(k); 
        renderOptionPillsFromStaged(); 
      };
      typesRow.appendChild(btn);
    });
  }

  if (cuRow) {
    cuRow.innerHTML="";
    cuisineKeys.forEach(k=>{
      const btn = document.createElement("button"); 
      btn.className="pill"; 
      btn.textContent=cuMap[k] || k;
      if(state.staged.filters.cuisines.has(k)){ 
        btn.style.background="linear-gradient(180deg, var(--primary), var(--primary-2))"; 
        btn.style.color="#220b07"; 
      }
      btn.onclick = ()=>{ 
        if(state.staged.filters.cuisines.has(k)) state.staged.filters.cuisines.delete(k); 
        else state.staged.filters.cuisines.add(k); 
        renderOptionPillsFromStaged(); 
      };
      cuRow.appendChild(btn);
    });
  }
}

export function clearAllFiltersInModal() {
  if (!state.staged) return;
  state.staged.filters.minRating = CONFIG.DEFAULT_FILTERS.minRating;
  if (state.staged.filters.priceLevel?.clear) state.staged.filters.priceLevel.clear();
  state.staged.filters.distance = CONFIG.DEFAULT_FILTERS.distance;
  if (state.staged.filters.types?.clear) state.staged.filters.types.clear();
  if (state.staged.filters.cuisines?.clear) state.staged.filters.cuisines.clear();
  syncUIFromStaged();
  showToast(t('filtersCleared'), 'success');
  analytics.track('filters', 'clear_all');
}

// ===== Modal 顯示控制（供 app.js 使用）=====
export function showModal(show) {
  if (show) {
    closeAllModals();
    if ($("#overlay")) $("#overlay").classList.add("active");
    if ($("#modal")) $("#modal").classList.add("active");
    updateNavActive('navSettings');
    setFocusToCloseButton('modal');
  } else {
    closeAllModals();
  }
}

// ===== Loading/Error 包裝（供 app.js 使用）=====
export function renderLoading(on) {
  if (on) showSkeletonLoader();
  // 關閉時不特別清空，由 buildPool/renderStack 接手
}
export function renderError(msg) {
  showErrorState(msg || t('error'));
}
