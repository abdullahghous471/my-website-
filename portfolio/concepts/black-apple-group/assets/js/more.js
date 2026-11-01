/* Black Apple: planning calculators (DIME, debt snowball, retirement income), Joseph's instant quote tool,
   and "topic" links that pre-fill the review form. Everything runs in the browser. */
(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const num = v => { const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0; };
  const usd = n => '$' + Math.round(n).toLocaleString('en-US');
  const fmtInput = i => { if (i.inputMode !== 'numeric') return; const n = num(i.value); if (i.value.trim() !== '') i.value = n.toLocaleString('en-US'); };

  /* ---------- tabs ---------- */
  const calc = $('[data-calc]');
  if (calc) {
    const tabs = $$('[data-tab]', calc);
    const show = t => { tabs.forEach(b => { const on = b === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; $(`[data-panel="${b.dataset.tab}"]`, calc).hidden = !on; }); };
    tabs.forEach((b, i) => {
      b.addEventListener('click', () => show(b));
      b.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { const n = tabs[(i + d + tabs.length) % tabs.length]; show(n); n.focus(); } });
    });
  }

  /* ---------- DIME ---------- */
  const dime = $('[data-form-calc="dime"]');
  const runDime = () => {
    const v = k => num(dime.elements[k].value);
    const parts = [['Debt', v('debt')], ['Income', v('income') * Math.max(0, v('years'))], ['Mortgage', v('mortgage')], ['Education', v('edu')]];
    const total = parts.reduce((s, p) => s + p[1], 0), need = Math.max(0, total - v('have'));
    $('[data-out="dime"]').textContent = usd(Math.round(need / 5000) * 5000);
    const max = Math.max(1, ...parts.map(p => p[1]));
    $('[data-bars="dime"]').innerHTML = parts.map(([k, n]) => `<li><span>${k}</span><i style="--w:${(n / max * 100).toFixed(1)}%"></i><b>${usd(n)}</b></li>`).join('') +
      `<li class="minus"><span>Already have</span><i style="--w:0%"></i><b>−${usd(v('have'))}</b></li>`;
  };

  /* ---------- debt snowball ---------- */
  const debt = $('[data-form-calc="debt"]'), list = $('[data-debts]');
  const runDebt = () => {
    let ds = $$('.bcx__debt', list).map(r => { const [n, b, rt, m] = $$('input', r); return { name: n.value || 'Debt', bal: num(b.value), rate: num(rt.value) / 100 / 12, min: num(m.value) }; }).filter(d => d.bal > 0);
    const extra = num(debt.elements.extra.value);
    const outBig = $('[data-out="debt"]'), sub = $('[data-out="debt-sub"]'), order = $('[data-out="debt-order"]');
    if (!ds.length) { outBig.textContent = '—'; sub.textContent = ''; order.innerHTML = ''; return; }
    ds.sort((a, b) => a.bal - b.bal);
    const budget = ds.reduce((s, d) => s + d.min, 0) + extra;
    let month = 0, interest = 0; const done = [];
    // minimum-only baseline interest, for the "you save" line
    const baseline = () => { let tot = 0; ds.forEach(d => { let b = d.bal, m = 0; while (b > 0 && m < 600) { const i = b * d.rate; tot += i; b = b + i - d.min; m++; if (d.min <= i) { tot = Infinity; break; } } }); return tot; };
    const base = baseline();
    const work = ds.map(d => ({ ...d }));
    while (work.some(d => d.bal > 0.5) && month < 600) {
      month++; let pot = budget;
      work.forEach(d => { if (d.bal > 0) { const i = d.bal * d.rate; interest += i; d.bal += i; } });
      work.forEach(d => { if (d.bal > 0) { const p = Math.min(d.min, d.bal); d.bal -= p; pot -= p; } });
      for (const d of work) { if (d.bal > 0 && pot > 0) { const p = Math.min(pot, d.bal); d.bal -= p; pot -= p; } }
      work.forEach(d => { if (d.bal <= 0.5 && !d.paid) { d.paid = month; done.push(d); } });
    }
    if (month >= 600) { outBig.textContent = 'Over 50 years'; sub.textContent = 'Payments barely cover the interest. Joseph can help you rebuild the plan.'; order.innerHTML = ''; return; }
    const y = Math.floor(month / 12), m = month % 12;
    outBig.textContent = (y ? `${y} yr${y > 1 ? 's' : ''} ` : '') + (m ? `${m} mo` : '');
    sub.textContent = `Total interest about ${usd(interest)}` + (isFinite(base) && base > interest ? `, saving about ${usd(base - interest)} versus minimum payments only.` : '.');
    order.innerHTML = done.map(d => `<li><b>${d.name.replace(/[<>&"]/g, '')}</b><span>paid off in month ${d.paid}</span></li>`).join('');
  };
  if (list) $('[data-add-debt]').addEventListener('click', () => {
    if ($$('.bcx__debt', list).length >= 8) return;
    const row = list.firstElementChild.cloneNode(true); $$('input', row).forEach((i, k) => { i.value = k === 0 ? 'Another debt' : ''; });
    list.appendChild(row); $('input', row).focus(); runDebt();
  });

  /* ---------- retirement income ---------- */
  const ret = $('[data-form-calc="ret"]');
  const runRet = () => {
    const v = k => num(ret.elements[k].value);
    const years = Math.max(0, v('retire') - v('age')), r = v('growth') / 100 / 12, n = years * 12;
    const fv = r ? v('saved') * Math.pow(1 + r, n) + v('monthly') * (Math.pow(1 + r, n) - 1) / r : v('saved') + v('monthly') * n;
    const span = Math.max(1, v('span')) * 12, rr = r * .6; // a more cautious growth rate while drawing income
    const pay = rr ? fv * rr / (1 - Math.pow(1 + rr, -span)) : fv / span;
    $('[data-out="ret"]').textContent = usd(Math.round(pay / 10) * 10);
    $('[data-out="ret-sub"]').textContent = `From a projected ${usd(Math.round(fv / 1000) * 1000)} at age ${v('retire')}, drawn over ${v('span')} years.`;
  };

  const bind = (form, fn) => { if (!form) return; form.addEventListener('input', fn); form.addEventListener('focusout', e => { if (e.target.matches('input')) fmtInput(e.target); }); fn(); };
  bind(dime, runDime); bind(debt, runDebt); bind(ret, runRet);

  /* ---------- Joseph's instant quote tool (Compulife), loaded only when asked for ---------- */
  const qm = $('[data-qm]'), qf = $('[data-qm-f]'); let lastFocus = null;
  const closeQ = () => { qm.hidden = true; document.documentElement.classList.remove('qm-on'); lastFocus && lastFocus.focus(); };
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-quote-open]');
    if (o && qm) { lastFocus = o; if (!qf.firstChild) qf.innerHTML = '<iframe src="https://www.compulife.net/website/2729/quoter.html" title="Instant life insurance quote" loading="lazy"></iframe>'; qm.hidden = false; document.documentElement.classList.add('qm-on'); $('[data-qm-x]').focus(); }
    if (e.target.matches('[data-qm-x]') || e.target === qm) closeQ();
    // topic links: pre-select what the visitor wants to talk about
    const t = e.target.closest('[data-topic]');
    if (t) { const sel = $('[data-rv] select[name="topic"]'); if (sel) { sel.value = t.dataset.topic; sel.classList.add('picked'); setTimeout(() => sel.classList.remove('picked'), 1600); } }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && qm && !qm.hidden) closeQ(); });
})();

/* Start where you are: finish the sentence, the plan rebuilds around you */
(() => {
  const wrap = document.querySelector('[data-pz]'); if (!wrap) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = {
    parent:  { img: 'park', h: 'Protect the years they depend on you.', c: ['Term life', 'Living benefits'], q: ['How many years until your youngest is independent?', 'Would your partner keep the home on one income?', 'Is cover through work enough, or tied to the job?'], t: 'Life insurance or mortgage protection', calc: 'dime' },
    home:    { img: 'newhome', h: 'Keep the keys in the family.', c: ['Mortgage protection', 'Term life'], q: ['What is left on the mortgage, and for how long?', 'Could the family cover payments without your income?', 'Do you want the home paid off, or the payments covered?'], t: 'Life insurance or mortgage protection', calc: 'dime' },
    earner:  { img: 'hero', h: 'Protect the paycheck everything runs on.', c: ['Disability income', 'Living benefits', 'Term life'], q: ['How long could the household manage without your pay?', 'What would a serious illness cost beyond insurance?', 'Which bills must never stop?'], t: 'Life insurance or mortgage protection', calc: 'dime' },
    retire:  { img: 'tree-sunset', h: 'Turn savings into income you can count on.', c: ['Annuities', 'Retirement planning', 'Whole life'], q: ['When do you want work to become optional?', 'Is there an old 401(k) to bring together?', 'How do you feel about outliving your savings?'], t: 'Retirement or annuity information', calc: 'ret' },
    parents: { img: 'legacy', h: 'Leave love, not bills.', c: ['Final expense', 'Whole life'], q: ['Do your parents have any cover today?', 'Who would handle final costs and arrangements?', 'Is budget or health the bigger concern?'], t: 'Life insurance or mortgage protection', calc: 'dime' },
    covered: { img: 'advisor', h: 'Find out what your policy really does.', c: ['Free policy review', 'Beneficiary check'], q: ['Is your cover through work, or your own?', 'When were your beneficiaries last updated?', 'Has your family or mortgage changed since you bought it?'], t: 'Review my existing coverage', calc: 'dime' }
  };
  const $ = s => document.querySelector(s);
  const slot = $('[data-pz-slot]'), plan = $('[data-pz-plan]'), btns = [...wrap.querySelectorAll('[data-p]')];
  let typing = 0;
  const type = text => {
    clearInterval(typing);
    if (reduce) { slot.textContent = text; return; }
    let cur = slot.textContent;
    typing = setInterval(() => {
      if (!text.startsWith(cur)) cur = cur.slice(0, -1); else if (cur.length < text.length) cur = text.slice(0, cur.length + 1); else return clearInterval(typing);
      slot.textContent = cur;
    }, 22);
  };
  const pick = (b, focus) => {
    const d = P[b.dataset.p];
    btns.forEach(x => { const on = x === b; x.setAttribute('aria-checked', on); x.tabIndex = on ? 0 : -1; });
    if (focus) b.focus();
    type(b.textContent);
    plan.classList.add('swap');
    setTimeout(() => {
      $('[data-pz-img]').src = `assets/img/pz/${b.dataset.p}.webp`;
      $('[data-pz-h]').textContent = d.h;
      $('[data-pz-covers]').innerHTML = d.c.map(c => `<li>${c}</li>`).join('');
      $('[data-pz-qs]').innerHTML = d.q.map(q => `<li>${q}</li>`).join('');
      const cta = $('[data-pz-cta]'); cta.dataset.topic = d.t; cta.firstChild.textContent = b.dataset.p === 'covered' ? 'Review my current policy ' : b.dataset.p === 'retire' ? 'Plan my retirement income ' : 'Start my free review ';
      $('[data-pz-calc]').dataset.tabGo = d.calc;
      plan.classList.remove('swap');
    }, reduce ? 0 : 220);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', e => { const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (k) { e.preventDefault(); pick(btns[(i + k + btns.length) % btns.length], true); } });
  });
  // "Run my numbers first" opens the matching calculator tab
  document.addEventListener('click', e => { const g = e.target.closest('[data-tab-go]'); if (g) { const t = document.querySelector(`[data-tab="${g.dataset.tabGo}"]`); t && t.click(); } });
  // warm the other five photos once the section is near, so switching is instant
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { Object.keys(P).forEach(k => { const i = new Image(); i.src = `assets/img/pz/${k}.webp`; }); o.disconnect(); } }, { rootMargin: '600px' }).observe(wrap);
  pick(btns[0]);
})();
