/* Black Apple Group · "Roots": a seed in the hero grows roots down the whole page as you scroll.
   Branches spread around every section, sparks of light travel down them, and at the close
   the roots meet an apple tree that grows and blossoms. The page is the soil. */
(() => {
  const cv = document.querySelector('[data-fibers-canvas]');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = 1, docH = 0, segs = [], mains = [], tree = [], blooms = [], seed = { x: 0, y: 0 }, base = { x: 0, y: 0 }, ctaTop = 0, ctaH = 1, small = false;
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const adiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
  const C = [[244, 194, 126], [233, 161, 95], [79, 179, 169], [63, 120, 186]];
  const col = f => { f = Math.min(.999, Math.max(0, f)) * 3; const i = Math.floor(f), k = f - i, a = C[i], b = C[i + 1]; return [a[0] + (b[0] - a[0]) * k | 0, a[1] + (b[1] - a[1]) * k | 0, a[2] + (b[2] - a[2]) * k | 0]; };

  function branch(o) {
    let { x, y, a, w, key, len, depth } = o; let dir = a, dist = 0; const ph = rnd() * 50;
    while (dist < len && segs.length < 16000) {
      dir += adiff(Math.PI / 2, dir) * .012;                       // gravity pulls roots down
      const want = dir + Math.sin(dist * .03 + ph) * .45;
      a += adiff(want, a) * .15;
      const nx = x + Math.cos(a) * 6, ny = y + Math.sin(a) * 6, ww = w * (1 - dist / len) + .35;
      segs.push([x, y, nx, ny, ww, key, 0]); x = nx; y = ny; key += 5.4; dist += 6;
      if (depth < 3 && rnd() < .018) branch({ x, y, a: a + (rnd() < .5 ? -1 : 1) * (.6 + rnd() * .6), w: ww * .7, key, len: (len - dist) * .6, depth: depth + 1 });
    }
  }
  function mainRoot(side, targetX, w) {
    let x = seed.x, y = seed.y, a = Math.PI / 2 + side * .7, key = seed.y, dist = 0, next = 60 + rnd() * 80; const ph = rnd() * 80, pts = [];
    while (y < base.y + 2 && segs.length < 16000) {
      const conv = y > ctaTop - H * .15;
      const tx = conv ? base.x + side * 6 : targetX + Math.sin(y * .0025 + ph) * W * .05;
      const ty = conv ? base.y : y + 500;
      const want = Math.atan2(ty - y, (tx - x) * .9) + Math.sin(dist * .01 + ph) * .3 + Math.sin(dist * .027 + ph) * .15;
      a += adiff(want, a) * .06;
      const nx = x + Math.cos(a) * 7, ny = y + Math.sin(a) * 7, ww = w * (1 - .45 * (y - seed.y) / Math.max(1, base.y - seed.y));
      segs.push([x, y, nx, ny, ww, key, 1]); pts.push([nx, ny, key]);
      x = nx; y = ny; key += 6.2; dist += 7;
      if (dist > next && !conv) {
        next = dist + 70 + rnd() * 120;
        const out = rnd() < .62 ? -side : side;                      // most branches reach into the page, some to the edge
        branch({ x, y, a: a + out * (.9 + rnd() * .7), w: ww * .55, key, len: (small ? 70 : 120) + rnd() * (small ? 180 : 360), depth: 1 });
      }
      if (Math.hypot(base.x - x, base.y - y) < 8) break;
    }
    mains.push(pts);
  }
  function limb(x, y, a, len, w, depth, k0) {
    const n = Math.max(3, len / 6 | 0), span = depth === 0 ? .32 : .13; let px = x, py = y;
    for (let i = 1; i <= n; i++) {
      const t = i / n, aa = a + Math.sin(t * 3 + depth) * .08;
      const nx = px + Math.cos(aa) * len / n, ny = py + Math.sin(aa) * len / n;
      tree.push([px, py, nx, ny, w * (1 - t * .35), k0 + span * t]); px = nx; py = ny;
    }
    const k1 = k0 + span;
    if (depth >= 6 || len < 16) { blooms.push([px, py, k1, rnd(), rnd() < .14]); return; }
    const kids = depth < 2 ? 3 : 2;
    for (let i = 0; i < kids; i++) {
      const spread = (kids === 3 ? (i - 1) * .55 : (i ? .45 : -.45)) + (rnd() - .5) * .3;
      limb(px, py, a + spread, len * (.68 + rnd() * .12), w * .68, depth + 1, k1);
    }
    if (depth > 2) blooms.push([px, py, k1, rnd(), false]);
  }
  function build() {
    W = innerWidth; H = innerHeight; small = W < 760; DPR = Math.min(devicePixelRatio || 1, 2);
    cv.width = W * DPR; cv.height = H * DPR;
    docH = document.documentElement.scrollHeight;
    const hero = document.querySelector('.hero'), cta = document.querySelector('.cta');
    const hr = hero.getBoundingClientRect(), cr = cta.getBoundingClientRect();
    ctaTop = cr.top + scrollY; ctaH = cr.height;
    seed = { x: W / 2, y: hr.top + scrollY + Math.min(hr.height * .86, H * .86) };
    base = { x: W / 2, y: ctaTop + ctaH * .97 };
    segs = []; mains = []; tree = []; blooms = []; s = 7;
    const m = small ? .06 : .09;
    mainRoot(-1, W * m, small ? 3 : 4.4); mainRoot(1, W * (1 - m), small ? 3 : 4.4);
    if (!small) { mainRoot(-1, W * .22, 2.4); mainRoot(1, W * .78, 2.4); }
    const trunk = Math.min(ctaH * .26, small ? 150 : 230);
    limb(base.x, base.y, -Math.PI / 2, trunk, small ? 9 : 14, 0, 0);
  }

  let front = 0, intro = reduce ? 1 : 0, t = 0, last = performance.now(), treeG = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (document.hidden) return;
    t += reduce ? 0 : dt; intro = Math.min(1, intro + dt * .35);
    const e = 1 - Math.pow(1 - intro, 3);
    const goal = reduce ? docH : seed.y + (Math.max(scrollY + H * .9, seed.y + H * .35) - seed.y) * e;
    front += (Math.max(front, goal) - front) * (1 - Math.pow(.02, dt));    // roots only ever grow
    const g = Math.min(1, Math.max(0, (scrollY + H - ctaTop) / (ctaH * .95)));
    treeG += ((reduce ? 1 : g) - treeG) * (1 - Math.pow(.05, dt));

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H); ctx.translate(0, -scrollY);
    ctx.lineCap = 'round'; ctx.globalCompositeOperation = 'lighter';
    const top = scrollY - 40, bot = scrollY + H + 40, span = Math.max(1, base.y - seed.y);

    // the seed
    if (seed.y > top - 60 && seed.y < bot + 60) {
      const p = 1 + Math.sin(t * 2) * .08, gr = ctx.createRadialGradient(seed.x, seed.y, 0, seed.x, seed.y, 60 * p);
      gr.addColorStop(0, 'rgba(255,226,180,.55)'); gr.addColorStop(1, 'rgba(255,226,180,0)'); ctx.fillStyle = gr; ctx.fillRect(seed.x - 70, seed.y - 70, 140, 140);
      ctx.save(); ctx.translate(seed.x, seed.y); ctx.rotate(-.35); ctx.fillStyle = 'rgba(255,236,206,.95)';
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(169,214,190,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(seed.x, seed.y - 9);
      const sp = 18 * e; ctx.quadraticCurveTo(seed.x + 3, seed.y - 9 - sp * .6, seed.x - 2, seed.y - 9 - sp); ctx.stroke();
    }
    // roots: contiguous runs drawn as one path each, glow pass then core (no overlapping caps)
    ctx.globalCompositeOperation = 'source-over'; ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      let open = false, n = 0, lx = 0, ly = 0;
      const flush = () => { if (open) ctx.stroke(); open = false; n = 0; };
      for (let i = 0; i < segs.length; i++) {
        const q = segs[i];
        const vis = q[5] <= front && q[1] < bot && q[3] > top && q[1] > top - 20;
        if (!vis || !open || q[0] !== lx || q[1] !== ly || n > 16) {
          flush();
          if (!vis) continue;
          const c = col((q[1] - seed.y) / span), fade = Math.min(1, (front - q[5]) / 60);
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(pass ? (q[6] ? .7 : .5) : .08) * fade})`;
          ctx.lineWidth = pass ? q[4] : q[4] * 4 + 3;
          ctx.beginPath(); ctx.moveTo(q[0], q[1]); open = true;
        }
        ctx.lineTo(q[2], q[3]); lx = q[2]; ly = q[3]; n++;
      }
      flush();
    }
    ctx.globalCompositeOperation = 'lighter';
    // glowing tips at the growth front
    for (let i = 0; i < segs.length; i++) {
      const q = segs[i];
      const d = front - q[5];
      if (d < 0 || d > 7 || q[3] < top || q[1] > bot) continue;
      const gr = ctx.createRadialGradient(q[2], q[3], 0, q[2], q[3], 10);
      gr.addColorStop(0, 'rgba(255,236,206,.8)'); gr.addColorStop(1, 'rgba(255,236,206,0)'); ctx.fillStyle = gr; ctx.fillRect(q[2] - 10, q[3] - 10, 20, 20);
    }
    // sparks of light travelling down the main roots
    if (!reduce) mains.forEach((pts, r) => {
      for (let k = 0; k < 7; k++) {
        const i = Math.floor(((t * .045 + k / 7 + r * .13) % 1) * pts.length), p = pts[i];
        if (!p || p[2] > front || p[1] < top || p[1] > bot) continue;
        const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9);
        gr.addColorStop(0, 'rgba(255,240,215,.95)'); gr.addColorStop(1, 'rgba(255,240,215,0)'); ctx.fillStyle = gr; ctx.fillRect(p[0] - 9, p[1] - 9, 18, 18);
      }
    });
    // the apple tree, grown from the roots at the close
    if (treeG > .01 && base.y > top - 900) {
      const sway = Math.sin(t * .6) * .006;
      for (const q of tree) {
        if (q[5] > treeG) continue;
        ctx.strokeStyle = 'rgba(236,196,150,.55)'; ctx.lineWidth = q[4];
        ctx.beginPath(); ctx.moveTo(q[0] + sway * (base.y - q[1]), q[1]); ctx.lineTo(q[2] + sway * (base.y - q[3]), q[3]); ctx.stroke();
      }
      for (const b of blooms) {
        const kk = Math.min(1, Math.max(0, (treeG - b[2]) / .12)); if (kk <= 0) continue;
        const sx = b[0] + (base.y - b[1]) * sway, r = (b[4] ? 7 : 3.5 + b[3] * 4) * kk, pulse = 1 + Math.sin(t * 1.5 + b[3] * 9) * .12;
        const gr = ctx.createRadialGradient(sx, b[1], 0, sx, b[1], r * 2.6 * pulse);
        if (b[4]) { gr.addColorStop(0, 'rgba(255,214,150,.95)'); gr.addColorStop(.4, 'rgba(233,161,95,.5)'); }   // apples
        else { gr.addColorStop(0, b[3] < .5 ? 'rgba(255,236,220,.8)' : 'rgba(150,214,204,.7)'); }               // blossom
        gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr;
        ctx.fillRect(sx - r * 3, b[1] - r * 3, r * 6, r * 6);
      }
    }
  }
  let to; const rebuild = () => { clearTimeout(to); to = setTimeout(build, 200); };
  build(); front = seed.y; requestAnimationFrame(frame);
  addEventListener('resize', rebuild); addEventListener('load', rebuild); setTimeout(rebuild, 1500);
  if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
})();
