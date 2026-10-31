/* Black Apple: review form with consent, Joseph's video, mobile call bar */
(() => {
  const $ = s => document.querySelector(s);
  const f = $('[data-rv]'), msg = $('[data-rv-msg]');
  if (f) f.addEventListener('submit', e => {
    e.preventDefault(); let bad = false;
    f.querySelectorAll('[required]').forEach(i => {
      const ok = i.type === 'checkbox' ? i.checked : i.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()) : i.value.trim().length > 1;
      (i.type === 'checkbox' ? i.closest('label') : i).classList.toggle('bad', !ok); if (!ok) bad = true;
    });
    msg.hidden = false;
    msg.textContent = bad ? 'Please fill in every field and tick the consent box.' : 'Thank you. Joseph will personally reach out within one business day.';
    if (!bad) { f.querySelectorAll('input,select,button').forEach(i => i.disabled = true); (window.dataLayer = window.dataLayer || []).push({ event: 'lead_submit' }); }
  });
  const vm = $('[data-vm]'), vf = $('[data-vm-f]');
  const close = () => { vm.hidden = true; vf.innerHTML = ''; };
  document.querySelectorAll('[data-video]').forEach(b => b.addEventListener('click', () => {
    vf.innerHTML = '<iframe src="https://player.vimeo.com/video/1231287031?autoplay=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen" allowfullscreen title="Welcome from Joseph Hull"></iframe>'; vm.hidden = false;
  }));
  $('[data-vm-x]').addEventListener('click', close); vm.addEventListener('click', e => { if (e.target === vm) close(); });
  const bar = $('[data-mbar]'), rv = $('#review');
  const on = () => { const r = rv.getBoundingClientRect(); bar.classList.toggle('on', scrollY > innerHeight * .7 && !(r.top < innerHeight * .8 && r.bottom > 0)); };
  addEventListener('scroll', on, { passive: true }); on();
})();
/* background films play only while on screen */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && !reduce) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); }), { threshold: .2 });
  document.querySelectorAll('video[data-play], .hero video.film').forEach(v => io.observe(v));
})();
