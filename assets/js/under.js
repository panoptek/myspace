/* ilia — underground layer: intro, crt power-on, glitch, scramble, ticker, sweep, stray popups */
(function () {
  'use strict';
  var FAST = /[?&]fast/.test(location.search);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GL = '!<>-_\\/[]{}=+*^?#_%&@$0123456789';
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(s) { return s.charAt(rnd(s.length)); }

  /* ---- text scramble: decode letters one by one ---- */
  function scramble(el, text, opts) {
    opts = opts || {};
    var frame = 0, done = false, out;
    var len = text.length, per = opts.per || 3, lead = opts.lead || 12;
    var order = [];
    for (var i = 0; i < len; i++) order.push({ ch: text[i], at: rnd(lead) + i * (per / 2) | 0, delay: rnd(per) });
    (function step() {
      out = '';
      done = true;
      for (var i = 0; i < len; i++) {
        var o = order[i];
        if (o.ch === ' ') { out += ' '; continue; }
        if (frame < o.at) { out += pick(GL); done = false; }
        else if (frame < o.at + o.delay + 4) { out += pick(GL); done = false; }
        else out += o.ch;
      }
      el.textContent = out;
      frame++;
      if (!done) requestAnimationFrame(step);
      else el.textContent = text;
    })();
  }

  /* ---- intro: press any key ---- */
  function intro(onEnter) {
    var seen = false;
    try { seen = sessionStorage.getItem('ilia_intro'); } catch (e) {}
    if (seen || FAST) { onEnter(false); return; }
    var box = document.createElement('div');
    box.className = 'intro';
    box.innerHTML =
      '<pre class="intro-pre" id="intro-log"></pre>' +
      '<div class="intro-bar"><span id="intro-fill"></span></div>' +
      '<div class="intro-hint" id="intro-hint"></div>';
    document.body.appendChild(box);
    document.documentElement.classList.add('is-intro');

    var log = document.getElementById('intro-log');
    var fill = document.getElementById('intro-fill');
    var hint = document.getElementById('intro-hint');
    var lines = [
      'ilia life add-on v2.4 :: loader',
      'checking phosphor ........... ok',
      'mounting plates (6) ......... ok',
      'dürer 1498 / 1513 ........... ok',
      'holbein c.1538 .............. ok',
      'flammarion 1888 ............. ok',
      'guestbook ................... ' + (window.GB_CONFIG && window.GB_CONFIG.url ? 'remote' : 'local'),
      'cookies ..................... none',
      'trackers .................... none',
      'dust ........................ plenty',
      ''
    ];
    var i = 0, pct = 0, ready = false;
    var t = setInterval(function () {
      if (i < lines.length) log.textContent += lines[i++] + '\n';
      pct = Math.min(100, pct + 6 + rnd(9));
      fill.style.width = pct + '%';
      if (i >= lines.length && pct >= 100) {
        clearInterval(t);
        ready = true;
        hint.innerHTML = '[ press any key or click to enter ]';
        hint.classList.add('on');
      }
    }, 110);

    function go(e) {
      if (!ready) return;
      if (e && e.type === 'keydown' && (e.key === 'F5' || e.key === 'F12' || e.metaKey || e.ctrlKey)) return;
      document.removeEventListener('keydown', go);
      box.removeEventListener('click', go);
      try { sessionStorage.setItem('ilia_intro', '1'); } catch (er) {}
      box.classList.add('off');
      setTimeout(function () {
        if (box.parentNode) box.parentNode.removeChild(box);
        document.documentElement.classList.remove('is-intro');
        onEnter(true);
      }, 260);
    }
    document.addEventListener('keydown', go);
    box.addEventListener('click', go);
  }

  /* ---- crt power-on ---- */
  function powerOn() {
    if (reduce || FAST) return;
    var page = document.querySelector('.page');
    if (!page) return;
    page.classList.add('crt-on');
    setTimeout(function () { page.classList.remove('crt-on'); }, 900);
  }

  /* ---- glitch the masthead now and then ---- */
  function glitchLoop() {
    var h = document.querySelector('h1.black');
    if (!h || reduce) return;
    h.setAttribute('data-t', h.textContent);
    (function tick() {
      setTimeout(function () {
        h.classList.add('glitch');
        setTimeout(function () { h.classList.remove('glitch'); }, 180 + rnd(220));
        tick();
      }, 4000 + rnd(9000));
    })();
  }

  /* ---- bands + sub-heads scramble when they enter the viewport; h1 on load ---- */
  function scrambleOnView() {
    var els = document.querySelectorAll('.band, .sub-h, .col figcaption, .portrait figcaption');
    if (!('IntersectionObserver' in window) || reduce) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        if (el.getAttribute('data-done')) return;
        el.setAttribute('data-done', '1');
        scramble(el, el.textContent, { per: 3, lead: 10 });
      });
    }, { threshold: .4 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  /* ---- hover scramble on tabs / plates captions ---- */
  function hoverScramble() {
    if (reduce) return;
    var els = document.querySelectorAll('.tabs a, .tabs button, .plate figcaption');
    Array.prototype.forEach.call(els, function (el) {
      var busy = false;
      el.addEventListener('mouseenter', function () {
        if (busy) return;
        busy = true;
        var t = el.textContent;
        scramble(el, t, { per: 2, lead: 6 });
        setTimeout(function () { busy = false; }, 500);
      });
    });
  }

  /* ---- document.title crawl ---- */
  function titleCrawl() {
    if (FAST) return;
    var base = 'ilia — life add-on', pad = ' ▪ ';
    var s = base + pad + 'borders and boundaries' + pad + 'hybrid processes' + pad;
    var i = 0;
    setInterval(function () {
      document.title = s.slice(i) + s.slice(0, i);
      i = (i + 1) % s.length;
    }, 380);
  }

  /* ---- a stray system message, once per session ---- */
  function strayPopup() {
    if (FAST || !window.FX || !FX.popup) return;
    var seen = false;
    try { seen = sessionStorage.getItem('ilia_stray'); } catch (e) {}
    if (seen) return;
    setTimeout(function () {
      try { sessionStorage.setItem('ilia_stray', '1'); } catch (e) {}
      var msgs = [
        'you have been on this page for a while.<br><br>the knight has not moved. neither has death.',
        'best viewed at 1024x768.<br><br>or whatever you have. the phosphor does not care.',
        '1 new message.<br><br>it says: sign the book.',
        'memory check: 640k.<br><br>should be enough for anybody.'
      ];
      FX.popup(msgs[rnd(msgs.length)], { title: 'system' });
    }, 40000 + rnd(30000));
  }

  /* ---- boot ---- */
  document.addEventListener('DOMContentLoaded', function () {
    intro(function (entered) {
      if (entered) powerOn();
      var h = document.querySelector('h1.black');
      if (h && !reduce && !FAST) scramble(h, h.textContent, { per: 8, lead: 20 });
      glitchLoop();
      scrambleOnView();
      hoverScramble();
      titleCrawl();
      strayPopup();
    });
  });
})();
