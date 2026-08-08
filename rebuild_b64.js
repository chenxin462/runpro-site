// 把修改后的 _embedded_map.html 重新编码为 base64，替换主 HTML 中的 __MAP_HTML_B64__
const fs = require('fs');

const mapHtml = fs.readFileSync(__dirname + '/_embedded_map.html', 'utf8');
const mainHtmlPath = __dirname + '/跑步TCX数据生成器.html';
let mainHtml = fs.readFileSync(mainHtmlPath, 'utf8');

const b64 = Buffer.from(mapHtml, 'utf8').toString('base64');
console.log('新地图 HTML 长度:', mapHtml.length, '→ base64 长度:', b64.length);

// 按标记切分替换
const startMark = 'window.__MAP_HTML_B64__ = "';
const si = mainHtml.indexOf(startMark);
if (si < 0) { console.error('未找到起始标记'); process.exit(1); }
const qi = mainHtml.indexOf('"', si + startMark.length);   // 结束引号
if (qi < 0) { console.error('未找到结束引号'); process.exit(1); }
const before = mainHtml.slice(0, si);
const after = mainHtml.slice(qi + 1);  // qi 是引号位置，qi+1 跳过
console.log('替换区间:', si, '→', qi, '原始 base64 长度:', qi - si - startMark.length);

mainHtml = before + startMark + b64 + '"' + after;
fs.writeFileSync(mainHtmlPath, mainHtml, 'utf8');
console.log('主 HTML 已更新，新文件大小:', fs.statSync(mainHtmlPath).size, '字节');
