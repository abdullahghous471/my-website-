/* Helmwork · page behaviour (the 3D form lives in scene.js) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  /* smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    if (G && ST) { lenis.on('scroll', ST.update); G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const goTo = (t) => lenis ? lenis.scrollTo(t, { offset: t === 0 ? 0 : -20, duration: 1.4 }) : (t === 0 ? scrollTo({ top: 0, behavior: 'smooth' }) : t.scrollIntoView({ behavior: 'smooth' }));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const t = id === '#top' ? 0 : $(id);
    if (t === null) return; e.preventDefault(); closeMenu(); goTo(t);
  }));

  /* intro loader */
  const loader = $('[data-loader]'), ln = $('[data-loader-n]');
  const begin = () => { document.body.classList.add('is-in'); };
  if (loader && !reduce) {
    const t0 = performance.now(), dur = 1300;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      ln.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick);
      else { loader.classList.add('done'); setTimeout(begin, 250); setTimeout(() => loader.remove(), 1300); }
    };
    requestAnimationFrame(tick);
  } else { loader && loader.remove(); begin(); }

  /* header hides on scroll down */
  const hd = $('[data-hd]'); let lastY = 0;
  const onScroll = y => {
    hd.classList.toggle('is-hidden', y > 400 && y > lastY + 2 && !document.body.classList.contains('menu-open'));
    if (y < lastY - 2) hd.classList.remove('is-hidden');
    lastY = y;
  };
  lenis ? lenis.on('scroll', e => onScroll(e.scroll)) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });

  /* menu */
  const btn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open'); lenis && lenis.start();
  }
  btn.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu();
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open'); hd.classList.remove('is-hidden'); lenis && lenis.stop();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeVideo(); } });

  /* reveal */
  const io = new IntersectionObserver(es => {
    let k = 0;
    es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; el.style.transitionDelay = (k++ * 90) + 'ms'; el.classList.add('is-vis'); io.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ''; }, 1500);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* statement: words light up as you scroll */
  const sp = $('[data-words]');
  if (sp) {
    sp.innerHTML = sp.textContent.trim().split(/\s+/).map(w => `<span class="wd">${w}</span>`).join(' ');
    const words = $$('.wd', sp);
    if (reduce) words.forEach(w => w.style.opacity = 1);
    else if (G && ST) {
      G.to(words, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: sp, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
    } else words.forEach(w => w.style.opacity = 1);
  }

  /* counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1700;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 4))); el.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* rotating role */
  const rw = $('[data-roles]');
  if (rw && !reduce) {
    const roles = rw.dataset.roles.split('|'); let ri = 0;
    setInterval(() => { rw.classList.add('out'); setTimeout(() => { ri = (ri + 1) % roles.length; rw.textContent = roles[ri]; rw.classList.remove('out'); }, 350); }, 2600);
  }

  /* featured project: the screen tilts flat as it scrolls in, phones float at their own depth */
  const stage = $('[data-stage]'), inner = $('[data-stage-inner]');
  if (stage && G && ST && !reduce) {
    G.fromTo(inner, { rotateX: 26, scale: .9, y: 40 }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 95%', end: 'center 55%', scrub: 0.8 } });
    $$('[data-depth]', stage).forEach(ph => {
      const d = +ph.dataset.depth;
      G.fromTo(ph, { yPercent: 18 * d }, { yPercent: -10 * d, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
  } else if (inner) inner.style.transform = 'none';

  /* 3D tilt cards */
  if (fine && !reduce) $$('[data-tilt]').forEach(c => {
    let raf = 0;
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        c.style.transform = `perspective(1000px) rotateX(${(.5 - y) * 9}deg) rotateY(${(x - .5) * 11}deg) translateZ(0)`;
        c.style.setProperty('--gx', x * 100 + '%'); c.style.setProperty('--gy', y * 100 + '%');
      });
    });
    c.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); c.style.transform = ''; });
  });

  /* services: cards on a 3D ring that turns with the scroll */
  const ring = $('[data-ring]'), pin = $('[data-ring-pin]');
  if (ring) {
    const cards = $$('.rc', ring); cards.forEach((c, i) => c.style.setProperty('--i', i));
    const flat = () => { ring.classList.add('ring--flat'); ring.parentElement.classList.add('is-flat'); };
    if (G && ST && !reduce && innerWidth > 900) {
      G.to(ring, {
        rotateY: -320, ease: 'none',
        scrollTrigger: { trigger: pin, start: 'top top', end: '+=260%', scrub: 1, pin: true, anticipatePin: 1 }
      });
      ST.matchMedia({ '(max-width: 900px)': () => { ST.getAll().forEach(s => s.pin === pin && s.kill(true)); G.set(ring, { clearProps: 'transform' }); flat(); } });
    } else flat();
  }

  /* active nav */
  const links = $$('.nav a');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); s && sio.observe(s); });

  /* cursor */
  const cur = $('[data-cursor]');
  if (fine && cur && !reduce) {
    document.documentElement.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; cur.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    const loop = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    document.addEventListener('pointerover', e => cur.classList.toggle('is-link', !!e.target.closest('a, button')));
  }

  /* video modal */
  const vm = $('[data-vmodal]'), vv = $('[data-vmodal-video]'); let lastFocus = null;
  $$('[data-video-open]').forEach(b => b.addEventListener('click', () => {
    lastFocus = b; vv.src = b.dataset.videoOpen; vm.hidden = false; lenis && lenis.stop();
    vv.play().catch(() => {}); $('[data-vmodal-close]', vm).focus();
  }));
  function closeVideo() {
    if (!vm || vm.hidden) return;
    vv.pause(); vv.removeAttribute('src'); vv.load(); vm.hidden = true; lenis && lenis.start(); lastFocus && lastFocus.focus();
  }
  $('[data-vmodal-close]').addEventListener('click', closeVideo);
  vm.addEventListener('click', e => { if (e.target === vm) closeVideo(); });

  /* intro video */
  const mv = $('[data-meet]'), mc = $('[data-meet-play]');
  if (mv && mc) {
    mc.addEventListener('click', () => { mc.hidden = true; mv.controls = true; mv.play().catch(() => {}); });
    mv.addEventListener('play', () => { mc.hidden = true; mv.controls = true; });
  }

  addEventListener('load', () => ST && ST.refresh());
})();
