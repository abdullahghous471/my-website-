/* Helmwork · "Helm", Abdullah's assistant.
   Answers from the portfolio's own content (services, results, projects, process, reviews) and can book a meeting.
   The avatar is a small orb woven from light strands, like the hero ring; it brightens while Helm "speaks". */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const UPWORK = 'https://www.upwork.com/freelancers/~013c19993b7b8137ff?mp_source=share';
  const PCSPAIN = 'https://my-website.pc-spain.workers.dev';

  /* ---------------- avatar orb ---------------- */
  const orbs = []; let speaking = 0, mx = 0, my = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  const addOrb = cv => { const dpr = Math.min(devicePixelRatio, 2), s = +cv.getAttribute('width'); cv.width = s * dpr; cv.height = s * dpr; cv.style.width = s + 'px'; cv.style.height = s + 'px'; orbs.push({ cv, ctx: cv.getContext('2d'), s, dpr }); };
  let blink = 0, nextBlink = 2.5;
  const drawOrb = (o, t) => {
    const { ctx, s, dpr } = o, c = s / 2, R = s * .33, sp = speaking;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, s, s);
    const core = ctx.createRadialGradient(c, c * .92, 0, c, c, R * 1.25);
    core.addColorStop(0, 'rgba(40,34,70,.95)'); core.addColorStop(.75, 'rgba(18,16,30,.95)'); core.addColorStop(1, 'rgba(10,10,16,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(c, c, R * 1.18, 0, 7); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, c - R, 0, c + R);
    g.addColorStop(0, '#FF9A6B'); g.addColorStop(.38, '#FF6FA8'); g.addColorStop(.7, '#A989FF'); g.addColorStop(1, '#6E97FF');
    ctx.strokeStyle = g; ctx.lineWidth = Math.max(.6, s / 90);
    const n = s > 50 ? 14 : 10;
    for (let k = 0; k < n; k++) {
      const f = k / (n - 1); ctx.globalAlpha = .28 + .5 * Math.exp(-Math.pow((f - .5) * 3, 2));
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const a = i / 72 * Math.PI * 2;
        const w = (.05 + sp * .06) * Math.sin(a * 3 + t * (1.1 + sp) + k * .4) + .03 * Math.sin(a * 7 - t * 1.6 + k * .9);
        const r = R * (1 + (f - .5) * .22 + w);
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // eyes: two soft lights that look toward the cursor and blink now and then
    const ex = mx * R * .22, ey = my * R * .18, open = 1 - blink, eh = Math.max(.08, open) * R * .17;
    ctx.fillStyle = '#F4F1FF'; ctx.shadowColor = '#C9B8FF'; ctx.shadowBlur = s / 9;
    [-1, 1].forEach(sx => { ctx.beginPath(); ctx.ellipse(c + sx * R * .28 + ex, c - R * .02 + ey, R * .085, eh, 0, 0, 7); ctx.fill(); });
    ctx.shadowBlur = 0;
    if (sp > .05) { // a small light under the eyes while speaking
      ctx.strokeStyle = `rgba(255,190,170,${.5 + .5 * sp})`; ctx.lineWidth = Math.max(1, s / 45); ctx.lineCap = 'round';
      const m = (.4 + .6 * Math.abs(Math.sin(t * 9))) * sp * R * .1;
      ctx.beginPath(); ctx.moveTo(c - R * .14 + ex, c + R * .3 + ey); ctx.quadraticCurveTo(c + ex, c + R * .3 + m * 2 + ey, c + R * .14 + ex, c + R * .3 + ey); ctx.stroke();
    }
  };
  let t0 = performance.now(), lastT = 0;
  const loop = now => {
    requestAnimationFrame(loop);
    const t = reduce ? 1 : (now - t0) / 1000, dt = t - lastT; lastT = t;
    if (t > nextBlink) { blink = Math.min(1, blink + dt * 14); if (blink >= 1) { nextBlink = t + 2.5 + Math.random() * 3; } } else blink = Math.max(0, blink - dt * 10);
    orbs.forEach(o => { if (o.cv.offsetParent !== null) drawOrb(o, t); });
  };
  $$('[data-orb]').forEach(addOrb); requestAnimationFrame(loop);

  /* ---------------- knowledge ---------------- */
  const SERVICES = [
    ['IT project management', 'End-to-end delivery of web, mobile and AI projects, from discovery through launch, QA and post-launch support.'],
    ['Customer support & chat', 'Email, live chat, phone and technical support built from scratch, with SLAs, triage templates and escalation paths. CSAT kept at 100%.'],
    ['Website design & delivery', 'Fast, premium websites planned, built and launched end to end, like the PC-Spain site.'],
    ['Requirements & proposals', 'Client visions turned into proposals and SOWs that developers understand and clients approve the first time.'],
    ['Virtual assistant & inbox', 'Full ownership of inbox, calendar, appointments and daily operations in Google Workspace or Outlook.'],
    ['CRM & client success', 'Onboarding, follow-ups and retention in Zoho CRM, HubSpot and Intercom, with full pipeline support.'],
    ['UI/UX coordination', 'User journeys mapped and wireframes reviewed, so the product matches the business goal before code is written.'],
    ['Technical troubleshooting', 'Vague complaints turned into clean, reproducible bug reports that engineering can act on straight away.'],
    ['Stakeholder communication', 'One point of contact between clients, developers, designers and leadership, keeping everyone aligned.']
  ];
  const CASES = {
    hedy: { name: 'Hedy AI', tag: 'AI platform', metric: '4 hrs → 40 min', k: 'first response time', text: 'No structure in support. Abdullah took full ownership, cleared 200+ backlogged tickets in 30 days, built triage and escalation and drove CSAT to 100%.' },
    pmcardio: { name: 'PMcardio', tag: 'Healthcare', metric: '5 hrs → 45 min', k: 'first response time', text: 'AI-powered ECG analysis. He rebuilt the support operation, categorised 200+ tickets, enforced SLAs and reached 100% CSAT within the first month.' },
    dust: { name: 'Dust', tag: 'Enterprise AI', metric: '+70%', k: 'agent response accuracy', text: 'A Y Combinator-backed AI knowledge platform. He handled support, chat operations and onboarding, structured the inbox and cut response times on every channel.' }
  };
  const REVIEWS = [
    ['Kashor Pungi', 'He is proactive and often spots issues before we even raise them… His mix of strong technical skills and genuine care for customers really makes him stand out.'],
    ['Martin Reynolds', 'He took ownership of our entire support inbox within days, had a proper system running within a week, and our team finally had breathing room.'],
    ['Sarah Andersen', 'He kept every stakeholder aligned, flagged risks before they became problems, and made sure nothing slipped through.']
  ];
  const CHIPS = ['What do you do?', 'Free audit', 'Show me results', 'Website projects', 'How do you work?', 'Pricing', 'Book a meeting'];

  const caseCard = c => ({ card: `<div class="ai-card"><span class="mono">${c.tag}</span><b>${c.name}</b><strong>${c.metric}</strong><em>${c.k}</em><p>${c.text}</p></div>` });
  const go = (sel, label) => ({ action: `<button type="button" class="ai-act" data-go="${sel}">${label}</button>` });

  const INTENTS = [
    { id: 'hi', w: .6, k: ['hi', 'hello', 'hey', 'salam', 'assalam', 'good morning', 'good evening'], a: () => [{ text: 'Hello! 👋 I can tell you about Abdullah’s services, results and projects, or book you a meeting. What are you working on?' }] },
    { id: 'book', k: ['book', 'meeting', 'call', 'schedule', 'appointment', 'calendar', 'talk', 'zoom', 'meet him'], a: () => [{ text: 'Happy to set that up. Pick a call type and a time that suits you, and Abdullah will confirm.' }, { action: '<button type="button" class="ai-act ai-act--hot" data-book-open>Open the booking calendar</button>' }] },
    { id: 'services', k: ['service', 'what do you do', 'what does he do', 'offer', 'help with', 'can you do', 'skills', 'expertise', 'capabilit'], a: () => [{ text: 'Abdullah covers nine areas, from inbox to full project delivery:' }, { list: SERVICES.map(s => s[0]) }, { text: 'Tap one for details, or tell me what you need.' }], chips: SERVICES.slice(0, 5).map(s => s[0]) },
    { id: 'results', k: ['result', 'case', 'proof', 'example', 'success', 'achieve', 'impact', 'numbers', 'metric'], a: () => [{ text: 'Some measured results from recent work:' }, caseCard(CASES.hedy), caseCard(CASES.pmcardio), caseCard(CASES.dust), { text: 'Across his career: $400K+ revenue contributed, 85+ projects delivered and 100% client satisfaction.' }], chips: ['Hedy AI', 'PMcardio', 'Dust', 'Book a meeting'] },
    { id: 'hedy', k: ['hedy'], a: () => [caseCard(CASES.hedy)] },
    { id: 'pmcardio', k: ['pmcardio', 'ecg', 'cardio', 'healthcare'], a: () => [caseCard(CASES.pmcardio)] },
    { id: 'dust', k: ['dust', 'y combinator', 'yc'], a: () => [caseCard(CASES.dust)] },
    { id: 'web', k: ['website', 'web design', 'web site', 'pc spain', 'pc-spain', 'landing', 'site', 'build a site', 'redesign'], a: () => [{ text: 'Yes! Websites are part of the work now. The featured project is Property Consultancy Spain: a 131-page bilingual site with a video intro, a built-in chat assistant and free Cloudflare hosting.' }, { action: `<a class="ai-act" href="${PCSPAIN}" target="_blank" rel="noopener">Visit the live site ↗</a>` }, { action: '<button type="button" class="ai-act" data-video-open="assets/video/pcspain-walkthrough.mp4">Watch the 30 s walkthrough</button>' }] },
    { id: 'projects', k: ['project', 'portfolio', 'product', 'apps', 'clients', 'worked with', 'companies'], a: () => [{ text: 'Live products he has coordinated include kavanhealth.com, habitnest.com, techmicrousa.com, brighter.ai, sqor.ai, thecampusadvisor.com, cityride.co and two mobile apps, plus the PC-Spain website.' }, go('#projects', 'See all live projects')] },
    { id: 'process', k: ['how do you work', 'how does he work', 'process', 'approach', 'method', 'steps', 'onboard'], a: () => [{ text: 'Four steps, every time:' }, { list: ['Take ownership: learn your inbox, tools and backlog', 'Build the system: triage, templates, SLAs, escalation', 'Run it daily: customers answered, projects moving', 'Measure & improve: response times and CSAT tracked'] }] },
    { id: 'price', k: ['price', 'pricing', 'rate', 'cost', 'budget', 'hourly', 'fee', 'charge', 'how much', 'quote'], a: () => [{ text: 'It depends on the scope. Abdullah works hourly or on a fixed price through Upwork. The quickest way to an exact quote is a short intro call.' }, { action: '<button type="button" class="ai-act ai-act--hot" data-book-open>Book a 15-min intro call</button>' }, { action: `<a class="ai-act" href="${UPWORK}" target="_blank" rel="noopener">See his Upwork profile ↗</a>` }] },
    { id: 'avail', k: ['available', 'availability', 'start', 'when can', 'capacity', 'full time', 'part time'], a: () => [{ text: 'Abdullah is available for new projects right now. Book a call and he can usually start quickly once scope is clear.' }, { action: '<button type="button" class="ai-act ai-act--hot" data-book-open>Book a call</button>' }] },
    { id: 'about', k: ['about', 'who is', 'who are', 'background', 'experience', 'abdullah', 'yourself', 'him'], a: () => [{ text: 'Abdullah is a technical support and customer success specialist with 5+ years running the operational backbone of growing businesses: IT project coordination, customer support, virtual assistance and CRM. He’s Upwork Top Rated with 100% client satisfaction.' }, go('#about', 'Read more about him')] },
    { id: 'tools', k: ['tool', 'software', 'stack', 'crm', 'slack', 'clickup', 'zoho', 'intercom', 'hubspot', 'jira', 'trello', 'notion'], a: () => [{ text: 'Daily tools: Slack, ClickUp, Trello, Zoho CRM, HubSpot, Intercom, Google Workspace, Outlook/Gmail, Zoom, Google Meet, Excel, Figma/Miro, plus AI tools like Claude, ChatGPT and Gemini.' }] },
    { id: 'industries', k: ['industr', 'sector', 'niche', 'field', 'domain'], a: () => [{ text: 'Healthcare, AI platforms, e-commerce, real estate, travel and education.' }] },
    { id: 'reviews', k: ['review', 'testimonial', 'feedback', 'rating', 'recommend', 'trust'], a: () => { const r = REVIEWS[Math.floor(Math.random() * REVIEWS.length)]; return [{ quote: `“${r[1]}”<span>— ${r[0]}, verified Upwork client</span>` }, go('#reviews', 'Read all reviews')]; } },
    { id: 'certs', k: ['certif', 'qualif', 'english', 'language', 'top rated', 'badge'], a: () => [{ text: 'Upwork Top Rated, ClickUp Certified, Customer Success Certified and Duolingo English 120.' }] },
    { id: 'contact', k: ['contact', 'hire', 'email', 'reach', 'upwork', 'message', 'whatsapp', 'phone', 'linkedin', 'mail'], a: () => [{ text: 'The fastest ways to reach Abdullah:' }, { action: '<button type="button" class="ai-act ai-act--hot" data-book-open>Book a meeting</button>' }, { action: '<a class="ai-act" href="mailto:helmwork.tech@gmail.com">Email helmwork.tech@gmail.com</a>' }, { action: '<a class="ai-act" href="https://pk.linkedin.com/in/abdullah-ghous" target="_blank" rel="noopener">LinkedIn ↗</a>' }, { action: `<a class="ai-act" href="${UPWORK}" target="_blank" rel="noopener">Message him on Upwork ↗</a>` }] },
    { id: 'audit', w: 1.3, k: ['audit', 'free audit', 'free call', 'free consult', 'quick win', 'free', 'trial', 'no obligation'], a: () => [{ text: 'Abdullah offers a free 30-minute operations audit: show him your inbox, support queue or project board and he’ll send you three fixes you can use straight away. No obligation, no sales pitch.' }, { action: '<button type="button" class="ai-act ai-act--hot" data-book-open data-book-type="audit">Claim the free audit</button>' }] },
    { id: 'tz', w: 1.2, k: ['time zone', 'timezone', 'hours', 'working hours', 'overlap', 'based', 'location', 'where are', 'pakistan', 'est', 'pst', 'gmt', 'cet'], a: () => [{ text: 'Abdullah is based in Pakistan (UTC+5) and sets his hours around yours. Before starting you agree a fixed daily overlap with your team.' }] },
    { id: 'security', w: 1.2, k: ['access', 'security', 'secure', 'password', 'nda', 'confidential', 'data', 'permission'], a: () => [{ text: 'You stay in control: he works through his own user with only the permissions needed, keeps shared logins in a password manager and is happy to sign an NDA. You can remove access in minutes when you finish.' }] },
    { id: 'commit', w: 1.2, k: ['minimum', 'commitment', 'contract', 'lock', 'cancel', 'long term', 'how many hours'], a: () => [{ text: 'No long lock-in. Work runs through Upwork, so you can start with a small project or a few hours a week and scale up. Contracts can be paused or ended any time.' }] },
    { id: 'week1', w: 1.2, k: ['first week', 'week one', 'week 1', 'get started', 'kick off', 'kickoff', 'onboarding'], a: () => [{ text: 'Week one:' }, { list: ['Day 1: kick-off call, access and priorities', 'Days 2–3: learn how things run, map the gaps', 'Days 4–5: first fixes live (triage, templates, clean board)', 'End of week: a short written report'] }] },
    { id: 'handover', w: 1.2, k: ['handover', 'hand over', 'document', 'sop', 'playbook', 'in-house', 'replace'], a: () => [{ text: 'Everything is documented as he goes: SOPs, templates and checklists stored in your tools. A new hire gets a written playbook and a recorded walkthrough.' }] },
    { id: 'privacy', w: 1.3, k: ['privacy', 'gdpr', 'cookie', 'tracking', 'my data'], a: () => [{ text: 'No tracking or advertising cookies. Booking details are only used to reply to you, and I (Helm) run in your browser without storing your questions.' }, { action: '<button type="button" class="ai-act" data-privacy-open>Read the privacy note</button>' }] },
    { id: 'bot', k: ['are you ai', 'are you a bot', 'are you human', 'chatgpt', 'who made you', 'real person'], a: () => [{ text: 'I’m Helm, Abdullah’s assistant. I answer from his portfolio, so I’m quick but focused. For anything specific, book a call with the real Abdullah.' }] },
    { id: 'thanks', k: ['thank', 'thanks', 'great', 'cool', 'awesome', 'perfect', 'nice'], a: () => [{ text: 'You’re welcome! Anything else I can help with?' }] }
  ];
  SERVICES.forEach(([name, text], i) => INTENTS.push({ id: 'svc' + i, k: [name.toLowerCase(), ...name.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 4)], a: () => [{ text: `${name}: ${text}` }, { action: '<button type="button" class="ai-act" data-book-open>Discuss this on a call</button>' }], w: .9 }));

  const norm = s => ' ' + s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const match = q => {
    const n = norm(q); let best = null, score = 0;
    INTENTS.forEach(it => {
      let sc = 0;
      it.k.forEach(k => {
        const hit = k.length <= 4 ? new RegExp('\\b' + k + '(s|es)?\\b').test(n) // short words must match whole
          : k.includes(' ') ? n.includes(k) : new RegExp('\\b' + k).test(n); // longer keys match word starts (stems)
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
  const scroll = () => { log.scrollTop = log.scrollHeight; };
  const add = (who, html) => {
    const row = document.createElement('div'); row.className = 'ai-msg ai-msg--' + who; row.innerHTML = html; log.appendChild(row); scroll(); return row;
  };
  const setChips = list => { chipsEl.innerHTML = (list || CHIPS).map(c => `<button type="button" class="ai-chip">${esc(c)}</button>`).join(''); };
  const render = part => part.text ? `<p>${part.text}</p>` : part.list ? `<ul>${part.list.map(i => `<li>${i}</li>`).join('')}</ul>` : part.card ? part.card : part.quote ? `<blockquote>${part.quote}</blockquote>` : part.action || '';

  let busy = false;
  const reply = async (parts, chips) => {
    busy = true; const typing = add('bot', '<span class="ai-typing"><i></i><i></i><i></i></span>'); speaking = 1;
    await new Promise(r => setTimeout(r, reduce ? 50 : 520 + Math.random() * 380));
    typing.remove();
    const acts = parts.filter(p => p.action), rest = parts.filter(p => !p.action);
    for (const p of rest) { add('bot', render(p)); if (!reduce) await new Promise(r => setTimeout(r, 220)); }
    if (acts.length) add('bot ai-msg--acts', acts.map(render).join(''));
    setChips(chips); busy = false;
    setTimeout(() => { speaking = 0; }, 600);
  };
  const ask = async q => {
    if (!q.trim()) return;
    while (busy) await new Promise(r => setTimeout(r, 120)); // let Helm finish its current answer first
    add('me', `<p>${esc(q)}</p>`);
    const map = { 'what do you do?': 'services', 'show me results': 'results', 'website projects': 'web', 'how do you work?': 'process', 'pricing': 'price', 'book a meeting': 'book', 'free audit': 'audit' };
    const it = INTENTS.find(i => i.id === map[q.toLowerCase()]) || match(q);
    if (it) { reply(it.a(), it.chips); if (it.id === 'book' && window.HelmworkBook) setTimeout(() => window.HelmworkBook.open(), 900); }
    else reply([{ text: 'I’m not sure about that one yet. I can tell you about Abdullah’s services, results, website work, process or pricing, or book you a call to ask him directly.' }, { action: '<button type="button" class="ai-act ai-act--hot" data-book-open>Book a call</button>' }]);
  };
  const welcome = () => {
    log.innerHTML = '';
    reply([{ text: 'Hi, I’m Helm 👋 Abdullah’s AI assistant.' }, { text: 'Ask me about his services, results or website work, or I can book you a meeting.' }]);
  };

  let started = false;
  const open = () => {
    panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('ai-on'); hello.classList.remove('on');
    if (!started) { started = true; welcome(); }
    setTimeout(() => input.focus(), 50);
  };
  const close = () => { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('ai-on'); launch.focus(); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-ai-open]')) { e.preventDefault(); panel.hidden ? open() : close(); }
    const chip = e.target.closest('.ai-chip'); if (chip) ask(chip.textContent);
    const v = e.target.closest('.ai [data-video-open]'); if (v) { const real = $('.work__btns [data-video-open]'); real && real.click(); }
    const g = e.target.closest('[data-go]'); if (g) { const el = $(g.dataset.go); if (el) { if (innerWidth < 760) close(); el.scrollIntoView({ behavior: 'smooth' }); } }
  });
  $('[data-ai-close]').addEventListener('click', close);
  $('[data-ai-reset]').addEventListener('click', () => { welcome(); input.focus(); });
  form.addEventListener('submit', e => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  setChips();

  /* a one-time hello bubble after the visitor has looked around */
  setTimeout(() => { if (panel.hidden && !sessionStorageGet('helm-hi')) { hello.classList.add('on'); sessionStorageSet('helm-hi', 1); setTimeout(() => hello.classList.remove('on'), 7000); } }, 9000);
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
})();
