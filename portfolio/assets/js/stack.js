/* Helmwork · case studies stacked like a pile: each panel sticks, the next slides over it
   and the one underneath eases back. */
(() => {
  const cards = [...document.querySelectorAll('[data-qc]')];
  if (!cards.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tick = () => {
    requestAnimationFrame(tick);
    cards.forEach((c, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const a = c.getBoundingClientRect(), b = next.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, 1 - (b.top - a.top) / Math.max(1, a.height)));   // how far the next one covers this
      c.style.transform = `scale(${1 - k * .06})`;
      c.style.filter = `brightness(${1 - k * .28})`;
    });
  };
  requestAnimationFrame(tick);
})();
