/*!
 * hoBIT 위젯 임베드 스크립트
 *
 * 다른 사이트(예: 정보대학 홈페이지)에 한 줄로 호빗을 띄운다 — 배경은 그 사이트 화면 그대로.
 *   <script src="https://widget.hobit.kr/embed.js" defer></script>
 *
 * 옵션 (script 태그 data- 속성)
 *   data-open="true"   처음부터 창을 연 상태로 (기본: 닫힘 — 버튼만)
 *   data-origin="..."  호빗 주소 (기본: 이 스크립트를 불러온 주소)
 *
 * 창 안은 호빗 앱을 iframe(?embed=1)으로 띄움 → 세션·테마·언어 설정은 호빗 도메인에 저장되고,
 * 그 사이트의 스타일과 섞이지 않게 버튼·창은 Shadow DOM 안에 그린다.
 * 닫기: 창 바깥(배경)을 누르거나, 호빗 버튼을 다시 누르거나, Esc. 모바일은 아래에서 올라오는 시트.
 * 크기 조절: 창의 왼쪽·위·왼쪽 위 모서리를 끌기 (최소 360×480, 최대 760×화면 높이 90%), 기기에 기억.
 */
(function () {
  'use strict';
  if (window.__hobitWidgetLoaded) return;
  window.__hobitWidgetLoaded = true;

  var script = document.currentScript || document.querySelector('script[src*="embed.js"]');
  var ORIGIN = (script && script.dataset.origin) || (script ? new URL(script.src, location.href).origin : location.origin);
  var START_OPEN = script && script.dataset.open === 'true';

  var MIN_W = 360, MIN_H = 480, MAX_W = 760, MAX_H_RATIO = 0.9;
  var DEFAULT = { w: 420, h: 640 };
  var MOBILE = 640, EDGE = 20, LAUNCHER = 60, SHEET_TOP = 56;
  var SIZE_KEY = 'hobit-widget-size', OPEN_KEY = 'hobit-widget-open';

  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function isMobile() { return window.innerWidth < MOBILE; }
  function clampSize(s) {
    var maxW = Math.max(MIN_W, Math.min(MAX_W, window.innerWidth - EDGE * 2));
    var maxH = Math.max(MIN_H, Math.min(window.innerHeight * MAX_H_RATIO, window.innerHeight - (EDGE + LAUNCHER + 12) - EDGE));
    return { w: Math.round(Math.min(Math.max(s.w, MIN_W), maxW)), h: Math.round(Math.min(Math.max(s.h, MIN_H), maxH)) };
  }

  var host = document.createElement('div');
  host.id = 'hobit-widget';
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: 'open' });

  root.innerHTML = [
    '<style>',
    ':host { all: initial; }',
    '.backdrop { position: fixed; inset: 0; z-index: 2147483000; background: transparent; }',
    '.backdrop.mobile { background: rgba(0,0,0,.4); }',
    '.panel { position: fixed; z-index: 2147483001; display: flex; flex-direction: column; overflow: hidden;',
    '  background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 20px; box-shadow: 0 24px 60px rgba(0,0,0,.25);',
    '  animation: appear .35s ease-out both; }',
    '.panel.mobile { border-radius: 20px 20px 0 0; border: 0; }',
    '.panel iframe { flex: 1; width: 100%; border: 0; background: transparent; }',
    '.panel.dragging iframe { pointer-events: none; }',
    '.h-left { position: absolute; left: 0; top: 16px; bottom: 0; width: 8px; cursor: ew-resize; }',
    '.h-top { position: absolute; top: 0; left: 16px; right: 0; height: 6px; cursor: ns-resize; }',
    '.h-corner { position: absolute; top: 0; left: 0; width: 18px; height: 18px; cursor: nwse-resize; }',
    '.h-corner svg { margin: 4px; width: 9px; height: 9px; color: #9ca3af; }',
    '.launcher { position: fixed; right: ' + EDGE + 'px; bottom: ' + EDGE + 'px; width: ' + LAUNCHER + 'px; height: ' + LAUNCHER + 'px;',
    '  z-index: 2147483002; border-radius: 50%; border: 1px solid rgba(0,0,0,.12); background: #fff; cursor: pointer; padding: 0;',
    '  display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.2); }',
    '.launcher img { width: 46px; height: 46px; object-fit: contain; }',
    '.launcher:hover img { animation: wiggle .65s ease-in-out; }',
    '@keyframes appear { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }',
    '@keyframes wiggle { 0%,100% { transform: rotate(0); } 15% { transform: rotate(-22deg); } 35% { transform: rotate(16deg); }',
    '  55% { transform: rotate(-10deg); } 75% { transform: rotate(5deg); } }',
    '@media (prefers-reduced-motion: reduce) { .panel { animation: none; } .launcher:hover img { animation: none; } }',
    '@media (prefers-color-scheme: dark) { .panel, .launcher { background: #1e1e22; border-color: rgba(255,255,255,.14); } }',
    '</style>',
    '<button class="launcher" type="button" aria-label="호빗에게 물어보기" aria-expanded="false">',
    '  <img alt="" src="' + ORIGIN + '/profile_clear.png" />',
    '</button>'
  ].join('\n');

  var launcher = root.querySelector('.launcher');
  var size = clampSize(read(SIZE_KEY, DEFAULT));
  var open = false, backdrop = null, panel = null, frame = null;

  function layout() {
    if (!panel) return;
    var m = isMobile();
    panel.classList.toggle('mobile', m);
    backdrop.classList.toggle('mobile', m);
    launcher.style.display = m ? 'none' : 'flex'; // 모바일은 시트가 버튼을 덮으므로 숨김 (위쪽 배경을 눌러 닫음)
    var st = panel.style;
    if (m) {
      st.top = SHEET_TOP + 'px'; st.left = '0'; st.right = '0'; st.bottom = '0'; st.width = ''; st.height = '';
    } else {
      st.top = ''; st.left = ''; st.right = EDGE + 'px'; st.bottom = (EDGE + LAUNCHER + 12) + 'px';
      st.width = size.w + 'px'; st.height = size.h + 'px';
    }
  }

  function startDrag(edge) {
    return function (e) {
      e.preventDefault();
      var start = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
      e.target.setPointerCapture(e.pointerId);
      panel.classList.add('dragging');
      function move(ev) {
        size = clampSize({
          w: edge === 'top' ? start.w : start.w + (start.x - ev.clientX),
          h: edge === 'left' ? start.h : start.h + (start.y - ev.clientY)
        });
        layout();
      }
      function end() {
        panel.classList.remove('dragging');
        e.target.removeEventListener('pointermove', move);
        e.target.removeEventListener('pointerup', end);
        e.target.removeEventListener('pointercancel', end);
        write(SIZE_KEY, size);
      }
      e.target.addEventListener('pointermove', move);
      e.target.addEventListener('pointerup', end);
      e.target.addEventListener('pointercancel', end);
    };
  }

  function build() {
    backdrop = document.createElement('div');
    backdrop.className = 'backdrop';
    backdrop.addEventListener('click', function () { setOpen(false); });

    panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '호빗 대화창');
    frame = document.createElement('iframe');
    frame.setAttribute('aria-label', '호빗 대화창'); // title을 쓰면 Safari가 마우스를 올릴 때 "호빗" 툴팁을 띄움
    frame.allow = 'clipboard-write';
    panel.appendChild(frame);

    [['h-left', 'left'], ['h-top', 'top'], ['h-corner', 'corner']].forEach(function (h) {
      var el = document.createElement('div');
      el.className = h[0];
      if (h[1] === 'corner') {
        el.title = '끌어서 크기 조절';
        el.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 9 9 1M1 5 5 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
      }
      el.addEventListener('pointerdown', startDrag(h[1]));
      panel.appendChild(el);
    });
  }

  function setOpen(next) {
    open = next;
    write(OPEN_KEY, next);
    launcher.setAttribute('aria-expanded', String(next));
    launcher.setAttribute('aria-label', next ? '호빗 대화창 닫기' : '호빗에게 물어보기');
    if (next && !panel) {
      // iframe은 처음 열 때 한 번만 만듦. 닫을 때는 숨기기만 — 문서에서 떼면 다시 열 때 새로 로드돼 대화가 사라짐
      build();
      root.appendChild(backdrop);
      root.appendChild(panel);
      // 창 크기를 먼저 정한 뒤에 앱을 불러옴 — 기본 크기(약 150px 높이)로 먼저 뜨면 첫 화면 스크롤이 어긋났음
      layout();
      frame.src = ORIGIN + '/?embed=1';
    }
    if (!panel) return;
    backdrop.style.display = next ? '' : 'none';
    panel.style.display = next ? 'flex' : 'none';
    if (next) layout();
    else launcher.style.display = 'flex';
  }

  launcher.addEventListener('click', function () { setOpen(!open); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
  window.addEventListener('resize', function () { size = clampSize(size); layout(); });

  if (START_OPEN || read(OPEN_KEY, false)) setOpen(true);
})();
