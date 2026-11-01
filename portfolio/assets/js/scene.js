/* Helmwork · liquid-chrome form that lives behind the page.
   Each section can set where it sits with data-form="x y scale energy" (x, y in -1..1 of the viewport). */
import * as THREE from './vendor/three.module.min.js';

const canvas = document.querySelector('[data-scene]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
} catch (e) { document.documentElement.classList.add('no-webgl'); }

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 1.75));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 7.2);

  const noise = /* glsl */`
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;

  const uniforms = {
    uTime: { value: 0 }, uAmp: { value: 0.32 }, uFreq: { value: 0.9 },
    uMouse: { value: new THREE.Vector2() }, uTwist: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: noise + /* glsl */`
      uniform float uTime, uAmp, uFreq, uTwist; uniform vec2 uMouse;
      varying vec3 vN; varying vec3 vW; varying float vD;
      float field(vec3 p){
        float t = uTime*.32;
        float n = snoise(p*uFreq + vec3(t, t*.7, -t*.5) + vec3(uMouse*.35, 0.));
        n += .16*snoise(p*uFreq*1.9 - vec3(t*.6) );
        return n;
      }
      vec3 shape(vec3 p){
        float a = uTwist * p.y; float c = cos(a), s = sin(a);
        p.xz = mat2(c,-s,s,c) * p.xz;
        return p + normalize(p) * field(p) * uAmp;
      }
      void main(){
        vec3 p = shape(position);
        vec3 t = normalize(cross(normal, abs(normal.y) < .99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.)));
        vec3 b = cross(normal, t); float e = .012;
        vec3 n = normalize(cross(shape(position + t*e) - p, shape(position + b*e) - p));
        vD = field(position);
        vec4 w = modelMatrix * vec4(p, 1.);
        vW = w.xyz; vN = normalize(mat3(modelMatrix) * n);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec3 vN; varying vec3 vW; varying float vD;
      vec3 env(vec3 r){
        vec3 col = mix(vec3(.015,.016,.02), vec3(.10,.11,.14), smoothstep(-1.,1.,r.y));
        col += vec3(1.) * smoothstep(.86,1., sin(r.x*2.6 + 1.2)*.5+.5) * smoothstep(-.1,.7,r.y) * 1.35;
        col += vec3(.9,.95,1.) * smoothstep(.95,1., sin(r.y*5. - .4)*.5+.5) * .35;
        col += vec3(1.,.42,.22) * pow(max(0., dot(r, normalize(vec3(-.7,.25,.65)))), 10.) * 1.6;
        col += vec3(.42,.52,1.) * pow(max(0., dot(r, normalize(vec3(.85,-.35,.4)))), 7.) * 1.15;
        return col;
      }
      void main(){
        vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
        vec3 V = normalize(cameraPosition - vW);
        vec3 R = reflect(-V, N);
        float fr = pow(1. - max(dot(N,V), 0.), 2.6);
        vec3 irid = .5 + .5*cos(6.2831*(fr*1.1 + vD*.35 + uTime*.03 + vec3(0.,.33,.67)));
        vec3 col = env(R) * mix(vec3(1.), irid*1.2, .12 + .38*fr);
        col += irid * fr * .18;
        col = col / (col + vec3(.85)) * 1.55;
        col = pow(col, vec3(.92));
        gl_FragColor = vec4(col, 1.);
      }`
  });

  const geo = new THREE.IcosahedronGeometry(1.15, small ? 64 : 110);
  const mesh = new THREE.Mesh(geo, material);
  scene.add(mesh);

  /* scroll choreography */
  const stops = [...document.querySelectorAll('[data-form]')];
  const parse = el => el.dataset.form.trim().split(/\s+/).map(Number);
  const cur = { x: .3, y: 0, s: 1, e: 1 }, goal = { ...cur };
  const readGoal = () => {
    if (!stops.length) return;
    const mid = innerHeight * .5; let a = stops[0], b = null, k = 0;
    for (let i = 0; i < stops.length; i++) {
      const r = stops[i].getBoundingClientRect();
      if (r.top <= mid) { a = stops[i]; b = stops[i + 1] || null; k = b ? Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height))) : 0; }
    }
    const A = parse(a), B = b ? parse(b) : A;
    const ease = k < .55 ? 0 : (k - .55) / .45; const q = ease * ease * (3 - 2 * ease);
    const m = small ? [A[0] * .9, B[0] * .9] : [A[0], B[0]];
    goal.x = m[0] + (m[1] - m[0]) * q; goal.y = A[1] + (B[1] - A[1]) * q;
    goal.s = A[2] + (B[2] - A[2]) * q; goal.e = A[3] + (B[3] - A[3]) * q;
  };

  const mouse = new THREE.Vector2(), mTarget = new THREE.Vector2(); let vel = 0, lastMX = 0, lastMY = 0;
  addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth * 2 - 1, y = -(e.clientY / innerHeight * 2 - 1);
    vel = Math.min(1, vel + Math.hypot(x - lastMX, y - lastMY) * 2.2); lastMX = x; lastMY = y; mTarget.set(x, y);
  }, { passive: true });

  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize); resize();

  let visible = true, t = 0, last = performance.now();
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; last = performance.now(); });
  const halfW = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect;
  const halfH = () => Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    t += reduce ? 0 : dt;
    readGoal();
    const f = 1 - Math.pow(.0015, dt);
    cur.x += (goal.x - cur.x) * f; cur.y += (goal.y - cur.y) * f; cur.s += (goal.s - cur.s) * f; cur.e += (goal.e - cur.e) * f;
    mouse.lerp(mTarget, 1 - Math.pow(.02, dt)); vel *= Math.pow(.25, dt);
    const sc = small ? cur.s * .78 : cur.s;
    mesh.position.set(cur.x * halfW(), cur.y * halfH(), 0);
    mesh.scale.setScalar(Math.max(.0001, sc));
    mesh.rotation.y = t * .12 + mouse.x * .35; mesh.rotation.x = -mouse.y * .25 + Math.sin(t * .2) * .1;
    uniforms.uTime.value = t;
    uniforms.uMouse.value.copy(mouse);
    uniforms.uAmp.value = (.2 + .12 * cur.e) + vel * .1;
    uniforms.uFreq.value = .55 + .25 * cur.e;
    uniforms.uTwist.value = Math.sin(t * .15) * .35 * cur.e;
    canvas.style.opacity = sc < .02 ? 0 : (small && cur.s < .8 ? .38 : 1);
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  document.documentElement.classList.add('has-webgl');
}
