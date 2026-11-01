/* Black Apple Group · "Lifelight": thousands of particles that tell the story while you scroll.
   Sections set data-fibers="ring|river|loop|bundle" with data-form="x y scale angle alpha" (phones: data-form-m).
   ring   → a slowly turning apple with glowing seeds inside (the brand, and what you pass on)
   river  → a heartbeat life-line drifting across the page
   loop   → a protective halo around the coverage cards
   bundle → the apple again, seeds blazing, at the close */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-fibers-canvas]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .1, 80);
  camera.position.set(0, 0, 10);

  const N = small ? 5200 : 11000, SEED_EVERY = 14;
  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const P = [];
  for (let i = 0; i < N; i++) P.push({ a: rnd(), b: rnd(), c: rnd(), d: rnd(), seed: i % SEED_EVERY === 0 });

  /* apple surface: lathe of a round profile with a stem cavity and a soft base dimple */
  const appleR = th => { const s = Math.sin(th), c = Math.cos(th); return [Math.max(0, c * (1 + .09 * s) * (1 - .05 * Math.max(0, -s))), s * .92 - .32 * Math.exp(-Math.pow((Math.PI / 2 - th) / .34, 2)) + .1 * Math.exp(-Math.pow((th + Math.PI / 2) / .3, 2))]; };
  const TAU = Math.PI * 2;
  const shapes = {
    ring(p, i, t, o) { // the apple
      const R = 2.35;
      if (p.seed) { // five seeds arranged like a real apple cross-section
        const k = (i / SEED_EVERY) % 5, ang = k / 5 * TAU + t * .25, along = p.a * .5, w = (p.b - .5) * .16 * (1 - along);
        const rr = .18 + along * .45;
        o[0] = Math.cos(ang) * rr - Math.sin(ang) * w; o[1] = Math.sin(ang) * rr + Math.cos(ang) * w - .05; o[2] = (p.c - .5) * .12;
        o[0] *= R * .62; o[1] *= R * .62; o[2] *= R; return;
      }
      if (p.d < .035) { // stem
        const s = p.a; o[0] = .05 * Math.sin(s * 2) + s * .12; o[1] = .55 + s * .55; o[2] = (p.b - .5) * .03; o[0] *= R; o[1] *= R; o[2] *= R; return;
      }
      const th = -Math.PI / 2 + p.a * Math.PI, ph = p.b * TAU + t * .18, [r, y] = appleR(th), j = 1 + (p.c - .5) * .035 + .012 * Math.sin(t * 1.4 + p.a * 20);
      o[0] = Math.cos(ph) * r * 1.03 * j * R; o[1] = y * R * j; o[2] = Math.sin(ph) * r * j * R;
    },
    river(p, i, t, o) { // heartbeat life-line
      const x = (p.a - .5) * 16, ph = x * .55 - t * 1.4, beat = ((ph % TAU) + TAU) % TAU;
      const pulse = Math.exp(-Math.pow((beat - 2.2) / .09, 2)) * 1.5 - Math.exp(-Math.pow((beat - 2.45) / .1, 2)) * .7 + Math.exp(-Math.pow((beat - 3.6) / .35, 2)) * .25;
      const spread = (p.b - .5) * (.12 + (p.seed ? .02 : .5) * Math.pow(p.c, 3));
      o[0] = x; o[1] = pulse + spread + .18 * Math.sin(x * .4 + t * .3); o[2] = (p.d - .5) * .8;
    },
    loop(p, i, t, o) { // protective halo
      const a = p.a * TAU + t * .08, r = 3.15 + (p.b - .5) * .3 * (1 + .6 * Math.sin(a * 3 + t * .5)) + .05 * Math.sin(a * 7 - t);
      o[0] = Math.cos(a) * r; o[1] = Math.sin(a) * r * .3 + (p.c - .5) * .1; o[2] = Math.sin(a) * r * .5;
    },
    bundle(p, i, t, o) { shapes.ring(p, i, t, o); o[0] *= .9; o[1] *= .9; o[2] *= .9; }
  };

  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sz = new Float32Array(N), seedA = new Float32Array(N);
  const stops = ['#F8D9AE', '#E9A15F', '#4FB3A9', '#3F78BA'].map(c => new THREE.Color(c)), seedC = new THREE.Color('#FFE7C2');
  for (let i = 0; i < N; i++) {
    const p = P[i]; let c;
    if (p.seed) c = seedC; else { const f = Math.min(.999, (p.a * .55 + p.d * .45)) * 3, k = Math.floor(f); c = stops[k].clone().lerp(stops[k + 1], f - k); }
    col.set([c.r, c.g, c.b], i * 3); sz[i] = p.seed ? 2.4 + p.c * 1.6 : 2.2 + Math.pow(p.c, 2.5) * 4.5; seedA[i] = p.seed ? 1 : 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('size', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('isSeed', new THREE.BufferAttribute(seedA, 1));
  const uni = { uAlpha: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uSeed: { value: 0 }, uTime: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 color; attribute float size; attribute float isSeed; uniform float uPR, uSeed, uTime; varying vec3 vC; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); float tw = .75 + .25 * sin(uTime * 2. + position.x * 4. + position.y * 3.);
        vC = color * (1. + isSeed * uSeed * .35); vA = mix(.8 * tw, .45 + uSeed * .45, isSeed);
        gl_PointSize = uPR * size * (1. + isSeed * uSeed * .5) * (9. / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uAlpha; varying vec3 vC; varying float vA;
      void main(){ float r = length(gl_PointCoord - .5); float a = smoothstep(.5, .0, r); gl_FragColor = vec4(vC, a * a * vA * uAlpha); }`
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  const group = new THREE.Group(); group.add(pts); scene.add(group);

  const secs = [...document.querySelectorAll('[data-fibers]')];
  const form = el => ((small && el.dataset.formM) || el.dataset.form || '0 0 1 0 .6').trim().split(/\s+/).map(Number);
  let A = 'ring', B = 'ring', q = 0;
  const read = () => {
    const mid = innerHeight * .5; let ai = 0;
    secs.forEach((el, i) => { if (el.getBoundingClientRect().top <= mid) ai = i; });
    const a = secs[ai], b = secs[ai + 1] || a, r = a.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height))), hold = a.dataset.hold ? +a.dataset.hold : .45;
    const kk = k < hold ? 0 : (k - hold) / (1 - hold); q = kk * kk * (3 - 2 * kk); A = a.dataset.fibers; B = b.dataset.fibers;
    const fa = form(a), fb = form(b), L = i => fa[i] + (fb[i] - fa[i]) * q;
    return { x: L(0), y: L(1), s: L(2), r: L(3), a: L(4) };
  };
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  const cur = { x: 0, y: 0, s: 1, r: 0, a: 0, seed: 0 }, o1 = [0, 0, 0], o2 = [0, 0, 0];
  let t = 0, last = performance.now(), intro = reduce ? 1 : 0;
  const frame = now => {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt; intro = Math.min(1, intro + dt * .45);
    const g = read(), f = 1 - Math.pow(.003, dt);
    for (const k of ['x', 'y', 's', 'r', 'a']) cur[k] += (g[k] - cur[k]) * f;
    const appleW = ((A === 'ring' || A === 'bundle') ? 1 - q : 0) + ((B === 'ring' || B === 'bundle') ? q : 0);
    cur.seed += (appleW * (A === 'bundle' || B === 'bundle' ? 1 : .75) - cur.seed) * f;
    const fa = shapes[A], fb = shapes[B], e = 1 - Math.pow(1 - intro, 3);
    for (let i = 0; i < N; i++) {
      const p = P[i]; fa(p, i, t, o1);
      if (q > 0) { fb(p, i, t, o2); o1[0] += (o2[0] - o1[0]) * q; o1[1] += (o2[1] - o1[1]) * q; o1[2] += (o2[2] - o1[2]) * q; }
      if (e < 1) { const sc = 1 + (1 - e) * (2 + p.d * 3); o1[0] *= sc; o1[1] *= sc; o1[2] = o1[2] * sc - (1 - e) * 4; }   // particles gather in on load
      pos[i * 3] = o1[0]; pos[i * 3 + 1] = o1[1]; pos[i * 3 + 2] = o1[2];
    }
    geo.attributes.position.needsUpdate = true;
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    group.position.set(cur.x * halfH * camera.aspect, cur.y * halfH, 0);
    group.scale.setScalar(cur.s * (small ? .62 : 1));
    group.rotation.set(my * .15 + .12 * appleW, mx * .35, cur.r);
    uni.uAlpha.value = cur.a * e; uni.uSeed.value = cur.seed; uni.uTime.value = t;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}
