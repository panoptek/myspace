/* ==========================================================================
   fx.js - iRead // monochrome NFO-zine FX library
   window.FX: cursor, trail, drag, popup, hitCounter, clock, typewriter,
              tune, konami   (+ shared z-counter FX._z)
   Vanilla JS, zero deps. Everything is explicit-call; nothing auto-runs.
   ========================================================================== */
(function () {
  'use strict';

  var FX = {};
  FX._z = 10000; /* shared bring-to-front counter */

  /* ------------------------------------------------------------------------
     Shared CSS injector: ONE <style id="fx-css"> appended to <head> lazily.
     Selectors are .fx- prefixed (except contract-mandated .dg and the
     cursor rule which must target page elements).
  ------------------------------------------------------------------------ */
  var styleEl = null;
  var injected = {};
  function css(key, text) {
    if (injected[key]) return;
    injected[key] = true;
    if (!styleEl) {
      styleEl = document.getElementById('fx-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'fx-css';
        document.head.appendChild(styleEl);
      }
    }
    styleEl.appendChild(document.createTextNode(text + '\n'));
  }

  /* ------------------------------------------------------------------------
     FX.cursor(url): custom cursor on body + common interactives.
  ------------------------------------------------------------------------ */
  FX.cursor = function (url) {
    css('cursor:' + url,
      'body,a,button,input,select,textarea,label,marquee,[onclick]{' +
      'cursor:url(' + url + ') 4 4,auto;}');
  };

  /* ------------------------------------------------------------------------
     FX.drag(el, handle): pointer-based drag, keeps el inside viewport,
     bumps z-index via shared FX._z counter.
  ------------------------------------------------------------------------ */
  FX.drag = function (el, handle) {
    handle.style.touchAction = 'none';
    handle.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var r = el.getBoundingClientRect();
      var ox = e.clientX - r.left;
      var oy = e.clientY - r.top;
      el.style.position = 'fixed'; /* switch to fixed if it was not already */
      el.style.left = r.left + 'px';
      el.style.top = r.top + 'px';
      el.style.margin = '0';
      el.style.zIndex = ++FX._z;
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      function move(ev) {
        var maxX = window.innerWidth - el.offsetWidth;
        var maxY = window.innerHeight - el.offsetHeight;
        var x = ev.clientX - ox;
        var y = ev.clientY - oy;
        if (x < 0) x = 0; else if (x > maxX) x = Math.max(0, maxX);
        if (y < 0) y = 0; else if (y > maxY) y = Math.max(0, maxY);
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
      function up(ev) {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        try { handle.releasePointerCapture(ev.pointerId); } catch (err) {}
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
      e.preventDefault();
    });
  };

  /* ------------------------------------------------------------------------
     FX.trail(opts?): monochrome dust cursor trail. opts {max} (default 40).
     Disabled on touch devices.
  ------------------------------------------------------------------------ */
  FX.trail = function (opts) {
    opts = opts || {};
    var max = opts.max || 40;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    if (FX._trailOn) return; /* attach once */
    FX._trailOn = true;
    css('trail',
      '.fx-sparkle{position:fixed;width:3px;height:3px;pointer-events:none;' +
      'z-index:99999;transition:transform .4s ease-out,opacity .4s ease-out;}');
    /* monochrome dust: bone / ash / line / hi */
    var colors = ['#d8d3c8', '#8f8a80', '#3a3a38', '#f2ede2'];
    var live = [];
    var lx = -1e9, ly = -1e9;
    document.addEventListener('pointermove', function (e) {
      var dx = e.clientX - lx, dy = e.clientY - ly;
      if (dx * dx + dy * dy < 24 * 24) return; /* spawn every >=24px */
      lx = e.clientX; ly = e.clientY;
      var s = document.createElement('div');
      s.className = 'fx-sparkle';
      s.style.left = (e.clientX - 1) + 'px';
      s.style.top = (e.clientY - 1) + 'px';
      s.style.background = colors[(Math.random() * colors.length) | 0];
      document.body.appendChild(s);
      live.push(s);
      while (live.length > max) { /* cap live nodes */
        var old = live.shift();
        if (old.parentNode) old.parentNode.removeChild(old);
      }
      requestAnimationFrame(function () {
        s.style.transform = 'translateY(14px)'; /* slight drift, dust-like */
        s.style.opacity = '0';                  /* quick fade over ~400ms */
      });
      setTimeout(function () {
        if (s.parentNode) s.parentNode.removeChild(s);
        var i = live.indexOf(s);
        if (i !== -1) live.splice(i, 1);
      }, 420);
    });
  };

  /* ------------------------------------------------------------------------
     FX.popup(html, {title}): centered draggable mono terminal box.
     OK / X remove it. Returns the element.
  ------------------------------------------------------------------------ */
  FX.popup = function (html, opts) {
    opts = opts || {};
    var title = '== ' + (opts.title || 'SYSTEM') + ' ==';
    css('popup',
      '.fx-win{position:fixed;left:calc(50% - 170px);top:calc(50% - 90px);' +
      'width:340px;background:#0a0a0a;border:1px solid #3a3a38;' +
      'box-shadow:6px 6px 0 #0a0a0a,7px 7px 0 #3a3a38;' +
      'font-family:\'Courier New\',monospace;}' +
      '.fx-titlebar{height:24px;line-height:24px;' +
      'background:#111;color:#d8d3c8;border-bottom:1px solid #3a3a38;' +
      'font-weight:bold;font-size:12px;font-family:\'Courier New\',monospace;' +
      'letter-spacing:1px;text-transform:uppercase;' +
      'padding:0 4px 0 8px;cursor:move;display:flex;' +
      'justify-content:space-between;align-items:center;user-select:none;}' +
      '.fx-x{width:22px;height:18px;background:transparent;' +
      'border:1px solid #3a3a38;color:#d8d3c8;' +
      'font:bold 12px \'Courier New\',monospace;line-height:1;' +
      'cursor:pointer;padding:0;}' +
      '.fx-x:hover{background:#d8d3c8;color:#0a0a0a;}' +
      '.fx-body{padding:14px;font-size:12px;color:#d8d3c8;background:#0a0a0a;}' +
      '.fx-foot{text-align:center;padding:0 0 12px;background:#0a0a0a;}' +
      '.fx-ok{border:1px solid #3a3a38;background:transparent;color:#d8d3c8;' +
      'padding:3px 18px;font:12px \'Courier New\',monospace;cursor:pointer;}' +
      '.fx-ok:hover{background:#d8d3c8;color:#0a0a0a;}' +
      '.fx-ok:active{background:#8f8a80;color:#0a0a0a;}');

    var win = document.createElement('div');
    win.className = 'fx-win';
    var bar = document.createElement('div');
    bar.className = 'fx-titlebar';
    var t = document.createElement('span');
    t.textContent = title;
    var x = document.createElement('button');
    x.className = 'fx-x';
    x.textContent = 'X';
    bar.appendChild(t);
    bar.appendChild(x);
    var body = document.createElement('div');
    body.className = 'fx-body';
    body.innerHTML = html; /* caller is trusted */
    var foot = document.createElement('div');
    foot.className = 'fx-foot';
    var ok = document.createElement('button');
    ok.className = 'fx-ok';
    ok.textContent = '[ OK ]';
    foot.appendChild(ok);
    win.appendChild(bar);
    win.appendChild(body);
    win.appendChild(foot);
    document.body.appendChild(win);
    win.style.zIndex = ++FX._z;
    FX.drag(win, bar);
    function close() { if (win.parentNode) win.parentNode.removeChild(win); }
    ok.addEventListener('click', close);
    x.addEventListener('click', close);
    return win;
  };

  /* ------------------------------------------------------------------------
     FX.hitCounter(el, {start}): localStorage 'il1a_hits', +1 per call,
     renders 7 zero-padded digits as <span class="dg">.
  ------------------------------------------------------------------------ */
  FX.hitCounter = function (el, opts) {
    opts = opts || {};
    var k = 'il1a_hits';
    var n;
    try {
      n = parseInt(localStorage.getItem(k), 10) || (opts.start || 1337);
      n++;
      localStorage.setItem(k, String(n));
    } catch (err) { /* storage blocked (file://, privacy mode): fake it */
      n = (opts.start || 1337) + 1;
    }
    css('dg',
      '.dg{background:#0a0a0a;color:#d8d3c8;border:1px solid #3a3a38;' +
      'padding:0 2px;font:700 14px \'Courier New\',monospace;margin:0 1px;}');
    var s = String(n).padStart(7, '0');
    el.textContent = '';
    for (var i = 0; i < s.length; i++) {
      var d = document.createElement('span');
      d.className = 'dg';
      d.textContent = s.charAt(i);
      el.appendChild(d);
    }
  };

  /* ------------------------------------------------------------------------
     FX.clock(el, {fmt}): 'full' = DD.MM.YYYY HH:MM:SS, 'time' = HH:MM.
     Renders immediately, then every second.
  ------------------------------------------------------------------------ */
  FX.clock = function (el, opts) {
    opts = opts || {};
    var fmt = opts.fmt || 'full';
    function p2(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var d = new Date();
      var hm = p2(d.getHours()) + ':' + p2(d.getMinutes());
      el.textContent = (fmt === 'time')
        ? hm
        : p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + d.getFullYear() +
          ' ' + hm + ':' + p2(d.getSeconds());
    }
    tick();
    return setInterval(tick, 1000);
  };

  /* ------------------------------------------------------------------------
     FX.typewriter(el, text, {cps}): types plain text ('\n' -> <br>),
     one char per tick. Returns a cancel function.
  ------------------------------------------------------------------------ */
  FX.typewriter = function (el, text, opts) {
    opts = opts || {};
    var delay = 1000 / (opts.cps || 30);
    var i = 0;
    var timer = setInterval(function () {
      if (i >= text.length) { clearInterval(timer); return; }
      var ch = text.charAt(i++);
      if (ch === '\n') {
        el.appendChild(document.createElement('br'));
      } else if (el.lastChild && el.lastChild.nodeType === 3) {
        el.lastChild.nodeValue += ch;
      } else {
        el.appendChild(document.createTextNode(ch));
      }
    }, delay);
    return function () { clearInterval(timer); };
  };

  /* ------------------------------------------------------------------------
     FX.tune: WebAudio drone loop, ~80bpm, sparse and dark.
     Slow low triangle drone + faint square octave, occasional single
     high blip. Master gain 0.07.
     start()/stop() are repeatable; AudioContext created lazily and
     resumed inside start() (user-gesture safe).
  ------------------------------------------------------------------------ */
  FX.tune = (function () {
    var ctx = null, master = null, timer = null, playing = false;
    var step = 0, nextT = 0;
    var BEAT = 60 / 80; /* quarter note at 80bpm = 0.75s */
    /* slow low drone: A1 E2 G1 D2 movement */
    var DRONE = [55.00, 55.00, 82.41, 55.00, 49.00, 55.00, 82.41, 73.42];
    /* sparse high blips: A6 E6 C6 G6 */
    var BLIP = [1760.00, 1318.51, 1046.50, 1567.98];
    function note(type, freq, t, dur, vol, attack) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.setValueAtTime(vol, t + Math.max(attack, dur - 0.1));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
    function tick() { /* lookahead scheduler: every 25ms, schedule 0.1s ahead */
      while (nextT < ctx.currentTime + 0.1) {
        var d = DRONE[step % 8];
        /* low drone: sustained triangle + faint square octave above */
        note('triangle', d, nextT, BEAT * 1.05, 0.6, 0.25);
        note('square', d * 2, nextT, BEAT * 0.95, 0.1, 0.35);
        /* one sparse high blip every 4 beats, off the half-beat */
        if (step % 4 === 2) {
          note('square', BLIP[((step / 4) | 0) % 4], nextT + BEAT * 0.5, 0.12, 0.16, 0.005);
        }
        nextT += BEAT;
        step++;
      }
    }
    return {
      get playing() { return playing; },
      start: function () {
        if (playing) return;
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        if (!ctx) {
          ctx = new AC();
          master = ctx.createGain();
          master.gain.value = 0.07;
          master.connect(ctx.destination);
        }
        ctx.resume();
        step = 0;
        nextT = ctx.currentTime + 0.06;
        timer = setInterval(tick, 25);
        playing = true;
      },
      stop: function () {
        if (timer) { clearInterval(timer); timer = null; }
        if (ctx) ctx.suspend();
        playing = false;
      }
    };
  })();

  /* ------------------------------------------------------------------------
     FX.konami(cb): U U D D L R L R B A -> cb(). Resets on mismatch.
  ------------------------------------------------------------------------ */
  FX.konami = function (cb) {
    var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
               'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
               'KeyB', 'KeyA'];
    var i = 0;
    document.addEventListener('keydown', function (e) {
      if (e.code === seq[i]) {
        i++;
        if (i === seq.length) { i = 0; cb(); }
      } else {
        i = (e.code === seq[0]) ? 1 : 0;
      }
    });
  };

  window.FX = FX;
})();
