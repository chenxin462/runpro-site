/* 核心引擎自检：验证 TCX 结构与数学自洽性 */
const C = require('./tcx-core.js');

// 模拟一条 800 米左右的操场闭环轨迹（重庆坐标附近）
function fakeTrack() {
  const cx = 29.8131, cy = 106.4259;
  const pts = [];
  const mLat = 110540, mLon = 110540 * Math.cos(cx * Math.PI / 180);
  const a = 60, b = 35; // 椭圆半轴（米）
  for (let i = 0; i <= 120; i++) {
    const th = i / 120 * Math.PI * 2;
    pts.push({
      lat: cx + (b * Math.sin(th)) / mLat,
      lon: cy + (a * Math.cos(th)) / mLon
    });
  }
  return pts;
}

const track = fakeTrack();
console.log('原始轨迹点数:', track.length, '周长(m):', C.pathLength(track).toFixed(1));

// 变体
const variants = C.makeVariants(track, 10, 20260807);
console.log('变体数量:', variants.length);
variants.forEach((v, i) => {
  const len = C.pathLength(v);
  console.log(`  变体${i + 1}: ${v.length}点  周长 ${len.toFixed(1)}m`);
});

// 生成一天数据
const rng = C.makeRng(12345);
const distKm = C.rollDistanceKm(10.2, rng);
const paceSec = C.rollPaceSec(5 * 60, 6 * 60, rng);
const cal = C.rollCalories({ calories: null }, distKm, rng);
const start = new Date(2026, 7, 3, 18, 27, 13); // 本地时间 2026-08-03 18:27:13

console.log('\n--- 本次参数 ---');
console.log('距离(km):', distKm, ' 配速(s/km):', paceSec, `(${Math.floor(paceSec/60)}'${String(paceSec%60).padStart(2,'0')}")`);
console.log('卡路里:', cal, ' 开跑(本地):', start.toString());

const r = C.generateTCX({
  dateStr: '2026-08-03',
  startLocalMs: start.getTime(),
  distKm, paceSec, calories: cal,
  hrAvg: 148, hrMax: 168, cadAvg: 176,
  path: variants[0],
  seed: 999
});

console.log('\n--- 生成统计 ---');
console.log(r.stats);
console.log('XML 字节数:', Buffer.byteLength(r.xml, 'utf8'));

require('fs').writeFileSync(__dirname + '/out-sample.tcx', r.xml, 'utf8');

/* ---------- 自洽性断言 ---------- */
let fail = 0;
function check(name, cond, extra) {
  if (cond) console.log('  [OK] ' + name);
  else { console.log('  [FAIL] ' + name + (extra ? '  ' + extra : '')); fail++; }
}
console.log('\n--- 自洽性检查 ---');

const xml = r.xml;
const expectSec = distKm * paceSec;
check('总时长 = 距离 × 配速', Math.abs(r.stats.totalSec - expectSec) < 0.01,
  `got ${r.stats.totalSec} want ${expectSec}`);
check('平均速度 = 1000/配速', Math.abs(r.stats.avgSpeed - 1000 / paceSec) < 1e-6,
  `got ${r.stats.avgSpeed} want ${1000 / paceSec}`);

// Lap 距离求和 == 总距离
const lapDists = [...xml.matchAll(/<Lap [^>]*>\s*<TotalTimeSeconds>([\d.]+)<\/TotalTimeSeconds>\s*<DistanceMeters>([\d.]+)<\/DistanceMeters>/g)];
const sumLapDist = lapDists.reduce((s, m) => s + parseFloat(m[2]), 0);
const sumLapTime = lapDists.reduce((s, m) => s + parseFloat(m[1]), 0);
check('Lap 数量 = ' + lapDists.length, lapDists.length === r.stats.lapCount);
check('Σ Lap.DistanceMeters == 总距离', Math.abs(sumLapDist - distKm * 1000) < 0.5,
  `got ${sumLapDist.toFixed(2)} want ${distKm * 1000}`);
check('Σ Lap.TotalTimeSeconds == 总时长', Math.abs(sumLapTime - expectSec) < 0.5,
  `got ${sumLapTime.toFixed(2)} want ${expectSec.toFixed(2)}`);

// Trackpoint DistanceMeters 单调递增
const tpDist = [...xml.matchAll(/<AltitudeMeters>[^<]*<\/AltitudeMeters>\s*<DistanceMeters>([\d.eE+-]+)<\/DistanceMeters>/g)].map(m => parseFloat(m[1]));
let mono = true;
for (let i = 1; i < tpDist.length; i++) if (tpDist[i] < tpDist[i - 1] - 1e-6) { mono = false; break; }
check('Trackpoint.DistanceMeters 单调递增', mono);
check('末点距离 == 目标距离', Math.abs(tpDist[tpDist.length - 1] - distKm * 1000) < 0.5,
  `got ${tpDist[tpDist.length - 1]}`);

// 时间单调递增，且首点 == Id
const times = [...xml.matchAll(/<Time>([^<]+)<\/Time>/g)].map(m => Date.parse(m[1]));
let tmono = true;
for (let i = 1; i < times.length; i++) if (times[i] < times[i - 1]) { tmono = false; break; }
check('Trackpoint.Time 单调递增', tmono);
const idStr = xml.match(/<Id>([^<]+)<\/Id>/)[1];
check('Id == 首个 Trackpoint 时间', Date.parse(idStr) === times[0], `${idStr} vs ${new Date(times[0]).toISOString()}`);
check('Id 为 UTC，本地 18:27 → UTC 10:27',
  idStr.indexOf('T10:27:') === 10 || idStr.indexOf('T10:27:') > 0, idStr);
const spanSec = (times[times.length - 1] - times[0]) / 1000;
check('首末时间跨度 == 总时长', Math.abs(spanSec - expectSec) < 1.5, `got ${spanSec} want ${expectSec.toFixed(1)}`);

// Speed 与距离增量自洽（抽样检查中段）
const speeds = [...xml.matchAll(/<ns3:Speed>([\d.eE+-]+)<\/ns3:Speed>/g)].map(m => parseFloat(m[1]));
check('Speed 点数 == Trackpoint 点数', speeds.length === tpDist.length);
let maxErr = 0, dupCount = 0;
for (let i = 1; i < tpDist.length; i++) {
  const dtt = (times[i] - times[i - 1]) / 1000;
  if (dtt <= 0) { dupCount++; continue; }   // Lap 交界重复点（与真实模板行为一致）
  const dd = tpDist[i] - tpDist[i - 1];
  const vAvgSeg = dd / dtt;
  const vMid = (speeds[i] + speeds[i - 1]) / 2;
  maxErr = Math.max(maxErr, Math.abs(vAvgSeg - vMid));
}
check('Speed 与 Δ距离/Δ时间 一致（误差<0.05 m/s）', maxErr < 0.05, `maxErr=${maxErr.toFixed(4)}`);
check('Lap 交界重复点数 == Lap数-1（对齐模板）', dupCount === r.stats.lapCount - 1,
  `dup=${dupCount} laps=${r.stats.lapCount}`);

// Lap.DistanceMeters 应为精确 1000.0（末圈除外），与真实模板一致
const lapDistStrs = [...xml.matchAll(/<TotalTimeSeconds>[\d.]+<\/TotalTimeSeconds>\s*<DistanceMeters>([\d.]+)<\/DistanceMeters>/g)].map(m => m[1]);
const allButLast = lapDistStrs.slice(0, -1);
check('整公里圈 DistanceMeters 全部为 "1000.0"', allButLast.every(s => s === '1000.0'),
  `got ${[...new Set(allButLast)].join(',')}`);
check('末圈距离 = 余数', Math.abs(parseFloat(lapDistStrs[lapDistStrs.length - 1]) - (distKm * 1000 - allButLast.length * 1000)) < 0.5,
  `got ${lapDistStrs[lapDistStrs.length - 1]}`);

// 心率
const hrs = [...xml.matchAll(/<HeartRateBpm>\s*<Value>(\d+)<\/Value>/g)].map(m => +m[1]);
const tpHr = hrs.slice(); // 含 Lap 级的会混入，单独提取 Trackpoint 内的
const tpHrOnly = [...xml.matchAll(/<DistanceMeters>[\d.eE+-]+<\/DistanceMeters>\s*<HeartRateBpm>\s*<Value>(\d+)<\/Value>/g)].map(m => +m[1]);
const hrMean = tpHrOnly.reduce((a, b) => a + b, 0) / tpHrOnly.length;
check('心率均值锚定到 148（±2）', Math.abs(hrMean - 148) <= 2, `got ${hrMean.toFixed(1)}`);
check('心率峰值不超过 168', Math.max(...tpHrOnly) <= 168, `got ${Math.max(...tpHrOnly)}`);
check('心率峰值接近 168（>=164，说明区间用满）', Math.max(...tpHrOnly) >= 164, `got ${Math.max(...tpHrOnly)}`);
const firstTenth = tpHrOnly.slice(0, Math.floor(tpHrOnly.length * 0.05));
check('起跑心率低于均值（热身段）', firstTenth.reduce((a, b) => a + b, 0) / firstTenth.length < hrMean - 5);

// 步频（176 spm → RunCadence 约 88）
const cads = [...xml.matchAll(/<ns3:RunCadence>(\d+)<\/ns3:RunCadence>/g)].map(m => +m[1]).filter(x => x > 0);
const cadMean = cads.reduce((a, b) => a + b, 0) / cads.length;
check('RunCadence 均值 ≈ 88（176/2）', Math.abs(cadMean - 88) < 2.5, `got ${cadMean.toFixed(1)}`);

// 结构完整
check('包含 Creator/Forerunner 45', xml.includes('<Name>Forerunner 45</Name>'));
check('包含 Author/Connect Api', xml.includes('<Name>Connect Api</Name>'));
check('包含 LX 扩展', xml.includes('<ns3:LX>'));
check('命名空间头与模板一致', xml.includes('xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2"'));

console.log(fail === 0 ? '\n✅ 全部通过' : `\n❌ ${fail} 项失败`);
process.exit(fail === 0 ? 0 : 1);
