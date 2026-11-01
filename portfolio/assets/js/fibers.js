/* Helmwork · light fibres that run through the whole page.
   Sections set data-fibers="ring|tangle|river|loop|bundle" and data-form="x y scale angle alpha".
   Each section's shape blends into the next one as you scroll, so the motion never stops.
   At the end the fibres become a fibre-optic bundle whose glowing tips draw the Helmwork mark. */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-fibers-canvas]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
  camera.position.set(0, 0, 10);

  /* ---------- the mark, sampled as points for the fibre tips ---------- */
  const logo = (() => {
    const pts = [], add = (x, y, hot) => pts.push([(x - 20) * .085, -(y - 20) * .085, hot]);
    for (let i = 0; i < 46; i++) { const a = .5 + (i / 45) * (Math.PI * 2 - 1); add(20 + 16 * Math.cos(a), 20 - 16 * Math.sin(a), 0); }
    for (let i = 0; i < 11; i++) add(14.5, 12.5 + i * 1.5, 0);
    for (let i = 0; i < 11; i++) add(25.5, 12.5 + i * 1.5, 0);
    for (let i = 0; i < 16; i++) add(14.5 + (i + 1) * 1.53, 20, 1);
    return pts;
  })();
  const S = small ? logo.length : logo.length; // one fibre per tip of the mark (84)
  const M = small ? 90 : 140;

  /* per-strand constants */
  const rnd = (() => { let s = 3; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const strands = [];
  for (let s = 0; s < S; s++) {
    const n = s / (S - 1);
    strands.push({
      n, seed: rnd(), f1: .6 + rnd() * 1.2, f2: 1.3 + rnd() * 2.2, f3: .3 + rnd() * .6, p1: rnd() * 6.28, p2: rnd() * 6.28, a1: .5 + rnd() * 1.1, a2: .2 + rnd() * .5,
      start: [-7.5 + rnd() * 3, 5.5 + rnd() * 2.2, -7 - rnd() * 3], c1: [-3.2 + rnd() * 1.4, 2.8 + rnd() * 1.2, -3.5 + rnd() * 1.2],
      tip: logo[s]
    });
  }

  /* ---------- shapes: position of strand s at parameter u (0..1) ---------- */
  const TAU = Math.PI * 2;
  const shapes = {
    ring(st, u, t, o) { // matches the hero portal
      const a = u * TAU, r = 2.35 + (st.n - .5) * .32 * (1 + .55 * Math.sin(a * 3 + t * .35 + st.n * 2)) + .07 * Math.sin(a * 5 + t * .55 + st.n * 1.3) + .035 * Math.sin(a * 11 - t * .85 + st.n * 3);
      o[0] = Math.cos(a) * r; o[1] = Math.sin(a) * r; o[2] = (st.n - .5) * .25;
    },
    tangle(st, u, t, o) { // chaos: every fibre on its own path
      const x = (u - .5) * 15;
      o[0] = x; o[1] = st.a1 * Math.sin(x * st.f1 * .5 + t * .7 + st.p1) + st.a2 * Math.sin(x * st.f2 * .5 - t * 1.1 + st.p2) + (st.seed - .5) * 1.6;
      o[2] = Math.sin(x * st.f3 + t * .5 + st.p2) * 1.4;
    },
    river(st, u, t, o) { // calm ribbon: all fibres flow together
      const x = (u - .5) * 15, n = st.n - .5;
      const twist = 1 + .6 * Math.sin(x * .8 + t * .3 + st.n * 3);
      o[0] = x; o[1] = .75 * Math.sin(x * .55 + t * .45 + n * .35) + .28 * Math.sin(x * 1.25 - t * .3 + n * .9) + n * .42 * twist;
      o[2] = n * .3 * Math.cos(x * .7 + t * .4);
    },
    loop(st, u, t, o) { // wide calm ring around the services
      const a = u * TAU, r = 3.1 + (st.n - .5) * .22 + .05 * Math.sin(a * 6 + t * .5 + st.n * 2);
      o[0] = Math.cos(a) * r; o[1] = Math.sin(a) * r * .32 + (st.n - .5) * .06; o[2] = Math.sin(a) * r * .5;
    },
    bundle(st, u, t, o) { // fibre-optic bundle sweeping in, tips form the mark
      const e = [st.tip[0] * .74, st.tip[1] * .74, .6], c2 = [e[0] - .7, e[1] + .5, e[2] - 1.6];
      const sway = (1 - u) * .18 * Math.sin(t * .8 + st.seed * 6);
      const v = 1 - u, b0 = v * v * v, b1 = 3 * v * v * u, b2 = 3 * v * u * u, b3 = u * u * u;
      o[0] = b0 * st.start[0] + b1 * st.c1[0] + b2 * c2[0] + b3 * e[0] + sway;
      o[1] = b0 * st.start[1] + b1 * st.c1[1] + b2 * c2[1] + b3 * e[1];
      o[2] = b0 * st.start[2] + b1 * st.c1[2] + b2 * c2[2] + b3 * e[2];
    }
  };

  /* ---------- geometry: all strands in one line-segment mesh ---------- */
  const V = S * M;
  const pos = new Float32Array(V * 3), uArr = new Float32Array(V), seedArr = new Float32Array(V), col = new Float32Array(V * 3);
  const stops = [new THREE.Color('#FF9A6B'), new THREE.Color('#FF6FA8'), new THREE.Color('#A989FF'), new THREE.Color('#6E97FF')];
  const grad = n => { const f = n * 3, i = Math.min(2, Math.floor(f)); return stops[i].clone().lerp(stops[i + 1], f - i); };
  const idx = [];
  for (let s = 0; s < S; s++) {
    const c = grad(strands[s].n);
    for (let m = 0; m < M; m++) {
      const v = s * M + m; uArr[v] = m / (M - 1); seedArr[v] = strands[s].seed; col.set([c.r, c.g, c.b], v * 3);
      if (m < M - 1) idx.push(v, v + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('u', new THREE.BufferAttribute(uArr, 1));
  geo.setAttribute('seed', new THREE.BufferAttribute(seedArr, 1));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);

  const uniforms = { uTime: { value: 0 }, uAlpha: { value: 0 }, uEnds: { value: 1 }, uTipGlow: { value: 0 } };
  const lineMat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float u; attribute float seed; attribute vec3 color;
      uniform float uTime, uEnds, uTipGlow; varying vec3 vC; varying float vA;
      void main(){
        float spark = smoothstep(.975, 1., fract(u * 1.6 - uTime * .22 + seed * 7.));
        float ends = mix(1., smoothstep(0., .12, u) * smoothstep(1., .88, u), uEnds);
        float tipHeat = 0.;
        vC = mix(color, vec3(1., .86, .6), max(spark * .9, tipHeat));
        vA = ends * (.32 + .3 * seed) * (1. - uTipGlow * .45 * smoothstep(.55, 1., u)) + spark * .85 * (1. - uTipGlow * .6);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }`,
    fragmentShader: /* glsl */`
      uniform float uAlpha; varying vec3 vC; varying float vA;
      void main(){ gl_FragColor = vec4(vC * 1.25, vA * uAlpha); }`
  });
  const lines = new THREE.LineSegments(geo, lineMat);

  /* glowing tips (only shown in the bundle) */
  const tipPos = new Float32Array(S * 3), tipHot = new Float32Array(S);
  for (let s = 0; s < S; s++) tipHot[s] = strands[s].tip[2];
  const tipGeo = new THREE.BufferGeometry();
  tipGeo.setAttribute('position', new THREE.BufferAttribute(tipPos, 3).setUsage(THREE.DynamicDrawUsage));
  tipGeo.setAttribute('hot', new THREE.BufferAttribute(tipHot, 1));
  const tipMat = new THREE.ShaderMaterial({
    uniforms: { uGlow: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uTime: uniforms.uTime },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float hot; uniform float uPR, uTime; varying float vHot;
      void main(){ vHot = hot; vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_PointSize = uPR * (26. + 5. * sin(uTime * 2. + position.x * 3.)) * (10. / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`
      uniform float uGlow; varying float vHot;
      void main(){ float r = length(gl_PointCoord - .5); float core = smoothstep(.18, 0., r), halo = smoothstep(.5, 0., r);
        vec3 c = mix(vec3(1., .78, .38), vec3(1., .45, .22), vHot);
        gl_FragColor = vec4(c * (core * 2.4 + halo * .9), min(1., core * 1.4 + halo * .7) * uGlow); }`
  });
  const tips = new THREE.Points(tipGeo, tipMat);
  lines.frustumCulled = false; // positions change every frame

  /* the mark, woven from fine parallel light strands (replaces any dots) */
  const MS = .085 * .74, mk = [], mu = [], mw = [], mo = [];
  const path = (pts, warm) => {
    let L = 0; const acc = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc.push(L); }
    for (let k = 0; k < 9; k++) {
      const off = (k - 4) * .011;
      for (let i = 0; i < pts.length - 1; i++) for (const j of [i, i + 1]) {
        const [x, y, nx, ny] = pts[j];
        mk.push((x - 20) * MS + nx * off, -(y - 20) * MS + ny * off, .6); mu.push(acc[j] / L); mw.push(warm); mo.push(Math.abs(k - 4) / 4);
      }
    }
  };
  const arc = []; for (let i = 0; i <= 140; i++) { const a = .5 + (i / 140) * (Math.PI * 2 - 1); arc.push([20 + 16 * Math.cos(a), 20 - 16 * Math.sin(a), Math.cos(a), Math.sin(a)]); }
  const line = (x0, y0, x1, y1, nx, ny) => { const r = []; for (let i = 0; i <= 30; i++) { const t = i / 30; r.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, nx, ny]); } return r; };
  path(arc, 0); path(line(14.5, 12.5, 14.5, 27.5, 1, 0), 0); path(line(25.5, 12.5, 25.5, 27.5, 1, 0), 0); path(line(14.5, 20, 39, 20, 0, 1), 1);
  const markGeo = new THREE.BufferGeometry();
  markGeo.setAttribute('position', new THREE.Float32BufferAttribute(mk, 3));
  markGeo.setAttribute('u', new THREE.Float32BufferAttribute(mu, 1));
  markGeo.setAttribute('warm', new THREE.Float32BufferAttribute(mw, 1));
  markGeo.setAttribute('edge', new THREE.Float32BufferAttribute(mo, 1));
  const markMat = new THREE.ShaderMaterial({
    uniforms: { uDraw: { value: 0 }, uShow: { value: 0 }, uTime: uniforms.uTime },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float u; attribute float warm; attribute float edge; varying float vU; varying float vW; varying float vE; varying float vY;
      void main(){ vU = u; vW = warm; vE = edge; vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */`
      uniform float uDraw, uShow, uTime; varying float vU; varying float vW; varying float vE; varying float vY;
      void main(){
        if (vU > uDraw) discard;
        float head = smoothstep(uDraw - .06, uDraw, vU) * step(uDraw, .999);
        float spark = smoothstep(.96, 1., fract(vU * .9 - uTime * .18));
        float t = clamp(vY * .7 + .5, 0., 1.);
        vec3 cool = mix(vec3(.43, .59, 1.), vec3(.66, .54, 1.), smoothstep(.0, .5, t));
        vec3 hue = mix(cool, vec3(1., .44, .66), smoothstep(.5, 1., t));
        hue = mix(hue, vec3(1., .48, .31), vW);
        float core = 1. - vE;
        vec3 c = mix(hue, vec3(1., .97, .94), core * .55 + head * .6 + spark * .5);
        gl_FragColor = vec4(c, (.25 + core * .75) * uShow * (1. + head + spark * .6));
      }`
  });
  const markLines = new THREE.LineSegments(markGeo, markMat); markLines.frustumCulled = false;
  const group = new THREE.Group(); group.add(lines, markLines); scene.add(group);

  /* ---------- scroll choreography ---------- */
  const secs = [...document.querySelectorAll('[data-fibers]')];
  const form = el => {
    const f = ((small && el.dataset.formM) || el.dataset.form || '0 0 1 0 .6').trim().split(/\s+/).map(Number);
    if (small && !el.dataset.formM && el.dataset.fibers === 'river') f[4] *= .35; // phones: keep fibres faint behind text
    return f;
  };
  const cur = { x: 0, y: 0, s: 1, r: 0, a: 0, ends: 0, tip: 0 };
  let A = 'ring', B = 'ring', q = 0;
  const read = () => {
    const mid = innerHeight * .5; let ai = 0;
    secs.forEach((el, i) => { if (el.getBoundingClientRect().top <= mid) ai = i; });
    const a = secs[ai], b = secs[ai + 1] || a, r = a.getBoundingClientRect();
    let k = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
    if (a.dataset.fibers === 'tangle') k = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); // sticky stage: follow its own progress
    const hold = a.dataset.hold ? +a.dataset.hold : .45; // stay in a shape, then morph into the next
    const kk = k < hold ? 0 : (k - hold) / (1 - hold);
    q = kk * kk * (3 - 2 * kk);
    if (a.dataset.fibers === 'tangle') { A = 'tangle'; B = 'river'; q = Math.min(1, k * 1.35); q = q * q * (3 - 2 * q); }
    else { A = a.dataset.fibers; B = b.dataset.fibers; }
    const fa = form(a), fb = a.dataset.fibers === 'tangle' ? fa : form(b);
    const L = (i) => fa[i] + (fb[i] - fa[i]) * q;
    return { x: L(0), y: L(1), s: L(2), r: L(3), a: L(4) };
  };

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  const o1 = [0, 0, 0], o2 = [0, 0, 0];
  let t = 0, last = performance.now(), markDraw = 0;
  const frame = now => {
    requestAnimationFrame(frame);
    if (document.hidden || document.documentElement.classList.contains('book-open')) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    const g = read(), f = 1 - Math.pow(.003, dt);
    cur.x += (g.x - cur.x) * f; cur.y += (g.y - cur.y) * f; cur.s += (g.s - cur.s) * f; cur.r += (g.r - cur.r) * f; cur.a += (g.a - cur.a) * f;
    const closed = s => s === 'ring' || s === 'loop';
    const endsGoal = (closed(A) ? 1 - q : 0) + (closed(B) ? q : 0), bundleW = (A === 'bundle' ? 1 - q : 0) + (B === 'bundle' ? q : 0);
    cur.ends += ((1 - endsGoal) * (1 - bundleW * .0) - cur.ends) * f; cur.tip += (bundleW - cur.tip) * f;

    const fa = shapes[A], fb = shapes[B];
    for (let s = 0; s < S; s++) {
      const st = strands[s];
      for (let m = 0; m < M; m++) {
        const u = m / (M - 1), v = (s * M + m) * 3;
        fa(st, u, t, o1); if (q > 0) { fb(st, u, t, o2); o1[0] += (o2[0] - o1[0]) * q; o1[1] += (o2[1] - o1[1]) * q; o1[2] += (o2[2] - o1[2]) * q; }
        pos[v] = o1[0]; pos[v + 1] = o1[1]; pos[v + 2] = o1[2];
      }
      const e = (s * M + M - 1) * 3; tipPos[s * 3] = pos[e]; tipPos[s * 3 + 1] = pos[e + 1]; tipPos[s * 3 + 2] = pos[e + 2];
    }
    geo.attributes.position.needsUpdate = true; tipGeo.attributes.position.needsUpdate = true;

    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    group.position.set(cur.x * halfH * camera.aspect, cur.y * halfH, 0);
    group.scale.setScalar(cur.s * (small ? .62 : 1));
    group.rotation.set(my * .12, mx * .2, cur.r);
    uniforms.uTime.value = t; uniforms.uAlpha.value = cur.a; uniforms.uEnds.value = cur.ends; uniforms.uTipGlow.value = cur.tip;
    markDraw = cur.tip > .85 ? Math.min(1, markDraw + dt * (reduce ? 9 : .55)) : Math.max(0, markDraw - dt * 1.5);
    const dE = 1 - Math.pow(1 - markDraw, 3);
    markMat.uniforms.uDraw.value = dE; markMat.uniforms.uShow.value = Math.min(1, cur.tip * 1.2) * Math.min(1, cur.a * 1.4);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}
