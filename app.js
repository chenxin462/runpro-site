'use strict';

/* ================================================================
 * 运动截图拼图工具 — 主程序
 * ================================================================ */

// ========== 1. 素材定义 ==========
const MATERIAL_DEFS = [
  // 第一组 (b系列)
  { key:'b0',  text:'0',    label:'0',    group:1, fontSize:64, color:'#000' },
  { key:'b1',  text:'1',    label:'1',    group:1, fontSize:64, color:'#000' },
  { key:'b2',  text:'2',    label:'2',    group:1, fontSize:64, color:'#000' },
  { key:'b3',  text:'3',    label:'3',    group:1, fontSize:64, color:'#000' },
  { key:'b4',  text:'4',    label:'4',    group:1, fontSize:64, color:'#000' },
  { key:'b5',  text:'5',    label:'5',    group:1, fontSize:64, color:'#000' },
  { key:'b6',  text:'6',    label:'6',    group:1, fontSize:64, color:'#000' },
  { key:'b7',  text:'7',    label:'7',    group:1, fontSize:64, color:'#000' },
  { key:'b8',  text:'8',    label:'8',    group:1, fontSize:64, color:'#000' },
  { key:'b9',  text:'9',    label:'9',    group:1, fontSize:64, color:'#000' },
  { key:'bgl', text:'公里', label:'公里', group:1, fontSize:32, color:'#000' },
  { key:'bm',  text:'.',    label:'一点', group:1, fontSize:64, color:'#000' },
  { key:'b2m', text:':',    label:'冒号', group:1, fontSize:64, color:'#000' },
  { key:'bqk', text:'千卡', label:'千卡', group:1, fontSize:32, color:'#000' },
  { key:'bmi', text:'米',   label:'米',   group:1, fontSize:32, color:'#000' },
  // 第二组
  { key:'0',   text:'0',     label:'0',     group:2, fontSize:48, color:'#000' },
  { key:'1',   text:'1',     label:'1',     group:2, fontSize:48, color:'#000' },
  { key:'2',   text:'2',     label:'2',     group:2, fontSize:48, color:'#000' },
  { key:'3',   text:'3',     label:'3',     group:2, fontSize:48, color:'#000' },
  { key:'4',   text:'4',     label:'4',     group:2, fontSize:48, color:'#000' },
  { key:'5',   text:'5',     label:'5',     group:2, fontSize:48, color:'#000' },
  { key:'6',   text:'6',     label:'6',     group:2, fontSize:48, color:'#000' },
  { key:'7',   text:'7',     label:'7',     group:2, fontSize:48, color:'#000' },
  { key:'8',   text:'8',     label:'8',     group:2, fontSize:48, color:'#000' },
  { key:'9',   text:'9',     label:'9',     group:2, fontSize:48, color:'#000' },
  { key:'ceng',text:'层',    label:'层',    group:2, fontSize:28, color:'#000' },
  { key:'ge',  text:'个',    label:'个',    group:2, fontSize:28, color:'#000' },
  { key:'hm',  text:'毫秒',  label:'毫秒',  group:2, fontSize:28, color:'#000' },
  { key:'mi',  text:'米',    label:'米',    group:2, fontSize:28, color:'#000' },
  { key:'ps1', text:"'",     label:"配速1",  group:2, fontSize:48, color:'#000' },
  { key:'ps2', text:'"',     label:"配速2",  group:2, fontSize:48, color:'#000' },
  { key:'qk',  text:'千卡',  label:'千卡',  group:2, fontSize:28, color:'#000' },
  { key:'qks', text:'千米/时',label:'千米/时',group:2, fontSize:28, color:'#000' },
  { key:'tang',text:'趟',    label:'趟',    group:2, fontSize:28, color:'#000' },
  { key:'wa',  text:'瓦',    label:'瓦',    group:2, fontSize:28, color:'#000' },
  { key:'m',   text:'.',     label:'点',    group:2, fontSize:48, color:'#000' },
  { key:'2m',  text:':',     label:'冒号',  group:2, fontSize:48, color:'#000' },
];

// ========== 2. 状态管理 ==========
const state = {
  baseImage: null,
  elements: [],        // 所有可拖拽元素 (素材 + 自定义信息)
  eraseRegions: [],    // 抹平区域 {x, y, w, h}
  selectedId: null,
  eraseMode: false,
  defaultScale: 100,
  canvasZoom: 1,
  undoStack: [],
  // 自定义信息
  showAvatar: false,
  showUsername: false,
  showDateTime: true,
  avatarImage: null,
  username: '用户名61515321',
  dateTime: { year:2025, month:6, day:4, start:'16:08', end:'16:43' },
  // 组位置
  groupX: 20,
  groupY: 20,
  // 拖拽状态
  drag: null,          // { type:'move'|'resize', el, startX, startY, origX, origY, origScale }
  erase: null,         // { startX, startY, curX, curY }
  // 对齐辅助
  alignLines: [],
  // 素材缓存
  materialCache: {},
  // ID计数器
  idCounter: 0,
  zCounter: 100,
};

// ========== 3. DOM 引用 ==========
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');
const wrapper = document.getElementById('canvas-wrapper');
const materialList = document.getElementById('material-list');
const alignHint = document.getElementById('align-hint');
const topStatus = document.getElementById('top-status');

// ========== 4. 素材生成 ==========
function generateMaterialImage(def) {
  return new Promise((resolve) => {
    const c = document.createElement('canvas');
    const cctx = c.getContext('2d');
    const font = `bold ${def.fontSize}px "Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif`;
    cctx.font = font;
    const metrics = cctx.measureText(def.text);
    const pad = 6;
    c.width = Math.ceil(metrics.width) + pad * 2;
    c.height = def.fontSize + pad * 2;
    cctx.font = font;
    cctx.fillStyle = '#FFFFFF';
    cctx.fillRect(0, 0, c.width, c.height);
    cctx.fillStyle = def.color;
    cctx.textBaseline = 'middle';
    cctx.textAlign = 'center';
    cctx.fillText(def.text, c.width / 2, c.height / 2 + 2);
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = c.toDataURL('image/jpeg', 0.95);
  });
}

function tryLoadMaterialFile(def) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    img.onload = () => { if (!done) { done = true; resolve(img); } };
    img.onerror = () => {
      if (!done) { done = true; generateMaterialImage(def).then(resolve); }
    };
    setTimeout(() => {
      if (!done) { done = true; generateMaterialImage(def).then(resolve); }
    }, 1500);
    img.src = `materials/${def.key}.jpg`;
  });
}

async function loadAllMaterials() {
  const promises = MATERIAL_DEFS.map(async (def) => {
    const img = await tryLoadMaterialFile(def);
    state.materialCache[def.key] = { img, def };
  });
  await Promise.all(promises);
}

function renderMaterialPanel() {
  let html = '';
  for (let g = 1; g <= 2; g++) {
    const defs = MATERIAL_DEFS.filter(d => d.group === g);
    const title = g === 1 ? '第一组（b系列）' : '第二组（数字/汉字）';
    html += `<div class="mat-group-title">${title}</div><div class="mat-grid">`;
    for (const def of defs) {
      const cached = state.materialCache[def.key];
      if (!cached) continue;
      const thumbSrc = cached.img.src;
      html += `
        <div class="mat-item" data-key="${def.key}" title="${def.label}">
          <img class="mat-thumb" src="${thumbSrc}" alt="${def.label}">
          <span class="mat-label">${def.label}</span>
        </div>`;
    }
    html += '</div>';
  }
  materialList.innerHTML = html;
  // 绑定点击事件
  materialList.querySelectorAll('.mat-item').forEach(item => {
    item.addEventListener('click', () => {
      addMaterial(item.dataset.key);
    });
  });
}

// ========== 5. Canvas 设置 ==========
function setupCanvas(w, h) {
  canvas.width = w;
  canvas.height = h;
  fitCanvasToWindow();
}

function fitCanvasToWindow() {
  const area = document.getElementById('canvas-area');
  const availW = area.clientWidth - 40;
  const availH = area.clientHeight - 40;
  if (canvas.width === 0 || canvas.height === 0) return;
  const scaleX = availW / canvas.width;
  const scaleY = availH / canvas.height;
  let z = Math.min(scaleX, scaleY, 1);
  z = Math.max(z, 0.15);
  state.canvasZoom = z;
  applyCanvasZoom();
}

function applyCanvasZoom() {
  wrapper.style.transform = `scale(${state.canvasZoom})`;
  updateStatus();
}

// ========== 6. 渲染 ==========
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!state.baseImage) {
    // 提示文字
    ctx.fillStyle = '#bbb';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('请上传底图', canvas.width / 2, canvas.height / 2);
    return;
  }

  // 底图
  ctx.drawImage(state.baseImage, 0, 0, canvas.width, canvas.height);

  // 抹平区域
  for (const r of state.eraseRegions) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }

  // 元素 (按 z 排序)
  const sorted = [...state.elements].sort((a, b) => a.z - b.z);
  for (const el of sorted) {
    drawElement(el);
  }

  // 选中外框
  const sel = getSelected();
  if (sel) drawSelection(sel);

  // 对齐辅助线
  if (state.alignLines.length > 0) drawAlignLines();

  // 抹平框选预览
  if (state.erase) drawErasePreview();
}

function drawElement(el) {
  const b = getElBounds(el);
  if (el.type === 'material') {
    ctx.drawImage(el.img, b.x, b.y, b.w, b.h);
  } else if (el.type === 'avatar') {
    drawAvatar(el, b);
  } else if (el.type === 'username') {
    ctx.save();
    const fs = Math.round(43 * el.scale);
    ctx.font = `500 ${fs}px "Microsoft YaHei","PingFang SC",sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(el.text, b.x, b.y);
    ctx.restore();
  } else if (el.type === 'datetime') {
    ctx.save();
    const fs = Math.round(39 * el.scale);
    ctx.font = `${fs}px "Microsoft YaHei","PingFang SC",sans-serif`;
    ctx.fillStyle = '#888888';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(el.text, b.x, b.y);
    ctx.restore();
  }
}

function drawAvatar(el, b) {
  ctx.save();
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const r = b.w / 2;
  const borderW = Math.max(1, 2 * el.scale);
  // 圆形裁剪
  ctx.beginPath();
  ctx.arc(cx, cy, r - borderW / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (el.img) {
    ctx.drawImage(el.img, b.x, b.y, b.w, b.h);
  } else {
    // 默认灰色 + 人形图标
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#FFFFFF';
    const headR = r * 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.2, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.5, r * 0.5, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  // 绿色边框
  ctx.save();
  ctx.strokeStyle = '#00C853';
  ctx.lineWidth = borderW;
  ctx.beginPath();
  ctx.arc(cx, cy, r - borderW / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSelection(el) {
  const b = getElBounds(el);
  ctx.save();
  // 蓝色虚线边框
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.setLineDash([]);
  // 四角实心方块
  ctx.fillStyle = '#2196F3';
  const cs = 6;
  const corners = [
    [b.x, b.y], [b.x + b.w, b.y],
    [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]
  ];
  for (const [cx, cy] of corners) {
    ctx.fillRect(cx - cs/2, cy - cs/2, cs, cs);
  }
  // 右下角绿色圆形缩放手柄
  ctx.fillStyle = '#4CAF50';
  ctx.beginPath();
  ctx.arc(b.x + b.w, b.y + b.h, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAlignLines() {
  ctx.save();
  for (const line of state.alignLines) {
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    if (line.orient === 'v') {
      ctx.moveTo(line.pos, 0);
      ctx.lineTo(line.pos, canvas.height);
    } else {
      ctx.moveTo(0, line.pos);
      ctx.lineTo(canvas.width, line.pos);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawErasePreview() {
  const e = state.erase;
  const x = Math.min(e.startX, e.curX);
  const y = Math.min(e.startY, e.curY);
  const w = Math.abs(e.curX - e.startX);
  const h = Math.abs(e.curY - e.startY);
  ctx.save();
  ctx.fillStyle = 'rgba(33,150,243,0.3)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.restore();
}

// ========== 7. 元素工具函数 ==========
function getElBounds(el) {
  const s = getElementSize(el);
  return { x: el.x, y: el.y, w: s.w, h: s.h, cx: el.x + s.w/2, cy: el.y + s.h/2 };
}

function getElementSize(el) {
  if (el.type === 'material') {
    return { w: el.baseW * el.scale, h: el.baseH * el.scale };
  } else if (el.type === 'avatar') {
    return { w: 96 * el.scale, h: 96 * el.scale };
  } else if (el.type === 'username') {
    const fs = Math.round(43 * el.scale);
    ctx.save();
    ctx.font = `500 ${fs}px "Microsoft YaHei","PingFang SC",sans-serif`;
    const w = ctx.measureText(el.text).width;
    ctx.restore();
    return { w, h: 43 * el.scale };
  } else if (el.type === 'datetime') {
    const fs = Math.round(39 * el.scale);
    ctx.save();
    ctx.font = `${fs}px "Microsoft YaHei","PingFang SC",sans-serif`;
    const w = ctx.measureText(el.text).width;
    ctx.restore();
    return { w, h: 39 * el.scale };
  }
  return { w: 0, h: 0 };
}

function getSelected() {
  if (!state.selectedId) return null;
  return state.elements.find(e => e.id === state.selectedId);
}

function nextId() {
  return 'el_' + (++state.idCounter);
}

// ========== 8. 坐标转换 ==========
function getCanvasPos(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) * (canvas.width / rect.width);
  const y = (clientY - rect.top) * (canvas.height / rect.height);
  return { x, y };
}

// ========== 9. 元素管理 ==========
function addMaterial(key) {
  if (!state.baseImage) {
    showStatus('请先上传底图');
    return;
  }
  const cached = state.materialCache[key];
  if (!cached) return;
  const scale = state.defaultScale / 100;
  const w = cached.img.naturalWidth || cached.img.width;
  const h = cached.img.naturalHeight || cached.img.height;
  const el = {
    id: nextId(),
    type: 'material',
    materialKey: key,
    img: cached.img,
    baseW: w,
    baseH: h,
    x: canvas.width / 2 - (w * scale) / 2,
    y: canvas.height / 2 - (h * scale) / 2,
    scale: scale,
    z: ++state.zCounter,
  };
  state.elements.push(el);
  state.selectedId = el.id;
  state.undoStack.push({ type: 'addMaterial', elementId: el.id });
  render();
  showStatus(`已添加素材: ${cached.def.label}`);
}

function hitTest(x, y) {
  const sorted = [...state.elements].sort((a, b) => b.z - a.z);
  for (const el of sorted) {
    const b = getElBounds(el);
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      return el;
    }
  }
  return null;
}

function hitResizeHandle(x, y, el) {
  const b = getElBounds(el);
  const dist = Math.hypot(x - (b.x + b.w), y - (b.y + b.h));
  return dist < 12;
}

function selectElement(id) {
  state.selectedId = id;
  render();
}

function deleteElement(id) {
  const idx = state.elements.findIndex(e => e.id === id);
  if (idx >= 0) {
    const el = state.elements[idx];
    if (el.type === 'datetime') return; // 日期不可删除
    state.elements.splice(idx, 1);
    if (state.selectedId === id) state.selectedId = null;
    // 如果是头像或用户名，同步开关状态
    if (el.type === 'avatar') {
      state.showAvatar = false;
      document.getElementById('chk-avatar').checked = false;
      document.getElementById('avatar-edit').classList.add('hidden');
    } else if (el.type === 'username') {
      state.showUsername = false;
      document.getElementById('chk-username').checked = false;
      document.getElementById('username-edit').classList.add('hidden');
    }
    render();
    showStatus('已删除');
  }
}

function bringToFront(id) {
  const el = state.elements.find(e => e.id === id);
  if (el) {
    el.z = ++state.zCounter;
    render();
  }
}

// ========== 10. 自定义信息管理 ==========
function getDateTimeText() {
  const d = state.dateTime;
  const mm = String(d.month).padStart(2, '0');
  const dd = String(d.day).padStart(2, '0');
  return `${d.year}/${mm}/${dd} ${d.start} - ${d.end}`;
}

function ensureCustomElements() {
  // 确保自定义信息元素存在/不存在
  // 日期时间 — 始终存在
  let dtEl = state.elements.find(e => e.type === 'datetime');
  if (state.showDateTime && !dtEl) {
    dtEl = {
      id: 'datetime',
      type: 'datetime',
      text: getDateTimeText(),
      x: state.groupX,
      y: state.groupY + (state.showAvatar ? 100 : 0),
      scale: 1,
      z: 1,
    };
    state.elements.push(dtEl);
  } else if (dtEl) {
    dtEl.text = getDateTimeText();
  }

  // 头像
  let avEl = state.elements.find(e => e.type === 'avatar');
  if (state.showAvatar && !avEl) {
    avEl = {
      id: 'avatar',
      type: 'avatar',
      img: state.avatarImage,
      x: state.groupX,
      y: state.groupY,
      scale: 1,
      z: 2,
    };
    state.elements.push(avEl);
    // 日期时间移到头像下方
    if (dtEl) dtEl.y = state.groupY + 100;
  } else if (!state.showAvatar && avEl) {
    state.elements = state.elements.filter(e => e !== avEl);
    if (state.selectedId === avEl.id) state.selectedId = null;
  } else if (avEl) {
    avEl.img = state.avatarImage;
  }

  // 用户名
  let unEl = state.elements.find(e => e.type === 'username');
  if (state.showUsername && !unEl) {
    unEl = {
      id: 'username',
      type: 'username',
      text: state.username,
      x: state.groupX + 104,
      y: state.groupY + 26,
      scale: 1,
      z: 3,
    };
    state.elements.push(unEl);
  } else if (!state.showUsername && unEl) {
    state.elements = state.elements.filter(e => e !== unEl);
    if (state.selectedId === unEl.id) state.selectedId = null;
  } else if (unEl) {
    unEl.text = state.username;
  }

  render();
}

// ========== 11. 指针事件 ==========
function onPointerDown(e) {
  if (!state.baseImage) return;
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);

  const pos = getCanvasPos(e.clientX, e.clientY);

  if (state.eraseMode) {
    state.erase = { startX: pos.x, startY: pos.y, curX: pos.x, curY: pos.y };
    render();
    return;
  }

  // 检查缩放手柄
  const sel = getSelected();
  if (sel && hitResizeHandle(pos.x, pos.y, sel)) {
    const b = getElBounds(sel);
    state.drag = {
      type: 'resize',
      el: sel,
      startX: pos.x,
      startY: pos.y,
      origScale: sel.scale,
      center: { x: b.cx, y: b.cy },
      handleDist: Math.hypot(pos.x - b.cx, pos.y - b.cy),
    };
    return;
  }

  // 命中测试
  const hit = hitTest(pos.x, pos.y);
  if (hit) {
    state.selectedId = hit.id;
    if (hit.type === 'material') bringToFront(hit.id);
    state.drag = {
      type: 'move',
      el: hit,
      startX: pos.x,
      startY: pos.y,
      origX: hit.x,
      origY: hit.y,
    };
    render();
  } else {
    state.selectedId = null;
    render();
  }
}

function onPointerMove(e) {
  if (!state.baseImage) return;

  const pos = getCanvasPos(e.clientX, e.clientY);

  // 抹平拖拽
  if (state.erase) {
    state.erase.curX = pos.x;
    state.erase.curY = pos.y;
    render();
    return;
  }

  // 元素拖拽
  if (state.drag) {
    e.preventDefault();
    const d = state.drag;
    if (d.type === 'move') {
      const dx = pos.x - d.startX;
      const dy = pos.y - d.startY;
      d.el.x = d.origX + dx;
      d.el.y = d.origY + dy;
      // 对齐检测 (仅素材和自定义信息)
      if (!e.shiftKey) checkAlignment(d.el);
      render();
    } else if (d.type === 'resize') {
      const newDist = Math.hypot(pos.x - d.center.x, pos.y - d.center.y);
      let ratio = newDist / d.handleDist;
      let newScale = d.origScale * ratio;
      newScale = Math.max(0.2, Math.min(3.0, newScale));
      d.el.scale = newScale;
      // 调整位置使中心保持不变 (缩放锚点 = 元素中心)
      const sz = getElementSize(d.el);
      d.el.x = d.center.x - sz.w / 2;
      d.el.y = d.center.y - sz.h / 2;
      render();
    }
    updateStatus();
  }
}

function onPointerUp(e) {
  if (state.erase) {
    const er = state.erase;
    const x = Math.min(er.startX, er.curX);
    const y = Math.min(er.startY, er.curY);
    const w = Math.abs(er.curX - er.startX);
    const h = Math.abs(er.curY - er.startY);
    if (w > 2 && h > 2) {
      state.eraseRegions.push({ x, y, w, h });
      state.undoStack.push({ type: 'erase', index: state.eraseRegions.length - 1 });
    }
    state.erase = null;
    render();
    showStatus('抹平完成');
    return;
  }

  if (state.drag) {
    state.drag = null;
    state.alignLines = [];
    alignHint.classList.remove('show');
    render();
  }
}

// ========== 12. 对齐辅助 ==========
function checkAlignment(dragEl) {
  state.alignLines = [];
  const b1 = getElBounds(dragEl);
  let snapped = false;
  const threshold = 10;

  for (const el of state.elements) {
    if (el === dragEl) continue;
    const b2 = getElBounds(el);

    // 左边缘对齐
    if (Math.abs(b1.x - b2.x) < threshold) {
      if (!e_shiftDown()) {
        dragEl.x = b2.x;
      }
      state.alignLines.push({ orient: 'v', pos: b2.x, color: '#2196F3' });
      snapped = true;
    }
    // 右边缘对齐
    if (Math.abs((b1.x + b1.w) - (b2.x + b2.w)) < threshold) {
      if (!e_shiftDown()) {
        dragEl.x = b2.x + b2.w - b1.w;
      }
      state.alignLines.push({ orient: 'v', pos: b2.x + b2.w, color: '#2196F3' });
      snapped = true;
    }
    // 水平中心对齐
    if (Math.abs(b1.cx - b2.cx) < threshold) {
      if (!e_shiftDown()) {
        dragEl.x = b2.cx - b1.w / 2;
      }
      state.alignLines.push({ orient: 'v', pos: b2.cx, color: '#2196F3' });
      snapped = true;
    }
    // 下边缘对齐
    if (Math.abs((b1.y + b1.h) - (b2.y + b2.h)) < threshold) {
      if (!e_shiftDown()) {
        dragEl.y = b2.y + b2.h - b1.h;
      }
      state.alignLines.push({ orient: 'h', pos: b2.y + b2.h, color: '#2196F3' });
      snapped = true;
    }
  }

  // 高亮颜色
  if (snapped) {
    state.alignLines.forEach(l => l.color = '#1976D2');
    alignHint.classList.add('show');
  } else {
    alignHint.classList.remove('show');
  }
}

let _shiftDown = false;
function e_shiftDown() { return _shiftDown; }

// ========== 13. 抹平模式 ==========
function toggleEraseMode() {
  if (!state.baseImage) {
    showStatus('请先上传底图');
    return;
  }
  state.eraseMode = !state.eraseMode;
  const btn = document.getElementById('btn-erase');
  if (state.eraseMode) {
    btn.classList.add('active');
    canvas.classList.add('erase-mode');
    state.selectedId = null;
    showStatus('抹平模式已开启 — 框选区域涂白');
  } else {
    btn.classList.remove('active');
    canvas.classList.remove('erase-mode');
    showStatus('抹平模式已关闭');
  }
  render();
}

// ========== 14. 底图上传 ==========
function handleFileUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      // 如果已有底图，确认更换
      if (state.baseImage) {
        if (!confirm('更换底图将清空画布上所有素材和抹平操作，确定继续吗？')) return;
      }
      state.baseImage = img;
      // 设置画布尺寸 (限制最大尺寸避免性能问题)
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const MAX_DIM = 3000;
      if (w > MAX_DIM || h > MAX_DIM) {
        const r = MAX_DIM / Math.max(w, h);
        w = Math.round(w * r);
        h = Math.round(h * r);
      }
      setupCanvas(w, h);
      // 清空内容
      state.elements = [];
      state.eraseRegions = [];
      state.undoStack = [];
      state.selectedId = null;
      // 重新初始化自定义信息
      ensureCustomElements();
      render();
      showStatus(`底图已加载 (${img.naturalWidth}×${img.naturalHeight})`);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ========== 15. 头像上传 ==========
function handleAvatarUpload(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      state.avatarImage = img;
      const avEl = state.elements.find(e => e.type === 'avatar');
      if (avEl) avEl.img = img;
      // 更新预览
      const preview = document.getElementById('avatar-preview');
      preview.innerHTML = `<img src="${ev.target.result}">`;
      render();
      showStatus('头像已更新');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function deleteAvatar() {
  state.avatarImage = null;
  const avEl = state.elements.find(e => e.type === 'avatar');
  if (avEl) avEl.img = null;
  const preview = document.getElementById('avatar-preview');
  preview.innerHTML = '<span class="default-icon">👤</span>';
  render();
  showStatus('头像已删除');
}

// ========== 16. 撤销 / 重置 ==========
function undo() {
  if (state.undoStack.length === 0) {
    showStatus('没有可撤销的操作');
    return;
  }
  const action = state.undoStack.pop();
  if (action.type === 'addMaterial') {
    const idx = state.elements.findIndex(e => e.id === action.elementId);
    if (idx >= 0) {
      state.elements.splice(idx, 1);
      if (state.selectedId === action.elementId) state.selectedId = null;
    }
    showStatus('已撤销: 添加素材');
  } else if (action.type === 'erase') {
    state.eraseRegions.splice(action.index, 1);
    showStatus('已撤销: 抹平操作');
  }
  render();
}

function reset() {
  if (!confirm('确定要清空画布吗？此操作不可恢复')) return;
  state.elements = state.elements.filter(e =>
    e.type === 'datetime' || e.type === 'avatar' || e.type === 'username'
  );
  // 重置自定义元素位置
  const dt = state.elements.find(e => e.type === 'datetime');
  if (dt) { dt.x = state.groupX; dt.y = state.groupY + (state.showAvatar ? 100 : 0); dt.scale = 1; }
  const av = state.elements.find(e => e.type === 'avatar');
  if (av) { av.x = state.groupX; av.y = state.groupY; av.scale = 1; }
  const un = state.elements.find(e => e.type === 'username');
  if (un) { un.x = state.groupX + 104; un.y = state.groupY + 26; un.scale = 1; }
  state.eraseRegions = [];
  state.undoStack = [];
  state.selectedId = null;
  render();
  showStatus('画布已重置');
}

// ========== 17. 画布缩放 ==========
function zoomIn() {
  state.canvasZoom = Math.min(state.canvasZoom * 1.2, 8);
  applyCanvasZoom();
}
function zoomOut() {
  state.canvasZoom = Math.max(state.canvasZoom / 1.2, 0.15);
  applyCanvasZoom();
}
function zoomFit() {
  fitCanvasToWindow();
}

// ========== 18. 导出 ==========
function exportJPG() {
  if (!state.baseImage) {
    showStatus('请先上传底图');
    return;
  }
  // 创建导出 canvas (使用底图原始分辨率)
  const expCanvas = document.createElement('canvas');
  const origW = state.baseImage.naturalWidth;
  const origH = state.baseImage.naturalHeight;
  expCanvas.width = origW;
  expCanvas.height = origH;
  const exCtx = expCanvas.getContext('2d');

  // 计算缩放比例 (导出分辨率 vs 显示分辨率)
  const sx = origW / canvas.width;
  const sy = origH / canvas.height;

  // 白色背景
  exCtx.fillStyle = '#FFFFFF';
  exCtx.fillRect(0, 0, origW, origH);

  // 底图
  exCtx.drawImage(state.baseImage, 0, 0, origW, origH);

  // 抹平区域
  for (const r of state.eraseRegions) {
    exCtx.fillStyle = '#FFFFFF';
    exCtx.fillRect(r.x * sx, r.y * sy, r.w * sx, r.h * sy);
  }

  // 元素 (按 z 排序)
  const sorted = [...state.elements].sort((a, b) => a.z - b.z);
  for (const el of sorted) {
    drawElementOnExport(exCtx, el, sx, sy);
  }

  // 导出
  expCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '拼图完成.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showStatus('已导出: 拼图完成.jpg');
  }, 'image/jpeg', 0.92);
}

function drawElementOnExport(exCtx, el, sx, sy) {
  const b = getElBounds(el);
  const x = b.x * sx, y = b.y * sy, w = b.w * sx, h = b.h * sy;

  if (el.type === 'material') {
    exCtx.drawImage(el.img, x, y, w, h);
  } else if (el.type === 'avatar') {
    const cx = x + w / 2, cy = y + h / 2, r = w / 2;
    const borderW = Math.max(1, 2 * el.scale * sx);
    exCtx.save();
    exCtx.beginPath();
    exCtx.arc(cx, cy, r - borderW / 2, 0, Math.PI * 2);
    exCtx.closePath();
    exCtx.clip();
    if (el.img) {
      exCtx.drawImage(el.img, x, y, w, h);
    } else {
      exCtx.fillStyle = '#CCCCCC';
      exCtx.fillRect(x, y, w, h);
    }
    exCtx.restore();
    exCtx.strokeStyle = '#00C853';
    exCtx.lineWidth = borderW;
    exCtx.beginPath();
    exCtx.arc(cx, cy, r - borderW / 2, 0, Math.PI * 2);
    exCtx.stroke();
  } else if (el.type === 'username') {
    const fs = Math.round(43 * el.scale * sx);
    exCtx.font = `500 ${fs}px "Microsoft YaHei","PingFang SC",sans-serif`;
    exCtx.fillStyle = '#000000';
    exCtx.textBaseline = 'top';
    exCtx.textAlign = 'left';
    exCtx.fillText(el.text, x, y);
  } else if (el.type === 'datetime') {
    const fs = Math.round(39 * el.scale * sx);
    exCtx.font = `${fs}px "Microsoft YaHei","PingFang SC",sans-serif`;
    exCtx.fillStyle = '#888888';
    exCtx.textBaseline = 'top';
    exCtx.textAlign = 'left';
    exCtx.fillText(el.text, x, y);
  }
}

// ========== 19. 键盘 ==========
function onKeyDown(e) {
  // Shift 状态
  _shiftDown = e.shiftKey;

  // 如果焦点在输入框中，不处理快捷键
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;

  const sel = getSelected();
  if (!sel && !state.eraseMode) {
    if (e.key === 'Escape') {
      state.selectedId = null;
      render();
    }
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      if (sel) { sel.x -= e.shiftKey ? 10 : 1; render(); e.preventDefault(); }
      break;
    case 'ArrowRight':
      if (sel) { sel.x += e.shiftKey ? 10 : 1; render(); e.preventDefault(); }
      break;
    case 'ArrowUp':
      if (sel) { sel.y -= e.shiftKey ? 10 : 1; render(); e.preventDefault(); }
      break;
    case 'ArrowDown':
      if (sel) { sel.y += e.shiftKey ? 10 : 1; render(); e.preventDefault(); }
      break;
    case 'Delete':
    case 'Backspace':
      if (sel) { deleteElement(sel.id); e.preventDefault(); }
      break;
    case 'Escape':
      if (state.erase) {
        state.erase = null;
        render();
      } else {
        state.selectedId = null;
        render();
      }
      break;
    case '+':
    case '=':
      if (sel) {
        const oldSz = getElementSize(sel);
        const cx = sel.x + oldSz.w / 2;
        const cy = sel.y + oldSz.h / 2;
        sel.scale = Math.min(3.0, sel.scale + 0.1);
        const newSz = getElementSize(sel);
        sel.x = cx - newSz.w / 2;
        sel.y = cy - newSz.h / 2;
        render();
        e.preventDefault();
      }
      break;
    case '-':
    case '_':
      if (sel) {
        const oldSz2 = getElementSize(sel);
        const cx2 = sel.x + oldSz2.w / 2;
        const cy2 = sel.y + oldSz2.h / 2;
        sel.scale = Math.max(0.2, sel.scale - 0.1);
        const newSz2 = getElementSize(sel);
        sel.x = cx2 - newSz2.w / 2;
        sel.y = cy2 - newSz2.h / 2;
        render();
        e.preventDefault();
      }
      break;
  }
}

function onKeyUp(e) {
  _shiftDown = e.shiftKey;
}

// ========== 20. 状态显示 ==========
function showStatus(msg) {
  const el = document.getElementById('status-text');
  el.textContent = msg;
  topStatus.textContent = msg;
  topStatus.classList.add('show');
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => topStatus.classList.remove('show'), 2000);
}

function updateStatus() {
  const sel = getSelected();
  const info = document.getElementById('status-info');
  let parts = [`缩放: ${(state.canvasZoom * 100).toFixed(0)}%`];
  if (sel) {
    const b = getElBounds(sel);
    parts.push(`位置: ${Math.round(b.x)}, ${Math.round(b.y)}`);
    parts.push(`比例: ${(sel.scale * 100).toFixed(0)}%`);
  }
  info.textContent = parts.join(' | ');
}

// ========== 21. 默认缩放 ==========
function setDefaultScale(val) {
  val = Math.max(20, Math.min(300, parseInt(val) || 100));
  state.defaultScale = val;
  document.getElementById('scale-input').value = val;
}

// ========== 22. 事件绑定 ==========
function bindEvents() {
  // 底图上传
  document.getElementById('btn-upload').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  document.getElementById('file-input').addEventListener('change', (e) => {
    handleFileUpload(e.target.files[0]);
    e.target.value = '';
  });

  // 抹平
  document.getElementById('btn-erase').addEventListener('click', toggleEraseMode);

  // 撤销 / 重置
  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-reset').addEventListener('click', reset);

  // 导出
  document.getElementById('btn-export').addEventListener('click', exportJPG);

  // 默认缩放
  document.getElementById('scale-input').addEventListener('change', (e) => {
    setDefaultScale(e.target.value);
  });
  document.getElementById('scale-inc').addEventListener('click', () => {
    setDefaultScale(state.defaultScale + 10);
  });
  document.getElementById('scale-dec').addEventListener('click', () => {
    setDefaultScale(state.defaultScale - 10);
  });

  // 自定义信息开关
  document.getElementById('chk-avatar').addEventListener('change', (e) => {
    state.showAvatar = e.target.checked;
    document.getElementById('avatar-edit').classList.toggle('hidden', !state.showAvatar);
    ensureCustomElements();
  });
  document.getElementById('chk-username').addEventListener('change', (e) => {
    state.showUsername = e.target.checked;
    document.getElementById('username-edit').classList.toggle('hidden', !state.showUsername);
    ensureCustomElements();
  });

  // 头像上传 / 删除
  document.getElementById('btn-upload-avatar').addEventListener('click', () => {
    document.getElementById('avatar-input').click();
  });
  document.getElementById('avatar-input').addEventListener('change', (e) => {
    handleAvatarUpload(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('btn-del-avatar').addEventListener('click', deleteAvatar);

  // 用户名输入
  document.getElementById('username-input').addEventListener('input', (e) => {
    state.username = e.target.value || '用户名61515321';
    ensureCustomElements();
  });

  // 日期时间输入
  ['dt-year', 'dt-month', 'dt-day', 'dt-start', 'dt-end'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      state.dateTime.year = parseInt(document.getElementById('dt-year').value) || 2025;
      state.dateTime.month = parseInt(document.getElementById('dt-month').value) || 1;
      state.dateTime.day = parseInt(document.getElementById('dt-day').value) || 1;
      state.dateTime.start = document.getElementById('dt-start').value || '00:00';
      state.dateTime.end = document.getElementById('dt-end').value || '00:00';
      ensureCustomElements();
    });
  });

  // 画布缩放
  document.getElementById('zoom-in').addEventListener('click', zoomIn);
  document.getElementById('zoom-out').addEventListener('click', zoomOut);
  document.getElementById('zoom-fit').addEventListener('click', zoomFit);

  // 画布指针事件
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);

  // 右键取消框选
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (state.erase) {
      state.erase = null;
      render();
    }
  });

  // 键盘
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // 窗口大小变化
  window.addEventListener('resize', () => {
    fitCanvasToWindow();
  });

  // 拖放上传
  canvas.addEventListener('dragover', (e) => { e.preventDefault(); });
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  });
}

// ========== 23. 初始化 ==========
async function init() {
  // 设置默认画布
  setupCanvas(800, 600);
  render();

  // 加载素材
  showStatus('正在加载素材库...');
  await loadAllMaterials();
  renderMaterialPanel();
  showStatus('就绪 — 请上传底图开始');

  // 绑定事件
  bindEvents();

  // 初始化日期时间元素
  ensureCustomElements();
}

// 启动
init();
