/* iL1A :: LiFE ADD-ON — main.js */
(function () {
  'use strict';

  var NFO_TEXT =
    "here's the latest ADD-ON for LiFE!\n" +
    "unpack the archive into C:\\LiFE and run.\n" +
    "if the directory isn't present, make one. done.\n" +
    "greetz to all who keep the web strange.";

  function initFx() {
    if (!window.FX) return;
    FX.cursor('assets/img/cursor.png');
    if (FX.trail) FX.trail();

    var counter = document.getElementById('counter');
    if (counter) FX.hitCounter(counter, { start: 1994 });

    var clock = document.getElementById('liveclock');
    if (clock) FX.clock(clock, { fmt: 'full' });

    var nfo = document.getElementById('nfo-txt');
    if (nfo) FX.typewriter(nfo, NFO_TEXT, { cps: 38 });

    if (FX.konami) FX.konami(function () {
      FX.popup('HiDDEN PROCESS UNLOCKED.<br><br>nothing happens. but the dust settles differently now.', { title: 'SYSTEM' });
    });

    var tb = document.getElementById('tune-btn');
    if (tb && FX.tune) tb.addEventListener('click', function () {
      if (FX.tune.playing) { FX.tune.stop(); tb.textContent = '[ \u266a off ]'; tb.classList.remove('on'); }
      else { FX.tune.start(); tb.textContent = '[ \u266a on ]'; tb.classList.add('on'); }
    });

    var plates = document.querySelectorAll('.plate[data-src]');
    Array.prototype.forEach.call(plates, function (pl) {
      function open() {
        var cap = pl.querySelector('figcaption');
        FX.popup('<img class="fx-plate" src="' + pl.getAttribute('data-src') + '" alt="">',
          { title: cap ? cap.textContent : 'PLATE' });
      }
      pl.addEventListener('click', open);
      pl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });

    /* welcome popup: once per session, not on every reload */
    var seen = false;
    try { seen = sessionStorage.getItem('il1a_hello'); sessionStorage.setItem('il1a_hello', '1'); } catch (e) {}
    if (!seen) setTimeout(function () {
      FX.popup(
        'welcome to the add-on.<br><br>sign the book, read the notes, mind the borders and boundaries.',
        { title: 'SYSTEM MESSAGE' }
      );
    }, 700);
  }

  /* ---- guestbook ---- */
  var GB_KEY = 'il1a_gb';

  function gbLoad() {
    try { return JSON.parse(localStorage.getItem(GB_KEY)) || []; }
    catch (e) { return []; }
  }
  function gbSave(list) {
    try { localStorage.setItem(GB_KEY, JSON.stringify(list)); } catch (e) { /* file:// */ }
  }
  function gbEntry(name, msg, dateStr) {
    var e = document.createElement('div');
    e.className = 'gb-e';
    var n = document.createElement('span');
    n.className = 'gb-n';
    n.textContent = name;
    var d = document.createElement('span');
    d.className = 'gb-d';
    d.textContent = ' [' + dateStr + ']';
    e.appendChild(n);
    e.appendChild(document.createTextNode(' '));
    e.appendChild(d);
    e.appendChild(document.createTextNode(' \u2014\u00bb ' + msg));
    return e;
  }
  function roman(n) {
    var t = [[1000,'m'],[900,'cm'],[500,'d'],[400,'cd'],[100,'c'],[90,'xc'],
             [50,'l'],[40,'xl'],[10,'x'],[9,'ix'],[5,'v'],[4,'iv'],[1,'i']];
    var out = '';
    for (var i = 0; i < t.length; i++) while (n >= t[i][0]) { out += t[i][1]; n -= t[i][0]; }
    return out;
  }
  function romanDate() {
    var d = new Date();
    return roman(d.getFullYear()) + '.' + roman(d.getMonth() + 1) + '.' + p2(d.getDate());
  }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function initGuestbook() {
    var list = document.getElementById('gb-list');
    var go = document.getElementById('gb-go');
    if (!list || !go) return;

    var saved = gbLoad();
    for (var i = saved.length - 1; i >= 0; i--) {
      list.insertBefore(gbEntry(saved[i].n, saved[i].m, saved[i].d), list.firstChild);
    }

    go.addEventListener('click', function () {
      var nameEl = document.getElementById('gb-name');
      var msgEl = document.getElementById('gb-msg');
      var name = (nameEl.value || 'anon').trim() || 'anon';
      var msg = (msgEl.value || '').trim();
      if (!msg) return;
      var ds = romanDate();
      list.insertBefore(gbEntry(name, msg, ds), list.firstChild);
      var all = gbLoad();
      all.push({ n: name, m: msg, d: ds });
      gbSave(all);
      nameEl.value = '';
      msgEl.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFx();
    initGuestbook();
  });
})();
