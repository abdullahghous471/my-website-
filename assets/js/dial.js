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

  // a small icon for each kind of work, so every moment reads like an app notification
  const ICON = {
    'virtual': '<path d="M3.5 13.5 6 5.5h12l2.5 8V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/><path d="M3.5 13.5h4.8l1.2 2h5l1.2-2h4.8"/>',
    'support': '<path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1"/><rect x="3.5" y="13" width="4" height="6" rx="1.6"/><rect x="16.5" y="13" width="4" height="6" rx="1.6"/>',
    'project': '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9.2 4v16M14.8 4v16"/>',
    'crm': '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><circle cx="17" cy="9.5" r="2.3"/><path d="M15.8 14.8c2.4-.3 4.3 1.2 4.8 3.9"/>',
    'technical': '<rect x="7.5" y="8" width="9" height="11" rx="4.5"/><path d="M12 8V5.5M7.5 12H4.5M19.5 12h-3M7.5 16.5l-2.5 1.5M16.5 16.5l2.5 1.5"/>',
    'requirements': '<path d="M7 3.5h7l4 4V20.5H6.5V3.5z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 15.5h5"/>',
    'stakeholder': '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v4a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 3v-3A2.5 2.5 0 0 1 4 10.5z"/><path d="M16 9h1.5A2.5 2.5 0 0 1 20 11.5V15l-3 2.5h-3"/>',
    'you': '<path d="M12 3.5l2.2 5.3 5.3 2.2-5.3 2.2L12 18.5l-2.2-5.3L4.5 11l5.3-2.2z"/>'
  };
  cards.forEach(c => {
    const svc = (c.querySelector('.dial__svc') || {}).textContent || '';
    const key = Object.keys(ICON).find(k => svc.toLowerCase().includes(k)) || 'you';
    const ic = document.createElement('span'); ic.className = 'ntf__ic'; ic.setAttribute('aria-hidden', 'true');
    ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICON[key] + '</svg>';
    c.prepend(ic);
  });
  // live status above the cards: "Live" dot, task count and a segmented progress bar
  const side = sec.querySelector('.dial__cards');
  const meta = document.createElement('div'); meta.className = 'dial__meta'; meta.setAttribute('aria-hidden', 'true');
  meta.innerHTML = '<span class="dial__live"><i></i>Live · your day, handled</span><span class="dial__cnt"><b data-cnt>1</b> / ' + cards.length + ' done</span><span class="dial__seg">' + cards.map(() => '<i></i>').join('') + '</span>';
  if (side) side.before(meta);
  const segs = [...meta.querySelectorAll('.dial__seg i')], cnt = meta.querySelector('[data-cnt]');
  // the current kind of work, shown under the time in the middle of the clock
  const now = document.createElement('p'); now.className = 'dial__now';
  const centre = sec.querySelector('.dial__centre'); if (centre) centre.appendChild(now);
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
      cards.forEach((c, i) => {
        const depth = idx - i;   // 0 = newest notification, 1-2 = stacked below, others hidden
        c.classList.toggle('on', i === idx); c.classList.toggle('past', i < idx);
        c.dataset.depth = depth >= 0 && depth <= 2 ? depth : 'x';
        c.setAttribute('aria-hidden', String(i !== idx));
      });
      // place the stacked notifications right under the newest one
      const at = d => cards.find(c => c.dataset.depth === String(d));
      const c0 = at(0), c1 = at(1), c2 = at(2);
      const y1 = c0 ? c0.offsetHeight + 10 : 0;
      if (c1) c1.style.setProperty('--y', y1 + 'px');
      if (c2) c2.style.setProperty('--y', (y1 + (c1 ? c1.offsetHeight * .94 : 0) + 8) + 'px');
      segs.forEach((g, i) => { g.classList.toggle('on', i < idx); g.classList.toggle('cur', i === idx); });
      if (cnt) cnt.textContent = idx + 1;
      now.textContent = (cards[idx].querySelector('.dial__svc') || {}).textContent || '';
      if (num) num.textContent = String(idx + 1).padStart(2, '0'); shown = idx;
    }
  };

  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.5, (now - last) / 1000); last = now;   // keep real-time pace even on slow devices
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
