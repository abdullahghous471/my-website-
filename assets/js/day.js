/* Helmwork · "A day, handled": a pinned, sideways scroll through one working day.
   Desktop: the track slides left, the light line fills, a clock ticks and each moment lights up.
   Phones: a vertical timeline with the same line and lighting. */
(() => {
  const sec = document.querySelector('[data-day]');
  if (!sec) return;
  const track = sec.querySelector('[data-day-track]'), fill = sec.querySelector('[data-day-fill]'), clock = sec.querySelector('[data-clock]');
  const evs = [...sec.querySelectorAll('[data-ev]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mins = s => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const fmt = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0');
  const T0 = mins('08:00'), T1 = mins('18:00');
  let mobile = false, dist = 0;

  const size = () => {
    mobile = innerWidth < 900;
    sec.classList.toggle('day--v', mobile);
    if (mobile) { sec.style.height = ''; track.style.transform = ''; return; }
    dist = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 40);
    sec.style.height = (innerHeight + dist * 1.15) + 'px';           // scroll length matches the sideways travel
  };
  addEventListener('resize', size); addEventListener('load', size); size();

  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(sec);

  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    const r = sec.getBoundingClientRect();
    let p;
    if (mobile) {
      const tr = track.getBoundingClientRect();
      p = reduce ? 1 : clamp((innerHeight * .62 - tr.top) / Math.max(1, tr.height));
      fill.style.transform = `scaleY(${p})`;
      evs.forEach(e => { const er = e.getBoundingClientRect(); e.classList.toggle('on', er.top < innerHeight * .66); });
    } else {
      p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight));
      track.style.transform = `translate3d(${-dist * p}px,0,0)`;
      fill.style.transform = `scaleX(${p})`;
      const lineR = fill.parentElement.getBoundingClientRect(), head = lineR.left + lineR.width * p;
      evs.forEach(e => { const d = e.querySelector('.day__dot').getBoundingClientRect(); e.classList.toggle('on', d.left - 2 <= Math.max(head, innerWidth * .62)); });
    }
    // clock follows the latest lit moment, easing between times
    const lit = evs.filter(e => e.classList.contains('on')), last = lit[lit.length - 1];
    const goal = last ? mins(last.dataset.time) : T0;
    const cur = clock._m ?? T0; const next = cur + (goal - cur) * .12;
    clock._m = Math.abs(goal - next) < .5 ? goal : next; clock.textContent = fmt(clamp(clock._m, T0, T1));
  };
  requestAnimationFrame(tick);
})();
