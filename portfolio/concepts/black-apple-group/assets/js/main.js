/* Black Apple Group · homepage interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // conversion events for GA4 / Meta Pixel (read by Google Tag Manager)
  window.dataLayer = window.dataLayer || [];
  const track = (event, extra = {}) => window.dataLayer.push({ event, ...extra });
  document.addEventListener('click', e => { const t = e.target.closest('a[data-track]'); if (t) track(t.dataset.track); });

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });

  // header + mobile bar
  const hd = $('[data-header]'), story = $('[data-story]'), mbar = $('[data-mbar]'), review = $('#review');
  const onScroll = () => {
    hd.classList.toggle('is-solid', scrollY > 30);
    const r = review.getBoundingClientRect();
    mbar.classList.toggle('is-on', scrollY > innerHeight * .8 && !(r.top < innerHeight * .7 && r.bottom > innerHeight * .3));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('[data-burger]'), drawer = $('[data-drawer]');
  burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); drawer.classList.toggle('is-open', o); });
  drawer.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); drawer.classList.remove('is-open'); } });

  // background videos play only while on screen
  const vio = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .15 });
  $$('video[data-autoplay]').forEach(v => vio.observe(v));

  // Joseph's welcome video (Vimeo loads only when asked)
  const vm = $('[data-vmodal]'), vf = $('[data-vframe]');
  const closeV = () => { vm.hidden = true; vf.innerHTML = ''; };
  $$('[data-video]').forEach(b => b.addEventListener('click', () => {
    vf.innerHTML = '<iframe src="https://player.vimeo.com/video/1231287031?autoplay=1&texttrack=en&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Welcome from Joseph Hull"></iframe>';
    vm.hidden = false; track('video_play');
  }));
  $('[data-vclose]').addEventListener('click', closeV);
  vm.addEventListener('click', e => { if (e.target === vm) closeV(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !vm.hidden) closeV(); });

  // coverage list: a small photo or film follows the cursor
  const list = $('[data-clist]'), peek = $('[data-cpeek]');
  if (list && peek && matchMedia('(hover: hover)').matches) {
    let px = 0, py = 0, x = 0, y = 0, raf = 0, curSrc = '';
    const loop = () => { x += (px - x) * .16; y += (py - y) * .16; peek.style.left = x + 'px'; peek.style.top = y + 'px'; raf = requestAnimationFrame(loop); };
    list.addEventListener('mousemove', e => { px = e.clientX + 190; py = e.clientY; });
    $$('li', list).forEach(li => li.addEventListener('mouseenter', e => {
      const src = li.dataset.media;
      if (src !== curSrc) {
        curSrc = src;
        peek.innerHTML = src.endsWith('.mp4') ? `<video src="${src}" muted loop playsinline autoplay></video>` : `<img src="${src}" alt="">`;
      }
      if (!raf) { x = px = e.clientX + 190; y = py = e.clientY; loop(); }
      peek.classList.add('on');
    }));
    list.addEventListener('mouseleave', () => { peek.classList.remove('on'); cancelAnimationFrame(raf); raf = 0; });
  }

  // DIME calculator
  const calc = $('[data-calc]');
  const num = s => +String(s).replace(/[^\d.]/g, '') || 0, money = n => '$' + Math.round(n).toLocaleString('en-US');
  const out = $('[data-calc-out]'), bars = $('[data-bars]'), yOut = $('[data-years-out]');
  bars.innerHTML = ['Debt', 'Income', 'Mortgage', 'Education'].map(k => `<div class="bar">${k}<i><b></b></i><span>$0</span></div>`).join('');
  const rows = $$('.bar', bars);
  let shownV = 0, raf2;
  function compute() {
    const v = {}; $$('[data-k]', calc).forEach(i => v[i.dataset.k] = num(i.value));
    yOut.textContent = v.years;
    const parts = [v.debt, v.income * v.years, v.mortgage, v.edu], total = parts.reduce((a, b) => a + b, 0), gap = Math.max(0, total - v.have), max = Math.max(...parts, 1);
    rows.forEach((r, i) => { r.querySelector('b').style.width = (parts[i] / max * 100) + '%'; r.querySelector('span').textContent = money(parts[i]); });
    cancelAnimationFrame(raf2); const from = shownV, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3); shownV = from + (gap - from) * e; out.textContent = money(Math.round(shownV / 1000) * 1000); if (k < 1) raf2 = requestAnimationFrame(step); };
    raf2 = requestAnimationFrame(step);
  }
  $$('[data-k]', calc).forEach(i => { i.addEventListener('input', compute); if (i.type !== 'range') i.addEventListener('blur', () => i.value = num(i.value).toLocaleString('en-US')); });
  compute();
  calc.addEventListener('submit', e => {
    e.preventDefault(); const em = $('[data-cap-email]'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    em.classList.toggle('is-bad', !ok); if (!ok) { em.focus(); return; }
    $('[data-calc-cap]').hidden = true; $('[data-calc-ok]').hidden = false; track('calculator_lead', { estimate: out.textContent });
  });

  // review form + booking
  const tabs = $$('[data-tab]'), panes = $$('[data-pane]'), done = $('[data-done]'), form = $('[data-lead]'), err = $('[data-err]');
  const showTab = n => { tabs.forEach(t => { const on = t.dataset.tab === n; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); }); panes.forEach(p => p.hidden = p.dataset.pane !== n); done.hidden = true; };
  tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
  document.addEventListener('click', e => { const a = e.target.closest('a[href="#book"]'); if (a) { e.preventDefault(); showTab('book'); review.scrollIntoView({ behavior: 'smooth' }); } });
  let booked = '';
  form.addEventListener('submit', e => {
    e.preventDefault(); let bad = false;
    $$('input[required], select[required]', form).forEach(f => {
      const ok = f.type === 'checkbox' ? f.checked : f.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()) : f.value.trim().length > 1 || (f.tagName === 'SELECT' && f.value);
      (f.closest('.fld') || f.closest('.consent')).classList.toggle('is-bad', !ok); if (!ok) bad = true;
    });
    err.hidden = !bad; if (bad) return;
    form.hidden = true; done.hidden = false;
    if (booked) $('[data-done-p]').innerHTML = `Your call is requested for <b>${booked} CT</b>. Joseph will confirm by text or email shortly.`;
    track('lead_submit', { booked: !!booked });
  });
  form.addEventListener('input', e => { const w = e.target.closest('.fld, .consent'); if (w) w.classList.remove('is-bad'); });
  const daysEl = $('[data-days]'), slotsEl = $('[data-slots]'), go = $('[data-book-go]');
  const days = [], d = new Date(); while (days.length < 5) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) days.push(new Date(d)); }
  const SL = ['9:00 AM', '9:30 AM', '10:30 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:00 PM'];
  let day = 0, slot = null;
  daysEl.innerHTML = days.map((x, i) => `<button type="button" data-d="${i}">${x.toLocaleDateString('en-US', { weekday: 'short' })}<b>${x.getDate()}</b>${x.toLocaleDateString('en-US', { month: 'short' })}</button>`).join('');
  const renderSlots = () => slotsEl.innerHTML = SL.map((s, i) => `<button type="button" data-s="${s}" ${(i + day) % 4 === 1 ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}>${s}</button>`).join('');
  daysEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; day = +b.dataset.d; slot = null; $$('button', daysEl).forEach(x => x.classList.toggle('is-on', x === b)); renderSlots(); go.disabled = true; });
  slotsEl.addEventListener('click', e => { const b = e.target.closest('button:not([disabled])'); if (!b) return; slot = b.dataset.s; $$('button', slotsEl).forEach(x => x.classList.toggle('is-on', x === b)); go.disabled = false; });
  daysEl.querySelector('button').click();
  go.addEventListener('click', () => {
    booked = days[day].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + slot;
    showTab('form'); track('booking_slot', { slot: booked });
    const old = form.querySelector('[data-booked]'); if (old) old.remove();
    const n = document.createElement('p'); n.className = 'fine'; n.dataset.booked = ''; n.style.cssText = 'margin:0;color:var(--sage)'; n.textContent = 'Selected: ' + booked + ' CT. Add your details to confirm.'; form.prepend(n);
  });
})();
