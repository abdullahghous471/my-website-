/* Helmwork · free audit card (ticks through the areas it covers when it scrolls in),
   FAQ (one answer open at a time) and the privacy window. */
(() => {
  const card = document.querySelector('[data-offer]');
  if (card) new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { card.classList.add('in'); io.disconnect(); } }), { threshold: .35 }).observe(card);

  const items = [...document.querySelectorAll('.faq__it')];
  items.forEach(d => d.addEventListener('toggle', () => { if (d.open) items.forEach(o => { if (o !== d) o.open = false; }); }));

  const pv = document.querySelector('[data-privacy]');
  if (!pv) return;
  let last = null;
  const open = () => { last = document.activeElement; pv.hidden = false; document.documentElement.classList.add('pv-open'); pv.querySelector('[data-privacy-close]').focus(); };
  const close = () => { pv.hidden = true; document.documentElement.classList.remove('pv-open'); last && last.focus && last.focus(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-privacy-open]')) { e.preventDefault(); open(); }
    else if (e.target.closest('[data-privacy-close]') || e.target === pv) close();
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !pv.hidden) { e.stopImmediatePropagation(); close(); } }, true);
})();
/* About: credential badges rise in when the list scrolls into view */
(() => {
  const el = document.querySelector('[data-creds]');
  if (!el) return;
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }), { threshold: .3 }).observe(el);
})();
