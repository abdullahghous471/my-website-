/* Helmwork · PC-Spain played on a phone: while the section is pinned, the screen moves through
   the site and the matching caption lights up beside it. */
(() => {
  const sec = document.querySelector('[data-phs]');
  if (!sec) return;
  const scr = [...sec.querySelectorAll('[data-scr]')], caps = [...sec.querySelectorAll('[data-cap]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = scr.length;
  const size = () => { sec.style.height = (innerWidth < 900 ? 420 : 480) + 'vh'; };
  addEventListener('resize', size); size();
  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(sec);
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const r = sec.getBoundingClientRect();
    const p = reduce ? 0 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    const f = Math.min(N - 1, p * (N - .4));            // position in the screen sequence
    const i = Math.min(N - 1, Math.floor(f + .5));
    scr.forEach((s, k) => {
      const d = k - f;                                   // screens slide up like a scrolling page
      const y = Math.max(-1, Math.min(1, d)) * 100;
      s.style.transform = `translateY(${y}%)`;
      s.style.opacity = Math.abs(d) < 1 ? 1 - Math.max(0, Math.abs(d) - .6) * 2.5 : 0;
    });
    caps.forEach((c, k) => c.classList.toggle('on', k === i));
    sec.classList.toggle('at-end', p > .92);
  };
  requestAnimationFrame(tick);
})();
