/* Header state over the film, active-section underline, and tap-to-colour carriers */
(() => {
  const $ = s => document.querySelector(s);

  // header: fully transparent over the hero film, a soft glass bar once past it
  const hd = $('[data-hd]'), hero = $('#top');
  const onScroll = () => {
    const past = hero ? scrollY > hero.offsetHeight - 120 : scrollY > 40;
    if (hd) hd.classList.toggle('is-scrolled', past);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // nav: underline the link for the section you are reading
  const links = [...document.querySelectorAll('[data-nav] a')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  const spy = () => {
    let hit = null;
    secs.forEach((s, i) => { if (!s) return; const r = s.getBoundingClientRect(); if (r.top < innerHeight * .4 && r.bottom > innerHeight * .4) hit = links[i]; });
    links.forEach(l => l.classList.toggle('on', l === hit));
  };
  addEventListener('scroll', spy, { passive: true }); spy();

  // carriers: hover shows colour; on touch screens a tap does the same
  const cars = $('[data-cars]');
  if (cars) cars.addEventListener('click', e => {
    const c = e.target.closest('.car'); if (!c) return;
    const was = c.classList.contains('on');
    cars.querySelectorAll('.car.on').forEach(x => x.classList.remove('on'));
    if (!was) c.classList.add('on');
  });
})();

/* Background tone: each section has its own deep colour, and the page blends between them as you scroll */
(() => {
  const tones = [
    ['#top', [18, 15, 13]],      // charcoal under the film
    ['#life', [43, 26, 14]],     // cognac
    ['.stats-sec', [44, 22, 18]],// terracotta
    ['#moments', [11, 35, 33]],  // deep sea-teal
    ['#coverage', [40, 18, 30]], // wine
    ['#strategy', [14, 26, 43]], // night ocean
    ['#about', [42, 30, 16]],    // espresso gold
    ['#review', [12, 36, 32]],   // deep teal
    ['#faq', [28, 20, 17]],      // warm umber
    ['.cta', [18, 15, 13]]
  ].map(([s, c]) => [document.querySelector(s), c]).filter(t => t[0]);
  const root = document.documentElement;
  let raf = 0;
  const paint = () => {
    raf = 0;
    const mid = scrollY + innerHeight / 2;
    const pts = tones.map(([el, c]) => { const r = el.getBoundingClientRect(); return [scrollY + r.top + r.height / 2, c]; });
    let c = pts[0][1];
    if (mid >= pts[pts.length - 1][0]) c = pts[pts.length - 1][1];
    else for (let i = 0; i < pts.length - 1; i++) {
      const [y0, c0] = pts[i], [y1, c1] = pts[i + 1];
      if (mid >= y0 && mid < y1) { let t = (mid - y0) / (y1 - y0); t = t * t * (3 - 2 * t); c = c0.map((v, k) => Math.round(v + (c1[k] - v) * t)); break; }
    }
    root.style.setProperty('--wbg', `rgb(${c.join(',')})`);
  };
  const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
  addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); paint();
})();
