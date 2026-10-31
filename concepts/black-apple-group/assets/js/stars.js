/* Black Apple Group · "Family of stars"
   A night sky behind the page. Stars link into a family holding hands (hero), move beside the
   content while a protective net of stars forms around them, one parent's star dims and the
   net holds the rest together, and at the close that star rises as a guardian above them. */
(() => {
  const cv = document.querySelector('[data-fibers-canvas]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = 1, small = false;
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

  /* ---------- the family, in figure units (feet at y = 0, tallest head at y = -1) ---------- */
  const stars = [], lines = [];
  const add = (x, y, who, r = 1) => (stars.push({ x, y, who, r }), stars.length - 1);
  const people = [[-.95, 1], [-.35, .93], [.2, .64], [.62, .5]].map(([cx, h], who) => {
    const head = add(cx, -h, who, 1.5), sh = add(cx, -h * .78, who), hip = add(cx, -h * .44, who);
    const fl = add(cx - h * .13, 0, who, .8), fr = add(cx + h * .13, 0, who, .8);
    lines.push([head, sh, who], [sh, hip, who], [hip, fl, who], [hip, fr, who]);
    return { cx, h, head, sh, hip };
  });
  // hands: outer hands hang free, inner hands meet between neighbours
  const hand = (a, b) => { const A = people[a], B = people[b], y = -(A.h + B.h) / 2 * .5; const h = add((A.cx + B.cx) / 2, y, 9, 1.1); lines.push([A.sh, h, a], [B.sh, h, b]); };
  { const P = people[0], h = add(P.cx - .24, -P.h * .48, 0, .9); lines.push([P.sh, h, 0]); }
  hand(0, 1); hand(1, 2); hand(2, 3);
  { const P = people[3], h = add(P.cx + .16, -P.h * .5, 3, .8); lines.push([P.sh, h, 3]); }
  const FAM = stars.length;
  // the protective net: a ring of stars around the family, linked to each other and to the nearest family star
  const NET = 22, netStart = stars.length;
  for (let i = 0; i < NET; i++) { const a = i / NET * Math.PI * 2; stars.push({ x: Math.cos(a) * 1.55 - .15, y: Math.sin(a) * .95 - .5, who: 8, r: .8, net: true, a }); }
  const netLines = [];
  for (let i = 0; i < NET; i++) {
    netLines.push([netStart + i, netStart + (i + 1) % NET]);
    let best = 0, bd = 9; for (let k = 0; k < FAM; k++) { const d = Math.hypot(stars[k].x - stars[netStart + i].x, stars[k].y - stars[netStart + i].y); if (d < bd) { bd = d; best = k; } }
    if (i % 2 === 0) netLines.push([netStart + i, best]);
  }
  // the guardian star (the parent who dims rises here at the close)
  const guard = { x: -.15, y: -1.75 };

  /* ---------- background sky ---------- */
  let sky = [];
  const buildSky = () => { s = 5; sky = []; const n = small ? 170 : 340; for (let i = 0; i < n; i++) sky.push({ x: rnd() * W, y: rnd() * H * 1.4, d: .15 + rnd() * .85, r: .3 + Math.pow(rnd(), 3) * 1.4, p: rnd() * 6.3, warm: rnd() < .35 }); };

  /* ---------- where the family stands in each part of the page ---------- */
  const sec = sel => document.querySelector(sel);
  const target = () => {
    const mid = H * .5, top = el => el ? el.getBoundingClientRect().top : 1e9;
    const cta = top(sec('.cta')), cov = top(sec('#coverage')), life = top(sec('#life'));
    if (cta < H * (small ? .75 : .55)) return 'end';
    if (cov < mid) return 'dim';
    if (life < H * .8) return 'side';
    return 'hero';
  };
  const poses = () => small ? {
    hero: { x: W * .56, y: H * .975, s: H * .1, net: 0, dim: 0, rise: 0, a: 1 },
    side: { x: W * .8, y: H * .2, s: H * .06, net: .7, dim: 0, rise: 0, a: .55 },
    dim: { x: W * .8, y: H * .2, s: H * .06, net: 1, dim: 1, rise: 0, a: .6 },
    end: { x: W * .56, y: Math.min(H * .9, Math.max(H * .3, (document.querySelector('.cta__h') || { getBoundingClientRect: () => ({ top: H * .5 }) }).getBoundingClientRect().top - 22)), s: H * .1, net: 1, dim: 1, rise: 1, a: 1 }
  } : {
    hero: { x: W * .52, y: H * .985, s: H * .25, net: 0, dim: 0, rise: 0, a: 1 },
    side: { x: W * .9, y: H * .66, s: H * .12, net: .7, dim: 0, rise: 0, a: .55 },
    dim: { x: W * .9, y: H * .66, s: H * .12, net: 1, dim: 1, rise: 0, a: .6 },
    end: { x: W * .52, y: H * .5, s: H * .2, net: 1, dim: 1, rise: 1, a: 1 }
  };
  const cur = { x: 0, y: 0, s: 1, net: 0, dim: 0, rise: 0, a: 1 };

  const resize = () => {
    W = innerWidth; H = innerHeight; small = W < 760; DPR = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * DPR; cv.height = H * DPR; buildSky();
    Object.assign(cur, poses()[target()]);
  };
  resize(); addEventListener('resize', resize);
  let px = -999, py = -999;
  addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { px = py = -999; });

  let t = 0, last = performance.now(), draw = reduce ? 1 : 0, shoot = null, nextShoot = 3;
  const glow = (x, y, r, a, warm) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, warm ? `rgba(255,232,196,${a})` : `rgba(220,236,255,${a})`); g.addColorStop(.25, warm ? `rgba(244,194,126,${a * .35})` : `rgba(140,200,220,${a * .3})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  };
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (document.hidden) return;
    t += reduce ? 0 : dt; draw = Math.min(1, draw + dt * .4);
    const goal = poses()[target()], f = 1 - Math.pow(.04, dt);
    for (const k in cur) cur[k] += (goal[k] - cur[k]) * f;

    ctx.globalAlpha = 1; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
    // sky, with slow parallax as you scroll
    const sc = scrollY;
    for (const st of sky) {
      const y = ((st.y - sc * st.d * .25) % (H * 1.4) + H * 1.4) % (H * 1.4) - H * .2, tw = .45 + .55 * Math.sin(t * (1 + st.d) + st.p);
      ctx.fillStyle = st.warm ? `rgba(255,226,190,${.5 * tw * st.d + .1})` : `rgba(210,228,255,${.45 * tw * st.d + .1})`;
      ctx.beginPath(); ctx.arc(st.x, y, st.r, 0, 6.283); ctx.fill();
      if (px > 0) { const d = Math.hypot(st.x - px, y - py); if (d < 130 && st.d > .4) { ctx.strokeStyle = `rgba(200,225,240,${(1 - d / 130) * .35})`; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(st.x, y); ctx.lineTo(px, py); ctx.stroke(); } }
    }
    // shooting star
    if (!reduce) {
      nextShoot -= dt;
      if (nextShoot < 0 && !shoot) { shoot = { x: W * (.2 + rnd() * .7), y: H * rnd() * .4, a: 0 }; nextShoot = 6 + rnd() * 6; }
      if (shoot) { shoot.a += dt; const k = shoot.a / .9, x = shoot.x - k * 260, y = shoot.y + k * 120;
        const g = ctx.createLinearGradient(x, y, x + 120, y - 55); g.addColorStop(0, `rgba(255,240,220,${.9 * (1 - k)})`); g.addColorStop(1, 'rgba(255,240,220,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y - 55); ctx.stroke(); if (k >= 1) shoot = null; }
    }
    // family, net and guardian (quieter while it sits beside the content)
    ctx.globalAlpha = cur.a;
    const T = st => {
      let x = st.x, y = st.y;
      if (st.who === 0 && cur.rise > 0) { const k = cur.rise; x += (guard.x - x) * k; y += (guard.y - y) * k; }  // the dimmed parent rises
      const breathe = 1 + Math.sin(t * .8 + st.x * 3) * .006;
      return [cur.x + x * cur.s * breathe, cur.y + y * cur.s * breathe];
    };
    const famA = (who) => who === 0 ? 1 - cur.dim * .75 + cur.rise * .6 : 1;
    const hold = 1 + cur.dim * .8;                                   // the rest of the family glows brighter
    // net
    if (cur.net > .01) {
      ctx.lineWidth = 1;
      netLines.forEach(([a, b], i) => {
        const k = Math.min(1, Math.max(0, cur.net * 1.3 - i / netLines.length * .3));
        const [x1, y1] = T(stars[a]), [x2, y2] = T(stars[b]);
        ctx.strokeStyle = `rgba(79,179,169,${.32 * k * (1 + cur.dim * .6)})`; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k); ctx.stroke();
      });
      for (let i = netStart; i < netStart + NET; i++) { const [x, y] = T(stars[i]); glow(x, y, 1.6, .55 * cur.net, false); }
    }
    // family lines draw in on load, star by star
    lines.forEach(([a, b, who], i) => {
      const k = Math.min(1, Math.max(0, draw * 1.6 - i / lines.length * .6)); if (k <= 0) return;
      const [x1, y1] = T(stars[a]), [x2, y2] = T(stars[b]);
      const alpha = .55 * (who === 0 ? famA(0) * .7 : hold * .85);
      ctx.strokeStyle = who === 0 ? `rgba(244,194,126,${alpha})` : `rgba(248,217,174,${Math.min(.95, alpha)})`;
      ctx.lineWidth = who === 9 ? 1.6 : 1.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k); ctx.stroke();
    });
    for (let i = 0; i < FAM; i++) {
      const st = stars[i], [x, y] = T(st), tw = .85 + .15 * Math.sin(t * 2 + i);
      const a = Math.min(1, draw * 2 - i / FAM) * (st.who === 0 ? famA(0) : Math.min(1, .8 * hold)) * tw;
      if (a > 0) glow(x, y, st.r * (small ? 1.6 : 2.2), a, true);
    }
    // guardian links: from the risen star down to each of the family
    if (cur.rise > .02) {
      const [gx, gy] = T(stars[people[0].head]);
      glow(gx, gy, small ? 4 : 6, .9 * cur.rise, true);
      [1, 2, 3].forEach(p => { const [x, y] = T(stars[people[p].head]); const gr = ctx.createLinearGradient(gx, gy, x, y);
        gr.addColorStop(0, `rgba(255,232,196,${.5 * cur.rise})`); gr.addColorStop(1, `rgba(79,179,169,${.15 * cur.rise})`);
        ctx.strokeStyle = gr; ctx.lineWidth = 1; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]); });
    }
  }
  requestAnimationFrame(frame);
})();
