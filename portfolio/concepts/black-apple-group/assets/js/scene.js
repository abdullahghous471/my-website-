/* Black Apple Group · "The home you protect"
   A hand-built 3D diorama: a family home on a small floating island.
   Scroll tells four chapters: your home (dusk) · your family (windows light up) ·
   the unexpected (storm and rain) · protected (a glass shield forms, the storm clears, sunrise). */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-scene]');
const story = document.querySelector('[data-story]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  const small = () => innerWidth < 860;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a2228, 18, 42);
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 120);

  /* ---------- materials: soft clay, like an architect's model ---------- */
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .86, metalness: 0, ...o });
  const mat = {
    grass: M(0x3f5a45), grass2: M(0x4b6a4f), rock: M(0x2b2723, { flatShading: true }), rock2: M(0x37302a, { flatShading: true }),
    wall: M(0xe9e1d2), wall2: M(0xdcd2c0), roof: M(0x30353b), trim: M(0xf5f1ea), wood: M(0x5b4130), door: M(0x2d3a36),
    trunk: M(0x5a4636), leaf1: M(0x4d6a4e, { flatShading: true }), leaf2: M(0x5f7d58, { flatShading: true }), leaf3: M(0x3c5641, { flatShading: true }),
    stone: M(0xcfc7b8), fence: M(0xf1ece2), cloud: M(0x6d757d, { flatShading: true, transparent: true, opacity: 0 })
  };
  const glass = new THREE.MeshStandardMaterial({ color: 0x1b232a, emissive: 0xffc58a, emissiveIntensity: 0, roughness: .2 });

  const world = new THREE.Group(); scene.add(world);
  const add = (geo, m, x, y, z, parent = world, shadow = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; };

  /* ---------- the floating island ---------- */
  const noise = (x, z) => Math.sin(x * 1.7 + z * .6) * .5 + Math.sin(z * 2.3 - x * 1.1) * .35 + Math.sin(x * 4.1 + z * 3.7) * .15;
  const top = new THREE.CylinderGeometry(4.2, 4.0, .45, 72, 3);
  { const p = top.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const r = Math.hypot(v.x, v.z); if (v.y > 0 && r < 4.1) v.y += noise(v.x, v.z) * .05 * (r / 4.2); p.setXYZ(i, v.x, v.y, v.z); } top.computeVertexNormals(); }
  add(top, mat.grass, 0, 0, 0, world, false).receiveShadow = true;
  const under = new THREE.ConeGeometry(4.0, 3.6, 48, 6, true);
  { const p = under.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = (1.8 - v.y) / 3.6; const a = Math.atan2(v.z, v.x); const j = 1 + (.12 * Math.sin(a * 7 + v.y * 3) + .08 * Math.sin(a * 13 - v.y * 5)) * k; v.x *= j; v.z *= j; p.setXYZ(i, v.x, v.y, v.z); } under.computeVertexNormals(); }
  const u = add(under, mat.rock, 0, -2.02, 0, world, false); u.rotation.x = Math.PI;
  const under2 = add(new THREE.ConeGeometry(2.2, 2.2, 9, 3), mat.rock2, .9, -3.9, -.4, world, false); under2.rotation.x = Math.PI;

  /* ---------- the house ---------- */
  const house = new THREE.Group(); world.add(house); house.position.set(-.2, .22, -.4); house.rotation.y = -.35;
  add(new THREE.BoxGeometry(2.4, 1.5, 1.7), mat.wall, 0, .75, 0, house);
  const gable = (w, h, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2); return g; };
  add(gable(2.4, 1.0, 1.7), mat.wall, 0, 1.5, 0, house);
  const roofPlane = (w, len, ang, x) => { const r = add(new THREE.BoxGeometry(len, .08, w), mat.roof, x, 0, 0, house); return r; };
  const rl = add(new THREE.BoxGeometry(1.62, .09, 1.95), mat.roof, -.62, 2.01, 0, house); rl.rotation.z = Math.atan2(1, 1.2);
  const rr = add(new THREE.BoxGeometry(1.62, .09, 1.95), mat.roof, .62, 2.01, 0, house); rr.rotation.z = -Math.atan2(1, 1.2);
  add(new THREE.BoxGeometry(.28, .7, .28), mat.wall2, .62, 2.25, -.35, house);
  add(new THREE.BoxGeometry(.34, .06, .34), mat.trim, .62, 2.62, -.35, house);
  // side wing with flat roof and a big window
  add(new THREE.BoxGeometry(1.3, 1.0, 1.4), mat.wall2, 1.75, .5, .1, house);
  add(new THREE.BoxGeometry(1.42, .08, 1.52), mat.roof, 1.75, 1.04, .1, house);
  // porch
  add(new THREE.BoxGeometry(1.1, .08, .55), mat.wood, -.3, .04, 1.1, house);
  add(new THREE.BoxGeometry(1.2, .05, .7), mat.roof, -.3, 1.2, 1.12, house).rotation.x = .18;
  add(new THREE.BoxGeometry(.05, 1.15, .05), mat.trim, -.82, .62, 1.38, house); add(new THREE.BoxGeometry(.05, 1.15, .05), mat.trim, .22, .62, 1.38, house);
  add(new THREE.BoxGeometry(.42, .8, .04), mat.door, -.3, .45, .86, house);
  add(new THREE.SphereGeometry(.025, 8, 8), mat.trim, -.15, .45, .89, house, false);
  // windows (they light up in chapter two)
  const windows = [];
  const win = (x, y, z, w, h, ry = 0, d = .04) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; house.add(g);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glass.clone()); pane.position.z = .012; g.add(pane);
    [[0, h / 2 + .03, w + .1, .06], [0, -h / 2 - .03, w + .14, .07], [-w / 2 - .03, 0, .06, h + .1], [w / 2 + .03, 0, .06, h + .1], [0, 0, .035, h], [0, 0, w, .035]]
      .forEach(([fx, fy, fw, fh]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, d), mat.trim); f.position.set(fx, fy, .02); f.castShadow = true; g.add(f); });
    windows.push(pane); return g;
  };
  win(.55, .85, .86, .5, .55); win(-.95, .85, .86, .32, .5); win(0, 1.85, .86, .36, .36);
  win(1.75, .5, .81, .8, .5);
  win(1.21, .8, -.2, .4, .45, Math.PI / 2);
  const warm = new THREE.PointLight(0xffb36b, 0, 6, 1.6); warm.position.set(.3, 1, 1.6); house.add(warm);
  const porchLamp = new THREE.PointLight(0xffc98f, 0, 3.5, 2); porchLamp.position.set(-.3, 1.05, 1.15); house.add(porchLamp);

  /* ---------- garden: trees, path, fence, bushes ---------- */
  const tree = (x, z, s, leaf) => {
    const g = new THREE.Group(); g.position.set(x, .2, z); g.scale.setScalar(s); world.add(g);
    add(new THREE.CylinderGeometry(.06, .09, .7, 8), mat.trunk, 0, .35, 0, g);
    add(new THREE.IcosahedronGeometry(.5, 1), leaf, 0, 1.0, 0, g);
    add(new THREE.IcosahedronGeometry(.36, 1), leaf, .2, 1.35, .1, g);
    add(new THREE.IcosahedronGeometry(.3, 1), leaf, -.22, 1.25, -.05, g);
    return g;
  };
  const trees = [tree(-2.6, -1.4, 1.25, mat.leaf1), tree(-3.1, .6, .95, mat.leaf2), tree(2.9, -1.6, 1.1, mat.leaf3), tree(1.9, -2.6, .8, mat.leaf2), tree(-1.4, -2.9, .9, mat.leaf3), tree(3.2, 1.2, .7, mat.leaf1)];
  for (let i = 0; i < 7; i++) { const t = i / 6; const s = add(new THREE.CylinderGeometry(.17, .19, .05, 10), mat.stone, -.7 + Math.sin(t * 2.2) * .5 + t * .9, .25, 1.4 + t * 2.3, world); s.scale.x = 1.3; s.castShadow = false; }
  const fenceG = new THREE.Group(); world.add(fenceG);
  for (let i = 0; i <= 16; i++) { const a = Math.PI * .1 + i * (Math.PI * .55 / 16), r = 3.75; add(new THREE.BoxGeometry(.06, .34, .06), mat.fence, Math.cos(a) * r, .38, Math.sin(a) * r, fenceG); }
  for (let i = 0; i < 16; i++) { const a = Math.PI * .1 + (i + .5) * (Math.PI * .55 / 16), r = 3.75; const rail = add(new THREE.BoxGeometry(.04, .04, .66), mat.fence, Math.cos(a) * r, .45, Math.sin(a) * r, fenceG); rail.rotation.y = -a; }
  [[1.2, 1.5, .22], [1.55, 1.25, .16], [-1.7, 1.2, .2], [-2.1, 1.0, .14], [2.3, .2, .18]].forEach(([x, z, r]) => add(new THREE.IcosahedronGeometry(r, 1), mat.leaf2, x, .28 + r * .5, z));

  /* ---------- sky light ---------- */
  const hemi = new THREE.HemisphereLight(0xdfe6ea, 0x2a2620, .9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd2a6, 2.2); sun.position.set(6, 7, 4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 }); sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
  scene.add(sun);

  /* ---------- storm: clouds, rain, lightning ---------- */
  const clouds = new THREE.Group(); scene.add(clouds);
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Group(); const a = i / 9 * Math.PI * 2, r = 2 + (i % 3) * 1.2;
    c.position.set(Math.cos(a) * r, 4.4 + (i % 2) * .5, Math.sin(a) * r);
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.55 + Math.random() * .5, 1), mat.cloud); s.position.set((k - 2) * .55, Math.random() * .3, Math.random() * .5); c.add(s); }
    clouds.add(c);
  }
  const RN = 900, rp = new Float32Array(RN * 6), rv = new Float32Array(RN);
  for (let i = 0; i < RN; i++) { const x = (Math.random() - .5) * 14, z = (Math.random() - .5) * 14, y = Math.random() * 10; rp.set([x, y, z, x - .03, y - .35, z], i * 6); rv[i] = 7 + Math.random() * 4; }
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xaab8c4, transparent: true, opacity: 0 });
  const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; scene.add(rain);

  /* ---------- the shield: a glass dome that rises from the ground ---------- */
  const domeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uP: { value: 0 }, uT: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY; varying vec3 vP;
      void main(){ vec4 w = modelMatrix * vec4(position,1.); vP = position; vY = position.y; vN = normalize(normalMatrix * normal); vV = normalize(-(viewMatrix * w).xyz); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uP, uT; varying vec3 vN; varying vec3 vV; varying float vY; varying vec3 vP;
      void main(){
        float h = vY / 4.8; if (h > uP * 1.08) discard;
        float rim = pow(1. - abs(dot(vN, vV)), 2.4);
        float edge = smoothstep(uP * 1.08 - .05, uP * 1.08, h);
        float lat = smoothstep(.985, 1., abs(sin(h * 22. - uT * .6))) * .1;
        float lon = smoothstep(.992, 1., abs(sin(atan(vP.z, vP.x) * 10.))) * .07;
        vec3 c = mix(vec3(.82, .9, .88), vec3(1., .93, .82), h);
        float a = .03 + rim * .5 + (lat + lon) * (1. - h * .5) + edge * .9;
        gl_FragColor = vec4(c + edge * .4, a * min(1., uP * 3.));
      }`
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(4.8, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), domeMat); dome.position.y = .2; scene.add(dome);
  const ringGlow = new THREE.Mesh(new THREE.TorusGeometry(4.8, .02, 8, 160), new THREE.MeshBasicMaterial({ color: 0xf3e3c8, transparent: true, opacity: 0 }));
  ringGlow.rotation.x = Math.PI / 2; ringGlow.position.y = .22; scene.add(ringGlow);

  /* ---------- chapters: camera, light and sky for each ---------- */
  const C = [
    { cam: [8.5, 5.2, 10.5], look: [0, .8, 0], sky: ['#26343d', '#b88e72'], sun: [0xffc59a, 2.1], hemi: .8, win: .15, storm: 0, dome: 0, fog: 0x2a3237 },  // dusk, your home
    { cam: [5.4, 3.0, 8.2], look: [.2, 1, .2], sky: ['#0f1820', '#33424f'], sun: [0x9fb4cc, .6], hemi: .45, win: 1, storm: 0, dome: 0, fog: 0x18212a },       // night, the family inside
    { cam: [-8.5, 5.2, 10.5], look: [0, 1.6, 0], sky: ['#0a0e12', '#1d242b'], sun: [0x8796a6, .35], hemi: .3, win: .7, storm: 1, dome: 0, fog: 0x10151a },     // storm
    { cam: [0, 4.8, 17.5], look: [0, 1.8, 0], sky: ['#3a5566', '#e7c4a3'], sun: [0xffd9b0, 2.4], hemi: .95, win: .25, storm: 0, dome: 1, fog: 0x546a74 }     // protected, sunrise
  ];
  const col = (h) => new THREE.Color(h);
  const S = { cam: new THREE.Vector3(...C[0].cam), look: new THREE.Vector3(...C[0].look), sky0: col(C[0].sky[0]), sky1: col(C[0].sky[1]), sunC: col(C[0].sun[0]), sunI: C[0].sun[1], hemi: C[0].hemi, win: C[0].win, storm: 0, dome: 0, fog: col(C[0].fog) };
  const G = { cam: new THREE.Vector3(), look: new THREE.Vector3(), sky0: new THREE.Color(), sky1: new THREE.Color(), sunC: new THREE.Color(), fog: new THREE.Color() };

  const steps = [...document.querySelectorAll('[data-ch]')], dots = [...document.querySelectorAll('[data-chdot]')];
  let prog = 0;
  const readScroll = () => {
    const r = story.getBoundingClientRect(), total = story.offsetHeight - innerHeight;
    prog = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    const idx = Math.min(3, Math.floor(prog * 4 + .0001));
    steps.forEach((s, i) => s.classList.toggle('on', i === idx));
    dots.forEach((d, i) => d.classList.toggle('on', i === idx));
    story.dataset.ch = idx;
  };
  addEventListener('scroll', readScroll, { passive: true }); readScroll();
  dots.forEach((d, i) => d.addEventListener('click', () => { const total = story.offsetHeight - innerHeight; scrollTo({ top: story.offsetTop + total * (i + .5) / 4, behavior: 'smooth' }); }));

  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
    if (small()) camera.setViewOffset(w, h, 0, h * .2, w, h); else camera.setViewOffset(w, h, -w * .2, 0, w, h);
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', size); size();

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });

  let t = 0, last = performance.now(), flash = 0, visible = true;
  new IntersectionObserver(es => visible = es[0].isIntersecting).observe(story);
  const tmpV = new THREE.Vector3();
  const frame = now => {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    t += reduce ? 0 : dt;

    // blend between the two chapters around the current scroll point
    const f = prog * 3, i = Math.min(2, Math.floor(f)), k0 = f - i, k = k0 * k0 * (3 - 2 * k0), a = C[i], b = C[i + 1];
    const L = (x, y) => x + (y - x) * k;
    G.cam.set(L(a.cam[0], b.cam[0]), L(a.cam[1], b.cam[1]), L(a.cam[2], b.cam[2]));
    G.look.set(L(a.look[0], b.look[0]), L(a.look[1], b.look[1]), L(a.look[2], b.look[2]));
    G.sky0.copy(col(a.sky[0])).lerp(col(b.sky[0]), k); G.sky1.copy(col(a.sky[1])).lerp(col(b.sky[1]), k);
    G.sunC.copy(col(a.sun[0])).lerp(col(b.sun[0]), k); G.fog.copy(col(a.fog)).lerp(col(b.fog), k);
    const sunI = L(a.sun[1], b.sun[1]), hemiI = L(a.hemi, b.hemi), winI = L(a.win, b.win);
    // storm peaks inside chapter three, the dome rises at the end
    const storm = prog < .5 ? 0 : prog < .62 ? (prog - .5) / .12 : prog < .78 ? 1 : Math.max(0, 1 - (prog - .78) / .1);
    const domeP = prog < .7 ? 0 : Math.min(1, (prog - .7) / .2);

    const e = 1 - Math.pow(.02, dt);
    S.cam.lerp(G.cam, e); S.look.lerp(G.look, e); S.sky0.lerp(G.sky0, e); S.sky1.lerp(G.sky1, e); S.sunC.lerp(G.sunC, e); S.fog.lerp(G.fog, e);
    S.sunI += (sunI - S.sunI) * e; S.hemi += (hemiI - S.hemi) * e; S.win += (winI - S.win) * e; S.storm += (storm - S.storm) * e; S.dome += (domeP - S.dome) * e;

    mx += (tmx - mx) * .04; my += (tmy - my) * .04;
    const orbit = reduce ? 0 : Math.sin(t * .12) * .35;
    tmpV.copy(S.cam).multiplyScalar(small() ? 1.6 : 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), orbit + mx * .25);
    camera.position.copy(tmpV); camera.position.y += my * .6;
    camera.lookAt(S.look);
    world.position.y = Math.sin(t * .6) * .08; world.rotation.y = Math.sin(t * .2) * .04;

    story.style.setProperty('--sky0', '#' + S.sky0.getHexString()); story.style.setProperty('--sky1', '#' + S.sky1.getHexString());
    scene.fog.color.copy(S.fog);
    sun.color.copy(S.sunC); sun.intensity = S.sunI; hemi.intensity = S.hemi;
    windows.forEach((w, n) => { const on = Math.min(1, Math.max(0, S.win * 1.6 - n * .12)); w.material.emissiveIntensity = on * 2.2; });
    warm.intensity = S.win * 3.2; porchLamp.intensity = S.win * 1.6;

    // storm
    mat.cloud.opacity = S.storm * .95; clouds.position.y = 2.2 * (1 - S.storm); clouds.rotation.y = t * .04;
    rainMat.opacity = S.storm * .55;
    if (S.storm > .05) {
      const p = rainGeo.attributes.position.array;
      for (let n = 0; n < RN; n++) { const o = n * 6, d = rv[n] * dt; p[o + 1] -= d; p[o + 4] -= d; if (p[o + 4] < -1) { p[o + 1] += 10.5; p[o + 4] += 10.5; } }
      rainGeo.attributes.position.needsUpdate = true;
      if (!reduce && Math.random() < dt * .5 * S.storm) flash = 1;
    }
    flash *= Math.pow(.02, dt); hemi.intensity += flash * 2.2;
    trees.forEach((tr, n) => tr.rotation.z = Math.sin(t * (1.2 + S.storm * 3) + n) * (.01 + S.storm * .05));

    // shield
    domeMat.uniforms.uP.value = S.dome; domeMat.uniforms.uT.value = t; dome.visible = S.dome > .002;
    ringGlow.material.opacity = Math.min(1, S.dome * 4) * (1 - S.dome * .5) * .9;

    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  story.classList.add('has-3d');
}
