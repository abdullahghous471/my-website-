/* Helmwork · case studies as a pinned three-chapter story. In each chapter a live instrument
   shows the result happening: response-time bars compress, the accuracy bar grows. */
(() => {
  const sec = document.querySelector('[data-cs]');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cases = [...sec.querySelectorAll('[data-case]')], tabs = [...sec.querySelectorAll('[data-tab]')];
  const N = cases.length, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const hm = m => { m = Math.round(m); const h = Math.floor(m / 60), r = m % 60; return h ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`; };

  cases.forEach(c => {
    const kind = c.dataset.kind, max = +c.dataset.max, ticks = c.querySelector('[data-ticks]');
    const step = kind === 'time' ? 30 : 10;
    for (let v = 0; v <= max; v += step) {
      const t = document.createElement('span'); t.style.left = (v / max * 100) + '%';
      const major = kind === 'time' ? v % 60 === 0 : v % 50 === 0;
      t.className = major ? 'tk tk--m' : 'tk';
      if (major) t.dataset.l = kind === 'time' ? (v ? v / 60 + 'h' : '0') : v + '%';
      ticks.appendChild(t);
    }
    const ghost = c.querySelector('[data-ghost]');
    ghost.style.width = kind === 'time' ? (c.dataset.from / max * 100) + '%' : '0';
  });

  const size = () => { sec.style.height = (N * (innerWidth < 900 ? 130 : 120) + 40) + 'vh'; };
  addEventListener('resize', size); size();
  tabs.forEach(b => b.addEventListener('click', () => {
    const r = sec.getBoundingClientRect(), top = scrollY + r.top, len = sec.offsetHeight - innerHeight;
    scrollTo({ top: top + len * ((+b.dataset.tab + .35) / N), behavior: 'smooth' });
  }));

  let visible = false, shown = -1;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(sec);
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const r = sec.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    const f = Math.min(N - .0001, p * N), i = Math.floor(f), lp = f - i;
    if (i !== shown) {
      cases.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('past', k < i); c.setAttribute('aria-hidden', String(k !== i)); });
      tabs.forEach((t, k) => t.classList.toggle('on', k === i)); shown = i;
    }
    sec.style.setProperty('--tp', lp);
    const c = cases[i], kind = c.dataset.kind, from = +c.dataset.from, to = +c.dataset.to, max = +c.dataset.max;
    const q = reduce ? 1 : ease(clamp((lp - .12) / .5));
    const v = from + (to - from) * q;
    c.querySelector('[data-bar]').style.width = (v / max * 100) + '%';
    c.querySelector('[data-head]').style.left = (v / max * 100) + '%';
    c.querySelector('[data-val]').textContent = kind === 'time' ? hm(v) : '+' + Math.round(v) + '%';
    c.classList.toggle('done', q > .97);
    c.querySelectorAll('.cs__facts li').forEach((li, k) => li.classList.toggle('in', lp > .18 + k * .12 || reduce));
  };
  requestAnimationFrame(tick);
})();
