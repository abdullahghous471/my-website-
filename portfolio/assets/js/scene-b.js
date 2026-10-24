/* Helmwork · version B: an AI / IT particle system.
   ~11k particles re-form per section into a brain, a neural network, a chart, a data ring,
   a microchip, a globe, a chat bubble and the Helmwork logo. Signal pulses run through each shape.
   Sections set data-shape="brain|neural|bars|ring|chip|globe|chat|logo" and data-form="x y scale energy". */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-scene]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  const N = small ? 5200 : 11000;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0, 8);

  const TAU = Math.PI * 2;
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const C = { blue: new THREE.Color('#8FA2FF'), cyan: new THREE.Color('#6FE3F5'), white: new THREE.Color('#EEF0FF'), ember: new THREE.Color('#FF6B3D') };
  const baseCol = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const t = rnd(), k = t < .07 ? C.ember : t < .42 ? C.cyan : t < .8 ? C.blue : C.white; baseCol.set([k.r, k.g, k.b], i * 3); }

  /* ---------- shapes: positions p, pulse coordinate u (−1 = no pulse), optional colours c ---------- */
  const make = (fill, opts = {}) => {
    const p = new Float32Array(N * 3), u = new Float32Array(N).fill(-1);
    for (let i = 0; i < N; i++) { const r = fill(i); p.set([r[0], r[1], r[2]], i * 3); if (r[3] !== undefined) u[i] = r[3]; }
    return { p, u, ...opts };
  };
  const onSeg = (a, b, t, j = .012) => [a[0] + (b[0] - a[0]) * t + gauss() * j, a[1] + (b[1] - a[1]) * t + gauss() * j, a[2] + (b[2] - a[2]) * t + gauss() * j];

  const shapes = {
    brain: () => make(() => {
      const r = rnd();
      if (r < .09) { // cerebellum
        const d = new THREE.Vector3(gauss(), gauss(), gauss()).normalize();
        return [d.x * .75, -.72 + d.y * .38, -.95 + d.z * .45, rnd()];
      }
      if (r < .12) { const t = rnd(); return [gauss() * .1, -.55 - t * .8, -.35 - t * .25 + gauss() * .05, rnd()]; } // stem
      const d = new THREE.Vector3(gauss(), gauss(), gauss()).normalize();
      const h = d.x >= 0 ? 1 : -1;
      let x = d.x * 1.12, y = d.y * 1.0, z = d.z * 1.42;
      const fold = 1 + .085 * Math.sin(9 * d.y + 4 * d.z) * Math.cos(8 * d.z + 6 * d.x * h) + .04 * Math.sin(17 * d.y - 11 * d.z);
      x *= fold; y *= fold; z *= fold;
      if (Math.abs(d.x) < .2) x = h * (.07 + Math.abs(x) * .55); // central fissure
      x += h * .06;
      if (y < -.35) y = -.35 + (y + .35) * .55; // flatter base
      if (d.z > .3 && d.y < 0) y -= .12 * d.z;  // temporal lobe
      return [x, y + .12, z, rnd()];
    }, { tilt: [.18, .95, 0], spin: 'sway', freq: 1, speed: .55 }),

    neural: () => {
      const layers = [4, 6, 7, 6, 3], L = layers.length, nodes = [];
      layers.forEach((n, l) => { for (let k = 0; k < n; k++) nodes.push({ l, pos: [(l - (L - 1) / 2) * 1.05, (k - (n - 1) / 2) * .48, (rnd() - .5) * .4] }); });
      const byL = l => nodes.filter(n => n.l === l);
      return make(() => {
        if (rnd() < .3) { const n = nodes[Math.floor(rnd() * nodes.length)]; return [n.pos[0] + gauss() * .045, n.pos[1] + gauss() * .045, n.pos[2] + gauss() * .045, (n.l + .5) / L]; }
        const l = Math.floor(rnd() * (L - 1)), A = byL(l), B = byL(l + 1);
        const a = A[Math.floor(rnd() * A.length)].pos, b = B[Math.floor(rnd() * B.length)].pos, t = rnd();
        return [...onSeg(a, b, t, .006), (l + t) / L];
      }, { tilt: [0, -.35, 0], spin: 'sway', freq: 1, speed: .4 });
    },

    bars: () => {
      const hs = [.55, .8, .7, 1.1, 1.35, 1.7, 2.2], w = .32;
      return make(() => {
        if (rnd() < .12) return [(rnd() - .5) * 4.2, -1.1, (rnd() - .5) * 1.4, -1]; // floor grid
        const k = Math.floor(rnd() * hs.length), h = hs[k], cx = (k - 3) * .56, face = Math.floor(rnd() * 4), a = rnd() - .5, y = rnd() * h;
        const x = face < 2 ? cx + a * w : cx + (face === 2 ? -w / 2 : w / 2), z = face < 2 ? (face ? w / 2 : -w / 2) : a * w;
        return [x, -1.1 + y, z, y / 2.4 + k * .02];
      }, { tilt: [.22, -.32, 0], spin: 'sway', freq: 1, speed: .5 });
    },

    ring: () => make(i => {
      const R = 2.15;
      if (rnd() < .22) { const k = Math.floor(rnd() * 9), a = k / 9 * TAU; return [Math.cos(a) * R + gauss() * .06, gauss() * .06, Math.sin(a) * R + gauss() * .06, k / 9]; }
      const a = rnd() * TAU, b = rnd() * TAU, r = .03 + rnd() * .05;
      return [(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b), (R + r * Math.cos(b)) * Math.sin(a), a / TAU];
    }, { tilt: [.32, 0, 0], spin: 'turn', freq: 3, speed: .3 }),

    chip: () => {
      const S = .55, traces = [];
      for (let side = 0; side < 4; side++) for (let k = 0; k < 6; k++) {
        const off = (k - 2.5) * .17, len = .5 + rnd() * .9, bend = .25 + rnd() * .5, dir = rnd() < .5 ? 1 : -1;
        const rot = ([x, y]) => side === 0 ? [x, y] : side === 1 ? [-y, x] : side === 2 ? [-x, -y] : [y, -x];
        const p0 = rot([S, off]), p1 = rot([S + bend, off]), p2 = rot([S + bend + len * .6, off + dir * len * .4]);
        traces.push([[...p0, 0], [...p1, 0], [...p2, 0]]);
      }
      return make(() => {
        const r = rnd();
        if (r < .2) { const e = Math.floor(rnd() * 4), t = rnd() * 2 - 1; const pts = [[t * S, S], [t * S, -S], [S, t * S], [-S, t * S]][e]; return [pts[0], pts[1], gauss() * .015, -1]; }
        if (r < .32) { const g = 6, gx = Math.floor(rnd() * g), gy = Math.floor(rnd() * g); return [(gx / (g - 1) - .5) * S * 1.5 + gauss() * .015, (gy / (g - 1) - .5) * S * 1.5 + gauss() * .015, .02, -1]; }
        const tr = traces[Math.floor(rnd() * traces.length)];
        if (rnd() < .12) { const a = rnd() * TAU; return [tr[2][0] + Math.cos(a) * .06, tr[2][1] + Math.sin(a) * .06, 0, 1]; } // via
        const t = rnd() * 2, seg = t < 1 ? 0 : 1, f = t - seg;
        return [...onSeg(tr[seg], tr[seg + 1], f, .008), t / 2];
      }, { tilt: [-.55, 0, .12], spin: 'sway', freq: 1, speed: .55 });
    },

    globe: () => {
      const city = () => { const la = (rnd() - .5) * 2.2, lo = rnd() * TAU; return new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)); };
      const arcs = []; for (let k = 0; k < 9; k++) arcs.push([city(), city()]);
      const R = 1.45, V = new THREE.Vector3();
      return make(() => {
        if (rnd() < .68) { // dotted sphere on a lat/long grid
          const la = (Math.round((rnd() - .5) * 36) / 36) * Math.PI, lo = rnd() * TAU;
          return [Math.cos(la) * Math.cos(lo) * R, Math.sin(la) * R, Math.cos(la) * Math.sin(lo) * R, -1];
        }
        const [a, b] = arcs[Math.floor(rnd() * arcs.length)], t = rnd();
        V.copy(a).lerp(b, t).normalize().multiplyScalar(R * (1 + Math.sin(Math.PI * t) * .32));
        return [V.x, V.y, V.z, t];
      }, { tilt: [.25, 0, 0], spin: 'turn', freq: 1, speed: .5 });
    },

    chat: () => make(() => {
      const r = rnd(), w = 1.7, h = 1.05, rad = .32;
      if (r < .62) { // outline of a rounded bubble
        const per = rnd() * (2 * (w - 2 * rad) + 2 * (h - 2 * rad) + TAU * rad); let d = per, x, y;
        const sx = w - 2 * rad, sy = h - 2 * rad;
        if (d < sx) { x = -sx / 2 + d; y = h / 2; } else if ((d -= sx) < TAU * rad / 4) { const a = d / rad; x = sx / 2 + Math.sin(a) * rad; y = sy / 2 + Math.cos(a) * rad; }
        else if ((d -= TAU * rad / 4) < sy) { x = w / 2; y = sy / 2 - d; } else if ((d -= sy) < TAU * rad / 4) { const a = d / rad; x = sx / 2 + Math.cos(a) * rad; y = -sy / 2 - Math.sin(a) * rad; }
        else if ((d -= TAU * rad / 4) < sx) { x = sx / 2 - d; y = -h / 2; } else if ((d -= sx) < TAU * rad / 4) { const a = d / rad; x = -sx / 2 - Math.sin(a) * rad; y = -sy / 2 - Math.cos(a) * rad; }
        else if ((d -= TAU * rad / 4) < sy) { x = -w / 2; y = -sy / 2 + d; } else { d -= sy; const a = d / rad; x = -sx / 2 - Math.cos(a) * rad; y = sy / 2 + Math.sin(a) * rad; }
        return [x + gauss() * .012, y + gauss() * .012, gauss() * .03, -1];
      }
      if (r < .72) { const t = rnd(); return [...onSeg([-.35, -h / 2, 0], [-.62, -h / 2 - .38, 0], t, .01), -1]; } // tail
      if (r < .82) { const t = rnd(); return [...onSeg([-.62, -h / 2 - .38, 0], [-.05, -h / 2, 0], t, .01), -1]; }
      const k = Math.floor(rnd() * 3), a = rnd() * TAU, rr = Math.sqrt(rnd()) * .11; // typing dots
      return [(k - 1) * .42 + Math.cos(a) * rr, Math.sin(a) * rr, 0, k / 3 + .001];
    }, { tilt: [0, 0, 0], spin: 'sway', freq: 1, speed: .9 }),

    logo: () => {
      const c = new Float32Array(N * 3), S = 2.1 / 20;
      const shp = make(i => {
        const t = rnd(); let x, y, col = C.white, u = -1;
        if (t < .5) { const a = .5 + rnd() * (TAU - 1); x = 20 + 16 * Math.cos(a); y = 20 - 16 * Math.sin(a); }
        else if (t < .72) { x = 14.5; y = 12.5 + rnd() * 15; }
        else if (t < .86) { x = 25.5; y = 12.5 + rnd() * 15; }
        else { const f = rnd(); x = 14.5 + f * 24.5; y = 20; col = C.ember; u = f; }
        c.set([col.r, col.g, col.b], i * 3);
        return [(x - 20) * S + gauss() * .02, -(y - 20) * S + gauss() * .02, gauss() * .04, u];
      }, { tilt: [0, 0, 0], spin: 'sway', freq: 1, speed: .45 });
      shp.c = c; return shp;
    }
  };
  const cache = {}; const get = n => cache[n] || (cache[n] = (shapes[n] || shapes.brain)());

  /* ---------- points ---------- */
  const geo = new THREE.BufferGeometry();
  const first = get('brain');
  const pos = new Float32Array(N * 3); for (let i = 0; i < N * 3; i++) pos[i] = first.p[i] + (rnd() - .5) * 6; // start scattered, gather on load
  const col = new Float32Array(baseCol), seed = new Float32Array(N), uAttr = new Float32Array(first.u);
  for (let i = 0; i < N; i++) seed[i] = rnd();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('pulse', new THREE.BufferAttribute(uAttr, 1));

  const uniforms = {
    uTime: { value: 0 }, uSize: { value: small ? 2.8 : 3.2 }, uPR: { value: renderer.getPixelRatio() },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uEnergy: { value: 1 }, uFreq: { value: 1 }, uSpeed: { value: .5 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uSize, uPR, uEnergy, uFreq, uSpeed; uniform vec3 uMouse;
      attribute float seed; attribute float pulse; attribute vec3 color;
      varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * (.5 + seed * .6);
        p += vec3(sin(t + seed * 40.), cos(t * .9 + seed * 30.), sin(t * .7 + seed * 20.)) * .018 * uEnergy;
        vec4 w = modelMatrix * vec4(p, 1.);
        vec3 d = w.xyz - uMouse; float dist = length(d.xy);
        w.xyz += normalize(d + vec3(0., 0., .001)) * smoothstep(1.1, 0., dist) * .6;
        vec4 mv = viewMatrix * w;
        gl_Position = projectionMatrix * mv;
        float glow = 0.;
        if (pulse >= 0.) { float wv = fract(pulse * uFreq - uTime * uSpeed); glow = smoothstep(.88, 1., wv); }
        gl_PointSize = uSize * uPR * (.55 + seed * .8 + glow * 1.6) * (8. / -mv.z);
        vC = mix(color, vec3(1., .78, .62), glow * .85);
        vA = (.42 + seed * .4) + glow * .9;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vC; varying float vA;
      void main(){
        float r = length(gl_PointCoord - .5);
        float a = smoothstep(.5, 0., r); a *= a;
        gl_FragColor = vec4(vC * 1.35, min(1., a * vA));
      }`
  });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group(); group.add(points); scene.add(group);

  /* ---------- scroll choreography ---------- */
  const stops = [...document.querySelectorAll('[data-form]')];
  const parse = el => ((small && el.dataset.formM) || el.dataset.form).trim().split(/\s+/).map(Number);
  const cur = { x: .35, y: 0, s: 1, e: 1, rx: .18, ry: .95, rz: 0, f: 1, sp: .55 }, goal = { ...cur };
  let shapeName = 'brain', target = first, targetCol = baseCol;
  const setShape = n => {
    if (n === shapeName) return; shapeName = n; target = get(n); targetCol = target.c || baseCol;
    uAttr.set(target.u); geo.attributes.pulse.needsUpdate = true;
  };
  const readGoal = () => {
    if (!stops.length) return;
    const mid = innerHeight * .5; let a = stops[0];
    for (const s of stops) if (s.getBoundingClientRect().top <= mid) a = s;
    const A = parse(a);
    goal.x = small ? A[0] * .9 : A[0]; goal.y = A[1]; goal.s = A[2]; goal.e = A[3];
    setShape(a.dataset.shape || 'brain');
    const tl = target.tilt || [0, 0, 0]; goal.rx = tl[0]; goal.ry = tl[1]; goal.rz = tl[2];
    goal.f = target.freq || 1; goal.sp = target.speed || .5;
  };

  const mouseNDC = new THREE.Vector2(9, 9), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  addEventListener('pointermove', e => mouseNDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)), { passive: true });
  document.addEventListener('pointerleave', () => mouseNDC.set(9, 9));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const halfW = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  const halfH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  let visible = true, t = 0, spinT = 0, last = performance.now();
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    readGoal();
    const f = 1 - Math.pow(.002, dt);
    for (const k of ['x', 'y', 's', 'e', 'rx', 'ry', 'rz', 'f', 'sp']) cur[k] += (goal[k] - cur[k]) * f;

    const tp = target.p, k = reduce ? 1 : 1 - Math.pow(.05, dt);
    for (let i = 0, j = 0; i < N * 3; i += 3, j++) {
      const sp = k * (.5 + seed[j] * .9);
      pos[i] += (tp[i] - pos[i]) * sp; pos[i + 1] += (tp[i + 1] - pos[i + 1]) * sp; pos[i + 2] += (tp[i + 2] - pos[i + 2]) * sp;
      col[i] += (targetCol[i] - col[i]) * k; col[i + 1] += (targetCol[i + 1] - col[i + 1]) * k; col[i + 2] += (targetCol[i + 2] - col[i + 2]) * k;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;

    const sc = (small ? .72 : 1) * cur.s;
    group.position.set(cur.x * halfW(), cur.y * halfH(), 0);
    group.scale.setScalar(Math.max(.0001, sc));
    const mx = mouseNDC.x < 2 ? mouseNDC.x : 0, my = mouseNDC.x < 2 ? mouseNDC.y : 0;
    if (target.spin === 'turn') spinT += dt * .18;
    else spinT += (Math.round(spinT / TAU) * TAU - spinT) * f; // settle flat shapes back to face the viewer
    const sway = target.spin === 'sway' ? Math.sin(t * .35) * .28 : 0;
    points.rotation.set(cur.rx - my * .12, cur.ry + spinT + sway + mx * .25, cur.rz);

    if (mouseNDC.x < 2) { ray.setFromCamera(mouseNDC, camera); if (ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit); }
    else uniforms.uMouse.value.set(99, 99, 0);
    uniforms.uTime.value = t; uniforms.uEnergy.value = cur.e; uniforms.uFreq.value = cur.f; uniforms.uSpeed.value = cur.sp;
    canvas.style.opacity = sc < .02 ? 0 : (small && cur.s < .8 ? .5 : 1);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  document.documentElement.classList.add('has-webgl');
}
