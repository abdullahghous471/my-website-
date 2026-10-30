/* Black Apple Group · hero scene
   A polished black apple with a gold stem, held inside slow gold rings:
   protection around what matters. Pauses when off screen; still frame for reduced motion. */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-hero-canvas]');
const hero = document.querySelector('[data-hero]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  document.documentElement.classList.add('no-webgl');
}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, .7, 7.4); camera.lookAt(0, 0, 0);

  /* studio reflections: warm softboxes baked into an environment map */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new THREE.Scene();
  const box = (w, h, color, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); studio.add(m);
  };
  studio.background = new THREE.Color(0x050505);
  box(9, 1.6, 0xd9c6a2, -3, 4.5, 3, .7, -.9);  // long soft key, top left
  box(1.1, 8, 0xE8C377, 5, 0, 1, -1.3);       // gold strip, right
  box(.8, 7, 0xC79A45, -5, 0, 2.5, 1.2);      // gold strip, left
  box(1.2, 7, 0xB08A3E, -5.5, -1, -2, 1.1);   // gold rim, back left
  box(1.2, 7, 0xB08A3E, 5.5, -1, -2, -1.1);   // gold rim, back right
  box(8, .5, 0x3a3226, 0, -4, 0, 0, Math.PI / 2); // floor bounce
  scene.environment = pmrem.fromScene(studio, .035).texture;

  const key = new THREE.DirectionalLight(0xfff1dc, 1.4); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xE3B866, 2.2); rim.position.set(4, 1.5, -3); scene.add(rim);
  const rim2 = new THREE.DirectionalLight(0xC9A44C, 1.6); rim2.position.set(-4, 2.5, -4); scene.add(rim2);

  const world = new THREE.Group(); scene.add(world);
  const appleG = new THREE.Group(); world.add(appleG);

  /* the apple: a lathe from a hand-drawn profile, slightly irregular so it feels real */
  // outline from a round curve with a deep dimple at the stem and a softer one underneath
  const prof = [];
  for (let i = 0; i <= 120; i++) {
    const th = -Math.PI / 2 + Math.PI * i / 120, sn = Math.sin(th), cs = Math.cos(th);
    let x = cs * (1 + .09 * sn) * (1 - .05 * Math.max(0, -sn)), y = sn * .9;
    y -= .3 * Math.exp(-Math.pow((Math.PI / 2 - th) / .32, 2));     // stem cavity
    y += .1 * Math.exp(-Math.pow((th + Math.PI / 2) / .3, 2));      // base dimple
    prof.push(new THREE.Vector2(Math.max(0, x), y));
  }
  const geo = new THREE.LatheGeometry(prof, 160);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const lobe = 1 + .035 * Math.cos(5 * a) * Math.max(0, -v.y + .2);   // soft lobes near the base
    v.x *= 1.04 * lobe; v.z *= .97 * lobe;
    v.y += .03 * Math.sin(a) * (1 - Math.abs(v.y));                      // a slight lean
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const skin = new THREE.MeshPhysicalMaterial({
    color: 0x070707, roughness: .2, metalness: .15, clearcoat: 1, clearcoatRoughness: .06,
    envMapIntensity: 1.25, sheen: .4, sheenColor: new THREE.Color(0x6b5426), sheenRoughness: .5
  });
  const apple = new THREE.Mesh(geo, skin); apple.scale.set(.96, 1.1, .96); appleG.add(apple);

  const gold = new THREE.MeshStandardMaterial({ color: 0xD3AE5C, metalness: 1, roughness: .28, envMapIntensity: 1.5 });
  const stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .58, 0), new THREE.Vector3(.02, .8, 0), new THREE.Vector3(.09, 1.0, .02), new THREE.Vector3(.18, 1.12, .03)]);
  appleG.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 40, .028, 12), gold));
  // a single gold leaf, thin and curved
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0); leafShape.bezierCurveTo(.12, .1, .32, .1, .46, 0); leafShape.bezierCurveTo(.32, -.09, .12, -.09, 0, 0);
  const leaf = new THREE.Mesh(new THREE.ExtrudeGeometry(leafShape, { depth: .006, bevelEnabled: true, bevelSize: .006, bevelThickness: .004, bevelSegments: 2, curveSegments: 24 }), gold);
  leaf.material = gold.clone(); leaf.material.emissive = new THREE.Color(0x3a2a0c);
  leaf.position.set(.07, .92, .02); leaf.rotation.set(.3, -.5, .55); appleG.add(leaf);

  /* rings of protection, each with a bead of light travelling along it */
  const rings = [];
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xC9A44C, metalness: 1, roughness: .35, envMapIntensity: 1.3, transparent: true, opacity: .85 });
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xFFE3A3 });
  [[1.62, .0045, [1.25, 0, .18]], [1.86, .0035, [1.5, .5, -.3]], [2.12, .003, [1.05, -.6, .45]]].forEach(([r, t, rot], i) => {
    const g = new THREE.Group(); g.rotation.set(...rot);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 260), ringMat.clone());
    g.add(ring);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(.026 - i * .004, 16, 16), beadMat); g.add(bead);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xE9C46A, transparent: true, opacity: .18, depthWrite: false }));
    bead.add(glow);
    world.add(g); rings.push({ g, ring, bead, r, speed: .22 - i * .05, phase: i * 2.1 });
  });

  /* soft contact shadow */
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  const sx = sh.getContext('2d'), grd = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.75)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); sx.fillStyle = grd; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.25; world.add(shadow);

  /* fine gold dust, very sparse */
  const N = 140, dust = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const r = 2.4 + Math.random() * 2.2, a = Math.random() * Math.PI * 2, y = (Math.random() - .5) * 3.4; dust.set([Math.cos(a) * r, y, Math.sin(a) * r - 1], i * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dust, 3));
  const dots = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xD9B866, size: .018, transparent: true, opacity: .55, depthWrite: false }));
  world.add(dots);

  /* layout: apple sits right on desktop, top-centre on phones */
  let W = 0, H = 0, small = false;
  function size() {
    const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    small = W < 820;
    world.position.set(small ? 0 : 1.95, small ? .42 : -.05, 0);
    world.scale.setScalar(small ? .92 : .86);
  }
  size(); addEventListener('resize', size);

  /* gentle pointer tilt + scroll unfold */
  let tx = 0, ty = 0, mx = 0, my = 0, scrollK = 0;
  addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  addEventListener('scroll', () => { scrollK = Math.min(1, scrollY / (hero.offsetHeight || 1)); }, { passive: true });

  let visible = true, t = 0, last = performance.now(), intro = reduce ? 1 : 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    if (!reduce) t += dt;
    intro = Math.min(1, intro + dt * .5);
    const e = 1 - Math.pow(1 - intro, 3);
    mx += (tx - mx) * .05; my += (ty - my) * .05;

    appleG.rotation.y = t * .25 + mx * .6 + scrollK * 1.2;
    appleG.rotation.x = my * .25;
    appleG.position.y = Math.sin(t * .9) * .04;
    appleG.scale.setScalar(.85 + e * .15);
    rings.forEach((o, i) => {
      o.g.rotation.z += reduce ? 0 : dt * (.05 + i * .02) * (i % 2 ? -1 : 1);
      o.ring.scale.setScalar((.6 + e * .4) * (1 + scrollK * (.12 + i * .1)));
      o.ring.material.opacity = .85 * e * (1 - scrollK * .6);
      const a = o.phase + t * o.speed * Math.PI;
      const rr = o.r * o.ring.scale.x;
      o.bead.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0);
      o.bead.visible = e > .6;
    });
    dots.rotation.y = t * .02;
    world.rotation.y = mx * .15;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  hero.classList.add('has-3d');
}
