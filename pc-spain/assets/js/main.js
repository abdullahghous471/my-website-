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

  /* ------------------------------------------------ page transitions */
  const curtain = $('.curtain');
  const leave = (href) => {
    if (!hasGsap || reduce || !curtain) { location.href = href; return; }
    gsap.set(curtain, { yPercent: 100, display: 'grid' });
    gsap.timeline({ onComplete: () => { location.href = href; } })
      .to(curtain, { yPercent: 0, duration: .8, ease: 'expo.inOut' })
      .fromTo('.curtain__word span', { yPercent: 110 }, { yPercent: 0, duration: .6, ease: 'expo.out' }, '-=.35');
  };
  if (curtain && hasGsap && !reduce) {
    gsap.timeline({ delay: .1 })
      .to('.curtain__word span', { yPercent: -110, duration: .6, ease: 'expo.in' })
      .to(curtain, { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=.15')
      .set(curtain, { display: 'none' });
  } else if (curtain) curtain.style.display = 'none';
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
    const y = lenis ? lenis.scroll : scrollY;
    const heroH = intro ? intro.offsetHeight * (hasGsap && !reduce ? 2.1 : 1) - 80 : ($('.lx-hero') ? $('.lx-hero').offsetHeight - 80 : 60);
    hd.classList.toggle('is-solid', y > heroH || (!intro && !$('.lx-hero') && y > 40));
    hd.classList.toggle('is-hidden', y > lastY + 2 && y > 600 && !$('.menu.is-open'));
    if (y < lastY - 2) hd.classList.remove('is-hidden');
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

  /* ------------------------------------------------ lazy / in-view videos */
  const vids = $$('video[data-src]');
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src) { v.src = v.dataset.src; }
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
      gsap.timeline({ delay: .9 })
        .from(title, { yPercent: 120, duration: 1.4, stagger: .1, ease: 'expo.out' })
        .from(win, { clipPath: mob ? 'inset(100% 16% 0% 16% round 50vw 50vw 0vw 0vw)' : 'inset(100% 37% 0% 37% round 40vw 40vw 0vw 0vw)', duration: 1.6, ease: 'expo.inOut' }, '<.1')
        .from('.intro__side', { autoAlpha: 0, duration: 1 }, '<.6');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: intro, start: 'top top', end: '+=110%', pin: true, scrub: 1,
          onUpdate: s => hd && hd.classList.toggle('is-light', s.progress > .82 && !hd.classList.contains('is-solid')),
          onLeaveBack: () => hd && hd.classList.remove('is-light') }
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
    if (hs && desktop()) {
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
    orb.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); });
    orb.addEventListener('mouseleave', () => { paused = false; schedule(); });
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
      stage.innerHTML = it.video ? `<video src="${it.video}" controls autoplay playsinline></video>` : `<img src="${it.src}" alt="">`;
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

  /* ------------------------------------------------ to top */
  $$('[data-top]').forEach(b => b.addEventListener('click', () => scrollTo(0)));
})();
