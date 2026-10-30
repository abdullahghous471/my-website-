/* Helmwork · "In numbers": every digit is a reel that spins and lands on its value. */
(() => {
  const sec = document.querySelector('[data-odo-sec]');
  if (!sec) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = [...sec.querySelectorAll('[data-odo-item]')];
  const build = el => {
    const v = el.dataset.odo; el.textContent = '';
    [...v].forEach((ch, i) => {
      if (!/\d/.test(ch)) { const s = document.createElement('span'); s.className = 'odo__ch'; s.textContent = ch; s.setAttribute('aria-hidden', 'true'); el.appendChild(s); return; }
      const reel = document.createElement('span'); reel.className = 'odo__reel'; reel.setAttribute('aria-hidden', 'true');
      const strip = document.createElement('span'); strip.className = 'odo__strip';
      const spins = 2 + i;                                  // later digits spin a little longer
      for (let k = 0; k < spins * 10 + (+ch) + 1; k++) { const d = document.createElement('span'); d.textContent = k % 10; strip.appendChild(d); }
      strip.dataset.stop = spins * 10 + (+ch);
      reel.appendChild(strip); el.appendChild(reel);
    });
  };
  const land = (el, delay, instant) => {
    el.querySelectorAll('.odo__strip').forEach((s, i) => {
      s.style.transition = 'none'; s.style.transform = 'translateY(0)'; s.offsetHeight;
      s.style.transition = instant ? 'none' : `transform ${1.6 + i * .25}s cubic-bezier(.16,.84,.24,1) ${delay + i * .08}s`;
      s.style.transform = `translateY(${-s.dataset.stop}em)`;
    });
  };
  items.forEach(it => { build(it.querySelector('[data-odo]')); });
  const go = () => {
    sec.classList.add('on');
    items.forEach((it, i) => { land(it.querySelector('[data-odo]'), reduce ? 0 : .15 + i * .35, reduce); setTimeout(() => it.classList.add('on'), reduce ? 0 : 900 + i * 350); });
  };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: .35 }).observe(sec);
  if (!reduce) items.forEach(it => it.addEventListener('pointerenter', () => { if (it.classList.contains('on')) land(it.querySelector('[data-odo]'), 0); }));
})();
