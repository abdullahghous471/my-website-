/* Helmwork · Abdullah portfolio */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.remove('no-js');

  /* smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const goTo = target => lenis ? lenis.scrollTo(target, { offset: -70, duration: 1.3 }) : target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const t = id === '#top' ? document.body : $(id);
    if (!t) return; e.preventDefault(); closeMenu(); goTo(id === '#top' ? 0 : t);
  }));

  /* hero headline: split into words, keep <em> */
  $$('[data-split]').forEach(h => {
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
            w.append(s); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    h.setAttribute('aria-label', h.textContent); wrap(h);
    $$('.w', h).forEach(w => w.setAttribute('aria-hidden', 'true'));
  });
  const start = () => document.body.classList.add('is-in');
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => requestAnimationFrame(start));

  /* header */
  const hd = $('[data-hd]'); let lastY = 0;
  const onScroll = () => {
    const y = lenis ? lenis.scroll : scrollY;
    hd.classList.toggle('is-scrolled', y > 20);
    hd.classList.toggle('is-hidden', y > 500 && y > lastY + 2 && !document.body.classList.contains('menu-open'));
    if (y < lastY - 2) hd.classList.remove('is-hidden');
    lastY = y;
  };
  lenis ? lenis.on('scroll', onScroll) : addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const btn = $('[data-menu-btn]'), menu = $('[data-menu]');
  function closeMenu() {
    if (menu.hidden) return;
    menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open'); lenis && lenis.start();
  }
  btn.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu();
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open'); hd.classList.remove('is-hidden'); lenis && lenis.stop();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeVideo(); } });
  matchMedia('(min-width: 861px)').addEventListener('change', e => e.matches && closeMenu());

  /* reveal on scroll, staggered per row */
  const io = new IntersectionObserver(es => {
    let k = 0;
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.transitionDelay = (k++ * 90) + 'ms';
      e.target.classList.add('is-vis'); io.unobserve(e.target);
      setTimeout(() => { e.target.style.transitionDelay = ''; }, 1400);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* count-up stats */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const step = t => { const p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* rotating role */
  const rw = $('[data-roles]');
  if (rw && !reduce) {
    const roles = rw.dataset.roles.split('|'); let ri = 0;
    setInterval(() => {
      rw.classList.add('out');
      setTimeout(() => { ri = (ri + 1) % roles.length; rw.textContent = roles[ri]; rw.classList.remove('out'); }, 360);
    }, 2600);
  }

  /* live operations board: a working day in ten seconds */
  const board = $('[data-board]');
  if (board) {
    const back = $('[data-back]', board), backBar = $('[data-back-bar]', board), resp = $('[data-resp]', board), respBar = $('[data-resp-bar]', board);
    const csat = $('[data-csat]', board), ring = $('[data-ring]', board), clock = $('[data-clock]', board), tasks = $$('[data-tasks] li', board);
    const ease = p => 1 - Math.pow(1 - p, 3);
    const render = p => { // p: 0..1 through the day
      const e = ease(Math.min(1, p / 0.8));
      const b = Math.round(200 * (1 - e)); back.textContent = b; backBar.style.transform = `scaleX(${Math.max(0.0001, b / 200)})`;
      const m = Math.round(240 - 200 * e); resp.textContent = m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`;
      respBar.style.transform = `scaleX(${m / 240})`;
      const c = Math.round(100 * ease(Math.min(1, p / 0.9))); csat.textContent = c; ring.style.setProperty('--p', c);
      const mins = 9 * 60 + Math.round(8 * 60 * p); clock.textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      tasks.forEach((t, i) => t.classList.toggle('done', p > 0.18 + i * 0.18));
    };
    if (reduce) render(1);
    else {
      let t0 = null, visible = true;
      new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(board);
      const DAY = 9000, HOLD = 3500;
      const loop = t => {
        if (t0 === null) t0 = t + 900;
        if (visible) {
          const k = (t - t0) % (DAY + HOLD);
          render(t < t0 ? 0 : Math.min(1, k / DAY));
        } else t0 += 16;
        requestAnimationFrame(loop);
      };
      render(0); requestAnimationFrame(loop);
    }
  }

  /* active nav link */
  const links = $$('.nav a');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = $(a.getAttribute('href')); s && sio.observe(s); });

  /* walkthrough video modal */
  const vm = $('[data-vmodal]'), vv = $('[data-vmodal-video]');
  let lastFocus = null;
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
    mc.addEventListener('click', () => { mc.hidden = true; mv.controls = true; mv.play().catch(() => {}); mv.focus(); });
    mv.addEventListener('play', () => { mc.hidden = true; mv.controls = true; });
  }
})();
