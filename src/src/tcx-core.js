/* ============================================================
 * TCX 生成核心引擎（纯逻辑，无 DOM 依赖，浏览器 / Node 通用）
 * 严格对齐用户提供的 Garmin Forerunner 45 真实 TCX 模板结构
 * ============================================================ */
(function (root) {
  'use strict';

  /* ---------- 基础数学 ---------- */

  var R_EARTH = 6371000;

  function toRad(d) { return d * Math.PI / 180; }

  // Haversine 距离（米）
  function distM(a, b) {
    var dLat = toRad(b.lat - a.lat);
    var dLon = toRad(b.lon - a.lon);
    var sa = Math.sin(dLat / 2), so = Math.sin(dLon / 2);
    var h = sa * sa + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * so * so;
    return R_EARTH * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // 可复现随机（mulberry32）
  function makeRng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rand(rng, lo, hi) { return lo + (hi - lo) * rng(); }
  function randInt(rng, lo, hi) { return Math.floor(lo + (hi - lo + 1) * rng()); }

  /* ---------- 数字格式化：模仿 Garmin 的 float32 输出风格 ---------- */

  // Garmin TCX 中数值来自 Java float，输出为 float32 转 double 的全精度文本
  function f32(x) {
    var v = Math.fround(x);
    if (!isFinite(v)) v = 0;
    var s = String(v);
    if (s.indexOf('.') < 0 && s.indexOf('e') < 0 && s.indexOf('E') < 0) s += '.0';
    return s;
  }

  // 经纬度：模板保留完整 double 精度
  function fdeg(x) {
    var s = String(x);
    if (s.indexOf('.') < 0) s += '.0';
    return s;
  }

  // UTC 时间戳，格式 2022-01-20T09:45:38.000Z
  function isoZ(ms) {
    return new Date(Math.round(ms / 1000) * 1000).toISOString().replace(/\.\d{3}Z$/, '.000Z');
  }

  /* ---------- 路径处理 ---------- */

  function pathLength(pts) {
    var d = 0;
    for (var i = 1; i < pts.length; i++) d += distM(pts[i - 1], pts[i]);
    return d;
  }

  // 清洗：去掉重复点与异常点
  function cleanPath(raw) {
    var out = [];
    for (var i = 0; i < raw.length; i++) {
      var p = raw[i];
      var lat = +(p.lat), lon = +(p.lon !== undefined ? p.lon : p.lng);
      if (!isFinite(lat) || !isFinite(lon)) continue;
      if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
      var q = { lat: lat, lon: lon };
      if (p.alt !== undefined && isFinite(+p.alt)) q.alt = +p.alt;
      var last = out[out.length - 1];
      if (last && distM(last, q) < 0.3) continue;
      out.push(q);
    }
    return out;
  }

  // 构造「单圈」闭合路径：闭环直接用，开放路径做折返（out-and-back）
  function makeUnitLoop(base) {
    if (base.length < 2) return base.slice();
    var head = base[0], tail = base[base.length - 1];
    var gap = distM(head, tail);
    if (gap < 40) {
      var u = base.slice();
      if (gap > 0.5) u.push({ lat: head.lat, lon: head.lon, alt: head.alt });
      return u;
    }
    // 折返：正序 + 逆序（去掉逆序首点，避免终点重复），末点天然回到起点
    var back = [];
    for (var i = base.length - 2; i >= 0; i--) {
      back.push({ lat: base[i].lat, lon: base[i].lon, alt: base[i].alt });
    }
    return base.concat(back);
  }

  function lerpPt(a, b, t) {
    var p = { lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t };
    if (a.alt !== undefined && b.alt !== undefined) p.alt = a.alt + (b.alt - a.alt) * t;
    return p;
  }

  // 把单圈路径循环铺满到目标距离，返回 { pts, cum }
  function repeatToDistance(unit, targetM) {
    var out = [{ lat: unit[0].lat, lon: unit[0].lon, alt: unit[0].alt }];
    var cum = [0];
    var acc = 0, idx = 1, guard = 0;
    var maxSteps = 4000000;
    while (acc < targetM - 1e-6 && guard++ < maxSteps) {
      var prev = out[out.length - 1];
      var nxt = unit[idx];
      var d = distM(prev, nxt);
      if (d < 1e-9) { idx = (idx + 1 >= unit.length) ? 1 : idx + 1; continue; }
      if (acc + d >= targetM) {
        var t = (targetM - acc) / d;
        out.push(lerpPt(prev, nxt, t));
        cum.push(targetM);
        acc = targetM;
        break;
      }
      out.push({ lat: nxt.lat, lon: nxt.lon, alt: nxt.alt });
      acc += d;
      cum.push(acc);
      idx++;
      if (idx >= unit.length) idx = 1; // unit 末点 == 首点，回到索引 1
    }
    return { pts: out, cum: cum, len: acc };
  }

  // 在累计距离数组上按目标距离取点（线性插值）
  function makeSampler(pts, cum) {
    var lo = 0;
    return function (target) {
      if (target <= 0) return { lat: pts[0].lat, lon: pts[0].lon, alt: pts[0].alt };
      var n = cum.length;
      if (target >= cum[n - 1]) return { lat: pts[n - 1].lat, lon: pts[n - 1].lon, alt: pts[n - 1].alt };
      if (cum[lo] > target) lo = 0;
      while (lo + 1 < n && cum[lo + 1] < target) lo++;
      var a = pts[lo], b = pts[lo + 1];
      var seg = cum[lo + 1] - cum[lo];
      var t = seg > 1e-9 ? (target - cum[lo]) / seg : 0;
      return lerpPt(a, b, t);
    };
  }

  /* ---------- 轨迹变体：由 1 条原始轨迹派生 N 条形似而不同的路线 ---------- */

  // 沿法线方向做平滑随机偏移 + 整体微缩放，形态相似但不重合
  function makeVariants(base, count, seed) {
    var res = [];
    var cleaned = cleanPath(base);
    if (cleaned.length < 2) return [cleaned];
    res.push(cleaned.map(function (p) { return { lat: p.lat, lon: p.lon, alt: p.alt }; }));
    for (var v = 1; v < count; v++) {
      var rng = makeRng((seed || 20260807) + v * 7919);
      // 3 个不同频率的正弦叠加成平滑偏移场
      var w1 = rand(rng, 1.5, 3.5), w2 = rand(rng, 4, 8), w3 = rand(rng, 9, 16);
      var p1 = rand(rng, 0, Math.PI * 2), p2 = rand(rng, 0, Math.PI * 2), p3 = rand(rng, 0, Math.PI * 2);
      var amp = rand(rng, 4, 11);           // 偏移幅度（米）
      var scale = rand(rng, 0.985, 1.015);  // 整体缩放
      var n = cleaned.length;
      // 质心，用于缩放
      var clat = 0, clon = 0;
      for (var i = 0; i < n; i++) { clat += cleaned[i].lat; clon += cleaned[i].lon; }
      clat /= n; clon /= n;
      var mPerLat = 110540;
      var mPerLon = 110540 * Math.cos(toRad(clat));
      var out = [];
      for (var k = 0; k < n; k++) {
        var t = k / (n - 1);
        var cur = cleaned[k];
        var prev = cleaned[Math.max(0, k - 1)];
        var next = cleaned[Math.min(n - 1, k + 1)];
        // 局部切向 → 法向
        var dx = (next.lon - prev.lon) * mPerLon;
        var dy = (next.lat - prev.lat) * mPerLat;
        var len = Math.hypot(dx, dy) || 1;
        var nx = -dy / len, ny = dx / len;
        var off = amp * (0.6 * Math.sin(w1 * 2 * Math.PI * t + p1)
          + 0.28 * Math.sin(w2 * 2 * Math.PI * t + p2)
          + 0.12 * Math.sin(w3 * 2 * Math.PI * t + p3));
        // 首尾渐隐，保证闭环性质不被破坏
        var fade = Math.min(1, Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 1.6);
        off *= fade;
        var sx = (cur.lon - clon) * mPerLon * scale + off * nx;
        var sy = (cur.lat - clat) * mPerLat * scale + off * ny;
        out.push({ lat: clat + sy / mPerLat, lon: clon + sx / mPerLon, alt: cur.alt });
      }
      res.push(out);
    }
    return res;
  }

  /* ---------- 合成海拔（地图不回传高程时使用） ---------- */

  function synthAlt(distanceM, baseAlt, seedPhase) {
    var d = distanceM;
    return baseAlt
      + 4.2 * Math.sin(d / 620 + seedPhase)
      + 2.1 * Math.sin(d / 213 + seedPhase * 1.7)
      + 0.8 * Math.sin(d / 77 + seedPhase * 2.3);
  }

  /* ---------- 单次跑步的随机参数 ---------- */

  // 距离：整数部分与第一位小数固定，末尾追加 0.01~0.09
  function rollDistanceKm(baseKm, rng) {
    var base10 = Math.floor(Math.round(baseKm * 10)) / 10;   // 保留到 0.1
    var tail = randInt(rng, 1, 9) / 100;
    return Math.round((base10 + tail) * 100) / 100;
  }

  function rollPaceSec(minSec, maxSec, rng) {
    var lo = Math.min(minSec, maxSec), hi = Math.max(minSec, maxSec);
    return randInt(rng, lo, hi);
  }

  function rollCalories(cfg, distKm, rng) {
    if (cfg.calories !== null && cfg.calories !== undefined && cfg.calories !== '') {
      var base = +cfg.calories;
      return Math.round(base * (1 + rand(rng, 0.01, 0.03)));
    }
    return Math.round(distKm * rand(rng, 60, 63));
  }

  /* ---------- 心率曲线 ---------- */

  // prog 0..1；返回以 span(= hrMax - hrAvg) 为单位的相对形状值
  // 形态：前 10% 热身爬升 → 中段稳定并缓慢上漂（心率漂移）→ 末 8% 略降
  function hrShape(prog, speedRatio, wave) {
    var v, s;
    if (prog < 0.10) {
      s = prog / 0.10;
      v = -1.25 + 1.00 * (1 - Math.pow(1 - s, 2));       // -1.25 → -0.25
    } else if (prog > 0.92) {
      s = (prog - 0.92) / 0.08;
      v = 0.58 - 0.38 * s;                                // 收尾回落
    } else {
      s = (prog - 0.10) / 0.82;
      v = -0.25 + 0.83 * s;                               // 中段缓升
    }
    v += (speedRatio - 1) * 2.2;                          // 速度耦合
    v += wave;                                            // 慢波动
    return v;
  }

  /* ---------- 主生成函数 ---------- */

  /**
   * cfg 字段：
   *   dateStr        'YYYY-MM-DD'
   *   startLocalMs   开跑时刻（本地时间毫秒）
   *   distKm         已随机好的距离（km）
   *   paceSec        已随机好的配速（秒/公里）
   *   calories       已随机好的卡路里（整数）
   *   hrAvg / hrMax  可为 null
   *   cadAvg         双脚步频 spm，可为 null
   *   path           [{lat,lon,alt?}] 原始轨迹（会被铺满到目标距离）
   *   seed           随机种子
   */
  function generateTCX(cfg) {
    var rng = makeRng(cfg.seed || 1);
    var totalM = Math.round(cfg.distKm * 1000 * 100) / 100;
    var totalSec = cfg.distKm * cfg.paceSec;
    var vAvg = totalM / totalSec;

    // 1) 路径铺满
    var cleaned = cleanPath(cfg.path || []);
    if (cleaned.length < 2) throw new Error('轨迹点不足，至少需要 2 个有效坐标点');
    var unit = makeUnitLoop(cleaned);
    var unitLen = pathLength(unit);
    if (unitLen < 20) throw new Error('轨迹总长过短（' + unitLen.toFixed(1) + ' 米），无法铺满目标距离');
    var filled = repeatToDistance(unit, totalM);
    var sample = makeSampler(filled.pts, filled.cum);

    // 2) 采样点数：贴近 Garmin 智能记录节奏（约 4~5 秒 / 点）
    var N = Math.round(clamp(totalSec / 4.5, 240, 1600));
    N = Math.max(2, Math.min(N, Math.floor(totalSec)));  // 保证平均间隔 >= 1 秒
    var dtF = totalSec / N;
    // Garmin 的 Trackpoint 时间戳为整秒，先铺好整秒时间网格，
    // 后续距离积分严格按这个网格的真实 Δt 进行，保证 Speed 与 Δ距离/Δ时间 完全自洽
    var tS = new Array(N + 1);
    for (var ti = 0; ti <= N; ti++) tS[ti] = Math.round(ti * dtF);
    tS[N] = Math.round(totalSec);
    for (var tj = 1; tj <= N; tj++) if (tS[tj] <= tS[tj - 1]) tS[tj] = tS[tj - 1] + 1;

    // 3) 速度曲线：平滑波动 + 起步加速 + 收尾减速，再归一化保证总距离精确
    var ph1 = rand(rng, 0, 6.283), ph2 = rand(rng, 0, 6.283), ph3 = rand(rng, 0, 6.283);
    var f1 = rand(rng, 2.0, 3.4), f2 = rand(rng, 5.5, 8.5), f3 = rand(rng, 13, 19);
    var w = new Array(N + 1);
    for (var k = 0; k <= N; k++) {
      var tsec = tS[k];
      var t = tsec / totalSec;
      var base = 1
        + 0.045 * Math.sin(f1 * 2 * Math.PI * t + ph1)
        + 0.026 * Math.sin(f2 * 2 * Math.PI * t + ph2)
        + 0.013 * Math.sin(f3 * 2 * Math.PI * t + ph3);
      // 起步 25 秒渐进加速
      if (tsec < 25) base *= 0.30 + 0.70 * (tsec / 25);
      // 结束前 18 秒轻微收力
      var left = totalSec - tsec;
      if (left < 18) base *= 0.80 + 0.20 * Math.max(0, left / 18);
      w[k] = Math.max(0.05, base);
    }
    w[0] = 0; // 首点静止，与模板一致（Speed 0.0）
    // 按整秒网格的真实 Δt 做梯形积分并归一化，使总距离精确等于目标
    var integ = 0;
    for (var i = 0; i < N; i++) integ += (w[i] + w[i + 1]) / 2 * (tS[i + 1] - tS[i]);
    var kScale = totalM / integ;
    var v = new Array(N + 1);
    for (var j = 0; j <= N; j++) v[j] = w[j] * kScale;

    // 4) 逐点累计距离 / 时间 / 坐标 / 海拔
    var startMs = cfg.startLocalMs;
    var altPhase = rand(rng, 0, 6.283);
    var hasRealAlt = cleaned.some(function (p) { return p.alt !== undefined; });
    var baseAlt = 209.4;

    var pts = new Array(N + 1);
    var dAcc = 0;
    for (var q = 0; q <= N; q++) {
      if (q > 0) dAcc += (v[q - 1] + v[q]) / 2 * (tS[q] - tS[q - 1]);
      var dd = Math.min(dAcc, totalM);
      var pos = sample(dd);
      var alt = hasRealAlt && pos.alt !== undefined ? pos.alt : synthAlt(dd, baseAlt, altPhase);
      pts[q] = {
        tMs: startMs + tS[q] * 1000,
        lat: pos.lat,
        lon: pos.lon,
        alt: alt,
        dist: dd,
        speed: v[q]
      };
    }
    pts[N].dist = totalM;

    // 5) 心率
    var hrAvgTarget = (cfg.hrAvg !== null && cfg.hrAvg !== undefined && cfg.hrAvg !== '') ? +cfg.hrAvg : 145;
    var hrMaxTarget = (cfg.hrMax !== null && cfg.hrMax !== undefined && cfg.hrMax !== '') ? +cfg.hrMax : Math.round(hrAvgTarget * 1.12);
    if (hrMaxTarget <= hrAvgTarget) hrMaxTarget = hrAvgTarget + 6;
    var span = Math.max(8, hrMaxTarget - hrAvgTarget);
    var rawHr = new Array(N + 1);
    var hrNoise = 0;
    var hw1 = rand(rng, 3, 6), hw2 = rand(rng, 8, 14);
    var hp1 = rand(rng, 0, 6.283), hp2 = rand(rng, 0, 6.283);
    for (var m = 0; m <= N; m++) {
      var prog = m / N;
      var ratio = vAvg > 0 ? pts[m].speed / vAvg : 1;
      hrNoise = hrNoise * 0.78 + rand(rng, -1, 1) * 0.55;  // 一阶平滑噪声（bpm 尺度）
      var wave = 0.14 * Math.sin(hw1 * 2 * Math.PI * prog + hp1)
        + 0.07 * Math.sin(hw2 * 2 * Math.PI * prog + hp2);
      rawHr[m] = hrShape(prog, clamp(ratio, 0.4, 1.6), wave) * span + hrNoise;
    }
    // 锚定 1：整体平移，使均值等于目标平均心率
    var meanRaw = 0;
    for (var m2 = 0; m2 <= N; m2++) meanRaw += rawHr[m2];
    meanRaw /= (N + 1);
    var shifted = rawHr.map(function (x) { return x - meanRaw + hrAvgTarget; });
    // 锚定 2：缩放峰值，使最大心率恰好落在目标最大值附近（不高于、也不明显偏低）
    var peak = Math.max.apply(null, shifted);
    if (peak - hrAvgTarget > 0.5) {
      var wantPeak = hrMaxTarget - rand(rng, 0, 1.4);
      var f = (wantPeak - hrAvgTarget) / (peak - hrAvgTarget);
      f = clamp(f, 0.35, 2.6);
      shifted = shifted.map(function (x) { return hrAvgTarget + (x - hrAvgTarget) * f; });
      // 缩放会轻微改变均值，再平移校正一次
      var mean2 = 0;
      for (var m4 = 0; m4 <= N; m4++) mean2 += shifted[m4];
      mean2 /= (N + 1);
      var fix = hrAvgTarget - mean2;
      shifted = shifted.map(function (x) { return x + fix; });
    }
    var hrFloor = Math.max(60, Math.round(hrAvgTarget * 0.55));
    for (var m3 = 0; m3 <= N; m3++) {
      pts[m3].hr = Math.round(clamp(shifted[m3], hrFloor, hrMaxTarget));
    }
    pts[N].hr = Math.min(pts[N].hr, hrMaxTarget);

    // 6) 步频（TCX RunCadence 为单脚步频 = spm / 2）
    var spmTotal = (cfg.cadAvg !== null && cfg.cadAvg !== undefined && cfg.cadAvg !== '') ? +cfg.cadAvg : 174;
    var cadBase = spmTotal / 2;
    for (var c = 0; c <= N; c++) {
      if (c === 0 || pts[c].speed < 0.35) { pts[c].cad = 0; continue; }
      var r = vAvg > 0 ? pts[c].speed / vAvg : 1;
      // 步频对速度的敏感度低于步幅
      var cv = cadBase * (1 + (r - 1) * 0.32) + rand(rng, -1.2, 1.2);
      pts[c].cad = Math.round(clamp(cv, 30, 130));
    }

    // 7) 按每公里分圈 —— 复刻模板：Lap.DistanceMeters 为精确的 1000.0，
    //    圈用时由里程碑处插值得到，交界 Trackpoint 在相邻两圈各出现一次
    var marks = [0];
    for (var mk = 1000; mk < totalM - 1e-6; mk += 1000) marks.push(mk);
    // 尾圈过短（< 40 米）则并入上一圈
    if (marks.length > 1 && totalM - marks[marks.length - 1] < 40) marks.pop();
    marks.push(totalM);

    // 在里程碑处插值取时间（毫秒）
    function timeAtDist(d) {
      if (d <= 0) return pts[0].tMs;
      if (d >= totalM) return pts[N].tMs;
      var lo = 0, hi = N;
      while (lo + 1 < hi) {
        var mid = (lo + hi) >> 1;
        if (pts[mid].dist <= d) lo = mid; else hi = mid;
      }
      var seg = pts[hi].dist - pts[lo].dist;
      var t = seg > 1e-9 ? (d - pts[lo].dist) / seg : 0;
      return pts[lo].tMs + (pts[hi].tMs - pts[lo].tMs) * t;
    }
    // 第一个累计距离 >= d 的采样点索引
    function idxAtDist(d) {
      if (d <= 0) return 0;
      for (var i2 = 0; i2 <= N; i2++) if (pts[i2].dist >= d - 1e-6) return i2;
      return N;
    }

    var lapInfos = [];
    for (var lp = 0; lp + 1 < marks.length; lp++) {
      var mA = marks[lp], mB = marks[lp + 1];
      var from = idxAtDist(mA);
      var to = (lp + 2 === marks.length) ? N : idxAtDist(mB);
      if (to <= from) to = Math.min(N, from + 1);
      var dseg = mB - mA;
      var tseg = (timeAtDist(mB) - timeAtDist(mA)) / 1000;
      var maxSpd = 0, hrSum = 0, hrMx = 0, cadSum = 0, cadMx = 0, cadCnt = 0, cnt = 0;
      for (var x = from; x <= to; x++) {
        if (pts[x].speed > maxSpd) maxSpd = pts[x].speed;
        hrSum += pts[x].hr; cnt++;
        if (pts[x].hr > hrMx) hrMx = pts[x].hr;
        if (pts[x].cad > 0) { cadSum += pts[x].cad; cadCnt++; if (pts[x].cad > cadMx) cadMx = pts[x].cad; }
      }
      lapInfos.push({
        from: from, to: to,
        startMs: timeAtDist(mA),
        dist: dseg, time: tseg,
        maxSpeed: maxSpd,
        avgSpeed: tseg > 0 ? dseg / tseg : 0,
        hrAvg: Math.round(hrSum / cnt),
        hrMax: hrMx,
        cadAvg: cadCnt ? Math.round(cadSum / cadCnt) : 0,
        cadMax: cadMx
      });
    }
    var calLeft = cfg.calories;
    for (var li = 0; li < lapInfos.length; li++) {
      if (li === lapInfos.length - 1) {
        lapInfos[li].cal = Math.max(0, calLeft);
      } else {
        var c2 = Math.round(cfg.calories * lapInfos[li].dist / totalM);
        lapInfos[li].cal = c2;
        calLeft -= c2;
      }
    }

    // 8) 序列化 XML（严格复刻模板缩进与字段顺序）
    var L = [];
    L.push('<?xml version="1.0" encoding="UTF-8"?>');
    L.push('<TrainingCenterDatabase');
    L.push('  xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd"');
    L.push('  xmlns:ns5="http://www.garmin.com/xmlschemas/ActivityGoals/v1"');
    L.push('  xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2"');
    L.push('  xmlns:ns2="http://www.garmin.com/xmlschemas/UserProfile/v2"');
    L.push('  xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"');
    L.push('  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns4="http://www.garmin.com/xmlschemas/ProfileExtension/v1">');
    L.push('  <Activities>');
    L.push('    <Activity Sport="Running">');
    L.push('      <Id>' + isoZ(startMs) + '</Id>');

    lapInfos.forEach(function (lap) {
      L.push('      <Lap StartTime="' + isoZ(lap.startMs) + '">');
      L.push('        <TotalTimeSeconds>' + lap.time.toFixed(3) + '</TotalTimeSeconds>');
      L.push('        <DistanceMeters>' + f32(lap.dist) + '</DistanceMeters>');
      L.push('        <MaximumSpeed>' + f32(lap.maxSpeed) + '</MaximumSpeed>');
      L.push('        <Calories>' + lap.cal + '</Calories>');
      L.push('        <AverageHeartRateBpm>');
      L.push('          <Value>' + lap.hrAvg + '</Value>');
      L.push('        </AverageHeartRateBpm>');
      L.push('        <MaximumHeartRateBpm>');
      L.push('          <Value>' + lap.hrMax + '</Value>');
      L.push('        </MaximumHeartRateBpm>');
      L.push('        <Intensity>Active</Intensity>');
      L.push('        <TriggerMethod>Manual</TriggerMethod>');
      L.push('        <Track>');
      for (var x = lap.from; x <= lap.to; x++) {
        // 圈与圈交界点归属上一圈的终点 + 下一圈的起点，与 Garmin 行为一致
        var P = pts[x];
        L.push('          <Trackpoint>');
        L.push('            <Time>' + isoZ(P.tMs) + '</Time>');
        L.push('            <Position>');
        L.push('              <LatitudeDegrees>' + fdeg(P.lat) + '</LatitudeDegrees>');
        L.push('              <LongitudeDegrees>' + fdeg(P.lon) + '</LongitudeDegrees>');
        L.push('            </Position>');
        L.push('            <AltitudeMeters>' + f32(P.alt) + '</AltitudeMeters>');
        L.push('            <DistanceMeters>' + f32(P.dist) + '</DistanceMeters>');
        L.push('            <HeartRateBpm>');
        L.push('              <Value>' + P.hr + '</Value>');
        L.push('            </HeartRateBpm>');
        L.push('            <Extensions>');
        L.push('              <ns3:TPX>');
        L.push('                <ns3:Speed>' + f32(P.speed) + '</ns3:Speed>');
        L.push('                <ns3:RunCadence>' + P.cad + '</ns3:RunCadence>');
        L.push('              </ns3:TPX>');
        L.push('            </Extensions>');
        L.push('          </Trackpoint>');
      }
      L.push('        </Track>');
      L.push('        <Extensions>');
      L.push('          <ns3:LX>');
      L.push('            <ns3:AvgSpeed>' + f32(lap.avgSpeed) + '</ns3:AvgSpeed>');
      L.push('            <ns3:AvgRunCadence>' + lap.cadAvg + '</ns3:AvgRunCadence>');
      L.push('            <ns3:MaxRunCadence>' + lap.cadMax + '</ns3:MaxRunCadence>');
      L.push('          </ns3:LX>');
      L.push('        </Extensions>');
      L.push('      </Lap>');
    });

    L.push('      <Creator xsi:type="Device_t">');
    L.push('        <Name>Forerunner 45</Name>');
    L.push('        <UnitId>3367953556</UnitId>');
    L.push('        <ProductID>3469</ProductID>');
    L.push('        <Version>');
    L.push('          <VersionMajor>4</VersionMajor>');
    L.push('          <VersionMinor>40</VersionMinor>');
    L.push('          <BuildMajor>0</BuildMajor>');
    L.push('          <BuildMinor>0</BuildMinor>');
    L.push('        </Version>');
    L.push('      </Creator>');
    L.push('    </Activity>');
    L.push('  </Activities>');
    L.push('  <Author xsi:type="Application_t">');
    L.push('    <Name>Connect Api</Name>');
    L.push('    <Build>');
    L.push('      <Version>');
    L.push('        <VersionMajor>26</VersionMajor>');
    L.push('        <VersionMinor>15</VersionMinor>');
    L.push('        <BuildMajor>0</BuildMajor>');
    L.push('        <BuildMinor>0</BuildMinor>');
    L.push('      </Version>');
    L.push('    </Build>');
    L.push('    <LangID>en</LangID>');
    L.push('    <PartNumber>006-D2449-00</PartNumber>');
    L.push('  </Author>');
    L.push('</TrainingCenterDatabase>');
    L.push('');

    return {
      xml: L.join('\n'),
      stats: {
        totalM: totalM,
        totalSec: totalSec,
        pointCount: N + 1,
        lapCount: lapInfos.length,
        unitLoopM: unitLen,
        loops: totalM / unitLen,
        avgSpeed: vAvg,
        maxSpeed: Math.max.apply(null, lapInfos.map(function (l) { return l.maxSpeed; })),
        hrAvg: Math.round(pts.reduce(function (s2, p) { return s2 + p.hr; }, 0) / (N + 1)),
        hrMax: Math.max.apply(null, pts.map(function (p) { return p.hr; })),
        calories: cfg.calories
      }
    };
  }

  var API = {
    distM: distM, pathLength: pathLength, cleanPath: cleanPath,
    makeUnitLoop: makeUnitLoop, repeatToDistance: repeatToDistance,
    makeVariants: makeVariants, makeRng: makeRng, rand: rand, randInt: randInt,
    rollDistanceKm: rollDistanceKm, rollPaceSec: rollPaceSec, rollCalories: rollCalories,
    generateTCX: generateTCX, isoZ: isoZ, f32: f32, clamp: clamp
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  root.TCXCore = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
