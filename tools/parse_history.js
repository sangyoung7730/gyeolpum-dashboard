const fs = require('fs');
const sp = __dirname + '/d';

const files = fs.readdirSync(sp).filter(f => /주/.test(f) && f.endsWith('.tsv'));
const entries = [];

function serialToDate(n) {
  // Excel serial (1900 system): 45658 = 2026-01-01
  const ms = (n - 25569) * 86400000;
  const d = new Date(ms);
  return d.toISOString().slice(0, 10);
}
function textToDate(s) {
  const m = String(s).match(/^(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  return `2026-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
}
const WEEK1_MON = new Date('2025-12-29T00:00:00Z');
function weekOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return Math.floor((d - WEEK1_MON) / 604800000) + 1;
}
function mondayOfWeek(w) {
  const d = new Date(WEEK1_MON.getTime() + (w - 1) * 604800000);
  return d.toISOString().slice(0, 10);
}

function classify(reason) {
  const r = String(reason || '');
  if (!r.trim()) return '미기재';
  if (/발주/.test(r)) return '발주관리';
  if (/재고관리|재고 관리|재고부족|재고 부족|스탑재고|전산재고|실재고/.test(r)) return '재고관리';
  if (/입수|입고수량|입고 수량|박스 입수/.test(r)) return '입고·입수 부족';
  if (/생산|산지|시즌|어획|작황|수급|미입고/.test(r)) return '생산·산지';
  if (/설비|피킹|미출고|물류|파손|배송/.test(r)) return '설비·물류';
  if (/품질|신선도/.test(r)) return '품질';
  if (/한정수량|오설정|표기오류|설정|주문취소|취소/.test(r)) return '설정·운영';
  return '기타';
}

for (const f of files) {
  const wm = f.match(/(\d+)주/);
  const sheetWeek = wm ? parseInt(wm[1]) : null;
  const rows = fs.readFileSync(sp + '/' + f, 'utf8').split(/\r?\n/).map(l => l.split('\t'));
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i];
    const no = parseInt(r[2]);
    const name = (r[3] || '').trim();
    if (!no || !name) continue;
    const orderQty = parseFloat(r[4]) || 0;
    const shortQty = parseFloat(r[8]) || 0;
    if (!shortQty && !orderQty) continue;
    let date = null;
    const raw = (r[0] || '').trim();
    if (/^\d{5}$/.test(raw)) date = serialToDate(parseInt(raw));
    else if (raw) date = textToDate(raw);
    if (!date && sheetWeek) date = mondayOfWeek(sheetWeek);
    if (!date) continue;
    const week = weekOf(date);
    const reason = (r[10] || '').trim();
    entries.push({
      date, week,
      mgr: (r[1] || '').trim() || '미기재',
      no, name,
      orderQty, shortQty,
      type: classify(reason),
      reason,
      eta: (r[11] || '').trim(),
      action: (r[13] || '').trim(),
      origin: (r[16] || '').trim(),
    });
  }
}
entries.sort((a, b) => a.date.localeCompare(b.date) || a.no - b.no);
fs.writeFileSync(__dirname + '/history.json', JSON.stringify(entries));
console.log('entries:', entries.length);
const byWeek = {};
entries.forEach(e => byWeek[e.week] = (byWeek[e.week] || 0) + 1);
console.log('weeks:', JSON.stringify(byWeek));
const byType = {};
entries.forEach(e => byType[e.type] = (byType[e.type] || 0) + 1);
console.log('types:', JSON.stringify(byType));
