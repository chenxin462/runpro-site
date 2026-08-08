// 端到端验证 v3：用 vm 沙箱加载核心引擎（支持 module.exports 分支）
const fs = require('fs');
const vm = require('vm');
const mainHtml = fs.readFileSync(__dirname + '/跑步TCX数据生成器.html', 'utf8');

// ---- 1. 加载核心引擎 ----
function extractCoreEngine() {
  let si = mainHtml.indexOf('TCX 生成核心引擎');
  if (si < 0) throw new Error('未找到核心引擎');
  const ss = mainHtml.lastIndexOf('<script>', si);
  const end = mainHtml.indexOf('</script>', si);
  return mainHtml.slice(mainHtml.indexOf('>', ss) + 1, end);
}
const coreCode = extractCoreEngine();

const sandbox = { module: { exports: {} }, exports: {}, console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(coreCode, sandbox);
const Core = sandbox.module.exports;
console.log('核心引擎导出:', Object.keys(Core).join(', '));

// ---- 2. 地图端 6 圈生成 ----
function extractMap(fnName) {
  const src = fs.readFileSync(__dirname + '/_embedded_map.html', 'utf8');
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
const mapFns = ['toLocal', 'toLatLng', 'mulberry32', 'buildTrackPath', 'addLine', 'addArc',
  'normalizeTrackCorners', 'addLapLine', 'addLapArc', 'buildLapGeom', 'buildTrackLaps'];
let mapCode = '';
for (const n of mapFns) mapCode += '\n' + extractMap(n);
const mapFactory = new Function(mapCode + '\nreturn { buildTrackLaps };');
const MapFns = mapFactory();

function mkCorner(centerLat, centerLng, dxM, dyM) {
  const mPerDegLat = 110540;
  const mPerDegLng = 110540 * Math.cos(centerLat * Math.PI / 180);
  return { lat: centerLat + dyM / mPerDegLat, lng: centerLng + dxM / mPerDegLng };
}
const C = 29.5500, G = 106.5000;
const corners = [mkCorner(C, G, -50, -32), mkCorner(C, G, 50, -32), mkCorner(C, G, 50, 32), mkCorner(C, G, -50, 32)];
const laps = MapFns.buildTrackLaps(corners, 6);
console.log('\n6 圈生成:', laps.length, '圈');
const rawTrack = laps[0];

// ---- 3. 6圈轮流铺满（地图端是 {lat,lng}，核心引擎用 {lat,lon}，做字段归一）----
function toCore(p) { return { lat: p.lat, lon: (p.lon !== undefined ? p.lon : p.lng) }; }
const lapsCore = laps.map(lp => lp.map(toCore));
const rawTrackCore = lapsCore[0];
const unit = Core.makeUnitLoop(rawTrackCore);
const unitLen = Core.pathLength(unit);
console.log('单圈:', unitLen.toFixed(1), 'm');
const totalM = 2400;
const filled = Core.repeatToDistance(unit, totalM, { laps: lapsCore });
console.log('铺满:', filled.pts.length, '点,', filled.len.toFixed(1), 'm');
const gap = Core.distM(filled.pts[0], filled.pts[filled.pts.length - 1]);
console.log('首尾gap:', gap.toFixed(3), 'm', gap < 1 ? '✓' : '✗');

// 各圈中点（验证 6 圈都在用）
console.log('\n各圈中点（应互不相同）:');
const perLap = Math.floor(filled.pts.length / 6);
const o = { lat: C, lng: G };
const mPerDegLat = 110540, mPerDegLng = 110540 * Math.cos(C * Math.PI / 180);
for (let k = 0; k < 6; k++) {
  const mid = filled.pts[Math.min(filled.pts.length - 1, Math.floor(perLap * k + perLap / 2))];
  console.log(`  圈${k + 1}: (${((mid.lon - o.lng) * mPerDegLng).toFixed(1)}, ${((mid.lat - o.lat) * mPerDegLat).toFixed(1)})m`);
}

// ---- 4. 完整 generateTCX ----
console.log('\n===== 完整 generateTCX =====');
try {
  const r = Core.generateTCX({
    dateStr: '2026-08-08',
    startLocalMs: new Date(2026, 7, 8, 18, 30).getTime(),
    distKm: 2.4,
    paceSec: 360,
    calories: 150,
    hrAvg: 145, hrMax: 165, cadAvg: 174,
    path: rawTrackCore,
    laps: lapsCore,
    seed: 12345
  });
  console.log('成功! 顶层字段:', Object.keys(r).join(', '));
  if (r.xml) {
    console.log('XML 长度:', r.xml.length);
    const tp = (r.xml.match(/<Trackpoint>/g) || []).length;
    const lp = (r.xml.match(/<Lap /g) || []).length;
    console.log('Trackpoint:', tp, '| Lap:', lp);
    const distTags = r.xml.match(/<DistanceMeters>([\d.]+)<\/DistanceMeters>/g);
    if (distTags) console.log('最后距离标签:', distTags[distTags.length - 1]);
    // 总距离验证
    const totalDist = parseFloat(distTags[distTags.length - 1].match(/[\d.]+/)[0]);
    console.log('TCX 总距离:', (totalDist / 1000).toFixed(3), 'km', Math.abs(totalDist - totalM) < 5 ? '✓' : '✗');
  }
} catch (e) {
  console.log('generateTCX 失败:', e.message);
  console.log(e.stack);
}

// ---- 5. 输出样例 TCX 到文件供人工检查 ----
try {
  const r = Core.generateTCX({
    dateStr: '2026-08-08',
    startLocalMs: new Date(2026, 7, 8, 18, 30).getTime(),
    distKm: 2.4,
    paceSec: 360,
    calories: 150,
    hrAvg: 145, hrMax: 165, cadAvg: 174,
    path: rawTrackCore,
    laps: lapsCore,
    seed: 12345
  });
  if (r.xml) {
    fs.writeFileSync(__dirname + '/_verify_6laps.tcx', r.xml);
    console.log('\n样例 TCX 已输出到 _verify_6laps.tcx');
  }
} catch (e) { console.log('样例输出失败:', e.message); }

// ---- 6. 6圈整数倍闭合验证 ----
console.log('\n===== 6圈整数倍闭合 =====');
const uLen2 = Core.pathLength(unit);
const filled6 = Core.repeatToDistance(unit, Math.round(uLen2 * 6), { laps: lapsCore });
const gap6 = Core.distM(filled6.pts[0], filled6.pts[filled6.pts.length - 1]);
console.log('6圈整数倍:', filled6.pts.length, '点,', filled6.len.toFixed(1), 'm, 首尾gap:', gap6.toFixed(3), 'm', gap6 < 1 ? '✓ 无缝闭合' : '✗');

// 10.2km 长距离
const filledL = Core.repeatToDistance(unit, 10200, { laps: lapsCore });
console.log('10.2km 铺满:', filledL.pts.length, '点,', filledL.len.toFixed(1), 'm');
