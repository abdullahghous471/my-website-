/* Helmwork · hero portal: a ring of flowing light strands on a starfield (raw WebGL, no library). */
(() => {
document.querySelectorAll('[data-portal]').forEach(canvas => {
  const mode = canvas.dataset.portalMode || 'hero';
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: true, alpha: true });
  if (!gl) { canvas.classList.add('portal--off'); return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = matchMedia('(max-width: 760px)').matches;

  const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
  const fs = `
    precision highp float;
    uniform vec2 uRes; uniform float uTime, uScroll, uIntro; uniform vec2 uMouse;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float adiff(float a, float b){ float d = mod(a - b + 3.14159265, 6.2831853) - 3.14159265; return d; }
    void main(){
      vec2 uv = (gl_FragCoord.xy - .5 * uRes) / min(uRes.x, uRes.y);
      uv.y -= .015;
      float r = length(uv), a = atan(uv.y, uv.x);
      float grow = 1. + uScroll * 1.9;
      float R0 = ${small ? '.39' : '.355'} * grow * mix(.55, 1., uIntro);

      /* colour around the ring: warm on top, cool below, slowly drifting */
      float top = .5 + .5 * sin(a);
      vec3 warm = mix(vec3(1., .36, .14), vec3(1., .42, .72), .5 + .5 * cos(a * 2. + uTime * .25));
      vec3 cool = mix(vec3(.22, .45, 1.), vec3(.58, .34, 1.), .5 + .5 * cos(a * 3. - uTime * .2));
      vec3 hue = mix(cool, warm, smoothstep(.18, .86, top));

      /* the mouse pulls the ring towards it */
      float ma = atan(uMouse.y, uMouse.x), md = length(uMouse);
      float near = exp(-pow(adiff(a, ma) * 2.4, 2.)) * smoothstep(.9, .0, abs(md - R0)) * step(.001, md);

      float acc = 0., core = 0.;
      for (int k = 0; k < ${small ? 24 : 40}; k++) {
        float fk = float(k), n = fk / ${small ? '23.' : '39.'};
        float c = exp(-pow((n - .5) * 3.2, 2.));               // strands near the middle burn hotter
        float off = (n - .5) * .095 * (1. + .6 * sin(a * 3. + uTime * .35 + fk * .15));
        float w = .017 * sin(a * 5. + uTime * .55 + fk * .07)
                + .009 * sin(a * 11. - uTime * .85 + fk * .19)
                + .0045 * sin(a * 23. + uTime * 1.6 + fk * .47)
                + .0028 * sin(a * 47. - uTime * 2.4 + fk * 1.3);
        float rad = R0 + off + w * (1. + 2.2 * near) + near * .03;
        float d = abs(r - rad);
        float bright = (.35 + .65 * fract(sin(fk * 12.9898) * 43758.5453)) * (.55 + .9 * c);
        acc += bright * .0016 / (d + .0016);
        core += bright * c * smoothstep(.003, .0, d);
      }
      acc /= ${small ? '24.' : '40.'}; core /= ${small ? '24.' : '40.'};

      vec3 col = hue * acc * 2.3 + mix(hue, vec3(1.), .75) * core * 4.2;
      col += hue * .22 * exp(-pow((r - R0) / .11, 2.));          // soft halo
      col += hue * .06 * exp(-pow(r / (R0 * .9), 2.)) * (1. - uScroll); // faint inner light
      col *= 1. + near * .8;

      /* starfield */
      vec2 g = floor(gl_FragCoord.xy / 2.6);
      float h = hash(g);
      float star = step(.9965, h) * (.45 + .55 * sin(uTime * (1. + h * 3.) + h * 60.));
      col += vec3(.8, .85, 1.) * max(star, 0.) * .9 * (1. - smoothstep(R0 * .85, R0 * 1.2, r) * .4);

      float fade = uIntro * (1. - smoothstep(.55, 1., uScroll));
      col = 1. - exp(-col * 1.35);
      col *= fade;
      float alpha = clamp(max(col.r, max(col.g, col.b)) * 1.2, 0., 1.);
      gl_FragColor = vec4(col, alpha);
    }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uScroll = U('uScroll'), uIntro = U('uIntro'), uMouse = U('uMouse');

  const host = canvas.parentElement;
  const dpr = Math.min(devicePixelRatio, small ? 1.1 : 1.25);
  const resize = () => { const r = host.getBoundingClientRect(); canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); gl.viewport(0, 0, canvas.width, canvas.height); };
  addEventListener('resize', resize); resize();

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(), m = Math.min(r.width, r.height);
    tmx = (e.clientX - r.left - r.width / 2) / m; tmy = -(e.clientY - r.top - r.height / 2) / m;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  const t0 = performance.now(); let introStart = null;
  const started = () => document.body.classList.contains('is-in');

  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || document.documentElement.classList.contains('book-open')) return;
    const t = reduce ? 6 : (now - t0) / 1000;
    const hr = host.getBoundingClientRect();
    let ie, sc;
    if (mode === 'stat') { // ignites once when scrolled into view, each ring a little after the last
      if (introStart === null && hr.top < innerHeight * .8) introStart = now + (+canvas.dataset.delay || 0) * 1000;
      const intro = introStart === null ? 0 : Math.min(1, Math.max(0, (now - introStart) / 1800));
      ie = 1 - Math.pow(1 - intro, 3); sc = 0;
      host.classList.toggle('lit', intro > .35);
    } else if (mode === 'cta') { // the ring gathers as the closing section arrives
      const arr = Math.min(1, Math.max(0, 1 - hr.top / innerHeight)); ie = 1 - Math.pow(1 - arr, 3); sc = 0;
    } else {
      if (introStart === null && started()) introStart = now;
      const intro = introStart === null ? 0 : Math.min(1, (now - introStart) / 1600);
      ie = 1 - Math.pow(1 - intro, 3); sc = Math.min(1, Math.max(0, -hr.top / hr.height));
    }
    mx += (tmx - mx) * .08; my += (tmy - my) * .08;
    gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform1f(uTime, t); gl.uniform1f(uScroll, sc);
    gl.uniform1f(uIntro, reduce ? 1 : ie); gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
});
})();
