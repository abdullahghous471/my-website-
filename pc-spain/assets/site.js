(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover:hover)').matches;

  /* ---------- Page load ---------- */
  const loader = $('#loader');
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    loader && loader.classList.add('done');
    document.body.classList.add('loaded');
  };
  if (loader) {
    addEventListener('load', () => setTimeout(finish, reduce ? 0 : 900));
    setTimeout(finish, 3500);
  } else {
    requestAnimationFrame(() => requestAnimationFrame(finish));
  }

  /* ---------- Header, progress, parallax ---------- */
  const bar = $('#topbar'), prog = $('#progress'), drawer = $('#drawer');
  const par = $$('[data-parallax]'), parImg = $$('[data-parallax-img]');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    if (bar) {
      bar.classList.toggle('scrolled', y > 40);
      bar.classList.toggle('hide', y > lastY && y > 600 && !(drawer && drawer.classList.contains('open')));
    }
    lastY = y;
    if (!reduce) {
      par.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const c = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0,${c * -parseFloat(el.dataset.parallax)}px,0)`;
      });
      parImg.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const c = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0,${c * -parseFloat(el.dataset.parallaxImg)}px,0)`;
      });
    }
    updateTimeline();
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
    if (e.target.hasAttribute('data-count')) countUp(e.target);
  }), { threshold: .15, rootMargin: '0px 0px -60px 0px' });
  $$('.rv,[data-clip],[data-count],.step,.tiers').forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  function countUp(el) {
    const to = parseInt(el.dataset.count, 10), dur = reduce ? 0 : 1800, t0 = performance.now();
    const tick = t => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Timeline progress ---------- */
  const tl = $$('.timeline');
  function updateTimeline() {
    tl.forEach(t => {
      const fill = $('.timeline__fill', t);
      if (!fill) return;
      const r = t.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height));
      fill.style.height = `calc(${p * 100}% - ${p * 20}px)`;
      $$('.step', t).forEach(s => {
        const sr = s.getBoundingClientRect();
        s.classList.toggle('lit', sr.top < innerHeight * .6);
      });
    });
  }
  onScroll();

  /* ---------- Lazy background videos ---------- */
  $$('video[data-src]').forEach(v => {
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return;
      v.src = v.dataset.src;
      v.play().catch(() => {});
      o.disconnect();
    }), { rootMargin: '300px' }).observe(v);
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
      $$('#drawer>ul>li').forEach((li, i) => li.style.transitionDelay = open ? `${.15 + i * .06}s` : '0s');
    });
  }

  /* ---------- Accordion ---------- */
  $$('.acc').forEach(acc => {
    $$('.acc__btn', acc).forEach(btn => btn.addEventListener('click', () => {
      const item = btn.parentElement, was = item.classList.contains('open');
      $$('.acc__item', acc).forEach(i => { i.classList.remove('open'); $('.acc__btn', i).setAttribute('aria-expanded', 'false'); });
      if (!was) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
    }));
  });

  /* ---------- Testimonials slider ---------- */
  const track = $('#tTrack');
  if (track) {
    const cards = $$('.t-card', track), dots = $('#tDots');
    let idx = 0, timer;
    const perView = () => innerWidth <= 720 ? 1 : innerWidth <= 1100 ? 2 : 3;
    const maxIdx = () => Math.max(0, cards.length - perView());
    const renderDots = () => {
      dots.innerHTML = '';
      for (let i = 0; i <= maxIdx(); i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Ga naar ${i + 1}`);
        b.onclick = () => go(i, true);
        dots.appendChild(b);
      }
    };
    const go = (i, user) => {
      idx = (i + maxIdx() + 1) % (maxIdx() + 1);
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      track.style.transform = `translateX(${-idx * (cards[0].offsetWidth + gap)}px)`;
      $$('button', dots).forEach((d, j) => d.classList.toggle('on', j === idx));
      if (user) restart();
    };
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(idx + 1), 5500); };
    $('#tPrev').onclick = () => go(idx - 1, true);
    $('#tNext').onclick = () => go(idx + 1, true);
    let sx = 0;
    track.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    track.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1), true); });
    addEventListener('resize', () => { renderDots(); go(Math.min(idx, maxIdx())); });
    renderDots(); go(0); restart();
  }

  /* ---------- Before / after ---------- */
  $$('.ba').forEach(ba => {
    const range = $('input', ba), before = $('.ba__before', ba), handle = $('.ba__handle', ba);
    const set = v => { before.style.clipPath = `inset(0 ${100 - v}% 0 0)`; handle.style.left = `${v}%`; };
    range.addEventListener('input', () => set(range.value));
    set(range.value);
    if (!reduce) {
      new IntersectionObserver((es, o) => es.forEach(e => {
        if (!e.isIntersecting) return;
        o.disconnect();
        let t0 = null;
        const anim = t => {
          t0 = t0 || t;
          const p = Math.min(1, (t - t0) / 2200);
          const v = 50 + Math.sin(p * Math.PI * 2) * 28 * (1 - p);
          range.value = v; set(v);
          if (p < 1) requestAnimationFrame(anim);
        };
        requestAnimationFrame(anim);
      }), { threshold: .5 }).observe(ba);
    }
  });

  /* ---------- Listing filters + load more ---------- */
  const lgrid = $('#lGrid');
  if (lgrid) {
    const cards = $$('.l-card', lgrid), btns = $$('#filters button'), more = $('#loadMore');
    const PAGE = 12;
    let city = 'all', shown = PAGE;
    const render = () => {
      const match = cards.filter(c => city === 'all' || c.dataset.city === city);
      cards.forEach(c => c.hidden = true);
      match.slice(0, shown).forEach((c, i) => {
        c.hidden = false;
        if (!reduce) c.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: (i % PAGE) * 45, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      });
      more.hidden = match.length <= shown;
    };
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('on', x === b));
      city = b.dataset.city; shown = PAGE; render();
    }));
    more.addEventListener('click', () => { shown += PAGE; render(); });
    render();
  }

  /* ---------- Pointer effects ---------- */
  if (!reduce && finePointer) {
    $$('[data-tilt]').forEach(card => {
      const glow = $('.glow', card);
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 6}deg) translateY(-6px)`;
        if (glow) { glow.style.left = `${x * 100}%`; glow.style.top = `${y * 100}%`; }
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
    const cur = $('#cursor');
    if (cur) {
      let cx = 0, cy = 0, tx = 0, ty = 0;
      addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.style.opacity = 1; });
      document.addEventListener('mouseleave', () => cur.style.opacity = 0);
      (function loop() { cx += (tx - cx) * .18; cy += (ty - cy) * .18; cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
      document.addEventListener('mouseover', e => cur.classList.toggle('big', !!e.target.closest('a,button,[data-tilt],.ba')));
    }
  }

  /* ---------- Video modal ---------- */
  const modal = $('#modal');
  if (modal) {
    const mv = $('#modalVideo');
    const close = () => { modal.classList.remove('open'); mv.pause(); };
    $('#playBtn').onclick = () => { modal.classList.add('open'); mv.currentTime = 0; mv.play().catch(() => {}); };
    $('#modalX').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Back to top ---------- */
  const top = $('#toTop');
  if (top) top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
})();
