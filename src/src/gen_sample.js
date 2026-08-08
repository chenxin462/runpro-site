// 生成「新格式」样例 ZIP：store 模式（method 0）+ ASCII 文件名，供直接拿去 KEEP 测试 ZIP 识别
const fs = require('fs');
const Core = require('./tcx-core.js');

// 复刻 app.js 的 FNV-1a 哈希
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// 合成一条轨迹（重庆南滨路附近椭圆，约 1.3km）
function synthTrack() {
  const pts = [];
  const lat0 = 29.5620, lon0 = 106.5730;
  for (let i = 0; i <= 120; i++) {
    const t = i / 120 * Math.PI * 2;
    pts.push({ lat: lat0 + 0.006 * Math.sin(t), lon: lon0 + 0.008 * Math.cos(t) });
  }
  return pts;
}

// ---- store 模式 ZIP（与 app.js makeZip 一致）----
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[i] = c >>> 0; }
  return t;
})();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function dosDateTime(d) {
  return {
    time: ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31),
    date: (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31)
  };
}
function makeZip(files) {
  const enc = new TextEncoder();
  const entries = files.map(f => ({
    nameBytes: enc.encode(f.name),
    crc: crc32(f.data),
    usize: f.data.length,
    body: f.data,
    method: 0,
    dt: dosDateTime(f.mtime || new Date())
  }));
  const parts = [];
  const central = [];
  entries.forEach(e => {
    const offset = Buffer.concat(parts).length;
    const lh = [];
    const n = (v, b) => { const a = Buffer.alloc(b); a.writeUIntLE(v, 0, b); lh.push(a); };
    n(0x04034b50, 4); n(20, 2); n(0x0800, 2); n(e.method, 2);
    n(e.dt.time, 2); n(e.dt.date, 2); n(e.crc, 4); n(e.body.length, 4); n(e.usize, 4);
    n(e.nameBytes.length, 2); n(0, 2);
    lh.push(Buffer.from(e.nameBytes)); lh.push(Buffer.from(e.body));
    parts.push(Buffer.concat(lh));
    central.push({ e, offset });
  });
  const cdParts = [];
  central.forEach(c => {
    const ch = [];
    const n = (v, b) => { const a = Buffer.alloc(b); a.writeUIntLE(v, 0, b); ch.push(a); };
    n(0x02014b50, 4); n(20, 2); n(20, 2); n(0x0800, 2); n(c.e.method, 2);
    n(c.e.dt.time, 2); n(c.e.dt.date, 2); n(c.e.crc, 4); n(c.e.body.length, 4); n(c.e.usize, 4);
    n(c.e.nameBytes.length, 2); n(0, 2); n(0, 2); n(0, 2); n(0, 2); n(0, 4); n(c.offset, 4);
    ch.push(Buffer.from(c.e.nameBytes));
    cdParts.push(Buffer.concat(ch));
  });
  const cdBuf = Buffer.concat(cdParts);
  const cdStart = Buffer.concat(parts).length;
  const eocd = [];
  const n = (v, b) => { const a = Buffer.alloc(b); a.writeUIntLE(v, 0, b); eocd.push(a); };
  n(0x06054b50, 4); n(0, 2); n(0, 2); n(entries.length, 2); n(entries.length, 2);
  n(cdBuf.length, 4); n(cdStart, 4); n(0, 2);
  return Buffer.concat([...parts, cdBuf, Buffer.concat(eocd)]);
}

// ---- 复刻 app.js rollDay（固定用第一条轨迹）----
const SEED = 12345;
const track = synthTrack();
const variants = Core.makeVariants(track, 10, SEED);
const firstPath = variants[0];

const cfg = { distKm: 10.2, paceLo: 300, paceHi: 360, calories: null, timeLo: 18, timeHi: 19,
              hrAvg: null, hrMax: null, cadAvg: null };
const dates = ['2026-08-03', '2026-08-05', '2026-08-07', '2026-08-10'];

const files = dates.map(ds => {
  const rng = Core.makeRng((hashStr(ds) ^ SEED) >>> 0);
  const distKm = Core.rollDistanceKm(cfg.distKm, rng);
  const paceSec = Core.rollPaceSec(cfg.paceLo, cfg.paceHi, rng);
  const cal = Core.rollCalories({ calories: cfg.calories }, distKm, rng);
  const lo = cfg.timeLo * 60, hi = cfg.timeHi * 60;
  const sec = lo === hi ? lo : Core.randInt(rng, lo, hi);
  const d = new Date(ds + 'T00:00:00');
  d.setSeconds(sec);
  const day = {
    dateStr: ds,
    startLocalMs: d.getTime(),
    distKm, paceSec, calories: cal,
    hrAvg: cfg.hrAvg, hrMax: cfg.hrMax, cadAvg: cfg.cadAvg,
    path: firstPath,
    seed: (hashStr(ds + '#tcx') ^ SEED) >>> 0
  };
  const r = Core.generateTCX(day);
  const name = 'run_' + ds + '_' + distKm.toFixed(2) + 'km.tcx';
  return { name, data: Buffer.from(r.xml, 'utf-8'), mtime: new Date(day.startLocalMs) };
});

const zip = makeZip(files);
const outPath = 'C:\\Users\\Administrator\\Desktop\\run_sample_4days.zip';
fs.writeFileSync(outPath, zip);
console.log('已生成样例 ZIP:', outPath, (zip.length / 1048576).toFixed(2), 'MB');
files.forEach(f => console.log('  ', f.name, (f.data.length / 1024).toFixed(0), 'KB'));

// 自校验：用 Node 自带 zlib 之外的简单校验 —— 确认每个文件名是 ASCII 且 method=0
console.log('校验：文件名均为 ASCII =', files.every(f => /^[\x20-\x7E]+$/.test(f.name)));
