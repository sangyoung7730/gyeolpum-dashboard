// 결품보고 대시보드 — 템플릿만 바뀌었을 때 쓰는 재빌드 (DB 접속 없음)
// 마스터는 tools/master-data.js 를 그대로 재사용합니다.
// 마스터까지 새로 받으려면 gyeolpum-refresh/refresh_master.js 를 돌리세요.
const fs = require('fs');
const path = require('path');

const TOOLS = __dirname;
const WEB = path.dirname(TOOLS);
const LOCAL_OUT = 'C:/Users/dure/Desktop/AI 폴더/claude/결품보고_대시보드.html';

const masterJs = fs.readFileSync(path.join(TOOLS, 'master-data.js'), 'utf8');
const hist = fs.readFileSync(path.join(TOOLS, 'history.json'), 'utf8');
const tpl = fs.readFileSync(path.join(TOOLS, 'tool_template.html'), 'utf8');

// 마스터 품목 수 (master-data.js 안의 JSON에서 직접 셈)
const json = masterJs.slice(masterJs.indexOf('{'), masterJs.lastIndexOf('}') + 1);
const count = Object.keys(JSON.parse(json)).length;

// 기준일자는 기존 산출물에서 그대로 승계 (마스터가 안 바뀌었으므로)
let mdate = null;
try {
  const cur = fs.readFileSync(path.join(WEB, 'index.html'), 'utf8');
  const m = cur.match(/(\d{4}-\d{2}-\d{2}) 기준/);
  if (m) mdate = m[1];
} catch (e) {}
if (!mdate) {
  const t = new Date();
  mdate = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
}

const html = tpl.replace('__MASTER__', () => masterJs).replace('__DATA__', () => hist)
  .replace(/__MCOUNT__/g, count.toLocaleString('ko-KR')).replace(/__MDATE__/g, mdate);

if (/__MASTER__|__DATA__|__MCOUNT__|__MDATE__/.test(html)) {
  console.error('치환되지 않은 자리표시자가 남았습니다. 중단합니다.');
  process.exit(1);
}

const standalone = '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
  + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
  + '<title>축수산팀 결품보고 대시보드</title>\n</head>\n<body style="margin:0">\n' + html + '\n</body>\n</html>\n';

fs.writeFileSync(path.join(WEB, 'index.html'), standalone);
fs.writeFileSync(LOCAL_OUT, standalone);
console.log('재빌드 완료 · 마스터 ' + count.toLocaleString('ko-KR') + '품목 (' + mdate + ' 기준) · ' + (standalone.length / 1048576).toFixed(2) + 'MB');
console.log('  ' + path.join(WEB, 'index.html'));
console.log('  ' + LOCAL_OUT);
