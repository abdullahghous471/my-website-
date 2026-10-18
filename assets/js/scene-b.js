/* Helmwork · version B: a particle field that re-forms into a new shape for each section.
   Sections set data-shape="sphere|galaxy|screen|ring|helix|network|logo" and data-form="x y scale energy". */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-scene]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  const N = small ? 4200 : 9000;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0, 8);

  const WARM = new THREE.Color('#FF6B3D'), COOL = new THREE.Color('#9AABFF'), WHITE = new THREE.Color('#EEEEEA');
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

  /* ---------- shapes: each returns positions (and optional colours) for N points ---------- */
  const base = i => { const t = rnd(); return t < .12 ? WARM : t < .55 ? COOL : WHITE; };
  const paint = (fn) => { const c = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const k = fn(i); c[i * 3] = k.r; c[i * 3 + 1] = k.g; c[i * 3 + 2] = k.b; } return c; };
  const baseCol = paint(base);

  const shapes = {
    sphere() {
      const p = new Float32Array(N * 3), g = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i, R = 1.45 + gauss() * .05;
        p.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
      }
      return { p };
    },
    galaxy() {
      const p = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const arm = i % 3, d = Math.pow(rnd(), .7) * 2.6, a = arm / 3 * Math.PI * 2 + d * 1.9 + gauss() * .32;
        p.set([Math.cos(a) * d, gauss() * .12 * (1.2 - d / 3), Math.sin(a) * d], i * 3);
      }
      return { p, tilt: [-.95, 0, .25] };
    },
    screen() {
      const p = new Float32Array(N * 3), cols = Math.round(Math.sqrt(N * 1.6)), rows = Math.ceil(N / cols);
      for (let i = 0; i < N; i++) {
        const cx = i % cols, cy = Math.floor(i / cols);
        p.set([(cx / (cols - 1) - .5) * 3.6, (cy / (rows - 1) - .5) * 2.25, gauss() * .02], i * 3);
      }
      return { p, tilt: [-.35, 0, 0] };
    },
    ring() {
      const p = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const a = rnd() * Math.PI * 2, b = rnd() * Math.PI * 2, R = 2.1, r = .07 + rnd() * .1;
        p.set([(R + r * Math.cos(b)) * Math.cos(a), r * Math.sin(b) + gauss() * .05, (R + r * Math.cos(b)) * Math.sin(a)], i * 3);
      }
      return { p, tilt: [.32, 0, 0] };
    },
    helix() {
      const p = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const strand = i % 2, t = rnd(), a = t * Math.PI * 6 + strand * Math.PI, r = .7;
        const rung = rnd() < .18;
        if (rung) { const k = Math.floor(t * 24) / 24, aa = k * Math.PI * 6, u = rnd() * 2 - 1; p.set([Math.cos(aa) * r * u, (k - .5) * 4, Math.sin(aa) * r * u], i * 3); }
        else p.set([Math.cos(a) * r + gauss() * .03, (t - .5) * 4, Math.sin(a) * r + gauss() * .03], i * 3);
      }
      return { p, tilt: [0, 0, -.5] };
    },
    network() {
      const p = new Float32Array(N * 3), hubs = [];
      for (let h = 0; h < 14; h++) hubs.push([gauss() * 2, gauss() * 1.4, gauss() * 1.2]);
      for (let i = 0; i < N; i++) {
        if (rnd() < .45) { const h = hubs[i % 14]; p.set([h[0] + gauss() * .09, h[1] + gauss() * .09, h[2] + gauss() * .09], i * 3); }
        else { const a = hubs[i % 14], b = hubs[(i * 7 + 3) % 14], t = rnd(); p.set([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], i * 3); }
      }
      return { p };
    },
    logo() { // the Helmwork mark: open ring, H, and the bar that leaves the ring
      const p = new Float32Array(N * 3), c = new Float32Array(N * 3), S = 2.1 / 20;
      for (let i = 0; i < N; i++) {
        const t = rnd(); let x, y, col = WHITE;
        if (t < .5) { const a0 = 0.5, a1 = Math.PI * 2 - 0.5, a = a0 + rnd() * (a1 - a0); x = 20 + 16 * Math.cos(a); y = 20 - 16 * Math.sin(a); }
        else if (t < .72) { x = 14.5; y = 12.5 + rnd() * 15; }
        else if (t < .86) { x = 25.5; y = 12.5 + rnd() * 15; }
        else { x = 14.5 + rnd() * 24.5; y = 20; col = WARM; }
        p.set([(x - 20) * S + gauss() * .025, -(y - 20) * S + gauss() * .025, gauss() * .05], i * 3);
        c.set([col.r, col.g, col.b], i * 3);
      }
      return { p, c };
    }
  };
  const cache = {}; const get = n => cache[n] || (cache[n] = shapes[n] ? shapes[n]() : shapes.sphere());

  /* ---------- points ---------- */
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(get('sphere').p), col = new Float32Array(baseCol), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) seed[i] = rnd();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));

  const uniforms = { uTime: { value: 0 }, uSize: { value: small ? 3.0 : 3.6 }, uPR: { value: renderer.getPixelRatio() }, uMouse: { value: new THREE.Vector3(99, 99, 0) }, uEnergy: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uSize, uPR, uEnergy; uniform vec3 uMouse;
      attribute float seed; attribute vec3 color; varying vec3 vC; varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * (.6 + seed * .6);
        p += vec3(sin(t + seed * 40.), cos(t * .9 + seed * 30.), sin(t * .7 + seed * 20.)) * .025 * uEnergy;
        vec4 w = modelMatrix * vec4(p, 1.);
        vec3 d = w.xyz - uMouse; float dist = length(d.xy);
        w.xyz += normalize(d + vec3(0.,0.,.001)) * smoothstep(1.1, 0., dist) * .55;
        vec4 mv = viewMatrix * w;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPR * (0.6 + seed * .9) * (8. / -mv.z);
        vC = color; vA = .55 + seed * .45;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vC; varying float vA;
      void main(){
        vec2 q = gl_PointCoord - .5; float r = length(q);
        float a = smoothstep(.5, 0., r); a *= a;
        gl_FragColor = vec4(vC * 1.45, min(1., a * vA * 1.25));
      }`
  });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group(); group.add(points); scene.add(group);

  /* ---------- scroll choreography ---------- */
  const stops = [...document.querySelectorAll('[data-form]')];
  const parse = el => el.dataset.form.trim().split(/\s+/).map(Number);
  const cur = { x: .35, y: 0, s: 1, e: 1, rx: 0, rz: 0 }, goal = { ...cur };
  let shapeName = 'sphere', target = get('sphere'), targetCol = baseCol;
  const setShape = n => {
    if (n === shapeName) return; shapeName = n; target = get(n); targetCol = target.c || baseCol;
  };
  const readGoal = () => {
    if (!stops.length) return;
    const mid = innerHeight * .5; let a = stops[0];
    for (const s of stops) if (s.getBoundingClientRect().top <= mid) a = s;
    const A = parse(a);
    goal.x = small ? A[0] * .9 : A[0]; goal.y = A[1]; goal.s = A[2]; goal.e = A[3];
    setShape(a.dataset.shape || 'sphere');
    const tl = target.tilt || [0, 0, 0]; goal.rx = tl[0]; goal.rz = tl[2];
  };

  const mouseNDC = new THREE.Vector2(9, 9), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  addEventListener('pointermove', e => { mouseNDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)); }, { passive: true });
  addEventListener('pointerleave', () => mouseNDC.set(9, 9));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const halfW = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  const halfH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  let visible = true, t = 0, last = performance.now();
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    readGoal();
    const f = 1 - Math.pow(.002, dt);
    for (const k of ['x', 'y', 's', 'e', 'rx', 'rz']) cur[k] += (goal[k] - cur[k]) * f;

    // particles travel to the new shape, each at its own pace
    const tp = target.p, k = reduce ? 1 : 1 - Math.pow(.06, dt);
    for (let i = 0; i < N * 3; i += 3) {
      const sp = k * (.55 + seed[i / 3] * .9);
      pos[i] += (tp[i] - pos[i]) * sp; pos[i + 1] += (tp[i + 1] - pos[i + 1]) * sp; pos[i + 2] += (tp[i + 2] - pos[i + 2]) * sp;
      col[i] += (targetCol[i] - col[i]) * k; col[i + 1] += (targetCol[i + 1] - col[i + 1]) * k; col[i + 2] += (targetCol[i + 2] - col[i + 2]) * k;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;

    const sc = (small ? .72 : 1) * cur.s;
    group.position.set(cur.x * halfW(), cur.y * halfH(), 0);
    group.scale.setScalar(Math.max(.0001, sc));
    const spin = shapeName === 'logo' || shapeName === 'screen' ? 0 : t * .12;
    points.rotation.set(cur.rx + Math.sin(t * .3) * .05, spin + mouseNDC.x * (mouseNDC.x < 2 ? .15 : 0), cur.rz);
    if (shapeName === 'logo' || shapeName === 'screen') points.rotation.y = Math.sin(t * .4) * .18;

    ray.setFromCamera(mouseNDC.x > 2 ? new THREE.Vector2(9, 9) : mouseNDC, camera);
    if (mouseNDC.x < 2 && ray.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(hit); else uniforms.uMouse.value.set(99, 99, 0);
    uniforms.uTime.value = t; uniforms.uEnergy.value = cur.e;
    canvas.style.opacity = sc < .02 ? 0 : (small && cur.s < .8 ? .5 : 1);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  document.documentElement.classList.add('has-webgl');
}
