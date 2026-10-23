/* Helmwork · "Book a meeting" window.
   Fill in ONE of these to make bookings arrive automatically:
   - CALENDLY: a scheduling link (Calendly, Cal.com, Google appointment page). The window then shows that calendar.
   - EMAIL: an address; requests are sent there through FormSubmit (first request triggers a one-time activation e-mail).
   With neither set, the visitor picks a time and sends the request on Upwork. */
window.HELMWORK_BOOKING = window.HELMWORK_BOOKING || { CALENDLY: '', EMAIL: 'helmwork.tech@gmail.com' };

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const CFG = window.HELMWORK_BOOKING, UPWORK = 'https://www.upwork.com/freelancers/~013c19993b7b8137ff?mp_source=share';
  const dlg = $('[data-book]'), body = $('[data-book-body]'), steps = $$('.book__steps li', dlg);
  if (!dlg) return;
  const TYPES = [
    { id: 'audit', name: 'Free operations audit', len: 30, text: 'Three quick wins for your inbox, support or delivery. No obligation.', free: true },
    { id: 'intro', name: 'Intro call', len: 15, text: 'Meet Abdullah and see if it is a fit.' },
    { id: 'project', name: 'Project discussion', len: 30, text: 'Talk through scope, timeline and how he would run it.' }
  ];
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time zone';
  const state = { type: null, day: null, time: null };
  let lastFocus = null;

  const setStep = n => steps.forEach((s, i) => s.classList.toggle('on', i <= n));
  const days = () => { const out = [], d = new Date(); d.setHours(0, 0, 0, 0); while (out.length < 10) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) out.push(new Date(d)); } return out; };
  const fmtDay = d => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const TIMES = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

  const viewType = () => {
    setStep(0);
    body.innerHTML = `<p class="book__lead">What would you like to talk about?</p>
      <div class="book__types">${TYPES.map(t => `<button type="button" class="book__type${t.free ? ' book__type--free' : ''}" data-type="${t.id}"><b>${t.name}${t.free ? ' <i>Free</i>' : ''}</b><span class="mono">${t.len} min</span><em>${t.text}</em></button>`).join('')}</div>`;
    $$('[data-type]', body).forEach(b => b.addEventListener('click', () => { state.type = TYPES.find(t => t.id === b.dataset.type); viewTime(); }));
    $('[data-type]', body).focus();
  };

  const viewTime = () => {
    setStep(1);
    const ds = days();
    body.innerHTML = `<p class="book__lead">${state.type.name} · ${state.type.len} min. Pick a day and a time that suits you.</p>
      <div class="book__days" role="listbox" aria-label="Day">${ds.map((d, i) => `<button type="button" class="book__day" data-day="${i}">${fmtDay(d)}</button>`).join('')}</div>
      <div class="book__times" role="listbox" aria-label="Time">${TIMES.map(t => `<button type="button" class="book__time" data-time="${t}">${t}</button>`).join('')}</div>
      <p class="book__tz mono">Times shown in your time zone (${tz}). Abdullah confirms the final slot.</p>
      <div class="book__nav"><button type="button" class="btn btn--glass" data-back>Back</button><button type="button" class="btn btn--light" data-next disabled>Continue</button></div>`;
    const next = $('[data-next]', body);
    const check = () => { next.disabled = !(state.day && state.time); };
    $$('[data-day]', body).forEach(b => b.addEventListener('click', () => { $$('[data-day]', body).forEach(x => x.classList.toggle('on', x === b)); state.day = ds[+b.dataset.day]; check(); }));
    $$('[data-time]', body).forEach(b => b.addEventListener('click', () => { $$('[data-time]', body).forEach(x => x.classList.toggle('on', x === b)); state.time = b.dataset.time; check(); }));
    $('[data-back]', body).addEventListener('click', viewType); next.addEventListener('click', viewDetails);
    $('[data-day]', body).focus();
  };

  const summary = () => `${state.type.name} (${state.type.len} min) · ${fmtDay(state.day)} at ${state.time} (${tz})`;

  const viewDetails = () => {
    setStep(2);
    body.innerHTML = `<p class="book__lead">${summary()}</p>
      <form class="book__form" data-form novalidate>
        <label>Your name<input name="name" id="bk-name" required autocomplete="name"></label>
        <label>Email<input name="email" id="bk-email" type="email" required autocomplete="email"></label>
        <label class="wide">What do you need help with?<textarea name="message" id="bk-msg" rows="3" placeholder="A few words about your project, inbox or support setup"></textarea></label>
        <p class="book__privacy wide">Your details are only used to reply to this request. They’re sent to Abdullah by email (via FormSubmit), never shared or added to a mailing list, and deleted on request. <button type="button" data-privacy-open>Privacy</button></p>
        <p class="book__err" data-err hidden>Please add your name and a valid email address.</p>
        <div class="book__nav wide"><button type="button" class="btn btn--glass" data-back>Back</button><button type="submit" class="btn btn--light">Request this time</button></div>
      </form>`;
    $('[data-back]', body).addEventListener('click', viewTime);
    const form = $('[data-form]', body);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const f = new FormData(form), name = (f.get('name') || '').trim(), email = (f.get('email') || '').trim();
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) { $('[data-err]', body).hidden = false; return; }
      const msg = (f.get('message') || '').trim();
      if (CFG.EMAIL) {
        const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
        try {
          const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CFG.EMAIL), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _subject: 'Meeting request: ' + state.type.name, _template: 'table', name, email, meeting: summary(), message: msg || '—' }) });
          if (!r.ok) throw 0; viewDone(true, name);
        } catch (err) { btn.disabled = false; btn.textContent = 'Request this time'; $('[data-err]', body).textContent = 'Sending failed. Please try again, or message Abdullah on Upwork.'; $('[data-err]', body).hidden = false; }
      } else viewDone(false, name, msg, email);
    });
    $('#bk-name', body).focus();
  };

  const viewDone = (sent, name, msg = '', email = '') => {
    steps.forEach(s => s.classList.add('on'));
    const text = `Hi Abdullah, I'd like to book a ${summary()}. ${msg ? 'About: ' + msg + ' ' : ''}— ${name}${email ? ' (' + email + ')' : ''}`;
    body.innerHTML = sent
      ? `<div class="book__done"><span class="book__check" aria-hidden="true">✓</span><h3>Request sent</h3><p>Thanks, ${name}. Abdullah will confirm <b>${summary()}</b> by email.</p><button type="button" class="btn btn--light" data-book-close>Done</button></div>`
      : `<div class="book__done"><span class="book__check" aria-hidden="true">✓</span><h3>Almost there</h3><p>Send this request to Abdullah on Upwork and he will confirm the time:</p>
          <p class="book__msg" data-msg>${text}</p>
          <div class="book__nav"><button type="button" class="btn btn--glass" data-copy>Copy message</button><a class="btn btn--light" href="${UPWORK}" target="_blank" rel="noopener">Open Upwork ↗</a></div></div>`;
    const copy = $('[data-copy]', body);
    if (copy) copy.addEventListener('click', () => {
      const done = () => { copy.textContent = 'Copied'; };
      navigator.clipboard ? navigator.clipboard.writeText(text).then(done, () => { getSelection().selectAllChildren($('[data-msg]', body)); }) : getSelection().selectAllChildren($('[data-msg]', body));
    });
    $$('[data-book-close]', body).forEach(b => b.addEventListener('click', close));
  };

  const viewCalendly = () => {
    steps.forEach(s => s.parentElement.hidden = true);
    body.innerHTML = `<iframe class="book__frame" src="${CFG.CALENDLY}" title="Book a meeting with Abdullah" loading="lazy"></iframe>`;
  };

  const open = type => {
    lastFocus = document.activeElement; dlg.hidden = false; document.documentElement.classList.add('book-open');
    state.type = state.day = state.time = null;
    const pre = TYPES.find(t => t.id === type);
    if (CFG.CALENDLY) viewCalendly(); else if (pre) { state.type = pre; viewTime(); } else viewType();
    window.lenis && window.lenis.stop && window.lenis.stop();
  };
  function close() { dlg.hidden = true; document.documentElement.classList.remove('book-open'); lastFocus && lastFocus.focus && lastFocus.focus(); }
  window.HelmworkBook = { open, close };
  document.addEventListener('click', e => { const b = e.target.closest('[data-book-open]'); if (b) { e.preventDefault(); open(b.dataset.bookType); } });
  $$('[data-book-close]', dlg).forEach(b => b.addEventListener('click', close));
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !dlg.hidden) close(); });
})();
