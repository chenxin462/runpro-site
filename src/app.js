/* ============================================================
 * 跑步 TCX 数据生成器 —— 页面交互层
 * ============================================================ */
(function () {
  'use strict';
  var Core = window.TCXCore;

  /* ---------------- 工具 ---------------- */
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  function toast(msg, kind) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.className = 'toast'; }, 2600);
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { var a = s.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  function fmtDur(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h > 0 ? (h + '小时' + pad(m) + '分' + pad(s) + '秒') : (m + '分' + pad(s) + '秒');
  }
  function fmtPace(sec) { return Math.floor(sec / 60) + "'" + pad(Math.round(sec) % 60) + '"'; }
  // 简易字符串哈希，用于按日期派生稳定随机种子
  function hashStr(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  /* ---------------- 状态 ---------------- */
  var state = {
    dates: [],          // 'YYYY-MM-DD'，已排序去重
    rawTrack: null,     // [{lat,lon}]
    variants: null,     // 10 条变体
    trackKm: 0,
    seed: (Math.random() * 1e9) | 0
  };

  /* ---------------- 输入解析 ---------------- */
  function parsePace(str) {
    if (!str) return null;
    var m = String(str).trim().match(/^(\d{1,2})\s*[:：'′]\s*(\d{1,2})$/);
    if (m) {
      var mm = +m[1], ss = +m[2];
      if (ss > 59) return null;
      return mm * 60 + ss;
    }
    // 允许纯数字表示整分钟
    if (/^\d{1,2}$/.test(String(str).trim())) return +str * 60;
    return null;
  }
  function parseDistKm(str) {
    if (str === null || str === undefined) return null;
    var s = String(str).trim();
    if (!/^\d{1,3}(\.\d)?$/.test(s)) return null;
    var v = parseFloat(s);
    if (!(v > 0)) return null;
    return v;
  }
  function parseIntOrNull(str) {
    var s = String(str === null || str === undefined ? '' : str).trim();
    if (s === '') return null;
    if (!/^\d{1,4}$/.test(s)) return NaN;
    return +s;
  }
  function parseTimeHM(str) {
    var m = String(str || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  }

  /* ---------------- 参数收集与校验 ---------------- */
  function readCfg(silent) {
    var errs = [];
    $$('input').forEach(function (i) { i.classList.remove('err'); });

    var dist = parseDistKm($('#inDist').value);
    if (dist === null) { errs.push('距离必须是正数（整数或一位小数，如 10 或 10.2）'); $('#inDist').classList.add('err'); }

    var p1 = parsePace($('#inPaceMin').value), p2 = parsePace($('#inPaceMax').value);
    if (p1 === null) { errs.push('最低配速格式应为 分:秒，如 5:00'); $('#inPaceMin').classList.add('err'); }
    if (p2 === null) { errs.push('最高配速格式应为 分:秒，如 6:00'); $('#inPaceMax').classList.add('err'); }

    var t1 = parseTimeHM($('#inTimeFrom').value), t2 = parseTimeHM($('#inTimeTo').value);
    if (t1 === null || t2 === null) { errs.push('开跑时间范围无效'); }

    var cal = parseIntOrNull($('#inCal').value);
    if (isNaN(cal)) { errs.push('卡路里应为整数'); $('#inCal').classList.add('err'); }
    var hrA = parseIntOrNull($('#inHrAvg').value);
    if (isNaN(hrA)) { errs.push('平均心率应为整数'); $('#inHrAvg').classList.add('err'); }
    var hrM = parseIntOrNull($('#inHrMax').value);
    if (isNaN(hrM)) { errs.push('最大心率应为整数'); $('#inHrMax').classList.add('err'); }
    var cad = parseIntOrNull($('#inCad').value);
    if (isNaN(cad)) { errs.push('步频应为整数'); $('#inCad').classList.add('err'); }

    if (hrA !== null && hrM !== null && !isNaN(hrA) && !isNaN(hrM) && hrM <= hrA) {
      errs.push('最大心率必须大于平均心率');
      $('#inHrMax').classList.add('err');
    }

    if (errs.length) {
      if (!silent) toast(errs[0], 'err');
      return null;
    }
    var lo = Math.min(p1, p2), hi = Math.max(p1, p2);
    return {
      distKm: dist, paceLo: lo, paceHi: hi,
      timeLo: Math.min(t1, t2), timeHi: Math.max(t1, t2),
      calories: cal, hrAvg: hrA, hrMax: hrM, cadAvg: cad
    };
  }

  /* ---------------- 预计用时回显 ---------------- */
  function refreshEcho() {
    var d = parseDistKm($('#inDist').value);
    var p1 = parsePace($('#inPaceMin').value), p2 = parsePace($('#inPaceMax').value);
    if (p1 !== null && p2 !== null) {
      var lo = Math.min(p1, p2), hi = Math.max(p1, p2);
      $('#paceEcho').textContent = fmtPace(lo) + '~' + fmtPace(hi) + '/km';
    } else {
      $('#paceEcho').textContent = '';
    }
    if (d === null || p1 === null || p2 === null) { $('#etaEcho').textContent = '—'; return; }
    var dLo = Math.round(d * 10) / 10 + 0.01, dHi = Math.round(d * 10) / 10 + 0.09;
    var pLo = Math.min(p1, p2), pHi = Math.max(p1, p2);
    $('#etaEcho').textContent = fmtDur(dLo * pLo) + ' ~ ' + fmtDur(dHi * pHi)
      + '   （距离 ' + dLo.toFixed(2) + '~' + dHi.toFixed(2) + ' km）';
    refreshTrackInfo();
  }

  /* ---------------- 日期 chips ---------------- */
  function refreshDates() {
    state.dates = Array.from(new Set(state.dates)).sort();
    var box = $('#dateChips');
    if (!state.dates.length) {
      box.innerHTML = '<span class="empty">还没有选择日期</span>';
      $('#dateCount').textContent = '未选择';
      return;
    }
    $('#dateCount').textContent = '已选 ' + state.dates.length + ' 天';
    box.innerHTML = state.dates.map(function (d) {
      return '<span class="chip"><b>' + d + '</b><i data-del="' + d + '" title="移除">×</i></span>';
    }).join('');
    box.querySelectorAll('i[data-del]').forEach(function (el) {
      el.onclick = function () {
        state.dates = state.dates.filter(function (x) { return x !== el.dataset.del; });
        refreshDates(); refreshTrackInfo();
      };
    });
  }

  /* ---------------- 日历 ---------------- */
  var calCur = new Date();
  calCur.setDate(1);
  var pendingDates = new Set();
  var lastClicked = null;

  function renderCal() {
    $('#calTitle').textContent = calCur.getFullYear() + ' 年 ' + (calCur.getMonth() + 1) + ' 月';
    var g = $('#calGrid');
    var html = ['一', '二', '三', '四', '五', '六', '日'].map(function (d) {
      return '<div class="dow">' + d + '</div>';
    }).join('');
    var first = new Date(calCur.getFullYear(), calCur.getMonth(), 1);
    var offset = (first.getDay() + 6) % 7;           // 周一为第一列
    var daysInMonth = new Date(calCur.getFullYear(), calCur.getMonth() + 1, 0).getDate();
    var todayStr = ymd(new Date());
    for (var i = 0; i < offset; i++) html += '<div class="d out"></div>';
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = calCur.getFullYear() + '-' + pad(calCur.getMonth() + 1) + '-' + pad(d);
      var cls = 'd' + (pendingDates.has(ds) ? ' on' : '') + (ds === todayStr ? ' today' : '');
      html += '<div class="' + cls + '" data-d="' + ds + '">' + d + '</div>';
    }
    g.innerHTML = html;
    g.querySelectorAll('.d[data-d]').forEach(function (el) {
      el.onclick = function (ev) {
        var ds = el.dataset.d;
        if (ev.shiftKey && lastClicked) {
          var a = parseYmd(lastClicked), b = parseYmd(ds);
          if (a > b) { var t = a; a = b; b = t; }
          for (var c = new Date(a); c <= b; c.setDate(c.getDate() + 1)) pendingDates.add(ymd(c));
        } else {
          if (pendingDates.has(ds)) pendingDates.delete(ds); else pendingDates.add(ds);
          lastClicked = ds;
        }
        renderCal(); updateDlgInfo();
      };
    });
  }
  function updateDlgInfo() {
    $('#dlgDateInfo').textContent = '待确认 ' + pendingDates.size + ' 天';
  }

  /* ---------------- 批量生成 ---------------- */
  var DOWS = [
    { k: 1, n: '周一' }, { k: 2, n: '周二' }, { k: 3, n: '周三' }, { k: 4, n: '周四' },
    { k: 5, n: '周五' }, { k: 6, n: '周六' }, { k: 0, n: '周日' }
  ];
  var pickedDows = new Set();
  function renderDows() {
    $('#dowBox').innerHTML = DOWS.map(function (d) {
      return '<button class="dow-btn' + (pickedDows.has(d.k) ? ' on' : '') + '" data-k="' + d.k + '">' + d.n + '</button>';
    }).join('');
    $('#dowBox').querySelectorAll('.dow-btn').forEach(function (b) {
      b.onclick = function () {
        var k = +b.dataset.k;
        if (pickedDows.has(k)) pickedDows.delete(k); else pickedDows.add(k);
        renderDows();
      };
    });
  }
  function calcBatchDates() {
    var f = $('#bFrom').value, t = $('#bTo').value;
    if (!f || !t) { toast('请先选择起止日期', 'err'); return null; }
    var a = parseYmd(f), b = parseYmd(t);
    if (a > b) { toast('起始日期不能晚于结束日期', 'err'); return null; }
    if (!pickedDows.size) { toast('请至少选择一个星期', 'err'); return null; }
    var out = [];
    for (var c = new Date(a); c <= b; c.setDate(c.getDate() + 1)) {
      if (pickedDows.has(c.getDay())) out.push(ymd(c));
    }
    return out;
  }

  /* ---------------- 地图集成 ---------------- */
  var mapLoaded = false;
  function openMap() {
    $('#dlgMap').classList.add('show');
    if (!mapLoaded) {
      var host = $('#mapHost');
      host.innerHTML = '<iframe id="mapFrame" allow="geolocation"></iframe>';
      var bin = atob(window.__MAP_HTML_B64__);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var html = new TextDecoder('utf-8').decode(bytes);
      $('#mapFrame').srcdoc = html;
      mapLoaded = true;
    }
  }
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.type !== 'MAP_TRACK') return;
    var pts = (d.points || []).map(function (p) {
      return { lat: +p.lat, lon: +(p.lon !== undefined ? p.lon : p.lng) };
    });
    var cleaned = Core.cleanPath(pts);
    if (cleaned.length < 2) { toast('回传的轨迹点不足', 'err'); return; }
    state.rawTrack = cleaned;
    state.variants = Core.makeVariants(cleaned, 10, state.seed);
    state.trackKm = Core.pathLength(cleaned) / 1000;
    $('#dlgMap').classList.remove('show');
    refreshTrackInfo();
    toast('已接收轨迹 ' + cleaned.length + ' 点，已派生 10 条变体', 'ok');
  });

  function refreshTrackInfo() {
    var box = $('#trackInfo');
    if (!state.rawTrack) {
      box.innerHTML = '';
      $('#trackSub').textContent = '未绘制';
      return;
    }
    var unit = Core.makeUnitLoop(state.rawTrack);
    var unitKm = Core.pathLength(unit) / 1000;
    var closed = Core.distM(state.rawTrack[0], state.rawTrack[state.rawTrack.length - 1]) < 40;
    var dist = parseDistKm($('#inDist').value);
    var loops = dist ? (dist / unitKm) : 0;
    $('#trackSub').textContent = state.rawTrack.length + ' 点 · ' + state.trackKm.toFixed(2) + ' km';

    var html = '<div class="track-stat">'
      + it('轨迹点数', state.rawTrack.length, '点')
      + it('绘制长度', state.trackKm.toFixed(2), 'km')
      + it('单圈长度', unitKm.toFixed(2), 'km' + (closed ? '（闭环）' : '（折返）'))
      + it('变体条数', state.variants ? state.variants.length : 0, '条')
      + (loops ? it('需绕圈数', loops.toFixed(1), '圈') : '')
      + '</div>';
    if (loops > 15) {
      html += '<div class="note">当前路线单圈仅 ' + unitKm.toFixed(2) + ' km，跑满 ' + dist
        + ' km 需绕 <b>' + loops.toFixed(1) + '</b> 圈，轨迹会大量重叠。建议在地图上画一条更长的路线。</div>';
    } else if (!closed) {
      html += '<div class="note info">路线首尾未闭合，系统会自动按「去程 + 原路返回」的方式铺满目标距离。</div>';
    }
    box.innerHTML = html;
    function it(k, v, u) {
      return '<div class="it"><div class="k">' + k + '</div><div class="v">' + v + '<small>' + (u || '') + '</small></div></div>';
    }
  }

  /* ---------------- 单日参数掷点 ---------------- */
  function rollDay(cfg, dateStr, index) {
    var rng = Core.makeRng((hashStr(dateStr) ^ state.seed) >>> 0);
    var distKm = Core.rollDistanceKm(cfg.distKm, rng);
    var paceSec = Core.rollPaceSec(cfg.paceLo, cfg.paceHi, rng);
    var cal = Core.rollCalories({ calories: cfg.calories }, distKm, rng);
    // 开跑时刻
    var lo = cfg.timeLo * 60, hi = cfg.timeHi * 60;
    var sec = lo === hi ? lo : Core.randInt(rng, lo, hi);
    var day = parseYmd(dateStr);
    var start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
    start.setSeconds(sec);
    // 心率/步频轻微逐日抖动
    var hrAvg = cfg.hrAvg === null ? null : cfg.hrAvg + Core.randInt(rng, -1, 1);
    var hrMax = cfg.hrMax === null ? null : cfg.hrMax + Core.randInt(rng, -1, 1);
    if (hrAvg !== null && hrMax !== null && hrMax <= hrAvg) hrMax = hrAvg + 6;
    var cad = cfg.cadAvg === null ? null : cfg.cadAvg + Core.randInt(rng, -1, 1);

    var path = state.variants[index % state.variants.length];
    return {
      dateStr: dateStr,
      startLocalMs: start.getTime(),
      distKm: distKm, paceSec: paceSec, calories: cal,
      hrAvg: hrAvg, hrMax: hrMax, cadAvg: cad,
      path: path,
      seed: (hashStr(dateStr + '#tcx') ^ state.seed) >>> 0
    };
  }

  function fileNameFor(day) {
    return '跑步_' + day.dateStr + '_' + day.distKm.toFixed(2) + 'km.tcx';
  }

  function ensureReady() {
    if (!state.dates.length) { toast('请先选择跑步日期', 'err'); return null; }
    if (!state.rawTrack || !state.variants) { toast('请先绘制轨迹', 'err'); return null; }
    var cfg = readCfg();
    if (!cfg) return null;
    return cfg;
  }

  /* ---------------- 下载 ---------------- */
  function download(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ---------------- ZIP 打包（零依赖） ---------------- */
  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var i = 0; i < 256; i++) {
      var c = i;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c >>> 0;
    }
    return t;
  })();
  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function deflateRaw(u8) {
    if (typeof CompressionStream === 'undefined') return Promise.resolve(null);
    try {
      var cs = new CompressionStream('deflate-raw');
      var stream = new Blob([u8]).stream().pipeThrough(cs);
      return new Response(stream).arrayBuffer().then(function (b) { return new Uint8Array(b); })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  function dosDateTime(d) {
    return {
      time: ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31),
      date: (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31)
    };
  }
  function W() {
    this.parts = []; this.len = 0;
  }
  W.prototype.u8 = function (arr) { this.parts.push(arr); this.len += arr.length; return this; };
  W.prototype.n = function (v, bytes) {
    var a = new Uint8Array(bytes);
    for (var i = 0; i < bytes; i++) a[i] = (v >>> (i * 8)) & 0xFF;
    return this.u8(a);
  };
  // files: [{name, data:Uint8Array}]
  function makeZip(files) {
    var enc = new TextEncoder();
    var jobs = files.map(function (f) {
      return deflateRaw(f.data).then(function (def) {
        var useDef = def && def.length < f.data.length;
        return {
          nameBytes: enc.encode(f.name),
          crc: crc32(f.data),
          usize: f.data.length,
          body: useDef ? def : f.data,
          method: useDef ? 8 : 0,
          mtime: f.mtime || new Date()
        };
      });
    });
    return Promise.all(jobs).then(function (entries) {
      var out = new W();
      var central = [];
      entries.forEach(function (e) {
        var offset = out.len;
        var dt = dosDateTime(e.mtime);
        out.n(0x04034b50, 4).n(20, 2).n(0x0800, 2).n(e.method, 2)
          .n(dt.time, 2).n(dt.date, 2)
          .n(e.crc, 4).n(e.body.length, 4).n(e.usize, 4)
          .n(e.nameBytes.length, 2).n(0, 2)
          .u8(e.nameBytes).u8(e.body);
        central.push({ e: e, offset: offset, dt: dt });
      });
      var cdStart = out.len;
      central.forEach(function (c) {
        out.n(0x02014b50, 4).n(20, 2).n(20, 2).n(0x0800, 2).n(c.e.method, 2)
          .n(c.dt.time, 2).n(c.dt.date, 2)
          .n(c.e.crc, 4).n(c.e.body.length, 4).n(c.e.usize, 4)
          .n(c.e.nameBytes.length, 2).n(0, 2).n(0, 2)
          .n(0, 2).n(0, 2).n(0, 4).n(c.offset, 4)
          .u8(c.e.nameBytes);
      });
      var cdSize = out.len - cdStart;
      out.n(0x06054b50, 4).n(0, 2).n(0, 2)
        .n(entries.length, 2).n(entries.length, 2)
        .n(cdSize, 4).n(cdStart, 4).n(0, 2);
      return new Blob(out.parts, { type: 'application/zip' });
    });
  }

  /* ---------------- 生成主流程 ---------------- */
  var busy = false;
  function setProgress(p, msg) {
    $('#prog').classList.add('show');
    $('#progBar').style.width = (p * 100).toFixed(1) + '%';
    var m = $('#genMsg');
    m.classList.add('show');
    m.textContent = msg;
  }
  function clearProgress(delay) {
    setTimeout(function () {
      $('#prog').classList.remove('show');
      $('#progBar').style.width = '0';
      $('#genMsg').classList.remove('show');
    }, delay || 2500);
  }
  function nextFrame() {
    return new Promise(function (r) { requestAnimationFrame(function () { setTimeout(r, 0); }); });
  }

  async function doGenerate() {
    if (busy) return;
    var cfg = ensureReady();
    if (!cfg) return;
    busy = true;
    $('#btnGen').disabled = true;
    var enc = new TextEncoder();
    var dates = state.dates.slice();
    var files = [];
    var totalBytes = 0;
    try {
      for (var i = 0; i < dates.length; i++) {
        var day = rollDay(cfg, dates[i], i);
        var r = Core.generateTCX(day);
        var name = fileNameFor(day);
        var bytes = enc.encode(r.xml);
        totalBytes += bytes.length;
        files.push({ name: name, data: bytes, mtime: new Date(day.startLocalMs) });
        setProgress((i + 1) / dates.length * (dates.length > 1 ? 0.85 : 1),
          '正在生成 ' + (i + 1) + '/' + dates.length + '：' + dates[i]
          + '（' + day.distKm.toFixed(2) + ' km，配速 ' + fmtPace(day.paceSec) + '，' + r.stats.lapCount + ' 圈）');
        if (i % 2 === 1) await nextFrame();
      }

      if (files.length === 1) {
        download(new Blob([files[0].data], { type: 'application/vnd.garmin.tcx+xml' }), files[0].name);
        setProgress(1, '已生成：' + files[0].name + '（' + (totalBytes / 1024).toFixed(0) + ' KB）');
        toast('已下载 ' + files[0].name, 'ok');
      } else {
        setProgress(0.9, '正在打包 ' + files.length + ' 个文件...');
        await nextFrame();
        var zip = await makeZip(files);
        var zipName = '跑步数据_' + dates[0] + '至' + dates[dates.length - 1] + '.zip';
        download(zip, zipName);
        setProgress(1, '已生成 ' + files.length + ' 个 TCX，打包为 ' + zipName
          + '（原始 ' + (totalBytes / 1048576).toFixed(1) + ' MB → 压缩后 ' + (zip.size / 1048576).toFixed(1) + ' MB）');
        toast('已下载 ' + zipName, 'ok');
      }
    } catch (e) {
      toast('生成失败：' + e.message, 'err');
      setProgress(0, '生成失败：' + e.message);
    } finally {
      busy = false;
      $('#btnGen').disabled = false;
      clearProgress(6000);
    }
  }

  /* ---------------- 预览 ---------------- */
  var previewCache = null;
  function doPreview() {
    var cfg = ensureReady();
    if (!cfg) return;
    var day = rollDay(cfg, state.dates[0], 0);
    var r;
    try { r = Core.generateTCX(day); }
    catch (e) { toast('生成失败：' + e.message, 'err'); return; }
    previewCache = { day: day, xml: r.xml };
    var s = r.stats;
    $('#xmlMeta').textContent = state.dates[0] + '　' + day.distKm.toFixed(2) + ' km　配速 '
      + fmtPace(day.paceSec) + '/km　用时 ' + fmtDur(s.totalSec);
    $('#xmlStat').textContent = s.lapCount + ' 圈 · ' + s.pointCount + ' 个采样点 · 均速 '
      + s.avgSpeed.toFixed(3) + ' m/s · 心率 ' + s.hrAvg + '/' + s.hrMax
      + ' bpm · ' + s.calories + ' kcal · ' + (r.xml.length / 1024).toFixed(0) + ' KB';
    // 超长文本只渲染头尾，避免浏览器卡顿
    var lines = r.xml.split('\n');
    var view = lines.length > 1200
      ? lines.slice(0, 600).join('\n')
      + '\n\n... 中间省略 ' + (lines.length - 900) + ' 行（共 ' + lines.length + ' 行），点「复制全文」可获取完整内容 ...\n\n'
      + lines.slice(-300).join('\n')
      : r.xml;
    $('#xmlView').textContent = view;
    $('#dlgXml').classList.add('show');
  }

  /* ---------------- 事件绑定 ---------------- */
  function bind() {
    // 关闭弹窗
    $$('[data-close]').forEach(function (el) {
      el.onclick = function () { el.closest('.mask').classList.remove('show'); };
    });
    $$('.mask').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('show'); });
    });

    // 日期弹窗
    $('#btnPickDate').onclick = function () {
      pendingDates = new Set(state.dates);
      lastClicked = null;
      renderCal(); updateDlgInfo();
      $('#dlgDate').classList.add('show');
    };
    $('#btnClearDate').onclick = function () {
      state.dates = []; refreshDates(); refreshTrackInfo(); toast('已清空日期');
    };
    $('#calPrev').onclick = function () { calCur.setMonth(calCur.getMonth() - 1); renderCal(); };
    $('#calNext').onclick = function () { calCur.setMonth(calCur.getMonth() + 1); renderCal(); };
    $$('.tab').forEach(function (t) {
      t.onclick = function () {
        $$('.tab').forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        var isCal = t.dataset.tab === 'cal';
        $('#tabCal').style.display = isCal ? '' : 'none';
        $('#tabBatch').style.display = isCal ? 'none' : '';
      };
    });
    $$('[data-quick]').forEach(function (b) {
      b.onclick = function () {
        var n = +b.dataset.quick;
        var to = new Date(), from = new Date();
        from.setDate(from.getDate() - (n - 1));
        $('#bFrom').value = ymd(from);
        $('#bTo').value = ymd(to);
        toast('已设为最近 ' + n + ' 天');
      };
    });
    $('#btnPreviewDates').onclick = function () {
      var list = calcBatchDates();
      if (!list) return;
      var box = $('#batchPreview');
      if (!list.length) { box.textContent = '该区间内没有符合条件的日期'; return; }
      box.innerHTML = '<b style="color:var(--brand)">共 ' + list.length + ' 天</b><br>' + list.join('　');
      box._list = list;
    };
    $('#btnDateConfirm').onclick = function () {
      var isBatch = $('.tab[data-tab="batch"]').classList.contains('on');
      if (isBatch) {
        var list = $('#batchPreview')._list;
        if (!list || !list.length) {
          list = calcBatchDates();
          if (!list) return;
          if (!list.length) { toast('没有符合条件的日期', 'err'); return; }
        }
        list.forEach(function (d) { pendingDates.add(d); });
      }
      state.dates = Array.from(pendingDates);
      refreshDates(); refreshTrackInfo();
      $('#dlgDate').classList.remove('show');
      toast('已选择 ' + state.dates.length + ' 天', 'ok');
    };

    // 参数
    ['#inDist', '#inPaceMin', '#inPaceMax'].forEach(function (s) {
      $(s).addEventListener('input', refreshEcho);
    });
    $('#btnTimeNow').onclick = function () {
      var now = new Date();
      var a = new Date(now.getTime() - 15 * 60000), b = new Date(now.getTime() + 15 * 60000);
      $('#inTimeFrom').value = pad(a.getHours()) + ':' + pad(a.getMinutes());
      $('#inTimeTo').value = pad(b.getHours()) + ':' + pad(b.getMinutes());
      toast('已设为当前时刻 ±15 分钟');
    };

    // 轨迹
    $('#btnDrawTrack').onclick = openMap;
    $('#btnClearTrack').onclick = function () {
      state.rawTrack = null; state.variants = null; state.trackKm = 0;
      refreshTrackInfo(); toast('已清除轨迹');
    };

    // 生成
    $('#btnGen').onclick = doGenerate;
    $('#btnPreview').onclick = doPreview;
    $('#btnReroll').onclick = function () {
      state.seed = (Math.random() * 1e9) | 0;
      if (state.rawTrack) state.variants = Core.makeVariants(state.rawTrack, 10, state.seed);
      toast('已重新掷随机种子', 'ok');
    };
    $('#btnCopyXml').onclick = function () {
      if (!previewCache) return;
      navigator.clipboard.writeText(previewCache.xml).then(
        function () { toast('已复制完整 XML', 'ok'); },
        function () { toast('复制失败，请手动选择', 'err'); }
      );
    };
    $('#btnDlOne').onclick = function () {
      if (!previewCache) return;
      download(new Blob([previewCache.xml], { type: 'application/vnd.garmin.tcx+xml' }),
        fileNameFor(previewCache.day));
      toast('已下载 ' + fileNameFor(previewCache.day), 'ok');
    };
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    var today = new Date(), ago = new Date();
    ago.setDate(ago.getDate() - 29);
    $('#bFrom').value = ymd(ago);
    $('#bTo').value = ymd(today);
    renderDows();
    bind();
    refreshDates();
    refreshEcho();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
