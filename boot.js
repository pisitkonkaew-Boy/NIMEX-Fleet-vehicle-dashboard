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
  /* อัปโหลดแบบปลอดภัย: พักข้อมูลในแท็บ Upload แล้วรวมเข้า Rows ครั้งเดียว (Apps Script ใหม่)
     ถ้า Apps Script ยังเป็นรุ่นเก่า (ไม่รู้จัก stage_*) จะใช้วิธีเดิม: ล้างแล้วเขียนทั้งหมด */
  function pushStaged(objs, note, step, replace) {
    var rows = toRows(objs), i = 0;
    return api({ a: 'stage_begin' }).then(function next() {
      if (i >= rows.length) return api({ a: 'stage_commit', note: note, expect: rows.length, replace: !!replace });
      var part = rows.slice(i, i + 2500); i += part.length; if (step) step(i, rows.length);
      return api({ a: 'stage_append', rows: part }).then(next);
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
  function save(all, fresh, note, step, replace) {
    return pushStaged(replace ? all : (fresh || all), note, step, replace).catch(function (e) {
      if (e.message !== 'unknown') throw e;
      return pushAll(all, note, step);          // Apps Script รุ่นเก่า
    });
  }
  /* กล่องยืนยันในหน้า (แทน window.confirm ที่บางเบราว์เซอร์/หน้าต่างฝังไม่แสดง) */
  function ask(title, lines, okText) {
    return new Promise(function (res) {
      var ov = document.createElement('div'); ov.className = 'modal-overlay open'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
      ov.innerHTML = '<div class="modal" style="max-width:480px"><h3></h3><ul style="margin:10px 0 14px 18px;font-size:14px;line-height:1.7"></ul><div class="modal-actions"><button class="action-btn" type="button" data-r="0">ยกเลิก</button><button class="action-btn primary" type="button" data-r="1"></button></div></div>';
      ov.querySelector('h3').textContent = title; ov.querySelector('[data-r="1"]').textContent = okText;
      var ul = ov.querySelector('ul'); lines.forEach(function (l) { var li = document.createElement('li'); li.textContent = l; ul.appendChild(li); });
      function done(v) { ov.remove(); document.removeEventListener('keydown', key); res(v); }
      function key(e) { if (e.key === 'Escape') done(false); }
      ov.addEventListener('click', function (e) { var b = e.target.closest('[data-r]'); if (b) done(b.dataset.r === '1'); else if (e.target === ov) done(false); });
      document.addEventListener('keydown', key);
      document.body.appendChild(ov); ov.querySelector('[data-r="1"]').focus();
    });
  }
  function status(t) { var s = $('nx-status'); if (s) s.textContent = t; }
  function stamp(iso) { if (iso) status('อัปเดตล่าสุด ' + new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })); }

  /* called by the page right after it has read and processed an uploaded Excel file */
  window.fvSave = function (rows, info) {
    var prog = $('uploadProgress'), say = function (t) { if (prog) prog.textContent = t; };
    if (!window.FV_ADMIN) return;
    var ds = rows.map(function (r) { return r.departDate; }).filter(Boolean).sort();
    info = info || {};
    ask('ตรวจก่อนบันทึก', [
      'ไฟล์นี้ ' + (info.file || 0).toLocaleString() + ' เที่ยว — ใหม่ ' + (info.added || 0).toLocaleString() + ' · ทับค่าเดิม ' + (info.updated || 0).toLocaleString(),
      'รวมทั้งหมดหลังบันทึก ' + rows.length.toLocaleString() + ' เที่ยว',
      'วันที่ปล่อยรถ ' + (ds[0] || '-') + ' ถึง ' + (ds[ds.length - 1] || '-'),
      'เลขที่ใบรายการซ้ำใช้ค่าจากไฟล์ใหม่ เที่ยวใหม่ต่อท้ายข้อมูลเดิม — ผู้ชมทุกคนจะเห็นทันที'
    ], 'บันทึก').then(function (ok) {
      if (!ok) { say('ยังไม่ได้บันทึก — ข้อมูลใหม่แสดงเฉพาะหน้านี้'); return; }
      say('⏳ กำลังบันทึกลง Google Sheet…');
      save(rows, info.fresh, 'upload', function (n, all) { say('⏳ กำลังส่ง ' + n.toLocaleString() + ' / ' + all.toLocaleString()); })
        .then(function (r) { say('✅ บันทึกแล้ว รวม ' + r.total.toLocaleString() + ' เที่ยว' + (r.added != null ? ' (ใหม่ ' + r.added.toLocaleString() + ' · ทับ ' + r.updated.toLocaleString() + ')' : '') + ' · ผู้ชมเห็นข้อมูลใหม่แล้ว'); stamp(new Date().toISOString()); })
        .catch(function (e) { say('❌ บันทึกไม่สำเร็จ: ' + (e.message === 'denied' ? 'รหัสไม่ถูกต้อง' : e.message) + ' — ข้อมูลเดิมใน Sheet ยังอยู่ครบ ลองอัปโหลดใหม่ได้'); });
    });
  };

  /* ผู้ดูแล: บันทึกทะเบียนยกเว้น + เกณฑ์แจ้งเตือนลง Google Sheet */
  window.fvSaveSettings = function (settings) {
    if (!window.FV_ADMIN) return Promise.reject(new Error('ไม่ใช่โหมดผู้ดูแล'));
    return api({ a: 'settings', settings: settings }).catch(function (e) {
      throw new Error(e.message === 'unknown' ? 'ต้องอัปเดต Apps Script (Code.gs) และ Deploy เวอร์ชันใหม่ก่อน' : e.message === 'denied' ? 'รหัสไม่ถูกต้อง' : e.message);
    });
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
        return save(objs, null, 'seed', function (n, all) { m.textContent = 'กำลังบันทึก ' + n.toLocaleString() + ' / ' + all.toLocaleString(); }, true);
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
      window.FV_SETTINGS = D.settings || null;
      if (!D.rows || !D.rows.length) { if (window.FV_ADMIN) firstRun(); else msg('<h2>ยังไม่มีข้อมูล</h2><p>ผู้ดูแลยังไม่ได้นำเข้าข้อมูล</p>'); return; }
      window.FV_ROWS = fromRows(D.cols, D.rows);
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
