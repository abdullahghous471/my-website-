/* Property Consultancy Spain — interactions
   Uses GSAP + ScrollTrigger + SplitText (cdnjs) and Lenis (jsDelivr) when available.
   Every section is readable without them: the page only hides what it is about to animate. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const desktop = () => innerWidth > 900;
  root.classList.remove('no-js');
  if (!hasGsap || reduce) root.classList.add('no-gsap');

  /* ------------------------------------------------ smooth scroll */
  let lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (hasGsap && !reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (y) => lenis ? lenis.scrollTo(y, { duration: 1.6 }) : window.scrollTo({ top: typeof y === 'number' ? y : 0, behavior: 'smooth' });

  /* ------------------------------------------------ page transitions (logo curtain) */
  const curtain = $('.curtain');
  let curtainDone; const curtainReady = new Promise(r => { curtainDone = r; });
  const leave = (href) => {
    if (!hasGsap || reduce || !curtain) { location.href = href; return; }
    curtain.style.animation = 'none';
    gsap.set(curtain, { yPercent: 100, display: 'grid', visibility: 'visible' });
    gsap.timeline({ onComplete: () => { location.href = href; } })
      .to(curtain, { yPercent: 0, duration: .8, ease: 'expo.inOut' })
      .fromTo('.curtain__logo, .curtain__build', { yPercent: 110 }, { yPercent: 0, duration: .6, ease: 'expo.out' }, '-=.35');
  };
  if (curtain && hasGsap && !reduce) {
    gsap.timeline({ delay: .1 })
      .to('.curtain__logo, .curtain__build', { yPercent: -110, duration: .6, ease: 'expo.in' })
      .to(curtain, { yPercent: -100, duration: 1, ease: 'expo.inOut', onStart: curtainDone }, '-=.15')
      .set(curtain, { display: 'none' });
  } else { if (curtain) curtain.style.display = 'none'; curtainDone(); }
  addEventListener('pageshow', e => { if (e.persisted && curtain) curtain.style.display = 'none'; });
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href) || !/\.html(#.*)?$/.test(href)) return;
    const same = href.split('#')[0] === location.pathname.split('/').pop();
    if (same && href.includes('#')) return;
    e.preventDefault();
    leave(href);
  });

  /* ------------------------------------------------ header */
  const hd = $('.hd');
  const intro = $('#intro');
  let lastY = 0;
  const setHeader = () => {
    // The header stays visible on every page; it only gains its solid background once the page moves,
    // or immediately on pages that open without the home intro.
    const y = lenis ? lenis.scroll : scrollY;
    hd.classList.toggle('is-solid', y > 10 || !intro);
    hd.classList.remove('is-hidden', 'is-light');
    lastY = y;
  };
  if (hd) {
    if (lenis) lenis.on('scroll', setHeader); else addEventListener('scroll', setHeader, { passive: true });
    setHeader();
  }

  /* ------------------------------------------------ menu */
  const menu = $('.menu');
  if (menu) {
    const items = $$('.menu__list > li > a', menu);
    const imgs = $$('.menu__media img', menu);
    let tl = null;
    const open = () => {
      menu.classList.add('is-open');
      lenis && lenis.stop();
      document.body.style.overflow = 'hidden';
      if (!hasGsap || reduce) { menu.style.clipPath = 'none'; return; }
      tl = gsap.timeline()
        .fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .9, ease: 'expo.inOut' })
        .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .05, ease: 'expo.out' }, '-=.35')
        .fromTo('.menu__sub, .menu__foot', { autoAlpha: 0 }, { autoAlpha: 1, duration: .6 }, '-=.6');
    };
    const close = () => {
      const done = () => { menu.classList.remove('is-open'); lenis && lenis.start(); document.body.style.overflow = ''; };
      if (!hasGsap || reduce) { menu.style.clipPath = ''; done(); return; }
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .8, ease: 'expo.inOut', onComplete: done });
    };
    $$('[data-menu-open]').forEach(b => b.addEventListener('click', open));
    $$('[data-menu-close]').forEach(b => b.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
    items.forEach((a, i) => a.addEventListener('mouseenter', () => imgs.forEach((im, j) => im.classList.toggle('on', j === i))));
  }

  /* ------------------------------------------------ lazy / in-view videos (720p on phones) */
  const vsrc = u => (innerWidth < 900 && /\.mp4$/.test(u)) ? u.replace(/\.mp4$/, '-m.mp4?v=2') : u;
  const vids = $$('video[data-src]');
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src) { v.src = vsrc(v.dataset.src); }
      v.play().catch(() => {});
    } else if (v.src) v.pause();
  }), { rootMargin: '200px' });
  vids.forEach(v => vio.observe(v));

  /* ------------------------------------------------ counters (also without GSAP) */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = reduce ? 0 : 2200;
    const tick = t => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .4 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ------------------------------------------------ motion (GSAP) */
  const ready = () => {
    if (!hasGsap || reduce) return;

    // Lines rise out of masks
    if (window.SplitText) gsap.registerPlugin(SplitText);
    $$('[data-split]').forEach(el => {
      if (!window.SplitText) return;
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'ln' });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.3, stagger: .08, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Fade up
    $$('[data-reveal]').forEach(el => {
      gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.4, ease: 'expo.out', delay: +(el.dataset.reveal || 0),
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // Image curtain + settle
    $$('[data-img]').forEach(el => {
      const img = el.querySelector('img, video');
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
        .fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' })
        .from(img, { scale: 1.3, duration: 2, ease: 'expo.out' }, '<.2');
    });

    // Parallax
    $$('[data-parallax]').forEach(el => {
      const amt = parseFloat(el.dataset.parallax || 12);
      gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Home intro — arch window opens to full screen
    if (intro) {
      const win = $('.intro__window', intro);
      const vid = $('video', win);
      const mob = !desktop();
      const title = $$('.intro__title .row > span, .intro__title .script', intro);
      gsap.set(win, { '--shade': 0 });
      const introTl = gsap.timeline({ paused: true })
        .from(title, { yPercent: 120, duration: 1.4, stagger: .1, ease: 'expo.out' })
        .from(win, { clipPath: mob ? 'inset(100% 16% 0% 16% round 50vw 50vw 0vw 0vw)' : 'inset(100% 37% 0% 37% round 40vw 40vw 0vw 0vw)', duration: 1.6, ease: 'expo.inOut' }, '<.1')
        .from('.intro__side', { autoAlpha: 0, duration: 1 }, '<.6');
      curtainReady.then(() => introTl.play());
      const tl = gsap.timeline({
        scrollTrigger: { trigger: intro, start: 'top top', end: '+=110%', pin: true, scrub: 1,
          
          }
      });
      tl.to(win, { clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)', ease: 'none', duration: 1 })
        .to(vid, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to(win, { '--shade': 1, duration: .4 }, .55)
        .to('.intro__title', { yPercent: -70, autoAlpha: 0, ease: 'none', duration: .45 }, 0)
        .to('.intro__side', { autoAlpha: 0, duration: .25 }, 0)
        .to('.intro__over', { autoAlpha: 1, duration: .3 }, .9)
        .from('.intro__over > *', { y: 40, stagger: .08, duration: .3 }, .9)
        .to({}, { duration: .15 });
    }

    // Page hero media opens wider on scroll
    $$('.ph__media').forEach(m => {
      gsap.to(m, { clipPath: 'inset(0 0px 0 0px)', ease: 'none',
        scrollTrigger: { trigger: m, start: 'top 85%', end: 'top 15%', scrub: true } });
    });
    $$('.band--expand').forEach(b => {
      gsap.to($('.band__media', b), { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: b, start: 'top 90%', end: 'top 10%', scrub: true } });
    });

    // Horizontal scroll
    const hs = $('.hs');
    if (false && hs && desktop()) { // replaced by the free-scrolling carousel below (v9)
      const track = $('.hs__track', hs), bar = $('.hs__bar i', hs), count = $('.hs__count b', hs), cards = $$('.hs__card', hs);
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: hs, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: s => {
            bar && gsap.set(bar, { scaleX: s.progress });
            if (count) count.textContent = String(Math.min(cards.length, Math.floor(s.progress * cards.length) + 1)).padStart(2, '0');
          }
        }
      });
    }

    // werkwijze figures: lines drift in opposite directions while scrolling
    $$('[data-figs] .figs__line').forEach(line => {
      const dir = +line.dataset.dir || 1;
      gsap.fromTo(line, { xPercent: dir * -9 }, { xPercent: dir * 4, ease: 'none',
        scrollTrigger: { trigger: line, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from($$('.figs__media', line), { scale: .4, autoAlpha: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: line, start: 'top 85%' } });
    });
    ScrollTrigger.refresh();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready); else addEventListener('load', ready);


  /* ------------------------------------------------ orbit (advantages around a circle) */
  $$('[data-orbit]').forEach(orb => {
    const nodes = $$('.orbit__node', orb), items = $$('.orbit__item', orb);
    const sec = orb.closest('section');
    const list = $$('[data-orbit-go]', sec).filter(b => !b.classList.contains('orbit__node'));
    const prog = $('.orbit__prog', orb);
    const num = $('[data-orbit-num]', sec), bar = $('[data-orbit-bar]', sec);
    const n = nodes.length, step = 360 / n, DUR = 5200;
    let i = 0, rot = 0, timer = null, t0 = 0, raf = 0, paused = false, visible = false;
    const draw = () => {
      if (!prog) return;
      const p = paused || !visible ? 0 : Math.min(1, (performance.now() - t0) / DUR);
      prog.style.strokeDasharray = `${(p * 100).toFixed(2)} 100`;
      if (bar) bar.style.transform = `scaleX(${p})`;
      raf = requestAnimationFrame(draw);
    };
    const go = (k, user) => {
      const next = (k + n) % n;
      let delta = ((next - i) % n + n) % n;          // always rotate forward
      if (user && delta > n / 2) delta -= n;          // user clicks take the short way
      rot -= delta * step;
      i = next;
      orb.style.setProperty('--rot', rot + 'deg');
      nodes.forEach((b, j) => b.classList.toggle('on', j === i));
      items.forEach((b, j) => b.classList.toggle('on', j === i));
      list.forEach(b => b.classList.toggle('on', +b.dataset.orbitGo === i));
      if (num) {
        num.classList.add('swap');
        setTimeout(() => { num.textContent = String(i + 1).padStart(2, '0'); num.classList.remove('swap'); }, reduce ? 0 : 320);
      }
      schedule();
    };
    const schedule = () => {
      clearTimeout(timer); t0 = performance.now();
      if (!reduce && visible && !paused) timer = setTimeout(() => go(i + 1), DUR);
    };
    nodes.concat(list).forEach(b => b.addEventListener('click', () => go(+b.dataset.orbitGo, true)));
    const prevB = $('[data-orbit-prev]', sec), nextB = $('[data-orbit-next]', sec);
    prevB && prevB.addEventListener('click', () => go(i - 1, true));
    nextB && nextB.addEventListener('click', () => go(i + 1, true));
    // pause on mouse hover only: a tap on a phone must not freeze the rotation
    orb.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; paused = true; clearTimeout(timer); });
    orb.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; paused = false; schedule(); });
    // swipe left / right on touch screens
    let sx = null, sy = 0;
    orb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    orb.addEventListener('touchend', e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) go(i + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; schedule(); }), { threshold: .35 }).observe(orb);
    list.forEach(b => b.classList.toggle('on', +b.dataset.orbitGo === 0));
    if (!reduce) raf = requestAnimationFrame(draw);
  });

  /* ------------------------------------------------ testimonials */
  const qs = $('.quotes');
  if (qs) {
    const items = $$('.quote', qs), count = $('.quotes__count b', qs), bar = $('.quotes__bar i', qs);
    let i = 0, timer, barTween;
    const show = (n) => {
      const prev = items[i];
      i = (n + items.length) % items.length;
      const next = items[i];
      if (count) count.textContent = String(i + 1).padStart(2, '0');
      if (hasGsap && !reduce) {
        gsap.to(prev, { autoAlpha: 0, y: -20, duration: .6, ease: 'power2.in', onComplete: () => prev.classList.remove('on') });
        next.classList.add('on');
        gsap.fromTo(next, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, delay: .45, ease: 'expo.out' });
        barTween && barTween.kill();
        barTween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 8, ease: 'none' });
      } else { items.forEach(q => q.classList.toggle('on', q === next)); }
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(() => show(i + 1), 8000);
    };
    if (!(hasGsap && !reduce)) items.forEach(q => q.classList.add('on'));
    else { items.forEach((q, j) => { if (j) gsap.set(q, { autoAlpha: 0 }); }); show(0); }
    $('[data-q-prev]', qs) && $('[data-q-prev]', qs).addEventListener('click', () => show(i - 1));
    $('[data-q-next]', qs) && $('[data-q-next]', qs).addEventListener('click', () => show(i + 1));
  }

  /* ------------------------------------------------ before / after */
  $$('.ba').forEach(ba => {
    const r = $('input', ba), b = $('.ba__before', ba), line = $('.ba__line', ba);
    const set = v => { b.style.clipPath = `inset(0 ${100 - v}% 0 0)`; line.style.left = v + '%'; };
    r.addEventListener('input', () => set(r.value));
    set(r.value);
  });

  /* ------------------------------------------------ listings: filter + load more */
  const lg = $('#lgrid');
  if (lg) {
    const cards = $$('.lcard', lg), btns = $$('.filters button'), more = $('#more');
    const PAGE = 12;
    let city = 'all', shown = PAGE;
    const render = (anim) => {
      const match = cards.filter(c => city === 'all' || c.dataset.city === city);
      cards.forEach(c => c.hidden = true);
      const vis = match.slice(0, shown);
      vis.forEach(c => c.hidden = false);
      if (more) more.hidden = match.length <= shown;
      if (anim && hasGsap && !reduce) gsap.fromTo(vis, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, stagger: .04, ease: 'expo.out' });
      hasGsap && ScrollTrigger.refresh();
    };
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('on', x === b));
      city = b.dataset.city; shown = PAGE; render(true);
    }));
    more && more.addEventListener('click', () => { shown += PAGE; render(true); });
    const h = location.hash.slice(1);
    const pre = btns.find(b => b.dataset.city === h);
    if (pre) { btns.forEach(x => x.classList.toggle('on', x === pre)); city = h; }
    render(false);
  }

  /* ------------------------------------------------ lightbox (gallery + video) */
  const lb = $('.lb');
  if (lb) {
    const stage = $('.lb__stage', lb), cnt = $('.lb__count', lb);
    let list = [], k = 0;
    const draw = () => {
      const it = list[k];
      stage.innerHTML = it.video ? `<video src="${vsrc(it.video)}" controls autoplay playsinline></video>` : `<img src="${it.src}" alt="">`;
      if (cnt) cnt.textContent = list.length > 1 ? `${String(k + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}` : '';
      $$('.lb__bot button', lb).forEach(b => b.hidden = list.length < 2);
    };
    const openLb = (arr, n) => { list = arr; k = n; draw(); lb.classList.add('on'); lenis && lenis.stop(); };
    const closeLb = () => { lb.classList.remove('on'); stage.innerHTML = ''; lenis && lenis.start(); };
    const g = $$('.gallery button');
    const arr = g.map(b => ({ src: b.dataset.full }));
    g.forEach((b, n) => b.addEventListener('click', () => openLb(arr, n)));
    $$('[data-video]').forEach(b => b.addEventListener('click', () => openLb([{ video: b.dataset.video }], 0)));
    $('[data-lb-close]', lb).addEventListener('click', closeLb);
    $('[data-lb-prev]', lb).addEventListener('click', () => { k = (k - 1 + list.length) % list.length; draw(); });
    $('[data-lb-next]', lb).addEventListener('click', () => { k = (k + 1) % list.length; draw(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight' && list.length > 1) { k = (k + 1) % list.length; draw(); }
      if (e.key === 'ArrowLeft' && list.length > 1) { k = (k - 1 + list.length) % list.length; draw(); }
    });
    let sx = 0;
    stage.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    stage.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50 && list.length > 1) { k = (k + (dx < 0 ? 1 : -1) + list.length) % list.length; draw(); }
    });
  }

  /* ------------------------------------------------ YouTube facade */
  $$('.yt button').forEach(b => b.addEventListener('click', () => {
    const wrap = b.closest('.yt');
    wrap.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${wrap.dataset.id}?autoplay=1&rel=0" title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }));

  /* ------------------------------------------------ success-story form */
  $$('form[data-form]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('.form__msg', f), endpoint = f.dataset.endpoint;
    if (!f.reportValidity()) return;
    if (!endpoint) { msg.textContent = f.dataset.offline; return; }
    msg.textContent = f.dataset.sending;
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
      msg.textContent = r.ok ? f.dataset.ok : f.dataset.fail;
      if (r.ok) f.reset();
    } catch { msg.textContent = f.dataset.fail; }
  }));


  /* ================================================================ v4 components */

  /* ---- home: video panels ---- */
  $$('[data-panels]').forEach(wrap => {
    const panels = $$('.panel', wrap);
    let cur = 0, timer = null, hover = false, visible = false;
    const play = (p, on) => {
      const v = $('video', p);
      if (!v) return;
      if (on) { if (!v.src) v.src = vsrc(v.dataset.panelSrc); v.play().catch(() => {}); } else if (v.src) v.pause();
    };
    const open = (k) => {
      cur = (k + panels.length) % panels.length;
      panels.forEach((p, j) => { p.classList.toggle('is-open', j === cur); play(p, j === cur && visible); });
      schedule();
    };
    const schedule = () => { clearTimeout(timer); if (!reduce && visible && !hover && desktop()) timer = setTimeout(() => open(cur + 1), 6500); };
    panels.forEach((p, j) => {
      p.addEventListener('mouseenter', () => { hover = true; if (desktop()) open(j); });
      p.addEventListener('mouseleave', () => { hover = false; schedule(); });
      p.addEventListener('click', () => open(j));
      p.addEventListener('focus', () => open(j));
    });
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      if (!desktop()) panels.forEach(p => play(p, visible));
      else play(panels[cur], visible);
      schedule();
    }), { threshold: .3 }).observe(wrap);
  });

  /* ---- home: review showcase ---- */
  $$('[data-rshow]').forEach(st => {
    const items = $$('.rshow__item', st), idx = $('.rshow__idx b', st), bar = $('.rshow__bar i', st);
    let i = 0, timer, t0 = 0, raf;
    const DUR = 9000;
    const tick = () => { if (bar) bar.style.transform = `scaleX(${Math.min(1, (performance.now() - t0) / DUR)})`; raf = requestAnimationFrame(tick); };
    const show = (k) => {
      i = (k + items.length) % items.length;
      items.forEach((it, j) => it.classList.toggle('on', j === i));
      if (idx) idx.textContent = String(i + 1).padStart(2, '0');
      t0 = performance.now();
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(() => show(i + 1), DUR);
    };
    $('[data-rs-prev]', st).addEventListener('click', () => show(i - 1));
    $('[data-rs-next]', st).addEventListener('click', () => show(i + 1));
    show(0);
    if (!reduce) raf = requestAnimationFrame(tick);
  });

  /* ---- over pc-spain: office globe ---- */
  $$('canvas[data-globe]').forEach(cv => {
    const pts = JSON.parse(cv.dataset.globe);
    const ctx = cv.getContext('2d');
    const rad = d => d * Math.PI / 180;
    let W = 0, R = 0, dpr = 1, base = -30, lat0 = rad(32), lon0 = rad(base), visible = false, dragX = null, dragBase = 0, t0 = performance.now();
    const resize = () => {
      W = cv.clientWidth; dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = W * dpr; R = W * (W < 600 ? .45 : .4);
    };
    const proj = (la, lo) => {
      la = rad(la); lo = rad(lo);
      const cl = Math.cos(la), d = lo - lon0;
      return { x: cl * Math.sin(d), y: Math.cos(lat0) * Math.sin(la) - Math.sin(lat0) * cl * Math.cos(d), z: Math.sin(lat0) * Math.sin(la) + Math.cos(lat0) * cl * Math.cos(d) };
    };
    const vec = (la, lo) => [Math.cos(rad(la)) * Math.cos(rad(lo)), Math.cos(rad(la)) * Math.sin(rad(lo)), Math.sin(rad(la))];
    const toLL = v => [Math.asin(v[2]) * 180 / Math.PI, Math.atan2(v[1], v[0]) * 180 / Math.PI];
    const slerp = (a, b, t) => {
      const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), om = Math.acos(dot), so = Math.sin(om) || 1;
      const k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so;
      return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    };
    const earth = { ready: false, buf: document.createElement('canvas'), S: 0, map: null, tex: null, TW: 0, TH: 0 };
    const buildMap = () => {
      const S = earth.S = Math.round(Math.min(500, R * 2 * dpr));
      earth.buf.width = earth.buf.height = S;
      earth.img = earth.buf.getContext('2d').createImageData(S, S);
      const n = S * S, rowI = new Int32Array(n), lonR = new Float32Array(n), shade = new Float32Array(n), alpha = new Uint8Array(n);
      const sl = Math.sin(lat0), cl0 = Math.cos(lat0), L = [-.45, .5, .74], Ln = Math.hypot(...L);
      for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
        const k = j * S + i, x = (i + .5) / S * 2 - 1, y = 1 - (j + .5) / S * 2, rr = x * x + y * y;
        if (rr > 1) { alpha[k] = 0; continue; }
        const z = Math.sqrt(1 - rr), la = Math.asin(Math.max(-1, Math.min(1, y * cl0 + z * sl)));
        lonR[k] = Math.atan2(x, z * cl0 - y * sl);
        rowI[k] = Math.min(earth.TH - 1, Math.max(0, Math.floor((.5 - la / Math.PI) * earth.TH))) * earth.TW;
        const lam = (x * L[0] + y * L[1] + z * L[2]) / Ln;
        shade[k] = Math.min(1.12, .32 + Math.max(0, lam) * .95) * (.82 + .18 * z);
        alpha[k] = Math.round(255 * Math.min(1, (1 - Math.sqrt(rr)) * S * .5));
      }
      earth.map = { rowI, lonR, shade, alpha }; lastLon = null;
    };
    let lastLon = null;
    const paintEarth = () => {
      if (earth.map && lastLon !== null && Math.abs(lastLon - lon0) < 1e-4) return;
      lastLon = lon0;
      if (!earth.map || earth.S !== Math.round(Math.min(500, R * 2 * dpr))) buildMap();
      const { rowI, lonR, shade, alpha } = earth.map, d = earth.img.data, t = earth.tex, TW = earth.TW, n = earth.S * earth.S;
      const k0 = TW / (2 * Math.PI);
      for (let k = 0; k < n; k++) {
        const a = alpha[k], o = k * 4;
        if (!a) { d[o + 3] = 0; continue; }
        let u = Math.floor((lonR[k] + lon0 + Math.PI) * k0) % TW; if (u < 0) u += TW;
        const q = (rowI[k] + u) * 4, sh = shade[k];
        d[o] = t[q] * sh; d[o + 1] = t[q + 1] * sh; d[o + 2] = t[q + 2] * sh; d[o + 3] = a;
      }
      earth.buf.getContext('2d').putImageData(earth.img, 0, 0);
    };
    // GPU path: the same orthographic projection and lighting, evaluated per pixel in a shader
    const glr = (() => {
      try {
        const c = document.createElement('canvas'), g = c.getContext('webgl', { premultipliedAlpha: true, antialias: false });
        if (!g) return null;
        const sh = (type, src) => { const o = g.createShader(type); g.shaderSource(o, src); g.compileShader(o); if (!g.getShaderParameter(o, g.COMPILE_STATUS)) throw 0; return o; };
        const pr = g.createProgram();
        g.attachShader(pr, sh(g.VERTEX_SHADER, 'attribute vec2 p;varying vec2 q;void main(){q=p;gl_Position=vec4(p,0.,1.);}'));
        g.attachShader(pr, sh(g.FRAGMENT_SHADER, `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 q;uniform sampler2D T;uniform float lon0,sl,cl,S;
void main(){float rr=dot(q,q);if(rr>1.){gl_FragColor=vec4(0.);return;}
float z=sqrt(1.-rr);float la=asin(clamp(q.y*cl+z*sl,-1.,1.));float lo=atan(q.x,z*cl-q.y*sl)+lon0;
vec3 c=texture2D(T,vec2(fract((lo+3.14159265)/6.28318531),.5-la/3.14159265)).rgb;
float lam=dot(vec3(q,z),normalize(vec3(-.45,.5,.74)));float s=min(1.12,.32+max(0.,lam)*.95)*(.82+.18*z);
float a=clamp((1.-sqrt(rr))*S*.5,0.,1.);gl_FragColor=vec4(min(c*s,vec3(1.))*a,a);}`));
        g.linkProgram(pr); if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
        g.useProgram(pr);
        g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer());
        g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
        const loc = g.getAttribLocation(pr, 'p'); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
        const u = n => g.getUniformLocation(pr, n);
        return { c, g, lon0: u('lon0'), sl: u('sl'), cl: u('cl'), S: u('S') };
      } catch (e) { return null; }
    })();
    const glTex = img => {
      const g = glr.g, t = g.createTexture();
      g.bindTexture(g.TEXTURE_2D, t);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGB, g.RGB, g.UNSIGNED_BYTE, img);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.REPEAT);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      return !g.getError();
    };
    const paintGL = () => {
      const g = glr.g, S = Math.round(R * 2 * dpr);
      if (glr.c.width !== S) { glr.c.width = glr.c.height = S; g.viewport(0, 0, S, S); }
      g.uniform1f(glr.lon0, lon0); g.uniform1f(glr.sl, Math.sin(lat0)); g.uniform1f(glr.cl, Math.cos(lat0)); g.uniform1f(glr.S, S);
      g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      return glr.c;
    };
    const texImg = new Image();
    texImg.onload = () => {
      cv.classList.add('is-ready');
      if (glr && glTex(texImg)) { earth.gpu = true; earth.ready = true; draw(performance.now()); return; }
      const tc = document.createElement('canvas'); tc.width = earth.TW = texImg.naturalWidth; tc.height = earth.TH = texImg.naturalHeight;
      const tx = tc.getContext('2d'); tx.drawImage(texImg, 0, 0);
      earth.tex = tx.getImageData(0, 0, earth.TW, earth.TH).data; earth.ready = true; earth.map = null; lastLon = null; draw(performance.now());
    };
    texImg.onerror = () => cv.classList.add('is-ready');
    texImg.src = cv.dataset.earth || 'assets/img/earth.jpg';
    const hub = pts.find(p => p[0] === 'Amsterdam');
    const draw = (now) => {
      const c = W / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);
      // realistic Earth: NASA Blue Marble texture, orthographic, lit from the upper left
      const gR = Math.min(R * 1.16, c - 1);
      const glow = ctx.createRadialGradient(c, c, R * .96, c, c, gR);
      glow.addColorStop(0, 'rgba(120,170,235,.55)'); glow.addColorStop(.35, 'rgba(120,170,235,.18)'); glow.addColorStop(1, 'rgba(120,170,235,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(c, c, gR, 0, Math.PI * 2); ctx.fill();
      if (earth.ready) {
        const src = earth.gpu ? paintGL() : (paintEarth(), earth.buf);
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src, c - R, c - R, R * 2, R * 2);
      } else {
        const g = ctx.createRadialGradient(c - R * .35, c - R * .4, R * .1, c, c, R);
        g.addColorStop(0, '#2C5D8F'); g.addColorStop(1, '#0B1B33');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
      }
      // thin bright rim of atmosphere
      const rim = ctx.createRadialGradient(c, c, R * .9, c, c, R);
      rim.addColorStop(0, 'rgba(160,200,255,0)'); rim.addColorStop(1, 'rgba(170,210,255,.35)');
      ctx.fillStyle = rim; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
      // arcs from Amsterdam
      const phase = (now / 1400) % 1;
      pts.forEach(p => {
        if (p === hub) return;
        if (proj(p[1], p[2]).z <= .05 || proj(hub[1], hub[2]).z <= .05) return;
        const a = vec(hub[1], hub[2]), b = vec(p[1], p[2]);
        const N = 64, far = Math.acos(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
        const lift = Math.min(.35, .06 + far * .25);
        ctx.beginPath(); let pen = false;
        for (let i = 0; i <= N; i++) {
          const t = i / N, [la, lo] = toLL(slerp(a, b, t)), q = proj(la, lo), h = 1 + lift * Math.sin(Math.PI * t);
          if (q.z > -.15) { const X = c + q.x * R * h, Y = c - q.y * R * h; pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; } else pen = false;
        }
        ctx.setLineDash([4, 6]); ctx.lineDashOffset = -phase * 10;
        ctx.strokeStyle = 'rgba(214,186,140,.95)'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.setLineDash([]);
      });
      // markers
      const compact = W < 600;
      ctx.font = `500 ${compact ? 12.5 : Math.max(11, W * .022)}px Jost, sans-serif`;
      if (compact) {
        const vis = pts.map(p => ({ p, q: proj(p[1], p[2]) })).filter(o => o.q.z > 0).map(o => ({ ...o, X: c + o.q.x * R, Y: c - o.q.y * R }));
        vis.forEach(o => {
          const pulse = (now / 1600 + o.p[1]) % 1;
          ctx.beginPath(); ctx.arc(o.X, o.Y, 3.5 + pulse * 10, 0, Math.PI * 2); ctx.strokeStyle = `rgba(214,186,140,${.7 * (1 - pulse)})`; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(o.X, o.Y, 3.5, 0, Math.PI * 2); ctx.fillStyle = o.p === hub ? '#FFFFFF' : '#D6BA8C'; ctx.fill();
        });
        // labels to the right of their marker; stacked ones get a short leader line
        const gap = 17, side = vis.filter(o => o.q.x < .5).sort((a, b) => a.Y - b.Y);
        const cols = [];
        side.forEach(o => { const col = cols.find(k => Math.abs(k.x - o.X) < 40); col ? col.items.push(o) : cols.push({ x: o.X, items: [o] }); });
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        cols.forEach(col => {
          const lx = Math.max(...col.items.map(o => o.X)) + (col.items.length > 1 ? 30 : 11);
          let prev = -1e9;
          col.items.forEach(o => {
            const ly = Math.max(o.Y, prev + gap); prev = ly;
            if (col.items.length > 1) {
              ctx.beginPath(); ctx.moveTo(o.X + 4, o.Y); ctx.lineTo(lx - 12, ly); ctx.lineTo(lx - 5, ly);
              ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = .8; ctx.stroke();
            }
            ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 5;
            ctx.fillText(o.p[0], lx, ly); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
          });
        });
        vis.filter(o => o.q.x >= .5).forEach(o => { ctx.textAlign = 'right'; ctx.fillStyle = '#FFFFFF'; ctx.fillText(o.p[0], o.X - 10, o.Y); });
        ctx.textBaseline = 'alphabetic';
        return;
      }
      pts.forEach(p => {
        const q = proj(p[1], p[2]);
        if (q.z <= 0) return;
        const X = c + q.x * R, Y = c - q.y * R, pulse = (now / 1600 + p[1]) % 1;
        ctx.beginPath(); ctx.arc(X, Y, 5 + pulse * 14, 0, Math.PI * 2); ctx.strokeStyle = `rgba(214,186,140,${.7 * (1 - pulse)})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(X, Y, 5, 0, Math.PI * 2); ctx.fillStyle = p === hub ? '#FFFFFF' : '#D6BA8C'; ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 6;
        const right = q.x < .5;
        ctx.textAlign = right ? 'left' : 'right';
        ctx.fillText(p[0], X + (right ? 12 : -12), Y + ({ 'Dénia': 17, 'Barcelona': -8, 'Valencia': 3 }[p[0]] ?? 4));
        ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      });
    };
    const loop = (now) => {
      if (visible) {
        if (dragX === null && !reduce) lon0 = rad(base + Math.sin((now - t0) / 5200) * 16);
        draw(now);
      }
      requestAnimationFrame(loop);
    };
    resize(); draw(performance.now());
    addEventListener('resize', () => { if (cv.clientWidth === W) return; resize(); draw(performance.now()); });
    new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting)).observe(cv);
    cv.addEventListener('pointerdown', e => { dragX = e.clientX; dragBase = lon0 * 180 / Math.PI; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (dragX === null) return; lon0 = rad(dragBase - (e.clientX - dragX) * .35); });
    const end = () => { if (dragX === null) return; base = lon0 * 180 / Math.PI; t0 = performance.now(); dragX = null; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    requestAnimationFrame(loop);
  });

  /* ---- draggable carousels ---- */
  $$('[data-drag]').forEach(d => {
    let x0 = 0, s0 = 0, down = false, moved = false;
    d.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; s0 = d.scrollLeft; d.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; d.scrollLeft = s0 - dx; });
    addEventListener('pointerup', () => { down = false; d.classList.remove('is-drag'); });
    d.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    d.addEventListener('dragstart', e => e.preventDefault());
  });

  /* ---- werkwijze: 16 expert dots + satisfaction ring ---- */
  const lightObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    lightObs.unobserve(e.target);
    if (e.target.classList.contains('dots')) $$('i', e.target).forEach((d, k) => setTimeout(() => d.classList.add('on'), reduce ? 0 : 120 * k));
    else e.target.classList.add('in');
  }), { threshold: .4 });
  $$('.dots, .ring').forEach(el => lightObs.observe(el));

  /* ---- partners: filter + accordion ---- */
  const pts = $('[data-pts]');
  if (pts) {
    const rows = $$('.pt', pts), btns = $$('.pt-filters button');
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('on', x === b));
      rows.forEach(r => r.hidden = !(b.dataset.cat === 'all' || r.dataset.cat === b.dataset.cat));
      if (hasGsap && !reduce) gsap.fromTo(rows.filter(r => !r.hidden), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, stagger: .05, duration: .8, ease: 'expo.out' });
      hasGsap && ScrollTrigger.refresh();
    }));
    rows.forEach(r => $('.pt__head', r).addEventListener('click', () => {
      const open = !r.classList.contains('open');
      r.classList.toggle('open', open);
      $('.pt__head', r).setAttribute('aria-expanded', open);
      setTimeout(() => hasGsap && ScrollTrigger.refresh(), 850);
    }));
  }

  /* ---- scroll-driven extras (GSAP) ---- */
  const extras = () => {
    if (!hasGsap || reduce) return;
    // words brighten as you read
    $$('[data-words]').forEach(el => {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
      gsap.fromTo($$('.w', el), { opacity: .14 }, { opacity: 1, stagger: .05, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    // collage route line draws in
    $$('.collage__route path').forEach(p => {
      gsap.fromTo(p, { strokeDashoffset: 1, strokeDasharray: 1 }, { strokeDashoffset: 0, duration: 2.4, delay: .8, ease: 'power2.inOut' });
    });
    $$('.collage figure').forEach((f, k) => gsap.to(f, { yPercent: [-8, 10, -14][k] || 0, ease: 'none',
      scrollTrigger: { trigger: f.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
    // step rail
    const rs = $('[data-rail]');
    if (rs && desktop()) {
      const track = $('.rail__track', rs), prog = $('.rail__prog', rs), cards = $$('.rail__card', rs);
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: rs, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: s => { if (prog) prog.style.strokeDashoffset = 100 - s.progress * 100; cards.forEach((c, k) => c.classList.toggle('lit', s.progress >= k / cards.length - .02)); } } });
    }
    // stacking cards: earlier cards recede
    const sc = $$('.stack__card');
    if (desktop()) sc.forEach((card, k) => {
      const next = sc[k + 1];
      if (!next) return;
      gsap.to(card, { scale: .94, opacity: .55, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true } });
    });
    ScrollTrigger.refresh();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(extras, 50)); else addEventListener('load', extras);


  /* ------------------------------------------------ v5: commission calculator */
  $$('[data-calc]').forEach(box => {
    const r = $('input[type=range]', box), out = $('.calc__amount', box), fee = $('.calc__fee', box), rows = $$('.calc__tiers li', box);
    const eur = n => '€ ' + Math.round(n).toLocaleString('nl-NL');
    const upd = () => {
      const v = +r.value, pct = (v - r.min) / (r.max - r.min) * 100;
      r.style.setProperty('--p', pct + '%');
      out.textContent = eur(v);
      let k = rows.findIndex(li => +li.dataset.max && v <= +li.dataset.max);
      if (k < 0) k = rows.length - 1;
      rows.forEach((li, j) => li.classList.toggle('on', j === k));
      fee.textContent = +rows[k].dataset.max ? $('b', rows[k]).textContent : eur(v * .04) + ',-';
    };
    r.addEventListener('input', upd); upd();
  });

  /* ------------------------------------------------ v5: article index hover preview */
  $$('[data-tindex]').forEach(ix => {
    const imgs = $$('.tindex__frame img', ix), links = $$('.tindex__list a', ix);
    const go = i => { imgs.forEach((im, j) => im.classList.toggle('on', j === i)); links.forEach((a, j) => a.classList.toggle('on', j === i)); };
    links.forEach((a, i) => { a.addEventListener('mouseenter', () => go(i)); a.addEventListener('focus', () => go(i)); });
    go(0);
  });

  /* ------------------------------------------------ v5: reading progress */
  const rb = $('.readbar i');
  if (rb) {
    const art = $('.ar-body') || document.body;
    const onS = () => {
      const r = art.getBoundingClientRect(), total = r.height - innerHeight * .6;
      rb.style.transform = `scaleX(${Math.min(1, Math.max(0, -r.top / Math.max(1, total)))})`;
    };
    addEventListener('scroll', onS, { passive: true }); onS();
  }




  /* ------------------------------------------------ reviews: quote switched by the reviewer tabs */
  $$('[data-rq]').forEach(box => {
    const qs = $$('.rq__q', box), ps = $$('.rq__p', box);
    let i = 0, timer = null;
    const show = k => {
      i = (k + qs.length) % qs.length;
      qs.forEach((q, j) => q.classList.toggle('on', j === i));
      ps.forEach((p, j) => { p.classList.remove('on'); void p.offsetWidth; p.classList.toggle('on', j === i); });
      clearTimeout(timer); if (!reduce) timer = setTimeout(() => show(i + 1), 8000);
    };
    ps.forEach((p, j) => p.addEventListener('click', () => show(j)));
    box.addEventListener('mouseenter', () => { box.classList.add('paused'); clearTimeout(timer); });
    box.addEventListener('mouseleave', () => { box.classList.remove('paused'); show(i + 1); });
    show(0);
  });


  /* ------------------------------------------------ intake: step-by-step form, posted to FormSubmit (info@pc-spain.com) */
  $$('[data-iform]').forEach(f => {
    const steps = $$('.istep', f), nav = $$('.iform__steps li', f), bar = $('.iform__bar i', f), msg = $('.iform__msg', f);
    const back = $('[data-back]', f), next = $('[data-next]', f), send = $('[data-send]', f), done = $('.iform__done', f);
    let cur = 0;
    const go = k => {
      cur = k;
      steps.forEach((s, j) => s.classList.toggle('on', j === k));
      nav.forEach((n, j) => { n.classList.toggle('on', j === k); n.classList.toggle('done', j < k); });
      bar.style.transform = `scaleX(${(k + 1) / steps.length})`;
      back.hidden = k === 0; next.hidden = k === steps.length - 1; send.hidden = k !== steps.length - 1; msg.textContent = '';
      const top = f.getBoundingClientRect().top;
      if (top < 80) (lenis ? lenis.scrollTo(f, { offset: -120 }) : f.scrollIntoView({ behavior: 'smooth' }));
    };
    const valid = k => {
      const s = steps[k];
      const groups = [...new Set($$('input[type=radio]', s).map(r => r.name))];
      if (k === 0 && groups.some(g => !$(`input[name="${CSS.escape(g)}"]:checked`, s))) { msg.textContent = f.dataset.need; return false; }
      let ok = true;
      $$('input[required], textarea[required], select[required]', s).forEach(el => {
        if (el.type === 'radio') return;
        const bad = !el.checkValidity();
        el.closest('.field') && el.closest('.field').classList.toggle('bad', bad);
        if (bad) ok = false;
      });
      if (!ok) msg.textContent = f.dataset.fields;
      return ok;
    };
    // choosing an answer on step 1 moves on by itself
    $$('input[type=radio]', steps[0]).forEach(r => r.addEventListener('change', () => setTimeout(() => go(1), 280)));
    next.addEventListener('click', () => { if (valid(cur)) go(cur + 1); });
    f.addEventListener('input', e => {
      const fld = e.target.closest('.field');
      if (fld && e.target.checkValidity()) fld.classList.remove('bad');
      if (!$$('.field.bad', f).length) msg.textContent = '';
    });
    f.addEventListener('change', () => { if (!$$('.field.bad', f).length) msg.textContent = ''; });
    back.addEventListener('click', () => go(cur - 1));
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!valid(cur)) return;
      if ($('.iform__hp', f).value) return;
      f.classList.add('sending'); msg.textContent = '';
      try {
        const r = await fetch(f.dataset.endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
        if (!r.ok) throw new Error(r.status);
        f.classList.add('is-done'); steps.forEach(s => s.classList.remove('on')); done.hidden = false;
      } catch (err) { msg.textContent = f.dataset.fail; }
      f.classList.remove('sending');
    });
    go(0);
  });


  /* ------------------------------------------------ floating contact button */
  $$('[data-fab]').forEach(fab => {
    const btn = $('.fab__btn', fab);
    const set = open => { fab.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', e => { e.stopPropagation(); set(!fab.classList.contains('open')); });
    document.addEventListener('click', e => { if (!fab.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  });


  /* ------------------------------------------------ contact robot: says hello once per visit */
  const bot = $('.cbtn--bot');
  if (bot) {
    let greeted = false;
    try { greeted = sessionStorage.getItem('pcs-hi') === '1'; } catch (e) {}
    if (!greeted) {
      setTimeout(() => { bot.classList.add('say'); try { sessionStorage.setItem('pcs-hi', '1'); } catch (e) {} }, 2800);
      setTimeout(() => bot.classList.remove('say'), 9500);
    }
    bot.addEventListener('click', () => bot.classList.remove('say'));
  }

  /* ------------------------------------------------ contact panel */
  const cd = $('[data-cd]'), copen = $('[data-copen]');
  if (cd && copen) {
    const set = open => {
      cd.classList.toggle('open', open); cd.setAttribute('aria-hidden', !open); copen.setAttribute('aria-expanded', open);
      document.body.classList.toggle('cd-open', open);
      if (open) { lenis && lenis.stop(); setTimeout(() => { const c = $('.cd__close', cd); c && c.focus(); }, 400); }
      else { lenis && lenis.start(); copen.focus(); }
    };
    copen.addEventListener('click', () => set(true));
    $$('[data-cclose]', cd).forEach(b => b.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && cd.classList.contains('open')) set(false); });
  }

  /* ------------------------------------------------ "Voordelen": free sideways carousel (arrows, drag, swipe, keys) */
  const hsM = $('.hs');
  if (hsM) {
    const track = $('.hs__track', hsM), bar = $('.hs__bar i', hsM), count = $('.hs__count b', hsM), cards = $$('.hs__card', hsM);
    const en = (document.documentElement.lang || '').startsWith('en');
    const head = $('.hs__head', hsM);
    const nav = document.createElement('div');
    nav.className = 'hs__nav';
    nav.innerHTML = `<button type="button" data-hs-prev aria-label="${en ? 'Previous' : 'Vorige'}"><svg viewBox="0 0 26 10" fill="none" stroke="currentColor" aria-hidden="true"><path d="M26 5H1M5 1L1 5l4 4"/></svg></button><button type="button" data-hs-next aria-label="${en ? 'Next' : 'Volgende'}"><svg viewBox="0 0 26 10" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 5h25M21 1l4 4-4 4"/></svg></button>`;
    head && head.appendChild(nav);
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', en ? 'Advantages, scroll sideways' : 'Voordelen, scroll opzij');
    const prevB = $('[data-hs-prev]', nav), nextB = $('[data-hs-next]', nav);
    const stepW = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth * .8);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth, p = max > 0 ? track.scrollLeft / max : 0;
      if (bar) bar.style.transform = `scaleX(${Math.max(1 / cards.length, p)})`;
      const k = track.scrollLeft > max - 4 ? cards.length - 1 : Math.round(track.scrollLeft / stepW());
      if (count) count.textContent = String(Math.min(cards.length, k + 1)).padStart(2, '0');
      prevB.disabled = track.scrollLeft < 4; nextB.disabled = track.scrollLeft > max - 4;
    };
    prevB.addEventListener('click', () => track.scrollBy({ left: -stepW(), behavior: reduce ? 'auto' : 'smooth' }));
    nextB.addEventListener('click', () => track.scrollBy({ left: stepW(), behavior: reduce ? 'auto' : 'smooth' }));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); nextB.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevB.click(); }
    });
    // mouse drag (touch and trackpads scroll natively)
    let x0 = 0, s0 = 0, down = false, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft; track.classList.add('is-drag'); });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = s0 - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('is-drag'); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }
  let readY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY, nearEnd = y + innerHeight > document.documentElement.scrollHeight - 700;
    if (Math.abs(y - readY) < 12) return;
    document.body.classList.toggle('is-reading', !desktop() && y > readY && y > 300 && !nearEnd);
    readY = y;
  }, { passive: true });

  /* ------------------------------------------------ to top */
  $$('[data-top]').forEach(b => b.addEventListener('click', () => scrollTo(0)));
})();
