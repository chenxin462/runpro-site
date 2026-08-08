# -*- coding: utf-8 -*-
"""端到端测试：真实浏览器里跑一遍完整流程"""
import os, sys, zipfile, io, re
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
PAGE = os.path.join(ROOT, '跑步TCX数据生成器.html')
DL = os.path.join(ROOT, 'e2e_downloads')
os.makedirs(DL, exist_ok=True)

fails = []
def ck(name, cond, extra=''):
    print(('  [OK] ' if cond else '  [FAIL] ') + name + (('  ' + str(extra)) if extra and not cond else ''))
    if not cond:
        fails.append(name)

# 一条约 1.2km 的开放折线（重庆南滨路附近）
TRACK_JS = """
() => {
  const pts = [];
  const lat0 = 29.5620, lon0 = 106.5730;
  for (let i = 0; i <= 90; i++) {
    const t = i / 90;
    pts.push({
      lat: lat0 + 0.0080 * t + 0.0009 * Math.sin(t * 9),
      lon: lon0 + 0.0110 * t + 0.0013 * Math.cos(t * 7)
    });
  }
  window.postMessage({ type:'MAP_TRACK', source:'map.html', points: pts, km: 1.2, segmentCount: 1 }, '*');
  return pts.length;
}
"""

with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(accept_downloads=True, locale='zh-CN', timezone_id='Asia/Shanghai')
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append('console.' + m.type + ': ' + m.text) if m.type == 'error' else None)

    pg.goto('file:///' + PAGE.replace('\\', '/'))
    pg.wait_for_timeout(600)

    print('\n=== 1. 页面加载 ===')
    ck('标题正确', pg.title() == '跑步 TCX 数据生成器', pg.title())
    ck('无 JS 错误', not errors, errors[:3])
    ck('预计用时已自动计算', '分' in pg.inner_text('#etaEcho'), pg.inner_text('#etaEcho'))
    print('     预计用时显示:', pg.inner_text('#etaEcho'))
    print('     配速回显:', pg.inner_text('#paceEcho'))

    print('\n=== 2. 未选日期时应拦截 ===')
    pg.click('#btnGen')
    pg.wait_for_timeout(300)
    ck('提示先选日期', '日期' in pg.inner_text('#toast'), pg.inner_text('#toast'))

    print('\n=== 3. 批量日期生成（每周一/三/五） ===')
    pg.click('#btnPickDate')
    pg.wait_for_timeout(200)
    pg.click('.tab[data-tab="batch"]')
    pg.click('.dow-btn[data-k="1"]')
    pg.click('.dow-btn[data-k="3"]')
    pg.click('.dow-btn[data-k="5"]')
    pg.fill('#bFrom', '2026-08-01')
    pg.fill('#bTo', '2026-08-31')
    pg.click('#btnPreviewDates')
    pg.wait_for_timeout(200)
    prev = pg.inner_text('#batchPreview')
    m = re.search(r'共 (\d+) 天', prev)
    ck('预览列出日期', m is not None, prev[:80])
    n_batch = int(m.group(1)) if m else 0
    print('     预览:', prev.replace('\n', ' ')[:100])
    # 2026-08 的周一/三/五：手工核对
    import datetime
    expect = [d for d in (datetime.date(2026,8,1) + datetime.timedelta(days=i) for i in range(31))
              if d.weekday() in (0,2,4)]
    ck('批量日期数量正确 (%d)' % len(expect), n_batch == len(expect), '%s vs %s' % (n_batch, len(expect)))
    pg.click('#btnDateConfirm')
    pg.wait_for_timeout(300)
    ck('已选日期回填主页', ('已选 %d 天' % len(expect)) in pg.inner_text('#dateCount'), pg.inner_text('#dateCount'))

    print('\n=== 4. 注入轨迹（模拟地图回传） ===')
    npts = pg.evaluate(TRACK_JS)
    pg.wait_for_timeout(500)
    sub = pg.inner_text('#trackSub')
    ck('轨迹已接收', '点' in sub, sub)
    print('     轨迹状态:', sub)
    info = pg.inner_text('#trackInfo')
    ck('显示变体条数 10', '10' in info)
    ck('显示需绕圈数', '需绕圈数' in info)
    print('     ', ' | '.join(x for x in info.split('\n') if x.strip())[:160])

    print('\n=== 5. 预览首日 XML ===')
    pg.click('#btnPreview')
    pg.wait_for_timeout(800)
    ck('预览弹窗打开', pg.is_visible('#dlgXml'))
    meta = pg.inner_text('#xmlMeta'); stat = pg.inner_text('#xmlStat')
    print('     ', meta)
    print('     ', stat)
    ck('预览含 XML 声明', '<?xml' in pg.inner_text('#xmlView'))
    ck('预览统计含圈数', '圈' in stat, stat)
    pg.click('#dlgXml [data-close]')
    pg.wait_for_timeout(200)

    print('\n=== 6. 多日生成 → ZIP 下载 ===')
    with pg.expect_download(timeout=180000) as dl_info:
        pg.click('#btnGen')
    dl = dl_info.value
    zip_path = os.path.join(DL, dl.suggested_filename)
    dl.save_as(zip_path)
    pg.wait_for_timeout(500)
    print('     下载文件:', dl.suggested_filename, '%.2f MB' % (os.path.getsize(zip_path)/1048576))
    ck('ZIP 文件名格式正确',
       dl.suggested_filename.startswith('跑步数据_') and dl.suggested_filename.endswith('.zip'),
       dl.suggested_filename)

    print('\n=== 7. 校验 ZIP 内容 ===')
    zf = zipfile.ZipFile(zip_path)
    names = zf.namelist()
    ck('ZIP 可正常解压', zf.testzip() is None)
    ck('文件数量 == 日期数 (%d)' % len(expect), len(names) == len(expect), len(names))
    ck('文件名格式正确', all(re.match(r'^跑步_\d{4}-\d{2}-\d{2}_\d+\.\d{2}km\.tcx$', n) for n in names),
       names[:2])
    print('     前3个:', names[:3])

    NS = {'t':'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2',
          'ns3':'http://www.garmin.com/xmlschemas/ActivityExtension/v2'}
    dists, paces, times, cals = [], [], [], []
    lap_ok, sport_ok = True, True
    for n in names:
        root = ET.fromstring(zf.read(n).decode('utf-8'))
        act = root.find('.//t:Activity', NS)
        if act.get('Sport') != 'Running': sport_ok = False
        laps = act.findall('t:Lap', NS)
        td = sum(float(l.find('t:DistanceMeters', NS).text) for l in laps)
        tt = sum(float(l.find('t:TotalTimeSeconds', NS).text) for l in laps)
        tc = sum(int(l.find('t:Calories', NS).text) for l in laps)
        fn_km = float(re.search(r'_(\d+\.\d{2})km', n).group(1))
        if abs(td - fn_km*1000) > 1: lap_ok = False
        dists.append(td/1000); paces.append(tt/(td/1000)); cals.append(tc)
        times.append(act.find('t:Id', NS).text)

    ck('全部 Sport="Running"', sport_ok)
    ck('每个文件距离与文件名一致', lap_ok)
    ck('距离落在 10.21~10.29 区间（基值10.2+尾数0.01~0.09）', all(10.195 <= d <= 10.295 for d in dists),
       '%.3f~%.3f' % (min(dists), max(dists)))
    ck('配速落在 5:00~6:00 (300~360s)', all(299 <= p <= 361 for p in paces),
       '%.1f~%.1f' % (min(paces), max(paces)))
    ck('每天距离不完全相同（独立随机）', len(set(round(d,2) for d in dists)) > 1,
       sorted(set(round(d,2) for d in dists)))
    ck('每天配速不完全相同', len(set(round(p) for p in paces)) > 1)
    # 开跑时间应落在 18:00~19:00 本地 => UTC 10:00~11:00
    hrs = [int(t[11:13]) for t in times]
    mins = [int(t[14:16]) for t in times]
    ck('开跑时间在 18:00~19:00 之间（UTC 10~11 时）',
       all((h == 10) or (h == 11 and mi == 0) for h, mi in zip(hrs, mins)),
       sorted(set(times))[:3])
    ck('卡路里 ≈ 60~63 × 距离', all(60*d-1 <= c <= 63*d+1 for c, d in zip(cals, dists)),
       'cal=%s dist=%.2f' % (cals[0], dists[0]))
    print('     距离范围: %.2f~%.2f km' % (min(dists), max(dists)))
    print('     配速范围: %d:%02d ~ %d:%02d /km' % (min(paces)//60, min(paces)%60, max(paces)//60, max(paces)%60))
    print('     卡路里范围: %d~%d kcal' % (min(cals), max(cals)))
    print('     开跑时刻(UTC): %s ... %s' % (times[0], times[-1]))

    print('\n=== 8. 轨迹变体循环分配 ===')
    # 取第 1 天与第 11 天（应使用同一条变体），第 1 天与第 2 天（应不同）
    if len(names) >= 11:
        def first_pos(n):
            root = ET.fromstring(zf.read(n).decode('utf-8'))
            tp = root.find('.//t:Trackpoint', NS)
            return (tp.find('t:Position/t:LatitudeDegrees', NS).text,
                    tp.find('t:Position/t:LongitudeDegrees', NS).text)
        p1, p2, p11 = first_pos(names[0]), first_pos(names[1]), first_pos(names[10])
        ck('第1天与第2天使用不同变体', p1 != p2, '%s vs %s' % (p1, p2))
        ck('第1天与第11天回到同一变体（循环）', p1 == p11, '%s vs %s' % (p1, p11))

    print('\n=== 9. 单日生成 → 直接下载 .tcx ===')
    pg.click('#btnClearDate')
    pg.wait_for_timeout(200)
    pg.click('#btnPickDate'); pg.wait_for_timeout(200)
    pg.click('.tab[data-tab="cal"]')
    # 点当月第一个可点日期
    pg.click('#calGrid .d[data-d]')
    pg.click('#btnDateConfirm')
    pg.wait_for_timeout(300)
    ck('已选 1 天', '已选 1 天' in pg.inner_text('#dateCount'), pg.inner_text('#dateCount'))
    with pg.expect_download(timeout=60000) as dl2_info:
        pg.click('#btnGen')
    dl2 = dl2_info.value
    tcx_path = os.path.join(DL, dl2.suggested_filename)
    dl2.save_as(tcx_path)
    print('     下载文件:', dl2.suggested_filename, '%.0f KB' % (os.path.getsize(tcx_path)/1024))
    ck('单日直接输出 .tcx', dl2.suggested_filename.endswith('.tcx'), dl2.suggested_filename)
    ck('单日文件名格式', re.match(r'^跑步_\d{4}-\d{2}-\d{2}_\d+\.\d{2}km\.tcx$', dl2.suggested_filename) is not None)
    r2 = ET.parse(tcx_path).getroot()
    ck('单日文件为合法 TCX', r2.find('.//t:Activity', NS) is not None)

    print('\n=== 10. 日历 Shift 区间多选 ===')
    pg.click('#btnClearDate'); pg.wait_for_timeout(150)
    pg.click('#btnPickDate'); pg.wait_for_timeout(200)
    pg.click('.tab[data-tab="cal"]')
    # 第一次点击会触发日历重渲染（renderCal），旧 DOM 元素会失效，
    # 因此点击首个单元格后必须重新 query，再对第 9 个单元格做 Shift 点击
    cells = pg.query_selector_all('#calGrid .d[data-d]')
    anchor_d = cells[4].get_attribute('data-d')
    cells[4].click()
    pg.wait_for_timeout(150)
    cells2 = pg.query_selector_all('#calGrid .d[data-d]')
    cells2[9].click(modifiers=['Shift'])
    pg.wait_for_timeout(200)
    info = pg.inner_text('#dlgDateInfo')
    ck('Shift 选中连续 6 天', '待确认 6 天' in info, info)
    print('     锚点日期:', anchor_d, '| 待确认信息:', info)
    pg.click('#dlgDate [data-close]')

    print('\n=== 11. 地图弹窗可打开 ===')
    pg.click('#btnDrawTrack')
    pg.wait_for_timeout(1200)
    ck('地图弹窗显示', pg.is_visible('#dlgMap'))
    fr = pg.query_selector('#mapFrame')
    ck('iframe 已创建', fr is not None)
    if fr:
        cf = fr.content_frame()
        ck('内联地图页面已加载', cf is not None and cf.query_selector('.float-panel') is not None)
        if cf:
            ck('回传按钮已显示（检测到嵌入环境）',
               cf.query_selector('#useTrackBtn') is not None
               and cf.eval_on_selector('#useTrackBtn', 'e=>getComputedStyle(e).display') != 'none')
    pg.screenshot(path=os.path.join(DL, 'shot_map.png'))
    pg.click('#dlgMap [data-close]')
    pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(DL, 'shot_main.png'), full_page=True)

    ck('全程无 JS 错误', not errors, errors[:5])
    br.close()

print('\n' + ('='*46))
print('✅ 全部 E2E 检查通过' if not fails else '❌ 失败 %d 项: %s' % (len(fails), fails))
sys.exit(0 if not fails else 1)
