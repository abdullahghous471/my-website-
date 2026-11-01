/* Header state over the film, active-section underline, and tap-to-colour carriers */
(() => {
  const $ = s => document.querySelector(s);

  // header: fully transparent over the hero film, a soft glass bar once past it
  const hd = $('[data-hd]'), hero = $('#top');
  const onScroll = () => {
    const past = hero ? scrollY > hero.offsetHeight - 120 : scrollY > 40;
    if (hd) hd.classList.toggle('is-scrolled', past);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // nav: underline the link for the section you are reading
  const links = [...document.querySelectorAll('[data-nav] a')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href')));
  const spy = () => {
    let hit = null;
    secs.forEach((s, i) => { if (!s) return; const r = s.getBoundingClientRect(); if (r.top < innerHeight * .4 && r.bottom > innerHeight * .4) hit = links[i]; });
    links.forEach(l => l.classList.toggle('on', l === hit));
  };
  addEventListener('scroll', spy, { passive: true }); spy();

  // carriers: hover shows colour; on touch screens a tap does the same
  const cars = $('[data-cars]');
  if (cars) cars.addEventListener('click', e => {
    const c = e.target.closest('.car'); if (!c) return;
    const was = c.classList.contains('on');
    cars.querySelectorAll('.car.on').forEach(x => x.classList.remove('on'));
    if (!was) c.classList.add('on');
  });
})();
