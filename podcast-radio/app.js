// ── Stations ──────────────────────────────────────────────────────
const STATIONS = [
  { id: 'off',    name: 'Off' },
  { id: 'calm',   name: 'Calm' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'money',  name: 'Money talk' },
  { id: 'news',   name: 'News' },
  { id: 'tech',   name: 'Tech talk' },
];

// ── App state ─────────────────────────────────────────────────────
let selected   = 3;   // Money talk on load
let sheetState = 0;   // 0 = minimized, 1 = minimal, 2 = full

// ── Elements ──────────────────────────────────────────────────────
const titleEl     = document.getElementById('appTitle');
const pickerInner = document.getElementById('pickerInner');
const wheelEl     = document.getElementById('wheel');
const canvas      = document.getElementById('wheelCanvas');
const ctx         = canvas.getContext('2d');
const sheetEl     = document.getElementById('sheet');
const handleEl    = document.getElementById('sheetHandle');


// ══ H1 colour animation ═══════════════════════════════════════════
let hue = 210; // start near the Figma blue

(function tickTitle() {
  if (STATIONS[selected].id === 'off') {
    titleEl.style.color = '#888888';
  } else {
    titleEl.style.color = `hsl(${hue}, 65%, 65%)`;
    hue = (hue + 0.2) % 360;
  }
  requestAnimationFrame(tickTitle);
})();


// ══ Station Picker ════════════════════════════════════════════════
const CYL_R   = 100; // cylinder radius in px
const CYL_DEG = 18;  // degrees between items on the cylinder

function buildPicker() {
  STATIONS.forEach((s) => {
    const el = document.createElement('div');
    el.className = 'station-item';
    el.innerHTML = `<span class="station-dot"></span><span>${s.name}</span>`;
    pickerInner.appendChild(el);
  });
}

function updatePicker() {
  [...pickerInner.children].forEach((el, i) => {
    const off = i - selected;
    const rad = off * CYL_DEG * (Math.PI / 180);
    const y   = CYL_R * Math.sin(rad);
    const z   = CYL_R * (Math.cos(rad) - 1);

    el.style.transform = `translateY(${y}px) translateZ(${z}px) rotateX(${-off * CYL_DEG}deg)`;

    const abs = Math.abs(off);
    el.style.opacity = abs > 3 ? '0' : String(Math.max(0, 1 - abs * 0.28).toFixed(2));
    el.style.color   = abs === 0 ? '#ffffff' : abs === 1 ? '#616161' : '#383838';

    el.querySelector('.station-dot').style.visibility = abs === 0 ? 'visible' : 'hidden';
  });
}

buildPicker();
updatePicker();


// ══ Scroll Wheel — rotary gesture ════════════════════════════════
const TICK_DEG  = 20;   // degrees of rotation per station change

let lastAngle   = null;
let accumulated = 0;
let dragging    = false;

function pointerAngle(clientX, clientY) {
  const r  = wheelEl.getBoundingClientRect();
  const dx = clientX - (r.left + r.width  / 2);
  const dy = clientY - (r.top  + r.height / 2);
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function startRotation(clientX, clientY) {
  lastAngle   = pointerAngle(clientX, clientY);
  accumulated = 0;
  dragging    = true;
}

function moveRotation(clientX, clientY) {
  if (!dragging) return;

  const rect = wheelEl.getBoundingClientRect();
  const x    = clientX - rect.left;
  const y    = clientY - rect.top;

  const angle = pointerAngle(clientX, clientY);
  let delta   = angle - lastAngle;
  if (delta >  180) delta -= 360;
  if (delta < -180) delta += 360;
  accumulated += delta;
  lastAngle    = angle;

  // Record touch angle for trail
  trails.push({ angle, t: Date.now() });

  // Advance station per tick
  while (accumulated >= TICK_DEG) {
    if (selected < STATIONS.length - 1) { selected++; updatePicker(); haptic(); }
    accumulated -= TICK_DEG;
  }
  while (accumulated <= -TICK_DEG) {
    if (selected > 0) { selected--; updatePicker(); haptic(); }
    accumulated += TICK_DEG;
  }
}

function endRotation() {
  dragging  = false;
  lastAngle = null;
}

// Touch
wheelEl.addEventListener('touchstart', e => {
  e.preventDefault();
  startRotation(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

wheelEl.addEventListener('touchmove', e => {
  e.preventDefault();
  moveRotation(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

wheelEl.addEventListener('touchend', endRotation);
wheelEl.addEventListener('touchcancel', endRotation);

// Mouse (desktop testing)
wheelEl.addEventListener('mousedown', e => {
  e.preventDefault();
  startRotation(e.clientX, e.clientY);
});
document.addEventListener('mousemove', e => moveRotation(e.clientX, e.clientY));
document.addEventListener('mouseup', endRotation);

function haptic() {
  if (navigator.vibrate) navigator.vibrate(8);
}


// ══ Wheel — touch trail (canvas) ══════════════════════════════════
const trails     = [];
const TRAIL_MS   = 480;  // fade duration
const TRAIL_RMAX = 150;  // max spoke length px (wheel radius)

(function drawFrame() {
  ctx.clearRect(0, 0, 300, 300);
  const now = Date.now();

  for (const tr of trails) {
    const age = now - tr.t;
    if (age >= TRAIL_MS) continue;

    const progress = 1 - age / TRAIL_MS;
    const opacity  = progress * 0.55;
    const a = tr.angle * (Math.PI / 180);

    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.lineTo(150 + Math.cos(a) * TRAIL_RMAX, 150 + Math.sin(a) * TRAIL_RMAX);
    ctx.strokeStyle = `rgba(255,255,255,${opacity.toFixed(2)})`;
    ctx.stroke();
  }

  // Prune expired entries
  while (trails.length > 0 && now - trails[0].t >= TRAIL_MS) trails.shift();

  requestAnimationFrame(drawFrame);
})();


// ══ Bottom Sheet ══════════════════════════════════════════════════
// translateY values that position each state:
//   minimized → 39px of sheet visible (just the handle)
//   minimal   → 128px visible (handle + titles)
//   full      → entire sheet visible
function computeSheetY() {
  const h = window.innerHeight;
  return [h - 112, h - 201, 0];
}
let SHEET_Y = computeSheetY();
window.addEventListener('resize', () => {
  SHEET_Y = computeSheetY();
  setSheet(sheetState, false);
});

function setSheet(state, animate = true) {
  sheetState = state;
  sheetEl.style.transition = animate
    ? 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)'
    : 'none';
  sheetEl.style.transform = `translateY(${SHEET_Y[state]}px)`;
}

// Drag + tap on the handle
let dragY0     = null;
let dragBase   = null;
let touchMoved = false;

handleEl.addEventListener('touchstart', e => {
  dragY0     = e.touches[0].clientY;
  dragBase   = SHEET_Y[sheetState];
  touchMoved = false;
}, { passive: true });

handleEl.addEventListener('touchmove', e => {
  if (dragY0 === null) return;
  const dy = e.touches[0].clientY - dragY0;
  if (Math.abs(dy) > 6) touchMoved = true;
  if (!touchMoved) return;

  const pos = Math.max(0, Math.min(SHEET_Y[0], dragBase + dy));
  sheetEl.style.transition = 'none';
  sheetEl.style.transform  = `translateY(${pos}px)`;
}, { passive: true });

handleEl.addEventListener('touchend', e => {
  if (dragY0 === null) return;
  const dy = e.changedTouches[0].clientY - dragY0;
  dragY0 = null;

  if (!touchMoved) {
    // Tap: cycle through states
    setSheet((sheetState + 1) % 3);
  } else if (dy < -40) {
    setSheet(Math.max(0, sheetState - 1));
  } else if (dy > 40) {
    setSheet(Math.min(2, sheetState + 1));
  } else {
    setSheet(sheetState); // snap back
  }
});

// Desktop: click cycles states
handleEl.addEventListener('click', () => {
  if (touchMoved) return;
  setSheet((sheetState + 1) % 3);
});

// Init
setSheet(0, false);
