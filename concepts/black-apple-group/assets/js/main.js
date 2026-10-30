/* Black Apple Group · homepage interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => innerWidth <= 900;

  // conversion events for GA4 / Meta Pixel (read by Google Tag Manager)
  window.dataLayer = window.dataLayer || [];
  const track = (event, extra = {}) => window.dataLayer.push({ event, ...extra });
  document.addEventListener('click', e => { const t = e.target.closest('a[data-track]'); if (t) track(t.dataset.track); });

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  $$('.hero .rv').forEach((el, i) => setTimeout(() => el.classList.add('in'), 250 + i * 160));

  // header + mobile bar
  const hd = $('[data-header]'), hero = $('.hero'), mbar = $('[data-mbar]'), review = $('#review');
  const onScroll = () => {
    hd.classList.toggle('is-solid', scrollY > hero.offsetHeight - 90);
    const r = review.getBoundingClientRect();
    mbar.classList.toggle('is-on', scrollY > innerHeight * .7 && !(r.top < innerHeight * .7 && r.bottom > innerHeight * .3));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('[data-burger]'), drawer = $('[data-drawer]');
  burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); drawer.classList.toggle('is-open', o); });
  drawer.addEventListener('click', e => { if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); drawer.classList.remove('is-open'); } });

  // video (Vimeo loads only when asked)
  const vm = $('[data-vmodal]'), vf = $('[data-vframe]');
  const closeV = () => { vm.hidden = true; vf.innerHTML = ''; };
  $$('[data-video]').forEach(b => b.addEventListener('click', () => {
    vf.innerHTML = '<iframe src="https://player.vimeo.com/video/1231287031?autoplay=1&texttrack=en&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Welcome from Joseph Hull"></iframe>';
    vm.hidden = false; track('video_play');
  }));
  $('[data-vclose]').addEventListener('click', closeV);
  vm.addEventListener('click', e => { if (e.target === vm) closeV(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !vm.hidden) closeV(); });

  // intro panels: hover or tap to open, and they cycle by themselves
  const panels = $$('.panel'); let pi = 0, pHover = false;
  const openP = i => { pi = i; panels.forEach((p, k) => p.classList.toggle('is-on', k === i)); };
  panels.forEach((p, i) => { p.addEventListener('mouseenter', () => { pHover = true; openP(i); }); p.addEventListener('mouseleave', () => pHover = false); p.addEventListener('click', () => openP(i)); p.addEventListener('focus', () => openP(i)); });
  if (!reduce) setInterval(() => { if (!pHover && !small()) openP((pi + 1) % panels.length); }, 4200);

  /* life stages: a dial that plays by itself, like a clock */
  const life = $('[data-life]');
  if (life) {
    const NS = 'http://www.w3.org/2000/svg', C = 300, R = 236, cards = $$('.lc', life);
    const ages = cards.map(c => +c.dataset.age), A0 = 20, A1 = 85;
    const ang = a => (a - A0) / (A1 - A0) * 340 - 170;          // leave a small gap at the bottom
    const pt = (a, r) => [C + Math.sin(a * Math.PI / 180) * r, C - Math.cos(a * Math.PI / 180) * r];
    const el = (n, at) => { const e = document.createElementNS(NS, n); for (const k in at) e.setAttribute(k, at[k]); return e; };
    const ticks = $('[data-ticks]', life);
    for (let a = A0; a <= A1; a += 5) {
      const big = a % 10 === 0, [x1, y1] = pt(ang(a), big ? 258 : 264), [x2, y2] = pt(ang(a), 274);
      ticks.appendChild(el('line', { x1, y1, x2, y2, class: big ? 'tk tk--b' : 'tk' }));
      if (big) { const [lx, ly] = pt(ang(a), 292); const t = el('text', { x: lx, y: ly + 5, class: 'tk__l' }); t.textContent = a; ticks.appendChild(t); }
    }
    const prog = $('[data-prog]', life), LEN = 2 * Math.PI * R, ARC = LEN * 340 / 360;
    prog.style.strokeDasharray = `0 ${LEN}`;
    prog.style.transform = 'rotate(-260deg)';
    const nodesG = $('[data-nodes]', life);
    const nodes = cards.map((c, i) => {
      const [x, y] = pt(ang(ages[i]), R);
      const g = el('g', { class: 'nd', tabindex: '0', role: 'button', 'aria-label': 'Age ' + ages[i] + ', ' + c.dataset.stage });
      g.appendChild(el('circle', { cx: x, cy: y, r: 16, class: 'nd__h' })); g.appendChild(el('circle', { cx: x, cy: y, r: 6.5, class: 'nd__d' }));
      const go = () => { cur = ages[i]; target = i; hold = 0; setPlay(false); };
      g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      nodesG.appendChild(g); return g;
    });
    const ageEl = $('[data-age]', life), stageEl = $('[data-stage]', life), playB = $('[data-play]', life), playL = $('[data-play-l]', life);
    let cur = A0, target = 0, hold = 0, playing = !reduce, vis = false, shown = -1, last = performance.now();
    if (reduce) { cur = ages[0]; }
    function setPlay(p) { playing = p; life.classList.toggle('is-paused', !p); playL.textContent = p ? 'Pause' : 'Play'; playB.setAttribute('aria-label', p ? 'Pause' : 'Play'); }
    playB.addEventListener('click', () => setPlay(!playing)); setPlay(playing);
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: .25 }).observe(life);
    const draw = () => {
      const k = (cur - A0) / (A1 - A0);
      prog.style.strokeDasharray = `${ARC * k} ${LEN}`;
      let idx = 0; ages.forEach((a, i) => { const on = cur >= a - .2; nodes[i].classList.toggle('on', on); if (on) idx = i; });
      nodes.forEach((n, i) => n.classList.toggle('cur', i === idx));
      ageEl.textContent = Math.round(Math.max(ages[0], cur));
      if (idx !== shown) {
        shown = idx; stageEl.textContent = cards[idx].dataset.stage;
        cards.forEach((c, i) => { const d = idx - i; c.dataset.depth = d >= 0 && d <= 2 ? d : 'x'; c.setAttribute('aria-hidden', String(i !== idx)); });
        const at = d => cards.find(c => c.dataset.depth === String(d)), c0 = at(0), c1 = at(1), c2 = at(2);
        const y1 = c0 ? c0.offsetHeight + 12 : 0;
        if (c1) c1.style.setProperty('--y', y1 + 'px');
        if (c2) c2.style.setProperty('--y', (y1 + (c1 ? c1.offsetHeight * .97 : 0) + 8) + 'px');
      }
    };
    const tick = now => {
      requestAnimationFrame(tick);
      const dt = Math.min(.5, (now - last) / 1000); last = now;
      if (!vis || document.hidden) return;
      if (playing) {
        const goal = ages[target];
        if (cur < goal - .05) cur = Math.min(goal, cur + Math.max(8, (goal - (target ? ages[target - 1] : A0)) / .7) * dt);
        else { cur = goal; hold += dt; if (hold >= (target === ages.length - 1 ? 3.4 : 2.2)) { hold = 0; if (target === ages.length - 1) { cur = A0; target = 0; } else target++; } }
      }
      draw();
    };
    draw(); requestAnimationFrame(tick);
  }

  /* coverage: a 3D ring of cards that turns by itself and can be dragged */
  const stage = $('[data-ring-stage]'), ring = $('[data-ring]');
  if (stage && ring) {
    const items = $$('.rc', ring), N = items.length;
    let rot = 0, vel = 0, drag = false, lx = 0, hover = false, vis = false, last = performance.now();
    const layout = () => {
      if (small()) { ring.style.transform = ''; items.forEach(c => c.style.transform = ''); return; }
      const R = Math.round(ring.offsetWidth / 2 / Math.tan(Math.PI / N)) + 60;
      items.forEach((c, i) => c.style.transform = `rotateY(${i * 360 / N}deg) translateZ(${R}px)`);
      ring.dataset.r = R;
    };
    layout(); addEventListener('resize', layout);
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: .1 }).observe(stage);
    stage.addEventListener('mouseenter', () => hover = true); stage.addEventListener('mouseleave', () => hover = false);
    stage.addEventListener('pointerdown', e => { if (small()) return; drag = true; lx = e.clientX; vel = 0; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!drag) return; const d = e.clientX - lx; lx = e.clientX; rot += d * .25; vel = d * .25; });
    const end = () => drag = false; stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('click', e => { if (Math.abs(vel) > 1) e.preventDefault(); }, true);
    const spin = now => {
      requestAnimationFrame(spin);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!vis || small()) return;
      if (!drag) { rot += vel; vel *= .94; if (!hover && !reduce) rot -= 6 * dt; }
      ring.style.transform = `translateZ(-${ring.dataset.r || 400}px) rotateX(-8deg) rotateY(${rot}deg)`;
    };
    requestAnimationFrame(spin);
  }

  /* strategy: circular stepper that advances by itself */
  const strat = $('[data-strat]');
  if (strat) {
    const steps = [['Educate', 'Plain-English answers on how coverage really works.'], ['Identify priorities', 'Family, home, income, debt and the future you want.'], ['Review what you have', 'We read your current policies together, line by line.'], ['Calculate the need', 'DIME, retirement and debt calculators, not guesswork.'], ['Compare options', 'Real quotes from multiple carriers, side by side.']];
    const orbit = $('[data-orbit]', strat), imgs = $$('[data-simg]', strat), dots = $$('[data-sdot]', strat), txt = $('[data-stxt]', strat), num = $('[data-snum]', strat), bar = $('[data-sbar]', strat), op = $('[data-oprog]', strat);
    const OL = 2 * Math.PI * 232; op.style.strokeDasharray = OL;
    const setR = () => orbit.style.setProperty('--r', orbit.offsetWidth * .464 + 'px'); setR(); addEventListener('resize', setR);
    let si = 0, timer, vis = false;
    const show = i => {
      si = (i + steps.length) % steps.length;
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === si)); dots.forEach((d, k) => d.classList.toggle('is-on', k <= si));
      txt.innerHTML = `<h3>${steps[si][0]}</h3><p>${steps[si][1]}</p>`;
      num.textContent = String(si + 1).padStart(2, '0'); op.style.strokeDashoffset = OL * (1 - (si + 1) / steps.length);
      bar.style.transition = 'none'; bar.style.width = '0';
      requestAnimationFrame(() => { bar.style.transition = 'width 4.5s linear'; bar.style.width = '100%'; });
      clearTimeout(timer); if (!reduce) timer = setTimeout(() => { if (vis) show(si + 1); else show(si); }, 4500);
    };
    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
    $('[data-sprev]', strat).addEventListener('click', () => show(si - 1));
    $('[data-snext]', strat).addEventListener('click', () => show(si + 1));
    new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: .3 }).observe(strat);
    show(0);
  }

  /* DIME calculator */
  const calc = $('[data-calc]');
  const num = s => +String(s).replace(/[^\d.]/g, '') || 0, money = n => '$' + Math.round(n).toLocaleString('en-US');
  const out = $('[data-calc-out]'), parts = $('[data-calc-parts]'), yOut = $('[data-years-out]'), donut = $('[data-donut]'), pct = $('[data-pct]');
  const DL = 2 * Math.PI * 50; donut.style.strokeDasharray = DL;
  let shownV = 0, raf;
  function compute() {
    const v = {}; $$('[data-k]', calc).forEach(i => v[i.dataset.k] = num(i.value));
    yOut.textContent = v.years;
    const inc = v.income * v.years, total = v.debt + inc + v.mortgage + v.edu, gap = Math.max(0, total - v.have), p = total ? gap / total : 0;
    parts.innerHTML = [['Debt', v.debt], ['Income', inc], ['Mortgage', v.mortgage], ['Education', v.edu]].map(([k, n]) => `<li>${k}<b>${money(n)}</b></li>`).join('');
    donut.style.strokeDashoffset = DL * (1 - p); pct.textContent = Math.round(p * 100) + '%';
    cancelAnimationFrame(raf); const from = shownV, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3); shownV = from + (gap - from) * e; out.textContent = money(Math.round(shownV / 1000) * 1000); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  }
  $$('[data-k]', calc).forEach(i => { i.addEventListener('input', compute); if (i.type !== 'range') i.addEventListener('blur', () => i.value = num(i.value).toLocaleString('en-US')); });
  compute();
  calc.addEventListener('submit', e => {
    e.preventDefault(); const em = $('[data-cap-email]'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim());
    em.classList.toggle('is-bad', !ok); if (!ok) { em.focus(); return; }
    $('[data-calc-cap]').hidden = true; $('[data-calc-ok]').hidden = false; track('calculator_lead', { estimate: out.textContent });
  });

  /* review form + booking */
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
    const n = document.createElement('p'); n.className = 'fine'; n.dataset.booked = ''; n.style.cssText = 'margin:0;color:var(--navy);font-weight:500'; n.textContent = 'Selected: ' + booked + ' CT. Add your details to confirm.'; form.prepend(n);
  });

  /* assistant: quick answers in plain English */
  const askBtn = $('[data-ask-btn]'), askP = $('[data-ask-panel]'), log = $('[data-ask-log]');
  const A = {
    'Term or whole life?': 'Term covers a set number of years (like 20 or 30) and costs the least. Whole life lasts your whole life and builds cash value, so it costs more. Many families mix both. Joseph will show you real quotes for each.',
    'How much do I need?': 'A good start is the DIME method: Debt + Income × years + Mortgage + Education, minus what you already have. <a href="#calculator">Try the calculator</a>.',
    'Is the review really free?': 'Yes. The protection review is free and there is no obligation. If you do not need more coverage, Joseph will tell you.',
    'Book a call': 'Great! Pick a 15-minute time that suits you: <a href="#book">open the calendar</a>, or call <a href="tel:+17087057783">(708) 705-7783</a>.'
  };
  askBtn.addEventListener('click', () => { askP.hidden = !askP.hidden; if (!askP.hidden) track('assistant_open'); });
  const ao = $('[data-ask-open]'); if (ao) ao.addEventListener('click', () => { askP.hidden = !askP.hidden; track('assistant_open'); });
  $('[data-ask-x]').addEventListener('click', () => askP.hidden = true);
  $('[data-ask-q]').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    log.insertAdjacentHTML('beforeend', `<p class="msg msg--u">${b.textContent}</p>`);
    setTimeout(() => { log.insertAdjacentHTML('beforeend', `<p class="msg msg--b">${A[b.textContent]}</p>`); log.scrollTop = log.scrollHeight; }, 450);
    log.scrollTop = log.scrollHeight; track('assistant_question', { q: b.textContent });
  });
  log.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a) askP.hidden = true; });
})();
