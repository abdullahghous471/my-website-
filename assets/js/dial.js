/* Helmwork · "A day, handled" as a clock dial that plays by itself.
   The hand sweeps 08:00 → 18:00, stopping on each moment so its story card can be read, then starts again.
   Visitors can pause or play it, click a moment on the dial to jump there, or simply scroll on. */
(() => {
  const sec = document.querySelector('[data-dial]');
  if (!sec) return;
  const NS = 'http://www.w3.org/2000/svg', C = 300, R = 236;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...sec.querySelectorAll('[data-card]')];
  const prog = sec.querySelector('[data-prog]'), hand = sec.querySelector('[data-hand]'), clock = sec.querySelector('[data-clock]'), num = sec.querySelector('[data-n]');
  const playBtn = sec.querySelector('[data-dial-play]'), playLabel = sec.querySelector('[data-dial-play-label]');
  const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmt = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
  const T0 = mins('08:00'), T1 = mins('18:00');
  const ang = m => (m - T0) / (T1 - T0) * 360;
  const pt = (a, r) => [C + Math.sin(a * Math.PI / 180) * r, C - Math.cos(a * Math.PI / 180) * r];
  const el = (n, at) => { const e = document.createElementNS(NS, n); for (const k in at) e.setAttribute(k, at[k]); return e; };

  // ticks every 15 minutes, hours longer and labelled
  const ticks = sec.querySelector('[data-ticks]');
  for (let m = T0; m < T1; m += 15) {
    const a = ang(m), hour = m % 60 === 0, [x1, y1] = pt(a, hour ? 262 : 268), [x2, y2] = pt(a, 276);
    ticks.appendChild(el('line', { x1, y1, x2, y2, class: hour ? 'tk tk--h' : 'tk' }));
    if (hour) { const [lx, ly] = pt(a, 292); const t = el('text', { x: lx, y: ly + 4, class: 'tk__l' }); t.textContent = String(m / 60).padStart(2, '0'); ticks.appendChild(t); }
  }
  // a clickable node for every moment
  const nodesG = sec.querySelector('[data-nodes]');
  const stops = cards.map(c => Math.min(mins(c.dataset.time), T1));
  const nodes = cards.map((c, i) => {
    const a = ang(Math.min(stops[i], T1 - .01)), [x, y] = pt(a, R);
    const g = el('g', { class: 'nd', tabindex: '0', role: 'button', 'aria-label': 'Show ' + c.dataset.time });
    g.appendChild(el('circle', { cx: x, cy: y, r: 13, class: 'nd__halo' })); g.appendChild(el('circle', { cx: x, cy: y, r: 6, class: 'nd__dot' }));
    const go = () => { cur = stops[i]; target = i; hold = 0; setPlaying(false); };
    g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    nodesG.appendChild(g); return { g, m: stops[i] };
  });
  const LEN = 2 * Math.PI * R;
  prog.style.strokeDasharray = LEN;

  // timing: sweep to the next moment, then rest on it so its card can be read
  const SWEEP = .5, REST = 1, END_REST = 2;   // seconds
  let cur = T0, target = 0, hold = 0, playing = !reduce, visible = false, shown = -1, last = performance.now();
  if (reduce) { cur = T1; target = stops.length - 1; }

  function setPlaying(p) {
    playing = p;
    sec.classList.toggle('is-paused', !p);
    if (playBtn) { playBtn.setAttribute('aria-label', p ? 'Pause the day' : 'Play the day'); playLabel.textContent = p ? 'Pause' : 'Play'; }
  }
  if (playBtn) playBtn.addEventListener('click', () => {
    if (!playing && target >= stops.length - 1 && cur >= T1 - .5) { cur = T0; target = 0; hold = 0; }
    setPlaying(!playing);
  });
  setPlaying(playing);

  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .25 }).observe(sec);

  const draw = () => {
    const a = ang(cur);
    hand.setAttribute('transform', `rotate(${a} ${C} ${C})`);
    prog.style.strokeDashoffset = LEN * (1 - (cur - T0) / (T1 - T0));
    clock.textContent = fmt(cur);
    let idx = 0; nodes.forEach((n, i) => { const on = cur >= n.m - 1; n.g.classList.toggle('on', on); if (on) idx = i; });
    sec.classList.toggle('is-done', cur >= T1 - 2);
    if (idx !== shown) {
      cards.forEach((c, i) => { c.classList.toggle('on', i === idx); c.classList.toggle('past', i < idx); c.setAttribute('aria-hidden', String(i !== idx)); });
      if (num) num.textContent = String(idx + 1).padStart(2, '0'); shown = idx;
    }
  };

  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    if (playing) {
      const goal = stops[target];
      if (cur < goal - .2) {
        const step = Math.max((goal - (target ? stops[target - 1] : T0)) / SWEEP, 30) * dt;
        cur = Math.min(goal, cur + step);
      } else {
        cur = goal; hold += dt;
        const rest = target >= stops.length - 1 ? END_REST : REST;
        if (hold >= rest) {
          hold = 0;
          if (target >= stops.length - 1) { cur = T0; target = 0; } else target++;
        }
      }
    }
    draw();
  };
  draw();
  requestAnimationFrame(tick);
})();
