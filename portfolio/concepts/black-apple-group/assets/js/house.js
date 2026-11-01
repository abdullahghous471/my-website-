/* Black Apple Group · "Your protection, deconstructed"
   A modern family home on a dark studio stage, driven by scroll:
   1 unveil (a silk sheet slides off) · 2 exploded view (each layer = a type of cover, labelled)
   3 cutaway (layers settle, front walls open onto warm rooms) · 4 pull back. */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-scene]');
const story = document.querySelector('[data-story]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  const small = () => innerWidth < 860;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0b0b0d, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0b0d, 34, 70);
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 150);

  /* studio reflections: soft boxes baked into an environment map */
  const pm = new THREE.PMREMGenerator(renderer), studio = new THREE.Scene();
  studio.background = new THREE.Color(0x050506);
  const box = (w, h, c, p, r) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(...p); m.rotation.set(...r); studio.add(m); };
  box(14, 6, 0xfff3e6, [-4, 9, 4], [-Math.PI / 2.4, 0, .2]);   // big warm soft box above
  box(2, 10, 0xd8e4f2, [9, 2, -2], [0, -1.2, 0]);              // cool strip right
  box(1.5, 9, 0xffe2c2, [-9, 2, 3], [0, 1.2, 0]);              // warm strip left
  box(20, 3, 0x2a2724, [0, -3, 0], [Math.PI / 2, 0, 0]);       // floor bounce
  scene.environment = pm.fromScene(studio, .03).texture;

  /* lights */
  const key = new THREE.DirectionalLight(0xffe9d4, 2.4); key.position.set(-7, 12, 9); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); key.shadow.bias = -.0004; key.shadow.normalBias = .03;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb8d6, 1.6); rim.position.set(6, 5, -9); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0x8090a0, 0x15120f, .35));

  /* materials */
  const tex = (draw, rep = [1, 1]) => { const c = document.createElement('canvas'); c.width = c.height = 512; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; };
  const woodTex = tex(g => { for (let i = 0; i < 32; i++) { const l = 52 + Math.random() * 14; g.fillStyle = `hsl(28,${34 + Math.random() * 8}%,${l * .62}%)`; g.fillRect(i * 16, 0, 16, 512); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(i * 16 + 15, 0, 1, 512); for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(255,230,200,${Math.random() * .06})`; g.fillRect(i * 16 + Math.random() * 14, Math.random() * 512, 1, 40 + Math.random() * 120); } } }, [2, 1]);
  const concTex = tex(g => { g.fillStyle = '#9c9a95'; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .05})`; g.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); } g.strokeStyle = 'rgba(0,0,0,.12)'; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.stroke(); } });
  const floorTex = tex(g => { for (let i = 0; i < 16; i++) { g.fillStyle = `hsl(30,28%,${30 + Math.random() * 8}%)`; g.fillRect(0, i * 32, 512, 32); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, i * 32 + 31, 512, 1); } }, [2, 2]);
  const M = {
    render: new THREE.MeshStandardMaterial({ color: 0xeeebe4, roughness: .78 }),
    wood: new THREE.MeshStandardMaterial({ map: woodTex, roughness: .62 }),
    conc: new THREE.MeshStandardMaterial({ map: concTex, roughness: .9 }),
    roof: new THREE.MeshStandardMaterial({ color: 0x2b2c2f, roughness: .55, metalness: .2 }),
    frame: new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: .4, metalness: .6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0e1418, roughness: .05, metalness: .1, clearcoat: 1, envMapIntensity: 1.6, transparent: true, opacity: .55 }),
    floorIn: new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0xb9b1a4, roughness: .95 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: .7 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x241a10, emissive: 0xffc58a, emissiveIntensity: 0 }),
    vault: new THREE.MeshStandardMaterial({ color: 0x3b3a38, roughness: .3, metalness: .9 }),
    vaultGlow: new THREE.MeshStandardMaterial({ color: 0x1a120a, emissive: 0xffd5a0, emissiveIntensity: 0 })
  };
  const mk = (geo, m, x, y, z, parent, cast = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; parent.add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  /* ---------- stage ---------- */
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 96), new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .28, metalness: .35, envMapIntensity: .6 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const plinth = mk(new THREE.CylinderGeometry(7.2, 7.4, .18, 96), new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: .4, metalness: .3 }), 0, .09, 0, scene, false);
  // light bars crossing in the back (like a studio set)
  const barMat = new THREE.MeshBasicMaterial({ color: 0xfff2e2 });
  const bar1 = mk(B(16, .07, .07), barMat, -1, 9, -10, scene, false); bar1.rotation.z = .5;
  const bar2 = mk(B(16, .07, .07), barMat, 2, 7.5, -11, scene, false); bar2.rotation.z = -.38;
  const haze = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,240,225,.55)'); gr.addColorStop(1, 'rgba(255,240,225,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  [[-1, 9, -10.5, 14, 4], [2, 7.5, -11.5, 12, 3], [0, 4, -6, 22, 9]].forEach(([x, y, z, w, h], i) => { const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: haze, transparent: true, depthWrite: false, opacity: i === 2 ? .12 : .35, blending: THREE.AdditiveBlending })); s.position.set(x, y, z); s.rotation.z = i === 0 ? .5 : i === 1 ? -.38 : 0; scene.add(s); });

  /* ---------- the house: five layers that can explode ---------- */
  const house = new THREE.Group(); house.position.y = .18; scene.add(house); house.rotation.y = -.42;
  const L = { vault: new THREE.Group(), found: new THREE.Group(), ground: new THREE.Group(), upper: new THREE.Group(), roof: new THREE.Group() };
  Object.values(L).forEach(g => house.add(g));
  const fronts = [];  // front walls that open in the cutaway
  const lamps = [];   // warm interior lights
  // vault (whole life & cash value)
  mk(B(1.2, .8, 1), M.vault, 0, .45, 0, L.vault); mk(new THREE.CylinderGeometry(.22, .22, .06, 32).rotateX(Math.PI / 2), M.vaultGlow, 0, .45, .52, L.vault, false);
  const vaultLight = new THREE.PointLight(0xffcf9a, 0, 4, 2); vaultLight.position.set(0, .6, 1); L.vault.add(vaultLight);
  // foundation (final expense)
  mk(B(7, .45, 4.8), M.conc, 0, .22, 0, L.found);
  mk(B(2.2, .12, 1.4), M.conc, -1.6, .06, 2.9, L.found);  // entrance step
  // ground floor (income replacement): wood floor, back & side walls, glass front
  const G = L.ground; const gH = 2.6;
  mk(B(6.8, .1, 4.6), M.floorIn, 0, .05, 0, G);
  mk(B(6.8, gH, .2), M.render, 0, gH / 2, -2.2, G);
  mk(B(.2, gH, 4.6), M.render, -3.3, gH / 2, 0, G); mk(B(.2, gH, 4.6), M.wood, 3.3, gH / 2, 0, G);
  { const f = new THREE.Group(); G.add(f); fronts.push(f);
    mk(B(6.8, gH, .06), M.glass, 0, gH / 2, 2.25, f, false);
    [-3.3, -1.1, 1.1, 3.3].forEach(x => mk(B(.08, gH, .1), M.frame, x, gH / 2, 2.27, f));
    mk(B(6.8, .1, .12), M.frame, 0, gH - .05, 2.27, f); mk(B(1.2, gH - .1, .14), M.wood, -2.6, gH / 2, 2.3, f); }
  // ground floor interior: sofa, dining table, kitchen island, pendant lamps
  mk(B(2, .42, .85), M.fabric, 1.6, .31, -1.4, G); mk(B(2, .5, .2), M.fabric, 1.6, .65, -1.78, G);
  mk(B(1.6, .06, .9), M.wood, -1.2, .78, -.2, G); [[-1.85, -.55], [-.55, -.55], [-1.85, .15], [-.55, .15]].forEach(([x, z]) => mk(B(.05, .75, .05), M.frame, x, .38, z, G));
  [[-1.9, -.9], [-.5, -.9], [-1.9, .5], [-.5, .5]].forEach(([x, z]) => mk(B(.42, .45, .42), M.dark, x, .23, z, G));
  mk(B(1.6, .9, .7), M.render, -1.6, .45, -1.75, G);
  [[-1.2, 1.9], [1.6, 1.9]].forEach(([x, y]) => { mk(new THREE.SphereGeometry(.16, 20, 16), M.glow, x, y, -.2, G, false); const p = new THREE.PointLight(0xffb878, 0, 6, 1.6); p.position.set(x, y - .2, -.2); G.add(p); lamps.push(p); });
  // upper floor (living benefits): cantilevered wood box with a bedroom
  const U = L.upper; U.position.set(.7, 0, -.15); const uH = 2.4, uY = 2.75;
  mk(B(5.6, .14, 4.3), M.conc, 0, uY, 0, U);
  mk(B(5.6, uH, .2), M.wood, 0, uY + uH / 2, -2.05, U);
  mk(B(.2, uH, 4.3), M.wood, -2.7, uY + uH / 2, 0, U); mk(B(.2, uH, 4.3), M.wood, 2.7, uY + uH / 2, 0, U);
  { const f = new THREE.Group(); U.add(f); fronts.push(f);
    mk(B(5.6, uH, .2), M.wood, 0, uY + uH / 2 + .0, 2.1, f);
    const wGlass = mk(B(3.2, 1.3, .06), M.glass, .6, uY + 1.25, 2.22, f, false); mk(B(3.3, .08, .1), M.frame, .6, uY + 1.92, 2.23, f); mk(B(3.3, .08, .1), M.frame, .6, uY + .58, 2.23, f); }
  mk(B(2, .35, 2.4), M.fabric, -.9, uY + .3, -.6, U); mk(B(2, .7, .15), M.wood, -.9, uY + .6, -1.85, U); mk(B(1.9, .12, .9), M.render, -.9, uY + .5, .3, U);
  { mk(new THREE.SphereGeometry(.13, 20, 16), M.glow, 1.4, uY + .55, -1.4, U, false); const p = new THREE.PointLight(0xffb070, 0, 5, 1.6); p.position.set(1.4, uY + 1, -1.2); U.add(p); lamps.push(p); }
  // roof (mortgage protection): thin dark slab with overhang
  const R = L.roof; R.position.set(.7, 0, -.15);
  mk(B(6.6, .22, 5.2), M.roof, 0, uY + uH + .11, 0, R); mk(B(6.6, .3, .08), M.frame, 0, uY + uH + .2, 2.6, R);
  // glowing windows on the ground floor seen from outside (warm interior)
  const inGlow = mk(B(6.4, gH - .2, .02), M.glow, 0, gH / 2, 1.8, G, false); inGlow.material = M.glow.clone(); inGlow.material.transparent = true; inGlow.material.opacity = .0;

  // front walls fade on their own materials
  fronts.forEach(f => f.traverse(o => { if (o.isMesh) { o.userData.op = o.material.opacity ?? 1; o.material = o.material.clone(); o.material.transparent = true; } }));

  /* ---------- the silk sheet ---------- */
  const SW = 11.6, SD = 9.8, SX = 120, SZ = 104;
  const silkGeo = new THREE.PlaneGeometry(SW, SD, SX, SZ); silkGeo.rotateX(-Math.PI / 2);
  const silkBase = silkGeo.attributes.position.array.slice();
  const silk = new THREE.Mesh(silkGeo, new THREE.MeshPhysicalMaterial({ color: 0xece6dc, roughness: .55, sheen: 1, sheenRoughness: .35, sheenColor: new THREE.Color(0xfff4e6), side: THREE.DoubleSide, transparent: true }));
  silk.castShadow = true; silk.receiveShadow = true; scene.add(silk);
  const top = 6.25, hx = 3.95, hz = 2.9; // draped over the house's footprint (rotated with the house)
  const ca = Math.cos(.42), sa = Math.sin(.42);
  const drape = (pos, k, t) => {
    // k: 0 covered → 1 slid away towards the camera
    const slide = k * k * 15, lift = Math.sin(Math.min(1, k * 1.4) * Math.PI) * 1.2;
    for (let i = 0; i < pos.length; i += 3) {
      const bx = silkBase[i], bz = silkBase[i + 2] + slide;
      const lx = bx * ca + bz * sa - .35, lz = -bx * sa + bz * ca + .1;                // into house space
      const dx = Math.max(0, Math.abs(lx) - hx), dz = Math.max(0, Math.abs(lz) - hz), d = Math.hypot(dx, dz);
      let y = d === 0 ? top : Math.max(.26, top - d * 5.5 - d * d * 3);    // flat on the roof, falls down the sides
      y += Math.sin(bx * 1.7 + t * .9) * .05 * (d > 0 ? 1 : .3) + Math.sin(bz * 2.3 - t * .7) * .04;
      y += k * (lift + Math.sin(bx * 1.2 + bz * .8 - t * 3) * .35 * k);
      const fold = d > 0 ? Math.sin(Math.atan2(lz, lx) * 22 + d * 3) * .06 * Math.min(1, d * 2) : 0;
      pos[i] = bx + fold * .4; pos[i + 1] = y; pos[i + 2] = bz;
    }
  };

  /* ---------- labels (HTML) pinned to each layer ---------- */
  const labels = [...document.querySelectorAll('[data-layer]')];
  const anchors = { roof: [3.4, uY + uH + .11, 0, R], upper: [-3, uY + 1.2, 0, U], ground: [3.4, 1.3, 0, G], found: [-3.5, .22, 0, L.found], vault: [.7, .45, 0, L.vault] };
  const tmp = new THREE.Vector3();

  /* ---------- scroll chapters ---------- */
  const steps = [...document.querySelectorAll('[data-ch]')], dots = [...document.querySelectorAll('[data-chdot]')];
  let prog = 0;
  const readScroll = () => {
    const r = story.getBoundingClientRect(), total = story.offsetHeight - innerHeight;
    prog = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    const idx = prog < .2 ? 0 : prog < .58 ? 1 : prog < .86 ? 2 : 3;
    steps.forEach((s, i) => s.classList.toggle('on', i === idx)); dots.forEach((d, i) => d.classList.toggle('on', i === idx)); story.dataset.ch = idx;
  };
  addEventListener('scroll', readScroll, { passive: true }); readScroll();
  dots.forEach((d, i) => d.addEventListener('click', () => { const total = story.offsetHeight - innerHeight; scrollTo({ top: story.offsetTop + total * [.02, .42, .74, .97][i], behavior: 'smooth' }); }));

  const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; if (small()) camera.setViewOffset(w, h, 0, h * .14, w, h); else camera.setViewOffset(w, h, -w * .16, 0, w, h); camera.updateProjectionMatrix(); };
  addEventListener('resize', size); size();
  const fogFit = () => { scene.fog.near = small() ? 55 : 34; scene.fog.far = small() ? 110 : 70; }; fogFit(); addEventListener('resize', fogFit);
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const camKeys = [ // progress, camera position, look target
    [0, [0, 5.5, 30], [0, 3, 0]], [.2, [3, 6, 27], [0, 3.2, 0]], [.42, [19, 14, 28], [0, 5.4, 0]],
    [.6, [18, 13, 27], [0, 5.2, 0]], [.78, [4.5, 6.5, 19.5], [0, 2.8, 0]], [1, [0, 8, 32], [0, 3, 0]]
  ];
  const camAt = p => { let i = 0; while (i < camKeys.length - 2 && p > camKeys[i + 1][0]) i++; const a = camKeys[i], b = camKeys[i + 1], t = ss(a[0], b[0], p); return [a[1].map((v, k) => lerp(v, b[1][k], t)), a[2].map((v, k) => lerp(v, b[2][k], t))]; };

  const cur = { p: 0 }, cp = new THREE.Vector3(), cl = new THREE.Vector3();
  let t = 0, last = performance.now(), vis = true;
  new IntersectionObserver(es => vis = es[0].isIntersecting).observe(story);
  const frame = now => {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!vis || document.hidden) return;
    t += reduce ? 0 : dt;
    cur.p += (prog - cur.p) * (1 - Math.pow(.003, dt));   // smooth scrubbing, like a video
    const p = cur.p;

    // 1 unveil
    const unveil = ss(.02, .2, p);
    drape(silkGeo.attributes.position.array, unveil, t); silkGeo.attributes.position.needsUpdate = true; silkGeo.computeVertexNormals();
    silk.material.opacity = 1 - ss(.15, .21, p); silk.visible = silk.material.opacity > .01;
    // 2 explode, then settle back
    const ex = ss(.24, .42, p) * (1 - ss(.6, .7, p));
    L.vault.position.y = lerp(0, -1.6, ex); L.found.position.y = lerp(0, -.4, ex);
    L.ground.position.y = lerp(.45, 1.2, ex); L.upper.position.y = lerp(.45, 3.1, ex); L.roof.position.y = lerp(.45, 5.2, ex);
    L.found.position.y += .0; L.vault.visible = ex > .02 || p > .24 && p < .7;
    [L.ground, L.upper, L.roof].forEach((g, i) => g.rotation.y = Math.sin(t * .5 + i) * .03 * ex);
    // labels
    const showL = ss(.36, .44, p) * (1 - ss(.56, .62, p));
    labels.forEach(el => {
      const [x, y, z, g] = anchors[el.dataset.layer]; tmp.set(x, y, z); g.localToWorld(tmp); tmp.project(camera);
      const sx = (tmp.x * .5 + .5) * canvas.clientWidth, sy = (-tmp.y * .5 + .5) * canvas.clientHeight;
      el.style.setProperty('--x', sx + 'px'); el.style.setProperty('--y', sy + 'px'); el.style.opacity = showL;
    });
    // 3 cutaway: front walls slide away, rooms light up
    const cut = ss(.64, .76, p) * (1 - ss(.93, 1, p) * .0);
    fronts.forEach(f => { f.position.z = cut * 1.4; f.traverse(o => { if (o.material) o.material.opacity = (o.userData.op ?? 1) * (1 - cut); }); f.visible = cut < .97; });
    const warm = Math.max(ss(.12, .22, p) * .55, cut);
    lamps.forEach(l => l.intensity = warm * 9); M.glow.emissiveIntensity = warm * 3; inGlow.material.opacity = warm * .18 * (1 - cut);
    M.vaultGlow.emissiveIntensity = showL * 4 + ex * 2; vaultLight.intensity = ex * 6;

    // camera
    const [c, l] = camAt(p); cp.set(...c); cl.set(...l);
    if (small()) cp.sub(cl).multiplyScalar(1.75).add(cl);
    mx += (tmx - mx) * .04; my += (tmy - my) * .04;
    cp.applyAxisAngle(new THREE.Vector3(0, 1, 0), mx * .12 + (reduce ? 0 : Math.sin(t * .15) * .03)); cp.y += my * .5;
    camera.position.copy(cp); camera.lookAt(cl);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  story.classList.add('has-3d');
}
