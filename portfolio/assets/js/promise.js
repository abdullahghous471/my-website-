/* Helmwork · "The promise": the noise of a busy workday drifts at different depths,
   then each fragment is pulled into the light fibres and carried away as you scroll. */
(() => {
  const sec = document.querySelector('.promise');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = sec.querySelector('.promise__stage');
  const lineA = sec.querySelector('.promise__line--a'), lineB = sec.querySelector('.promise__line--b');
  const count = sec.querySelector('.promise__count'), open = sec.querySelector('[data-open]'), calm = sec.querySelector('.promise__calm'), hint = sec.querySelector('.promise__hint');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));

  let rs = 9; const rnd = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
  const all = [...sec.querySelectorAll('[data-frag]')];
  let frags = [], W = 0, H = 0, mob = false;

  const layout = () => {
    W = stage.clientWidth; H = stage.clientHeight; mob = W < 760; rs = 9;
    const use = mob ? all.filter((_, i) => i % 2 === 0) : all;
    all.forEach(el => { el.style.display = use.includes(el) ? '' : 'none'; });
    // free spots around the headline: keep the centre clear
    const placed = [];
    frags = use.map((el, i) => {
      let x, y, tries = 0, ok;
      const hw = Math.min(el.offsetWidth * .6, W * .3) + 12;
      do {
        x = hw + rnd() * (W - hw * 2); y = (.1 + rnd() * .76) * H; tries++;
        const inCentre = Math.abs(x - W / 2) < W * (mob ? .44 : .3) && Math.abs(y - H * .43) < H * (mob ? .2 : .16);
        ok = !inCentre && placed.every(q => Math.abs(q[0] - x) > (q[2] + hw) * .9 || Math.abs(q[1] - y) > (mob ? 30 : 44));
      } while (tries < 80 && !ok);
      placed.push([x, y, hw]);
      const z = rnd();                                  // depth: 0 far … 1 near
      return { el, x, y, z, rot: (rnd() - .5) * 14, sp: .3 + rnd() * .7, ph: rnd() * 6.28,
        start: .12 + (i / use.length) * .38 + rnd() * .04 };  // when it gets pulled into the fibres
    });
    frags.forEach(f => { f.el.style.setProperty('--z', f.z.toFixed(2)); });
  };
  layout(); addEventListener('resize', layout);

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(sec);
  const ribbonY = (x, t) => H * (mob ? .86 : .76) + H * .045 * Math.sin(x / W * 5.6 + t * .5);
  const t0 = performance.now();

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000, r = sec.getBoundingClientRect();
    const p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight));
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;

    let gone = 0;
    frags.forEach(f => {
      const k = clamp((p - f.start) / .3);                 // 0 floating … 1 carried away
      const dive = ease(clamp(k / .38)), ride = Math.pow(clamp((k - .2) / .8), 1.5);
      const drift = 1 - dive;
      const fx = f.x + Math.sin(t * .25 * f.sp + f.ph) * 26 * drift + mx * 60 * (f.z - .3) * drift;
      const fy = f.y + Math.cos(t * .3 * f.sp + f.ph) * 18 * drift + my * 40 * (f.z - .3) * drift - p * 90 * (f.z + .2) * drift;
      const x = fx + (W * 1.18 - fx) * ride;
      const y = fy + (ribbonY(x, t) - fy) * dive;
      const s = (.62 + f.z * .55) * (1 - .55 * dive);
      f.el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${f.rot * drift + Math.sin(t * 2 + f.ph) * 3 * dive * (1 - ride)}deg) scale(${s})`;
      const behind = Math.abs(x - W / 2) < W * (mob ? .46 : .3) && Math.abs(y - H * .43) < H * (mob ? .15 : .13) && dive < .5;
      f.el.style.opacity = (k >= 1 || behind ? 0 : (.32 + f.z * .68) * (1 - clamp((ride - .7) / .3)));
      f.el.classList.toggle('is-caught', dive > .5);
      gone += clamp(ride / .7);
    });
    const left = 1 - gone / Math.max(1, frags.length);
    open.textContent = Math.round(214 * left);
    count.classList.toggle('is-zero', left < .005);

    lineA.style.opacity = 1 - seg(p, .54, .64); lineA.style.transform = `translateY(${-12 * seg(p, .54, .64)}px)`;
    lineB.style.opacity = seg(p, .62, .74); lineB.style.transform = `translateY(${12 * (1 - seg(p, .62, .74))}px)`;
    lineB.setAttribute('aria-hidden', String(p < .66)); lineA.setAttribute('aria-hidden', String(p >= .66));
    count.style.opacity = 1 - seg(p, .8, .88);
    calm.style.opacity = seg(p, .8, .92); calm.style.transform = `translateY(${10 * (1 - seg(p, .8, .92))}px)`;
    if (hint) hint.style.opacity = 1 - seg(p, .02, .12);
  };
  requestAnimationFrame(frame);
})();
