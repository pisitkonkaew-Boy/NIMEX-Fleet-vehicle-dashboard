/* NIMEX Fleet Vehicle — แชร์และส่งออก (ผู้ดูแล): Excel ทีละหัวข้อ, PowerPoint 16:9, PNG ยาว, อินโฟกราฟิก A4, ข้อความ LINE
   ภาพสร้างจาก SVG ล้วน + ฝังฟอนต์ Prompt และโลโก้เป็น data URL (ไม่ใช้ html2canvas เพราะสระไทยเพี้ยน) */
'use strict';
const XS = {
  secs: [['kpi', 'KPI หลัก'], ['zone', 'ผลราย Zone'], ['dc', 'DC เสี่ยง+ผิดปกติสูงสุด 10 อันดับ'], ['plate', 'ทะเบียนเสี่ยง+ผิดปกติมากสุด 10 อันดับ'], ['daily', 'เที่ยววิ่งรายวัน'], ['vehicle', 'แยกชนิดรถ / ประเภทการปล่อยรถ'],
    ['bw_bad', 'ดีสุด/แย่สุด: % เสี่ยง+ผิดปกติ'], ['bw_abn', 'ดีสุด/แย่สุด: % ผิดปกติ'], ['bw_risk', 'ดีสุด/แย่สุด: % มีความเสี่ยง'], ['bw_cross', 'ดีสุด/แย่สุด: % รับรถข้ามวัน']],
  picked: new Set(['kpi', 'zone', 'dc', 'plate', 'daily']),   /* ดีสุด/แย่สุด ไม่ติ๊กไว้ก่อน */
  font: null, logo: null,
};
const C = { green: '#1e7d4f', navy: '#0a2a5e', navy2: '#123f8c', gold: '#d4af37', goldL: '#f0d57a', ink: '#0b1f3f', muted: '#55657f', line: '#dbe3f0', red: '#b8334a', blue: '#1d57b8', amber: '#b8860b', bg: '#f0f4f8' };
const xe = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cut = (s, n) => { s = String(s ?? ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

/* ── ข้อมูลแต่ละหัวข้อ (ตามตัวกรอง/ช่วงเวลาที่เลือก) ── */
function xStats(a) {
  const n = a.length, dist = a.reduce((s, r) => s + (r.distance || 0), 0), c = k => a.filter(r => r.tripStatus === k).length;
  return { n, dist, avg: n ? dist / n : 0, risk: c('เที่ยววิ่งมีความเสี่ยง'), abn: c('เที่ยววิ่งผิดปกติ'), riskP: n ? c('เที่ยววิ่งมีความเสี่ยง') / n * 100 : 0, abnP: n ? c('เที่ยววิ่งผิดปกติ') / n * 100 : 0, normP: n ? c('เที่ยววิ่งปกติ') / n * 100 : 0, cross: n ? a.filter(r => r.dayStatus === 'รับรถข้ามวัน').length / n * 100 : 0 };
}
const prevData = () => compareInfo && compareInfo.has ? compareInfo.prevData : null;
function dPct(c, p) { if (p == null || !Number.isFinite(p) || !p) return null; return (c - p) / p * 100; }
function dTxt(v, pp) { if (v == null || !Number.isFinite(v)) return 'ไม่มีช่วงก่อนหน้า'; if (Math.abs(v) < 0.05) return pp ? '0 pp' : '0%'; return (v > 0 ? '▲ ' : '▼ ') + Math.abs(v).toFixed(1) + (pp ? ' pp' : '%'); }
function secKpi() {
  const S = xStats(filteredData), P = prevData() ? xStats(prevData()) : null;
  return [
    { l: 'เที่ยววิ่งรวม', v: S.n.toLocaleString(), u: 'เที่ยว', d: P ? dTxt(dPct(S.n, P.n)) : 'ไม่มีช่วงก่อนหน้า', bad: false },
    { l: 'ระยะทางรวม', v: Math.round(S.dist).toLocaleString(), u: 'กม.', d: P ? dTxt(dPct(S.dist, P.dist)) : 'ไม่มีช่วงก่อนหน้า', bad: false },
    { l: 'เฉลี่ยต่อเที่ยว', v: Math.round(S.avg).toLocaleString(), u: 'กม./เที่ยว', d: P ? dTxt(dPct(S.avg, P.avg)) : 'ไม่มีช่วงก่อนหน้า', bad: false },
    { l: 'เที่ยววิ่งปกติ', v: S.normP.toFixed(1) + '%', u: `${(S.n - S.risk - S.abn).toLocaleString()} เที่ยว`, d: P ? dTxt(S.normP - P.normP, 1) : 'ไม่มีช่วงก่อนหน้า', bad: P ? S.normP < P.normP - 0.05 : false, good: P ? S.normP > P.normP + 0.05 : false },
    { l: 'มีความเสี่ยง', v: S.riskP.toFixed(1) + '%', u: `${S.risk.toLocaleString()} เที่ยว`, d: P ? dTxt(S.riskP - P.riskP, 1) : 'ไม่มีช่วงก่อนหน้า', bad: P ? S.riskP > P.riskP + 0.05 : false, good: P ? S.riskP < P.riskP - 0.05 : false },
    { l: 'ผิดปกติ', v: S.abnP.toFixed(1) + '%', u: `${S.abn.toLocaleString()} เที่ยว`, d: P ? dTxt(S.abnP - P.abnP, 1) : 'ไม่มีช่วงก่อนหน้า', bad: P ? S.abnP > P.abnP + 0.05 : false, good: P ? S.abnP < P.abnP - 0.05 : false },
  ];
}
function byKey(arr, kf) { const m = new Map(); arr.forEach(r => { const k = kf(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }); return m; }
function secZone() {
  const cur = byKey(filteredData, r => dcZone(r.dc)), pv = prevData() ? byKey(prevData(), r => dcZone(r.dc)) : null;
  return { cols: [['Zone', 'l', 150], ['กลุ่ม', 'l', 70], ['เที่ยว', 'r', 90], ['ระยะทาง (กม.)', 'r', 130], ['% เสี่ยง', 'r', 90], ['% ผิดปกติ', 'r', 90], ['เทียบช่วงก่อน (เสี่ยง+ผิดปกติ)', 'r', 210]],
    rows: ZONE_ORDER.filter(z => cur.has(z)).map(z => { const S = xStats(cur.get(z)), P = pv && pv.get(z) ? xStats(pv.get(z)) : null; return [z, z === 'BKK' ? 'BKK' : 'UPC', S.n, Math.round(S.dist), S.riskP.toFixed(1) + '%', S.abnP.toFixed(1) + '%', P ? dTxt(S.riskP + S.abnP - P.riskP - P.abnP, 1) : '–']; }) };
}
function secDC() {
  const rows = [...byKey(filteredData, r => r.dc)].map(([dc, a]) => ({ dc, S: xStats(a) })).filter(o => o.S.n >= 20)
    .sort((a, b) => (b.S.riskP + b.S.abnP) - (a.S.riskP + a.S.abnP)).slice(0, 10);
  return { cols: [['#', 'r', 40], ['DC', 'l', 220], ['Zone', 'l', 120], ['เที่ยว', 'r', 90], ['% เสี่ยง', 'r', 90], ['% ผิดปกติ', 'r', 90], ['รวม', 'r', 90]],
    rows: rows.map((o, i) => [i + 1, dcName(o.dc), dcZone(o.dc), o.S.n, o.S.riskP.toFixed(1) + '%', o.S.abnP.toFixed(1) + '%', (o.S.riskP + o.S.abnP).toFixed(1) + '%']), note: 'เฉพาะ DC ที่มีอย่างน้อย 20 เที่ยว' };
}
function secPlate() {
  const rows = [...byKey(filteredData, r => r.plate)].map(([p, a]) => ({ p, a, S: xStats(a) })).filter(o => o.S.risk + o.S.abn > 0)
    .sort((a, b) => (b.S.abn * 2 + b.S.risk) - (a.S.abn * 2 + a.S.risk)).slice(0, 10);
  return { cols: [['#', 'r', 40], ['ทะเบียน', 'l', 150], ['DC', 'l', 200], ['เที่ยว', 'r', 80], ['เสี่ยง', 'r', 80], ['ผิดปกติ', 'r', 80]],
    rows: rows.map((o, i) => { const dc = o.a[0].dc; return [i + 1, o.p, dcName(dc), o.S.n, o.S.risk, o.S.abn]; }), note: 'เรียงตามผิดปกติ (น้ำหนัก 2) + เสี่ยง' };
}
function secDaily() {
  const m = byKey(filteredData, r => r.departDate); const ds = [...m.keys()].filter(Boolean).sort();
  return ds.map(d => { const a = m.get(d); return { d, n: a.length, bad: a.filter(r => r.tripStatus !== 'เที่ยววิ่งปกติ').length }; });
}
const BW_MET = {
  bw_bad:   ['% เสี่ยง+ผิดปกติ', S => S.riskP + S.abnP],
  bw_abn:   ['% ผิดปกติ', S => S.abnP],
  bw_risk:  ['% มีความเสี่ยง', S => S.riskP],
  bw_cross: ['% รับรถข้ามวัน', S => S.cross],
};   /* ทุกตัวชี้วัดในนี้ ต่ำ = ดี */
function rankAll(k, level) {
  const f = BW_MET[k][1], kf = level === 'DC' ? (r => r.dc) : (r => dcZone(r.dc));
  return [...byKey(filteredData, kf)].map(([key, a]) => ({ key, S: xStats(a) })).filter(o => level === 'Zone' || o.S.n >= 20)
    .map(o => ({ ...o, v: f(o.S) })).sort((a, b) => a.v - b.v || b.S.n - a.S.n);
}
function pickBW(list, want) { /* ดีสุด want + แย่สุด want · ถ้ามีไม่พอ ใช้ครึ่งหนึ่ง ห้ามซ้ำ */
  const n = Math.min(want, Math.floor(list.length / 2));
  return { best: list.slice(0, n), worst: list.slice(list.length - n).reverse() };
}
function secBW(k) {
  const rows = [], name = (lv, key) => lv === 'DC' ? dcName(key) : key;
  [['DC', 5], ['Zone', 3]].forEach(([lv, w]) => {
    const p = pickBW(rankAll(k, lv), w);
    p.best.forEach((o, i) => rows.push(['ดีสุด', i + 1, lv, name(lv, o.key), o.S.n, o.v.toFixed(1) + '%']));
    p.worst.forEach((o, i) => rows.push(['แย่สุด', i + 1, lv, name(lv, o.key), o.S.n, o.v.toFixed(1) + '%']));
  });
  return { cols: [['', 'l', 80], ['อันดับ', 'r', 70], ['ระดับ', 'l', 80], ['ชื่อ', 'l', 260], ['เที่ยว', 'r', 90], [BW_MET[k][0], 'r', 150]], rows, note: 'ต่ำ = ดี · DC นับเฉพาะที่มีอย่างน้อย 20 เที่ยว · DC ดีสุด/แย่สุด 5 อันดับ, Zone 3 อันดับ' };
}
function secVehicle() {
  const out = [];
  [['ชนิดรถ', r => r.vehicleType], ['ประเภทการปล่อยรถ', r => r.releaseType]].forEach(([t, kf]) => {
    [...byKey(filteredData, kf)].sort((a, b) => b[1].length - a[1].length).forEach(([k, a]) => { const S = xStats(a); out.push([t, k, S.n, Math.round(S.dist), Math.round(S.avg), S.riskP.toFixed(1) + '%', S.abnP.toFixed(1) + '%']); });
  });
  return { cols: [['กลุ่ม', 'l', 150], ['รายการ', 'l', 230], ['เที่ยว', 'r', 80], ['กม.', 'r', 110], ['กม./เที่ยว', 'r', 90], ['% เสี่ยง', 'r', 80], ['% ผิดปกติ', 'r', 80]], rows: out };
}

/* ── ชื่อช่วง / ชื่อไฟล์ ── */
function scopeLine() {
  const ci = compareInfo, p = [];
  if (ci) p.push(rangeLabel(ci.cur.start, ci.cur.end));
  p.push(fGroup || 'ทุกกลุ่ม');
  const z = document.getElementById('filterZone').value, dc = document.getElementById('filterDC').value;
  if (z) p.push(z); if (dc) p.push(dcName(dc));
  ['filterVehicle', 'filterPlate', 'filterTripStatus'].forEach(id => { const v = document.getElementById(id).value; if (v) p.push(v); });
  return p.join(' · ');
}
const cmpLine = () => compareInfo && compareInfo.has ? `เทียบกับ ${rangeLabel(compareInfo.prev.start, compareInfo.prev.end)} (${compareInfo.work} วันทำงาน)` : 'ไม่มีข้อมูลช่วงก่อนหน้าให้เทียบ';
function stamp() {
  const p = fPeriod || 'all';
  const per = fMode === 'week' ? p + '-week' : p;
  return 'NIMEX-FleetVehicle-' + per + (fGroup ? '-' + fGroup : '');
}

/* ── ฟอนต์ + โลโก้ สำหรับ SVG ── */
async function assets() {
  if (!XS.font) {
    let css = '';
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; } for (const r of rules) if (r.type === 5 || r.constructor.name === 'CSSFontFaceRule') css += r.cssText + '\n'; }
    XS.font = css;
  }
  if (!XS.logo) {
    try { const b = await fetch('logo.png').then(r => r.blob()); XS.logo = await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); }); }
    catch (e) { XS.logo = ''; }
  }
}

/* ── ชิ้นส่วน SVG ── */
function svgKpi(W) {
  const K = secKpi(), cols = W >= 1100 ? 3 : 2, gap = 14, cw = (W - gap * (cols - 1)) / cols, ch = 132, rowsN = Math.ceil(K.length / cols);
  let s = '';
  K.forEach((k, i) => {
    const x = (i % cols) * (cw + gap), y = Math.floor(i / cols) * (ch + gap);
    const dc = /ไม่มี/.test(k.d) ? C.muted : k.bad ? C.red : k.good ? C.green : C.navy;
    s += `<g transform="translate(${x} ${y})"><rect width="${cw}" height="${ch}" rx="16" fill="url(#gN)"/><rect y="${ch - 5}" width="${cw}" height="5" fill="${C.gold}"/>
      <text x="18" y="32" font-size="17" fill="${C.goldL}" font-weight="500">${xe(k.l)}</text>
      <rect x="${cw - 168}" y="14" width="152" height="28" rx="14" fill="#fff" opacity=".94"/><text x="${cw - 92}" y="33" font-size="${/ไม่มี/.test(k.d) ? 12 : 15}" fill="${dc}" text-anchor="middle" font-weight="600">${xe(k.d)}</text>
      <text x="18" y="86" font-size="42" fill="#fff" font-weight="600">${xe(k.v)}</text>
      <text x="18" y="112" font-size="15" fill="#b9c9e6">${xe(k.u)}</text></g>`;
  });
  return { s, h: rowsN * ch + (rowsN - 1) * gap };
}
function svgTable(T, W) {
  const tw = T.cols.reduce((s, c) => s + c[2], 0), sc = W / tw, rh = 34, fs = 15;
  let x = 0, s = `<rect width="${W}" height="${rh}" rx="8" fill="${C.navy}"/>`;
  const xs = T.cols.map(c => { const o = x; x += c[2] * sc; return o; });
  T.cols.forEach((c, i) => { const w = c[2] * sc; s += `<text x="${c[1] === 'r' ? xs[i] + w - 10 : xs[i] + 10}" y="${rh / 2 + 5}" font-size="${fs - 1}" fill="#fff" font-weight="500" text-anchor="${c[1] === 'r' ? 'end' : 'start'}">${xe(c[0])}</text>`; });
  T.rows.forEach((r, j) => {
    const y = rh * (j + 1);
    if (j % 2) s += `<rect y="${y}" width="${W}" height="${rh}" fill="#f5f8fc"/>`;
    s += `<line x1="0" x2="${W}" y1="${y + rh}" y2="${y + rh}" stroke="${C.line}"/>`;
    T.cols.forEach((c, i) => {
      const w = c[2] * sc, v = r[i], txt = typeof v === 'number' ? v.toLocaleString() : cut(v, Math.floor(w / 9));
      const col = /▲/.test(txt) ? C.red : /▼/.test(txt) ? C.green : txt === 'แย่สุด' ? C.red : txt === 'ดีสุด' ? C.green : C.ink;
      s += `<text x="${c[1] === 'r' ? xs[i] + w - 10 : xs[i] + 10}" y="${y + rh / 2 + 5}" font-size="${fs}" fill="${col}" text-anchor="${c[1] === 'r' ? 'end' : 'start'}">${xe(txt)}</text>`;
    });
  });
  if (!T.rows.length) s += `<text x="${W / 2}" y="${rh + 26}" font-size="15" fill="${C.muted}" text-anchor="middle">ไม่มีข้อมูล</text>`;
  let h = rh * (Math.max(1, T.rows.length) + 1);
  if (T.note) { s += `<text x="0" y="${h + 20}" font-size="13" fill="${C.muted}">${xe(T.note)}</text>`; h += 26; }
  return { s, h };
}
function svgDaily(W) {
  const D = secDaily(), H = 280, m = { l: 56, r: 10, t: 16, b: 46 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
  const mx = Math.max(1, ...D.map(d => d.n)), bw = D.length ? iw / D.length : iw;
  let s = '';
  [0, .5, 1].forEach(f => { const y = m.t + ih * (1 - f); s += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" stroke="${C.line}"/><text x="${m.l - 8}" y="${y + 5}" font-size="13" fill="${C.muted}" text-anchor="end">${Math.round(mx * f).toLocaleString()}</text>`; });
  const step = Math.ceil(D.length / 16);
  D.forEach((d, i) => {
    const x = m.l + i * bw, h1 = d.n / mx * ih, h2 = d.bad / mx * ih;
    s += `<rect x="${x + bw * .15}" y="${m.t + ih - h1}" width="${bw * .7}" height="${h1}" rx="3" fill="${C.blue}"/><rect x="${x + bw * .15}" y="${m.t + ih - h2}" width="${bw * .7}" height="${h2}" rx="3" fill="${C.amber}"/>`;
    if (i % step === 0) { const t = new Date(d.d + 'T00:00:00Z'); s += `<text x="${x + bw / 2}" y="${H - m.b + 20}" font-size="13" fill="${C.muted}" text-anchor="middle">${t.getUTCDate()}/${t.getUTCMonth() + 1}</text>`; }
  });
  s += `<rect x="${m.l}" y="${H - 16}" width="14" height="10" fill="${C.blue}"/><text x="${m.l + 20}" y="${H - 6}" font-size="13" fill="${C.ink}">เที่ยววิ่งทั้งหมด</text><rect x="${m.l + 160}" y="${H - 16}" width="14" height="10" fill="${C.amber}"/><text x="${m.l + 180}" y="${H - 6}" font-size="13" fill="${C.ink}">เสี่ยง+ผิดปกติ</text>`;
  if (!D.length) s += `<text x="${W / 2}" y="${H / 2}" font-size="15" fill="${C.muted}" text-anchor="middle">ไม่มีข้อมูล</text>`;
  return { s, h: H };
}
function piece(k, W) {
  if (k === 'kpi') return svgKpi(W);
  if (k === 'zone') return svgTable(secZone(), W);
  if (k === 'dc') return svgTable(secDC(), W);
  if (k === 'plate') return svgTable(secPlate(), W);
  if (k === 'daily') return svgDaily(W);
  if (BW_MET[k]) return svgTable(secBW(k), W);
  return svgTable(secVehicle(), W);
}
const secTitle = k => (XS.secs.find(x => x[0] === k) || [k, k])[1];
function card(k, x, y, W) {
  const p = piece(k, W - 40), h = p.h + 76;
  return { s: `<g transform="translate(${x} ${y})"><rect width="${W}" height="${h}" rx="16" fill="#fff" stroke="${C.line}"/><rect x="${W * .1}" width="${W * .8}" height="4" fill="${C.gold}"/><text x="20" y="40" font-size="21" font-weight="600" fill="${C.ink}">${xe(secTitle(k))}</text><g transform="translate(20 58)">${p.s}</g></g>`, h };
}
function head(W) {
  const lg = XS.logo ? `<rect x="24" y="22" width="190" height="78" rx="12" fill="#fff"/><image href="${XS.logo}" x="34" y="30" width="170" height="62" preserveAspectRatio="xMidYMid meet"/>` : '';
  return `<rect width="${W}" height="124" fill="url(#gN)"/><rect y="121" width="${W}" height="3" fill="${C.gold}"/>${lg}
    <text x="236" y="56" font-size="30" font-weight="600" fill="#fff">NIMEX Fleet Vehicle</text>
    <text x="236" y="86" font-size="18" fill="${C.goldL}">${xe(cut(scopeLine(), 70))}</text>
    <text x="236" y="110" font-size="15" fill="#b9c9e6">${xe(cmpLine())}</text>`;
}
const foot = (W, H) => `<rect y="${H - 40}" width="${W}" height="40" fill="${C.navy}"/><rect y="${H - 40}" width="${W}" height="3" fill="${C.gold}"/><text x="${W / 2}" y="${H - 14}" font-size="14" fill="#b9c9e6" text-anchor="middle">NIMEX Fleet Vehicle Dashboard · สร้างเมื่อ ${xe(new Date().toLocaleString('th-TH'))}</text>`;
const wrap = (W, H, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${XS.font}text{font-family:'Prompt',sans-serif}</style><defs><linearGradient id="gN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.navy2}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="${C.bg}"/>${inner}</svg>`;
function bodyCards(keys, W, m) { let y = 0, b = ''; keys.forEach(k => { const c = card(k, m, y, W - 2 * m); b += c.s; y += c.h + m; }); return { b, h: y }; }
function composeLong(keys) {
  const W = 1240, m = 26, B = bodyCards(keys, W, m), H = 124 + m + B.h + 40;
  return { svg: wrap(W, H, head(W) + `<g transform="translate(0 ${124 + m})">${B.b}</g>` + foot(W, H)), W, H };
}
function composeA4(keys) { /* 1240×1754 แล้วขยาย ×2 = 2480×3508 · ย่อเนื้อหาให้พอดีหน้าเดียว */
  const W = 1240, H = 1754, m = 26, B = bodyCards(keys, W, m), avail = H - 124 - 40 - m, sc = Math.min(1, avail / B.h), off = (W - W * sc) / 2;
  return { svg: wrap(W, H, head(W) + `<g transform="translate(${off} ${124 + m}) scale(${sc})">${B.b}</g>` + foot(W, H)), W, H };
}
function composeSlide(k) {
  const W = 1600, H = 900, c = card(k, 30, 154, W - 60), sc = Math.min(1, (H - 154 - 70) / c.h);
  return { svg: wrap(W, H, head(W) + `<g transform="translate(${(W - W * sc) / 2} ${154 - 154 * sc}) scale(${sc})">${c.s}</g>` + foot(W, H)), W, H };
}
function toPng(c, scale) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(new Blob([c.svg], { type: 'image/svg+xml' })), im = new Image();
    im.onload = () => { const cv = document.createElement('canvas'); cv.width = Math.round(c.W * scale); cv.height = Math.round(c.H * scale); const x = cv.getContext('2d'); x.drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); cv.toBlob(b => b ? res(b) : rej(new Error('สร้างภาพไม่สำเร็จ')), 'image/png'); };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('สร้างภาพไม่สำเร็จ')); };
    im.src = url;
  });
}
function saveBlob(name, blob) {
  if (window.__testSave) return window.__testSave(name, blob);
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function loadLib(src, test) {
  if (test()) return Promise.resolve();
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('โหลดไลบรารีไม่สำเร็จ')); document.head.appendChild(s); });
}

/* ── อินโฟกราฟิก 16:9 (1920×1080 → 3840×2160) — ใช้ตัวกรองบนหน้า ไม่ต้องเลือกหัวข้อ ── */
function zoneBase(range) { /* กราฟราย Zone แสดงครบทุก Zone: ใช้ช่วงเวลา + ชนิดรถ แต่ไม่กรองกลุ่ม/Zone/DC */
  if (!range) return [];
  const veh = document.getElementById('filterVehicle').value;
  return allData.filter(r => r.departDate >= range.start && r.departDate <= range.end && (!veh || r.vehicleType === veh));
}
function axisFor(vals) { /* ค่าอยู่ช่วงแคบ → แกนไม่เริ่มที่ 0 */
  const v = vals.filter(Number.isFinite); if (!v.length) return { lo: 0, hi: 1, note: '' };
  const mn = Math.min(...v), mx = Math.max(...v);
  let lo = 0; if (mn > 0 && (mx - mn) < mx * 0.25) lo = Math.max(0, Math.floor((mn - (mx - mn) * 0.6) / 5) * 5);
  const hi = Math.max(lo + 1, Math.ceil(mx * 1.08));
  return { lo, hi, note: lo > 0 ? `แกนเริ่มที่ ${lo}%` : '' };
}
function panel(x, y, w, h, title, body, note) {
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="16" fill="#fff" stroke="${C.line}"/><rect x="${w * .08}" width="${w * .84}" height="4" fill="${C.gold}"/>
    <text x="22" y="40" font-size="21" font-weight="600" fill="${C.ink}">${xe(title)}</text>${note ? `<text x="${w - 22}" y="40" font-size="13" fill="${C.muted}" text-anchor="end">${xe(note)}</text>` : ''}${body}</g>`;
}
function hbars(items, w, h, fmt, color) { /* [{l, v, sub}] */
  const ax = axisFor(items.map(i => i.v)), lw = 210, bw = w - lw - 150, rh = Math.min(48, (h - 70) / Math.max(1, items.length));
  let s = '';
  items.forEach((it, i) => {
    const y = 64 + i * rh, len = Math.max(0, (it.v - ax.lo) / (ax.hi - ax.lo)) * bw;
    s += `<text x="22" y="${y + rh / 2 + 2}" font-size="16" fill="${C.ink}">${xe(cut(it.l, 22))}</text><text x="22" y="${y + rh / 2 + 19}" font-size="12.5" fill="${C.muted}">${xe(it.sub || '')}</text>
      <rect x="${lw}" y="${y + rh * .2}" width="${bw}" height="${rh * .5}" rx="6" fill="${C.line}" opacity=".55"/><rect x="${lw}" y="${y + rh * .2}" width="${len}" height="${rh * .5}" rx="6" fill="${color}"/>
      <text x="${lw + bw + 12}" y="${y + rh * .45 + 6}" font-size="17" font-weight="600" fill="${C.ink}">${xe(fmt(it.v))}</text>`;
  });
  return { s, note: ax.note };
}
function vpairs(cats, A, B, w, h, la, lb, ca, cb, fmt) { /* แท่งคู่แนวตั้ง */
  const m = { l: 56, r: 16, t: 70, b: 70 }, iw = w - m.l - m.r, ih = h - m.t - m.b, ax = axisFor([...A, ...B]), gw = iw / Math.max(1, cats.length);
  let s = '';
  [0, .5, 1].forEach(f => { const y = m.t + ih * (1 - f), v = ax.lo + (ax.hi - ax.lo) * f; s += `<line x1="${m.l}" x2="${w - m.r}" y1="${y}" y2="${y}" stroke="${C.line}"/><text x="${m.l - 8}" y="${y + 5}" font-size="13" fill="${C.muted}" text-anchor="end">${fmt(v)}</text>`; });
  cats.forEach((c, i) => {
    const x = m.l + i * gw, bw = gw * .34;
    [[A[i], ca, x + gw * .14], [B[i], cb, x + gw * .52]].forEach(([v, col, bx]) => {
      if (!Number.isFinite(v)) return; const hh = Math.max(0, (v - ax.lo) / (ax.hi - ax.lo)) * ih;
      s += `<rect x="${bx}" y="${m.t + ih - hh}" width="${bw}" height="${hh}" rx="4" fill="${col}"/>`;
    });
    s += `<text x="${x + gw / 2}" y="${h - m.b + 22}" font-size="13" fill="${C.ink}" text-anchor="middle">${xe(cut(c, 9))}</text>`;
  });
  s += `<rect x="${m.l}" y="${h - 26}" width="14" height="12" fill="${ca}"/><text x="${m.l + 20}" y="${h - 15}" font-size="14" fill="${C.ink}">${xe(la)}</text><rect x="${m.l + 230}" y="${h - 26}" width="14" height="12" fill="${cb}"/><text x="${m.l + 250}" y="${h - 15}" font-size="14" fill="${C.ink}">${xe(lb)}</text>`;
  return { s, note: ax.note };
}
function donut(parts, cx, cy, r) {
  const tot = parts.reduce((a, p) => a + p.v, 0) || 1; let a0 = -Math.PI / 2, s = '';
  parts.forEach(p => {
    const a1 = a0 + p.v / tot * Math.PI * 2, large = a1 - a0 > Math.PI ? 1 : 0;
    if (p.v > 0) s += `<path d="M${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1 - 1e-6)} ${cy + r * Math.sin(a1 - 1e-6)}" stroke="${p.c}" stroke-width="${r * .42}" fill="none"/>`;
    a0 = a1;
  });
  return s;
}
function compose169() {
  const W = 1920, H = 1080, K = secKpi(), cw = (W - 60 - 5 * 16) / 6;
  let s = head(W);
  K.forEach((k, i) => {
    const x = 30 + i * (cw + 16), y = 144, dc = /ไม่มี/.test(k.d) ? C.muted : k.bad ? C.red : k.good ? C.green : C.navy;
    s += `<g transform="translate(${x} ${y})"><rect width="${cw}" height="150" rx="16" fill="url(#gN)"/><rect y="145" width="${cw}" height="5" fill="${C.gold}"/>
      <text x="18" y="34" font-size="18" fill="${C.goldL}" font-weight="500">${xe(k.l)}</text>
      <text x="18" y="88" font-size="40" fill="#fff" font-weight="600">${xe(k.v)}</text><text x="18" y="114" font-size="14" fill="#b9c9e6">${xe(k.u)}</text>
      <rect x="14" y="120" width="${cw - 28}" height="22" rx="11" fill="#fff" opacity=".94"/><text x="${cw / 2}" y="136" font-size="${/ไม่มี/.test(k.d) ? 12 : 14}" fill="${dc}" text-anchor="middle" font-weight="600">${xe(k.d)}</text></g>`;
  });
  const pw = (W - 60 - 20) / 2, ph = (H - 144 - 150 - 24 - 20 - 56) / 2, py1 = 144 + 150 + 24, py2 = py1 + ph + 20;
  /* 1) แยกประเภทการปล่อยรถ (ตามตัวกรอง) */
  const rel = [...byKey(filteredData, r => r.releaseType)].map(([k, a]) => { const S = xStats(a); return { l: k.replace(/^\d+\s+/, ''), v: S.riskP + S.abnP, sub: `${S.n.toLocaleString()} เที่ยว · ${new Set(a.map(r => r.plate)).size.toLocaleString()} คัน` }; }).sort((a, b) => b.v - a.v);
  const h1 = hbars(rel, pw, ph, v => v.toFixed(1) + '%', C.red);
  s += panel(30, py1, pw, ph, '% เสี่ยง+ผิดปกติ แยกประเภทการปล่อยรถ', h1.s, h1.note);
  /* 2) ราย Zone: ช่วงนี้ vs ช่วงก่อน (ครบทุก Zone) */
  const ci = compareInfo, zc = byKey(zoneBase(ci && ci.cur), r => dcZone(r.dc)), zp = byKey(zoneBase(ci && ci.has ? ci.prev : null), r => dcZone(r.dc));
  const zs = ZONE_ORDER.filter(z => zc.has(z));
  const bad = (m, z) => m.has(z) ? (S => S.riskP + S.abnP)(xStats(m.get(z))) : NaN;
  const p2 = vpairs(zs, zs.map(z => bad(zc, z)), zs.map(z => bad(zp, z)), pw, ph, 'ช่วงนี้', ci && ci.has ? 'ช่วงก่อนหน้า' : 'ไม่มีช่วงก่อนหน้า', C.navy, C.goldL, v => Math.round(v) + '%');
  s += panel(30 + pw + 20, py1, pw, ph, '% เสี่ยง+ผิดปกติ ราย Zone — เทียบช่วงก่อน', p2.s, p2.note);
  /* 3) ราย Zone: % เสี่ยง vs % ผิดปกติ */
  const p3 = vpairs(zs, zs.map(z => xStats(zc.get(z)).riskP), zs.map(z => xStats(zc.get(z)).abnP), pw, ph, '% มีความเสี่ยง', '% ผิดปกติ', C.amber, C.red, v => Math.round(v) + '%');
  s += panel(30, py2, pw, ph, 'ราย Zone: % มีความเสี่ยง และ % ผิดปกติ', p3.s, p3.note);
  /* 4) โดนัทสัดส่วนสถานะ + DC แย่สุด 3 */
  const S = xStats(filteredData), nN = S.n - S.risk - S.abn, cx = 190, cy = ph / 2 + 6, r = Math.min(105, ph / 2 - 70);
  let b4 = donut([{ v: nN, c: C.blue }, { v: S.risk, c: C.amber }, { v: S.abn, c: C.red }], cx, cy, r) +
    `<text x="${cx}" y="${cy + 4}" font-size="30" font-weight="600" fill="${C.ink}" text-anchor="middle">${S.normP.toFixed(1)}%</text><text x="${cx}" y="${cy + 28}" font-size="14" fill="${C.muted}" text-anchor="middle">ปกติ</text>`;
  [['ปกติ', nN, C.blue], ['มีความเสี่ยง', S.risk, C.amber], ['ผิดปกติ', S.abn, C.red]].forEach(([l, v, c], i) => { b4 += `<rect x="${cx - 130 + i * 92}" y="${ph - 34}" width="12" height="12" fill="${c}"/><text x="${cx - 112 + i * 92}" y="${ph - 24}" font-size="13" fill="${C.ink}">${l}</text>`; });
  const worst = rankAll('bw_bad', 'DC').slice(-3).reverse();
  b4 += `<text x="390" y="88" font-size="17" font-weight="600" fill="${C.ink}">DC แย่สุด 3 อันดับ (% เสี่ยง+ผิดปกติ)</text>`;
  worst.forEach((o, i) => { const y = 124 + i * 62; b4 += `<rect x="390" y="${y}" width="${pw - 420}" height="50" rx="10" fill="#fdf1f3"/><text x="406" y="${y + 32}" font-size="20" font-weight="600" fill="${C.red}">${i + 1}</text><text x="436" y="${y + 23}" font-size="16" font-weight="600" fill="${C.ink}">${xe(cut(dcName(o.key), 24))}</text><text x="436" y="${y + 42}" font-size="13" fill="${C.muted}">${xe(dcZone(o.key))} · ${o.S.n.toLocaleString()} เที่ยว</text><text x="${pw - 46}" y="${y + 32}" font-size="20" font-weight="600" fill="${C.red}" text-anchor="end">${o.v.toFixed(1)}%</text>`; });
  if (!worst.length) b4 += `<text x="390" y="130" font-size="15" fill="${C.muted}">ไม่มี DC ที่มีอย่างน้อย 20 เที่ยว</text>`;
  s += panel(30 + pw + 20, py2, pw, ph, 'สัดส่วนสถานะเที่ยววิ่ง', b4, '');
  /* ท้าย: หมายเหตุสูตร */
  s += `<rect y="${H - 56}" width="${W}" height="56" fill="${C.navy}"/><rect y="${H - 56}" width="${W}" height="3" fill="${C.gold}"/>
    <text x="30" y="${H - 22}" font-size="14" fill="#b9c9e6">สูตร: ส่วนต่างไมล์ = ไมล์ออกแรกสุดของวัน − ไมล์เข้าสูงสุดของวันก่อน · ติดลบ = ผิดปกติ · 1–10 กม. = เสี่ยง (ทะเบียนยกเว้น = ปกติ) · เทียบช่วงก่อนด้วยวันทำงาน จ.–ส. เท่ากัน · Zone แสดงครบทุก Zone</text>
    <text x="${W - 30}" y="${H - 22}" font-size="14" fill="#b9c9e6" text-anchor="end">${xe(new Date().toLocaleString('th-TH'))}</text>`;
  return { svg: wrap(W, H, s), W, H };
}
async function x169() { await assets(); saveBlob(stamp() + '-16x9.png', await toPng(compose169(), 2)); }

/* ── ส่งออก ── */
const keysPicked = () => XS.secs.map(s => s[0]).filter(k => XS.picked.has(k));
function xMsg(t) { const m = document.getElementById('xMsg'); if (m) m.textContent = t; }
async function run(fn, label) {
  if (!keysPicked().length) { xMsg('เลือกอย่างน้อย 1 หัวข้อ'); return; }
  xMsg('⏳ กำลังสร้าง' + label + '…');
  try { await fn(); xMsg('✅ ดาวน์โหลด' + label + 'แล้ว'); } catch (e) { xMsg('❌ ' + e.message); }
}
async function xPngLong() { await assets(); saveBlob(stamp() + '.png', await toPng(composeLong(keysPicked()), 1.5)); }
async function xA4() { await assets(); saveBlob(stamp() + '-A4.png', await toPng(composeA4(keysPicked()), 2)); }
async function xPptx() {
  await assets();
  await loadLib('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', () => !!window.PptxGenJS);
  const pp = new PptxGenJS(); pp.layout = 'LAYOUT_16x9'; pp.title = 'NIMEX Fleet Vehicle';
  const t = pp.addSlide(); t.background = { color: '0A2A5E' };
  if (XS.logo) t.addShape(pp.ShapeType.roundRect, { x: .6, y: .6, w: 2.4, h: 1, fill: { color: 'FFFFFF' }, rectRadius: .12 }), t.addImage({ data: XS.logo, x: .7, y: .65, w: 2.2, h: .9, sizing: { type: 'contain', w: 2.2, h: .9 } });
  t.addText('NIMEX Fleet Vehicle', { x: .6, y: 2.2, w: 9, h: .8, fontSize: 36, bold: true, color: 'FFFFFF', fontFace: 'Prompt' });
  t.addText(scopeLine(), { x: .6, y: 3.0, w: 9, h: .5, fontSize: 18, color: 'F0D57A', fontFace: 'Prompt' });
  t.addText(cmpLine(), { x: .6, y: 3.5, w: 9, h: .5, fontSize: 14, color: 'B9C9E6', fontFace: 'Prompt' });
  for (const k of keysPicked()) {
    const b = await toPng(composeSlide(k), 1.2);
    const data = await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); });
    pp.addSlide().addImage({ data, x: 0, y: 0, w: 10, h: 5.625 });
  }
  const blob = await pp.write({ outputType: 'blob' });
  saveBlob(stamp() + '.pptx', blob);
}
function xExcel() {
  const wb = XLSX.utils.book_new(), add = (name, aoa) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), name.slice(0, 31));
  add('สรุป', [['NIMEX Fleet Vehicle'], [scopeLine()], [cmpLine()], [], ['หัวข้อ', 'ค่า', 'หน่วย', 'เทียบช่วงก่อน'], ...secKpi().map(k => [k.l, k.v, k.u, k.d])]);
  const T = (name, t) => add(name, [t.cols.map(c => c[0]), ...t.rows]);
  for (const k of keysPicked()) {
    if (k === 'zone') T('Zone', secZone());
    else if (k === 'dc') T('DC เสี่ยงสูงสุด', secDC());
    else if (k === 'plate') T('ทะเบียนเสี่ยงสูงสุด', secPlate());
    else if (k === 'daily') add('รายวัน', [['วันที่', 'เที่ยว', 'เสี่ยง+ผิดปกติ'], ...secDaily().map(d => [d.d, d.n, d.bad])]);
    else if (k === 'vehicle') T('ชนิดรถ', secVehicle());
    else if (BW_MET[k]) {
      const out = [['ระดับ', 'อันดับ (ต่ำ=ดี)', 'ชื่อ', 'Zone', 'เที่ยว', BW_MET[k][0], 'ป้าย']];
      [['DC', 5], ['Zone', 3]].forEach(([lv, w]) => {
        const all = rankAll(k, lv), p = pickBW(all, w), b = new Set(p.best.map(o => o.key)), wv = new Set(p.worst.map(o => o.key));
        all.forEach((o, i) => out.push([lv, i + 1, lv === 'DC' ? dcName(o.key) : o.key, lv === 'DC' ? dcZone(o.key) : '', o.S.n, +o.v.toFixed(2), b.has(o.key) ? 'ดีสุด' : wv.has(o.key) ? 'แย่สุด' : '']));
      });
      add(('ดี-แย่ ' + BW_MET[k][0].replace('% ', '')).replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31), out);
    }
  }
  add('เที่ยววิ่ง', [['เลขที่ใบรายการ', 'วันที่ปล่อย', 'วันที่รับ', 'ทะเบียน', 'ชนิดรถ', 'ประเภทปล่อย', 'DC', 'Zone', 'กลุ่ม', 'ไมล์ออก', 'ไมล์เข้า', 'ระยะทาง', 'ส่วนต่างไมล์', 'สถานะรับรถ', 'ประเภทเที่ยว'],
    ...filteredData.map(r => [r.tripId, r.departDate, r.returnDate, r.plate, r.vehicleType, r.releaseType, r.dc, dcZone(r.dc), dcGroup(r.dc), r.mileOut, r.mileIn, Math.round(r.distance), r.mileDiff, r.dayStatus, r.tripStatus])]);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array', compression: true });
  saveBlob(stamp() + '.xlsx', new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}
function lineText() {
  const K = secKpi(), num = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'], L = ['🚐 NIMEX Fleet Vehicle', `🗓️ ${scopeLine()}`, `↔️ ${cmpLine()}`, ''];
  L.push('📊 KPI'); K.forEach(k => L.push(`${k.bad ? '⚠️' : '✅'} ${k.l}: ${k.v} ${k.u.includes('เที่ยว') && k.v.includes('%') ? '(' + k.u + ')' : k.u} ${k.d !== '–' ? '[' + k.d + ']' : ''}`.trim()));
  const z = secZone(); if (keysPicked().includes('zone') && z.rows.length) { L.push('', '🗺️ ราย Zone (เสี่ยง / ผิดปกติ)'); z.rows.forEach(r => L.push(`• ${r[0]}: ${r[2].toLocaleString()} เที่ยว · ${r[4]} / ${r[5]}`)); }
  const d = secDC(); if (keysPicked().includes('dc') && d.rows.length) { L.push('', '⚠️ DC เสี่ยง+ผิดปกติสูงสุด'); d.rows.slice(0, 5).forEach((r, i) => L.push(`${num[i]} ${r[1]} (${r[2]}) ${r[6]}`)); }
  const p = secPlate(); if (keysPicked().includes('plate') && p.rows.length) { L.push('', '🔑 ทะเบียนที่ควรตรวจ'); p.rows.slice(0, 5).forEach((r, i) => L.push(`${num[i]} ${r[1]} · ${r[2]} · เสี่ยง ${r[4]} / ผิดปกติ ${r[5]}`)); }
  L.push('', '🔗 ' + location.origin + location.pathname + location.search);
  return L.join('\n');
}
async function xText() {
  const t = lineText(), box = document.getElementById('xText'); if (box) { box.value = t; box.hidden = false; }
  try { await navigator.clipboard.writeText(t); xMsg('✅ คัดลอกข้อความแล้ว วางใน LINE / อีเมลได้เลย'); } catch (e) { xMsg('คัดลอกอัตโนมัติไม่ได้ — กดค้างที่ข้อความด้านล่างเพื่อคัดลอก'); }
}

/* ── หน้าต่างแชร์และส่งออก ── */
function openExport() {
  closePops();
  let ov = document.getElementById('xOv');
  if (!ov) { ov = document.createElement('div'); ov.id = 'xOv'; ov.className = 'modal-overlay'; document.body.appendChild(ov); ov.addEventListener('click', e => { if (e.target === ov) closeExport(); }); }
  ov.innerHTML = `<div class="modal x-modal" role="dialog" aria-modal="true" aria-labelledby="xTitle">
    <h3 id="xTitle">📤 แชร์และส่งออก</h3>
    <p class="muted" style="font-size:12.5px;margin:2px 0 10px">${xe(scopeLine())}<br>${xe(cmpLine())}</p>
    <fieldset class="x-secs"><legend>เลือกหัวข้อ</legend>${XS.secs.map(([k, l]) => `<label><input type="checkbox" data-sec="${k}" ${XS.picked.has(k) ? 'checked' : ''}> ${xe(l)}</label>`).join('')}</fieldset>
    <div class="x-btns">
      <button type="button" data-x="excel">📊 Excel<small>หนึ่งชีตต่อหัวข้อ + รายการเที่ยว</small></button>
      <button type="button" data-x="pptx">📑 PowerPoint<small>16:9 หนึ่งสไลด์ต่อหัวข้อ</small></button>
      <button type="button" data-x="png">🖼️ รูปยาว PNG<small>ทุกหัวข้อต่อกัน</small></button>
      <button type="button" data-x="a4">📄 อินโฟกราฟิก A4<small>2480×3508 พิมพ์ได้</small></button>
      <button type="button" data-x="i169">🖥️ อินโฟกราฟิก 16:9<small>3840×2160 · ใช้ตัวกรองบนหน้า ไม่ต้องเลือกหัวข้อ</small></button>
      <button type="button" data-x="text">💬 ข้อความ LINE<small>คัดลอกสรุปพร้อมอีโมจิ</small></button>
      <button type="button" data-x="link">🔗 ลิงก์ผู้ชม<small>เปิดด้วยตัวกรองเดียวกัน</small></button>
    </div>
    <p id="xMsg" role="status" style="font-size:13px;min-height:20px;margin-top:8px"></p>
    <textarea id="xText" hidden readonly rows="8" style="width:100%;font:13px var(--font-main);padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text)"></textarea>
    <div class="modal-actions"><button class="action-btn" type="button" onclick="closeExport()">ปิด</button></div></div>`;
  ov.classList.add('open');
  ov.querySelector('[data-x="excel"]').focus();
}
function closeExport() { const ov = document.getElementById('xOv'); if (ov) ov.classList.remove('open'); }
document.addEventListener('change', e => { const c = e.target.closest && e.target.closest('[data-sec]'); if (c) { c.checked ? XS.picked.add(c.dataset.sec) : XS.picked.delete(c.dataset.sec); } });
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('#xOv [data-x]'); if (!b) return;
  const x = b.dataset.x;
  if (x === 'excel') run(async () => xExcel(), ' Excel ');
  else if (x === 'pptx') run(xPptx, ' PowerPoint ');
  else if (x === 'png') run(xPngLong, 'รูป PNG ');
  else if (x === 'a4') run(xA4, 'อินโฟกราฟิก A4 ');
  else if (x === 'i169') { xMsg('⏳ กำลังสร้างอินโฟกราฟิก 16:9…'); x169().then(() => xMsg('✅ ดาวน์โหลดอินโฟกราฟิก 16:9 แล้ว'), e => xMsg('❌ ' + e.message)); }
  else if (x === 'text') xText();
  else if (x === 'link') { const url = location.origin + location.pathname + location.search; navigator.clipboard ? navigator.clipboard.writeText(url).then(() => xMsg('✅ คัดลอกลิงก์แล้ว'), () => xMsg(url)) : xMsg(url); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeExport(); });
