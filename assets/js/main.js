/* iL1A :: LiFE ADD-ON — main.js */
(function () {
  'use strict';
  var FAST = /[?&]fast/.test(location.search); /* skip reveal animations (screenshots) */

  var NFO_TEXT =
    "here's the latest ADD-ON for LiFE!\n" +
    "unpack the archive into C:\\LiFE and run.\n" +
    "if the directory isn't present, make one. done.\n" +
    "greetz to all who keep the web strange.";

  function initFx() {
    if (!window.FX) return;
    if (FX.trail) FX.trail();

    var counter = document.getElementById('counter');
    if (counter) FX.hitCounter(counter, { start: 1994 });

    var clock = document.getElementById('liveclock');
    if (clock) FX.clock(clock, { fmt: 'full' });

    var nfo = document.getElementById('nfo-txt');
    if (nfo) { if (FAST) nfo.textContent = NFO_TEXT; else FX.typewriter(nfo, NFO_TEXT, { cps: 38 }); }

    if (FX.konami) FX.konami(function () {
      FX.popup('HiDDEN PROCESS UNLOCKED.<br><br>nothing happens. but the dust settles differently now.', { title: 'SYSTEM' });
    });

    var tb = document.getElementById('tune-btn');
    if (tb && FX.tune) tb.addEventListener('click', function () {
      if (FX.tune.playing) { FX.tune.stop(); tb.textContent = 'More+'; tb.classList.remove('on'); }
      else { FX.tune.start(); tb.textContent = 'More+ \u266a'; tb.classList.add('on'); }
    });

    var plates = document.querySelectorAll('.plate[data-src]');
    Array.prototype.forEach.call(plates, function (pl) {
      function open() {
        var cap = pl.querySelector('figcaption');
        var win = FX.popup('<img class="fx-plate" src="' + pl.getAttribute('data-src') + '" alt="">',
          { title: cap ? cap.textContent : 'PLATE' });
        win.classList.add('fx-wide');
      }
      pl.addEventListener('click', open);
      pl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    /* welcome popup: once per session, not on every reload */
    var seen = false;
    try { seen = sessionStorage.getItem('il1a_hello'); sessionStorage.setItem('il1a_hello', '1'); } catch (e) {}
    if (!seen && !FAST) setTimeout(function () {
      FX.popup(
        'welcome to the add-on.<br><br>sign the book, read the notes, mind the borders and boundaries.',
        { title: 'SYSTEM MESSAGE' }
      );
    }, 700);
  }

  /* ---- ascii raster: dithered png -> block glyphs (NAKZ panel) ---- */
  function asciify(pre) {
    var src = pre.getAttribute('data-src');
    var cols = parseInt(pre.getAttribute('data-cols'), 10) || 100;
    var img = new Image();
    img.onload = function () {
      /* glyph cell is ~1:2 (width:height) at font-size == line-height */
      var rows = Math.round(cols * (img.height / img.width) * 0.5);
      var c = document.createElement('canvas');
      c.width = cols; c.height = rows;
      var g = c.getContext('2d');
      g.drawImage(img, 0, 0, cols, rows);
      var d;
      try { d = g.getImageData(0, 0, cols, rows).data; } catch (e) { return; }
      var ramp = ' \u00b7:\u2591\u2592\u2593\u2588';
      var lines = [];
      for (var y = 0; y < rows; y++) {
        var line = '';
        for (var x = 0; x < cols; x++) {
          var a = d[(y * cols + x) * 4 + 3] / 255;
          line += ramp.charAt(Math.min(ramp.length - 1, Math.floor(a * ramp.length)));
        }
        lines.push(line.replace(/\s+$/, ''));
      }
      /* boot it in: reveal line by line */
      var i = 0;
      pre.textContent = '';
      if (FAST) { pre.textContent = lines.join('\n'); return; }
      var t = setInterval(function () {
        pre.textContent += lines[i] + '\n';
        if (++i >= lines.length) clearInterval(t);
      }, 14);
    };
    img.src = src;
  }

  /* ---- boot log: ECHO lines typed into the left panel ---- */
  var BOOT = [
    ['h', '@ECHO OFF'],
    ['d', 'MODE CON: COLS=80 LINES=25'],
    ['d', 'COLOR 0B'],
    ['',  ''],
    ['',  ':: SiMULATE BiOS SETUP SCREEN WiTH iNTERACTiVE MENU'],
    ['d', 'ECHO ================================================'],
    ['',  'ECHO  iL1A MODULAR BiOS v2.1 - LiFE CONFiGURATiON UTiLiTY'],
    ['',  'ECHO  COPYRiGHT (C) MMXXV-MMXXVi iL1A, MOSCOW'],
    ['d', 'ECHO ================================================'],
    ['bl','iL1A :: LiFE ADD-ON'],
    ['',  'ECHO.'],
    ['',  'ECHO  [1] STANDARD LiFE FEATURES ....... student, 19'],
    ['',  'ECHO  [2] ADVANCED LiFE FEATURES ....... films, series, 3am'],
    ['',  'ECHO  [3] iNTEGRATED PERiPHERALS ....... gpu, old boards, keebs'],
    ['',  'ECHO  [4] POWER MANAGEMENT SETUP ....... none. wired.'],
    ['',  'ECHO  [5] PNP / LLM CONFiGURATiONS ..... claude, qwen, local'],
    ['',  'ECHO  [6] PC HEALTH STATUS ............. thermal paste: fresh'],
    ['',  'ECHO  [7] LOAD DARK FANTASY DEFAULTS ... [x]'],
    ['',  'ECHO  [8] SAVE & EXiT ................... never'],
    ['',  'ECHO.'],
    ['d', 'SET /P CHOiCE=ENTER YOUR SELECTiON (1-8): '],
    ['',  'iF "%CHOiCE%"=="7" GOTO DARK'],
    ['',  'iF "%CHOiCE%"=="8" GOTO EXiT'],
    ['',  'GOTO MENU'],
    ['',  ''],
    ['h', ':DARK'],
    ['',  'ECHO  KNiGHTS iN RUSTED PLATE. TOWERS AGAiNST A BiG MOON.'],
    ['',  'ECHO  LARGE PiXELS. TWO COLOURS. NO HAPPY ENDiNGS.'],
    ['',  'ECHO  ENGRAViNGS: DURER 1498/1513/1514, HOLBEiN 1538,'],
    ['',  'ECHO  DORE 1861, FLAMMARiON 1888. QUANTiSED TO 1 BiT.'],
    ['',  'ECHO.'],
    ['',  'ECHO  > TAKE THE TiME TO REALiSE YOU ARE NOT LOADiNG.......'],
    ['',  'ECHO  > YOU ARE THE LOADER.'],
    ['',  ''],
    ['h', ':EXiT'],
    ['',  'ECHO  BORDERS AND BOUNDARiES // HYBRiD PROCESSES'],
    ['d', 'PAUSE >NUL'],
    ['d', 'CLS']
  ];
  function bootLog(el) {
    var i = 0;
    if (FAST) { while (i < BOOT.length) step(); return; }
    var t = setInterval(function () {
      step();
      if (i >= BOOT.length) clearInterval(t);
    }, 55);
    function step() {
      var L = BOOT[i++];
      var s = document.createElement('span');
      s.className = 'e' + (L[0] ? ' e-' + L[0] : '');
      s.textContent = L[1] || '\u00a0';
      el.appendChild(s);
    }
  }

  /* ---- roman dates ---- */
  function roman(n) {
    var t = [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],
             [50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']];
    var out = '';
    for (var i = 0; i < t.length; i++) while (n >= t[i][0]) { out += t[i][1]; n -= t[i][0]; }
    return out;
  }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function romanDate(d) {
    d = d ? new Date(d) : new Date();
    return roman(d.getFullYear()) + '.' + roman(d.getMonth() + 1) + '.' + p2(d.getDate());
  }

  /* ---- guestbook: Supabase REST if configured, else localStorage ---- */
  var GB_KEY = 'il1a_gb';
  var CFG = window.GB_CONFIG || {};
  var REMOTE = !!(CFG.url && CFG.key);

  function gbLoadLocal() {
    try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; }
    catch (e) { return []; }
  }
  function gbSaveLocal(list) {
    try { localStorage.setItem(GB_KEY, JSON.stringify(list)); } catch (e) { /* file:// */ }
  }

  function api(path, opts) {
    opts = opts || {};
    var h = { 'apikey': CFG.key, 'Authorization': 'Bearer ' + CFG.key, 'Content-Type': 'application/json' };
    if (opts.prefer) h['Prefer'] = opts.prefer;
    return fetch(CFG.url.replace(/\/$/, '') + '/rest/v1/' + path, {
      method: opts.method || 'GET', headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.status === 201 || r.status === 204 ? null : r.json();
    });
  }
  function gbFetch() {
    if (!REMOTE) return Promise.resolve(gbLoadLocal().reverse());
    return api('guestbook?select=name,msg,created_at&order=created_at.desc&limit=60').then(function (rows) {
      return rows.map(function (r) { return { n: r.name, m: r.msg, d: romanDate(r.created_at) }; });
    });
  }
  function gbPost(name, msg) {
    if (!REMOTE) {
      var all = gbLoadLocal();
      all.push({ n: name, m: msg, d: romanDate() });
      gbSaveLocal(all);
      return Promise.resolve();
    }
    return api('guestbook', { method: 'POST', prefer: 'return=minimal', body: { name: name, msg: msg } });
  }

  function gbEntry(e) {
    var el = document.createElement('div');
    el.className = 'gb-e';
    var n = document.createElement('span');
    n.className = 'gb-n';
    n.textContent = e.n;
    var d = document.createElement('span');
    d.className = 'gb-d';
    d.textContent = ' [' + e.d + ']';
    el.appendChild(n);
    el.appendChild(document.createTextNode(' '));
    el.appendChild(d);
    el.appendChild(document.createTextNode(' \u2014\u00bb ' + e.m));
    return el;
  }

  function initGuestbook() {
    var list = document.getElementById('gb-list');
    var form = document.getElementById('gb-form');
    var status = document.getElementById('gb-status');
    if (!list || !form) return;

    function say(t) { if (status) status.textContent = t; }
    function render(entries) {
      list.textContent = '';
      if (!entries.length) {
        var empty = document.createElement('div');
        empty.className = 'gb-e';
        empty.textContent = '\u2014 the book is empty. be the first to leave dust. \u2014';
        list.appendChild(empty);
        return;
      }
      entries.forEach(function (e) { list.appendChild(gbEntry(e)); });
    }

    say(REMOTE ? 'connecting to the archive\u2026' : 'offline mode: entries live only in this browser');
    gbFetch().then(function (entries) {
      render(entries);
      say(REMOTE ? entries.length + ' signatures on record' : 'offline mode: entries live only in this browser');
    }).catch(function () {
      render(gbLoadLocal().reverse());
      say('archive unreachable \u2014 showing local copy');
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var nameEl = document.getElementById('gb-name');
      var msgEl = document.getElementById('gb-msg');
      var hp = document.getElementById('gb-hp');
      if (hp && hp.value) return; /* bot filled the honeypot */
      var name = (nameEl.value || '').trim().slice(0, 24) || 'anon';
      var msg = (msgEl.value || '').trim().slice(0, 140);
      if (!msg) return;
      var btn = document.getElementById('gb-go');
      btn.disabled = true;
      say('signing\u2026');
      gbPost(name, msg).then(function () {
        list.insertBefore(gbEntry({ n: name, m: msg, d: romanDate() }), list.firstChild);
        var ph = list.querySelector('.gb-e:not(:first-child)');
        if (ph && ph.textContent.indexOf('the book is empty') !== -1) ph.remove();
        nameEl.value = ''; msgEl.value = '';
        say('signed. the dust remembers you.');
        try { localStorage.setItem('il1a_gb_last', String(Date.now())); } catch (e) {}
      }).catch(function () {
        say('the archive refused. try again later.');
      }).then(function () { btn.disabled = false; });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFx();
    initGuestbook();
    var pre = document.getElementById('ascii');
    if (pre) asciify(pre);
    var echo = document.getElementById('echo');
    if (echo) bootLog(echo);
    var port = document.getElementById('bios-port');
    if (port) port.textContent = String(new Date().getDay() || 7);
  });
})();
