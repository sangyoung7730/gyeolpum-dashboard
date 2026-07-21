const fs = require('fs');
const sp = __dirname;
const rows = fs.readFileSync(sp + '/master_dump.tsv', 'utf8').split(/\r?\n/).map(l => l.split('\t'));
// cols: 0생활재코드 1담당자 2대분류 3생산지명 4생활재명 5공급여부
const master = {};
let total = 0, dup = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const no = parseInt(r[0]);
  if (!no || !r[4]) continue;
  total++;
  // 중복 번호: 공급여부 Y 우선
  if (master[no] && master[no][3] === 'Y' && r[5] !== 'Y') { dup++; continue; }
  master[no] = [r[4].trim(), (r[3] || '').trim(), (r[1] || '').trim(), (r[5] || '').trim()];
  // [생활재명, 생산지명, 담당자, 공급여부]
}
const keys = Object.keys(master);
console.log('rows:', total, 'unique:', keys.length, 'dup-skips:', dup);
// 담당자 값 종류 확인
const mgrs = {};
keys.forEach(k => { const m = master[k][2] || '(빈값)'; mgrs[m] = (mgrs[m] || 0) + 1; });
console.log('담당자 종류:', Object.entries(mgrs).sort((a,b)=>b[1]-a[1]).slice(0, 15).map(([k,v])=>k+':'+v).join(', '));
const js = 'window.GYEOLPUM_MASTER = ' + JSON.stringify(master) + ';\n';
fs.writeFileSync(sp + '/master-data.js', js);
console.log('master-data.js size:', (js.length / 1024).toFixed(0), 'KB');
// 샘플 확인
for (const no of [55748, 21492, 42603]) console.log(no, JSON.stringify(master[no]));
