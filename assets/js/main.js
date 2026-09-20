/* ilia — life add-on — main.js */
(function () {
  'use strict';
  var FAST = /[?&]fast/.test(location.search); /* skip reveal animations (screenshots) */


  function initFx() {
    if (!window.FX) return;
    if (FX.trail) FX.trail();

    var counter = document.getElementById('counter');
    if (counter) FX.hitCounter(counter, { start: 1994 });

    var clock = document.getElementById('liveclock');
    if (clock) FX.clock(clock, { fmt: 'full' });

    if (FX.konami) FX.konami(function () {
      FX.popup('hidden process unlocked.<br><br>nothing happens. the dust just settles differently now.', { title: 'system' });
    });

    var tb = document.getElementById('tune-btn');
    if (tb && FX.tune) tb.addEventListener('click', function () {
      if (FX.tune.playing) { FX.tune.stop(); tb.textContent = 'Drone'; tb.classList.remove('on'); }
      else { FX.tune.start(); tb.textContent = 'Drone \u266a'; tb.classList.add('on'); }
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
        empty.textContent = 'the book is empty. leave the first mark.';
        list.appendChild(empty);
        return;
      }
      entries.forEach(function (e) { list.appendChild(gbEntry(e)); });
    }

    say(REMOTE ? 'reaching the archive\u2026' : 'offline: entries stay in this browser');
    gbFetch().then(function (entries) {
      render(entries);
      say(REMOTE ? entries.length + ' marks on record' : 'offline: entries stay in this browser');
    }).catch(function () {
      render(gbLoadLocal().reverse());
      say('archive unreachable, showing local copy');
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
        say('signed. noted.');
        try { localStorage.setItem('il1a_gb_last', String(Date.now())); } catch (e) {}
      }).catch(function () {
        say('the archive refused. try later.');
      }).then(function () { btn.disabled = false; });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFx();
    initGuestbook();
    var port = document.getElementById('port');
    if (port) port.textContent = String(new Date().getDay() || 7);
  });
})();
