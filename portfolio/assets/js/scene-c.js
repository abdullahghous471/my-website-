/* Helmwork · version C: "Inbox storm → order".
   Hundreds of 3D work items (emails, chats, calendar invites, tickets) tumble in a storm,
   then sort themselves into neat stacks as you scroll. Sections set
   data-state="storm|sorted|ring|flow|logo" and data-form="x y scale energy". */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-scene]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  camera.position.set(0, 0, 8.5);

  /* light: soft studio with a warm and a cool edge */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x20232a, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-3, 4, 6); scene.add(key);
  const warm = new THREE.PointLight(0xff6b3d, 9, 14, 1.6); warm.position.set(3.5, -1, 3); scene.add(warm);
  const cool = new THREE.PointLight(0x9aabff, 8, 14, 1.6); cool.position.set(-4, 2, 2); scene.add(cool);

  /* ---------- card faces drawn on canvas ---------- */
  const W = 320, H = 210, INK = '#14161A', MUTE = '#B9B8B2', PAPER = '#F3F2EE', EMBER = '#FF6B3D';
  const face = (draw) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = PAPER; g.beginPath(); g.roundRect(0, 0, W, H, 22); g.fill();
    draw(g); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  const line = (g, x, y, w, col = MUTE, h = 10) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); };
  const faces = [
    face(g => { // email
      g.strokeStyle = INK; g.lineWidth = 7; g.lineJoin = 'round';
      g.strokeRect(34, 40, 104, 74); g.beginPath(); g.moveTo(34, 42); g.lineTo(86, 84); g.lineTo(138, 42); g.stroke();
      line(g, 160, 46, 120, INK, 12); line(g, 160, 74, 96); line(g, 160, 98, 110);
      line(g, 34, 146, 250); line(g, 34, 170, 180);
      g.fillStyle = EMBER; g.beginPath(); g.arc(282, 30, 12, 0, 7); g.fill();
    }),
    face(g => { // chat
      g.fillStyle = INK; g.beginPath(); g.roundRect(30, 34, 190, 62, 28); g.fill();
      g.beginPath(); g.moveTo(52, 92); g.lineTo(40, 116); g.lineTo(78, 94); g.fill();
      line(g, 54, 56, 120, '#5B5E66'); line(g, 54, 74, 80, '#5B5E66');
      g.fillStyle = EMBER; g.beginPath(); g.roundRect(110, 122, 180, 54, 26); g.fill();
      line(g, 132, 142, 120, '#FFD3C2');
    }),
    face(g => { // calendar invite
      g.fillStyle = EMBER; g.beginPath(); g.roundRect(0, 0, W, 50, [22, 22, 0, 0]); g.fill();
      g.fillStyle = '#fff'; g.font = '600 24px system-ui, sans-serif'; g.fillText('Tue · 10:00', 26, 34);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { g.fillStyle = (r === 1 && k === 3) ? INK : '#D9D8D2'; g.beginPath(); g.roundRect(26 + k * 40, 72 + r * 40, 28, 28, 7); g.fill(); }
    }),
    face(g => { // support ticket
      g.fillStyle = INK; g.font = '600 26px ui-monospace, Menlo, monospace'; g.fillText('#2481', 30, 52);
      g.fillStyle = '#3DDC84'; g.beginPath(); g.roundRect(190, 28, 102, 34, 17); g.fill();
      g.fillStyle = '#0B3A20'; g.font = '600 18px system-ui, sans-serif'; g.fillText('Solved', 212, 51);
      line(g, 30, 92, 260, INK, 12); line(g, 30, 122, 220); line(g, 30, 146, 240); line(g, 30, 170, 150);
    })
  ];

  /* ---------- instanced cards ---------- */
  const N = small ? 120 : 240, PER = Math.ceil(N / 4);
  const box = new THREE.BoxGeometry(1, .66, .028);
  const side = new THREE.MeshStandardMaterial({ color: 0xd8d6cf, roughness: .6 });
  const meshes = faces.map(tex => {
    const front = new THREE.MeshStandardMaterial({ map: tex, roughness: .48, metalness: 0 });
    const back = new THREE.MeshStandardMaterial({ color: 0xe9e8e3, roughness: .55 });
    const m = new THREE.InstancedMesh(box, [side, side, side, side, front, back], PER);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; return m;
  });
  const group = new THREE.Group(); meshes.forEach(m => group.add(m)); scene.add(group);

  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const items = [];
  for (let i = 0; i < N; i++) {
    items.push({
      mesh: meshes[i % 4], slot: Math.floor(i / 4), i,
      s: [rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd()],
      p: new THREE.Vector3((rnd() - .5) * 8, (rnd() - .5) * 6, (rnd() - .5) * 4), q: new THREE.Quaternion(), sc: .001, tint: 0
    });
  }

  /* labels under the stacks */
  const label = (txt) => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d');
    g.fillStyle = '#EEEEEA'; g.font = '500 40px ui-monospace, Menlo, monospace'; g.textAlign = 'center'; g.fillText(txt, 256, 60);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false }));
    sp.scale.set(1.9, .36, 1); group.add(sp); return sp;
  };
  const labels = [label('REPLIED'), label('SCHEDULED'), label('DONE ✓')];

  /* ---------- states ---------- */
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), V = new THREE.Vector3();
  const TAU = Math.PI * 2;
  const mark = (() => { // points along the Helmwork mark for the logo state
    const pts = [];
    for (let i = 0; i < N; i++) {
      const u = i / N; let x, y, hot = 0;
      if (u < .52) { const a = .5 + (u / .52) * (TAU - 1); x = 20 + 16 * Math.cos(a); y = 20 - 16 * Math.sin(a); }
      else if (u < .7) { x = 14.5; y = 12.5 + ((u - .52) / .18) * 15; }
      else if (u < .86) { x = 25.5; y = 12.5 + ((u - .7) / .16) * 15; }
      else { x = 14.5 + ((u - .86) / .14) * 24.5; y = 20; hot = 1; }
      pts.push([(x - 20) * .11, -(y - 20) * .11, hot]);
    }
    return pts;
  })();
  const order = [...items].sort((a, b) => a.s[6] - b.s[6]); // which stack each item lands on
  order.forEach((it, k) => { it.stack = k % 3; it.level = Math.floor(k / 3); });

  const states = {
    storm(it, t, out) {
      const [a, b, c, d, e, f, g] = it.s, ang = a * TAU + t * (.35 + b * .55), r = .7 + c * 2.3;
      out.p.set(Math.cos(ang) * r, (d - .5) * 3.4 + Math.sin(t * .8 + a * 9) * .25, Math.sin(ang) * r * .7);
      E.set(t * (e - .5) * 1.6 + a * 6, ang + t * (f - .5), g * 6 + t * .3); out.q.setFromEuler(E);
      out.s = .62 + c * .25; out.tint = 0;
    },
    sorted(it, t, out) {
      const x = (it.stack - 1) * 1.55, lv = it.level, n = Math.ceil(N / 3);
      out.p.set(x + (it.s[0] - .5) * .04, -1.2 + lv * (2.3 / n), (it.s[1] - .5) * .03);
      E.set(-1.05, (it.s[2] - .5) * .08, (it.s[3] - .5) * .1); out.q.setFromEuler(E);
      out.s = 1; out.tint = 0;
    },
    ring(it, t, out) {
      const a = it.i / N * TAU + t * .22, R = 2.5;
      out.p.set(Math.cos(a) * R, Math.sin(a * 3 + t) * .12, Math.sin(a) * R);
      E.set(0, -a + Math.PI / 2, 0); out.q.setFromEuler(E); out.s = .5; out.tint = 0;
    },
    flow(it, t, out) {
      const u = (it.s[0] + t * .045) % 1, x = (u - .5) * 7;
      out.p.set(x, Math.sin(u * TAU * 1.5) * .45 + (it.s[1] - .5) * .5, (it.s[2] - .5) * 1.2);
      E.set(-.2 + Math.sin(u * 9) * .15, Math.cos(u * TAU) * .5, (it.s[3] - .5) * .5); out.q.setFromEuler(E);
      out.s = .55 * Math.sin(Math.PI * u); out.tint = 0;
    },
    logo(it, t, out) {
      const m = mark[it.i];
      out.p.set(m[0], m[1], Math.sin(t * 1.2 + it.i * .3) * .05);
      E.set(0, Math.sin(t * .6 + it.i * .1) * .25, 0); out.q.setFromEuler(E); out.s = .22; out.tint = m[2];
    }
  };

  /* ---------- scroll choreography ---------- */
  const stops = [...document.querySelectorAll('[data-form]')];
  const parse = el => ((small && el.dataset.formM) || el.dataset.form).trim().split(/\s+/).map(Number);
  const cur = { x: .38, y: 0, s: 1, e: 1 };
  let A = 'storm', B = 'storm', q = 0, sortedness = 0;
  const readGoal = () => {
    const mid = innerHeight * .5; let ai = 0;
    stops.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) ai = i; });
    const a = stops[ai], b = stops[ai + 1] || a, r = a.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
    // the storm → stacks change follows the scroll the whole way; others switch near the end of a section
    const stormToSort = a.dataset.state === 'storm' && b.dataset.state === 'sorted';
    const smooth = stormToSort ? Math.min(1, Math.max(0, -r.top / (r.height * .85))) : (k < .6 ? 0 : (k - .6) / .4);
    q = smooth * smooth * (3 - 2 * smooth);
    A = a.dataset.state || 'storm'; B = b.dataset.state || A;
    const fa = parse(a), fb = parse(b), m = small ? .9 : 1;
    return { x: (fa[0] + (fb[0] - fa[0]) * q) * m, y: fa[1] + (fb[1] - fa[1]) * q, s: fa[2] + (fb[2] - fa[2]) * q, e: fa[3] + (fb[3] - fa[3]) * q };
  };

  const inbox = document.querySelector('[data-inbox]');
  const mouseNDC = new THREE.Vector2(9, 9), ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), local = new THREE.Vector3();
  addEventListener('pointermove', e => mouseNDC.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)), { passive: true });
  document.addEventListener('pointerleave', () => mouseNDC.set(9, 9));

  const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); };
  addEventListener('resize', resize); resize();
  const halfW = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  const halfH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  const sa = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1, tint: 0 }, sb = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1, tint: 0 };
  const M = new THREE.Matrix4(), S3 = new THREE.Vector3(), white = new THREE.Color(1, 1, 1), ember = new THREE.Color('#FF6B3D'), C = new THREE.Color();
  let visible = true, t = 0, last = performance.now();
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += reduce ? 0 : dt;
    const g = readGoal(), f = 1 - Math.pow(.002, dt);
    cur.x += (g.x - cur.x) * f; cur.y += (g.y - cur.y) * f; cur.s += (g.s - cur.s) * f; cur.e += (g.e - cur.e) * f;
    const sc = (small ? .7 : 1) * cur.s;
    group.position.set(cur.x * halfW(), cur.y * halfH(), 0); group.scale.setScalar(Math.max(.0001, sc));
    const ringW = (A === 'ring' ? 1 - q : 0) + (B === 'ring' ? q : 0);
    group.rotation.set(.3 * ringW, (mouseNDC.x < 2 ? mouseNDC.x * .12 : 0), 0);
    group.updateMatrixWorld();

    // mouse in the group's space, to push cards aside
    let mx = 99, my = 99;
    if (mouseNDC.x < 2) { ray.setFromCamera(mouseNDC, camera); if (ray.ray.intersectPlane(plane, hit)) { local.copy(hit); group.worldToLocal(local); mx = local.x; my = local.y; } }

    const follow = reduce ? 1 : 1 - Math.pow(.035, dt);
    for (const it of items) {
      states[A](it, t, sa); states[B](it, t, sb);
      V.copy(sa.p).lerp(sb.p, q); Q.copy(sa.q).slerp(sb.q, q);
      const s = sa.s + (sb.s - sa.s) * q, tint = sa.tint + (sb.tint - sa.tint) * q;
      const dx = V.x - mx, dy = V.y - my, d = Math.hypot(dx, dy);
      if (d < 1.3) { const push = (1.3 - d) * .9 * (A === 'storm' ? 1 : .35); V.x += dx / (d || 1) * push; V.y += dy / (d || 1) * push; V.z += push * .6; }
      const fk = follow * (.6 + it.s[4] * .8);
      it.p.lerp(V, fk); it.q.slerp(Q, fk); it.sc += (s - it.sc) * fk; it.tint += (tint - it.tint) * fk;
      S3.setScalar(Math.max(.0001, it.sc)); M.compose(it.p, it.q, S3);
      it.mesh.setMatrixAt(it.slot, M);
      C.copy(white).lerp(ember, it.tint); it.mesh.setColorAt(it.slot, C);
    }
    meshes.forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });

    // stack labels and the inbox counter
    const sortedW = (A === 'sorted' ? 1 - q : 0) + (B === 'sorted' ? q : 0);
    labels.forEach((l, k) => { l.position.set((k - 1) * 1.55, -1.75, .2); l.material.opacity += (sortedW * .85 - l.material.opacity) * f; });
    const done = A === 'storm' && B === 'sorted' ? q : (A === 'storm' ? 0 : 1);
    sortedness += (done - sortedness) * f;
    if (inbox) inbox.textContent = Math.round(200 * (1 - sortedness));

    const lead = q < .5 ? A : B, bright = lead === 'storm' || lead === 'sorted' || lead === 'logo';
    canvas.style.opacity = sc < .02 ? 0 : (small && !bright ? .45 : 1);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  document.documentElement.classList.add('has-webgl');
}
