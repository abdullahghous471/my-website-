/* Header capsule (sliding nav highlight, scroll progress) and the carrier lens bar */
(() => {
  const $ = s => document.querySelector(s), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header: shrink on scroll + gradient progress line
  const hd = $('[data-hd]'), bar = $('[data-prog-bar]');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? scrollY / max : 0);
    if (hd) hd.classList.toggle('is-scrolled', scrollY > 40);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // nav: a soft pill slides to whichever link you point at, and rests on the current section
  const nav = $('[data-nav]');
  if (nav) {
    const ind = nav.querySelector('.nav__ind'), links = [...nav.querySelectorAll('a')];
    const to = a => { if (!a) { ind.style.opacity = 0; return; } ind.style.opacity = 1; ind.style.width = a.offsetWidth + 'px'; ind.style.transform = `translateX(${a.offsetLeft}px)`; };
    let current = null;
    links.forEach(a => a.addEventListener('mouseenter', () => to(a)));
    nav.addEventListener('mouseleave', () => to(current));
    const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = () => {
      let hit = null; secs.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < innerHeight * .4 && r.bottom > innerHeight * .4) hit = links[i]; });
      if (hit !== current) { links.forEach(l => l.classList.toggle('on', l === hit)); current = hit; if (!nav.matches(':hover')) to(hit); }
    };
    addEventListener('scroll', spy, { passive: true }); spy();
  }

  // carrier lens: logos glide past; the one inside the lens turns full colour and grows
  const lens = $('[data-lens]');
  if (lens) {
    const row = lens.querySelector('[data-lens-row]'), vp = lens.querySelector('.lens__vp'), name = lens.querySelector('[data-lens-name]');
    const items = [...row.children];
    let x = 0, last = performance.now(), vis = false, shown = '', hover = false;
    new IntersectionObserver(es => vis = es[0].isIntersecting).observe(lens);
    vp.addEventListener('mouseenter', () => hover = true); vp.addEventListener('mouseleave', () => hover = false);
    const third = () => row.scrollWidth / 3;
    const tick = now => {
      requestAnimationFrame(tick);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!vis) return;
      if (!reduce) x -= (hover ? 18 : 55) * dt;
      if (-x > third()) x += third();
      row.style.transform = `translateX(${x}px)`;
      const v = vp.getBoundingClientRect(), cx = v.left + v.width / 2, R = Math.min(170, v.width * .22);
      let best = null, bd = 1e9;
      items.forEach(it => {
        const r = it.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx);
        const k = Math.max(0, 1 - d / R); it.style.setProperty('--k', (k * k * (3 - 2 * k)).toFixed(3));
        if (d < bd) { bd = d; best = it; }
      });
      const n = best && best.querySelector('.lens__c').alt;
      if (n && n !== shown && bd < R * .5) { shown = n; name.textContent = n; }
    };
    requestAnimationFrame(tick);
  }
})();
