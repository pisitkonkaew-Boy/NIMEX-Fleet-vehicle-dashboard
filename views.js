/* NIMEX Fleet Vehicle — หน้าวิเคราะห์ / รายการ / ตั้งค่า + คลิกกราฟเพื่อเปิดวันนั้น
   ใช้ตัวแปรกลางจาก index.html: allData, filteredData, compareInfo, settings, thresholds, dcZone, dcGroup, dcName ฯลฯ */
'use strict';
const escH = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf0 = v => Number.isFinite(v) ? Math.round(v).toLocaleString('th-TH') : '—';
const nf1 = v => Number.isFinite(v) ? v.toFixed(1) : '—';

/* ═══ คลิกจุดบนกราฟรายวัน → เปิดวันนั้น (โหมดวัน) ═══ */
function openPeriod(date) {
  if (!date) return;
  fMode = 'day'; fPeriod = date;
  populateSlicers(); applyFilters(); setView('executive');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
if (window.Chart) {
  Chart.defaults.onClick = (e, els, chart) => {
    if (chart.$dates && els && els.length) { const d = chart.$dates[els[0].index]; setTimeout(() => openPeriod(d), 0); }
  };
  Chart.defaults.onHover = (e, els, chart) => {
    if (chart.$dates && e.native && e.native.target) e.native.target.style.cursor = els.length ? 'pointer' : 'default';
  };
}

/* ═══ หน้าวิเคราะห์: เลือกมิติ × ตัวชี้วัด เรียงแย่สุดก่อน ═══ */
const AN_DIMS = {
  zone:    { l: 'Zone',             k: r => dcZone(r.dc) },
  dc:      { l: 'DC',               k: r => r.dc },
  plate:   { l: 'ทะเบียนรถ',        k: r => r.plate },
  vehicle: { l: 'ชนิดรถ',           k: r => r.vehicleType },
  release: { l: 'ประเภทการปล่อยรถ', k: r => r.releaseType },
  route:   { l: 'เส้นทาง',          k: r => r.route || '(ไม่ระบุเส้นทาง)' },
};
const rateOf = (a, f) => a.length ? a.filter(f).length / a.length * 100 : NaN;
const sumD = a => a.reduce((s, r) => s + (r.distance || 0), 0);
const AN_METS = {
  bad:   { l: '% เสี่ยง+ผิดปกติ', rate: 1, f: a => rateOf(a, r => r.tripStatus !== 'เที่ยววิ่งปกติ') },
  abn:   { l: '% ผิดปกติ',        rate: 1, f: a => rateOf(a, r => r.tripStatus === 'เที่ยววิ่งผิดปกติ') },
  risk:  { l: '% มีความเสี่ยง',   rate: 1, f: a => rateOf(a, r => r.tripStatus === 'เที่ยววิ่งมีความเสี่ยง') },
  cross: { l: '% รับรถข้ามวัน',   rate: 1, f: a => rateOf(a, r => r.dayStatus === 'รับรถข้ามวัน') },
  avg:   { l: 'กม./เที่ยว',              f: a => a.length ? sumD(a) / a.length : NaN },
  trips: { l: 'จำนวนเที่ยว',             f: a => a.length },
  dist:  { l: 'ระยะทางรวม (กม.)',        f: a => sumD(a) },
};
const AN = { dim: 'dc', met: 'bad', min: 20, q: '' };
function groupRows(arr, kf) { const m = new Map(); arr.forEach(r => { const k = kf(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }); return m; }
function topOf(arr, kf) { const c = {}; arr.forEach(r => { const k = kf(r); c[k] = (c[k] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || ''; }
function contextOf(dim, key, rows) {
  if (dim === 'zone') return key === 'BKK' ? 'กลุ่ม BKK' : 'กลุ่ม UPC';
  if (dim === 'dc') return dcZone(key);
  if (dim === 'plate' || dim === 'route') { const dc = topOf(rows, r => r.dc); return `${dcName(dc)} · ${dcZone(dc)}`; }
  return '—';
}
function analysisRows() {
  const D = AN_DIMS[AN.dim], M = AN_METS[AN.met];
  const cur = groupRows(filteredData, D.k);
  const prev = compareInfo && compareInfo.has ? groupRows(compareInfo.prevData, D.k) : null;
  const out = [];
  cur.forEach((rows, key) => {
    if (M.rate && rows.length < AN.min) return;
    const v = M.f(rows), p = prev && prev.get(key) ? M.f(prev.get(key)) : NaN;
    out.push({ key, rows, n: rows.length, v, p, ctx: contextOf(AN.dim, key, rows) });
  });
  return out.sort((a, b) => (b.v - a.v) || (b.n - a.n));
}
function anDelta(v, p) {
  const M = AN_METS[AN.met];
  if (!Number.isFinite(p)) return '<span class="mom-badge mom-same">—</span>';
  if (M.rate) {
    const d = v - p; if (Math.abs(d) < 0.05) return '<span class="mom-badge mom-same">— 0 pp</span>';
    return `<span class="mom-badge ${d > 0 ? 'mom-down' : 'mom-up'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(1)} pp</span>`;
  }
  if (!p) return '<span class="mom-badge mom-same">ใหม่</span>';
  const d = (v - p) / p * 100; if (Math.abs(d) < 0.05) return '<span class="mom-badge mom-same">— 0%</span>';
  return `<span class="mom-badge mom-up">${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(1)}%</span>`;
}
function renderAnalysis() {
  const box = document.getElementById('anTable'); if (!box) return;
  const M = AN_METS[AN.met], D = AN_DIMS[AN.dim];
  document.getElementById('anMinWrap').style.display = M.rate ? '' : 'none';
  let rows = analysisRows();
  const total = rows.length;
  if (AN.q) { const q = AN.q.toLowerCase(); rows = rows.filter(r => (String(r.key) + ' ' + r.ctx).toLowerCase().includes(q)); }
  const shown = rows.slice(0, 100), mx = Math.max(1e-9, ...shown.map(r => r.v || 0));
  const fmtV = v => M.rate ? nf1(v) + '%' : AN.met === 'avg' ? nf1(v) : nf0(v);
  const drill = ['dc', 'plate', 'vehicle', 'zone'].includes(AN.dim);
  const gCol = (settings.grades || []).some(g => g.metric === AN.met);
  document.getElementById('anInfo').textContent =
    `${D.l} ${total.toLocaleString()} รายการ${M.rate ? ` (อย่างน้อย ${AN.min} เที่ยว)` : ''} · เรียงจาก${M.rate ? 'อัตราสูงสุด' : 'มากสุด'}` +
    (rows.length > 100 ? ` · แสดง 100 อันดับแรก` : '') + (drill ? ' · คลิกแถวเพื่อดูรายละเอียด' : '');
  box.innerHTML = !shown.length ? '<div class="an-empty">ไม่มีรายการที่ตรงเงื่อนไข — ลองลดจำนวนเที่ยวขั้นต่ำ หรือเปลี่ยนช่วงเวลา</div>' :
    `<table class="an-t"><thead><tr><th>#</th><th>${escH(D.l)}</th><th>${AN.dim === 'zone' ? 'กลุ่ม' : 'Zone / DC'}</th><th class="r">เที่ยว</th><th class="r">${escH(M.l)}</th>${gCol ? '<th>เกรด</th>' : ''}<th class="r">เทียบช่วงก่อน</th><th style="width:22%"></th></tr></thead><tbody>` +
    shown.map((r, i) => `<tr${drill ? ` class="click" tabindex="0" data-k="${escH(r.key)}"` : ''}><td>${i + 1}</td><td><b>${escH(AN.dim === 'dc' ? dcName(r.key) : r.key)}</b></td><td class="muted">${escH(r.ctx)}</td><td class="r">${nf0(r.n)}</td><td class="r"><b>${fmtV(r.v)}</b></td>${gCol ? `<td><span class="gr-badge">${escH(gradeOf(AN.met, r.v))}</span></td>` : ''}<td class="r">${anDelta(r.v, r.p)}</td><td><div class="an-bar"><i style="width:${Math.max(0, Math.min(100, (r.v || 0) / mx * 100))}%;background:${M.rate ? '#b8334a' : '#1d57b8'}"></i></div></td></tr>`).join('') +
    '</tbody></table>';
}
function anOpen(key) {
  if (AN.dim === 'dc') openDrill('dc', key);
  else if (AN.dim === 'plate') openDrill('plate', key);
  else if (AN.dim === 'vehicle') openDrill('vehicleType', key);
  else if (AN.dim === 'zone') {
    fGroup = ''; document.getElementById('filterDC').value = ''; populateSlicers();
    document.getElementById('filterZone').value = key; populateSlicers(); applyFilters(); setView('executive');
  }
}
document.addEventListener('click', e => { const tr = e.target.closest('#anTable tr.click'); if (tr) anOpen(tr.dataset.k); });
document.addEventListener('keydown', e => { if (e.key === 'Enter') { const tr = e.target.closest && e.target.closest('#anTable tr.click'); if (tr) anOpen(tr.dataset.k); } });

/* ═══ เกรด: ผู้ดูแลกำหนดเอง — ชุดละ 1 ตัวชี้วัด, แต่ละขั้น = ชื่อเกรด + ค่าเกณฑ์, เกินทุกขั้น = เกรดสุดท้าย ═══ */
const GRADE_METS = {
  bad:    { l: '% เสี่ยง+ผิดปกติ', low: true },
  abn:    { l: '% ผิดปกติ',        low: true },
  risk:   { l: '% มีความเสี่ยง',   low: true },
  cross:  { l: '% รับรถข้ามวัน',   low: true },
  normal: { l: '% เที่ยววิ่งปกติ', low: false },
};
function gradeOf(metric, v) {
  const g = (settings.grades || []).find(x => x.metric === metric), M = GRADE_METS[metric];
  if (!g || !M || !Number.isFinite(v)) return '';
  const bands = (g.bands || []).filter(b => b.g && Number.isFinite(+b.v)).map(b => ({ g: b.g, v: +b.v })).sort((a, b) => M.low ? a.v - b.v : b.v - a.v);
  if (!bands.length) return '';
  const hit = bands.find(b => M.low ? v <= b.v : v >= b.v);
  return hit ? hit.g : (g.else || 'F');
}
function metricValue(metric, arr) {
  const n = arr.length; if (!n) return NaN;
  const c = f => arr.filter(f).length / n * 100;
  if (metric === 'bad') return c(r => r.tripStatus !== 'เที่ยววิ่งปกติ');
  if (metric === 'abn') return c(r => r.tripStatus === 'เที่ยววิ่งผิดปกติ');
  if (metric === 'risk') return c(r => r.tripStatus === 'เที่ยววิ่งมีความเสี่ยง');
  if (metric === 'cross') return c(r => r.dayStatus === 'รับรถข้ามวัน');
  return c(r => r.tripStatus === 'เที่ยววิ่งปกติ');
}
let GR_DRAFT = null;
function renderGrades() {
  const box = document.getElementById('gradeEd'); if (!box) return;
  if (!GR_DRAFT) GR_DRAFT = JSON.parse(JSON.stringify(settings.grades || []));
  const used = new Set(GR_DRAFT.map(g => g.metric)), free = Object.keys(GRADE_METS).filter(k => !used.has(k));
  box.innerHTML = (GR_DRAFT.length ? '' : '<p class="muted" style="font-size:13px;margin-bottom:10px">ยังไม่มีเกณฑ์เกรด — เลือกตัวชี้วัดแล้วกด "เพิ่มชุดเกรด"</p>') +
    GR_DRAFT.map((g, i) => { const M = GRADE_METS[g.metric], cur = metricValue(g.metric, filteredData);
      return `<div class="gr-set"><div class="gr-h"><b>${escH(M.l)}</b><span class="muted">${M.low ? 'ต่ำ = ดี: ได้เกรดแรกที่ค่า ≤ เกณฑ์' : 'สูง = ดี: ได้เกรดแรกที่ค่า ≥ เกณฑ์'} · ช่วงที่เลือกตอนนี้ ${nf1(cur)}% → <b>${escH(gradeOf(g.metric, cur) || '—')}</b></span>
        <button type="button" class="action-btn danger" onclick="grDelSet(${i})">ลบชุดนี้</button></div>
        <table class="an-t" style="max-width:520px"><thead><tr><th>เกรด</th><th>${M.low ? 'ไม่เกิน' : 'อย่างน้อย'} (%)</th><th></th></tr></thead><tbody>` +
        (g.bands || []).map((b, j) => `<tr><td><input class="threshold-input gr-in" data-i="${i}" data-j="${j}" data-k="g" value="${escH(b.g)}" maxlength="6" aria-label="ชื่อเกรด" style="width:80px"></td><td><input class="threshold-input gr-in" data-i="${i}" data-j="${j}" data-k="v" type="number" step="0.1" value="${escH(b.v)}" aria-label="ค่าเกณฑ์" style="width:110px"></td><td><button type="button" class="action-btn" onclick="grDelBand(${i},${j})" aria-label="ลบขั้นนี้">✕</button></td></tr>`).join('') +
        `<tr><td colspan="3"><button type="button" class="action-btn" onclick="grAddBand(${i})">+ เพิ่มเกรด</button></td></tr>
        <tr><td>เกินทุกเกณฑ์ =</td><td><input class="threshold-input gr-in" data-i="${i}" data-k="else" value="${escH(g.else || 'F')}" maxlength="6" aria-label="เกรดเมื่อเกินทุกเกณฑ์" style="width:80px"></td><td></td></tr></tbody></table></div>`; }).join('') +
    (free.length ? `<div class="gr-add"><select id="grMet" aria-label="ตัวชี้วัดสำหรับเกรด">${free.map(k => `<option value="${k}">${escH(GRADE_METS[k].l)}</option>`).join('')}</select><button type="button" class="action-btn" onclick="grAddSet()">+ เพิ่มชุดเกรด</button></div>` : '') +
    `<div class="gr-save"><button type="button" class="threshold-save" onclick="grSave()">💾 บันทึกเกณฑ์เกรด</button><button type="button" class="action-btn" onclick="GR_DRAFT=null;renderGrades()">ยกเลิกการแก้ไข</button><span id="grSaved" style="font-size:12px;color:var(--muted)"></span></div>`;
}
function grAddSet() { const m = document.getElementById('grMet').value; GR_DRAFT.push({ metric: m, bands: [{ g: 'A', v: '' }], else: 'F' }); renderGrades(); }
function grDelSet(i) { if (confirmSafe('ลบชุดเกรด ' + GRADE_METS[GR_DRAFT[i].metric].l + '?')) { GR_DRAFT.splice(i, 1); renderGrades(); } }
function grAddBand(i) { const b = GR_DRAFT[i].bands; const n = String.fromCharCode(65 + Math.min(b.length, 25)); b.push({ g: n, v: '' }); renderGrades(); }
function grDelBand(i, j) { GR_DRAFT[i].bands.splice(j, 1); renderGrades(); }
function confirmSafe(t) { try { return window.confirm(t); } catch (e) { return true; } }
document.addEventListener('input', e => {
  const t = e.target.closest && e.target.closest('.gr-in'); if (!t || !GR_DRAFT) return;
  const g = GR_DRAFT[+t.dataset.i]; if (!g) return;
  if (t.dataset.k === 'else') g.else = t.value.trim(); else g.bands[+t.dataset.j][t.dataset.k] = t.dataset.k === 'v' ? (t.value === '' ? '' : +t.value) : t.value.trim();
});
function grSave() {
  const bad = [];
  GR_DRAFT.forEach(g => { g.bands = (g.bands || []).filter(b => b.g !== '' || b.v !== ''); g.bands.forEach(b => { if (!b.g || b.v === '' || !Number.isFinite(+b.v)) bad.push(GRADE_METS[g.metric].l); }); });
  const msg = document.getElementById('grSaved');
  if (bad.length) { msg.textContent = '⚠️ กรอกชื่อเกรดและค่าเกณฑ์ให้ครบ: ' + [...new Set(bad)].join(', '); msg.style.color = 'var(--red)'; return; }
  settings.grades = JSON.parse(JSON.stringify(GR_DRAFT)); GR_DRAFT = null; renderGrades(); renderAll();
  persistSettings('grSaved');
}

/* ═══ หน้าตั้งค่า (ผู้ดูแล): การ์ดสรุป → เปิดทีละหัวข้อ ═══ */
let SET_OPEN = '';
function exemptImpact() { /* เที่ยวที่ส่วนต่างไมล์ข้ามวัน 1–10 กม. (จะเป็นปกติถ้ายกเว้น) ต่อทะเบียน — นับทั้งข้อมูล */
  const m = new Map();
  allData.forEach(r => {
    let o = m.get(r.plate); if (!o) { o = { plate: r.plate, n: 0, hit: 0, dcs: {} }; m.set(r.plate, o); }
    o.n++; o.dcs[r.dc] = (o.dcs[r.dc] || 0) + 1;
    if (r.mileDiff > 0 && r.mileDiff <= 10) o.hit++;
  });
  return [...m.values()].map(o => ({ ...o, dc: Object.entries(o.dcs).sort((a, b) => b[1] - a[1])[0]?.[0] || '' }));
}
function setCard(id, icon, title, lines, btn = 'ตั้งค่า ›') {
  return `<div class="set-card"><div class="set-ic">${icon}</div><div class="set-b"><h3>${title}</h3>${lines.map(l => `<p>${l}</p>`).join('')}</div><button type="button" class="threshold-save" onclick="openSet('${id}')">${btn}</button></div>`;
}
function renderSettings() {
  const box = document.getElementById('setCards'); if (!box || !window.FV_ADMIN) return;
  const ds = allData.map(r => r.departDate).filter(Boolean).sort();
  const imp = exemptImpact(), ex = new Set((settings.exempt || []).map(e => normPlate(e.plate)));
  const saved = imp.filter(o => ex.has(normPlate(o.plate))).reduce((s, o) => s + o.hit, 0);
  const mile = filteredData.filter(r => !(r.rawDistance > 0) || r.rawDistance > 1000).length;
  const unk = [...new Set(allData.filter(r => dcZone(r.dc) === 'ไม่ระบุ Zone').map(r => r.dc))];
  const upd = (document.getElementById('nx-status') || {}).textContent || '';
  box.innerHTML =
    setCard('thresh', '🔔', 'เกณฑ์แจ้งเตือน', [`ผิดปกติ/DC/วัน เกิน ${thresholds.abnDC} · เสี่ยง/DC/วัน เกิน ${thresholds.riskDC}`, `% เสี่ยง+ผิดปกติ เกิน ${thresholds.pct}% · ข้ามวัน/วัน เกิน ${thresholds.cross}`]) +
    setCard('exempt', '🅿️', 'ทะเบียนยกเว้น (จอดที่สาขา)', [`${(settings.exempt || []).length.toLocaleString()} ทะเบียน`, `เที่ยวที่ไม่ถูกนับเป็นเสี่ยง ${saved.toLocaleString()} เที่ยว`]) +
    setCard('grade', '🏅', 'เกณฑ์เกรด', (settings.grades || []).length ? (settings.grades || []).map(g => `${escH(GRADE_METS[g.metric] ? GRADE_METS[g.metric].l : g.metric)}: ${(g.bands || []).map(b => escH(b.g) + (GRADE_METS[g.metric] && GRADE_METS[g.metric].low ? ' ≤' : ' ≥') + b.v).join(' · ')} · อื่นๆ ' + escH(g.else || 'F')}`) : ['ยังไม่ได้กำหนด — เพิ่ม/ลบเกรดเองได้']) +
    setCard('mile', '🛠️', 'ตรวจเลขไมล์', [`${mile.toLocaleString()} เที่ยวในช่วงที่เลือก`, 'ระยะทาง 0 หรือเกิน 1,000 กม.']) +
    setCard('zone', '🗺️', 'จับภาค (Zone)', [`${Object.keys(ZONE_MAP).length} DC · ${new Set(Object.values(ZONE_MAP)).size} Zone`, unk.length ? `<span style="color:var(--red)">DC ยังไม่มี Zone ${unk.length} แห่ง</span>` : 'DC ในข้อมูลมี Zone ครบ'], 'ดูรายการ ›') +
    setCard('data', '📁', 'ข้อมูล', [`${allData.length.toLocaleString()} เที่ยว · ${ds.length ? rangeLabel(ds[0], ds[ds.length - 1]) : '—'}`, escH(upd)], 'จัดการ ›');
  if (SET_OPEN === 'exempt') renderExemptPicker();
  if (SET_OPEN === 'zone') renderZoneTable();
  if (SET_OPEN === 'data') renderDataInfo();
  if (SET_OPEN === 'grade' && !document.querySelector('#gradeEd .gr-in:focus')) renderGrades();
}
function openSet(id) {
  if (id === 'grade') GR_DRAFT = null;
  SET_OPEN = id;
  document.getElementById('setCards').hidden = !!id;
  document.querySelectorAll('.set-sec').forEach(s => { s.hidden = s.id !== 'set-' + id; });
  document.getElementById('setBack').hidden = !id;
  renderSettings();
  window.scrollTo({ top: 0 });
}
let EX_Q = '';
function renderExemptPicker() {
  const box = document.getElementById('exPick'); if (!box) return;
  const ex = new Map((settings.exempt || []).map(e => [normPlate(e.plate), e]));
  let rows = exemptImpact().sort((a, b) => (ex.has(normPlate(b.plate)) - ex.has(normPlate(a.plate))) || (b.hit - a.hit) || (b.n - a.n));
  if (EX_Q) { const q = EX_Q.toLowerCase().replace(/[\s-]/g, ''); rows = rows.filter(o => (normPlate(o.plate) + dcName(o.dc)).toLowerCase().includes(q)); }
  const shown = rows.slice(0, 150);
  box.innerHTML = `<table class="an-t"><thead><tr><th style="width:44px">ยกเว้น</th><th>ทะเบียน</th><th>DC หลัก</th><th class="r">เที่ยว</th><th class="r">ข้ามวัน 1–10 กม.</th><th>หมายเหตุ</th></tr></thead><tbody>` +
    shown.map(o => { const e = ex.get(normPlate(o.plate)); return `<tr><td><input type="checkbox" aria-label="ยกเว้น ${escH(o.plate)}" ${e ? 'checked' : ''} data-plate="${escH(o.plate)}" class="ex-ck"></td><td><b>${escH(o.plate)}</b></td><td class="muted">${escH(dcName(o.dc))}</td><td class="r">${nf0(o.n)}</td><td class="r">${o.hit ? `<b style="color:var(--yellow)">${nf0(o.hit)}</b>` : '0'}</td><td>${e ? `<input class="threshold-input ex-note" data-plate="${escH(o.plate)}" value="${escH(e.note)}" placeholder="เช่น จอดสาขา…" style="width:100%;text-align:left">` : ''}</td></tr>`; }).join('') +
    '</tbody></table>' + (rows.length > 150 ? `<p class="muted" style="font-size:12px;margin-top:6px">แสดง 150 จาก ${rows.length.toLocaleString()} ทะเบียน — พิมพ์ค้นหาเพื่อหาคันอื่น</p>` : '');
}
document.addEventListener('change', e => {
  const ck = e.target.closest && e.target.closest('.ex-ck');
  if (ck) {
    const p = ck.dataset.plate;
    if (ck.checked) settings.exempt.push({ plate: p, note: '' });
    else settings.exempt = settings.exempt.filter(x => normPlate(x.plate) !== normPlate(p));
    exemptChanged(); renderExemptPicker(); return;
  }
  const nt = e.target.closest && e.target.closest('.ex-note');
  if (nt) { const x = settings.exempt.find(x => normPlate(x.plate) === normPlate(nt.dataset.plate)); if (x) { x.note = nt.value.trim(); renderExempt(); persistSettings('exSaved'); } }
});
function renderZoneTable() {
  const box = document.getElementById('zoneTable'); if (!box) return;
  const cnt = {}; allData.forEach(r => { const c = dcCode(r.dc); cnt[c] = (cnt[c] || 0) + 1; });
  const names = {}; allData.forEach(r => { names[dcCode(r.dc)] = dcName(r.dc); });
  const unk = [...new Set(allData.filter(r => dcZone(r.dc) === 'ไม่ระบุ Zone').map(r => r.dc))];
  const byZ = {}; Object.entries(ZONE_MAP).forEach(([c, z]) => (byZ[z] = byZ[z] || []).push(c));
  box.innerHTML = (unk.length ? `<p style="color:var(--red);margin-bottom:10px">⚠️ DC ที่ยังไม่มี Zone (นับเป็น UPC): ${unk.map(escH).join(', ')} — ส่งไฟล์จับภาคฉบับใหม่ให้ผู้พัฒนาเพื่อเพิ่ม</p>` : '') +
    `<table class="an-t"><thead><tr><th>Zone</th><th>กลุ่ม</th><th>DC</th><th class="r">เที่ยวในข้อมูล</th></tr></thead><tbody>` +
    ZONE_ORDER.filter(z => byZ[z]).map(z => `<tr><td><b>${escH(z)}</b></td><td>${z === 'BKK' ? 'BKK' : 'UPC'}</td><td>${byZ[z].sort().map(c => `${c} ${escH(names[c] || '')}`.trim()).join(' · ')}</td><td class="r">${nf0(byZ[z].reduce((s, c) => s + (cnt[c] || 0), 0))}</td></tr>`).join('') + '</tbody></table>';
}
function renderDataInfo() {
  const box = document.getElementById('dataInfo'); if (!box) return;
  const byM = {}; allData.forEach(r => { const k = (r.departDate || '').slice(0, 7); if (k) byM[k] = (byM[k] || 0) + 1; });
  box.innerHTML = `<table class="an-t"><thead><tr><th>เดือน</th><th class="r">เที่ยว</th></tr></thead><tbody>` +
    Object.keys(byM).sort().reverse().map(k => `<tr><td>${thMonth(k)}</td><td class="r">${nf0(byM[k])}</td></tr>`).join('') + '</tbody></table>';
}
function showAlerts() {
  const b = document.getElementById('alertBanner');
  if (b && document.getElementById('alertItems').innerHTML.trim()) { b.style.display = 'flex'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (window.FV_ADMIN) { setView('settings'); openSet('thresh'); }
}
