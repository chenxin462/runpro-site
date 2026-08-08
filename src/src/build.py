# -*- coding: utf-8 -*-
"""把 core / app / map.html(base64) 内联，输出单文件 HTML"""
import base64, os, sys

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(SRC, '..', '跑步TCX数据生成器.html'))
MAP = r'C:\Users\Administrator\Desktop\map.html'

def read(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

html = read(os.path.join(SRC, 'index.html'))
core = read(os.path.join(SRC, 'tcx-core.js'))
app  = read(os.path.join(SRC, 'app.js'))

with open(MAP, 'rb') as f:
    map_b64 = base64.b64encode(f.read()).decode('ascii')

# 安全检查：内联脚本中不能出现会提前闭合 <script> 的序列
for name, code in (('tcx-core.js', core), ('app.js', app)):
    if '</script' in code.lower():
        sys.exit('ERROR: %s 含有 </script>，会破坏内联' % name)

map_decl = 'window.__MAP_HTML_B64__ = "%s";' % map_b64

html = html.replace('<script>/*__TCX_CORE__*/</script>',
                    '<script>\n' + core + '\n</script>\n<script>' + map_decl + '</script>')
html = html.replace('<script>/*__APP__*/</script>', '<script>\n' + app + '\n</script>')

assert '__TCX_CORE__' not in html and '__APP__' not in html, '占位符未替换'

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

size = os.path.getsize(OUT)
print('输出: %s' % OUT)
print('大小: %.1f KB  (内联地图 base64 %.1f KB)' % (size / 1024, len(map_b64) / 1024))
