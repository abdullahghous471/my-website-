/* Helmwork · the mark drawn in construction lines, driven by scroll (Canvas 2D).
   Guide lines extend, the outlines draw on, then the mark gains 3D depth and a spark runs around it. */
(() => {
  const sec = document.querySelector('[data-mark-sec]'), cv = document.querySelector('[data-mark]');
  if (!sec || !cv) return;
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1;
  const resize = () => { dpr = Math.min(devicePixelRatio, 2); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; };
  addEventListener('resize', resize); resize();

  /* geometry of the mark in its own 40×40 units (same as the logo SVG) */
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
  const ring = (() => {
    const pts = [], a0 = .5, a1 = Math.PI * 2 - .5, n = 72;
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([20 + 17.2 * Math.cos(a), 20 - 17.2 * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * i / n; pts.push([20 + 14.8 * Math.cos(a), 20 - 14.8 * Math.sin(a)]); }
    pts.push(pts[0]); return pts;
  })();
  const shapes = [
    { pts: ring, warm: false },
    { pts: rect(13.3, 12.5, 15.7, 27.5), warm: false },
    { pts: rect(24.3, 12.5, 26.7, 27.5), warm: false },
    { pts: rect(15.7, 18.8, 39, 21.2), warm: true }
  ];
  const guidesX = [13.3, 15.7, 24.3, 26.7, 39, 20], guidesY = [12.5, 18.8, 21.2, 27.5, 2.8, 37.2, 20];
  const corners = [[13.3, 12.5], [15.7, 12.5], [13.3, 27.5], [15.7, 27.5], [24.3, 12.5], [26.7, 12.5], [24.3, 27.5], [26.7, 27.5], [39, 18.8], [39, 21.2], [20 + 17.2 * Math.cos(.5), 20 - 17.2 * Math.sin(.5)], [20 + 17.2 * Math.cos(-.5), 20 - 17.2 * Math.sin(-.5)]];

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));

  let visible = false;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '200px' }).observe(sec);
  const t0 = performance.now();

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    const r = sec.getBoundingClientRect();
    const p = reduce ? 1 : clamp(-r.top / Math.max(1, r.height - innerHeight) * 1.15 + .08);
    const gP = seg(p, 0, .3), oP = seg(p, .14, .62), dP = seg(p, .5, .9);
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;

    const mobile = W < 760;
    const size = mobile ? Math.min(W * .66, H * .4) : Math.min(W * .36, H * .62);
    const cx = mobile ? W * .44 : W * .3, cy = mobile ? H * .3 : H * .5;
    const S = size / 34, F = 1100;
    const ry = dP * -.55 + Math.sin(t * .3) * .06 * dP + mx * .25, rx = dP * .18 + my * .12;
    const depth = 2.2 * dP;
    const cyR = Math.cos(ry), syR = Math.sin(ry), cxR = Math.cos(rx), sxR = Math.sin(rx);
    const proj = (x, y, z) => { // mark units → screen
      let X = (x - 20) * S, Y = (y - 20) * S, Z = z * S;
      const x1 = X * cyR + Z * syR, z1 = -X * syR + Z * cyR;
      const y1 = Y * cxR - z1 * sxR, z2 = Y * sxR + z1 * cxR;
      const k = F / (F - z2); return [cx + x1 * k, cy + y1 * k];
    };

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const grad = ctx.createLinearGradient(0, cy - size * .6, 0, cy + size * .6);
    grad.addColorStop(0, '#FF9A6B'); grad.addColorStop(.35, '#FF6FA8'); grad.addColorStop(.7, '#A989FF'); grad.addColorStop(1, '#6E97FF');

    /* 1 · construction lines shoot out from the mark */
    const far = Math.max(W, H) / S * 1.2;
    ctx.lineWidth = 1;
    guidesY.forEach((y, i) => {
      const L = far * gP, a = proj(20 - L, y, 0), b = proj(20 + L, y, 0);
      ctx.strokeStyle = `rgba(236,232,255,${(i > 3 ? .05 : .09) * gP})`; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    });
    guidesX.forEach((x, i) => {
      const L = far * gP, a = proj(x, 20 - L, 0), b = proj(x, 20 + L, 0);
      ctx.strokeStyle = `rgba(236,232,255,${(i === 5 ? .05 : .09) * gP})`; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    });
    [[1, 1], [1, -1]].forEach(([sx, sy]) => { // diagonals
      const L = far * gP * .7, a = proj(20 - L * sx, 20 - L * sy, 0), b = proj(20 + L * sx, 20 + L * sy, 0);
      ctx.strokeStyle = `rgba(236,232,255,${.045 * gP})`; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
    });
    [22.5, 28].forEach((R, i) => { // guide circles
      ctx.strokeStyle = `rgba(236,232,255,${.06 * gP})`; ctx.setLineDash(i ? [2, 6] : []);
      ctx.beginPath();
      for (let k = 0; k <= 96 * gP; k++) { const a = k / 96 * Math.PI * 2 - Math.PI / 2, q = proj(20 + R * Math.cos(a), 20 + R * Math.sin(a), 0); k ? ctx.lineTo(...q) : ctx.moveTo(...q); }
      ctx.stroke(); ctx.setLineDash([]);
    });

    /* 2 · outlines draw on (front, and back once depth appears) */
    const drawShape = (pts, z, prog, alpha, warm) => {
      const q = pts.map(([x, y]) => proj(x, y, z)); let len = 0;
      for (let i = 1; i < q.length; i++) len += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
      ctx.beginPath(); q.forEach((v, i) => i ? ctx.lineTo(...v) : ctx.moveTo(...v));
      ctx.setLineDash([len * prog, len]);
      ctx.globalAlpha = alpha; ctx.shadowColor = warm ? 'rgba(255,120,80,.9)' : 'rgba(170,140,255,.85)'; ctx.shadowBlur = 14;
      ctx.strokeStyle = warm ? '#FF7A50' : grad; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,246,240,.92)'; ctx.lineWidth = .9; ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      return { q, len };
    };
    if (dP > 0) {
      shapes.forEach(s => drawShape(s.pts, -depth, 1, .35 * dP, s.warm));
      ctx.strokeStyle = `rgba(220,210,255,${.28 * dP})`; ctx.lineWidth = 1;
      corners.forEach(([x, y]) => { const a = proj(x, y, depth * .0), b = proj(x, y, -depth); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); });
    }
    let ringPath = null;
    shapes.forEach((s, i) => { const res = drawShape(s.pts, 0, clamp(oP * 1.25 - i * .08), 1, s.warm); if (i === 0) ringPath = res; });

    /* 3 · a spark keeps running around the ring once it is built */
    if (oP > .98 && ringPath && !reduce) {
      ctx.beginPath(); ringPath.q.forEach((v, i) => i ? ctx.lineTo(...v) : ctx.moveTo(...v));
      ctx.setLineDash([46, ringPath.len]); ctx.lineDashOffset = -((t * 260) % (ringPath.len + 46));
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.shadowColor = '#FFB59A'; ctx.shadowBlur = 18; ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.shadowBlur = 0;
    }

    /* 4 · faint fill of the bar once complete */
    if (oP > .9) {
      const b = [[15.7, 18.8], [39, 18.8], [39, 21.2], [15.7, 21.2]].map(([x, y]) => proj(x, y, 0));
      ctx.beginPath(); b.forEach((v, i) => i ? ctx.lineTo(...v) : ctx.moveTo(...v)); ctx.closePath();
      ctx.fillStyle = `rgba(255,122,80,${.22 * (oP - .9) * 10})`; ctx.fill();
    }
  };
  requestAnimationFrame(frame);
})();
