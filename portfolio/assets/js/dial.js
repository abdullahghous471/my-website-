/* Helmwork · "A day, handled" as a clock dial: a glowing hand sweeps 08:00 → 18:00 while you scroll,
   each moment's node lights up and its story card takes the stage beside the dial. */
(() => {
  const sec = document.querySelector('[data-dial]');
  if (!sec) return;
  const NS = 'http://www.w3.org/2000/svg', C = 300, R = 236;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...sec.querySelectorAll('[data-card]')];
  const prog = sec.querySelector('[data-prog]'), hand = sec.querySelector('[data-hand]'), clock = sec.querySelector('[data-clock]'), num = sec.querySelector('[data-n]');
  const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmt = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.floor(m % 60)).padStart(2, '0');
  const T0 = mins('08:00'), T1 = mins('18:00');
  // the working day uses the dial from 12 o'clock round to 12 o'clock again
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
  // a node for every moment
  const nodesG = sec.querySelector('[data-nodes]');
  const nodes = cards.map(c => {
    const a = ang(Math.min(mins(c.dataset.time), T1 - .01)), [x, y] = pt(a, R);
    const g = el('g', { class: 'nd' }); g.appendChild(el('circle', { cx: x, cy: y, r: 13, class: 'nd__halo' })); g.appendChild(el('circle', { cx: x, cy: y, r: 6, class: 'nd__dot' }));
    nodesG.appendChild(g); return { g, m: mins(c.dataset.time) };
  });
  const LEN = 2 * Math.PI * R;
  prog.style.strokeDasharray = LEN; prog.style.strokeDashoffset = LEN;

  let mobile = false;
  const size = () => { mobile = innerWidth < 900; sec.style.height = (mobile ? 520 : 560) + 'vh'; };
  addEventListener('resize', size); size();

  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(sec);
  let shown = -1, cur = T0, last = performance.now();

  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!visible) return;
    const r = sec.getBoundingClientRect();
    const p = reduce ? 1 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    const goal = T0 + (T1 - T0) * Math.min(1, p * 1.18);
    cur += (goal - cur) * (1 - Math.pow(.0004, dt)); if (Math.abs(goal - cur) < .6) cur = goal;
    const a = ang(cur);
    hand.setAttribute('transform', `rotate(${a} ${C} ${C})`);
    prog.style.strokeDashoffset = LEN * (1 - (cur - T0) / (T1 - T0));
    clock.textContent = fmt(cur);
    let idx = 0; nodes.forEach((n, i) => { const on = cur >= n.m - 1; n.g.classList.toggle('on', on); if (on) idx = i; });
    sec.classList.toggle('is-done', cur >= T1 - 2);
    if (idx !== shown) {
      cards.forEach((c, i) => { c.classList.toggle('on', i === idx); c.classList.toggle('past', i < idx); c.setAttribute('aria-hidden', String(i !== idx)); });
      num.textContent = String(idx + 1).padStart(2, '0'); shown = idx;
    }
  };
  requestAnimationFrame(tick);
})();
