/* Black Apple Group · strands of light that follow the story of the page.
   Sections set data-light="canopy|path|loop|home" and data-form="x y scale angle alpha" (phones: data-form-m).
   canopy: a woven shelter of light over the family · path: a life line · loop: a ring around the coverage cards
   home: the strands draw the outline of a house at the end. Shapes blend into each other as you scroll. */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-light-canvas]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 80);
  camera.position.set(0, 0, 10);

  const S = small ? 70 : 110, M = small ? 90 : 130;
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const strands = [];
  for (let s = 0; s < S; s++) strands.push({ n: s / (S - 1), seed: rnd(), p1: rnd() * 6.28, p2: rnd() * 6.28, f1: .6 + rnd(), off: (rnd() - .5) });

  /* house outline: walls, roof and a door, measured so u runs evenly along it */
  const housePts = [[-1.7, -1.35], [-1.7, .35], [0, 1.75], [1.7, .35], [1.7, -1.35], [.38, -1.35], [.38, -.35], [-.38, -.35], [-.38, -1.35], [-1.7, -1.35]];
  const hLen = [0]; for (let i = 1; i < housePts.length; i++) hLen.push(hLen[i - 1] + Math.hypot(housePts[i][0] - housePts[i - 1][0], housePts[i][1] - housePts[i - 1][1]));
  const HL = hLen[hLen.length - 1];
  const onHouse = (u, o) => {
    const d = u * HL; let i = 1; while (i < hLen.length - 1 && hLen[i] < d) i++;
    const a = housePts[i - 1], b = housePts[i], k = (d - hLen[i - 1]) / (hLen[i] - hLen[i - 1] || 1);
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    o[0] = a[0] + dx * k; o[1] = a[1] + dy * k; o[3] = -dy / L; o[4] = dx / L;
  };

  const TAU = Math.PI * 2, tmp = [0, 0, 0, 0, 0];
  const shapes = {
    canopy(st, u, t, o) { // a soft arch of light over the family, like a promise
      const n = st.n - .5, a = u * Math.PI;
      const R = 3.05 + n * .62 * (1 + .45 * Math.sin(a * 3 + t * .4 + st.n * 2)) + .06 * Math.sin(a * 7 - t * .7 + st.p1);
      o[0] = Math.cos(a) * R * 1.08; o[1] = Math.sin(a) * R - 1.9; o[2] = n * .5 * Math.cos(a * 2 + t * .3);
    },
    path(st, u, t, o) { // a single calm life line, strands flowing together
      const x = (u - .5) * 15, n = st.n - .5, tw = 1 + .6 * Math.sin(x * .8 + t * .3 + st.n * 3);
      o[0] = x; o[1] = .7 * Math.sin(x * .5 + t * .4 + n * .3) + .25 * Math.sin(x * 1.2 - t * .3 + n) + n * .45 * tw;
      o[2] = n * .3 * Math.cos(x * .7 + t * .4);
    },
    loop(st, u, t, o) { // wide ring that carries the coverage cards
      const a = u * TAU, r = 3.15 + (st.n - .5) * .24 + .05 * Math.sin(a * 6 + t * .5 + st.n * 2);
      o[0] = Math.cos(a) * r; o[1] = Math.sin(a) * r * .3 + (st.n - .5) * .06; o[2] = Math.sin(a) * r * .5;
    },
    home(st, u, t, o) { // strands settle into the outline of a house
      onHouse(u, tmp);
      const w = st.off * .16 + .03 * Math.sin(u * 30 + t * 1.2 + st.p1);
      o[0] = tmp[0] + tmp[3] * w; o[1] = tmp[1] + tmp[4] * w; o[2] = st.off * .25;
    }
  };

  const V = S * M, pos = new Float32Array(V * 3), uArr = new Float32Array(V), seedArr = new Float32Array(V), col = new Float32Array(V * 3);
  const stops = ['#FFE3C6', '#F6A47C', '#E2788F', '#8FA6E6'].map(c => new THREE.Color(c));
  const grad = n => { const f = n * 3, i = Math.min(2, Math.floor(f)); return stops[i].clone().lerp(stops[i + 1], f - i); };
  const idx = [];
  for (let s = 0; s < S; s++) {
    const c = grad(strands[s].n);
    for (let m = 0; m < M; m++) { const v = s * M + m; uArr[v] = m / (M - 1); seedArr[v] = strands[s].seed; col.set([c.r, c.g, c.b], v * 3); if (m < M - 1) idx.push(v, v + 1); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('u', new THREE.BufferAttribute(uArr, 1));
  geo.setAttribute('seed', new THREE.BufferAttribute(seedArr, 1));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);

  const uniforms = { uTime: { value: 0 }, uAlpha: { value: 0 }, uEnds: { value: 1 }, uDraw: { value: reduce ? 1 : 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float u; attribute float seed; attribute vec3 color;
      uniform float uTime, uEnds, uDraw; varying vec3 vC; varying float vA;
      void main(){
        float spark = smoothstep(.975, 1., fract(u * 1.5 - uTime * .2 + seed * 7.));
        float ends = mix(1., smoothstep(0., .1, u) * smoothstep(1., .9, u), uEnds);
        float drawn = smoothstep(uDraw * 1.15 - .15, uDraw * 1.15 - .12, u);   // grows in from one end on load
        vC = mix(color, vec3(1., .95, .88), spark * .85);
        vA = ends * (1. - drawn) * ((.3 + .3 * seed) + spark * .9);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }`,
    fragmentShader: /* glsl */`
      uniform float uAlpha; varying vec3 vC; varying float vA;
      void main(){ gl_FragColor = vec4(vC * 1.2, vA * uAlpha); }`
  });
  const lines = new THREE.LineSegments(geo, mat); lines.frustumCulled = false;
  const group = new THREE.Group(); group.add(lines); scene.add(group);

  /* scroll choreography */
  const secs = [...document.querySelectorAll('[data-light]')];
  const form = el => ((small && el.dataset.formM) || el.dataset.form || '0 0 1 0 .6').trim().split(/\s+/).map(Number);
  const cur = { x: 0, y: 0, s: 1, r: 0, a: 0, ends: 0 };
  let A = 'canopy', B = 'canopy', q = 0;
  const read = () => {
    const mid = innerHeight * .5; let ai = 0;
    secs.forEach((el, i) => { if (el.getBoundingClientRect().top <= mid) ai = i; });
    const a = secs[ai], b = secs[ai + 1] || a, r = a.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
    const hold = a.dataset.hold ? +a.dataset.hold : .5, kk = k < hold ? 0 : (k - hold) / (1 - hold);
    q = kk * kk * (3 - 2 * kk); A = a.dataset.light; B = b.dataset.light;
    const fa = form(a), fb = form(b), L = i => fa[i] + (fb[i] - fa[i]) * q;
    return { x: L(0), y: L(1), s: L(2), r: L(3), a: L(4) };
  };
  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  const o1 = [0, 0, 0], o2 = [0, 0, 0];
  let t = 0, last = performance.now();
  const frame = now => {
    requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    uniforms.uDraw.value = Math.min(1, uniforms.uDraw.value + dt * .45);
    const g = read(), f = 1 - Math.pow(.004, dt);
    for (const k of ['x', 'y', 's', 'r', 'a']) cur[k] += (g[k] - cur[k]) * f;
    const closed = s => s === 'loop' || s === 'home';
    const endsGoal = 1 - ((closed(A) ? 1 - q : 0) + (closed(B) ? q : 0));
    cur.ends += (endsGoal - cur.ends) * f;
    const fa = shapes[A], fb = shapes[B];
    for (let s = 0; s < S; s++) {
      const st = strands[s];
      for (let m = 0; m < M; m++) {
        const u = m / (M - 1), v = (s * M + m) * 3;
        fa(st, u, t, o1); if (q > 0) { fb(st, u, t, o2); o1[0] += (o2[0] - o1[0]) * q; o1[1] += (o2[1] - o1[1]) * q; o1[2] += (o2[2] - o1[2]) * q; }
        pos[v] = o1[0]; pos[v + 1] = o1[1]; pos[v + 2] = o1[2];
      }
    }
    geo.attributes.position.needsUpdate = true;
    mx += (tmx - mx) * .05; my += (tmy - my) * .05;
    group.position.set(cur.x * halfH * camera.aspect, cur.y * halfH, 0);
    group.scale.setScalar(cur.s * (small ? .62 : 1));
    group.rotation.set(my * .1 + (A === 'canopy' ? .1 : 0), mx * .25 + Math.sin(t * .15) * .25, cur.r);
    uniforms.uTime.value = t; uniforms.uAlpha.value = cur.a; uniforms.uEnds.value = cur.ends;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
}
