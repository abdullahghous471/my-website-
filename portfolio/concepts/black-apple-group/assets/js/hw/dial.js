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
  const fmt = m => String(Math.floor(m / 60));
  const T0 = mins('20:00'), T1 = mins('80:00');
  const ang = m => (m - T0) / (T1 - T0) * 360;
  const pt = (a, r) => [C + Math.sin(a * Math.PI / 180) * r, C - Math.cos(a * Math.PI / 180) * r];
  const el = (n, at) => { const e = document.createElementNS(NS, n); for (const k in at) e.setAttribute(k, at[k]); return e; };

  // ticks every 15 minutes, hours longer and labelled
  const ticks = sec.querySelector('[data-ticks]');
  for (let m = T0; m < T1; m += 60) {
    const a = ang(m), hour = m % 600 === 0, [x1, y1] = pt(a, hour ? 262 : 268), [x2, y2] = pt(a, 276);
    ticks.appendChild(el('line', { x1, y1, x2, y2, class: hour ? 'tk tk--h' : 'tk' }));
    if (hour) { const [lx, ly] = pt(a, 292); const t = el('text', { x: lx, y: ly + 4, class: 'tk__l' }); t.textContent = String(m / 60); ticks.appendChild(t); }
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
    'term': '<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    'mortgage': '<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V20h12V9.5M10 20v-5.5h4V20"/>',
    'living': '<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    'disability': '<path d="M3 12h4l2-5 3.5 10 2.5-6 1.5 1H21"/>',
    'review': '<path d="M7 3.5h7l4 4V20.5H6.5V3.5z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 15.5h5"/>',
    'debt': '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    'retire': '<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0"/><path d="M12 6.5v2M5.6 9.6 7 11M18.4 9.6 17 11"/>',
    'you': '<path d="M12 21c-4-3-7-6.3-7-10.3C5 6 8 4.5 9.6 4.5c1 0 1.8.4 2.4 1 .6-.6 1.4-1 2.4-1C16 4.5 19 6 19 10.7 19 14.7 16 18 12 21z"/><path d="M12 5.5c0-1.2.5-2.2 1.6-3"/>'
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
  meta.innerHTML = '<span class="dial__live"><i></i>A life, protected</span><span class="dial__cnt"><b data-cnt>1</b> / ' + cards.length + ' stages</span><span class="dial__seg">' + cards.map(() => '<i></i>').join('') + '</span>';
  if (side) side.before(meta);
  const segs = [...meta.querySelectorAll('.dial__seg i')], cnt = meta.querySelector('[data-cnt]');
  // the current kind of work, shown under the time in the middle of the clock
  const now = document.createElement('p'); now.className = 'dial__now';
  const centre = sec.querySelector('.dial__centre'); if (centre) centre.appendChild(now);
  const LEN = 2 * Math.PI * R;
  prog.style.strokeDasharray = LEN;

  // timing: sweep to the next moment, then rest on it so its card can be read
  const SWEEP = .6, REST = 1.6, END_REST = 2.6;   // seconds
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
        const step = Math.max((goal - (target ? stops[target - 1] : T0)) / SWEEP, 300) * dt;
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
