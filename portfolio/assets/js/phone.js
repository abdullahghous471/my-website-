/* Helmwork · PC-Spain played on a phone. The screens play by themselves, sliding up like a page
   being scrolled, and the matching caption lights up beside the phone. Click a caption to jump to
   that screen (or tap the phone on mobile to go to the next one). The section never holds the scroll. */
(() => {
  const sec = document.querySelector('[data-phs]');
  if (!sec) return;
  const scr = [...sec.querySelectorAll('[data-scr]')], caps = [...sec.querySelectorAll('[data-cap]')];
  const phone = sec.querySelector('.ph__screen');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = scr.length, STAY = 2.6, SLIDE = .6;   // seconds on each screen, seconds to slide
  let f = 0, target = 0, hold = 0, visible = false, pauseUntil = 0, last = performance.now();

  const go = i => { target = (i + N) % N; hold = 0; pauseUntil = performance.now() + 8000; };
  caps.forEach((c, k) => {
    c.setAttribute('role', 'button'); c.tabIndex = 0;
    c.addEventListener('click', () => go(k));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(k); } });
  });
  if (phone) phone.addEventListener('click', () => go(target + 1));

  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: .2 }).observe(sec);

  const draw = () => {
    scr.forEach((s, k) => {
      const d = k - f, y = Math.max(-1, Math.min(1, d)) * 100;
      s.style.transform = `translateY(${y}%)`;
      s.style.opacity = Math.abs(d) < 1 ? 1 - Math.max(0, Math.abs(d) - .6) * 2.5 : 0;
    });
    const i = Math.round(f) % N;
    caps.forEach((c, k) => c.classList.toggle('on', k === i));
  };
  const tick = now => {
    requestAnimationFrame(tick);
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    if (Math.abs(target - f) > .001) {
      // slide the short way, including from the last screen back to the first
      if (target === 0 && f > N - 1.5) { f += dt / SLIDE; if (f >= N) f = 0; }
      else { const s = Math.sign(target - f) * dt / SLIDE; f = Math.abs(target - f) <= Math.abs(s) ? target : f + s; }
    } else if (!reduce && now > pauseUntil) {
      hold += dt;
      if (hold >= STAY) { hold = 0; target = (target + 1) % N; }
    }
    draw();
  };
  draw();
  requestAnimationFrame(tick);
})();
