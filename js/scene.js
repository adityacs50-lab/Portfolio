/* ═══════════════════════════════════════════════════════════════
   THE BUILDER'S CODEX — the fourth dimension
   A live point-cloud survey terrain (GPU shader) behind the folio.
   Scroll traverses the scan; time makes it breathe. Degrades to the
   static etching under reduced-motion, no WebGL, or import failure.
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    canvas.remove();
    return;
  }

  var INK = new THREE.Color('#0C0B09');
  var SLATE_DEEP = new THREE.Color('#22303C');
  var SLATE_LIT = new THREE.Color('#8FA0B0');
  var BRASS = new THREE.Color('#C9A227');
  var OXBLOOD = new THREE.Color('#A03A34');

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);

  /* ── the survey grid ───────────────────────────────────────── */
  var small = Math.min(window.innerWidth, window.innerHeight) < 640;
  var COLS = small ? 130 : 210;
  var ROWS = small ? 80 : 130;
  var W = 260, D = 170;
  var COUNT = COLS * ROWS;

  var positions = new Float32Array(COUNT * 3);
  var seeds = new Float32Array(COUNT);
  var i = 0;
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      positions[i * 3] = (c / (COLS - 1) - 0.5) * W;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (r / (ROWS - 1) - 0.5) * D;
      seeds[i] = Math.random();
      i++;
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  var uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uSize: { value: (small ? 1.7 : 1.55) * dpr },
    uInk: { value: INK },
    uSlateDeep: { value: SLATE_DEEP },
    uSlateLit: { value: SLATE_LIT },
    uBrass: { value: BRASS },
    uOxblood: { value: OXBLOOD }
  };

  var mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'uniform float uTime;',
      'uniform float uScroll;',
      'uniform float uSize;',
      'attribute float aSeed;',
      'varying float vElev;',
      'varying float vLine;',
      'varying float vSeed;',
      'varying float vFade;',

      // simplex noise (Ashima / Ian McEwan, public domain)
      'vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x, 289.0); }',
      'float snoise(vec2 v){',
      '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);',
      '  vec2 i = floor(v + dot(v, C.yy));',
      '  vec2 x0 = v - i + dot(i, C.xx);',
      '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
      '  vec4 x12 = x0.xyxy + C.xxzz;',
      '  x12.xy -= i1;',
      '  i = mod(i, 289.0);',
      '  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
      '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
      '  m = m*m; m = m*m;',
      '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
      '  vec3 h = abs(x) - 0.5;',
      '  vec3 ox = floor(x + 0.5);',
      '  vec3 a0 = x - ox;',
      '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
      '  vec3 g;',
      '  g.x = a0.x * x0.x + h.x * x0.y;',
      '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
      '  return 130.0 * dot(m, g);',
      '}',

      'void main() {',
      '  vSeed = aSeed;',
      '  vec3 p = position;',
      // traverse the scan as the reader scrolls; drift gently with time
      '  vec2 q = vec2(p.x * 0.016, (p.z + uScroll * 130.0) * 0.016);',
      '  float t = uTime * 0.045;',
      '  float h = snoise(q + t * 0.35);',
      '  h += 0.5 * snoise(q * 2.1 - t * 0.25);',
      '  h += 0.25 * snoise(q * 4.3 + t * 0.15);',
      '  h /= 1.75;',
      '  float amp = 11.0 + uScroll * 7.0;',
      '  p.y = h * amp;',
      '  vElev = h * 0.5 + 0.5;',
      // topographic banding: brass contour lines at elevation intervals
      '  float f = fract(vElev * 12.0);',
      '  vLine = 1.0 - smoothstep(0.0, 0.07, min(f, 1.0 - f));',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  float dist = -mv.z;',
      '  vFade = clamp(1.0 - (dist - 55.0) / 150.0, 0.0, 1.0);',
      '  gl_PointSize = min(uSize * (1.0 + vLine * 0.7 + step(0.9965, aSeed) * 1.0) * (240.0 / dist), uSize * 3.4);',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uSlateDeep;',
      'uniform vec3 uSlateLit;',
      'uniform vec3 uBrass;',
      'uniform vec3 uOxblood;',
      'varying float vElev;',
      'varying float vLine;',
      'varying float vSeed;',
      'varying float vFade;',

      'void main() {',
      '  vec2 uv = gl_PointCoord - 0.5;',
      '  float d = length(uv);',
      '  if (d > 0.5) discard;',
      '  float soft = 1.0 - smoothstep(0.18, 0.5, d);',
      '  vec3 col = mix(uSlateDeep, uSlateLit, vElev * vElev);',
      '  col = mix(col, uBrass, vLine * 0.8);',
      // rare oxblood beacons — survey markers in the dark
      '  if (vSeed > 0.9965) col = uOxblood;',
      '  float alpha = soft * vFade * (0.13 + vLine * 0.3 + step(0.9965, vSeed) * 0.28);',
      '  gl_FragColor = vec4(col, alpha);',
      '}'
    ].join('\n')
  });

  var points = new THREE.Points(geo, mat);
  scene.add(points);

  /* ── camera choreography: scroll is the dolly track ────────── */
  var scrollT = 0, scrollTarget = 0;
  var mouseX = 0, mouseY = 0, mx = 0, my = 0;

  function readScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  var clock = new THREE.Clock();
  var running = true;

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) { clock.getDelta(); tick(); }
  });

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);

    var t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    // easings keep the flight cinematic, never twitchy
    scrollT += (scrollTarget - scrollT) * 0.06;
    mx += (mouseX - mx) * 0.04;
    my += (mouseY - my) * 0.04;
    uniforms.uScroll.value = scrollT;

    var orbit = scrollT * 0.55;                 // slow yaw across the survey
    var radius = 78 - scrollT * 10.0;
    camera.position.x = Math.sin(orbit) * radius * 0.45 + mx * 5.0;
    camera.position.z = Math.cos(orbit * 0.6) * radius;
    camera.position.y = 26 + scrollT * 14.0 - my * 4.0;
    camera.lookAt(0, 4 + scrollT * 2.0, 0);

    renderer.render(scene, camera);
  }

  document.body.classList.add('has-scene');
  var hud = document.querySelector('[data-hud-pts]');
  if (hud) hud.textContent = COUNT.toLocaleString('en-US');
  tick();
})();
