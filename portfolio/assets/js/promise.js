/* Helmwork · "The promise": four stressed-out status cards float in chaos around the headline,
   then fly into a neat row and flip over to their handled side as you scroll. */
(() => {
  const sec = document.querySelector('[data-promise]');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = sec.querySelector('.promise__stage'), copy = sec.querySelector('.promise__copy');
  const cards = [...sec.querySelectorAll('[data-pcard]')], inners = cards.map(c => c.querySelector('.pcard__in'));
  const lineA = sec.querySelector('.promise__line--a'), lineB = sec.querySelector('.promise__line--b');
  const done = [...sec.querySelectorAll('.promise__done li')], hint = sec.querySelector('.promise__hint');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));

  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(sec);

  const layout = () => {
    const w = stage.clientWidth, h = stage.clientHeight, mob = w < 760;
    const cw = cards[0].offsetWidth, ch = inners[0].offsetHeight, gap = mob ? 10 : 16;
    const chaos = mob
      ? [[-.25, -.31, -8], [.24, -.27, 7], [-.23, .25, 6], [.25, .31, -6]]
      : [[-.33, -.25, -9], [.32, -.21, 8], [-.31, .24, 7], [.33, .23, -6]];
    const order = cards.map((_, i) => mob
      ? [((i % 2) - .5) * (cw + gap), h * .06 + Math.floor(i / 2) * (ch + gap), 0]
      : [(i - 1.5) * (cw + gap), h * .14, 0]);
    return { w, h, mob, chaos: chaos.map(([x, y, r]) => [x * w, y * h, r]), order, shift: mob ? -h * .3 : -h * .15 };
  };
  let L = layout(); addEventListener('resize', () => { L = layout(); });

  const t0 = performance.now();
  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000, r = sec.getBoundingClientRect();
    const p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight));

    copy.style.setProperty('--hy', (L.shift * seg(p, .25, .6)) + 'px');
    lineA.style.opacity = 1 - seg(p, .32, .46); lineA.style.transform = `translateY(${-14 * seg(p, .32, .46)}px)`;
    lineB.style.opacity = seg(p, .44, .58); lineB.style.transform = `translateY(${14 * (1 - seg(p, .44, .58))}px)`;
    lineB.setAttribute('aria-hidden', String(p < .5)); lineA.setAttribute('aria-hidden', String(p >= .5));
    if (hint) hint.style.opacity = 1 - seg(p, .02, .14);

    cards.forEach((c, i) => {
      const m = seg(p, .2 + i * .04, .56 + i * .04), calm = 1 - m;
      const [cx, cy, cr] = L.chaos[i], [ox, oy] = L.order[i];
      const jx = Math.sin(t * .9 + i * 1.7) * 9 * calm, jy = Math.cos(t * 1.1 + i * 2.3) * 11 * calm, jr = Math.sin(t * .7 + i) * 2.2 * calm;
      const x = cx + (ox - cx) * m + jx, y = cy + (oy - cy) * m + jy, rot = cr * calm + jr;
      c.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${.92 + .08 * m})`;
      const f = seg(p, .46 + i * .06, .64 + i * .06);
      inners[i].style.transform = `rotateY(${180 * f}deg)`;
      c.classList.toggle('is-done', f > .5);
    });
    done.forEach((d, i) => { const o = seg(p, .72 + i * .04, .84 + i * .04); d.style.opacity = o; d.style.transform = `translateY(${12 * (1 - o)}px)`; });
  };
  requestAnimationFrame(frame);
})();
