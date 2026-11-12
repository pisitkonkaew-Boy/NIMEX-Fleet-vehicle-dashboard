/* NIMEX Fleet Vehicle — แชร์/ส่งออกแบบเลือกหัวข้อ + อินโฟกราฟิก 16:9 (สกิล nimex-export-infographic-169)
   ใช้ข้อมูลตามตัวกรองบนหน้า (DC / ชนิดรถ / ทะเบียน / สถานะ / วันที่) + ช่วงเวลาและภาคที่เลือกในหน้าต่างนี้
   ไม่เปลี่ยนสูตรเดิม: % = จำนวนเที่ยวสถานะนั้น ÷ เที่ยวทั้งหมด × 100, ระยะทางรวม = ผลรวมระยะทาง (ปัดเศษ) */
(function () {
'use strict';
/* ---------- ค่าคงที่ ---------- */
var DC_REGION = {"150  DC เชียงใหม่": "เหนือบน", "151  DC ลำพูน": "เหนือบน", "152  DC ลำปาง": "เหนือบน", "153  DC อุตรดิตถ์": "เหนือกลาง", "154  DC แพร่": "เหนือกลาง", "155  DC น่าน": "เหนือกลาง", "156  DC พะเยา": "เหนือบน", "157  DC เชียงราย": "เหนือบน", "158  DC แม่ฮ่องสอน": "เหนือบน", "159  DC ฝาง": "เหนือบน", "160  DC นครสวรรค์": "เหนือล่าง", "162  DC กำแพงเพชร": "เหนือล่าง", "163  DC ตาก": "เหนือล่าง", "164  DC สุโขทัย": "เหนือกลาง", "165  DC พิษณุโลก": "เหนือกลาง", "166  DC พิจิตร": "เหนือล่าง", "167  DC เพชรบูรณ์": "เหนือกลาง", "168  DC วิเชียรบุรี": "เหนือกลาง", "170  DC ชัยนาท": "เหนือล่าง", "171  DC แม่สาย": "เหนือบน", "230  DC โคราช": "อีสานล่าง", "231  DC บุรีรัมย์": "อีสานล่าง", "232  DC สุรินทร์": "อีสานล่าง", "233  DC ศรีสะเกษ": "อีสานล่าง", "234  DC อุบลราชธานี": "อีสานล่าง", "235  DC ยโสธร": "อีสานกลาง", "236  DC ชัยภูมิ": "อีสานกลาง", "237  DC อำนาจเจริญ": "อีสานล่าง", "240  DC ขอนแก่น": "อีสานกลาง", "241  DC อุดรธานี": "อีสานบน", "242  DC เลย": "อีสานบน", "243  DC หนองคาย": "อีสานบน", "244  DC มหาสารคาม": "อีสานกลาง", "245  DC ร้อยเอ็ด": "อีสานกลาง", "246  DC กาฬสินธุ์": "อีสานกลาง", "247  DC สกลนคร": "อีสานบน", "248  DC นครพนม": "อีสานบน", "249  DC มุกดาหาร": "อีสานกลาง", "250  DC พล": "อีสานกลาง", "251  DC ปากช่อง": "อีสานล่าง", "252  DC กันทรลักษ์": "อีสานล่าง", "320  DC ชลบุรี": "ตะวันออก", "321  DC ระยอง": "ตะวันออก", "322  DC จันทบุรี": "ตะวันออก", "323  DC พัทยา": "ตะวันออก", "325  DC ปราจีนบุรี": "ตะวันออก", "328  DC อรัญประเทศ": "ตะวันออก", "476  DC ชะอำ": "ตะวันตก", "477  DC ประจวบคีรีขันธ์": "ใต้บน", "480  DC ทุ่งสง": "ใต้ล่าง", "481  DC นครศรีธรรมราช": "ใต้ล่าง", "482  DC พังงา": "ใต้บน", "483  DC ภูเก็ต": "ใต้บน", "484  DC สุราษฎร์": "ใต้บน", "486  DC ชุมพร": "ใต้บน", "487  DC กระบี่": "ใต้บน", "490  DC หาดใหญ่": "ใต้ล่าง", "493  DC พัทลุง": "ใต้ล่าง", "610  DC พุทธมณฑลสาย 3": "BKK", "615  DC ลพบุรี": "กลาง", "618  DC สระบุรี": "กลาง", "621  DC รังสิต": "BKK", "624  DC ฉะเชิงเทรา": "ตะวันออก", "631  DC อยุธยา": "กลาง", "670  DC ราชบุรี": "ตะวันตก", "671  DC กาญจนบุรี": "ตะวันตก", "672  DC สุพรรณบุรี": "กลาง", "673  DC นครปฐม": "ตะวันตก", "674  DC สมุทรสาคร": "ตะวันตก", "680  DC สุวรรณภูมิ": "BKK", "690  DC พระราม 9": "BKK", "691  CDC บางนา": "BKK", "801  DC คลังลำพูน": "เหนือบน"};
var REGIONS = ['BKK','กลาง','ตะวันออก','ตะวันตก','เหนือบน','เหนือกลาง','เหนือล่าง','อีสานบน','อีสานกลาง','อีสานล่าง','ใต้บน','ใต้ล่าง','อื่นๆ'];
var KPIS = [
  { id: 'trips',  l: 'จำนวนเที่ยว',          u: 'เที่ยว', pct: false, dir: 0 },
  { id: 'dist',   l: 'ระยะทางรวม',          u: 'กม.',   pct: false, dir: 0 },
  { id: 'normal', l: '% เที่ยววิ่งปกติ',       u: '%',     pct: true,  dir: 1 },
  { id: 'abn',    l: '% เที่ยววิ่งผิดปกติ',     u: '%',     pct: true,  dir: -1 },
  { id: 'risk',   l: '% เที่ยววิ่งมีความเสี่ยง', u: '%',     pct: true,  dir: -1 },
  { id: 'cross',  l: '% รับรถข้ามวัน',        u: '%',     pct: true,  dir: -1 }
];
var KBY = {}; KPIS.forEach(function (k) { KBY[k.id] = k; });
var DEF = { grade: { A: 70, B: 60, C: 50, D: 40 }, kpis: ['trips','dist','normal','abn','risk','cross'], minTrips: 20 };
var GC = { A: '#123f8c', B: '#6e93d6', C: '#d4a72c', D: '#d9822b', F: '#b8334a' };
var GE = { A: '🔵', B: '🟦', C: '🟡', D: '🟠', F: '🔴' }, MD = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
var GOOD = '#1a9e5f', BAD = '#b8334a';           /* ผลต่าง: ดี = เขียว แย่ = แดง (ตามสกิล) */
var SECS = [['kpi','KPI หลัก'],['region','ผลรายภาค'],['dc','DC ที่ % เที่ยวปกติต่ำสุด 10 อันดับ'],['group','ชนิดรถ × ประเภทการปล่อยรถ']]
  .concat(KPIS.filter(function (k) { return k.pct; }).map(function (k) { return ['bw_' + k.id, 'ดีสุด/แย่สุด · ' + k.l]; }));
var picked = { kpi: 1, region: 1, dc: 1, group: 1 };
var ui = { mode: 'month', region: '' };
var MON = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
var WD = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'];

/* ---------- เครื่องมือเล็ก ---------- */
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function nf(v) { return Number.isFinite(v) ? Math.round(v).toLocaleString('th-TH') : '–'; }
function p1(v) { return Number.isFinite(v) ? v.toFixed(1) + '%' : '–'; }
function fmtK(id, v) { return KBY[id].pct ? p1(v) : nf(v); }
function cfg() { var s = window.FV_SETTINGS || {}; return { grade: s.grade || DEF.grade, kpis: (s.kpis && s.kpis.length) ? s.kpis : DEF.kpis, minTrips: s.minTrips || DEF.minTrips }; }
function regionOf(dc) { return DC_REGION[dc] || 'อื่นๆ'; }
function shortDC(dc) { return String(dc).replace(/^\d+\s+/, ''); }
function grade(v) { var g = cfg().grade; return !Number.isFinite(v) ? '' : v >= g.A ? 'A' : v >= g.B ? 'B' : v >= g.C ? 'C' : v >= g.D ? 'D' : 'F'; }
function isAdmin() { return !!window.FV_ADMIN; }
function iso(d) { return d.toISOString().slice(0, 10); }
function dt(s) { return new Date(s + 'T00:00:00Z'); }
function thDate(s) { var d = dt(s); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()] + ' ' + (d.getUTCFullYear() + 543 - 2500); }

/* ---------- สถิติ (สูตรเดียวกับหน้าแดชบอร์ด) ---------- */
function stats(rows) {
  var n = rows.length, dist = 0, nor = 0, abn = 0, risk = 0, cross = 0, pl = {};
  rows.forEach(function (r) {
    dist += r.distance || 0;
    if (r.tripStatus === 'เที่ยววิ่งปกติ') nor++; else if (r.tripStatus === 'เที่ยววิ่งผิดปกติ') abn++; else if (r.tripStatus === 'เที่ยววิ่งมีความเสี่ยง') risk++;
    if (r.dayStatus === 'รับรถข้ามวัน') cross++;
    pl[r.plate] = 1;
  });
  var pc = function (c) { return n ? c / n * 100 : NaN; };
  return { trips: n, dist: Math.round(dist), normal: pc(nor), abn: pc(abn), risk: pc(risk), cross: pc(cross), cars: Object.keys(pl).length };
}

/* ---------- ช่วงเวลา: ช่วงนี้ vs ช่วงก่อนหน้า (วันทำงาน = วันที่มีเที่ยววิ่ง) ---------- */
function baseRows() {   /* ตัวกรองบนหน้า ยกเว้นวันที่ (วันที่ใช้กำหนดช่วงแทน) */
  var v = function (id) { var e = $(id); return e ? e.value : ''; };
  var dc = v('filterDC'), veh = v('filterVehicle'), plt = v('filterPlate'), st = v('filterTripStatus');
  return (window.allData || allData).filter(function (r) { return (!dc || r.dc === dc) && (!veh || r.vehicleType === veh) && (!plt || r.plate === plt) && (!st || r.tripStatus === st); });
}
function periods() {
  var rows = baseRows(), set = {};
  rows.forEach(function (r) { if (r.departDate) set[r.departDate] = 1; });
  var days = Object.keys(set).sort(), fixed = ($('filterDate') || {}).value || '';
  var mode = fixed ? 'day' : ui.mode, end = fixed || days[days.length - 1];
  if (!end) return { mode: mode, cur: [], prev: [], rows: rows, curLabel: 'ไม่มีข้อมูล', prevLabel: '' };
  var e = dt(end), cur = [], prev = [], curLabel, prevLabel;
  if (mode === 'day') {
    cur = [end]; var p = new Date(e); p.setUTCDate(p.getUTCDate() - 7); var ps = iso(p);
    if (set[ps]) prev = [ps];
    curLabel = WD[e.getUTCDay()] + ' ' + thDate(end); prevLabel = prev.length ? WD[p.getUTCDay()] + ' ' + thDate(ps) : '';
  } else if (mode === 'week') {
    var mon = new Date(e); mon.setUTCDate(mon.getUTCDate() - ((mon.getUTCDay() + 6) % 7));
    var pmon = new Date(mon); pmon.setUTCDate(pmon.getUTCDate() - 7);
    days.forEach(function (d) { var x = dt(d); if (x >= mon && x <= e) cur.push(d); });
    var wds = {}; cur.forEach(function (d) { wds[dt(d).getUTCDay()] = 1; });
    days.forEach(function (d) { var x = dt(d); if (x >= pmon && x < mon && wds[x.getUTCDay()]) prev.push(d); });
    curLabel = 'สัปดาห์ ' + thDate(cur[0]) + ' – ' + thDate(cur[cur.length - 1]);
    prevLabel = prev.length ? 'สัปดาห์ ' + thDate(prev[0]) + ' – ' + thDate(prev[prev.length - 1]) : '';
  } else {
    var ym = end.slice(0, 7), y = +ym.slice(0, 4), m = +ym.slice(5, 7), pym = m === 1 ? (y - 1) + '-12' : y + '-' + String(m - 1).padStart(2, '0');
    cur = days.filter(function (d) { return d.slice(0, 7) === ym; });
    prev = days.filter(function (d) { return d.slice(0, 7) === pym; }).slice(0, cur.length);
    curLabel = MON[m - 1] + ' ' + (y + 543) + ' (' + cur.length + ' วันทำงาน)';
    prevLabel = prev.length ? MON[(m + 10) % 12] + ' ' + (m === 1 ? y - 1 + 543 : y + 543) + ' (' + prev.length + ' วันทำงานแรก)' : '';
  }
  var cs = {}, ps2 = {}; cur.forEach(function (d) { cs[d] = 1; }); prev.forEach(function (d) { ps2[d] = 1; });
  return { mode: mode, rows: rows, cur: rows.filter(function (r) { return cs[r.departDate]; }), prev: rows.filter(function (r) { return ps2[r.departDate]; }), curLabel: curLabel, prevLabel: prevLabel };
}
function inRegion(rows) { return ui.region ? rows.filter(function (r) { return regionOf(r.dc) === ui.region; }) : rows; }
function scopeText() { return ui.region ? 'ภาค ' + ui.region : 'ทุกภาค'; }

/* ---------- ข้อมูลแต่ละหัวข้อ ---------- */
function kpiData(P) {
  var C = stats(inRegion(P.cur)), R = P.prev.length ? stats(inRegion(P.prev)) : null;
  return cfg().kpis.map(function (id) {
    var k = KBY[id], v = C[id], pv = R ? R[id] : NaN, diff = NaN;
    if (R && Number.isFinite(v) && Number.isFinite(pv)) diff = k.pct ? v - pv : (pv ? (v - pv) / pv * 100 : NaN);
    return { id: id, l: k.l, v: v, prev: pv, diff: diff, good: (!k.dir || !Number.isFinite(diff) || Math.abs(diff) < 0.05) ? null : (k.dir > 0 ? diff > 0 : diff < 0), gr: id === 'normal' ? grade(v) : '' };
  });
}
function groupBy(rows, f) { var m = {}; rows.forEach(function (r) { var k = f(r); (m[k] = m[k] || []).push(r); }); return m; }
function regionData(P) {   /* ทุกภาค เพื่อเทียบ (ไม่กรองภาค) */
  var g = groupBy(P.cur, function (r) { return regionOf(r.dc); });
  return REGIONS.filter(function (rg) { return g[rg]; }).map(function (rg) { var s = stats(g[rg]); s.rg = rg; s.gr = grade(s.normal); s.v040 = stats(g[rg].filter(function (r) { return r.vehicleType.indexOf('040') === 0; })); s.v042 = stats(g[rg].filter(function (r) { return r.vehicleType.indexOf('042') === 0; })); return s; });
}
function dcData(P) {
  var g = groupBy(inRegion(P.cur), function (r) { return r.dc; });
  return Object.keys(g).map(function (dc) { var s = stats(g[dc]); s.dc = dc; s.rg = regionOf(dc); s.gr = grade(s.normal); return s; });
}
function dcRanked(P) { var mt = cfg().minTrips; return dcData(P).filter(function (s) { return s.trips >= mt; }); }
function dcWorst10(P) { return dcRanked(P).sort(function (a, b) { return a.normal - b.normal || b.trips - a.trips; }).slice(0, 10); }
function groupData(P) {
  var g = groupBy(inRegion(P.cur), function (r) { return r.vehicleType + '|' + r.releaseType; });
  return Object.keys(g).sort().map(function (k) { var s = stats(g[k]), p = k.split('|'); s.veh = shortDC(p[0]); s.rel = shortDC(p[1]); s.name = s.veh.replace(/^รถ/, '').replace('ควบคุมอุณหภูมิ4W', 'ควบคุมอุณหภูมิ') + ' · ' + s.rel.replace('รถร่วม ', ''); return s; });
}
/* ดีสุด/แย่สุด: DC 5+5, ภาค 3+3 (ถ้าน้อยกว่า ใช้ครึ่งหนึ่ง ไม่ซ้ำกัน); ตัวที่ต่ำ = ดี เรียงกลับด้าน */
function bw(list, key, n, dir) {
  var arr = list.filter(function (x) { return Number.isFinite(x[key]); }).sort(function (a, b) { return dir > 0 ? b[key] - a[key] : a[key] - b[key]; });
  var k = Math.min(n, Math.floor(arr.length / 2));
  return { best: arr.slice(0, k), worst: arr.slice(arr.length - k).reverse(), all: arr };
}
function bwData(P, id) { var k = KBY[id]; return { dc: bw(dcRanked(P), id, 5, k.dir), rg: bw(regionData(P), id, 3, k.dir) }; }

/* ---------- ข้อความสรุป (อีโมจิ) ---------- */
function diffTxt(t) {
  if (!Number.isFinite(t.diff)) return 'ไม่มีช่วงก่อนหน้า';
  var z = Math.abs(t.diff) < 0.05, s = (z ? '±' : t.diff > 0 ? '+' : '−') + Math.abs(t.diff).toFixed(1) + (KBY[t.id].pct ? ' pt' : '%');
  return (t.good === null ? '' : t.good ? '🟢 ' : '🔴 ') + s;
}
function summaryText() {
  var P = periods(), L = ['📊 NIMEX Fleet Vehicle', '🗓️ ' + P.curLabel + '  |  📍 ' + scopeText(), P.prevLabel ? '↔️ เทียบ ' + P.prevLabel : '↔️ ไม่มีช่วงก่อนหน้า'];
  var sec = function (t) { L.push(''); L.push(t); };
  if (picked.kpi) { sec('🎯 KPI หลัก'); kpiData(P).forEach(function (t) { L.push((t.gr ? GE[t.gr] + ' ' : '• ') + t.l + ': ' + fmtK(t.id, t.v) + (t.gr ? ' เกรด ' + t.gr : '') + '  (' + diffTxt(t) + ')'); }); }
  if (picked.region) { sec('🗺️ ภาคที่ % เที่ยวปกติต่ำสุด'); regionData(P).sort(function (a, b) { return a.normal - b.normal; }).slice(0, 3).forEach(function (s, i) { L.push(MD[i] + ' ' + s.rg + ': ' + p1(s.normal) + ' (' + nf(s.trips) + ' เที่ยว)'); }); }
  if (picked.dc) { sec('🚨 DC ที่ % เที่ยวปกติต่ำสุด (≥ ' + cfg().minTrips + ' เที่ยว)'); dcWorst10(P).slice(0, 5).forEach(function (s, i) { L.push(MD[i] + ' ' + shortDC(s.dc) + ' (' + s.rg + '): ' + p1(s.normal) + ' · ' + nf(s.trips) + ' เที่ยว'); }); }
  if (picked.group) { sec('🚚 ชนิดรถ × ประเภทการปล่อยรถ'); groupData(P).forEach(function (s) { L.push('• ' + s.name + ': ' + nf(s.trips) + ' เที่ยว · ' + nf(s.cars) + ' คัน · ปกติ ' + p1(s.normal)); }); }
  KPIS.forEach(function (k) {
    if (!picked['bw_' + k.id]) return; var B = bwData(P, k.id);
    sec('🏅 ดีสุด/แย่สุด · ' + k.l);
    B.dc.best.forEach(function (s) { L.push('🟢 ' + shortDC(s.dc) + ' (' + s.rg + '): ' + p1(s[k.id])); });
    B.dc.worst.forEach(function (s) { L.push('🔴 ' + shortDC(s.dc) + ' (' + s.rg + '): ' + p1(s[k.id])); });
    L.push('ภาค:'); B.rg.best.forEach(function (s) { L.push('🟢 ' + s.rg + ': ' + p1(s[k.id])); }); B.rg.worst.forEach(function (s) { L.push('🔴 ' + s.rg + ': ' + p1(s[k.id])); });
  });
  return L.join('\n');
}

/* ---------- SVG: ฟอนต์ Prompt + โลโก้ฝังในภาพ (ไม่ใช้ html2canvas) ---------- */
var FONT_CSS = null, LOGO = null;
function fontCss() {
  if (FONT_CSS != null) return FONT_CSS;
  var out = [];
  [].forEach.call(document.querySelectorAll('style'), function (s) { (s.textContent.match(/@font-face\{[^}]*\}/g) || []).forEach(function (f) { if (f.indexOf('Prompt') >= 0) out.push(f); }); });
  return (FONT_CSS = out.join('\n'));
}
function logoData() {
  if (LOGO) return Promise.resolve(LOGO);
  return fetch('logo.png').then(function (r) { return r.blob(); }).then(function (b) { return new Promise(function (res) { var f = new FileReader(); f.onload = function () { LOGO = f.result; res(LOGO); }; f.readAsDataURL(b); }); }).catch(function () { return ''; });
}
function wrapSvg(W, H, body) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="Prompt, sans-serif"><defs><style>' + fontCss() + ' text{font-family:Prompt,sans-serif}</style></defs>' + body + '</svg>';
}
function toPng(svg, W, H, scale) {
  return new Promise(function (res, rej) {
    var url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })), img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      c.toBlob(function (b) { b ? res(b) : rej(new Error('png')); }, 'image/png');
    };
    img.onerror = function () { rej(new Error('svg')); }; img.src = url;
  });
}
function waitFonts() { return (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve(); }
function T(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" font-size="' + (o.fs || 16) + '" font-weight="' + (o.fw || 400) + '" fill="' + (o.c || '#0b1f3f') + '"' + (o.a ? ' text-anchor="' + o.a + '"' : '') + '>' + esc(s) + '</text>'; }

/* ---------- อินโฟกราฟิก 16:9 (1920×1080 → PNG 3840×2160) ---------- */
function niceAxis(vals) {   /* ช่วงแคบ (เช่น 87–97%) ไม่เริ่มที่ 0 */
  var v = vals.filter(Number.isFinite); if (!v.length) return { lo: 0, hi: 100, note: '' };
  var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v);
  var lo = (mn >= 40 && mx - mn <= 30) ? Math.max(0, Math.floor((mn - 5) / 10) * 10) : 0, span = Math.max(1, mx * 1.08 - lo), step = [5, 10, 20, 25].filter(function (x) { return x * 4 >= span; })[0] || 25;
  return { lo: lo, hi: lo + step * 4, note: lo ? 'แกนเริ่มที่ ' + lo + '%' : '' };
}
function panel(x, y, w, h, title, sub) {
  return '<g transform="translate(' + x + ' ' + y + ')"><rect width="' + w + '" height="' + h + '" rx="16" fill="#fff" stroke="#dbe3f0"/><rect width="' + w + '" height="5" rx="2" fill="#d4af37"/>' +
    T(22, 38, title, { fs: 21, fw: 600, c: '#0a2a5e' }) + (sub ? T(w - 20, 38, sub, { fs: 14, c: '#55657f', a: 'end' }) : '') + '</g>';
}
function hbars(x, y, w, h, items, key, color) {   /* แท่งแนวนอน + จำนวนเที่ยว/คัน */
  var ax = niceAxis(items.map(function (i) { return i[key]; })), lab = 250, bw = w - lab - 150, rh = Math.min(64, h / Math.max(1, items.length)), s = '';
  items.forEach(function (it, i) {
    var yy = y + i * rh, val = it[key], len = Number.isFinite(val) ? Math.max(2, (val - ax.lo) / (ax.hi - ax.lo) * bw) : 0;
    s += T(x, yy + rh / 2 - 2, it.name, { fs: 16, fw: 600 }) + T(x, yy + rh / 2 + 18, nf(it.trips) + ' เที่ยว · ' + nf(it.cars) + ' คัน', { fs: 13, c: '#55657f' });
    s += '<rect x="' + (x + lab) + '" y="' + (yy + rh * .22) + '" width="' + bw + '" height="' + rh * .56 + '" rx="8" fill="#eef2f9"/><rect x="' + (x + lab) + '" y="' + (yy + rh * .22) + '" width="' + len + '" height="' + rh * .56 + '" rx="8" fill="' + color + '"/>';
    s += T(x + lab + bw + 12, yy + rh / 2 + 7, p1(val), { fs: 20, fw: 600, c: '#0a2a5e' });
  });
  return { s: s, note: ax.note };
}
function vpairs(x, y, w, h, rows, k1, k2, c1, c2, l1, l2) {   /* แท่งคู่รายภาค */
  var ax = niceAxis(rows.reduce(function (a, r) { return a.concat([r[k1], r[k2]]); }, [])), n = rows.length, gw = w / Math.max(1, n), bwid = Math.min(26, gw * .32), base = y + h - 40, ch = h - 76, s = '';
  for (var t = 0; t <= 4; t++) { var gv = ax.lo + (ax.hi - ax.lo) * t / 4, gy = base - ch * t / 4; s += '<line x1="' + x + '" x2="' + (x + w) + '" y1="' + gy + '" y2="' + gy + '" stroke="#e4e9f2"/>' + T(x - 6, gy + 5, Math.round(gv) + '%', { fs: 12, c: '#8a99b3', a: 'end' }); }
  rows.forEach(function (r, i) {
    var cx = x + gw * i + gw / 2;
    [[k1, c1, -1], [k2, c2, 1]].forEach(function (b) {
      var v = r[b[0]]; if (!Number.isFinite(v)) return; var hh = Math.max(2, (Math.max(v, ax.lo) - ax.lo) / (ax.hi - ax.lo) * ch), bx = cx + (b[2] < 0 ? -bwid - 2 : 2);
      s += '<rect x="' + bx + '" y="' + (base - hh) + '" width="' + bwid + '" height="' + hh + '" rx="4" fill="' + b[1] + '"/>' + T(bx + bwid / 2, base - hh - 6, Math.round(v), { fs: 12, fw: 600, c: '#33445f', a: 'middle' });
    });
    s += T(cx, base + 20, r.rg, { fs: 13, fw: 600, a: 'middle' }) + T(cx, base + 36, nf(r.trips), { fs: 11, c: '#8a99b3', a: 'middle' });
  });
  s += '<rect x="' + x + '" y="' + (y - 4) + '" width="14" height="14" rx="3" fill="' + c1 + '"/>' + T(x + 20, y + 8, l1, { fs: 14 }) + '<rect x="' + (x + 230) + '" y="' + (y - 4) + '" width="14" height="14" rx="3" fill="' + c2 + '"/>' + T(x + 250, y + 8, l2, { fs: 14 });
  return { s: s, note: ax.note };
}
function donut(cx, cy, r, counts) {
  var tot = 0, s = '', a0 = -Math.PI / 2; ['A','B','C','D','F'].forEach(function (g) { tot += counts[g] || 0; });
  if (!tot) return T(cx, cy, 'ไม่มี DC ที่ถึงเกณฑ์', { fs: 16, a: 'middle', c: '#55657f' });
  ['A','B','C','D','F'].forEach(function (g) {
    var v = counts[g] || 0; if (!v) return; var a1 = a0 + v / tot * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, ri = r * .6;
    if (v === tot) { s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + ri) / 2 + '" fill="none" stroke="' + GC[g] + '" stroke-width="' + (r - ri) + '"/>'; }
    else s += '<path d="M' + (cx + r * Math.cos(a0)) + ' ' + (cy + r * Math.sin(a0)) + 'A' + r + ' ' + r + ' 0 ' + big + ' 1 ' + (cx + r * Math.cos(a1)) + ' ' + (cy + r * Math.sin(a1)) + 'L' + (cx + ri * Math.cos(a1)) + ' ' + (cy + ri * Math.sin(a1)) + 'A' + ri + ' ' + ri + ' 0 ' + big + ' 0 ' + (cx + ri * Math.cos(a0)) + ' ' + (cy + ri * Math.sin(a0)) + 'Z" fill="' + GC[g] + '"/>';
    a0 = a1;
  });
  return s + T(cx, cy + 4, nf(tot), { fs: 34, fw: 600, c: '#0a2a5e', a: 'middle' }) + T(cx, cy + 28, 'DC', { fs: 15, c: '#55657f', a: 'middle' });
}
function infographic(logo) {
  var W = 1920, H = 1080, P = periods(), K = kpiData(P), s = '';
  s += '<rect width="' + W + '" height="' + H + '" fill="#eef2f9"/>';
  /* แถบหัว 120px */
  s += '<rect width="' + W + '" height="120" fill="#0a2a5e"/><rect y="116" width="' + W + '" height="4" fill="#d4af37"/>';
  s += '<rect x="28" y="22" width="170" height="76" rx="12" fill="#fff"/>' + (logo ? '<image href="' + logo + '" x="38" y="30" width="150" height="60" preserveAspectRatio="xMidYMid meet"/>' : '');
  s += T(226, 60, 'NIMEX Fleet Vehicle · สรุปผลเที่ยววิ่งรถร่วม', { fs: 34, fw: 600, c: '#fff' }) + T(226, 94, P.curLabel + (P.prevLabel ? '  ·  เทียบ ' + P.prevLabel : '  ·  ไม่มีช่วงก่อนหน้า'), { fs: 19, c: '#f0d57a' });
  s += '<rect x="' + (W - 268) + '" y="34" width="240" height="52" rx="26" fill="#d4af37"/>' + T(W - 148, 68, '📍 ' + scopeText(), { fs: 21, fw: 600, c: '#0a2a5e', a: 'middle' });
  /* การ์ด KPI */
  var gap = 16, n = K.length, cw = (W - 56 - gap * (n - 1)) / n, cy = 140, chh = 170;
  K.forEach(function (t, i) {
    var x = 28 + i * (cw + gap), bar = t.gr ? GC[t.gr] : '#d4af37', dc = t.good === null ? '#cfdcf2' : t.good ? '#5fe0a0' : '#ff8a98';
    s += '<g transform="translate(' + x + ' ' + cy + ')"><rect width="' + cw + '" height="' + chh + '" rx="16" fill="#0a2a5e"/><rect y="' + (chh - 6) + '" width="' + cw + '" height="6" rx="3" fill="' + bar + '"/>';
    s += T(cw / 2, 38, t.l, { fs: 17, fw: 500, c: '#f0d57a', a: 'middle' }) + T(cw / 2, 98, fmtK(t.id, t.v), { fs: 46, fw: 600, c: '#fff', a: 'middle' });
    s += T(cw / 2, 140, Number.isFinite(t.diff) ? (Math.abs(t.diff) < 0.05 ? '' : t.diff > 0 ? '▲ ' : '▼ ') + diffTxt(t).replace(/^🟢 |^🔴 /, '') : 'ไม่มีช่วงก่อนหน้า', { fs: 16, fw: 600, c: Number.isFinite(t.diff) ? dc : '#cfdcf2', a: 'middle' });
    if (t.gr) s += '<rect x="' + (cw - 50) + '" y="12" width="38" height="38" rx="10" fill="' + bar + '"/>' + T(cw - 31, 39, t.gr, { fs: 22, fw: 600, c: '#fff', a: 'middle' });
    s += '</g>';
  });
  /* กราฟ 2×2 */
  var top = cy + chh + 20, pw = (W - 56 - 20) / 2, ph = (H - top - 52 - 20) / 2, xs = [28, 28 + pw + 20], ys = [top, top + ph + 20];
  var G = groupData(P).sort(function (a, b) { return b.trips - a.trips; }), RD = regionData(P), D = dcData(P), mt = cfg().minTrips;
  var g1 = hbars(xs[0] + 24, ys[0] + 64, pw - 48, ph - 84, G, 'normal', '#1d57b8');
  s += panel(xs[0], ys[0], pw, ph, '% เที่ยววิ่งปกติ ตามชนิดรถ × ประเภทการปล่อยรถ', (ui.region ? 'ภาค ' + ui.region + ' · ' : '') + g1.note) + g1.s;
  var g2 = vpairs(xs[1] + 60, ys[0] + 66, pw - 84, ph - 74, RD.map(function (r) { return { rg: r.rg, trips: r.trips, a: r.v040.normal, b: r.v042.normal }; }), 'a', 'b', '#1d57b8', '#b8860b', 'รถปิกอัพ (040)', 'รถควบคุมอุณหภูมิ (042)');
  s += panel(xs[1], ys[0], pw, ph, '% เที่ยววิ่งปกติ รายภาค · ปิกอัพ vs ควบคุมอุณหภูมิ', g2.note || 'ทุกภาค') + g2.s;
  var g3 = vpairs(xs[0] + 60, ys[1] + 66, pw - 84, ph - 74, RD, 'abn', 'risk', '#b8334a', '#d4a72c', '% ผิดปกติ', '% มีความเสี่ยง');
  s += panel(xs[0], ys[1], pw, ph, '% ผิดปกติ และ % มีความเสี่ยง รายภาค (ต่ำ = ดี)', g3.note || 'ทุกภาค') + g3.s;
  var cnt = {}; D.filter(function (d) { return d.trips >= mt; }).forEach(function (d) { cnt[d.gr] = (cnt[d.gr] || 0) + 1; });
  s += panel(xs[1], ys[1], pw, ph, 'สัดส่วนเกรด DC (% เที่ยวปกติ) + แย่สุด 3 อันดับ', 'DC ≥ ' + mt + ' เที่ยว') + donut(xs[1] + 170, ys[1] + ph / 2 + 18, Math.min(120, ph / 2 - 50), cnt);
  var gc = cfg().grade, ly = ys[1] + 70;
  ['A','B','C','D','F'].forEach(function (g, i) { var rng = g === 'A' ? '≥ ' + gc.A + '%' : g === 'F' ? '< ' + gc.D + '%' : gc[g] + '–' + (gc[String.fromCharCode(g.charCodeAt(0) - 1)]) + '%'; s += '<rect x="' + (xs[1] + 330) + '" y="' + (ly + i * 30) + '" width="18" height="18" rx="4" fill="' + GC[g] + '"/>' + T(xs[1] + 356, ly + i * 30 + 15, g + '  ' + rng + '  ·  ' + (cnt[g] || 0) + ' DC', { fs: 15 }); });
  var worst = dcWorst10(P).slice(0, 3), wy = ly + 170;
  s += T(xs[1] + 330, wy, 'แย่สุด 3 อันดับ', { fs: 16, fw: 600, c: '#b8334a' });
  worst.forEach(function (d, i) { s += '<circle cx="' + (xs[1] + 342) + '" cy="' + (wy + 26 + i * 30) + '" r="11" fill="#b8334a"/>' + T(xs[1] + 342, wy + 31 + i * 30, i + 1, { fs: 13, fw: 600, c: '#fff', a: 'middle' }) + T(xs[1] + 362, wy + 31 + i * 30, shortDC(d.dc) + ' (' + d.rg + ')  ' + p1(d.normal) + ' · ' + nf(d.trips) + ' เที่ยว', { fs: 15 }); });
  /* แถบท้าย */
  s += '<rect y="' + (H - 40) + '" width="' + W + '" height="40" fill="#0a2a5e"/>' + T(28, H - 14, 'สูตร: % = จำนวนเที่ยวสถานะนั้น ÷ เที่ยวทั้งหมด × 100 · ผลต่างของ % เป็น จุด (pt) · วันทำงาน = วันที่มีเที่ยววิ่ง · เกรดจาก % เที่ยวปกติ (ตั้งค่าโดยผู้ดูแล)', { fs: 15, c: '#cfdcf2' }) + T(W - 28, H - 14, 'NIMEX Fleet Hub', { fs: 15, fw: 600, c: '#f0d57a', a: 'end' });
  return wrapSvg(W, H, s);
}

/* ---------- ตาราง (ใช้ทั้ง PNG ยาว, PowerPoint, Excel) ---------- */
function sections(P) {
  var out = [], mt = cfg().minTrips;
  if (picked.kpi) out.push({ k: 'kpi', t: 'KPI หลัก', head: ['ตัวชี้วัด', 'ช่วงนี้', 'ช่วงก่อนหน้า', 'ผลต่าง', 'เกรด'], rows: kpiData(P).map(function (t) { return [t.l, fmtK(t.id, t.v), fmtK(t.id, t.prev), diffTxt(t).replace(/^🟢 |^🔴 /, ''), t.gr || '–']; }), raw: kpiData(P) });
  if (picked.region) out.push({ k: 'region', t: 'ผลรายภาค', head: ['ภาค', 'เที่ยว', 'คัน', '% ปกติ', '% ผิดปกติ', '% เสี่ยง', '% ข้ามวัน', 'เกรด'], rows: regionData(P).map(function (s) { return [s.rg, nf(s.trips), nf(s.cars), p1(s.normal), p1(s.abn), p1(s.risk), p1(s.cross), s.gr]; }) });
  if (picked.dc) out.push({ k: 'dc', t: 'DC ที่ % เที่ยวปกติต่ำสุด 10 อันดับ (≥ ' + mt + ' เที่ยว)', head: ['#', 'DC', 'ภาค', 'เที่ยว', '% ปกติ', '% ผิดปกติ', '% เสี่ยง', 'เกรด'], rows: dcWorst10(P).map(function (s, i) { return [i + 1, shortDC(s.dc), s.rg, nf(s.trips), p1(s.normal), p1(s.abn), p1(s.risk), s.gr]; }) });
  if (picked.group) out.push({ k: 'group', t: 'ชนิดรถ × ประเภทการปล่อยรถ', head: ['ชนิดรถ', 'ประเภทการปล่อย', 'เที่ยว', 'คัน', '% ปกติ', '% ผิดปกติ', '% เสี่ยง', '% ข้ามวัน'], rows: groupData(P).map(function (s) { return [s.veh, s.rel, nf(s.trips), nf(s.cars), p1(s.normal), p1(s.abn), p1(s.risk), p1(s.cross)]; }) });
  KPIS.forEach(function (k) {
    if (!picked['bw_' + k.id]) return; var B = bwData(P, k.id), tag = function (x, grp) { return grp.best.indexOf(x) >= 0 ? 'ดีสุด' : grp.worst.indexOf(x) >= 0 ? 'แย่สุด' : ''; };
    out.push({ k: 'bw_' + k.id, t: 'ดีสุด/แย่สุด · ' + k.l + (k.dir < 0 ? ' (ต่ำ = ดี)' : ''), head: ['ป้าย', 'ระดับ', 'ชื่อ', 'ภาค', 'เที่ยว', k.l],
      rows: B.dc.best.concat(B.dc.worst).map(function (s) { return [tag(s, B.dc), 'DC', shortDC(s.dc), s.rg, nf(s.trips), p1(s[k.id])]; }).concat(B.rg.best.concat(B.rg.worst).map(function (s) { return [tag(s, B.rg), 'ภาค', s.rg, s.rg, nf(s.trips), p1(s[k.id])]; })),
      full: B.dc.all.map(function (s, i) { return [tag(s, B.dc), 'DC', i + 1, shortDC(s.dc), s.rg, s.trips, +s[k.id].toFixed(2)]; }).concat(B.rg.all.map(function (s, i) { return [tag(s, B.rg), 'ภาค', i + 1, s.rg, s.rg, s.trips, +s[k.id].toFixed(2)]; })) });
  });
  return out;
}
function tableSvg(sec, W) {
  var rh = 36, n = sec.head.length, cw = W / n, s = T(0, 26, sec.t, { fs: 22, fw: 600, c: '#0a2a5e' }), y0 = 42;
  s += '<rect y="' + y0 + '" width="' + W + '" height="' + rh + '" rx="6" fill="#0a2a5e"/>';
  sec.head.forEach(function (h, i) { s += T(i * cw + 10, y0 + 24, h, { fs: 15, fw: 600, c: '#fff' }); });
  sec.rows.forEach(function (r, j) {
    var y = y0 + (j + 1) * rh; if (j % 2) s += '<rect y="' + y + '" width="' + W + '" height="' + rh + '" fill="#f2f5fb"/>';
    r.forEach(function (c, i) { var col = c === 'แย่สุด' || c === 'F' ? BAD : c === 'ดีสุด' ? GOOD : '#0b1f3f'; s += T(i * cw + 10, y + 24, c, { fs: 15, fw: i < 1 ? 600 : 400, c: col }); });
  });
  return { s: s, h: y0 + (sec.rows.length + 1) * rh };
}
function longSvg(logo) {
  var P = periods(), W = 1400, x = 40, y = 150, body = '', secs = sections(P);
  secs.forEach(function (sec) { var t = tableSvg(sec, W - 80); body += '<g transform="translate(' + x + ' ' + y + ')">' + t.s + '</g>'; y += t.h + 40; });
  var H = y + 30, head = '<rect width="' + W + '" height="' + H + '" fill="#fff"/><rect width="' + W + '" height="120" fill="#0a2a5e"/><rect y="116" width="' + W + '" height="4" fill="#d4af37"/><rect x="28" y="22" width="150" height="76" rx="12" fill="#fff"/>' +
    (logo ? '<image href="' + logo + '" x="36" y="30" width="134" height="60" preserveAspectRatio="xMidYMid meet"/>' : '') + T(200, 60, 'NIMEX Fleet Vehicle', { fs: 32, fw: 600, c: '#fff' }) + T(200, 94, P.curLabel + ' · ' + scopeText() + (P.prevLabel ? ' · เทียบ ' + P.prevLabel : ' · ไม่มีช่วงก่อนหน้า'), { fs: 18, c: '#f0d57a' });
  return { svg: wrapSvg(W, H, head + body), W: W, H: H };
}

/* ---------- ไฟล์ ---------- */
var SHEET = { kpi: 'KPI หลัก', region: 'ผลรายภาค', dc: 'DC ต่ำสุด 10 อันดับ', group: 'ชนิดรถ-ประเภทการปล่อย', bw_normal: 'ดีสุด-แย่สุด % ปกติ', bw_abn: 'ดีสุด-แย่สุด % ผิดปกติ', bw_risk: 'ดีสุด-แย่สุด % เสี่ยง', bw_cross: 'ดีสุด-แย่สุด % ข้ามวัน' };
var LIBS = { pptx: ['PptxGenJS', 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js'] };
function loadLib(k) { return new Promise(function (res, rej) { var g = LIBS[k][0]; if (window[g]) return res(); var s = document.createElement('script'); s.src = LIBS[k][1]; s.onload = res; s.onerror = function () { rej(new Error('lib')); }; document.head.appendChild(s); }); }
function stamp() { var P = periods(), c = P.cur.length ? P.cur[0].departDate : ''; var per = P.mode === 'month' ? c.slice(0, 7) : P.mode === 'week' ? c + '-week' : (P.cur[0] || {}).departDate || ''; return 'NIMEX-Fleet-Vehicle-' + per + (ui.region ? '-Region' : ''); }
function download(blob, name) { var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
function say(m) { var x = $('fvs-msg'); if (x) x.textContent = m; }
function doInfo() { say('กำลังสร้างอินโฟกราฟิก…'); return waitFonts().then(logoData).then(function (lg) { return toPng(infographic(lg), 1920, 1080, 2); }).then(function (b) { download(b, stamp() + '-infographic-16x9.png'); say('✓ ดาวน์โหลดอินโฟกราฟิก 16:9 แล้ว (3840×2160)'); }).catch(function (e) { say('สร้างภาพไม่สำเร็จ: ' + e.message); }); }
function doPng() { if (!sections(periods()).length) return say('กรุณาเลือกหัวข้ออย่างน้อย 1 หัวข้อ'); say('กำลังสร้างรูป…'); return waitFonts().then(logoData).then(function (lg) { var L = longSvg(lg); return toPng(L.svg, L.W, L.H, 2); }).then(function (b) { download(b, stamp() + '.png'); say('✓ ดาวน์โหลดรูป PNG แล้ว'); }).catch(function (e) { say('สร้างรูปไม่สำเร็จ: ' + e.message); }); }
function doXlsx() {
  var P = periods(), secs = sections(P); if (!secs.length) return say('กรุณาเลือกหัวข้ออย่างน้อย 1 หัวข้อ');
  var wb = XLSX.utils.book_new(), used = {};
  secs.forEach(function (sec) {
    var aoa = [[sec.t], [P.curLabel + ' · ' + scopeText() + (P.prevLabel ? ' · เทียบ ' + P.prevLabel : ' · ไม่มีช่วงก่อนหน้า')], []];
    if (sec.full) { aoa.push(['ป้าย', 'ระดับ', 'อันดับ', 'ชื่อ', 'ภาค', 'เที่ยว', sec.head[5]]); aoa = aoa.concat(sec.full); }
    else { aoa.push(sec.head); aoa = aoa.concat(sec.rows); }
    var name = SHEET[sec.k] || sec.k, i = 2; while (used[name]) name = name.slice(0, 26) + ' ' + (i++); used[name] = 1;
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), name);
  });
  XLSX.writeFile(wb, stamp() + '.xlsx'); say('✓ ดาวน์โหลด Excel แล้ว (' + secs.length + ' ชีต)');
}
function doPptx() {
  var P = periods(), secs = sections(P); say('กำลังสร้าง PowerPoint…');
  return Promise.all([loadLib('pptx'), waitFonts().then(logoData)]).then(function (x) {
    var lg = x[1]; return toPng(infographic(lg), 1920, 1080, 1).then(function (b) { return new Promise(function (res) { var f = new FileReader(); f.onload = function () { res(f.result); }; f.readAsDataURL(b); }); });
  }).then(function (img) {
    var pp = new PptxGenJS(); pp.layout = 'LAYOUT_WIDE';
    pp.addSlide().addImage({ data: img, x: 0, y: 0, w: 13.333, h: 7.5 });
    secs.forEach(function (sec) {
      var sl = pp.addSlide(); sl.background = { color: 'FFFFFF' };
      sl.addShape(pp.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.9, fill: { color: '0A2A5E' } });
      sl.addText(sec.t, { x: 0.4, y: 0.12, w: 12.5, h: 0.45, fontFace: 'Prompt', fontSize: 22, bold: true, color: 'FFFFFF' });
      sl.addText(P.curLabel + ' · ' + scopeText(), { x: 0.4, y: 0.52, w: 12.5, h: 0.3, fontFace: 'Prompt', fontSize: 12, color: 'F0D57A' });
      var rows = [sec.head.map(function (h) { return { text: String(h), options: { bold: true, color: 'FFFFFF', fill: { color: '0A2A5E' } } }; })]
        .concat(sec.rows.slice(0, 16).map(function (r) { return r.map(function (c) { return { text: String(c), options: { color: c === 'แย่สุด' || c === 'F' ? 'B8334A' : c === 'ดีสุด' ? '1A9E5F' : '0B1F3F' } }; }); }));
      sl.addTable(rows, { x: 0.4, y: 1.15, w: 12.5, fontFace: 'Prompt', fontSize: 12, border: { type: 'solid', color: 'DBE3F0', pt: 0.5 }, autoPage: false });
    });
    return pp.writeFile({ fileName: stamp() + '.pptx' });
  }).then(function () { say('✓ ดาวน์โหลด PowerPoint แล้ว (' + (secs.length + 1) + ' สไลด์)'); }).catch(function (e) { say('สร้าง PowerPoint ไม่สำเร็จ: ' + e.message); });
}

/* ---------- หน้าต่างแชร์ ---------- */
function regionOpts() { var have = {}; baseRows().forEach(function (r) { have[regionOf(r.dc)] = 1; }); return REGIONS.filter(function (rg) { return have[rg]; }); }
function render() {
  var P = periods(), fixed = ($('filterDate') || {}).value;
  $('fvs-body').innerHTML =
    '<div class="fvs-row"><div class="fvs-seg" role="group" aria-label="ช่วงเวลา">' + [['month','เดือน'],['week','สัปดาห์'],['day','วัน']].map(function (m) { return '<button type="button" data-mode="' + m[0] + '" class="' + (P.mode === m[0] ? 'on' : '') + '"' + (fixed ? ' disabled' : '') + '>' + m[1] + '</button>'; }).join('') + '</div>' +
    '<label class="fvs-rg">ภาค <select id="fvs-region"><option value="">ทุกภาค</option>' + regionOpts().map(function (r) { return '<option' + (r === ui.region ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join('') + '</select></label></div>' +
    '<p class="fvs-note">🗓️ ' + esc(P.curLabel) + ' · ' + esc(scopeText()) + '<br>↔️ ' + (P.prevLabel ? 'เทียบ ' + esc(P.prevLabel) : 'ไม่มีช่วงก่อนหน้า') + (fixed ? '<br>ใช้วันที่ที่เลือกบนหน้า (' + esc(fixed) + ')' : '') + '<br>ใช้ตัวกรองบนหน้าด้วย (DC / ชนิดรถ / ทะเบียน / สถานะ)</p>' +
    '<button type="button" class="fvs-info" data-act="info">🖼️ อินโฟกราฟิก 16:9</button>' +
    '<div class="fvs-h">เลือกหัวข้อสำหรับ Excel / PowerPoint / PNG / ข้อความ</div><div class="fvs-checks">' + SECS.map(function (s) { return '<label><input type="checkbox" data-sec="' + s[0] + '"' + (picked[s[0]] ? ' checked' : '') + '> ' + esc(s[1]) + '</label>'; }).join('') + '</div>' +
    '<div class="fvs-btns"><button type="button" data-act="xlsx">Excel</button><button type="button" data-act="pptx">PowerPoint</button><button type="button" data-act="png">รูป PNG ยาว</button></div>' +
    '<label class="fvs-h" for="fvs-text">ข้อความสรุป (คัดลอกไปวาง LINE / อีเมล)</label><textarea id="fvs-text" rows="9">' + esc(summaryText()) + '</textarea>' +
    '<div class="fvs-btns"><button type="button" class="alt" data-act="copy">คัดลอกข้อความ</button>' + (isAdmin() ? '<button type="button" class="alt" data-act="settings">⚙️ ตั้งค่าเกรด / KPI</button>' : '') + '</div><p class="fvs-msg" id="fvs-msg" role="status"></p>';
}
function renderSettings() {
  var c = cfg();
  $('fvs-body').innerHTML = '<div class="fvs-h">เกณฑ์เกรดจาก % เที่ยววิ่งปกติ (ต่ำกว่า D = F)</div><div class="fvs-grade">' + ['A','B','C','D'].map(function (g) { return '<label><span style="background:' + GC[g] + '">' + g + '</span> ≥ <input type="number" min="0" max="100" step="0.1" id="fvs-g' + g + '" value="' + c.grade[g] + '"> %</label>'; }).join('') + '</div>' +
    '<label class="fvs-h">DC ต้องมีอย่างน้อย <input type="number" min="1" max="1000" id="fvs-min" value="' + c.minTrips + '" style="width:80px"> เที่ยว จึงนำมาจัดอันดับ / ให้เกรด</label>' +
    '<div class="fvs-h">KPI ที่แสดงบนการ์ดและข้อความสรุป</div><div class="fvs-checks">' + KPIS.map(function (k) { return '<label><input type="checkbox" data-kpi="' + k.id + '"' + (c.kpis.indexOf(k.id) >= 0 ? ' checked' : '') + '> ' + esc(k.l) + (k.dir < 0 ? ' (ต่ำ = ดี)' : k.dir > 0 ? ' (สูง = ดี)' : '') + '</label>'; }).join('') + '</div>' +
    '<div class="fvs-btns"><button type="button" data-act="back" class="alt">‹ กลับ</button><button type="button" data-act="save">บันทึกค่าตั้ง</button></div><p class="fvs-msg" id="fvs-msg" role="status"></p>';
}
function saveSettings() {
  var g = {}; ['A','B','C','D'].forEach(function (k) { g[k] = +$('fvs-g' + k).value; });
  if (!(g.A >= g.B && g.B >= g.C && g.C >= g.D) || ['A','B','C','D'].some(function (k) { return !(g[k] >= 0 && g[k] <= 100); })) return say('เกณฑ์ต้องเรียง A ≥ B ≥ C ≥ D และอยู่ระหว่าง 0–100');
  var kp = [].map.call(document.querySelectorAll('[data-kpi]:checked'), function (e) { return e.dataset.kpi; }); if (!kp.length) return say('เลือก KPI อย่างน้อย 1 ตัว');
  var mt = Math.round(+$('fvs-min').value); if (!(mt >= 1 && mt <= 1000)) return say('จำนวนเที่ยวขั้นต่ำต้องอยู่ระหว่าง 1–1000');
  var st = { grade: g, kpis: kp, minTrips: mt };
  if (!window.fvApi) return say('บันทึกไม่ได้: ยังไม่ได้เชื่อม Google Sheet');
  say('กำลังบันทึก…');
  window.fvApi({ a: 'settings', settings: st }).then(function (r) { window.FV_SETTINGS = r.settings || st; say('✓ บันทึกแล้ว ผู้ดูแลทุกคนเห็นค่าตั้งเดียวกัน'); })
    .catch(function (e) { say(e.message === 'unknown' ? 'บันทึกไม่สำเร็จ: Apps Script ของ Fleet Vehicle ยังเป็นรุ่นเก่า (อัปเดต Code.gs แล้ว Deploy เวอร์ชันใหม่)' : 'บันทึกไม่สำเร็จ: ' + (e.message === 'denied' ? 'รหัสไม่ถูกต้อง' : e.message)); });
}
function open() { $('fvs').hidden = false; render(); }
function close() { $('fvs').hidden = true; }
function mount() {
  var d = document.createElement('div'); d.id = 'fvs'; d.hidden = true; d.className = 'fvs';
  d.innerHTML = '<div class="fvs-box" role="dialog" aria-modal="true" aria-labelledby="fvs-t"><div class="fvs-top"><h2 id="fvs-t">📤 แชร์และส่งออก</h2><button type="button" class="fvs-x" data-act="close" aria-label="ปิด">✕</button></div><div id="fvs-body"></div></div>';
  document.body.appendChild(d);
  d.addEventListener('click', function (e) {
    if (e.target === d) return close();
    var b = e.target.closest('[data-act],[data-mode]'); if (!b) return;
    if (b.dataset.mode) { ui.mode = b.dataset.mode; return render(); }
    var a = b.dataset.act;
    if (a === 'close') close(); else if (a === 'info') doInfo(); else if (a === 'png') doPng(); else if (a === 'xlsx') doXlsx(); else if (a === 'pptx') doPptx();
    else if (a === 'copy') { var t = $('fvs-text'); (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(function () { say('✓ คัดลอกข้อความแล้ว'); }).catch(function () { t.select(); document.execCommand('copy'); say('✓ คัดลอกข้อความแล้ว'); }); }
    else if (a === 'settings') renderSettings(); else if (a === 'back') render(); else if (a === 'save') saveSettings();
  });
  d.addEventListener('change', function (e) {
    var k = e.target.dataset && e.target.dataset.sec;
    if (k) { if (e.target.checked) picked[k] = 1; else delete picked[k]; var t = $('fvs-text'); if (t) t.value = summaryText(); }
    if (e.target.id === 'fvs-region') { ui.region = e.target.value; render(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('fvs').hidden) close(); });
}
window.fvShare = { open: open, summaryText: summaryText, periods: periods, kpiData: kpiData, regionData: regionData, dcWorst10: dcWorst10, bwData: bwData, groupData: groupData, infographic: infographic, set: function (o) { Object.assign(ui, o); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
