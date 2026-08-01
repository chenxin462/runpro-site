// ============== 域名防盗锁：仅在 52run.cn 或 localhost 可运行 ==============
(function(){
    var _HEHCHgB = window.location.hostname;
    if (h.indexOf('\x35\x32\x72\x75\x6e\x2e\x63\x6e') === -1 && h !== '\x6c\x6f\x63\x61\x6c\x68\x6f\x73\x74' && h !== '') {
        document.body.innerHTML = '\x3c\x64\x69\x76\x20\x73\x74\x79\x6c\x65\x3d\x22\x64\x69\x73\x70\x6c\x61\x79\x3a\x66\x6c\x65\x78\x3b\x61\x6c\x69\x67\x6e\x2d\x69\x74\x65\x6d\x73\x3a\x63\x65\x6e\x74\x65\x72\x3b\x6a\x75\x73\x74\x69\x66\x79\x2d\x63\x6f\x6e\x74\x65\x6e\x74\x3a\x63\x65\x6e\x74\x65\x72\x3b\x68\x65\x69\x67\x68\x74\x3a\x31\x30\x30\x76\x68\x3b\x62\x61\x63\x6b\x67\x72\x6f\x75\x6e\x64\x3a\x23\x66\x35\x66\x35\x66\x37\x3b\x63\x6f\x6c\x6f\x72\x3a\x23\x64\x33\x32\x66\x32\x66\x3b\x66\x6f\x6e\x74\x2d\x73\x69\x7a\x65\x3a\x32\x34\x70\x78\x3b\x66\x6f\x6e\x74\x2d\x77\x65\x69\x67\x68\x74\x3a\x62\x6f\x6c\x64\x3b\x74\x65\x78\x74\x2d\x61\x6c\x69\x67\x6e\x3a\x63\x65\x6e\x74\x65\x72\x3b\x22\x3e\xd83d\xdeab\x20\x8bbf\x95ee\x53d7\x9650\xff1a\x8bf7\x8bbf\x95ee\x5b98\x65b9\x7f51\x7ad9\x20\x35\x32\x52\x75\x6e\x2e\x63\x6e\x20\x4f7f\x7528\x672c\x5de5\x5177\x3c\x2f\x64\x69\x76\x3e';
        throw new Error('\x73af\x5883\x5f02\x5e38\xff0c\x505c\x6b62\x6267\x884c');
    }
})();
// ============== 以下是核心逻辑代码（明文未加密版） ==============
const _OZRP = [
  { title: '\x57fa\x7840\x6570\x5b57\x7ec4\xff08\x62\x7cfb\x5217\xff09', items: [ { key: '\x62\x30', label: '\x62\x30' }, { key: '\x62\x31', label: '\x62\x31' }, { key: '\x62\x32', label: '\x62\x32' }, { key: '\x62\x33', label: '\x62\x33' }, { key: '\x62\x34', label: '\x62\x34' }, { key: '\x62\x35', label: '\x62\x35' }, { key: '\x62\x36', label: '\x62\x36' }, { key: '\x62\x37', label: '\x62\x37' }, { key: '\x62\x38', label: '\x62\x38' }, { key: '\x62\x39', label: '\x62\x39' }, { key: '\x62\x67\x6c', label: '\x62\x67\x6c' }, { key: '\x62\x6d', label: '\x62\x6d' }, { key: '\x62\x32\x6d', label: '\x62\x32\x6d' }, { key: '\x62\x71\x6b', label: '\x62\x71\x6b' }, { key: '\x62\x6d\x69', label: '\x62\x6d\x69' } ] },
  { title: '\x901a\x7528\x6570\x5b57\x7ec4', items: [ { key: '\x30', label: '\x30' }, { key: '\x31', label: '\x31' }, { key: '\x32', label: '\x32' }, { key: '\x33', label: '\x33' }, { key: '\x34', label: '\x34' }, { key: '\x35', label: '\x35' }, { key: '\x36', label: '\x36' }, { key: '\x37', label: '\x37' }, { key: '\x38', label: '\x38' }, { key: '\x39', label: '\x39' }, { key: '\x63\x65\x6e\x67', label: '\x63\x65\x6e\x67' }, { key: '\x67\x65', label: '\x67\x65' }, { key: '\x68\x6d', label: '\x68\x6d' }, { key: '\x6d\x69', label: '\x6d\x69' }, { key: '\x70\x73\x31', label: '\x70\x73\x31' }, { key: '\x70\x73\x32', label: '\x70\x73\x32' }, { key: '\x71\x6b', label: '\x71\x6b' }, { key: '\x71\x6b\x73', label: '\x71\x6b\x73' }, { key: '\x74\x61\x6e\x67', label: '\x74\x61\x6e\x67' }, { key: '\x77\x61', label: '\x77\x61' }, { key: '\x6d', label: '\x6d' }, { key: '\x32\x6d', label: '\x32\x6d' } ] }
];

const _aOXqu = {};

function fneDUbx(key) {
  return new Promise((resolve) => {
    if (materialImages[key]) { resolve(materialImages[key]); return; }
    const _kZm = new Image();
    img.onload = () => { materialImages[key] = img; resolve(img); };
    img.onerror = () => { resolve(null); };
    img.src = `\x2e\x2f\x6d\x61\x74\x65\x72\x69\x61\x6c\x73\x2f\x24\x7b\x6b\x65\x79\x7d\x2e\x6a\x70\x67`;
  });
}

function fnoHOALnc() {
  let _RNdRit = 0, total = 0;
  MATERIAL_GROUPS.forEach(g => total += g.items.length);
  MATERIAL_GROUPS.forEach(group => {
    group.items.forEach(item => {
      loadMaterialImage(item.key).then(() => {
        loaded++;
        updateMaterialThumb(item.key);
        if (loaded === total) updateStatus('\x7d20\x6750\x5e93\x52a0\x8f7d\x5b8c\x6210');
      });
    });
  });
}

function fnXoMjzK(key) {
  const _HHqRiRx = document.getElementById(`\x6d\x61\x74\x2d\x69\x6d\x67\x2d\x24\x7b\x6b\x65\x79\x7d`);
  const _GJTwpKtM = document.getElementById(`\x6d\x61\x74\x2d\x6c\x6f\x61\x64\x69\x6e\x67\x2d\x24\x7b\x6b\x65\x79\x7d`);
  if (!imgEl) return;
  if (materialImages[key]) {
    imgEl.src = materialImages[key].src;
    imgEl.style.display = '';
    if (loadingEl) loadingEl.style.display = '\x6e\x6f\x6e\x65';
  }
}

function fnhoQT() {
  const _tAyG = document.getElementById('\x6d\x61\x74\x65\x72\x69\x61\x6c\x73\x2d\x70\x61\x6e\x65\x6c');
  let _iWboekj = '';
  MATERIAL_GROUPS.forEach((group, gIdx) => {
    html += `\x3c\x68\x33\x20\x63\x6c\x61\x73\x73\x3d\x22\x73\x65\x63\x74\x69\x6f\x6e\x2d\x74\x69\x74\x6c\x65\x22\x3e\x24\x7b\x67\x72\x6f\x75\x70\x2e\x74\x69\x74\x6c\x65\x7d\x3c\x2f\x68\x33\x3e\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x74\x65\x72\x69\x61\x6c\x73\x2d\x67\x72\x69\x64\x22\x3e`;
    group.items.forEach(item => {
      html += `\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x74\x65\x72\x69\x61\x6c\x2d\x69\x74\x65\x6d\x22\x20\x64\x61\x74\x61\x2d\x6b\x65\x79\x3d\x22\x24\x7b\x69\x74\x65\x6d\x2e\x6b\x65\x79\x7d\x22\x20\x74\x69\x74\x6c\x65\x3d\x22\x24\x7b\x69\x74\x65\x6d\x2e\x6c\x61\x62\x65\x6c\x7d\x22\x3e\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x6d\x61\x74\x2d\x6c\x6f\x61\x64\x69\x6e\x67\x22\x20\x69\x64\x3d\x22\x6d\x61\x74\x2d\x6c\x6f\x61\x64\x69\x6e\x67\x2d\x24\x7b\x69\x74\x65\x6d\x2e\x6b\x65\x79\x7d\x22\x3e\x3c\x69\x20\x63\x6c\x61\x73\x73\x3d\x22\x66\x61\x2d\x73\x6f\x6c\x69\x64\x20\x66\x61\x2d\x73\x70\x69\x6e\x6e\x65\x72\x20\x66\x61\x2d\x73\x70\x69\x6e\x22\x3e\x3c\x2f\x69\x3e\x3c\x2f\x64\x69\x76\x3e\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3c\x69\x6d\x67\x20\x69\x64\x3d\x22\x6d\x61\x74\x2d\x69\x6d\x67\x2d\x24\x7b\x69\x74\x65\x6d\x2e\x6b\x65\x79\x7d\x22\x20\x73\x74\x79\x6c\x65\x3d\x22\x64\x69\x73\x70\x6c\x61\x79\x3a\x6e\x6f\x6e\x65\x3b\x22\x20\x61\x6c\x74\x3d\x22\x24\x7b\x69\x74\x65\x6d\x2e\x6c\x61\x62\x65\x6c\x7d\x22\x3e\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x6c\x61\x62\x65\x6c\x22\x3e\x24\x7b\x69\x74\x65\x6d\x2e\x6c\x61\x62\x65\x6c\x7d\x3c\x2f\x64\x69\x76\x3e\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x3c\x2f\x64\x69\x76\x3e`;
    });
    html += `\x3c\x2f\x64\x69\x76\x3e`;
    if (gIdx < MATERIAL_GROUPS.length - 1) html += `\x3c\x64\x69\x76\x20\x63\x6c\x61\x73\x73\x3d\x22\x64\x69\x76\x69\x64\x65\x72\x22\x3e\x3c\x2f\x64\x69\x76\x3e`;
  });
  panel.innerHTML = html;
  panel.querySelectorAll('\x2e\x6d\x61\x74\x65\x72\x69\x61\x6c\x2d\x69\x74\x65\x6d').forEach(el => {
    el.addEventListener('\x63\x6c\x69\x63\x6b', () => {
      if (!state.baseImage) { showToast('\x8bf7\x5148\x4e0a\x4f20\x5e95\x56fe', '\x65\x72\x72\x6f\x72'); return; }
      if (state.eraseMode) exitEraseMode();
      placeMaterial(el.dataset.key);
    });
  });
}

const _EWZqRGj = {
  baseImage: null, baseImageData: null, canvas: null, ctx: null,
  canvasWidth: 800, canvasHeight: 600, canvasZoom: 1, canvasOffsetX: 0, canvasOffsetY: 0,
  materials: [],
  customInfo: {
    avatar: { visible: false, image: null, x: 130, y: 130, scale: 1, id: '\x61\x76\x61\x74\x61\x72', type: '\x61\x76\x61\x74\x61\x72' },
    username: { visible: false, text: '\x7528\x6237\x540d\x36\x31\x35\x31\x35\x33\x32\x31', x: 250, y: 110, scale: 1, id: '\x75\x73\x65\x72\x6e\x61\x6d\x65', type: '\x75\x73\x65\x72\x6e\x61\x6d\x65' },
    datetime: { visible: true, year: 2025, month: 6, day: 4, startTime: '\x31\x36\x3a\x30\x38', endTime: '\x31\x36\x3a\x34\x33', x: 250, y: 160, scale: 1, id: '\x64\x61\x74\x65\x74\x69\x6d\x65', type: '\x64\x61\x74\x65\x74\x69\x6d\x65' }
  },
  selected: null, eraseMode: false, eraseRect: null, isMouseDown: false, dragMode: null,
  dragStart: { x: 0, y: 0 }, elementStart: { x: 0, y: 0, scale: 1 }, resizeInitialDist: 0,
  defaultScale: 100, history: [], alignGuides: [], shiftKey: false,
  panStartScreen: { x: 0, y: 0 }, panStartOffset: { x: 0, y: 0 }, hasPanned: false
};

function fnGLzAC() {
  state.canvas = document.getElementById('\x6d\x61\x69\x6e\x2d\x63\x61\x6e\x76\x61\x73');
  state.ctx = state.canvas.getContext('\x32\x64');
  renderMaterialsPanel(); preloadAllMaterials(); setupEvents();
  state.ctx.fillStyle = '\x23\x46\x46\x46\x46\x46\x46';
  state.ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  updateCanvasTransform(); updateStatus('\x5c31\x7eea');
}

function fnNcqswK() {
  const _CoIzX = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x73\x74\x61\x67\x65');
  stage.style.transform = `\x74\x72\x61\x6e\x73\x6c\x61\x74\x65\x28\x24\x7b\x73\x74\x61\x74\x65\x2e\x63\x61\x6e\x76\x61\x73\x4f\x66\x66\x73\x65\x74\x58\x7d\x70\x78\x2c\x20\x24\x7b\x73\x74\x61\x74\x65\x2e\x63\x61\x6e\x76\x61\x73\x4f\x66\x66\x73\x65\x74\x59\x7d\x70\x78\x29\x20\x73\x63\x61\x6c\x65\x28\x24\x7b\x73\x74\x61\x74\x65\x2e\x63\x61\x6e\x76\x61\x73\x5a\x6f\x6f\x6d\x7d\x29`;
  document.getElementById('\x73\x74\x61\x74\x75\x73\x2d\x7a\x6f\x6f\x6d').textContent = Math.round(state.canvasZoom * 100) + '\x25';
}

function fniAUlXkC(zoom, centerX, centerY) {
  const _FRHOEDg = Math.max(0.15, Math.min(8, zoom));
  if (centerX !== undefined && centerY !== undefined) {
    const _vbl = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x70\x61\x6e\x65\x6c');
    const _sYbrF = container.getBoundingClientRect();
    const _poPGCdA = (centerX - rect.left - state.canvasOffsetX) / state.canvasZoom;
    const _CRgg = (centerY - rect.top - state.canvasOffsetY) / state.canvasZoom;
    state.canvasOffsetX = centerX - rect.left - cx * newZoom;
    state.canvasOffsetY = centerY - rect.top - cy * newZoom;
  }
  state.canvasZoom = newZoom; updateCanvasTransform();
}

function fncEXhQTbO() {
  if (!state.baseImage) return;
  const _vbl = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x70\x61\x6e\x65\x6c');
  const _FVS = 60; const _cPMN = container.clientWidth - padding; const _xGhJLYUt = container.clientHeight - padding;
  const _hdnUFQsS = Math.min(maxW / state.canvasWidth, maxH / state.canvasHeight);
  state.canvasZoom = zoom;
  state.canvasOffsetX = (container.clientWidth - state.canvasWidth * zoom) / 2;
  state.canvasOffsetY = (container.clientHeight - state.canvasHeight * zoom) / 2;
  updateCanvasTransform();
}

function fnHxpJXbeK() {
  const _vbl = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x70\x61\x6e\x65\x6c');
  const _sYbrF = container.getBoundingClientRect();
  const _Mortv = rect.width / 2; const _iJQfTU = rect.height / 2;
  const _WNMtN = (centerX - state.canvasOffsetX) / state.canvasZoom;
  const _gaRzysO = (centerY - state.canvasOffsetY) / state.canvasZoom;
  return { x, y };
}

function fnkmdFxpAf(e) {
  const _sYbrF = state.canvas.getBoundingClientRect();
  const _FQe = state.canvas.width / rect.width;
  const _kYbcelqu = state.canvas.height / rect.height;
  let _swmI, clientY;
  if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
  else if (e.changedTouches && e.changedTouches.length > 0) { clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY; }
  else { clientX = e.clientX; clientY = e.clientY; }
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function fnNrn(el) {
  let _HtHFs, h; const _ZBKksnu = state.ctx;
  if (el.type === '\x6d\x61\x74\x65\x72\x69\x61\x6c') { w = el.originalWidth * el.scale; h = el.originalHeight * el.scale; }
  else if (el.type === '\x61\x76\x61\x74\x61\x72') { w = 96 * el.scale; h = 96 * el.scale; }
  else if (el.type === '\x75\x73\x65\x72\x6e\x61\x6d\x65') {
    ctx.font = `\x35\x30\x30\x20\x24\x7b\x34\x33\x20\x2a\x20\x65\x6c\x2e\x73\x63\x61\x6c\x65\x7d\x70\x78\x20\x27\x4e\x6f\x74\x6f\x20\x53\x61\x6e\x73\x20\x53\x43\x27\x2c\x20\x73\x61\x6e\x73\x2d\x73\x65\x72\x69\x66`;
    w = ctx.measureText(el.text || '\x7528\x6237\x540d').width; h = 43 * el.scale * 1.2;
  } else if (el.type === '\x64\x61\x74\x65\x74\x69\x6d\x65') {
    const _BUHA = formatDateTime(el);
    ctx.font = `\x24\x7b\x33\x39\x20\x2a\x20\x65\x6c\x2e\x73\x63\x61\x6c\x65\x7d\x70\x78\x20\x27\x4e\x6f\x74\x6f\x20\x53\x61\x6e\x73\x20\x53\x43\x27\x2c\x20\x73\x61\x6e\x73\x2d\x73\x65\x72\x69\x66`;
    w = ctx.measureText(text).width; h = 39 * el.scale * 1.2;
  }
  return { x: el.x - w/2, y: el.y - h/2, w, h };
}

function fnqAFZUA(el) {
  return `\x24\x7b\x65\x6c\x2e\x79\x65\x61\x72\x7d\x2f\x24\x7b\x53\x74\x72\x69\x6e\x67\x28\x65\x6c\x2e\x6d\x6f\x6e\x74\x68\x29\x2e\x70\x61\x64\x53\x74\x61\x72\x74\x28\x32\x2c\x27\x30\x27\x29\x7d\x2f\x24\x7b\x53\x74\x72\x69\x6e\x67\x28\x65\x6c\x2e\x64\x61\x79\x29\x2e\x70\x61\x64\x53\x74\x61\x72\x74\x28\x32\x2c\x27\x30\x27\x29\x7d\x20\x24\x7b\x65\x6c\x2e\x73\x74\x61\x72\x74\x54\x69\x6d\x65\x7d\x20\x2d\x20\x24\x7b\x65\x6c\x2e\x65\x6e\x64\x54\x69\x6d\x65\x7d`;
}

function fnOBD(el) {
  const _ljwYJnY = getElementBounds(el);
  return { x: b.x + b.w, y: b.y + b.h };
}

function fnSDJLgdS(x, y) {
  if (state.selected) {
    const _OJMFb = getResizeHandle(state.selected);
    const _EEBvQ = x - handle.x, dy = y - handle.y;
    if (Math.sqrt(dx*dx + dy*dy) < 14) return { type: '\x72\x65\x73\x69\x7a\x65', el: state.selected };
  }
  const _prdklW = [
    ...state.materials.slice().reverse(),
    ...(state.customInfo.avatar.visible ? [state.customInfo.avatar] : []),
    ...(state.customInfo.username.visible ? [state.customInfo.username] : []),
    ...(state.customInfo.datetime.visible ? [state.customInfo.datetime] : [])
  ];
  for (const _Vjumq of elements) {
    const _ljwYJnY = getElementBounds(el);
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return { type: '\x65\x6c\x65\x6d\x65\x6e\x74', el };
  }
  return null;
}

function fnpcOqjYb() {
  const _ZBKksnu = state.ctx;
  ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  ctx.fillStyle = '\x23\x46\x46\x46\x46\x46\x46';
  ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  if (state.baseImageData) ctx.putImageData(state.baseImageData, 0, 0);
  if (state.eraseRect) {
    ctx.fillStyle = '\x72\x67\x62\x61\x28\x33\x33\x2c\x20\x31\x35\x30\x2c\x20\x32\x34\x33\x2c\x20\x30\x2e\x33\x29';
    ctx.fillRect(state.eraseRect.x, state.eraseRect.y, state.eraseRect.w, state.eraseRect.h);
    ctx.strokeStyle = '\x23\x32\x31\x39\x36\x46\x33'; ctx.setLineDash([6, 3]); ctx.lineWidth = 1.5;
    ctx.strokeRect(state.eraseRect.x, state.eraseRect.y, state.eraseRect.w, state.eraseRect.h);
    ctx.setLineDash([]);
  }
  state.materials.forEach(m => drawElement(m));
  if (state.customInfo.avatar.visible) drawElement(state.customInfo.avatar);
  if (state.customInfo.username.visible) drawElement(state.customInfo.username);
  if (state.customInfo.datetime.visible) drawElement(state.customInfo.datetime);
  state.alignGuides.forEach(g => {
    ctx.strokeStyle = g.highlight ? '\x23\x31\x39\x37\x36\x44\x32' : '\x23\x32\x31\x39\x36\x46\x33'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (g.type === '\x76') { ctx.moveTo(g.x, 0); ctx.lineTo(g.x, state.canvasHeight); }
    else { ctx.moveTo(0, g.y); ctx.lineTo(state.canvasWidth, g.y); }
    ctx.stroke(); ctx.setLineDash([]);
  });
  if (state.selected) drawSelection(state.selected);
}

function fnrRI(el) {
  const _ZBKksnu = state.ctx;
  if (el.type === '\x6d\x61\x74\x65\x72\x69\x61\x6c') {
    const _ljwYJnY = getElementBounds(el);
    if (el.image) ctx.drawImage(el.image, b.x, b.y, b.w, b.h);
  } else if (el.type === '\x61\x76\x61\x74\x61\x72') {
    drawAvatar(el);
  } else if (el.type === '\x75\x73\x65\x72\x6e\x61\x6d\x65') {
    ctx.font = `\x35\x30\x30\x20\x24\x7b\x34\x33\x20\x2a\x20\x65\x6c\x2e\x73\x63\x61\x6c\x65\x7d\x70\x78\x20\x27\x4e\x6f\x74\x6f\x20\x53\x61\x6e\x73\x20\x53\x43\x27\x2c\x20\x73\x61\x6e\x73\x2d\x73\x65\x72\x69\x66`;
    ctx.fillStyle = '\x23\x30\x30\x30\x30\x30\x30'; ctx.textBaseline = '\x6d\x69\x64\x64\x6c\x65'; ctx.textAlign = '\x6c\x65\x66\x74';
    const _ljwYJnY = getElementBounds(el); ctx.fillText(el.text, b.x, el.y);
  } else if (el.type === '\x64\x61\x74\x65\x74\x69\x6d\x65') {
    const _BUHA = formatDateTime(el);
    ctx.font = `\x24\x7b\x33\x39\x20\x2a\x20\x65\x6c\x2e\x73\x63\x61\x6c\x65\x7d\x70\x78\x20\x27\x4e\x6f\x74\x6f\x20\x53\x61\x6e\x73\x20\x53\x43\x27\x2c\x20\x73\x61\x6e\x73\x2d\x73\x65\x72\x69\x66`;
    ctx.fillStyle = '\x23\x38\x38\x38\x38\x38\x38'; ctx.textBaseline = '\x6d\x69\x64\x64\x6c\x65'; ctx.textAlign = '\x6c\x65\x66\x74';
    const _ljwYJnY = getElementBounds(el); ctx.fillText(text, b.x, el.y);
  }
}

function fntJGhE(avatar) {
  const _ZBKksnu = state.ctx; const _dWaGZxIE = 96 * avatar.scale;
  const _WNMtN = avatar.x - size/2, y = avatar.y - size/2;
  ctx.save(); ctx.beginPath(); ctx.arc(avatar.x, avatar.y, size/2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
  if (avatar.image) {
    const _kZm = avatar.image; const _BvheueZq = Math.min(img.width, img.height);
    const _VQp = (img.width - minDim) / 2, sy = (img.height - minDim) / 2;
    ctx.drawImage(img, sx, sy, minDim, minDim, x, y, size, size);
  } else {
    ctx.fillStyle = '\x23\x43\x43\x43\x43\x43\x43'; ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '\x23\x46\x46\x46\x46\x46\x46';
    ctx.beginPath(); ctx.arc(avatar.x, avatar.y - size*0.15, size*0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(avatar.x, avatar.y + size*0.3, size*0.28, Math.PI, 0); ctx.fill();
  }
  ctx.restore(); ctx.strokeStyle = '\x23\x30\x30\x43\x38\x35\x33'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(avatar.x, avatar.y, size/2, 0, Math.PI * 2); ctx.stroke();
}

function fnglIZWL(el) {
  const _ZBKksnu = state.ctx; const _ljwYJnY = getElementBounds(el);
  ctx.strokeStyle = '\x23\x32\x31\x39\x36\x46\x33'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]);
  ctx.strokeRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2); ctx.setLineDash([]);
  ctx.fillStyle = '\x23\x32\x31\x39\x36\x46\x33';
  const _qBFkPoqZ = [
    { x: b.x, y: b.y }, { x: b.x + b.w, y: b.y },
    { x: b.x, y: b.y + b.h }, { x: b.x + b.w, y: b.y + b.h }
  ];
  corners.forEach(c => { ctx.fillRect(c.x - 3, c.y - 3, 6, 6); });
  ctx.fillStyle = '\x23\x30\x30\x43\x38\x35\x33';
  ctx.beginPath(); ctx.arc(b.x + b.w, b.y + b.h, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '\x23\x46\x46\x46\x46\x46\x46'; ctx.lineWidth = 1.5; ctx.stroke();
}

function fnESe(draggedEl) {
  const _MEjju = [
    ...state.materials.filter(m => m !== draggedEl),
    ...(state.customInfo.avatar.visible && state.customInfo.avatar !== draggedEl ? [state.customInfo.avatar] : []),
    ...(state.customInfo.username.visible && state.customInfo.username !== draggedEl ? [state.customInfo.username] : []),
    ...(state.customInfo.datetime.visible && state.customInfo.datetime !== draggedEl ? [state.customInfo.datetime] : [])
  ];
  if (others.length === 0) { state.alignGuides = []; document.getElementById('\x61\x6c\x69\x67\x6e\x2d\x68\x69\x6e\x74').classList.remove('\x76\x69\x73\x69\x62\x6c\x65'); return; }
  const _VqUHlt = 10; const _CvIAy = getElementBounds(draggedEl);
  let _uzuj = null, bestXDist = threshold + 1; let _jXSrE = null, bestYDist = threshold + 1;
  for (const _nLQwddMt of others) {
    const _gbIMrBxK = getElementBounds(other);
    const _YxSHIvip = [
      { dragVal: db.x, otherVal: ob.x, guideX: ob.x },
      { dragVal: db.x + db.w, otherVal: ob.x + ob.w, guideX: ob.x + ob.w },
      { dragVal: db.x + db.w/2, otherVal: ob.x + ob.w/2, guideX: ob.x + ob.w/2 },
      { dragVal: db.x, otherVal: ob.x + ob.w, guideX: ob.x + ob.w },
      { dragVal: db.x + db.w, otherVal: ob.x, guideX: ob.x },
    ];
    for (const _fnXxuD of xChecks) { const _qRnjXRr = Math.abs(c.dragVal - c.otherVal); if (dist < bestXDist) { bestXDist = dist; bestX = { guideX: c.guideX, delta: c.otherVal - c.dragVal }; } }
    const _fXJQsBsF = [
      { dragVal: db.y, otherVal: ob.y, guideY: ob.y },
      { dragVal: db.y + db.h, otherVal: ob.y + ob.h, guideY: ob.y + ob.h },
      { dragVal: db.y + db.h/2, otherVal: ob.y + ob.h/2, guideY: ob.y + ob.h/2 },
      { dragVal: db.y, otherVal: ob.y + ob.h, guideY: ob.y + ob.h },
      { dragVal: db.y + db.h, otherVal: ob.y, guideY: ob.y },
    ];
    for (const _fnXxuD of yChecks) { const _qRnjXRr = Math.abs(c.dragVal - c.otherVal); if (dist < bestYDist) { bestYDist = dist; bestY = { guideY: c.guideY, delta: c.otherVal - c.dragVal }; } }
  }
  const _KYIhwL = [];
  if (bestX && bestXDist <= threshold) { draggedEl.x += bestX.delta; guides.push({ type: '\x76', x: bestX.guideX, highlight: true }); }
  if (bestY && bestYDist <= threshold) { draggedEl.y += bestY.delta; guides.push({ type: '\x68', y: bestY.guideY, highlight: true }); }
  state.alignGuides = guides;
  document.getElementById('\x61\x6c\x69\x67\x6e\x2d\x68\x69\x6e\x74').classList.toggle('\x76\x69\x73\x69\x62\x6c\x65', guides.length > 0);
}

function fnzZwIdf() {
  const _HgacMOO = state.canvas; const _tAyG = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x70\x61\x6e\x65\x6c');
  canvas.addEventListener('\x6d\x6f\x75\x73\x65\x64\x6f\x77\x6e', onPointerDown); canvas.addEventListener('\x6d\x6f\x75\x73\x65\x6d\x6f\x76\x65', onPointerMove);
  canvas.addEventListener('\x6d\x6f\x75\x73\x65\x75\x70', onPointerUp); canvas.addEventListener('\x6d\x6f\x75\x73\x65\x6c\x65\x61\x76\x65', onPointerUp);
  canvas.addEventListener('\x63\x6f\x6e\x74\x65\x78\x74\x6d\x65\x6e\x75', e => { e.preventDefault(); if (state.eraseRect) { state.eraseRect = null; state.dragMode = null; state.isMouseDown = false; render(); } });
  canvas.addEventListener('\x74\x6f\x75\x63\x68\x73\x74\x61\x72\x74', onPointerDown, { passive: false }); canvas.addEventListener('\x74\x6f\x75\x63\x68\x6d\x6f\x76\x65', onPointerMove, { passive: false }); canvas.addEventListener('\x74\x6f\x75\x63\x68\x65\x6e\x64', onPointerUp);
  panel.addEventListener('\x77\x68\x65\x65\x6c', (e) => { if (!state.baseImage) return; e.preventDefault(); const _tOuzfuxr = e.deltaY < 0 ? 1.12 : 1/1.12; setCanvasZoom(state.canvasZoom * delta, e.clientX, e.clientY); }, { passive: false });
  document.addEventListener('\x6b\x65\x79\x64\x6f\x77\x6e', onKeyDown); document.addEventListener('\x6b\x65\x79\x75\x70', e => { state.shiftKey = e.shiftKey; });
  document.getElementById('\x75\x70\x6c\x6f\x61\x64\x2d\x62\x74\x6e').onclick = () => document.getElementById('\x66\x69\x6c\x65\x2d\x69\x6e\x70\x75\x74').click();
  document.getElementById('\x66\x69\x6c\x65\x2d\x69\x6e\x70\x75\x74').onchange = onUploadBaseImage;
  document.getElementById('\x65\x72\x61\x73\x65\x2d\x62\x74\x6e').onclick = toggleEraseMode;
  document.getElementById('\x75\x6e\x64\x6f\x2d\x62\x74\x6e').onclick = undo;
  document.getElementById('\x72\x65\x73\x65\x74\x2d\x62\x74\x6e').onclick = confirmReset;
  document.getElementById('\x65\x78\x70\x6f\x72\x74\x2d\x62\x74\x6e').onclick = exportJPG;
  document.getElementById('\x73\x63\x61\x6c\x65\x2d\x69\x6e\x63').onclick = () => adjustScaleInput(10);
  document.getElementById('\x73\x63\x61\x6c\x65\x2d\x64\x65\x63').onclick = () => adjustScaleInput(-10);
  document.getElementById('\x73\x63\x61\x6c\x65\x2d\x69\x6e\x70\x75\x74').onchange = onScaleInputChange;
  document.getElementById('\x73\x65\x74\x2d\x64\x65\x66\x61\x75\x6c\x74\x2d\x73\x63\x61\x6c\x65').onclick = setAsDefaultScale;
  document.getElementById('\x7a\x6f\x6f\x6d\x2d\x69\x6e').onclick = () => { const _sYbrF = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x70\x61\x6e\x65\x6c').getBoundingClientRect(); setCanvasZoom(state.canvasZoom * 1.2, rect.left + rect.width/2, rect.top + rect.height/2); };
  document.getElementById('\x7a\x6f\x6f\x6d\x2d\x6f\x75\x74').onclick = () => { const _sYbrF = document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x70\x61\x6e\x65\x6c').getBoundingClientRect(); setCanvasZoom(state.canvasZoom / 1.2, rect.left + rect.width/2, rect.top + rect.height/2); };
  document.getElementById('\x7a\x6f\x6f\x6d\x2d\x66\x69\x74').onclick = fitCanvasToWindow;
  window.addEventListener('\x72\x65\x73\x69\x7a\x65', () => { if (state.baseImage) fitCanvasToWindow(); });
  document.getElementById('\x68\x65\x6c\x70\x2d\x62\x74\x6e').onclick = () => document.getElementById('\x68\x65\x6c\x70\x2d\x6d\x6f\x64\x61\x6c\x2d\x6d\x61\x73\x6b').classList.add('\x76\x69\x73\x69\x62\x6c\x65');
  document.getElementById('\x68\x65\x6c\x70\x2d\x6d\x6f\x64\x61\x6c\x2d\x63\x6c\x6f\x73\x65').onclick = () => document.getElementById('\x68\x65\x6c\x70\x2d\x6d\x6f\x64\x61\x6c\x2d\x6d\x61\x73\x6b').classList.remove('\x76\x69\x73\x69\x62\x6c\x65');
  document.getElementById('\x68\x65\x6c\x70\x2d\x6d\x6f\x64\x61\x6c\x2d\x6d\x61\x73\x6b').addEventListener('\x63\x6c\x69\x63\x6b', (e) => { if (e.target.id === '\x68\x65\x6c\x70\x2d\x6d\x6f\x64\x61\x6c\x2d\x6d\x61\x73\x6b') e.target.classList.remove('\x76\x69\x73\x69\x62\x6c\x65'); });
  document.getElementById('\x73\x68\x6f\x77\x2d\x61\x76\x61\x74\x61\x72').onchange = e => {
    state.customInfo.avatar.visible = e.target.checked;
    document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x63\x6f\x6e\x74\x72\x6f\x6c').classList.toggle('\x68\x69\x64\x64\x65\x6e', !e.target.checked);
    document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x74\x61\x67').classList.toggle('\x6f\x6e', e.target.checked);
    document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x74\x61\x67').textContent = e.target.checked ? '\x5f00' : '\x5173';
    if (e.target.checked) pushHistory(); render();
  };
  document.getElementById('\x73\x68\x6f\x77\x2d\x75\x73\x65\x72\x6e\x61\x6d\x65').onchange = e => {
    state.customInfo.username.visible = e.target.checked;
    document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x63\x6f\x6e\x74\x72\x6f\x6c').classList.toggle('\x68\x69\x64\x64\x65\x6e', !e.target.checked);
    document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x74\x61\x67').classList.toggle('\x6f\x6e', e.target.checked);
    document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x74\x61\x67').textContent = e.target.checked ? '\x5f00' : '\x5173';
    if (e.target.checked) pushHistory(); render();
  };
  document.getElementById('\x73\x68\x6f\x77\x2d\x64\x61\x74\x65\x74\x69\x6d\x65').onchange = e => {
    state.customInfo.datetime.visible = e.target.checked;
    document.getElementById('\x64\x61\x74\x65\x74\x69\x6d\x65\x2d\x74\x61\x67').classList.toggle('\x6f\x6e', e.target.checked);
    document.getElementById('\x64\x61\x74\x65\x74\x69\x6d\x65\x2d\x74\x61\x67').textContent = e.target.checked ? '\x5f00' : '\x5173';
    pushHistory(); render();
  };
  document.getElementById('\x75\x70\x6c\x6f\x61\x64\x2d\x61\x76\x61\x74\x61\x72\x2d\x62\x74\x6e').onclick = () => document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x69\x6e\x70\x75\x74').click();
  document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x69\x6e\x70\x75\x74').onchange = onUploadAvatar;
  document.getElementById('\x64\x65\x6c\x65\x74\x65\x2d\x61\x76\x61\x74\x61\x72\x2d\x62\x74\x6e').onclick = deleteAvatar;
  document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x69\x6e\x70\x75\x74').oninput = e => { state.customInfo.username.text = e.target.value || '\x7528\x6237\x540d\x36\x31\x35\x31\x35\x33\x32\x31'; render(); };
  ['\x79\x65\x61\x72\x2d\x69\x6e\x70\x75\x74', '\x6d\x6f\x6e\x74\x68\x2d\x69\x6e\x70\x75\x74', '\x64\x61\x79\x2d\x69\x6e\x70\x75\x74', '\x73\x74\x61\x72\x74\x2d\x74\x69\x6d\x65', '\x65\x6e\x64\x2d\x74\x69\x6d\x65'].forEach(id => {
    document.getElementById(id).oninput = () => {
      const _cWhXDSqC = state.customInfo.datetime;
      d.year = parseInt(document.getElementById('\x79\x65\x61\x72\x2d\x69\x6e\x70\x75\x74').value) || 2025;
      d.month = parseInt(document.getElementById('\x6d\x6f\x6e\x74\x68\x2d\x69\x6e\x70\x75\x74').value) || 1;
      d.day = parseInt(document.getElementById('\x64\x61\x79\x2d\x69\x6e\x70\x75\x74').value) || 1;
      d.startTime = document.getElementById('\x73\x74\x61\x72\x74\x2d\x74\x69\x6d\x65').value || '\x30\x30\x3a\x30\x30';
      d.endTime = document.getElementById('\x65\x6e\x64\x2d\x74\x69\x6d\x65').value || '\x30\x30\x3a\x30\x30';
      render();
    };
  });
}

function fnDCwdkXG(e) {
  e.preventDefault(); if (!state.baseImage) return;
  const _Wjb = getCanvasCoords(e); state.isMouseDown = true; state.dragStart = pos; state.hasPanned = false;
  if (state.eraseMode) { state.dragMode = '\x65\x72\x61\x73\x65'; state.eraseRect = { x: pos.x, y: pos.y, w: 0, h: 0 }; return; }
  const _IbllHUTL = hitTest(pos.x, pos.y);
  if (hit && hit.type === '\x72\x65\x73\x69\x7a\x65') {
    state.selected = hit.el; state.dragMode = '\x72\x65\x73\x69\x7a\x65';
    state.elementStart = { x: hit.el.x, y: hit.el.y, scale: hit.el.scale };
    const _EEBvQ = pos.x - hit.el.x, dy = pos.y - hit.el.y;
    state.resizeInitialDist = Math.max(1, Math.sqrt(dx*dx + dy*dy));
  } else if (hit && hit.type === '\x65\x6c\x65\x6d\x65\x6e\x74') {
    if (state.selected !== hit.el) {
      state.selected = hit.el;
      if (hit.el.type === '\x6d\x61\x74\x65\x72\x69\x61\x6c') { const _kunxKo = state.materials.indexOf(hit.el); if (idx >= 0) { state.materials.splice(idx, 1); state.materials.push(hit.el); } }
    }
    state.dragMode = '\x6d\x6f\x76\x65'; state.elementStart = { x: hit.el.x, y: hit.el.y };
    updateScaleInputFromSelection();
  } else {
    state.dragMode = '\x70\x61\x6e'; let _poPGCdA = e.clientX, cy = e.clientY;
    if (e.touches && e.touches[0]) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    state.panStartScreen = { x: cx, y: cy }; state.panStartOffset = { x: state.canvasOffsetX, y: state.canvasOffsetY };
  }
  render();
}

function fnxOYOIASl(e) {
  if (e.preventDefault) e.preventDefault();
  const _Wjb = getCanvasCoords(e);
  document.getElementById('\x73\x74\x61\x74\x75\x73\x2d\x63\x6f\x6f\x72\x64').textContent = `\x24\x7b\x4d\x61\x74\x68\x2e\x72\x6f\x75\x6e\x64\x28\x70\x6f\x73\x2e\x78\x29\x7d\x2c\x20\x24\x7b\x4d\x61\x74\x68\x2e\x72\x6f\x75\x6e\x64\x28\x70\x6f\x73\x2e\x79\x29\x7d`;
  if (!state.isMouseDown) {
    if (state.eraseMode) { state.canvas.style.cursor = '\x63\x72\x6f\x73\x73\x68\x61\x69\x72'; }
    else {
      const _IbllHUTL = hitTest(pos.x, pos.y);
      if (hit && hit.type === '\x72\x65\x73\x69\x7a\x65') state.canvas.style.cursor = '\x6e\x77\x73\x65\x2d\x72\x65\x73\x69\x7a\x65';
      else if (hit && hit.type === '\x65\x6c\x65\x6d\x65\x6e\x74') state.canvas.style.cursor = '\x6d\x6f\x76\x65';
      else state.canvas.style.cursor = '\x67\x72\x61\x62';
    }
    return;
  }
  if (state.dragMode === '\x65\x72\x61\x73\x65') {
    state.eraseRect = { x: Math.min(state.dragStart.x, pos.x), y: Math.min(state.dragStart.y, pos.y), w: Math.abs(pos.x - state.dragStart.x), h: Math.abs(pos.y - state.dragStart.y) };
    render();
  } else if (state.dragMode === '\x6d\x6f\x76\x65' && state.selected) {
    const _EEBvQ = pos.x - state.dragStart.x; const _jRnoVSe = pos.y - state.dragStart.y;
    state.selected.x = state.elementStart.x + dx; state.selected.y = state.elementStart.y + dy;
    if (!state.shiftKey) checkAlignment(state.selected); render();
  } else if (state.dragMode === '\x72\x65\x73\x69\x7a\x65' && state.selected) {
    const _Vjumq = state.selected; const _EEBvQ = pos.x - el.x, dy = pos.y - el.y;
    const _qRnjXRr = Math.sqrt(dx*dx + dy*dy);
    let _Pjl = state.elementStart.scale * (dist / Math.max(1, state.resizeInitialDist));
    newScale = Math.max(0.2, Math.min(3, newScale));
    el.scale = newScale; updateScaleInputFromSelection(); render();
  } else if (state.dragMode === '\x70\x61\x6e') {
    let _poPGCdA = e.clientX, cy = e.clientY;
    if (e.touches && e.touches[0]) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    const _EEBvQ = cx - state.panStartScreen.x; const _jRnoVSe = cy - state.panStartScreen.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) { state.hasPanned = true; state.canvas.style.cursor = '\x67\x72\x61\x62\x62\x69\x6e\x67'; }
    if (state.hasPanned) { state.canvasOffsetX = state.panStartOffset.x + dx; state.canvasOffsetY = state.panStartOffset.y + dy; updateCanvasTransform(); }
  }
}

function fnevcyJly(e) {
  if (!state.isMouseDown) return;
  state.isMouseDown = false;
  if (state.dragMode === '\x65\x72\x61\x73\x65' && state.eraseRect) {
    if (state.eraseRect.w > 2 && state.eraseRect.h > 2) {
      pushHistory(); applyErase(state.eraseRect); updateStatus('\x5df2\x64e6\x9664\x533a\x57df'); exitEraseMode();
      showToast('\x533a\x57df\x5df2\x64e6\x9664\xff0c\x5df2\x81ea\x52a8\x9000\x51fa\x64e6\x9664\x6a21\x5f0f', '\x73\x75\x63\x63\x65\x73\x73');
    } else { state.eraseRect = null; state.dragMode = null; render(); }
  } else if (state.dragMode === '\x70\x61\x6e') {
    if (!state.hasPanned) { state.selected = null; render(); }
    state.canvas.style.cursor = '\x67\x72\x61\x62'; state.dragMode = null;
  } else if (state.dragMode === '\x6d\x6f\x76\x65' || state.dragMode === '\x72\x65\x73\x69\x7a\x65') {
    if (state.selected) {
      if (state.dragMode === '\x6d\x6f\x76\x65') { const _JMdEJep = Math.abs(state.selected.x - state.elementStart.x) > 0.5 || Math.abs(state.selected.y - state.elementStart.y) > 0.5; if (moved) pushHistory(); }
      else if (state.dragMode === '\x72\x65\x73\x69\x7a\x65') { const _GSLfng = Math.abs(state.selected.scale - state.elementStart.scale) > 0.001; if (scaled) pushHistory(); }
    }
    state.alignGuides = []; document.getElementById('\x61\x6c\x69\x67\x6e\x2d\x68\x69\x6e\x74').classList.remove('\x76\x69\x73\x69\x62\x6c\x65');
    state.dragMode = null; render();
  }
}

function fnsJeI(e) {
  if (e.target.tagName === '\x49\x4e\x50\x55\x54' || e.target.tagName === '\x54\x45\x58\x54\x41\x52\x45\x41') return;
  state.shiftKey = e.shiftKey;
  if (e.key === '\x45\x73\x63\x61\x70\x65') {
    if (state.eraseRect) { state.eraseRect = null; state.isMouseDown = false; state.dragMode = null; render(); }
    else if (state.selected) { state.selected = null; render(); }
    return;
  }
  if (!state.selected) return;
  const _Vjumq = state.selected; const _VyYjcy = e.shiftKey ? 10 : 1;
  switch (e.key) {
    case '\x41\x72\x72\x6f\x77\x4c\x65\x66\x74': el.x -= step; e.preventDefault(); break;
    case '\x41\x72\x72\x6f\x77\x52\x69\x67\x68\x74': el.x += step; e.preventDefault(); break;
    case '\x41\x72\x72\x6f\x77\x55\x70': el.y -= step; e.preventDefault(); break;
    case '\x41\x72\x72\x6f\x77\x44\x6f\x77\x6e': el.y += step; e.preventDefault(); break;
    case '\x44\x65\x6c\x65\x74\x65': case '\x42\x61\x63\x6b\x73\x70\x61\x63\x65':
      if (el.type === '\x64\x61\x74\x65\x74\x69\x6d\x65') { showToast('\x65e5\x671f\x65f6\x95f4\x4e0d\x53ef\x5220\x9664\xff0c\x53ef\x53d6\x6d88\x52fe\x9009\x9690\x85cf', '\x65\x72\x72\x6f\x72'); return; }
      deleteElement(el); e.preventDefault(); return;
    case '\x2b': case '\x3d': el.scale = Math.min(3, el.scale + 0.1); updateScaleInputFromSelection(); e.preventDefault(); break;
    case '\x2d': case '\x5f': el.scale = Math.max(0.2, el.scale - 0.1); updateScaleInputFromSelection(); e.preventDefault(); break;
    default: return;
  }
  pushHistory(); render();
}

function fncyXTZ(rect) {
  const _ZBKksnu = state.ctx;
  ctx.putImageData(state.baseImageData, 0, 0);
  ctx.fillStyle = '\x23\x46\x46\x46\x46\x46\x46';
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  state.baseImageData = ctx.getImageData(0, 0, state.canvasWidth, state.canvasHeight);
  render();
}

function fnloasR() { state.eraseMode ? exitEraseMode() : enterEraseMode(); }
function fnLrFCCwh() {
  state.eraseMode = true; document.getElementById('\x65\x72\x61\x73\x65\x2d\x62\x74\x6e').classList.add('\x61\x63\x74\x69\x76\x65');
  state.canvas.style.cursor = '\x63\x72\x6f\x73\x73\x68\x61\x69\x72'; state.selected = null;
  updateStatus('\x64e6\x9664\x6a21\x5f0f\xff1a\x6309\x4f4f\x62d6\x62fd\x6846\x9009\x533a\x57df\xff0c\x677e\x5f00\x6d82\x767d'); render();
}
function fndmdwwFR() {
  state.eraseMode = false; state.eraseRect = null; state.dragMode = null; state.isMouseDown = false;
  document.getElementById('\x65\x72\x61\x73\x65\x2d\x62\x74\x6e').classList.remove('\x61\x63\x74\x69\x76\x65');
  state.canvas.style.cursor = '\x64\x65\x66\x61\x75\x6c\x74'; updateStatus('\x6b63\x5e38\x6a21\x5f0f'); render();
}

function fnoAZVl(e) {
  const _rRBsvgWG = e.target.files[0]; if (!file) return;
  const _rDv = new FileReader();
  reader.onload = ev => {
    const _kZm = new Image();
    img.onload = () => {
      const _XDYGEz = state.materials.length > 0 || state.history.length > 0;
      if (state.baseImage && hasContent) { showModal('\x66f4\x6362\x5e95\x56fe', '\x66f4\x6362\x5e95\x56fe\x5c06\x6e05\x7a7a\x753b\x5e03\x4e0a\x6240\x6709\x5df2\x653e\x7f6e\x7684\x7d20\x6750\x548c\x64e6\x9664\x64cd\x4f5c\xff0c\x662f\x5426\x7ee7\x7eed\xff1f', () => loadBaseImage(img)); }
      else { loadBaseImage(img); }
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file); e.target.value = '';
}

function fneAdz(img) {
  state.baseImage = img; state.canvasWidth = img.width; state.canvasHeight = img.height;
  state.canvas.width = img.width; state.canvas.height = img.height;
  state.ctx.drawImage(img, 0, 0);
  state.baseImageData = state.ctx.getImageData(0, 0, img.width, img.height);
  state.materials = []; state.selected = null; state.history = [];
  if (state.eraseMode) exitEraseMode();
  state.customInfo.avatar.x = 130; state.customInfo.avatar.y = 130;
  state.customInfo.username.x = 250; state.customInfo.username.y = 110;
  state.customInfo.datetime.x = 250; state.customInfo.datetime.y = 160;
  document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x65\x6d\x70\x74\x79').style.display = '\x6e\x6f\x6e\x65';
  document.getElementById('\x63\x61\x6e\x76\x61\x73\x2d\x69\x6e\x66\x6f\x2d\x74\x65\x78\x74').textContent = `\x24\x7b\x69\x6d\x67\x2e\x77\x69\x64\x74\x68\x7d\x20\xd7\x20\x24\x7b\x69\x6d\x67\x2e\x68\x65\x69\x67\x68\x74\x7d\x20\x7c\x20\x6eda\x8f6e\x7f29\x653e\x20\x7c\x20\x62d6\x52a8\x7a7a\x767d\x5904\x5e73\x79fb`;
  fitCanvasToWindow(); render();
  updateStatus(`\x5e95\x56fe\x5df2\x52a0\x8f7d\xff1a\x24\x7b\x69\x6d\x67\x2e\x77\x69\x64\x74\x68\x7d\xd7\x24\x7b\x69\x6d\x67\x2e\x68\x65\x69\x67\x68\x74\x7d`);
  showToast('\x5e95\x56fe\x52a0\x8f7d\x6210\x529f', '\x73\x75\x63\x63\x65\x73\x73');
}

function fnlmlLO(e) {
  const _rRBsvgWG = e.target.files[0]; if (!file) return;
  const _rDv = new FileReader();
  reader.onload = ev => {
    const _kZm = new Image();
    img.onload = () => {
      state.customInfo.avatar.image = img;
      const _GWsDcKSe = document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x70\x72\x65\x76\x69\x65\x77');
      preview.style.backgroundImage = `\x75\x72\x6c\x28\x24\x7b\x65\x76\x2e\x74\x61\x72\x67\x65\x74\x2e\x72\x65\x73\x75\x6c\x74\x7d\x29`;
      preview.classList.add('\x68\x61\x73\x2d\x69\x6d\x61\x67\x65');
      pushHistory(); render(); showToast('\x5934\x50cf\x5df2\x66f4\x65b0', '\x73\x75\x63\x63\x65\x73\x73');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file); e.target.value = '';
}

function fnnaN() {
  state.customInfo.avatar.image = null;
  const _GWsDcKSe = document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x70\x72\x65\x76\x69\x65\x77');
  preview.style.backgroundImage = ''; preview.classList.remove('\x68\x61\x73\x2d\x69\x6d\x61\x67\x65');
  pushHistory(); render(); showToast('\x5934\x50cf\x5df2\x5220\x9664', '\x73\x75\x63\x63\x65\x73\x73');
}

async function fnTXgF(key) {
  if (!materialImages[key]) {
    showToast('\x7d20\x6750\x52a0\x8f7d\x4e2d\xff0c\x8bf7\x7a0d\x5019\x2e\x2e\x2e', '\x69\x6e\x66\x6f');
    await loadMaterialImage(key);
    if (!materialImages[key]) { showToast('\x7d20\x6750\x52a0\x8f7d\x5931\x8d25\xff0c\x8bf7\x68c0\x67e5\x20\x2e\x2f\x6d\x61\x74\x65\x72\x69\x61\x6c\x73\x2f\x20\x76ee\x5f55', '\x65\x72\x72\x6f\x72'); return; }
  }
  const _kZm = materialImages[key];
  const _rVJXhVuH = getViewportCenterCanvasCoords();
  const _fRAO = {
    id: '\x6d\x61\x74\x5f' + Date.now() + '\x5f' + Math.random().toString(36).slice(2,6),
    type: '\x6d\x61\x74\x65\x72\x69\x61\x6c', materialKey: key, image: img,
    originalWidth: img.naturalWidth, originalHeight: img.naturalHeight,
    x: center.x, y: center.y, scale: state.defaultScale / 100
  };
  state.materials.push(newMat); state.selected = newMat;
  pushHistory(); updateScaleInputFromSelection(); render();
  updateStatus(`\x5df2\x653e\x7f6e\x7d20\x6750\xff1a\x24\x7b\x6b\x65\x79\x7d`);
}

function fnBzIDZAG(el) {
  pushHistory();
  if (el.type === '\x6d\x61\x74\x65\x72\x69\x61\x6c') { const _kunxKo = state.materials.indexOf(el); if (idx >= 0) state.materials.splice(idx, 1); }
  else if (el.type === '\x61\x76\x61\x74\x61\x72') {
    state.customInfo.avatar.image = null;
    const _GWsDcKSe = document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x70\x72\x65\x76\x69\x65\x77');
    preview.style.backgroundImage = ''; preview.classList.remove('\x68\x61\x73\x2d\x69\x6d\x61\x67\x65');
  } else if (el.type === '\x75\x73\x65\x72\x6e\x61\x6d\x65') {
    state.customInfo.username.text = '\x7528\x6237\x540d\x36\x31\x35\x31\x35\x33\x32\x31';
    document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x69\x6e\x70\x75\x74').value = '\x7528\x6237\x540d\x36\x31\x35\x31\x35\x33\x32\x31';
  }
  state.selected = null; render(); showToast('\x5df2\x5220\x9664', '\x73\x75\x63\x63\x65\x73\x73');
}

function fnRqgysL(delta) {
  const _xZngR = document.getElementById('\x73\x63\x61\x6c\x65\x2d\x69\x6e\x70\x75\x74');
  let _PTdgrM = parseInt(input.value) + delta;
  v = Math.max(20, Math.min(300, v));
  input.value = v; state.defaultScale = v;
}
function fnRqzHCBEJ(e) {
  let _PTdgrM = parseInt(e.target.value) || 100;
  v = Math.max(20, Math.min(300, v));
  e.target.value = v; state.defaultScale = v;
}
function fnjjg() {
  if (state.selected) { const _PTdgrM = Math.round(state.selected.scale * 100); document.getElementById('\x73\x63\x61\x6c\x65\x2d\x69\x6e\x70\x75\x74').value = v; }
}
function fnkVQCYGup() {
  if (!state.selected) { showToast('\x8bf7\x5148\x9009\x4e2d\x4e00\x4e2a\x7d20\x6750\x4f5c\x4e3a\x53c2\x8003', '\x65\x72\x72\x6f\x72'); return; }
  const _PTdgrM = Math.round(state.selected.scale * 100);
  state.defaultScale = v;
  document.getElementById('\x73\x63\x61\x6c\x65\x2d\x69\x6e\x70\x75\x74').value = v;
  showToast(`\x5df2\x8bbe\x4e3a\x540e\x7eed\x7d20\x6750\x9ed8\x8ba4\x6bd4\x4f8b\xff1a\x24\x7b\x76\x7d\x25`, '\x73\x75\x63\x63\x65\x73\x73');
}

function fnHfQQyjBt() {
  const _zIxfTQYD = state.customInfo;
  const _FlDY = {
    materials: state.materials.map(m => ({...m})),
    customInfo: {
      avatar: { visible: ci.avatar.visible, image: ci.avatar.image, x: ci.avatar.x, y: ci.avatar.y, scale: ci.avatar.scale, id: '\x61\x76\x61\x74\x61\x72', type: '\x61\x76\x61\x74\x61\x72' },
      username: { visible: ci.username.visible, text: ci.username.text, x: ci.username.x, y: ci.username.y, scale: ci.username.scale, id: '\x75\x73\x65\x72\x6e\x61\x6d\x65', type: '\x75\x73\x65\x72\x6e\x61\x6d\x65' },
      datetime: { visible: ci.datetime.visible, year: ci.datetime.year, month: ci.datetime.month, day: ci.datetime.day, startTime: ci.datetime.startTime, endTime: ci.datetime.endTime, x: ci.datetime.x, y: ci.datetime.y, scale: ci.datetime.scale, id: '\x64\x61\x74\x65\x74\x69\x6d\x65', type: '\x64\x61\x74\x65\x74\x69\x6d\x65' }
    },
    baseImageData: state.baseImageData ? new ImageData(new Uint8ClampedArray(state.baseImageData.data), state.baseImageData.width, state.baseImageData.height) : null
  };
  state.history.push(snap);
  if (state.history.length > 50) state.history.shift();
}

function fnKTw() {
  if (state.history.length === 0) { showToast('\x6ca1\x6709\x53ef\x64a4\x9500\x7684\x64cd\x4f5c', '\x65\x72\x72\x6f\x72'); return; }
  const _FlDY = state.history.pop();
  state.materials = snap.materials; state.customInfo = snap.customInfo; state.baseImageData = snap.baseImageData;
  state.selected = null; state.alignGuides = [];
  document.getElementById('\x61\x6c\x69\x67\x6e\x2d\x68\x69\x6e\x74').classList.remove('\x76\x69\x73\x69\x62\x6c\x65');
  document.getElementById('\x73\x68\x6f\x77\x2d\x61\x76\x61\x74\x61\x72').checked = state.customInfo.avatar.visible;
  document.getElementById('\x73\x68\x6f\x77\x2d\x75\x73\x65\x72\x6e\x61\x6d\x65').checked = state.customInfo.username.visible;
  document.getElementById('\x73\x68\x6f\x77\x2d\x64\x61\x74\x65\x74\x69\x6d\x65').checked = state.customInfo.datetime.visible;
  document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x63\x6f\x6e\x74\x72\x6f\x6c').classList.toggle('\x68\x69\x64\x64\x65\x6e', !state.customInfo.avatar.visible);
  document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x63\x6f\x6e\x74\x72\x6f\x6c').classList.toggle('\x68\x69\x64\x64\x65\x6e', !state.customInfo.username.visible);
  document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x74\x61\x67').classList.toggle('\x6f\x6e', state.customInfo.avatar.visible);
  document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x74\x61\x67').classList.toggle('\x6f\x6e', state.customInfo.username.visible);
  document.getElementById('\x64\x61\x74\x65\x74\x69\x6d\x65\x2d\x74\x61\x67').classList.toggle('\x6f\x6e', state.customInfo.datetime.visible);
  document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x74\x61\x67').textContent = state.customInfo.avatar.visible ? '\x5f00' : '\x5173';
  document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x74\x61\x67').textContent = state.customInfo.username.visible ? '\x5f00' : '\x5173';
  document.getElementById('\x64\x61\x74\x65\x74\x69\x6d\x65\x2d\x74\x61\x67').textContent = state.customInfo.datetime.visible ? '\x5f00' : '\x5173';
  document.getElementById('\x75\x73\x65\x72\x6e\x61\x6d\x65\x2d\x69\x6e\x70\x75\x74').value = state.customInfo.username.text;
  document.getElementById('\x79\x65\x61\x72\x2d\x69\x6e\x70\x75\x74').value = state.customInfo.datetime.year;
  document.getElementById('\x6d\x6f\x6e\x74\x68\x2d\x69\x6e\x70\x75\x74').value = state.customInfo.datetime.month;
  document.getElementById('\x64\x61\x79\x2d\x69\x6e\x70\x75\x74').value = state.customInfo.datetime.day;
  document.getElementById('\x73\x74\x61\x72\x74\x2d\x74\x69\x6d\x65').value = state.customInfo.datetime.startTime;
  document.getElementById('\x65\x6e\x64\x2d\x74\x69\x6d\x65').value = state.customInfo.datetime.endTime;
  const _GWsDcKSe = document.getElementById('\x61\x76\x61\x74\x61\x72\x2d\x70\x72\x65\x76\x69\x65\x77');
  if (state.customInfo.avatar.image) {
    const _tbpVtnL = document.createElement('\x63\x61\x6e\x76\x61\x73');
    tmpCanvas.width = state.customInfo.avatar.image.width;
    tmpCanvas.height = state.customInfo.avatar.image.height;
    tmpCanvas.getContext('\x32\x64').drawImage(state.customInfo.avatar.image, 0, 0);
    preview.style.backgroundImage = `\x75\x72\x6c\x28\x24\x7b\x74\x6d\x70\x43\x61\x6e\x76\x61\x73\x2e\x74\x6f\x44\x61\x74\x61\x55\x52\x4c\x28\x29\x7d\x29`;
    preview.classList.add('\x68\x61\x73\x2d\x69\x6d\x61\x67\x65');
  } else { preview.style.backgroundImage = ''; preview.classList.remove('\x68\x61\x73\x2d\x69\x6d\x61\x67\x65'); }
  render(); showToast('\x5df2\x64a4\x9500', '\x73\x75\x63\x63\x65\x73\x73');
}

function fnmSTnXRl() {
  if (!state.baseImage) { showToast('\x8bf7\x5148\x4e0a\x4f20\x5e95\x56fe', '\x65\x72\x72\x6f\x72'); return; }
  showModal('\x91cd\x7f6e\x753b\x5e03', '\x786e\x5b9a\x8981\x6e05\x7a7a\x753b\x5e03\x5417\xff1f\x6b64\x64cd\x4f5c\x4e0d\x53ef\x6062\x590d', () => {
    state.materials = []; state.selected = null; state.alignGuides = [];
    if (state.eraseMode) exitEraseMode();
    if (state.baseImage) { state.ctx.drawImage(state.baseImage, 0, 0); state.baseImageData = state.ctx.getImageData(0,0,state.canvasWidth,state.canvasHeight); }
    state.history = []; render(); showToast('\x753b\x5e03\x5df2\x91cd\x7f6e', '\x73\x75\x63\x63\x65\x73\x73');
  });
}

function fnSiFaNC() {
  if (!state.baseImage) { showToast('\x8bf7\x5148\x4e0a\x4f20\x5e95\x56fe', '\x65\x72\x72\x6f\x72'); return; }
  const _DySSXbd = document.createElement('\x63\x61\x6e\x76\x61\x73');
  exportCanvas.width = state.canvasWidth; exportCanvas.height = state.canvasHeight;
  const _TDuO = exportCanvas.getContext('\x32\x64');
  ectx.fillStyle = '\x23\x46\x46\x46\x46\x46\x46';
  ectx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
  if (state.baseImageData) ectx.putImageData(state.baseImageData, 0, 0);
  const _dJwzXnvE = state.ctx; state.ctx = ectx;
  const _WaaYPiKL = state.selected; const _cRsO = state.alignGuides;
  state.selected = null; state.alignGuides = [];
  state.materials.forEach(m => drawElement(m));
  if (state.customInfo.avatar.visible) drawElement(state.customInfo.avatar);
  if (state.customInfo.username.visible) drawElement(state.customInfo.username);
  if (state.customInfo.datetime.visible) drawElement(state.customInfo.datetime);
  state.ctx = originalCtx; state.selected = oldSelected; state.alignGuides = oldGuides;
  exportCanvas.toBlob(blob => {
    const _ULcZA = document.createElement('\x61');
    a.href = URL.createObjectURL(blob);
    a.download = '\x62fc\x56fe\x5b8c\x6210\x2e\x6a\x70\x67';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast('\x5df2\x5bfc\x51fa\x20\x62fc\x56fe\x5b8c\x6210\x2e\x6a\x70\x67', '\x73\x75\x63\x63\x65\x73\x73');
  }, '\x69\x6d\x61\x67\x65\x2f\x6a\x70\x65\x67', 0.92);
}

function fnBoK(msg) { document.getElementById('\x73\x74\x61\x74\x75\x73\x2d\x6d\x73\x67').textContent = msg; }
let _xtlFPqg = null;
function fnKdLn(msg, type = '\x69\x6e\x66\x6f') {
  const _bAG = document.getElementById('\x74\x6f\x61\x73\x74');
  document.getElementById('\x74\x6f\x61\x73\x74\x2d\x6d\x73\x67').textContent = msg;
  toast.className = '\x74\x6f\x61\x73\x74\x20' + type + '\x20\x76\x69\x73\x69\x62\x6c\x65';
  const _wlMUqUcd = toast.querySelector('\x69');
  icon.className = type === '\x73\x75\x63\x63\x65\x73\x73' ? '\x66\x61\x2d\x73\x6f\x6c\x69\x64\x20\x66\x61\x2d\x63\x69\x72\x63\x6c\x65\x2d\x63\x68\x65\x63\x6b' :
                   type === '\x65\x72\x72\x6f\x72' ? '\x66\x61\x2d\x73\x6f\x6c\x69\x64\x20\x66\x61\x2d\x63\x69\x72\x63\x6c\x65\x2d\x65\x78\x63\x6c\x61\x6d\x61\x74\x69\x6f\x6e' : '\x66\x61\x2d\x73\x6f\x6c\x69\x64\x20\x66\x61\x2d\x63\x69\x72\x63\x6c\x65\x2d\x69\x6e\x66\x6f';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('\x76\x69\x73\x69\x62\x6c\x65'), 2200);
}
function fnkNS(title, msg, onOk) {
  document.getElementById('\x6d\x6f\x64\x61\x6c\x2d\x74\x69\x74\x6c\x65').textContent = title;
  document.getElementById('\x6d\x6f\x64\x61\x6c\x2d\x6d\x73\x67').textContent = msg;
  const _gUbV = document.getElementById('\x6d\x6f\x64\x61\x6c\x2d\x6d\x61\x73\x6b');
  mask.classList.add('\x76\x69\x73\x69\x62\x6c\x65');
  const _BdN = document.getElementById('\x6d\x6f\x64\x61\x6c\x2d\x6f\x6b');
  const _loAthSp = document.getElementById('\x6d\x6f\x64\x61\x6c\x2d\x63\x61\x6e\x63\x65\x6c');
  const _cqsTBL = () => mask.classList.remove('\x76\x69\x73\x69\x62\x6c\x65');
  ok.onclick = () => { close(); onOk(); };
  cancel.onclick = close;
}

init();
