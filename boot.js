/* NIMEX Fleet Vehicle — loads trips from the Google Sheet (Apps Script), then runs the dashboard's init().
   Viewer: read only. Admin (#admin + key checked by Apps Script): upload Excel → preview → save to Sheet. */
(function () {
  var KEY = 'nimex-admin-key';
  var COLS = ['tripId','departDate','returnDate','plate','vehicleType','dc','releaseType','distance','rawDistance',
    'mileOut','mileIn','dayStatus','mileDiff','tripStatus','route'];
  var NUM = ['distance','rawDistance','mileOut','mileIn','mileDiff'];
  var NULLABLE = ['returnDate','mileDiff','route','departDate','distance'];
  function $(id) { return document.getElementById(id); }
  function ss(v) { try { if (v === undefined) return sessionStorage.getItem(KEY); if (v === null) sessionStorage.removeItem(KEY); else sessionStorage.setItem(KEY, v); } catch (e) { return null; } }
  var wantAdmin = /(^|#)admin\b/.test(location.hash);
  window.FV_ADMIN = false;

  function cover() {
    var c = $('cover'); if (!c) return;
    document.body.style.overflow = 'hidden';
    function close() { c.hidden = true; document.body.style.overflow = ''; }
    c.querySelector('button').onclick = close; c.querySelector('.fg').onclick = close;
    document.addEventListener('keydown', function k(e) { if (e.key === 'Enter' || e.key === 'Escape') { if ($('boot').hidden) { close(); document.removeEventListener('keydown', k); } } });
  }
  function msg(html) { var b = $('boot'); b.innerHTML = '<div class="boot-box">' + html + '</div>'; b.hidden = false; }
  function api(body) {
    return fetch(window.FV_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ key: ss() }, body)) })
      .then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.error || 'failed'); return j; });
  }
  function toRows(objs) { return objs.map(function (o) { return COLS.map(function (c) { var v = o[c]; return v === undefined || v === null ? '' : (c === 'tripId' ? String(v) : v); }); }); }
  function fromRows(cols, rows) {
    return rows.map(function (r) {
      var o = {};
      cols.forEach(function (c, i) {
        var v = r[i];
        if (v === '' || v === null) { o[c] = NULLABLE.indexOf(c) >= 0 ? null : (NUM.indexOf(c) >= 0 ? 0 : ''); return; }
        if (c === 'tripId') { var t = String(v); o[c] = /^\d{1,15}$/.test(t) ? +t : t; return; }
        o[c] = NUM.indexOf(c) >= 0 ? +v : String(v);
      });
      return o;
    });
  }
  function pushAll(objs, note, step) {
    var rows = toRows(objs), i = 0;
    return api({ a: 'begin' }).then(function next() {
      if (i >= rows.length) return api({ a: 'finish', note: note });
      var part = rows.slice(i, i + 2500); i += part.length; if (step) step(i, rows.length);
      return api({ a: 'append', rows: part }).then(next);
    });
  }
  function status(t) { var s = $('nx-status'); if (s) s.textContent = t; }
  function stamp(iso) { if (iso) status('อัปเดตล่าสุด ' + new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })); }

  /* called by the page right after it has read and processed an uploaded Excel file */
  window.fvApi = api; /* ใช้โดย share.js (บันทึกค่าตั้ง) */
  window.fvSave = function (rows) {
    var prog = $('uploadProgress'), say = function (t) { if (prog) prog.textContent = t; };
    if (!window.FV_ADMIN) return;
    var ds = rows.map(function (r) { return r.departDate; }).filter(Boolean).sort();
    if (!window.confirm('ตรวจก่อนบันทึก\n\n• ' + rows.length.toLocaleString() + ' เที่ยว\n• วันที่ปล่อยรถ ' + (ds[0] || '-') + ' ถึง ' + (ds[ds.length - 1] || '-') +
      '\n\nข้อมูลใน Google Sheet จะถูกแทนที่ด้วยไฟล์นี้ทั้งหมด (เหมือนการอัปโหลดเดิม)\nบันทึกให้ผู้ชมทุกคนเห็นหรือไม่?')) { say('ยังไม่ได้บันทึก — ข้อมูลใหม่แสดงเฉพาะหน้านี้'); return; }
    say('⏳ กำลังบันทึกลง Google Sheet…');
    pushAll(rows, 'upload', function (n, all) { say('⏳ กำลังบันทึก ' + n.toLocaleString() + ' / ' + all.toLocaleString()); })
      .then(function (r) { say('✅ บันทึกแล้ว ' + r.total.toLocaleString() + ' เที่ยว · ผู้ชมเห็นข้อมูลใหม่แล้ว'); stamp(new Date().toISOString()); })
      .catch(function (e) { say('❌ บันทึกไม่สำเร็จ: ' + (e.message === 'denied' ? 'รหัสไม่ถูกต้อง' : e.message)); });
  };

  function askKey(err) {
    msg('<h2>ผู้ดูแลระบบ</h2>' + (err ? '<p class="bad">' + err + '</p>' : '<p>ใส่รหัสผู้ดูแลเพื่อเข้าโหมดจัดการข้อมูล</p>') +
      '<input id="adm-key" type="password" autocomplete="current-password" aria-label="รหัสผู้ดูแล"><div class="row"><a class="btn2" href="./">ดูแบบผู้ชม</a><button class="btn1" id="adm-go">เข้าสู่ระบบ</button></div>');
    var go = function () {
      var v = $('adm-key').value; if (!v) return; ss(v);
      api({ a: 'auth' }).then(function () { location.reload(); }).catch(function (e) { ss(null); askKey(e.message === 'admin_key_not_set' ? 'ยังไม่ได้ตั้ง ADMIN_KEY ใน Apps Script' : 'รหัสไม่ถูกต้อง'); });
    };
    $('adm-go').onclick = go; $('adm-key').onkeydown = function (e) { if (e.key === 'Enter') go(); }; $('adm-key').focus();
  }
  function firstRun() {
    msg('<h2>ตั้งค่าครั้งแรก</h2><p>ยังไม่มีข้อมูลใน Google Sheet เลือกไฟล์ <b>fv-seed.json</b> เพื่อนำเข้าข้อมูลเริ่มต้น<br>หรือปิดหน้านี้แล้วอัปโหลดไฟล์ Excel ที่ปุ่ม 📁</p><input type="file" id="seed-f" accept=".json" aria-label="ไฟล์ข้อมูลเริ่มต้น"><p class="note" id="seed-m"></p><div class="row"><button class="btn2" id="seed-skip">อัปโหลด Excel แทน</button></div>');
    $('seed-skip').onclick = function () { $('boot').hidden = true; window.FV_ROWS = []; init(); openUploadModal(); };
    $('seed-f').onchange = function (e) {
      var m = $('seed-m'); m.textContent = 'กำลังอ่านไฟล์…';
      e.target.files[0].text().then(function (t) {
        var d = JSON.parse(t), objs = fromRows(d.cols, d.rows);
        m.textContent = 'พบ ' + objs.length.toLocaleString() + ' เที่ยว กำลังบันทึก…';
        return pushAll(objs, 'seed', function (n, all) { m.textContent = 'กำลังบันทึก ' + n.toLocaleString() + ' / ' + all.toLocaleString(); });
      }).then(function (r) { m.textContent = 'นำเข้าแล้ว ' + r.total.toLocaleString() + ' เที่ยว'; setTimeout(function () { location.reload(); }, 700); })
        .catch(function (x) { m.textContent = 'นำเข้าไม่สำเร็จ: ' + x.message; });
    };
  }

  function start() {
    cover();
    if (!window.FV_API) { msg('<h2>ยังไม่ได้ตั้งค่า</h2><p>ยังไม่ได้ใส่ที่อยู่ระบบข้อมูล (Apps Script) ใน config.js</p>'); return; }
    var key = ss();
    if (wantAdmin && !key) { askKey(); return; }
    var authP = key ? api({ a: 'auth' }).then(function () { window.FV_ADMIN = true; }).catch(function () { ss(null); if (wantAdmin) throw new Error('relogin'); }) : Promise.resolve();
    var dataP = fetch(window.FV_API + '?v=' + (window.FV_V || 1)).then(function (r) { return r.json(); });
    Promise.all([authP, dataP]).then(function (x) {
      var D = x[1];
      if (window.FV_ADMIN) document.documentElement.classList.add('nx-admin');
      if (!D.rows || !D.rows.length) { if (window.FV_ADMIN) firstRun(); else msg('<h2>ยังไม่มีข้อมูล</h2><p>ผู้ดูแลยังไม่ได้นำเข้าข้อมูล</p>'); return; }
      window.FV_ROWS = fromRows(D.cols, D.rows);
      window.FV_SETTINGS = D.settings || {}; window.FV_SERVER_V = D.v || 1;
      stamp(D.updated);
      $('boot').hidden = true;
      init();
    }).catch(function (e) {
      if (e && e.message === 'relogin') { askKey('รหัสไม่ถูกต้อง'); return; }
      msg('<h2>โหลดข้อมูลไม่สำเร็จ</h2><p>ลองเปิดหน้านี้ใหม่อีกครั้ง</p>');
    });
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
})();
