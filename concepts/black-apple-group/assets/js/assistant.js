/* Black Apple Group · "Ava", the site assistant.
   Answers only from this page's own content (coverage types, the Black Apple Strategy, FAQs, Joseph's background)
   and hands anything personal to Joseph. It gives education, never quotes, prices or advice for a specific person.
   Runs entirely in the browser: no questions are sent or stored. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TEL = 'tel:+17087057783', PHONE = '(708) 705-7783', MAIL = 'joseph@blackapplegroup.com';

  /* ---------------- avatar: a small orb of light in gold, coral and teal ---------------- */
  const orbs = []; let speaking = 0;
  const addOrb = cv => { const dpr = Math.min(devicePixelRatio, 2), s = +cv.getAttribute('width'); cv.width = s * dpr; cv.height = s * dpr; cv.style.width = s + 'px'; cv.style.height = s + 'px'; orbs.push({ cv, ctx: cv.getContext('2d'), s, dpr }); };
  const drawOrb = (o, t) => {
    const { ctx, s, dpr } = o, c = s / 2, R = s * .33, sp = speaking;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, s, s);
    const core = ctx.createRadialGradient(c, c * .92, 0, c, c, R * 1.25);
    core.addColorStop(0, 'rgba(52,36,28,.95)'); core.addColorStop(.75, 'rgba(24,18,15,.95)'); core.addColorStop(1, 'rgba(18,15,13,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(c, c, R * 1.18, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, c - R, 0, c + R);
    g.addColorStop(0, '#FFC46B'); g.addColorStop(.5, '#FF7E67'); g.addColorStop(1, '#2EC4B6');
    ctx.strokeStyle = g; ctx.lineWidth = Math.max(.6, s / 90);
    const n = s > 50 ? 13 : 9;
    for (let k = 0; k < n; k++) {
      const f = k / (n - 1); ctx.globalAlpha = .26 + .5 * Math.exp(-Math.pow((f - .5) * 3, 2));
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const a = i / 72 * Math.PI * 2;
        const w = (.05 + sp * .06) * Math.sin(a * 3 + t * (1 + sp) + k * .4) + .03 * Math.sin(a * 7 - t * 1.5 + k * .9);
        const r = R * (1 + (f - .5) * .22 + w);
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // a small apple leaf of light at the centre
    ctx.fillStyle = '#FFF4E6'; ctx.shadowColor = '#FFC46B'; ctx.shadowBlur = s / 8;
    ctx.beginPath(); ctx.ellipse(c, c, R * .2 * (1 + sp * .15), R * .2 * (1 + sp * .15), 0, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
  };
  let t0 = performance.now(), live = false;
  // light on the processor: ~20 fps while the chat is closed, smooth only while it is open or Ava is speaking
  let lastDraw = 0;
  const loop = now => {
    if (!live) return; requestAnimationFrame(loop);
    if (document.hidden) return;
    const open = !document.querySelector('[data-ai]')?.hidden;
    if (now - lastDraw < (open || speaking ? 16 : 50)) return; lastDraw = now;
    const t = reduce ? 1 : (now - t0) / 1000; orbs.forEach(o => { if (o.cv.offsetParent !== null) drawOrb(o, t); });
  };
  $$('[data-orb]').forEach(addOrb);
  // start the orb only once the page is idle, so it never slows the first paint
  const wake = () => { if (!live) { live = true; requestAnimationFrame(loop); } };
  if ('requestIdleCallback' in window) requestIdleCallback(wake, { timeout: 2500 }); else setTimeout(wake, 1500);

  /* ---------------- knowledge (from this page) ---------------- */
  const COVER = [
    ['Term life', 'term', 'The most cover for the least cost, for a set number of years (10, 20 or 30). Often a fit for young families and anyone with children or a mortgage.'],
    ['Whole life', 'whole', 'Lifelong protection with guaranteed cash value that grows over time. Often chosen by people who want lifelong cover and value to pass on.'],
    ['Universal & IUL', 'universal|iul|indexed', 'Flexible premiums with cash value linked to market growth. Often considered by earners who want growth potential alongside protection.'],
    ['Mortgage protection', 'mortgage|house|home', 'If income stops, the mortgage does not. It helps keep the home in the family, and is popular with new homeowners.'],
    ['Living benefits', 'living benefit|critical|illness|cancer|stroke|heart attack', 'Lets you use part of your benefit while you are alive, after a qualifying serious illness.'],
    ['Disability income', 'disab|injur|paycheck|cant work|cannot work', 'Replaces part of a paycheck you cannot earn for a while because of illness or injury.'],
    ['Final expense', 'final expense|funeral|burial|senior|elderly|parents', 'Covers final costs, so your family inherits memories, not bills. Often chosen by older adults.'],
    ['Retirement planning', 'retire|annuit|pension|income later', 'Annuities can turn savings into dependable income for the years after work. Often a fit for savers 50+.'],
    ['Debt elimination', 'debt|snowball|credit card|loan', 'A step-by-step plan that clears balances and frees up cash for what matters.']
  ];
  const STEPS = ['<b>Educate:</b> plain-English answers on how coverage really works', '<b>Identify priorities:</b> family, home, income, debt and the future you want', '<b>Review what you have:</b> your current policies, read together line by line', '<b>Calculate the need:</b> DIME, retirement and debt calculators, not guesswork', '<b>Compare options:</b> real quotes from many carriers, side by side'];
  const CHIPS = ['What cover do I need?', 'Term vs whole life', 'Is the review free?', 'Who is Joseph?', 'Review my policy', 'Talk to Joseph'];

  const go = (sel, label) => ({ action: `<button type="button" class="ai-act" data-go="${sel}">${label}</button>` });
  const review = { action: '<button type="button" class="ai-act ai-act--hot" data-go="#review">Book a free review</button>' };
  const call = { action: `<a class="ai-act" href="${TEL}">Call ${PHONE}</a>` };
  const note = { small: 'General education only, not advice for your situation. Joseph will look at your details in a free review.' };

  const INTENTS = [
    { id: 'hi', w: .6, k: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'salam'], a: () => [{ text: 'Hello! 👋 I can explain the types of cover, how a review works, or help you reach Joseph. What would you like to know?' }] },
    { id: 'need', w: 1.2, k: ['how much cover', 'how much coverage', 'how much insurance', 'how much life', 'need', 'enough', 'dime', 'amount', 'calculate', 'right for me', 'which one', 'best policy', 'recommend'], a: () => [{ text: 'A good starting point is the <b>DIME</b> method:' }, { list: ['<b>D</b>ebt you would leave behind', '<b>I</b>ncome for the years your family depends on you', '<b>M</b>ortgage balance', '<b>E</b>ducation for your children', 'then subtract the cover you already have'] }, { text: 'Joseph works out the real number with you in the free review.' }, note, review] },
    { id: 'tvw', w: 1.4, k: ['term or whole', 'term vs', 'whole vs', 'versus', 'difference', 'compare term', 'term and whole'], a: () => [{ text: '<b>Term</b> covers a set number of years and costs the least. <b>Whole life</b> lasts your whole life and builds cash value, so it costs more. Many families mix both.' }, { text: 'Joseph shows you real quotes for each before you decide.' }, note, review] },
    { id: 'free', w: 1.3, k: ['free', 'cost of review', 'obligation', 'charge for', 'pay for the review'], a: () => [{ text: 'Yes, the protection review is free and there is no obligation. If you do not need more coverage, Joseph will tell you.' }, review] },
    { id: 'price', w: 1.1, k: ['price', 'premium', 'cost', 'quote', 'cheap', 'expensive', 'per month', 'monthly', 'rates', 'how much is', 'how much does', 'afford'], a: () => [{ text: 'Prices depend on your age, health, the amount and the type of cover, so I can’t give a number here. Joseph compares real quotes from many carriers for you, side by side, at no cost.' }, review, call] },
    { id: 'policy', w: 1.2, k: ['already have', 'existing', 'my policy', 'current policy', 'review my', 'old policy', 'through work', 'employer'], a: () => [{ text: 'Yes. Bring any policy you own, including cover through work. Joseph reads it with you, explains what it really covers and shows you if anything is missing or overpriced.' }, review] },
    { id: 'indep', w: 1.1, k: ['independent', 'captive', 'carrier', 'companies', 'which compan', 'insurers', 'agent'], a: () => [{ text: 'A captive agent can only sell one company’s policies. Black Apple is independent and compares 100+ carriers, including AIG, Lincoln Financial, Mutual of Omaha, North American, Prudential, Transamerica and Foresters, so the recommendation follows your needs, not a quota.' }] },
    { id: 'states', w: 1.2, k: ['state', 'illinois', 'chicago', 'where', 'licensed', 'license', 'location', 'near me', 'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'south carolina', 'south dakota', 'rhode island', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'wisconsin', 'wyoming'], a: () => [{ text: 'Joseph is based in Chicago and licensed in Illinois (No. 1356850) and in multiple other states. Carrier and product availability varies by state and eligibility.' }, call] },
    { id: 'joseph', k: ['joseph', 'who are you', 'who is', 'about', 'experience', 'founder', 'background', 'years'], a: () => [{ text: 'Joseph Hull founded Black Apple Group and has been licensed since 1991, over 35 years. He is one agent from your first question to the claim, and his rule is education first: understand your protection, then choose it.' }, go('#about', 'Meet Joseph'), { action: '<button type="button" class="ai-act" data-ai-video>Watch his welcome</button>' }] },
    { id: 'strategy', k: ['process', 'how does it work', 'how do you work', 'steps', 'strategy', 'what happens', 'review work'], a: () => [{ text: 'The Black Apple Strategy, knowledge before recommendations:' }, { list: STEPS }, review] },
    { id: 'types', k: ['types', 'options', 'what cover', 'what do you offer', 'products', 'services', 'kinds', 'coverage'], a: () => [{ text: 'Joseph helps with nine kinds of protection:' }, { list: COVER.map(c => `<b>${c[0]}</b>`) }, { text: 'Ask me about any of them.' }, go('#coverage', 'See all nine')] },
    { id: 'contact', w: 1.1, k: ['contact', 'call', 'phone', 'email', 'talk', 'speak', 'reach', 'human', 'person', 'appointment', 'book', 'meeting'], a: () => [{ text: `Joseph answers personally, Monday to Friday, 9 to 6 Central. Call <b>${PHONE}</b>, email <b>${MAIL}</b>, or request a free review and he will call you.` }, review, call] },
    { id: 'claim', w: 1.2, k: ['claim', 'passed away', 'died', 'death', 'beneficiary', 'payout'], a: () => [{ text: 'Joseph stays with families through the claim. If you need help with a claim, please call him directly and he will walk you through it.' }, call] },
    { id: 'health', w: 1.2, k: ['health', 'diabet', 'smoker', 'smoke', 'medical', 'exam', 'pre-existing', 'condition', 'age'], a: () => [{ text: 'Health and age affect which carriers and prices are available, and some policies need no medical exam. Because Joseph compares many carriers, he can often find options for people with health conditions.' }, note, review] },
    { id: 'privacy', w: 1.3, k: ['privacy', 'data', 'sell my', 'spam', 'store'], a: () => [{ text: 'Your details are only used to contact you about your review and are never sold. I run in your browser and don’t store what you type.' }] },
    { id: 'bot', k: ['are you ai', 'bot', 'robot', 'real person', 'chatgpt'], a: () => [{ text: 'I’m Ava, Black Apple’s assistant. I answer from this website, so I keep to general information. For anything about your situation, Joseph will help you himself.' }, review] },
    { id: 'thanks', k: ['thank', 'thanks', 'great', 'perfect', 'helpful'], a: () => [{ text: 'You’re welcome! Anything else I can explain?' }] }
  ];
  COVER.forEach(([name, keys, text], i) => INTENTS.push({ id: 'cv' + i, w: 1.25, k: keys.split('|'), a: () => [{ text: `<b>${name}:</b> ${text}` }, note, review] }));

  const norm = s => ' ' + s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const match = q => {
    const n = norm(q); let best = null, score = 0;
    INTENTS.forEach(it => {
      let sc = 0;
      it.k.forEach(k => {
        const hit = k.length <= 4 ? new RegExp('\\b' + k + '(s|es)?\\b').test(n) : k.includes(' ') ? n.includes(k) : new RegExp('\\b' + k).test(n);
        if (hit) sc += k.length > 6 ? 2 : 1.4;
      });
      sc *= it.w || 1; if (sc > score) { score = sc; best = it; }
    });
    return score > 0 ? best : null;
  };

  /* ---------------- chat window ---------------- */
  const panel = $('[data-ai]'), log = $('[data-ai-log]'), chipsEl = $('[data-ai-chips]'), form = $('[data-ai-form]'), input = $('[data-ai-in]');
  const launch = $('.ai-launch'), hello = $('[data-ai-hello]');
  if (!panel) return;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const add = (who, html) => { const row = document.createElement('div'); row.className = 'ai-msg ai-msg--' + who; row.innerHTML = html; log.appendChild(row); log.scrollTop = log.scrollHeight; return row; };
  const setChips = list => { chipsEl.innerHTML = (list || CHIPS).map(c => `<button type="button" class="ai-chip">${esc(c)}</button>`).join(''); };
  const render = p => p.text ? `<p>${p.text}</p>` : p.list ? `<ul>${p.list.map(i => `<li>${i}</li>`).join('')}</ul>` : p.small ? `<p class="ai-note">${p.small}</p>` : p.action || '';

  let busy = false;
  const reply = async parts => {
    busy = true; const typing = add('bot', '<span class="ai-typing"><i></i><i></i><i></i></span>'); speaking = 1;
    await new Promise(r => setTimeout(r, reduce ? 50 : 480 + Math.random() * 360));
    typing.remove();
    const acts = parts.filter(p => p.action), rest = parts.filter(p => !p.action);
    for (const p of rest) { add('bot', render(p)); if (!reduce) await new Promise(r => setTimeout(r, 200)); }
    if (acts.length) add('bot ai-msg--acts', acts.map(render).join(''));
    setChips(); busy = false; setTimeout(() => { speaking = 0; }, 600);
  };
  const MAP = { 'what cover do i need?': 'need', 'term vs whole life': 'tvw', 'is the review free?': 'free', 'who is joseph?': 'joseph', 'review my policy': 'policy', 'talk to joseph': 'contact' };
  const ask = async q => {
    if (!q.trim()) return;
    while (busy) await new Promise(r => setTimeout(r, 120));
    add('me', `<p>${esc(q)}</p>`);
    const it = INTENTS.find(i => i.id === MAP[q.toLowerCase()]) || match(q);
    reply(it ? it.a() : [{ text: 'I’m not sure about that one. I can explain the types of cover, how the free review works, or put you in touch with Joseph, who can answer anything about your situation.' }, review, call]);
  };
  const welcome = () => { log.innerHTML = ''; reply([{ text: 'Hi, I’m Ava 👋 Black Apple’s assistant.' }, { text: 'Ask me how life insurance works, which kinds of cover exist, or how Joseph’s free review works.' }]); };

  let started = false;
  const open = () => { wake(); panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('ai-on'); hello.classList.remove('on'); if (!started) { started = true; welcome(); } setTimeout(() => input.focus(), 50); };
  const close = () => { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('ai-on'); launch.focus(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-ai-open]')) { e.preventDefault(); panel.hidden ? open() : close(); }
    const chip = e.target.closest('.ai-chip'); if (chip) ask(chip.textContent);
    if (e.target.closest('[data-ai-video]')) { const v = $('.jcard__play'); v && v.click(); }
    const g = e.target.closest('[data-go]'); if (g) { const el = $(g.dataset.go); if (el) { if (innerWidth < 760) close(); el.scrollIntoView({ behavior: 'smooth' }); } }
  });
  $('[data-ai-close]').addEventListener('click', close);
  $('[data-ai-reset]').addEventListener('click', () => { welcome(); input.focus(); });
  form.addEventListener('submit', e => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  setChips();

  const ssGet = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const ssSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
  setTimeout(() => { if (panel.hidden && !ssGet('ava-hi')) { hello.classList.add('on'); ssSet('ava-hi', 1); setTimeout(() => hello.classList.remove('on'), 7000); } }, 12000);
})();
