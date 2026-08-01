// ============== 域名防盗锁：仅在 52run.cn 或 localhost 可运行 ==============
(function(){
    var h = window.location.hostname;
    if (h.indexOf('52run.cn') === -1 && h !== 'localhost' && h !== '') {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f5f7;color:#d32f2f;font-size:24px;font-weight:bold;text-align:center;">🚫 访问受限：请访问官方网站 52Run.cn 使用本工具</div>';
        throw new Error('环境异常，停止执行');
    }
})();
// ============== 以下是核心逻辑代码（明文未加密版） ==============
const MATERIAL_GROUPS = [
  { title: '基础数字组（b系列）', items: [ { key: 'b0', label: 'b0' }, { key: 'b1', label: 'b1' }, { key: 'b2', label: 'b2' }, { key: 'b3', label: 'b3' }, { key: 'b4', label: 'b4' }, { key: 'b5', label: 'b5' }, { key: 'b6', label: 'b6' }, { key: 'b7', label: 'b7' }, { key: 'b8', label: 'b8' }, { key: 'b9', label: 'b9' }, { key: 'bgl', label: 'bgl' }, { key: 'bm', label: 'bm' }, { key: 'b2m', label: 'b2m' }, { key: 'bqk', label: 'bqk' }, { key: 'bmi', label: 'bmi' } ] },
  { title: '通用数字组', items: [ { key: '0', label: '0' }, { key: '1', label: '1' }, { key: '2', label: '2' }, { key: '3', label: '3' }, { key: '4', label: '4' }, { key: '5', label: '5' }, { key: '6', label: '6' }, { key: '7', label: '7' }, { key: '8', label: '8' }, { key: '9', label: '9' }, { key: 'ceng', label: 'ceng' }, { key: 'ge', label: 'ge' }, { key: 'hm', label: 'hm' }, { key: 'mi', label: 'mi' }, { key: 'ps1', label: 'ps1' }, { key: 'ps2', label: 'ps2' }, { key: 'qk', label: 'qk' }, { key: 'qks', label: 'qks' }, { key: 'tang', label: 'tang' }, { key: 'wa', label: 'wa' }, { key: 'm', label: 'm' }, { key: '2m', label: '2m' } ] }
];

const materialImages = {};

function loadMaterialImage(key) {
  return new Promise((resolve) => {
    if (materialImages[key]) { resolve(materialImages[key]); return; }
    const img = new Image();
    img.onload = () => { materialImages[key] = img; resolve(img); };
    img.onerror = () => { resolve(null); };
    img.src = `./materials/${key}.jpg`;
  });
}

function preloadAllMaterials() {
  let loaded = 0, total = 0;
  MATERIAL_GROUPS.forEach(g => total += g.items.length);
  MATERIAL_GROUPS.forEach(group => {
    group.items.forEach(item => {
      loadMaterialImage(item.key).then(() => {
        loaded++;
        updateMaterialThumb(item.key);
        if (loaded === total) updateStatus('素材库加载完成');
      });
    });
  });
}

function updateMaterialThumb(key) {
  const imgEl = document.getElementById(`mat-img-${key}`);
  const loadingEl = document.getElementById(`mat-loading-${key}`);
  if (!imgEl) return;
  if (materialImages[key]) {
    imgEl.src = materialImages[key].src;
    imgEl.style.display = '';
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function renderMaterialsPanel() {
  const panel = document.getElementById('materials-panel');
  let html = '';
  MATERIAL_GROUPS.forEach((group, gIdx) => {
    html += `<h3 class="section-title">${group.title}</h3><div class="materials-grid">`;
    group.items.forEach(item => {
      html += `
        <div class="material-item" data-key="${item.key}" title="${item.label}">
          <div class="mat-loading" id="mat-loading-${item.key}"><i class="fa-solid fa-spinner fa-spin"></i></div>
          <img id="mat-img-${item.key}" style="display:none;" alt="${item.label}">
          <div class="label">${item.label}</div>
        </div>`;
    });
    html += `</div>`;
    if (gIdx < MATERIAL_GROUPS.length - 1) html += `<div class="divider"></div>`;
  });
  panel.innerHTML = html;
  panel.querySelectorAll('.material-item').forEach(el => {
    el.addEventListener('click', () => {
      if (!state.baseImage) { showToast('请先上传底图', 'error'); return; }
      if (state.eraseMode) exitEraseMode();
      placeMaterial(el.dataset.key);
    });
  });
}

const state = {
  baseImage: null, baseImageData: null, canvas: null, ctx: null,
  canvasWidth: 800, canvasHeight: 600, canvasZoom: 1, canvasOffsetX: 0, canvasOffsetY: 0,
  materials: [],
  customInfo: {
    avatar: { visible: false, image: null, x: 130, y: 130, scale: 1, id: 'avatar', type: 'avatar' },
    username: { visible: false, text: '用户名61515321', x: 250, y: 110, scale: 1, id: 'username', type: 'username' },
    datetime: { visible: true, year: 2025, month: 6, day: 4, startTime: '16:08', endTime: '16:43', x: 250, y: 160, scale: 1, id: 'datetime', type: 'datetime' }
  },
  selected: null, eraseMode: false, eraseRect: null, isMouseDown: false, dragMode: null,
  dragStart: { x: 0, y: 0 }, elementStart: { x: 0, y: 0, scale: 1 }, resizeInitialDist: 0,
  defaultScale: 100, history: [], alignGuides: [], shiftKey: false,
  panStartScreen: { x: 0, y: 0 }, panStartOffset: { x: 0, y: 0 }, hasPanned: false
};

function init() {
  state.canvas = document.getElementById('main-canvas');
  state.ctx = state.canvas.getContext('2d');
  renderMaterialsPanel(); preloadAllMaterials(); setupEvents();
  state.ctx.fillStyle = '#FFFFFF';
  state.ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  updateCanvasTransform(); updateStatus('就绪');
}

function updateCanvasTransform() {
  const stage = document.getElementById('canvas-stage');
  stage.style.transform = `translate(${state.canvasOffsetX}px, ${state.canvasOffsetY}px) scale(${state.canvasZoom})`;
  document.getElementById('status-zoom').textContent = Math.round(state.canvasZoom * 100) + '%';
}

function setCanvasZoom(zoom, centerX, centerY) {
  const newZoom = Math.max(0.15, Math.min(8, zoom));
  if (centerX !== undefined && centerY !== undefined) {
    const container = document.getElementById('canvas-panel');
    const rect = container.getBoundingClientRect();
    const cx = (centerX - rect.left - state.canvasOffsetX) / state.canvasZoom;
    const cy = (centerY - rect.top - state.canvasOffsetY) / state.canvasZoom;
    state.canvasOffsetX = centerX - rect.left - cx * newZoom;
    state.canvasOffsetY = centerY - rect.top - cy * newZoom;
  }
  state.canvasZoom = newZoom; updateCanvasTransform();
}

function fitCanvasToWindow() {
  if (!state.baseImage) return;
  const container = document.getElementById('canvas-panel');
  const padding = 60; const maxW = container.clientWidth - padding; const maxH = container.clientHeight - padding;
  const zoom = Math.min(maxW / state.canvasWidth, maxH / state.canvasHeight);
  state.canvasZoom = zoom;
  state.canvasOffsetX = (container.clientWidth - state.canvasWidth * zoom) / 2;
  state.canvasOffsetY = (container.clientHeight - state.canvasHeight * zoom) / 2;
  updateCanvasTransform();
}

function getViewportCenterCanvasCoords() {
  const container = document.getElementById('canvas-panel');
  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2; const centerY = rect.height / 2;
  const x = (centerX - state.canvasOffsetX) / state.canvasZoom;
  const y = (centerY - state.canvasOffsetY) / state.canvasZoom;
  return { x, y };
}

function getCanvasCoords(e) {
  const rect = state.canvas.getBoundingClientRect();
  const scaleX = state.canvas.width / rect.width;
  const scaleY = state.canvas.height / rect.height;
  let clientX, clientY;
  if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
  else if (e.changedTouches && e.changedTouches.length > 0) { clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY; }
  else { clientX = e.clientX; clientY = e.clientY; }
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function getElementBounds(el) {
  let w, h; const ctx = state.ctx;
  if (el.type === 'material') { w = el.originalWidth * el.scale; h = el.originalHeight * el.scale; }
  else if (el.type === 'avatar') { w = 96 * el.scale; h = 96 * el.scale; }
  else if (el.type === 'username') {
    ctx.font = `500 ${43 * el.scale}px 'Noto Sans SC', sans-serif`;
    w = ctx.measureText(el.text || '用户名').width; h = 43 * el.scale * 1.2;
  } else if (el.type === 'datetime') {
    const text = formatDateTime(el);
    ctx.font = `${39 * el.scale}px 'Noto Sans SC', sans-serif`;
    w = ctx.measureText(text).width; h = 39 * el.scale * 1.2;
  }
  return { x: el.x - w/2, y: el.y - h/2, w, h };
}

function formatDateTime(el) {
  return `${el.year}/${String(el.month).padStart(2,'0')}/${String(el.day).padStart(2,'0')} ${el.startTime} - ${el.endTime}`;
}

function getResizeHandle(el) {
  const b = getElementBounds(el);
  return { x: b.x + b.w, y: b.y + b.h };
}

function hitTest(x, y) {
  if (state.selected) {
    const handle = getResizeHandle(state.selected);
    const dx = x - handle.x, dy = y - handle.y;
    if (Math.sqrt(dx*dx + dy*dy) < 14) return { type: 'resize', el: state.selected };
  }
  const elements = [
    ...state.materials.slice().reverse(),
    ...(state.customInfo.avatar.visible ? [state.customInfo.avatar] : []),
    ...(state.customInfo.username.visible ? [state.customInfo.username] : []),
    ...(state.customInfo.datetime.visible ? [state.customInfo.datetime] : [])
  ];
  for (const el of elements) {
    const b = getElementBounds(el);
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return { type: 'element', el };
  }
  return null;
}

function render() {
  const ctx = state.ctx;
  ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  if (state.baseImageData) ctx.putImageData(state.baseImageData, 0, 0);
  if (state.eraseRect) {
    ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
    ctx.fillRect(state.eraseRect.x, state.eraseRect.y, state.eraseRect.w, state.eraseRect.h);
    ctx.strokeStyle = '#2196F3'; ctx.setLineDash([6, 3]); ctx.lineWidth = 1.5;
    ctx.strokeRect(state.eraseRect.x, state.eraseRect.y, state.eraseRect.w, state.eraseRect.h);
    ctx.setLineDash([]);
  }
  state.materials.forEach(m => drawElement(m));
  if (state.customInfo.avatar.visible) drawElement(state.customInfo.avatar);
  if (state.customInfo.username.visible) drawElement(state.customInfo.username);
  if (state.customInfo.datetime.visible) drawElement(state.customInfo.datetime);
  state.alignGuides.forEach(g => {
    ctx.strokeStyle = g.highlight ? '#1976D2' : '#2196F3'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (g.type === 'v') { ctx.moveTo(g.x, 0); ctx.lineTo(g.x, state.canvasHeight); }
    else { ctx.moveTo(0, g.y); ctx.lineTo(state.canvasWidth, g.y); }
    ctx.stroke(); ctx.setLineDash([]);
  });
  if (state.selected) drawSelection(state.selected);
}

function drawElement(el) {
  const ctx = state.ctx;
  if (el.type === 'material') {
    const b = getElementBounds(el);
    if (el.image) ctx.drawImage(el.image, b.x, b.y, b.w, b.h);
  } else if (el.type === 'avatar') {
    drawAvatar(el);
  } else if (el.type === 'username') {
    ctx.font = `500 ${43 * el.scale}px 'Noto Sans SC', sans-serif`;
    ctx.fillStyle = '#000000'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const b = getElementBounds(el); ctx.fillText(el.text, b.x, el.y);
  } else if (el.type === 'datetime') {
    const text = formatDateTime(el);
    ctx.font = `${39 * el.scale}px 'Noto Sans SC', sans-serif`;
    ctx.fillStyle = '#888888'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const b = getElementBounds(el); ctx.fillText(text, b.x, el.y);
  }
}

function drawAvatar(avatar) {
  const ctx = state.ctx; const size = 96 * avatar.scale;
  const x = avatar.x - size/2, y = avatar.y - size/2;
  ctx.save(); ctx.beginPath(); ctx.arc(avatar.x, avatar.y, size/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
  if (avatar.image) {
    const img = avatar.image; const minDim = Math.min(img.width, img.height);
    const sx = (img.width - minDim) / 2, sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, x, y, size, size);
  } else {
    ctx.fillStyle = '#CCCCCC'; ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(avatar.x, avatar.y - size*0.15, size*0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(avatar.x, avatar.y + size*0.3, size*0.28, Math.PI, 0); ctx.fill();
  }
  ctx.restore(); ctx.strokeStyle = '#00C853'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(avatar.x, avatar.y, size/2, 0, Math.PI * 2); ctx.stroke();
}

function drawSelection(el) {
  const ctx = state.ctx; const b = getElementBounds(el);
  ctx.strokeStyle = '#2196F3'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
  ctx.strokeRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2); ctx.setLineDash([]);
  ctx.fillStyle = '#2196F3';
  const corners = [
    { x: b.x, y: b.y }, { x: b.x + b.w, y: b.y },
    { x: b.x, y: b.y + b.h }, { x: b.x + b.w, y: b.y + b.h }
  ];
  corners.forEach(c => { ctx.fillRect(c.x - 3, c.y - 3, 6, 6); });
  ctx.fillStyle = '#00C853';
  ctx.beginPath(); ctx.arc(b.x + b.w, b.y + b.h, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5; ctx.stroke();
}

function checkAlignment(draggedEl) {
  const others = [
    ...state.materials.filter(m => m !== draggedEl),
    ...(state.customInfo.avatar.visible && state.customInfo.avatar !== draggedEl ? [state.customInfo.avatar] : []),
    ...(state.customInfo.username.visible && state.customInfo.username !== draggedEl ? [state.customInfo.username] : []),
    ...(state.customInfo.datetime.visible && state.customInfo.datetime !== draggedEl ? [state.customInfo.datetime] : [])
  ];
  if (others.length === 0) { state.alignGuides = []; document.getElementById('align-hint').classList.remove('visible'); return; }
  const threshold = 10; const db = getElementBounds(draggedEl);
  let bestX = null, bestXDist = threshold + 1; let bestY = null, bestYDist = threshold + 1;
  for (const other of others) {
    const ob = getElementBounds(other);
    const xChecks = [
      { dragVal: db.x, otherVal: ob.x, guideX: ob.x },
      { dragVal: db.x + db.w, otherVal: ob.x + ob.w, guideX: ob.x + ob.w },
      { dragVal: db.x + db.w/2, otherVal: ob.x + ob.w/2, guideX: ob.x + ob.w/2 },
      { dragVal: db.x, otherVal: ob.x + ob.w, guideX: ob.x + ob.w },
      { dragVal: db.x + db.w, otherVal: ob.x, guideX: ob.x },
    ];
    for (const c of xChecks) { const dist = Math.abs(c.dragVal - c.otherVal); if (dist < bestXDist) { bestXDist = dist; bestX = { guideX: c.guideX, delta: c.otherVal - c.dragVal }; } }
    const yChecks = [
      { dragVal: db.y, otherVal: ob.y, guideY: ob.y },
      { dragVal: db.y + db.h, otherVal: ob.y + ob.h, guideY: ob.y + ob.h },
      { dragVal: db.y + db.h/2, otherVal: ob.y + ob.h/2, guideY: ob.y + ob.h/2 },
      { dragVal: db.y, otherVal: ob.y + ob.h, guideY: ob.y + ob.h },
      { dragVal: db.y + db.h, otherVal: ob.y, guideY: ob.y },
    ];
    for (const c of yChecks) { const dist = Math.abs(c.dragVal - c.otherVal); if (dist < bestYDist) { bestYDist = dist; bestY = { guideY: c.guideY, delta: c.otherVal - c.dragVal }; } }
  }
  const guides = [];
  if (bestX && bestXDist <= threshold) { draggedEl.x += bestX.delta; guides.push({ type: 'v', x: bestX.guideX, highlight: true }); }
  if (bestY && bestYDist <= threshold) { draggedEl.y += bestY.delta; guides.push({ type: 'h', y: bestY.guideY, highlight: true }); }
  state.alignGuides = guides;
  document.getElementById('align-hint').classList.toggle('visible', guides.length > 0);
}

function setupEvents() {
  const canvas = state.canvas; const panel = document.getElementById('canvas-panel');
  canvas.addEventListener('mousedown', onPointerDown); canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp); canvas.addEventListener('mouseleave', onPointerUp);
  canvas.addEventListener('contextmenu', e => { e.preventDefault(); if (state.eraseRect) { state.eraseRect = null; state.dragMode = null; state.isMouseDown = false; render(); } });
  canvas.addEventListener('touchstart', onPointerDown, { passive: false }); canvas.addEventListener('touchmove', onPointerMove, { passive: false }); canvas.addEventListener('touchend', onPointerUp);
  panel.addEventListener('wheel', (e) => { if (!state.baseImage) return; e.preventDefault(); const delta = e.deltaY < 0 ? 1.12 : 1/1.12; setCanvasZoom(state.canvasZoom * delta, e.clientX, e.clientY); }, { passive: false });
  document.addEventListener('keydown', onKeyDown); document.addEventListener('keyup', e => { state.shiftKey = e.shiftKey; });
  document.getElementById('upload-btn').onclick = () => document.getElementById('file-input').click();
  document.getElementById('file-input').onchange = onUploadBaseImage;
  document.getElementById('erase-btn').onclick = toggleEraseMode;
  document.getElementById('undo-btn').onclick = undo;
  document.getElementById('reset-btn').onclick = confirmReset;
  document.getElementById('export-btn').onclick = exportJPG;
  document.getElementById('scale-inc').onclick = () => adjustScaleInput(10);
  document.getElementById('scale-dec').onclick = () => adjustScaleInput(-10);
  document.getElementById('scale-input').onchange = onScaleInputChange;
  document.getElementById('set-default-scale').onclick = setAsDefaultScale;
  document.getElementById('zoom-in').onclick = () => { const rect = document.getElementById('canvas-panel').getBoundingClientRect(); setCanvasZoom(state.canvasZoom * 1.2, rect.left + rect.width/2, rect.top + rect.height/2); };
  document.getElementById('zoom-out').onclick = () => { const rect = document.getElementById('canvas-panel').getBoundingClientRect(); setCanvasZoom(state.canvasZoom / 1.2, rect.left + rect.width/2, rect.top + rect.height/2); };
  document.getElementById('zoom-fit').onclick = fitCanvasToWindow;
  window.addEventListener('resize', () => { if (state.baseImage) fitCanvasToWindow(); });
  document.getElementById('help-btn').onclick = () => document.getElementById('help-modal-mask').classList.add('visible');
  document.getElementById('help-modal-close').onclick = () => document.getElementById('help-modal-mask').classList.remove('visible');
  document.getElementById('help-modal-mask').addEventListener('click', (e) => { if (e.target.id === 'help-modal-mask') e.target.classList.remove('visible'); });
  document.getElementById('show-avatar').onchange = e => {
    state.customInfo.avatar.visible = e.target.checked;
    document.getElementById('avatar-control').classList.toggle('hidden', !e.target.checked);
    document.getElementById('avatar-tag').classList.toggle('on', e.target.checked);
    document.getElementById('avatar-tag').textContent = e.target.checked ? '开' : '关';
    if (e.target.checked) pushHistory(); render();
  };
  document.getElementById('show-username').onchange = e => {
    state.customInfo.username.visible = e.target.checked;
    document.getElementById('username-control').classList.toggle('hidden', !e.target.checked);
    document.getElementById('username-tag').classList.toggle('on', e.target.checked);
    document.getElementById('username-tag').textContent = e.target.checked ? '开' : '关';
    if (e.target.checked) pushHistory(); render();
  };
  document.getElementById('show-datetime').onchange = e => {
    state.customInfo.datetime.visible = e.target.checked;
    document.getElementById('datetime-tag').classList.toggle('on', e.target.checked);
    document.getElementById('datetime-tag').textContent = e.target.checked ? '开' : '关';
    pushHistory(); render();
  };
  document.getElementById('upload-avatar-btn').onclick = () => document.getElementById('avatar-input').click();
  document.getElementById('avatar-input').onchange = onUploadAvatar;
  document.getElementById('delete-avatar-btn').onclick = deleteAvatar;
  document.getElementById('username-input').oninput = e => { state.customInfo.username.text = e.target.value || '用户名61515321'; render(); };
  ['year-input', 'month-input', 'day-input', 'start-time', 'end-time'].forEach(id => {
    document.getElementById(id).oninput = () => {
      const d = state.customInfo.datetime;
      d.year = parseInt(document.getElementById('year-input').value) || 2025;
      d.month = parseInt(document.getElementById('month-input').value) || 1;
      d.day = parseInt(document.getElementById('day-input').value) || 1;
      d.startTime = document.getElementById('start-time').value || '00:00';
      d.endTime = document.getElementById('end-time').value || '00:00';
      render();
    };
  });
}

function onPointerDown(e) {
  e.preventDefault(); if (!state.baseImage) return;
  const pos = getCanvasCoords(e); state.isMouseDown = true; state.dragStart = pos; state.hasPanned = false;
  if (state.eraseMode) { state.dragMode = 'erase'; state.eraseRect = { x: pos.x, y: pos.y, w: 0, h: 0 }; return; }
  const hit = hitTest(pos.x, pos.y);
  if (hit && hit.type === 'resize') {
    state.selected = hit.el; state.dragMode = 'resize';
    state.elementStart = { x: hit.el.x, y: hit.el.y, scale: hit.el.scale };
    const dx = pos.x - hit.el.x, dy = pos.y - hit.el.y;
    state.resizeInitialDist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
  } else if (hit && hit.type === 'element') {
    if (state.selected !== hit.el) {
      state.selected = hit.el;
      if (hit.el.type === 'material') { const idx = state.materials.indexOf(hit.el); if (idx >= 0) { state.materials.splice(idx, 1); state.materials.push(hit.el); } }
    }
    state.dragMode = 'move'; state.elementStart = { x: hit.el.x, y: hit.el.y };
    updateScaleInputFromSelection();
  } else {
    state.dragMode = 'pan'; let cx = e.clientX, cy = e.clientY;
    if (e.touches && e.touches[0]) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    state.panStartScreen = { x: cx, y: cy }; state.panStartOffset = { x: state.canvasOffsetX, y: state.canvasOffsetY };
  }
  render();
}

function onPointerMove(e) {
  if (e.preventDefault) e.preventDefault();
  const pos = getCanvasCoords(e);
  document.getElementById('status-coord').textContent = `${Math.round(pos.x)}, ${Math.round(pos.y)}`;
  if (!state.isMouseDown) {
    if (state.eraseMode) { state.canvas.style.cursor = 'crosshair'; }
    else {
      const hit = hitTest(pos.x, pos.y);
      if (hit && hit.type === 'resize') state.canvas.style.cursor = 'nwse-resize';
      else if (hit && hit.type === 'element') state.canvas.style.cursor = 'move';
      else state.canvas.style.cursor = 'grab';
    }
    return;
  }
  if (state.dragMode === 'erase') {
    state.eraseRect = { x: Math.min(state.dragStart.x, pos.x), y: Math.min(state.dragStart.y, pos.y), w: Math.abs(pos.x - state.dragStart.x), h: Math.abs(pos.y - state.dragStart.y) };
    render();
  } else if (state.dragMode === 'move' && state.selected) {
    const dx = pos.x - state.dragStart.x; const dy = pos.y - state.dragStart.y;
    state.selected.x = state.elementStart.x + dx; state.selected.y = state.elementStart.y + dy;
    if (!state.shiftKey) checkAlignment(state.selected); render();
  } else if (state.dragMode === 'resize' && state.selected) {
    const el = state.selected; const dx = pos.x - el.x, dy = pos.y - el.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    let newScale = state.elementStart.scale * (dist / Math.max(1, state.resizeInitialDist));
    newScale = Math.max(0.2, Math.min(3, newScale));
    el.scale = newScale; updateScaleInputFromSelection(); render();
  } else if (state.dragMode === 'pan') {
    let cx = e.clientX, cy = e.clientY;
    if (e.touches && e.touches[0]) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    const dx = cx - state.panStartScreen.x; const dy = cy - state.panStartScreen.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) { state.hasPanned = true; state.canvas.style.cursor = 'grabbing'; }
    if (state.hasPanned) { state.canvasOffsetX = state.panStartOffset.x + dx; state.canvasOffsetY = state.panStartOffset.y + dy; updateCanvasTransform(); }
  }
}

function onPointerUp(e) {
  if (!state.isMouseDown) return;
  state.isMouseDown = false;
  if (state.dragMode === 'erase' && state.eraseRect) {
    if (state.eraseRect.w > 2 && state.eraseRect.h > 2) {
      pushHistory(); applyErase(state.eraseRect); updateStatus('已擦除区域'); exitEraseMode();
      showToast('区域已擦除，已自动退出擦除模式', 'success');
    } else { state.eraseRect = null; state.dragMode = null; render(); }
  } else if (state.dragMode === 'pan') {
    if (!state.hasPanned) { state.selected = null; render(); }
    state.canvas.style.cursor = 'grab'; state.dragMode = null;
  } else if (state.dragMode === 'move' || state.dragMode === 'resize') {
    if (state.selected) {
      if (state.dragMode === 'move') { const moved = Math.abs(state.selected.x - state.elementStart.x) > 0.5 || Math.abs(state.selected.y - state.elementStart.y) > 0.5; if (moved) pushHistory(); }
      else if (state.dragMode === 'resize') { const scaled = Math.abs(state.selected.scale - state.elementStart.scale) > 0.001; if (scaled) pushHistory(); }
    }
    state.alignGuides = []; document.getElementById('align-hint').classList.remove('visible');
    state.dragMode = null; render();
  }
}

function onKeyDown(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  state.shiftKey = e.shiftKey;
  if (e.key === 'Escape') {
    if (state.eraseRect) { state.eraseRect = null; state.isMouseDown = false; state.dragMode = null; render(); }
    else if (state.selected) { state.selected = null; render(); }
    return;
  }
  if (!state.selected) return;
  const el = state.selected; const step = e.shiftKey ? 10 : 1;
  switch (e.key) {
    case 'ArrowLeft': el.x -= step; e.preventDefault(); break;
    case 'ArrowRight': el.x += step; e.preventDefault(); break;
    case 'ArrowUp': el.y -= step; e.preventDefault(); break;
    case 'ArrowDown': el.y += step; e.preventDefault(); break;
    case 'Delete': case 'Backspace':
      if (el.type === 'datetime') { showToast('日期时间不可删除，可取消勾选隐藏', 'error'); return; }
      deleteElement(el); e.preventDefault(); return;
    case '+': case '=': el.scale = Math.min(3, el.scale + 0.1); updateScaleInputFromSelection(); e.preventDefault(); break;
    case '-': case '_': el.scale = Math.max(0.2, el.scale - 0.1); updateScaleInputFromSelection(); e.preventDefault(); break;
    default: return;
  }
  pushHistory(); render();
}

function applyErase(rect) {
  const ctx = state.ctx;
  ctx.putImageData(state.baseImageData, 0, 0);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  state.baseImageData = ctx.getImageData(0, 0, state.canvasWidth, state.canvasHeight);
  render();
}

function toggleEraseMode() { state.eraseMode ? exitEraseMode() : enterEraseMode(); }
function enterEraseMode() {
  state.eraseMode = true; document.getElementById('erase-btn').classList.add('active');
  state.canvas.style.cursor = 'crosshair'; state.selected = null;
  updateStatus('擦除模式：按住拖拽框选区域，松开涂白'); render();
}
function exitEraseMode() {
  state.eraseMode = false; state.eraseRect = null; state.dragMode = null; state.isMouseDown = false;
  document.getElementById('erase-btn').classList.remove('active');
  state.canvas.style.cursor = 'default'; updateStatus('正常模式'); render();
}

function onUploadBaseImage(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const hasContent = state.materials.length > 0 || state.history.length > 0;
      if (state.baseImage && hasContent) { showModal('更换底图', '更换底图将清空画布上所有已放置的素材和擦除操作，是否继续？', () => loadBaseImage(img)); }
      else { loadBaseImage(img); }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file); e.target.value = '';
}

function loadBaseImage(img) {
  state.baseImage = img; state.canvasWidth = img.width; state.canvasHeight = img.height;
  state.canvas.width = img.width; state.canvas.height = img.height;
  state.ctx.drawImage(img, 0, 0);
  state.baseImageData = state.ctx.getImageData(0, 0, img.width, img.height);
  state.materials = []; state.selected = null; state.history = [];
  if (state.eraseMode) exitEraseMode();
  state.customInfo.avatar.x = 130; state.customInfo.avatar.y = 130;
  state.customInfo.username.x = 250; state.customInfo.username.y = 110;
  state.customInfo.datetime.x = 250; state.customInfo.datetime.y = 160;
  document.getElementById('canvas-empty').style.display = 'none';
  document.getElementById('canvas-info-text').textContent = `${img.width} × ${img.height} | 滚轮缩放 | 拖动空白处平移`;
  fitCanvasToWindow(); render();
  updateStatus(`底图已加载：${img.width}×${img.height}`);
  showToast('底图加载成功', 'success');
}

function onUploadAvatar(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      state.customInfo.avatar.image = img;
      const preview = document.getElementById('avatar-preview');
      preview.style.backgroundImage = `url(${ev.target.result})`;
      preview.classList.add('has-image');
      pushHistory(); render(); showToast('头像已更新', 'success');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file); e.target.value = '';
}

function deleteAvatar() {
  state.customInfo.avatar.image = null;
  const preview = document.getElementById('avatar-preview');
  preview.style.backgroundImage = ''; preview.classList.remove('has-image');
  pushHistory(); render(); showToast('头像已删除', 'success');
}

async function placeMaterial(key) {
  if (!materialImages[key]) {
    showToast('素材加载中，请稍候...', 'info');
    await loadMaterialImage(key);
    if (!materialImages[key]) { showToast('素材加载失败，请检查 ./materials/ 目录', 'error'); return; }
  }
  const img = materialImages[key];
  const center = getViewportCenterCanvasCoords();
  const newMat = {
    id: 'mat_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    type: 'material', materialKey: key, image: img,
    originalWidth: img.naturalWidth, originalHeight: img.naturalHeight,
    x: center.x, y: center.y, scale: state.defaultScale / 100
  };
  state.materials.push(newMat); state.selected = newMat;
  pushHistory(); updateScaleInputFromSelection(); render();
  updateStatus(`已放置素材：${key}`);
}

function deleteElement(el) {
  pushHistory();
  if (el.type === 'material') { const idx = state.materials.indexOf(el); if (idx >= 0) state.materials.splice(idx, 1); }
  else if (el.type === 'avatar') {
    state.customInfo.avatar.image = null;
    const preview = document.getElementById('avatar-preview');
    preview.style.backgroundImage = ''; preview.classList.remove('has-image');
  } else if (el.type === 'username') {
    state.customInfo.username.text = '用户名61515321';
    document.getElementById('username-input').value = '用户名61515321';
  }
  state.selected = null; render(); showToast('已删除', 'success');
}

function adjustScaleInput(delta) {
  const input = document.getElementById('scale-input');
  let v = parseInt(input.value) + delta;
  v = Math.max(20, Math.min(300, v));
  input.value = v; state.defaultScale = v;
}
function onScaleInputChange(e) {
  let v = parseInt(e.target.value) || 100;
  v = Math.max(20, Math.min(300, v));
  e.target.value = v; state.defaultScale = v;
}
function updateScaleInputFromSelection() {
  if (state.selected) { const v = Math.round(state.selected.scale * 100); document.getElementById('scale-input').value = v; }
}
function setAsDefaultScale() {
  if (!state.selected) { showToast('请先选中一个素材作为参考', 'error'); return; }
  const v = Math.round(state.selected.scale * 100);
  state.defaultScale = v;
  document.getElementById('scale-input').value = v;
  showToast(`已设为后续素材默认比例：${v}%`, 'success');
}

function pushHistory() {
  const ci = state.customInfo;
  const snap = {
    materials: state.materials.map(m => ({...m})),
    customInfo: {
      avatar: { visible: ci.avatar.visible, image: ci.avatar.image, x: ci.avatar.x, y: ci.avatar.y, scale: ci.avatar.scale, id: 'avatar', type: 'avatar' },
      username: { visible: ci.username.visible, text: ci.username.text, x: ci.username.x, y: ci.username.y, scale: ci.username.scale, id: 'username', type: 'username' },
      datetime: { visible: ci.datetime.visible, year: ci.datetime.year, month: ci.datetime.month, day: ci.datetime.day, startTime: ci.datetime.startTime, endTime: ci.datetime.endTime, x: ci.datetime.x, y: ci.datetime.y, scale: ci.datetime.scale, id: 'datetime', type: 'datetime' }
    },
    baseImageData: state.baseImageData ? new ImageData(new Uint8ClampedArray(state.baseImageData.data), state.baseImageData.width, state.baseImageData.height) : null
  };
  state.history.push(snap);
  if (state.history.length > 50) state.history.shift();
}

function undo() {
  if (state.history.length === 0) { showToast('没有可撤销的操作', 'error'); return; }
  const snap = state.history.pop();
  state.materials = snap.materials; state.customInfo = snap.customInfo; state.baseImageData = snap.baseImageData;
  state.selected = null; state.alignGuides = [];
  document.getElementById('align-hint').classList.remove('visible');
  document.getElementById('show-avatar').checked = state.customInfo.avatar.visible;
  document.getElementById('show-username').checked = state.customInfo.username.visible;
  document.getElementById('show-datetime').checked = state.customInfo.datetime.visible;
  document.getElementById('avatar-control').classList.toggle('hidden', !state.customInfo.avatar.visible);
  document.getElementById('username-control').classList.toggle('hidden', !state.customInfo.username.visible);
  document.getElementById('avatar-tag').classList.toggle('on', state.customInfo.avatar.visible);
  document.getElementById('username-tag').classList.toggle('on', state.customInfo.username.visible);
  document.getElementById('datetime-tag').classList.toggle('on', state.customInfo.datetime.visible);
  document.getElementById('avatar-tag').textContent = state.customInfo.avatar.visible ? '开' : '关';
  document.getElementById('username-tag').textContent = state.customInfo.username.visible ? '开' : '关';
  document.getElementById('datetime-tag').textContent = state.customInfo.datetime.visible ? '开' : '关';
  document.getElementById('username-input').value = state.customInfo.username.text;
  document.getElementById('year-input').value = state.customInfo.datetime.year;
  document.getElementById('month-input').value = state.customInfo.datetime.month;
  document.getElementById('day-input').value = state.customInfo.datetime.day;
  document.getElementById('start-time').value = state.customInfo.datetime.startTime;
  document.getElementById('end-time').value = state.customInfo.datetime.endTime;
  const preview = document.getElementById('avatar-preview');
  if (state.customInfo.avatar.image) {
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = state.customInfo.avatar.image.width;
    tmpCanvas.height = state.customInfo.avatar.image.height;
    tmpCanvas.getContext('2d').drawImage(state.customInfo.avatar.image, 0, 0);
    preview.style.backgroundImage = `url(${tmpCanvas.toDataURL()})`;
    preview.classList.add('has-image');
  } else { preview.style.backgroundImage = ''; preview.classList.remove('has-image'); }
  render(); showToast('已撤销', 'success');
}

function confirmReset() {
  if (!state.baseImage) { showToast('请先上传底图', 'error'); return; }
  showModal('重置画布', '确定要清空画布吗？此操作不可恢复', () => {
    state.materials = []; state.selected = null; state.alignGuides = [];
    if (state.eraseMode) exitEraseMode();
    if (state.baseImage) { state.ctx.drawImage(state.baseImage, 0, 0); state.baseImageData = state.ctx.getImageData(0,0,state.canvasWidth,state.canvasHeight); }
    state.history = []; render(); showToast('画布已重置', 'success');
  });
}

function exportJPG() {
  if (!state.baseImage) { showToast('请先上传底图', 'error'); return; }
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.canvasWidth; exportCanvas.height = state.canvasHeight;
  const ectx = exportCanvas.getContext('2d');
  ectx.fillStyle = '#FFFFFF';
  ectx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  if (state.baseImageData) ectx.putImageData(state.baseImageData, 0, 0);
  const originalCtx = state.ctx; state.ctx = ectx;
  const oldSelected = state.selected; const oldGuides = state.alignGuides;
  state.selected = null; state.alignGuides = [];
  state.materials.forEach(m => drawElement(m));
  if (state.customInfo.avatar.visible) drawElement(state.customInfo.avatar);
  if (state.customInfo.username.visible) drawElement(state.customInfo.username);
  if (state.customInfo.datetime.visible) drawElement(state.customInfo.datetime);
  state.ctx = originalCtx; state.selected = oldSelected; state.alignGuides = oldGuides;
  exportCanvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '拼图完成.jpg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast('已导出 拼图完成.jpg', 'success');
  }, 'image/jpeg', 0.92);
}

function updateStatus(msg) { document.getElementById('status-msg').textContent = msg; }
let toastTimer = null;
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.className = 'toast ' + type + ' visible';
  const icon = toast.querySelector('i');
  icon.className = type === 'success' ? 'fa-solid fa-circle-check' :
                   type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-info';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}
function showModal(title, msg, onOk) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-msg').textContent = msg;
  const mask = document.getElementById('modal-mask');
  mask.classList.add('visible');
  const ok = document.getElementById('modal-ok');
  const cancel = document.getElementById('modal-cancel');
  const close = () => mask.classList.remove('visible');
  ok.onclick = () => { close(); onOk(); };
  cancel.onclick = close;
}

init();
