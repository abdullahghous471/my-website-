/* Black Apple Group · homepage interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // conversion events, ready for GA4 / Meta Pixel (dataLayer is read by Google Tag Manager)
  window.dataLayer = window.dataLayer || [];
  const track = (event, extra = {}) => window.dataLayer.push({ event, ...extra });
  document.addEventListener('click', e => { const t = e.target.closest('[data-track]'); if (t && t.tagName === 'A') track(t.dataset.track); });

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  $$('.hero .rv').forEach(el => requestAnimationFrame(() => el.classList.add('in')));
  const strat = $('[data-strategy]');
  if (strat) new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { strat.classList.add('in'); o.disconnect(); } }, { threshold: .35 }).observe(strat);

  // header + mobile bar
  const hd = $('[data-header]'), mbar = $('[data-mbar]'), hero = $('[data-hero]'), review = $('#review');
  const onScroll = () => {
    hd.classList.toggle('is-scrolled', scrollY > 10);
    const past = scrollY > (hero ? hero.offsetHeight * .6 : 400);
    const r = review.getBoundingClientRect(), atForm = r.top < innerHeight * .6 && r.bottom > innerHeight * .3;
    mbar.classList.toggle('is-on', past && !atForm);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // mobile menu
  const burger = $('[data-burger]'), drawer = $('[data-drawer]');
  burger.addEventListener('click', () => { const open = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', open); drawer.classList.toggle('is-open', open); });
  drawer.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); drawer.classList.remove('is-open'); } });

  // video: load Vimeo only when asked (keeps the page fast)
  const vm = $('[data-vmodal]'), vf = $('[data-vframe]');
  const closeV = () => { vm.hidden = true; vf.innerHTML = ''; };
  $('[data-video]').addEventListener('click', () => {
    vf.innerHTML = '<iframe src="https://player.vimeo.com/video/1231287031?autoplay=1&texttrack=en&title=0&byline=0&portrait=0&color=C9A44C" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Welcome from Joseph Hull"></iframe>';
    vm.hidden = false; track('video_play');
  });
  $('[data-vclose]').addEventListener('click', closeV);
  vm.addEventListener('click', e => { if (e.target === vm) closeV(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !vm.hidden) closeV(); });

  // DIME calculator
  const calc = $('[data-calc]');
  const num = s => +String(s).replace(/[^\d.]/g, '') || 0;
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const out = $('[data-calc-out]'), bar = $('[data-calc-bar]'), parts = $('[data-calc-parts]'), yOut = $('[data-years-out]');
  let shown = 0, raf;
  function compute() {
    const v = {}; $$('[data-k]', calc).forEach(i => v[i.dataset.k] = num(i.value));
    yOut.textContent = v.years;
    const inc = v.income * v.years, total = v.debt + inc + v.mortgage + v.edu, gap = Math.max(0, total - v.have);
    parts.innerHTML = [['Debt', v.debt], ['Income', inc], ['Mortgage', v.mortgage], ['Education', v.edu]].map(([k, n]) => `<li>${k}<b>${money(n)}</b></li>`).join('');
    bar.style.width = total ? Math.min(100, gap / total * 100) + '%' : '0%';
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3); shown = from + (gap - from) * e; out.textContent = money(Math.round(shown / 1000) * 1000); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  $$('[data-k]', calc).forEach(i => {
    i.addEventListener('input', compute);
    if (i.type !== 'range') i.addEventListener('blur', () => { i.value = num(i.value).toLocaleString('en-US'); });
  });
  compute();
  calc.addEventListener('submit', e => {
    e.preventDefault();
    const em = $('[data-cap-email]');
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    em.classList.toggle('is-bad', !ok);
    if (!ok) { em.focus(); return; }
    $('[data-calc-cap]').hidden = true; $('[data-calc-ok]').hidden = false;
    track('calculator_lead', { estimate: out.textContent });
  });

  // review form / booking tabs
  const tabs = $$('[data-tab]'), panes = $$('[data-pane]'), done = $('[data-done]');
  const showTab = name => {
    tabs.forEach(t => { const on = t.dataset.tab === name; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', on); });
    panes.forEach(p => p.hidden = p.dataset.pane !== name); done.hidden = true;
  };
  tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
  document.addEventListener('click', e => { const a = e.target.closest('a[href="#book"]'); if (a) { e.preventDefault(); showTab('book'); review.scrollIntoView({ behavior: 'smooth' }); } });

  // lead form with consent
  const form = $('[data-lead]'), err = $('[data-err]');
  let booked = '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    let bad = false;
    $$('input[required], select[required]', form).forEach(f => {
      const ok = f.type === 'checkbox' ? f.checked : f.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()) : f.value.trim().length > 1 || (f.tagName === 'SELECT' && f.value);
      (f.closest('.fld') || f.closest('.consent')).classList.toggle('is-bad', !ok); if (!ok) bad = true;
    });
    err.hidden = !bad;
    if (bad) return;
    form.hidden = true; done.hidden = false;
    if (booked) $('[data-done-p]').innerHTML = `Your call is requested for <b>${booked} CT</b>. Joseph will confirm by text or email shortly. Questions? Call <a href="tel:+17087057783">(708) 705-7783</a>.`;
    track('lead_submit', { booked: !!booked });
  });
  form.addEventListener('input', e => { const w = e.target.closest('.fld, .consent'); if (w) w.classList.remove('is-bad'); });

  // booking picker: next five weekdays, 30-minute slots in Central Time
  const daysEl = $('[data-days]'), slotsEl = $('[data-slots]'), go = $('[data-book-go]');
  const days = []; const d = new Date();
  while (days.length < 5) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) days.push(new Date(d)); }
  const SLOTS = ['9:00 AM', '9:30 AM', '10:30 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:00 PM'];
  let day = null, slot = null;
  daysEl.innerHTML = days.map((x, i) => `<button type="button" data-d="${i}">${x.toLocaleDateString('en-US', { weekday: 'short' })}<b>${x.getDate()}</b>${x.toLocaleDateString('en-US', { month: 'short' })}</button>`).join('');
  const renderSlots = () => {
    // a few slots look taken, so the calendar feels real
    slotsEl.innerHTML = SLOTS.map((s, i) => `<button type="button" data-s="${s}" ${(i + day) % 4 === 1 ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}>${s}</button>`).join('');
  };
  daysEl.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; day = +b.dataset.d; slot = null; $$('button', daysEl).forEach(x => x.classList.toggle('is-on', x === b)); renderSlots(); go.disabled = true; });
  slotsEl.addEventListener('click', e => { const b = e.target.closest('button:not([disabled])'); if (!b) return; slot = b.dataset.s; $$('button', slotsEl).forEach(x => x.classList.toggle('is-on', x === b)); go.disabled = false; });
  daysEl.querySelector('button').click();
  go.addEventListener('click', () => {
    booked = days[day].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + slot;
    showTab('form'); track('booking_slot', { slot: booked });
    const note = document.createElement('p'); note.className = 'fine'; note.style.margin = '0 0 4px'; note.style.color = 'var(--gold-hi)';
    note.textContent = 'Selected: ' + booked + ' CT. Add your details to confirm.';
    const old = form.querySelector('[data-booked]'); if (old) old.remove(); note.dataset.booked = ''; form.prepend(note);
  });
})();
