// 验证 v7：长周期波浪（幅度2.5m/半波长25m）整体质量
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/_embedded_map.html', 'utf8');
function extract(fnName) {
  const re = new RegExp('function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{');
  const m = src.match(re);
  if (!m) throw new Error('未找到函数 ' + fnName);
  const start = m.index;
  let depth = 0, i = start, inStr = null;
  while (i < src.length) {
    const ch = src[i];
    if (inStr) { if (ch === '\\') { i += 2; continue; } if (ch === inStr) inStr = null; }
    else { if (ch === '"' || ch === "'" || ch === '`') inStr = ch; else if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) break; } }
    i++;
  }
  return src.slice(start, i + 1);
}
const need = ['toLocal', 'toLatLng', 'mulberry32', 'buildTrackPath', 'addLine', 'addArc',
  'addLapLine', 'addLapArc', 'buildLapGeom', 'buildTrackLaps'];
let code = '';
for (const n of need) { code += '\n' + extract(n); }
const F = new Function(code + '\nreturn { buildTrackLaps };')();
function toLocalM(p, origin) {
  const mPerDegLat = 110540, mPerDegLng = 110540 * Math.cos(origin.lat * Math.PI / 180);
  return { x: (p.lng - origin.lng) * mPerDegLng, y: (p.lat - origin.lat) * mPerDegLat };
}
function originOf(pts) {
  let sLat = 0, sLng = 0;
  for (const p of pts) { sLat += p.lat; sLng += p.lng; }
  return { lat: sLat / pts.length, lng: sLng / pts.length };
}
function mkCorner(centerLat, centerLng, dxM, dyM) {
  const mPerDegLat = 110540, mPerDegLng = 110540 * Math.cos(centerLat * Math.PI / 180);
  return { lat: centerLat + dyM / mPerDegLat, lng: centerLng + dxM / mPerDegLng };
}
const C = 29.5500, G = 106.5000;
const corners = [
  mkCorner(C, G, -52, -33), mkCorner(C, G, 48, -31),
  mkCorner(C, G, 51, 30), mkCorner(C, G, -49, 34)
];
const laps = F.buildTrackLaps(corners, 6);
console.log('生成圈数:', laps.length);

// 1. 首尾闭合
console.log('\n===== 1. 首尾闭合 =====');
laps.forEach((lp, i) => {
  const oo = originOf(lp), a = toLocalM(lp[0], oo), b = toLocalM(lp[lp.length - 1], oo);
  const gap = Math.hypot(a.x - b.x, a.y - b.y);
  console.log(`圈${i + 1}: gap ${gap.toFixed(3)}m ${gap < 1 ? '✓' : '✗'}`);
});

// 2. 直道波浪幅度（用点1-点2连线的法向偏移的最大值）
console.log('\n===== 2. 直道波浪幅度（应 ≥2m，体现明显波浪）=====');
laps.forEach((lp, i) => {
  const oo = originOf(lp), loc = lp.map(p => toLocalM(p, oo));
  // 直道1 大约在轨迹前 25%
  const s = Math.floor(loc.length * 0.02), e = Math.floor(loc.length * 0.22);
  const a = loc[s], b = loc[e];
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
  const nrm = { x: -dy / L, y: dx / L };
  let maxOff = 0;
  for (let j = s; j <= e; j++) {
    const off = (loc[j].x - a.x) * nrm.x + (loc[j].y - a.y) * nrm.y;
    maxOff = Math.max(maxOff, Math.abs(off));
  }
  console.log(`圈${i + 1}: 直道波浪最大偏移 ${maxOff.toFixed(2)}m ${maxOff >= 2 ? '✓ 明显波浪' : '✗ 太弱'}`);
});

// 3. 相邻点距（无跳点）
console.log('\n===== 3. 无异常跳点 =====');
laps.forEach((lp, i) => {
  const oo = originOf(lp), loc = lp.map(p => toLocalM(p, oo));
  let maxD = 0, minD = 1e9;
  for (let j = 1; j < loc.length; j++) {
    const d = Math.hypot(loc[j].x - loc[j - 1].x, loc[j].y - loc[j - 1].y);
    maxD = Math.max(maxD, d); minD = Math.min(minD, d);
  }
  console.log(`圈${i + 1}: 点距 ${minD.toFixed(1)}~${maxD.toFixed(1)}m ${maxD < 12 ? '✓' : '✗'}`);
});

// 4. 弯道圆弧性（波浪下半径应在基准半径附近 ±3m）
console.log('\n===== 4. 弯道半径（波浪 ±2.5m，半径应在 29~35m 范围）=====');
function arcRadiusDeviation(pts) {
  const oo = originOf(pts), loc = pts.map(p => toLocalM(p, oo));
  const radii = [];
  const step = Math.max(3, Math.floor(loc.length / 12));
  for (let i = step; i < loc.length - step; i += Math.max(1, Math.floor(loc.length / 60))) {
    const a = loc[i - step], b = loc[i], c = loc[i + step];
    const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    if (Math.abs(d) < 1e-9) continue;
    const ux = ((a.x * a.x + a.y * a.y) * (b.y - c.y) + (b.x * b.x + b.y * b.y) * (c.y - a.y) + (c.x * c.x + c.y * c.y) * (a.y - b.y)) / d;
    const uy = ((a.x * a.x + a.y * a.y) * (c.x - b.x) + (b.x * b.x + b.y * b.y) * (a.x - c.x) + (c.x * c.x + c.y * c.y) * (b.x - a.x)) / d;
    radii.push(Math.hypot(a.x - ux, a.y - uy));
  }
  if (!radii.length) return { mean: 0, rng: 999 };
  const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
  const rng = Math.max(...radii) - Math.min(...radii);
  return { mean, rng };
}
laps.forEach((lp, i) => {
  // 弯道段 = 曲率高的区域（用大步长曲率）
  const oo = originOf(lp), loc = lp.map(p => toLocalM(p, oo));
  const n = loc.length;
  const bigStep = Math.max(5, Math.floor(n / 40));
  const curv = new Array(n).fill(0);
  for (let j = bigStep; j < n - bigStep; j++) {
    const a = loc[j - bigStep], b = loc[j], c = loc[j + bigStep];
    const v1x = b.x - a.x, v1y = b.y - a.y, v2x = c.x - b.x, v2y = c.y - b.y;
    const l1 = Math.hypot(v1x, v1y) || 1, l2 = Math.hypot(v2x, v2y) || 1;
    curv[j] = Math.abs(v1x * v2y - v1y * v2x) / (l1 * l2);
  }
  const segs = []; let start = -1;
  for (let j = 0; j < n; j++) {
    if (curv[j] > 0.06 && start < 0) start = j;
    if (curv[j] <= 0.06 && start >= 0) { if (j - start > n * 0.06) segs.push([start, j]); start = -1; }
  }
  if (start >= 0 && n - start > n * 0.06) segs.push([start, n - 1]);
  if (!segs.length) { console.log(`圈${i + 1}: 无弯道段`); return; }
  const [s, e] = segs[0];
  const len = e - s;
  const fit = arcRadiusDeviation(lp.slice(s + Math.floor(len * 0.15), e - Math.floor(len * 0.15) + 1));
  console.log(`圈${i + 1}: 弯道半径均值 ${fit.mean.toFixed(1)}m, 波动范围 ${fit.rng.toFixed(1)}m ${fit.rng < 8 ? '✓ 仍是圆弧' : '✗'}`);
});

// 5. 周长
console.log('\n===== 5. 周长 =====');
laps.forEach((lp, i) => {
  const oo = originOf(lp), loc = lp.map(p => toLocalM(p, oo));
  let d = 0;
  for (let j = 1; j < loc.length; j++) d += Math.hypot(loc[j].x - loc[j - 1].x, loc[j].y - loc[j - 1].y);
  console.log(`圈${i + 1}: ${d.toFixed(1)}m`);
});
