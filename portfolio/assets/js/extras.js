/* Helmwork · version B extras: spotlight cards, device tabs, timeline fill, project cursor chip */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* spotlight: a soft light follows the cursor across glass cards */
  if (fine) $$('[data-spot]').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* PC-Spain preview: Desktop / Mobile / Chat assistant */
  const tabs = $$('[data-dev]'), focus = $('[data-focus]'), pill = $('.devtabs__pill'), stage = $('[data-stage]');
  const place = b => { if (!pill || !b) return; pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft}px)`; };
  tabs.forEach(b => b.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-selected', String(t === b))); place(b);
    const v = b.dataset.dev; stage.dataset.view = v;
    if (focus) { focus.setAttribute('aria-hidden', String(v === 'desk')); $$('[data-focus-view]', focus).forEach(f => f.classList.toggle('on', f.dataset.focusView === v)); }
  }));
  requestAnimationFrame(() => place(tabs.find(t => t.getAttribute('aria-selected') === 'true')));
  addEventListener('resize', () => place(tabs.find(t => t.getAttribute('aria-selected') === 'true')));

  /* How I work: the line fills with light as you scroll, steps light up as it reaches them */
  const steps = $('[data-steps]'), fill = $('[data-steps-fill]');
  if (steps && fill) {
    const items = $$('.step', steps), track = fill.parentElement;
    const tick = () => {
      const r = steps.getBoundingClientRect(), vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * .78 - r.top) / (r.height + vh * .2)));
      const p2 = reduce ? 1 : p;
      fill.style.transform = `scaleX(${p2})`;
      items.forEach((it, i) => it.classList.toggle('lit', p2 >= (i + .15) / items.length));
      track.classList.toggle('done', p2 >= .99);
    };
    addEventListener('scroll', tick, { passive: true }); addEventListener('resize', tick); tick();
    (function loop() { tick(); requestAnimationFrame(loop); })();
  }

  /* Live projects: a small chip follows the cursor over the list */
  const list = $('[data-plist]'), chip = $('[data-pchip]'), cat = $('[data-pchip-cat]');
  if (list && chip && fine && !reduce) {
    let x = 0, y = 0, cx = 0, cy = 0, on = false;
    list.addEventListener('pointermove', e => {
      const host = list.parentElement.getBoundingClientRect(); x = e.clientX - host.left; y = e.clientY - host.top;
      const a = e.target.closest('a'); if (a) cat.textContent = a.querySelector('.mono').textContent;
    });
    list.addEventListener('pointerenter', () => { on = true; chip.classList.add('on'); });
    list.addEventListener('pointerleave', () => { on = false; chip.classList.remove('on'); });
    (function loop() { cx += (x - cx) * .18; cy += (y - cy) * .18; chip.style.transform = `translate(${cx + 18}px, ${cy - 18}px)`; requestAnimationFrame(loop); })();
  }

  /* magnetic pull on the main buttons */
  if (fine && !reduce) $$('.btn--lg, .hd__book, .fab-book').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
})();
