/* Helmwork · About: fifteen tools orbit the Helmwork hub on three light rings.
   Rings are drawn with depth (bright in front, faint behind) and travelling comets;
   hovering a tool pauses the orbit, draws a connector to the hub and shows how it is used. */
(() => {
  const stage = document.querySelector('[data-orbit2]');
  if (!stage) return;
  const cv = stage.querySelector('[data-orbit-cv]'), ctx = cv.getContext('2d');
  const chips = [...stage.querySelectorAll('[data-chip]')], use = stage.querySelector('[data-orbit-use]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = [[165, 92], [235, 140], [292, 190]], SPD = [.16, -.11, .075];
  const COL = [[255, 154, 107], [255, 111, 168], [143, 162, 255]];
  const byRing = [0, 1, 2].map(r => chips.filter(c => +c.dataset.ring === r));
  const items = chips.map(c => { const r = +c.dataset.ring, list = byRing[r]; return { c, r, a: list.indexOf(c) / list.length * Math.PI * 2 + r * .6, x: 0, y: 0 }; });
  chips.forEach(c => c.style.setProperty('--dot', `rgb(${COL[+c.dataset.ring].join(',')})`));
  let paused = false, hot = null, mx = 0, my = 0, tmx = 0, tmy = 0, link = 0;
  if (matchMedia('(hover: none)').matches) use.textContent = use.textContent.replace('Hover', 'Tap');
  const def = use.textContent;
  chips.forEach(c => {
    const on = () => { paused = true; hot = c; use.textContent = c.dataset.use; stage.classList.add('is-hover'); c.classList.add('hot'); };
    const off = () => { paused = false; hot = null; use.textContent = def; stage.classList.remove('is-hover'); c.classList.remove('hot'); };
    c.addEventListener('pointerenter', on); c.addEventListener('pointerleave', off); c.addEventListener('focus', on); c.addEventListener('blur', off); c.addEventListener('click', on);
  });
  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - .5; tmy = (e.clientY - r.top) / r.height - .5; });
  stage.addEventListener('pointerleave', () => { tmx = tmy = 0; });
  let W = 0, H = 0, dpr = 1;
  const size = () => { dpr = Math.min(devicePixelRatio, 2); W = stage.clientWidth; H = stage.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };
  addEventListener('resize', size); size();
  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
  let last = performance.now(), t = 0;
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible) return;
    t += reduce ? 0 : dt;
    if (!paused) { mx += (tmx - mx) * .06; my += (tmy - my) * .06; }
    const s = W / 600 * (W < 500 ? .8 : 1), tilt = 1 + my * .5, cx = W / 2, cy = H / 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    // rings: many short segments, alpha by depth (front = sin > 0)
    R.forEach(([rx, ry], r) => {
      const [cr, cg, cb] = COL[r], n = 140;
      for (let k = 0; k < n; k++) {
        const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2, d = (Math.sin((a0 + a1) / 2) + 1) / 2;
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${.05 + d * .38})`; ctx.lineWidth = .6 + d * .9;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a0) * rx * s, cy + Math.sin(a0) * ry * s * tilt); ctx.lineTo(cx + Math.cos(a1) * rx * s, cy + Math.sin(a1) * ry * s * tilt); ctx.stroke();
      }
      // two comets per ring travelling along it
      for (let m = 0; m < 2; m++) {
        const head = (t * (.35 + r * .08) * (r === 1 ? -1 : 1) + m * Math.PI + r) % (Math.PI * 2);
        for (let j = 0; j < 22; j++) {
          const a = head - j * .025 * (r === 1 ? -1 : 1), d = (Math.sin(a) + 1) / 2, al = (1 - j / 22) * (.25 + d * .75);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${al})`;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rx * s, cy + Math.sin(a) * ry * s * tilt, (1.8 - j * .06) * (.6 + d * .6), 0, 7); ctx.fill();
        }
      }
    });
    // chips
    items.forEach(it => {
      if (!paused && !reduce) it.a += SPD[it.r] * dt;
      const [rx, ry] = R[it.r], a = it.a + mx * .6;
      it.x = Math.cos(a) * rx * s; it.y = Math.sin(a) * ry * s * tilt;
      const d = (Math.sin(a) + 1) / 2, sc = (.8 + d * .28) * (it.c === hot ? 1.1 : 1);
      it.c.style.transform = `translate(-50%, -50%) translate(${it.x}px, ${it.y}px) scale(${sc})`;
      it.c.style.opacity = it.c === hot ? 1 : (.35 + d * .65) * (paused ? .45 : 1);
      it.c.style.zIndex = Math.round(d * 100) + (it.c === hot ? 200 : 0);
      it.c.style.filter = d < .35 && it.c !== hot ? `blur(${(.35 - d) * 4}px)` : 'none';
    });
    // connector from the hub to the hovered tool
    link += ((hot ? 1 : 0) - link) * (1 - Math.pow(.0005, dt)); if (hot && link > .985) link = 1;
    if (link > .02 && hot) {
      const it = items.find(i => i.c === hot), ex = cx + it.x, ey = cy + it.y;
      const g = ctx.createLinearGradient(cx, cy, ex, ey); g.addColorStop(0, 'rgba(255,154,107,0)'); g.addColorStop(.3, 'rgba(255,111,168,.9)'); g.addColorStop(1, 'rgba(143,162,255,.9)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.shadowColor = '#FF8FB4'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (ex - cx) * link, cy + (ey - cy) * link); ctx.stroke(); ctx.shadowBlur = 0;
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  requestAnimationFrame(tick);
})();
