/* Helmwork · About: tools orbit around the name on three tilted rings; hover one to see how it is used. */
(() => {
  const stage = document.querySelector('[data-orbit2]');
  if (!stage) return;
  const chips = [...stage.querySelectorAll('[data-chip]')], use = stage.querySelector('[data-orbit-use]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = [[165, 92], [235, 140], [292, 190]], SPD = [.16, -.11, .075];   // radii in the 600-unit stage, speed in rad/s
  const byRing = [0, 1, 2].map(r => chips.filter(c => +c.dataset.ring === r));
  const items = chips.map(c => { const r = +c.dataset.ring, list = byRing[r]; return { c, r, a: list.indexOf(c) / list.length * Math.PI * 2 + r * .6 }; });
  let paused = false, hot = null, mx = 0, my = 0, tmx = 0, tmy = 0;
  const def = use.textContent;
  chips.forEach(c => {
    const on = () => { paused = true; hot = c; use.textContent = c.dataset.use; stage.classList.add('is-hover'); c.classList.add('hot'); };
    const off = () => { paused = false; hot = null; use.textContent = def; stage.classList.remove('is-hover'); c.classList.remove('hot'); };
    c.addEventListener('pointerenter', on); c.addEventListener('pointerleave', off); c.addEventListener('focus', on); c.addEventListener('blur', off);
    c.addEventListener('click', on);
  });
  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - .5; tmy = (e.clientY - r.top) / r.height - .5; });
  stage.addEventListener('pointerleave', () => { tmx = tmy = 0; });
  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
  let last = performance.now();
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible) return;
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    const s = stage.clientWidth / 600 * (stage.clientWidth < 500 ? .8 : 1), tilt = 1 + my * .5;
    items.forEach(it => {
      if (!paused && !reduce) it.a += SPD[it.r] * dt;
      const [rx, ry] = R[it.r], a = it.a + mx * .6;
      const x = Math.cos(a) * rx * s, y = Math.sin(a) * ry * s * tilt, d = (Math.sin(a) + 1) / 2;   // d: 0 back … 1 front
      const sc = (.78 + d * .32) * (it.c === hot ? 1.12 : 1);
      it.c.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${sc})`;
      it.c.style.opacity = it.c === hot ? 1 : (.38 + d * .62) * (paused ? .5 : 1);
      it.c.style.zIndex = Math.round(d * 100) + (it.c === hot ? 200 : 0);
    });
  };
  requestAnimationFrame(tick);
})();
