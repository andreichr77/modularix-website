/* eslint-disable */
// @ts-nocheck
// Journey film, blueprint style: glowing line-art on a dark grid. One module is built, loaded, shipped and set down.
// Four stages: 01 Build, 02 Load, 03 Ship, 04 Install. Every state is a pure function of scroll progress p (0..1).
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initJourneyScene() {
  let disposed = false;
  const _listeners = [];
  const requestAnimationFrame = (fn) => window.requestAnimationFrame((t) => { if (!disposed) fn(t); });
  const addEventListener = (type, fn, opts) => { window.addEventListener(type, fn, opts); _listeners.push([type, fn, opts]); };
  const T = THREE;
  let renderer = null;
  window.THREE = THREE;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = matchMedia('(max-width: 760px)').matches;
  const stage = document.getElementById('stage');
  const nowebgl = document.getElementById('nowebgl');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- renderer ---------- */
  const canvas = document.createElement('canvas'); stage.appendChild(canvas);
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { nowebgl.style.display = 'flex'; return () => { disposed = true; }; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 16 / 9, 0.5, 600);

  /* ---------- palette ---------- */
  const C = { blue: 0x4FB0FF, deep: 0x1E5FC4, cool: 0x5ED0EA, power: 0xFFB04A, it: 0x6FE3B0, ink: 0xBFD8FF, white: 0xFFFFFF, dim: 0x2E4F86 };
  const OCC = 0x050C20;

  /* ---------- line toolkit ---------- */
  class Lines {
    constructor() { this.p = []; }
    seg(a, b) { this.p.push(a[0], a[1], a[2], b[0], b[1], b[2]); return this; }
    poly(pts, close) { const n = pts.length; for (let i = 0; i < n - (close ? 0 : 1); i++) this.seg(pts[i], pts[(i + 1) % n]); return this; }
    rect(x0, z0, x1, z1, y) { return this.poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true); }
    box(x0, y0, z0, x1, y1, z1) {
      this.poly([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], true);
      this.poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], true);
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) this.seg([x, y0, z], [x, y1, z]);
      return this;
    }
    circle(cx, cy, cz, r, n, axis) {
      const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, c = Math.cos(a) * r, s = Math.sin(a) * r;
        pts.push(axis === 'x' ? [cx, cy + c, cz + s] : axis === 'y' ? [cx + c, cy, cz + s] : [cx + c, cy + s, cz]); }
      return this.poly(pts, true);
    }
    bounds(ax) { let lo = 1e9, hi = -1e9; for (let i = 0; i < this.p.length; i += 3) { const v = ax[0] * this.p[i] + ax[1] * this.p[i + 1] + ax[2] * this.p[i + 2]; lo = Math.min(lo, v); hi = Math.max(hi, v); } return [lo, hi === lo ? lo + 1 : hi]; }
    geo() { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3)); return g; }
    build(color, opacity, axis) {
      const ax = axis || [1, 0, 0], [lo, hi] = this.bounds(ax);
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
      const m = lineMat(color, opacity, ax, lo, hi); const l = new T.LineSegments(g, m); l.frustumCulled = false; return l;
    }
  }
  const lineMat = (color, opacity, axis, lo, hi) => new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uColor: { value: new T.Color(color) }, uOp: { value: opacity == null ? 1 : opacity }, uAx: { value: new T.Vector3(...(axis || [1, 0, 0])) }, uMin: { value: lo || 0 }, uMax: { value: hi || 1 }, uR: { value: 2 }, uBoost: { value: 0 } },
    vertexShader: 'uniform vec3 uAx;uniform float uMin,uMax;varying float vT;varying float vD;void main(){vT=(dot(position,uAx)-uMin)/(uMax-uMin);vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform vec3 uColor;uniform float uOp,uR,uBoost;varying float vT;varying float vD;void main(){if(vT>uR)discard;float e=1.-smoothstep(0.,.06,uR-vT);float fade=1.-smoothstep(110.,250.,vD);gl_FragColor=vec4(mix(uColor,vec3(1.),e*.75+uBoost*.25),uOp*fade*(1.+e*.9+uBoost*.6));}'
  });
  // reveal r in 0..1 sweeps along the layer's axis; beyond 1 the layer is fully drawn
  const reveal = (obj, r) => { obj.visible = r > 0.001; obj.material.uniforms.uR.value = r >= 1 ? 2 : r * 1.07 - 0.01; };
  const boost = (obj, b) => { obj.material.uniforms.uBoost.value = b; };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  /* ---------- world layout along x ---------- */
  const L = 16.35, W = 3.2, H = 3.2, DECK = 1.5, ZSHIP = -14, ZPAD = 9;
  const XA = 48, XB = 96, XS = 140;
  const world = new T.Group(); scene.add(world);
  const add = (o) => { world.add(o); return o; };

  /* ground grid on land, wave lines on water */
  (function ground() {
    // floor: dark plane that fades into the page background, with the configurator's paper-white grid
    const floor = new T.Mesh(new T.PlaneGeometry(420, 90), new T.ShaderMaterial({ transparent: true, depthWrite: false,
      uniforms: { uC: { value: new T.Color(0x08142F) } },
      vertexShader: 'varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'uniform vec3 uC;varying float vD;void main(){gl_FragColor=vec4(uC,.92*(1.-smoothstep(60.,230.,vD)));}' }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(70, -0.03, 40); floor.renderOrder = -2; add(floor);
    const minor = new Lines(), major = new Lines();
    for (let x = -100; x <= 240; x += 2) (x % 10 === 0 ? major : minor).seg([x, 0, -5], [x, 0, 85]);
    for (let z = -4; z <= 85; z += 2) (z % 10 === 0 ? major : minor).seg([-100, 0, z], [240, 0, z]);
    add(minor.build(0xEAF1FF, 0.1)); add(major.build(0xEAF1FF, 0.24));
    const wv = new Lines();
    for (let z = -7; z > -40; z -= 3.2) { const pts = []; for (let x = XA - 40; x <= XB + 40; x += 2) pts.push([x, -0.6 + Math.sin(x * 0.35 + z) * 0.08, z]); wv.poly(pts, false); }
    add(wv.build(C.deep, 0.5));
    const coast = new Lines(); coast.seg([XA - 40, 0, -5], [XB + 40, 0, -5]); coast.seg([XA - 40, -1.2, -5], [XB + 40, -1.2, -5]); add(coast.build(C.blue, 0.8));
    const road = new Lines(); road.seg([-80, 0.01, -3.6], [XS + 60, 0.01, -3.6]); road.seg([-80, 0.01, 3.6], [XS + 60, 0.01, 3.6]);
    for (let x = -80; x < XS + 60; x += 4) road.seg([x, 0.01, 0], [x + 2, 0.01, 0]); add(road.build(C.ink, 0.5));
  })();

  /* dust motes follow the module */
  const dust = (() => { const n = isPhone ? 260 : 600, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - 0.5) * 80; a[i * 3 + 1] = Math.random() * 26; a[i * 3 + 2] = (Math.random() - 0.5) * 60; }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3));
    const pts = new T.Points(g, new T.PointsMaterial({ color: C.blue, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false })); scene.add(pts); return pts; })();

  /* ---------- factory hall ---------- */
  const hall = (function () {
    const h = new Lines();
    for (let x = -12; x <= 12; x += 6) {
      for (const z of [-9, 9]) h.seg([x, 0, z], [x, 8, z]);
      h.poly([[x, 8, -9], [x, 9.6, 0], [x, 8, 9]], false); h.seg([x, 8, -9], [x, 8, 9]);
    }
    for (const z of [-9, 9]) { h.seg([-12, 8, z], [12, 8, z]); h.seg([-12, 4, z], [12, 4, z]); }
    h.seg([-12, 9.6, 0], [12, 9.6, 0]);
    h.rect(-13, -10, 13, 10, 0.02);
    // gantry crane runway beams and bridge
    h.box(-12.2, 7.6, -9.2, 12.2, 8, -8.8); h.box(-12.2, 7.6, 8.8, 12.2, 8, 9.2);
    h.box(-0.5, 7.6, -9, 0.5, 8.2, 9);
    return add(h.build(C.deep, 0.85, [1, 0, 0]));
  })();

  /* ---------- module (the Legacy container as line-art) ---------- */
  const mod = new T.Group(); scene.add(mod);
  const X0 = -L / 2, X1 = L / 2, Z0 = -W / 2, Z1 = W / 2;
  /* module as shaded, see-through solids with edge lines, built from parts that rise or fade in */
  scene.add(new T.AmbientLight(0x6F93D0, 0.6)); { const d = new T.DirectionalLight(0xE6F0FF, 0.75); d.position.set(6, 14, 9); scene.add(d); }
  const parts = [];
  function makePart(opts) {
    const g = new T.Group(), mats = [], cache = {}, part = { g, mats, rise: !!(opts && opts.rise), drop: !!(opts && opts.drop), spin: [], tw: [] };
    part.fm = (color, op) => { const k = 'f' + color + op; if (!cache[k]) { const m = new T.MeshLambertMaterial({ color, transparent: true, opacity: op, depthWrite: op > 0.6 }); mats.push({ m, base: op, kind: 'f' }); cache[k] = m; } return cache[k]; };
    part.bm = (color, op) => { const k = 'b' + color + op; if (!cache[k]) { const m = new T.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); mats.push({ m, base: op, kind: 'f' }); cache[k] = m; } return cache[k]; };
    part.lm = (color, op) => { const k = 'l' + color + op; if (!cache[k]) { const m = lineMat(color, op, [1, 0, 0], 0, 1); mats.push({ m, base: op, kind: 'l' }); cache[k] = m; } return cache[k]; };
    part.pm = (size, op) => { const k = 'p' + size + op; if (!cache[k]) { const m = new T.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false }); mats.push({ m, base: op, kind: 'f' }); cache[k] = m; } return cache[k]; };
    g.visible = false; mod.add(g); parts.push(part); return part;
  }
  function sbox(part, x0, y0, z0, x1, y1, z1, o) { // solid box plus its edges
    const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
    if (o.fill != null) { const m = new T.Mesh(geo, part.fm(o.fill, o.fo == null ? 0.92 : o.fo)); m.position.set(cx, cy, cz); part.g.add(m); }
    if (o.edge != null) { const l = new T.LineSegments(new T.EdgesGeometry(geo), part.lm(o.edge, o.eo == null ? 0.9 : o.eo)); l.position.set(cx, cy, cz); l.frustumCulled = false; part.g.add(l); }
  }
  const setPart = (part, t) => {
    part.g.visible = t > 0.002;
    for (const { m, base, kind } of part.mats) { if (kind === 'l') m.uniforms.uOp.value = base * t; else m.opacity = base * t; }
    if (part.rise) part.g.scale.y = 0.04 + 0.96 * ease(t);
    if (part.drop) part.g.position.y = (1 - ease(t)) * 1.2;
  };
  const STEEL = 0x5E7FB8, GREY = 0x7C889C, DARK = 0x0F1B38;
  // shell: AI/HPC 120 kW, 16.35 x 3.20 x 3.20 m. Insulated body in the middle, open structural bays at both ends for the chillers.
  const BX = 5.675, ZI = Z0 + 0.12;
  const shell = makePart();
  (function () {
    sbox(shell, X0, 0, Z0, X1, 0.14, Z1, { fill: 0x0B1B3E, fo: 0.97, edge: C.blue, eo: 0.8 });
    for (const x of [X0, -BX, BX, X1]) for (const z of [Z0, Z1]) { const sx = (x === X0 || x === BX) ? 1 : -1, sz = z < 0 ? 1 : -1, ax = x === -BX || x === BX ? x - 0.1 : x, bx = ax + sx * 0.2; sbox(shell, Math.min(ax, bx), 0, Math.min(z, z + sz * 0.2), Math.max(ax, bx), H, Math.max(z, z + sz * 0.2), { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.7 }); }
    for (const z of [Z0, Z1]) { const zo = z < 0 ? 0 : -0.14, zi = z < 0 ? 0.14 : 0;
      sbox(shell, X0, H - 0.14, z + zo, X1, H, z + zi, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
      sbox(shell, -BX, 0.14, z + (z < 0 ? 0 : -0.1), BX, 0.28, z + (z < 0 ? 0.1 : 0), { fill: STEEL, fo: 0.9, edge: C.ink, eo: 0.4 });
      for (const x of [-3.8, -1.9, 0, 1.9, 3.8]) sbox(shell, x - 0.05, 0.14, z + (z < 0 ? 0 : -0.1), x + 0.05, H - 0.14, z + (z < 0 ? 0.1 : 0), { fill: STEEL, fo: 0.9, edge: C.ink, eo: 0.35 }); }
    for (const x of [X0, X1]) sbox(shell, x - (x < 0 ? 0 : 0.14), H - 0.14, Z0, x + (x < 0 ? 0.14 : 0), H, Z1, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
    for (const x of [-BX, BX]) sbox(shell, x - 0.07, H - 0.14, Z0, x + 0.07, H, Z1, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
    // bay bracing, drawn as diagonals on both long faces
    const br = new Lines(); for (const sgn of [-1, 1]) { const xa = sgn * BX, xb = sgn * (L / 2 - 0.1); for (const z of [Z0, Z1]) { br.seg([xa, 0.3, z], [xb, H - 0.2, z]); br.seg([xa, H - 0.2, z], [xb, 0.3, z]); } br.seg([xb, H - 0.14, Z0], [xb, H - 0.14, Z1]); }
    const brm = new T.LineSegments(br.geo(), shell.lm(C.ink, 0.35)); brm.frustumCulled = false; shell.g.add(brm);
    for (const x of [X0 + 0.1, -4, -2, 0, 2, 4, X1 - 0.1]) for (const z of [Z0 + 0.1, Z1 - 0.1]) sbox(shell, x - 0.12, -0.1, z - 0.12, x + 0.12, 0, z + 0.12, { fill: 0x3A5BA0, fo: 0.95, edge: C.ink, eo: 0.6 });
    const wl = new Lines(); for (const z of [Z0 + 0.02, Z1 - 0.02]) for (let y = 0.6; y < H - 0.2; y += 0.42) wl.seg([-BX + 0.2, y, z], [BX - 0.2, y, z]);
    const wlm = new T.LineSegments(wl.geo(), shell.lm(C.blue, 0.22)); wlm.frustumCulled = false; shell.g.add(wlm);
    for (const z of [Z0, Z1]) { const w = new T.Mesh(new T.PlaneGeometry(2 * BX, H), shell.bm(0x6FA8FF, z < 0 ? 0.13 : 0.06)); w.position.set(0, H / 2, z); shell.g.add(w); }
    for (const x of [-BX, BX]) { const ew = new T.Mesh(new T.PlaneGeometry(W, H), shell.bm(0x6FA8FF, 0.08)); ew.rotation.y = Math.PI / 2; ew.position.set(x, H / 2, 0); shell.g.add(ew); }
    const dr = new Lines(); const dz = Z1 + 0.01; dr.poly([[3.7, 0.28, dz], [4.7, 0.28, dz], [4.7, 2.43, dz], [3.7, 2.43, dz]], true); dr.seg([3.8, 1.1, dz], [3.8, 1.35, dz]);
    const dm = new T.LineSegments(dr.geo(), shell.lm(C.ink, 0.85)); dm.frustumCulled = false; shell.g.add(dm);
  })();
  const FIRE = 0xFF5A4A;
  // cooling: a chiller in each end bay with two fans on top, six in-row units between the racks
  const cool = makePart({ rise: true });
  (function () {
    for (const sgn of [-1, 1]) {
      const xa = sgn * (BX + 0.25), xb = sgn * (L / 2 - 0.3), x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), cx = (x0 + x1) / 2;
      sbox(cool, x0, 0.3, Z0 + 0.3, x1, 2.55, Z1 - 0.3, { fill: 0x9A9A8E, fo: 0.95, edge: C.cool, eo: 0.85 });
      const lv = new Lines(); const fx = sgn < 0 ? x0 - 0.005 : x1 + 0.005; for (let y = 0.6; y < 2.4; y += 0.16) lv.seg([fx, y, Z0 + 0.5], [fx, y, Z1 - 0.5]);
      const lm = new T.LineSegments(lv.geo(), cool.lm(C.cool, 0.35)); lm.frustumCulled = false; cool.g.add(lm);
      for (const z of [-0.65, 0.65]) {
        const ring = new Lines(); ring.circle(cx, 2.57, z, 0.5, 26, 'y'); ring.circle(cx, 2.57, z, 0.1, 10, 'y');
        const rl = new T.LineSegments(ring.geo(), cool.lm(C.cool, 0.95)); rl.frustumCulled = false; rl.renderOrder = 5; cool.g.add(rl);
        const disc = new T.Mesh(new T.CircleGeometry(0.5, 26), cool.bm(0x040A1A, 0.95)); disc.rotation.x = -Math.PI / 2; disc.position.set(cx, 2.565, z); disc.renderOrder = 4; cool.g.add(disc);
        const bl = new Lines(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; bl.seg([0, 0, 0], [Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46]); bl.seg([Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46], [Math.cos(a + 0.5) * 0.34, 0, Math.sin(a + 0.5) * 0.34]); }
        const bm = new T.LineSegments(bl.geo(), cool.lm(C.cool, 0.95)); bm.position.set(cx, 2.58, z); bm.frustumCulled = false; bm.renderOrder = 6; cool.g.add(bm); cool.spin.push(bm);
      }
    }
    const pp = new Lines(); pp.poly([[-BX - 0.25, 0.5, -1.3], [-BX + 0.1, 0.5, -1.3], [BX - 0.1, 0.5, -1.3], [BX + 0.25, 0.5, -1.3]], false); pp.poly([[-BX - 0.25, 0.65, -1.3], [BX + 0.25, 0.65, -1.3]], false);
    const pm = new T.LineSegments(pp.geo(), cool.lm(0xFF5A4A, 0.6)); pm.frustumCulled = false; cool.g.add(pm);
  })();
  // the equipment row along the back wall: [type, width]; r = IT rack, c = in-row cooler
  const ROW = [['c', 0.3], ['c', 0.6], ['r', 0.8], ['r', 0.8], ['c', 0.6], ['r', 0.8], ['r', 0.8], ['c', 0.6], ['r', 0.8], ['r', 0.6], ['c', 0.6], ['c', 0.3]];
  const RZ0 = Z0 + 0.12, RZ1 = RZ0 + 1.2, RROW0 = -5.5;
  const racks = makePart({ rise: true });
  const rackLights = (function () {
    const pos = [], col = [], palette = [[0.37, 0.82, 0.92], [1, 1, 1], [0.44, 0.89, 0.69], [0.31, 0.69, 1]];
    let x = RROW0;
    for (const [t, w] of ROW) {
      if (t === 'r') {
        sbox(racks, x + 0.01, 0.14, RZ0, x + w - 0.01, 2.4, RZ1, { fill: DARK, fo: 0.97, edge: C.blue, eo: 0.9 });
        for (let u = 0; u < 15; u++) for (let k = 0; k < Math.round(w / 0.2); k++) if (Math.random() < 0.8) { const c = palette[Math.floor(Math.random() * 4)]; pos.push(x + 0.14 + k * 0.17, 0.3 + u * 0.14, RZ1 + 0.015); col.push(c[0], c[1], c[2]); }
      }
      x += w;
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    const pt = new T.Points(g, racks.pm(2.4, 0.95)); pt.frustumCulled = false; racks.g.add(pt); return pt;
  })();
  (function () {
    let x = RROW0;
    for (const [t, w] of ROW) { if (t === 'c') { sbox(cool, x + 0.01, 0.14, RZ0, x + w - 0.01, 2.4, RZ1, { fill: GREY, fo: 0.95, edge: C.cool, eo: 0.9 });
      const g = new Lines(); g.seg([x + w / 2, 0.3, RZ1 + 0.01], [x + w / 2, 2.3, RZ1 + 0.01]); const gm = new T.LineSegments(g.geo(), cool.lm(C.cool, 0.7)); gm.frustumCulled = false; cool.g.add(gm); } x += w; }
  })();
  // power: two UPS, two lithium battery cabinets, main electrical boards on the end wall
  const power = makePart({ rise: true });
  (function () {
    for (const x0 of [2.15, 3.15]) { sbox(power, x0 + 0.01, 0.14, RZ0, x0 + 0.99, 2.0, RZ0 + 0.85, { fill: 0x2A3558, fo: 0.97, edge: C.power, eo: 1 });
      const sm = new Lines(); sm.poly([[x0 + 0.1, 1.5, RZ0 + 0.86], [x0 + 0.5, 1.5, RZ0 + 0.86], [x0 + 0.5, 1.8, RZ0 + 0.86], [x0 + 0.1, 1.8, RZ0 + 0.86]], true); sm.seg([x0 + 0.7, 0.3, RZ0 + 0.86], [x0 + 0.7, 1.9, RZ0 + 0.86]);
      const sl = new T.LineSegments(sm.geo(), power.lm(C.power, 0.8)); sl.frustumCulled = false; power.g.add(sl); }
    for (const x0 of [4.2, 4.8]) sbox(power, x0 + 0.01, 0.14, RZ0, x0 + 0.59, 2.0, RZ0 + 0.85, { fill: 0x8FA3C8, fo: 0.95, edge: C.power, eo: 1 });
    for (const z0 of [-1.0, 0.1]) sbox(power, -BX + 0.12, 0.8, z0, -BX + 0.32, 2.1, z0 + 0.85, { fill: GREY, fo: 0.95, edge: C.power, eo: 0.9 });
  })();
  // clean agent fire suppression
  const fire = makePart({ rise: true });
  (function () {
    const c = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 2.0, 18), fire.fm(0xD8382E, 0.97)); c.position.set(5.2, 1.14, Z1 - 0.4); fire.g.add(c);
    const cap = new T.Mesh(new T.SphereGeometry(0.17, 14, 8), fire.fm(0xD8382E, 0.97)); cap.position.set(5.2, 2.14, Z1 - 0.4); fire.g.add(cap);
    const pl = new Lines(); pl.poly([[5.2, 2.3, Z1 - 0.4], [5.2, 2.7, Z1 - 0.4], [5.2, 2.7, Z1 - 0.15], [-5.2, 2.7, Z1 - 0.15]], false);
    const nx = [-4.6, -2.3, 0, 2.3, 4.6]; for (const x of nx) pl.seg([x, 2.7, Z1 - 0.15], [x, 2.6, Z1 - 0.15]);
    const pm = new T.LineSegments(pl.geo(), fire.lm(FIRE, 0.95)); pm.frustumCulled = false; fire.g.add(pm);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(nx.flatMap((x) => [x, 2.58, Z1 - 0.15]), 3)); g.setAttribute('color', new T.Float32BufferAttribute(nx.flatMap(() => [1, .35, .28]), 3));
    const pt = new T.Points(g, fire.pm(5, 1)); pt.frustumCulled = false; fire.g.add(pt);
  })();
  // overhead: cable trays over the row, cross beams, hot-aisle containment lid, smoke sensors and CCTV
  const over = makePart({ drop: true });
  (function () {
    for (const z of [-1.1, -0.55]) sbox(over, -5.4, 2.62, z - 0.17, 5.4, 2.74, z + 0.17, { fill: DARK, fo: 0.95, edge: C.power, eo: 0.95 });
    sbox(over, -5.4, 2.5, -0.28, 2.0, 2.54, 0.05, { edge: C.blue, eo: 0.7 });
    for (let x = -5.2; x <= 5.3; x += 1.3) sbox(over, x - 0.04, 2.97, Z0 + 0.12, x + 0.04, 3.07, Z1 - 0.12, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
    for (const [x, z] of [[-BX + 0.3, Z1 - 0.2], [BX - 0.3, Z1 - 0.2], [-BX + 0.3, Z0 + 0.2], [BX - 0.3, Z0 + 0.2]]) sbox(over, x - 0.1, 2.9, z - 0.08, x + 0.1, 3.05, z + 0.08, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.8 });
    const pos = [], col = []; for (let x = -4.8; x <= 5; x += 1.6) for (const z of [-0.2, 1.0]) { pos.push(x, 2.93, z); col.push(1, 0.29, 0.23); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
    const pt = new T.Points(g, over.pm(5, 1)); pt.frustumCulled = false; over.g.add(pt);
  })();
  const liveRing = (() => { const r = new Lines(); r.circle(0, 0.03, 0, 1, 64, 'y'); const o = r.build(C.it, 0, [1, 0, 0]); o.visible = false; scene.add(o); return o; })();

  /* ---------- hoists: spreader and slings, positions rewritten every frame ---------- */
  function makeHoist(color) {
    const pos = new Float32Array(10 * 6), g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3));
    const m = lineMat(color || C.ink, 0.9, [1, 0, 0], 0, 1); const o = new T.LineSegments(g, m); o.frustumCulled = false; scene.add(o);
    return { o, set(tx, topY, tz, x, y, z, len) {
      const a = (i, p) => { pos.set(p, i * 6); }, h = len / 2, s = [], zz = 0.3;
      const P = [[x - h, y, z - zz], [x + h, y, z - zz], [x + h, y, z + zz], [x - h, y, z + zz]];
      let k = 0; const push = (p, q) => { pos.set([p[0], p[1], p[2], q[0], q[1], q[2]], k * 6); k++; };
      push(P[0], P[1]); push(P[1], P[2]); push(P[2], P[3]); push(P[3], P[0]);
      const hookY = Math.min(topY - 0.4, y + 2.6), hook = [x, hookY, z];
      for (const p of P) push(p, hook);
      push(hook, [tx, topY, tz]); push([tx - 0.5, topY, tz], [tx + 0.5, topY, tz]);
      g.attributes.position.needsUpdate = true; g.setDrawRange(0, k * 2); } };
  }
  const hoF = makeHoist(), hoA = makeHoist(), hoB = makeHoist(), hoS = makeHoist();

  /* ---------- factory gantry bridge, quay cranes, mobile crane ---------- */
  function quay(x) {
    const q = new Lines();
    q.box(x - 16, -1.2, -5, x + 16, 0, 12);
    for (let i = -3; i <= 3; i++) q.circle(x + i * 4, 0.45, -4.6, 0.22, 10, 'y');
    for (const dx of [-11, 11]) { q.seg([x + dx, 0, 6], [x + dx, 16, 6]); q.box(x + dx - 0.7, 16, 5.7, x + dx + 0.7, 16.2, 6.3); }
    // portal crane
    for (const dx of [-4, 4]) for (const z of [-3.6, 3.6]) q.box(x + dx - 0.25, 0, z - 0.25, x + dx + 0.25, 22, z + 0.25);
    for (const dx of [-4, 4]) q.box(x + dx - 0.25, 21.8, -3.85, x + dx + 0.25, 22.4, 3.85);
    q.box(x - 4.2, 22.4, -0.4, x + 4.2, 23.2, 0.4);
    q.box(x - 0.6, 22.6, -26, x + 0.6, 23.4, 0.4); q.seg([x, 23.4, -26], [x, 30, -4]); q.seg([x, 30, -4], [x, 23.4, 3]); q.seg([x, 30, -4], [x, 23, -26]);
    return add(q.build(C.blue, 0.8, [0, 1, 0]));
  }
  quay(XA); quay(XB);
  const bridge = (() => { const b = new Lines(); b.box(-0.4, 8.4, -9, 0.4, 8.8, 9); return add(b.build(C.ink, 0.9, [1, 0, 0])); })();

  const site = new T.Group(); world.add(site); site.position.x = XS;
  const SU = (function () {
    const s = new Lines();
    s.rect(L / 2 * -1 - 1, ZPAD - W / 2 - 1, L / 2 + 1, ZPAD + W / 2 + 1, 0.04); s.rect(-L / 2 - 0.6, ZPAD - W / 2 - 0.6, L / 2 + 0.6, ZPAD + W / 2 + 0.6, 0.04);
    for (let x = -L / 2 - 0.8; x < L / 2 + 0.8; x += 0.7) s.seg([x, 0.04, ZPAD - W / 2 - 1], [x + 0.5, 0.04, ZPAD + W / 2 + 1]);
    for (let i = 0; i < 12; i++) s.seg([-18 + i * 3.3, 0, 20], [-18 + i * 3.3, 1.8, 20]); s.seg([-18, 1.7, 20], [18, 1.7, 20]);
    s.box(-14, 0, 11, -10, 2.8, 13.4); // site cabin
    site.add(s.build(C.blue, 0.8, [1, 0, 0]));
    const gen = new Lines(); for (const z of [14.2, 16.8]) { gen.box(3.2, 0, z - 0.9, 7.2, 2.0, z + 0.9); gen.circle(7.2, 1.0, z, 0.5, 12, 'x'); } site.add(gen.build(C.power, 0.85, [1, 0, 0]));
    const cab = new Lines(); cab.poly([[3.2, 0.3, 14.2], [L / 2 + 0.2, 0.3, 14.2], [L / 2 + 0.2, 0.3, ZPAD + 0.5]], false); cab.poly([[3.2, 0.3, 16.8], [L / 2 + 0.6, 0.3, 16.8], [L / 2 + 0.6, 0.3, ZPAD + 0.9]], false);
    const cabO = cab.build(C.power, 0, [1, 0, 0]); site.add(cabO);
    // mobile crane: chassis, outriggers, turret, boom
    const cr = new T.Group(); site.add(cr); cr.position.set(-11, 0, 6.8);
    const c = new Lines(); c.box(-3.5, 0.5, -1.5, 3.5, 1.5, 1.5); c.box(1.8, 1.5, -1.3, 3.6, 3.4, 0.2);
    for (const x of [-2.4, -1, 2.2]) for (const z of [-1.5, 1.5]) c.circle(x, 0.6, z, 0.6, 14, 'z');
    for (const x of [-2.8, 2.8]) for (const z of [-1, 1]) { c.seg([x, 0.8, z * 1.5], [x, 0.1, z * 3.6]); c.box(x - 0.4, 0, z * 3.6 - 0.4, x + 0.4, 0.15, z * 3.6 + 0.4); }
    cr.add(c.build(C.blue, 0.85, [1, 0, 0]));
    const turret = new T.Group(); cr.add(turret); turret.position.y = 1.5;
    const t = new Lines(); t.box(-1.8, 0, -1.2, 1.2, 1.4, 1.2); turret.add(t.build(C.ink, 0.9, [1, 0, 0]));
    const boom = new T.Group(); turret.add(boom); boom.position.set(0.5, 1.2, -0.4);
    const bm = new Lines(); const BL = 23; for (const [y, z] of [[-.35, -.35], [.35, -.35], [-.35, .35], [.35, .35]]) bm.seg([0, y, z], [BL, y * .5, z * .5]);
    for (let x = 0; x < BL; x += 1.6) { const k = 1 - x / BL * 0.5; bm.seg([x, -.35 * k, -.35 * k], [x + .8, .35 * k, -.35 * k]); bm.seg([x, -.35 * k, .35 * k], [x + .8, .35 * k, .35 * k]); }
    boom.add(bm.build(C.ink, 0.9, [1, 0, 0]));
    const tip = new T.Object3D(); tip.position.set(BL, 0, 0); boom.add(tip);
    return { cr, turret, boom, tip, cabO, BL };
  })();

  /* ---------- vehicles and ship from the models, drawn as edges over a dark body ---------- */
  const loader = new GLTFLoader();
  const occMat = new T.MeshBasicMaterial({ color: OCC, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  function bakeModel(root, angle) {
    root.updateMatrixWorld(true); const geos = [];
    root.traverse((n) => { if (n.isMesh) { const g = n.geometry.clone(); g.applyMatrix4(n.matrixWorld); if (!g.attributes.normal) g.computeVertexNormals(); geos.push({ g, e: new T.EdgesGeometry(g, angle) }); } });
    return geos;
  }
  // lengthen the low-bed without squashing its wheels: only the wheel-free middle section is stretched
  function stretchBed(geos, extra) {
    const bb = new T.Box3(); for (const { g } of geos) { g.computeBoundingBox(); bb.union(g.boundingBox); }
    const cz = (bb.min.z + bb.max.z) / 2, h = (bb.max.z - bb.min.z) / 2, a = cz - 0.25 * h, b = cz + 0.25 * h, k = (b - a + extra) / (b - a);
    return geos.map(({ g }) => { const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) { const z = pos.getZ(i); pos.setZ(i, z < a ? z - extra / 2 : z > b ? z + extra / 2 : a - extra / 2 + (z - a) * k); }
      pos.needsUpdate = true; g.computeBoundingBox(); g.computeVertexNormals(); return { g, e: new T.EdgesGeometry(g, 30) }; });
  }
  const shipOcc = new T.MeshLambertMaterial({ color: 0x24457F, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  function dress(geos, color, opacity, occ) {
    const grp = new T.Group();
    for (const { g, e } of geos) { const m = new T.Mesh(g, occ || occMat); grp.add(m); const l = new T.LineSegments(e, lineMat(color, opacity, [1, 0, 0], 0, 1)); l.frustumCulled = false; grp.add(l); }
    return grp;
  }
  const rigs = [], rigTpl = { truck: null, trailer: null };
  function makeRig() { const g = new T.Group(); scene.add(g); rigs.push(g); return g; }
  function fillRig(g) { // forward is +X, models face +Z; container centre sits at the group origin
    const inner = new T.Group(); inner.rotation.y = Math.PI / 2; g.add(inner);
    const t = dress(rigTpl.truck, C.cool, 0.95); t.position.set(0, 0, 12.2); inner.add(t);
    const tr = dress(rigTpl.trailer, C.blue, 0.9); tr.position.set(0, 0.2, 1.6); inner.add(tr);
  }
  const truckA = makeRig(), truckB = makeRig();
  const SHIP_LEN = 52, SHIP_S = SHIP_LEN / 7.79, KEEL = -2.0, FLOORY = KEEL + 5.67, SHIPY = FLOORY + 0.02;
  const ship = new T.Group(); scene.add(ship);
  let loaded = 0; const need = 3;
  const done = () => { if (++loaded === need) { rigs.forEach(fillRig); } };
  loader.load('/models/scania-line.glb', (gl) => { rigTpl.truck = bakeModel(gl.scene, 32); done(); });
  loader.load('/models/flatbed-line.glb', (gl) => { { const geos = bakeModel(gl.scene, 30); const bb = new T.Box3(); geos.forEach(({ g }) => { g.computeBoundingBox(); bb.union(g.boundingBox); }); rigTpl.trailer = stretchBed(geos, 0.35 * (bb.max.z - bb.min.z)); } done(); });
  loader.load('/models/cargo-ship-line.glb', (gl) => {
    const m = gl.scene; m.rotation.y = Math.PI; m.scale.setScalar(SHIP_S); m.position.set(-0.4 * SHIP_S, KEEL + 1.05 * SHIP_S, 0);
    const wrap = new T.Group(); wrap.add(m); wrap.updateMatrixWorld(true);
    ship.add(dress(bakeModel(m, 14), C.ink, 0.9, shipOcc));
    // three Legacy modules (6.00 x 3.20 x 3.20 m) stowed at the stern: frame, wall ribs, door and outdoor units on the end wall
    const fb = new Lines(), SX = -12.6, MH = 3.2;
    for (let j = -1; j <= 1; j++) {
      const x0 = SX - 3, x1 = SX + 3, z0 = j * 3.4 - 1.6, z1 = j * 3.4 + 1.6, y0 = FLOORY, y1 = FLOORY + MH;
      fb.box(x0, y0, z0, x1, y1, z1);
      for (const z of [z0, z1]) { fb.seg([x0, y0 + 0.3, z], [x1, y0 + 0.3, z]); fb.seg([x0, y1 - 0.3, z], [x1, y1 - 0.3, z]); for (const x of [-1.5, 0, 1.5]) fb.seg([SX + x, y0, z], [SX + x, y1, z]); }
      const dz = z1 + 0.01; fb.poly([[SX - 2.4, y0 + 0.15, dz], [SX - 1.4, y0 + 0.15, dz], [SX - 1.4, y0 + 2.3, dz], [SX - 2.4, y0 + 2.3, dz]], true);
      for (const [zc, yo] of [[-0.55, 0.3], [0.55, 0.3], [-0.55, 1.75], [0.55, 1.75]]) fb.box(x1 + 0.02, y0 + yo, j * 3.4 + zc - 0.4, x1 + 0.4, y0 + yo + 1.3, j * 3.4 + zc + 0.4);
    }
    ship.add(fb.build(C.dim, 0.9, [1, 0, 0])); done();
  });
  scene.add(ship);

  /* ---------- timeline helpers ---------- */
  const camKeys = [
    { p: 0.00, t: -0.15, ph: 0.30, d: 29, ty: 1.8 }, { p: 0.12, t: 0.20, ph: 0.55, d: 16, ty: 1.4 }, { p: 0.22, t: 0.25, ph: 0.50, d: 17, ty: 1.6 }, { p: 0.27, t: 0.45, ph: 0.34, d: 26, ty: 2.2 },
    { p: 0.34, t: 0.30, ph: 0.30, d: 30, ty: 3.0 }, { p: 0.46, t: 0.95, ph: 0.24, d: 30, ty: 2.0 }, { p: 0.52, t: 0.50, ph: 0.42, d: 40, ty: 6 },
    { p: 0.62, t: -0.30, ph: 0.55, d: 46, ty: 5 }, { p: 0.70, t: 0.80, ph: 0.34, d: 50, ty: 3 }, { p: 0.78, t: 0.45, ph: 0.48, d: 40, ty: 6 },
    { p: 0.86, t: 1.20, ph: 0.26, d: 30, ty: 2.4 }, { p: 0.94, t: 0.70, ph: 0.46, d: 36, ty: 4 }, { p: 1.00, t: 0.45, ph: 0.36, d: 28, ty: 2.4 }];
  function camAt(p) { let a = camKeys[0], b = camKeys[camKeys.length - 1];
    for (let i = 0; i < camKeys.length - 1; i++) if (p >= camKeys[i].p && p <= camKeys[i + 1].p) { a = camKeys[i]; b = camKeys[i + 1]; break; }
    const t = ease(seg(p, a.p, b.p)); return { t: lerp(a.t, b.t, t), ph: lerp(a.ph, b.ph, t), d: lerp(a.d, b.d, t) * (isPhone ? 1.25 : 1) * (1.45 + 0.3 * (1 - seg(p, 0.22, 0.3))), ty: lerp(a.ty, b.ty, t) }; }

  const labelEl = document.getElementById('labels'), LBL = [];
  const mk = (text, pos, show, side) => { const el = document.createElement('div'); el.className = 'lbl' + (side ? ' ' + side : ''); el.innerHTML = '<i></i><span>' + text + '</span>'; if (labelEl) labelEl.appendChild(el); LBL.push({ el, pos, show }); };
  const rackW = () => new T.Vector3(mod.position.x - 2.6, mod.position.y + 2.5, mod.position.z - 1.0);
  const at = (x, y, z) => () => new T.Vector3(mod.position.x + x, mod.position.y + y, mod.position.z + z);
  mk('Cooling and fans', at(6.9, 3.2, 0), (p, asm) => p < 0.26 && asm > 0.2 && asm < 0.5);
  mk('Power and UPS', at(3.3, 2.2, -1.0), (p, asm) => p < 0.26 && asm > 0.4 && asm < 0.6);
  mk('Clean agent fire suppression', at(5.2, 2.4, 1.2), (p, asm) => p < 0.26 && asm > 0.52 && asm < 0.72);
  mk('IT racks', at(-2.6, 2.5, -1.0), (p, asm) => p < 0.26 && asm > 0.8 && asm < 0.97);
  mk('Smoke detection', at(0, 3.1, 0.3), (p, asm) => p < 0.26 && asm > 0.97);
  mk('Cargo ship', () => new T.Vector3(ship.position.x - 6, 12, ZSHIP), (p) => p >= 0.56 && p < 0.7);
  mk('Quay crane', () => new T.Vector3(XA, 23, 0), (p) => p >= 0.5 && p < 0.62);
  mk('Mobile crane', () => { const v = new T.Vector3(); SU.boom.getWorldPosition(v); return v; }, (p) => p >= 0.9 && p < 0.99);
  mk('Generators', () => new T.Vector3(XS + 5.2, 2.4, 15.5), (p) => p >= 0.96);
  const proj = new T.Vector3();
  function placeLabels(p, asm) { for (const l of LBL) { const on = l.show(p, asm); proj.copy(l.pos()).project(camera);
      const vis = on && proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1; l.el.classList.toggle('on', vis);
      if (vis) l.el.style.transform = 'translate(' + ((proj.x * 0.5 + 0.5) * innerWidth).toFixed(1) + 'px,' + ((-proj.y * 0.5 + 0.5) * innerHeight).toFixed(1) + 'px)'; } }

  const STAGES = [{ n: 'Build', loc: 'Factory hall' }, { n: 'Load', loc: 'Factory to quay' }, { n: 'Ship', loc: 'Quay and open water' }, { n: 'Install', loc: 'Customer site' }];
  const BEATS = [0, 0.26, 0.52, 0.80];

  function update(p, time) {
    // ---- 01 build: the module is always there; only the inside is built as you scroll ----
    const asm = seg(p, 0.03, 0.24);
    setPart(shell, 1); setPart(cool, ease(seg(asm, 0.0, 0.22))); setPart(power, ease(seg(asm, 0.18, 0.38))); setPart(fire, ease(seg(asm, 0.34, 0.48)));
    setPart(racks, ease(seg(asm, 0.44, 0.78))); setPart(over, ease(seg(asm, 0.74, 1)));
    const live = ease(seg(p, 0.975, 1.0));
    for (const pt of parts) for (const { m, kind } of pt.mats) if (kind === 'l') m.uniforms.uBoost.value = live;
    rackLights.material.opacity = (0.8 + 0.2 * Math.sin(time * 0.01)) * (0.7 + 0.3 * live) * ease(seg(asm, 0.5, 1));
    for (const f of cool.spin) f.rotation.y = time * 0.009;
    // ---- positions ----
    let cx = 0, cy = 0, cz = 0;
    const liftA = ease(seg(p, 0.27, 0.31)), lowerA = ease(seg(p, 0.37, 0.41)), backA = ease(seg(p, 0.30, 0.37)), roadA = ease(seg(p, 0.42, 0.52));
    // the rig waits in front of the module, then reverses under it once it hangs from the crane
    const truckAx = lerp(25, 0, backA) + lerp(0, XA, roadA);
    const LIFT = 4.7;
    cy = LIFT * liftA - (LIFT - DECK) * lowerA;
    if (p >= 0.41) { cx = truckAx; cy = DECK; }
    // port A: quay crane lifts to the ship
    const liftP = ease(seg(p, 0.52, 0.555)), travP = ease(seg(p, 0.555, 0.60)), lowP = ease(seg(p, 0.60, 0.64));
    let hA = null;
    if (p >= 0.52) { cx = XA; cy = lerp(DECK, 13, liftP) - lerp(0, 13 - SHIPY, lowP); cz = lerp(0, ZSHIP, travP); }
    truckA.position.set(truckAx + (p >= 0.54 ? lerp(0, 90, ease(seg(p, 0.54, 0.62))) : 0), 0, 0); truckA.visible = p < 0.62;
    // sea: ship sails A to B, container rides in the hold
    const sail = ease(seg(p, 0.64, 0.72)), bob = Math.sin(time * 0.0012) * 0.1 * (p >= 0.5 && p < 0.8 ? 1 : 0);
    const shipX = lerp(XA, XB, sail); ship.position.set(shipX, bob, ZSHIP); ship.visible = p >= 0.46;
    if (p >= 0.64 && p < 0.72) { cx = shipX; cy = SHIPY + bob; cz = ZSHIP; }
    // port B: quay crane lifts to truck B
    const liftB = ease(seg(p, 0.72, 0.745)), travB = ease(seg(p, 0.745, 0.775)), lowB = ease(seg(p, 0.775, 0.80));
    if (p >= 0.72) { cx = XB; cy = lerp(SHIPY, 13, liftB) - lerp(0, 13 - DECK, lowB); cz = lerp(ZSHIP, 0, travB); }
    const truckBx = lerp(XB + 70, XB, ease(seg(p, 0.64, 0.72))) + lerp(0, XS - XB, ease(seg(p, 0.80, 0.88))) + lerp(0, 40, ease(seg(p, 0.94, 1.0)));
    truckB.position.set(truckBx, 0, 0); truckB.visible = p >= 0.64;
    if (p >= 0.80) { cx = truckBx; cy = DECK; cz = 0; }
    // site: mobile crane sets it on the pad
    const liftS = ease(seg(p, 0.88, 0.915)), travS = ease(seg(p, 0.915, 0.95)), lowS = ease(seg(p, 0.95, 0.975));
    if (p >= 0.88) { cx = XS; cy = lerp(DECK, DECK + 3.2, liftS) - lerp(0, DECK + 3.2, lowS); cz = lerp(0, ZPAD, travS); }
    mod.position.set(cx, cy, cz);
    // ---- hoists ----
    const hoistHide = (h) => { h.o.visible = false; };
    const hang = (h, topY, tx, tz, y) => { h.o.visible = true; h.set(tx, topY, tz, cx, y, cz, L); };
    const topY = cy + H;
    if (p >= 0.27 && p < 0.42) hang(hoF, 8.9, cx, cz, topY + 0.05); else hoistHide(hoF);
    if (p >= 0.52 && p < 0.66) hang(hoA, 23, cx, cz, topY + 0.05); else hoistHide(hoA);
    if (p >= 0.72 && p < 0.82) hang(hoB, 23, cx, cz, topY + 0.05); else hoistHide(hoB);
    if (p >= 0.88) { SU.cr.parent.updateMatrixWorld(true); const crW = new T.Vector3(); SU.turret.getWorldPosition(crW);
      const pivot = new T.Vector3(); SU.boom.getWorldPosition(pivot); const tx = (cx), tz = (cz);
      const dx = tx - pivot.x, dz = tz - pivot.z, dh = Math.hypot(dx, dz);
      SU.turret.rotation.y = Math.atan2(-dz, dx); SU.boom.rotation.z = Math.acos(clamp(dh / SU.BL, 0, 1)); SU.turret.updateMatrixWorld(true);
      const tipW = new T.Vector3(); SU.tip.getWorldPosition(tipW); hoS.o.visible = p < 0.985; h4(tipW); }
    else { hoS.o.visible = false; SU.turret.rotation.y = 0; SU.boom.rotation.z = 0.9; }
    function h4(tipW) { hoS.set(tipW.x, tipW.y, tipW.z, cx, topY + 0.05, cz, L); }
    // overhead lines glow when live
    SU.cabO.visible = live > 0; SU.cabO.material.uniforms.uOp.value = live;
    liveRing.visible = live > 0; liveRing.material.uniforms.uOp.value = (1 - ((time * 0.0004) % 1)) * 0.8 * live; { const s = 4 + ((time * 0.0004) % 1) * 9; liveRing.scale.set(s, 1, s); liveRing.position.set(cx, 0, cz); }
    // ---- camera ----
    const k = camAt(p), tgt = new T.Vector3(cx, cy + k.ty, cz), sh = camera.aspect > 1.2 ? k.d * 0.17 : 0; tgt.x -= Math.cos(k.t) * sh; tgt.z += Math.sin(k.t) * sh;
    camera.position.set(tgt.x + k.d * Math.cos(k.ph) * Math.sin(k.t), tgt.y + k.d * Math.sin(k.ph), tgt.z + k.d * Math.cos(k.ph) * Math.cos(k.t)); camera.lookAt(tgt);
    dust.position.set(cx, 0, cz);
    return { cx, cy, cz };
  }

  /* ---------- DOM: copy, HUD, scroll ---------- */
  const copies = [...document.querySelectorAll('#copy .copy')], chips = [...document.querySelectorAll('#hud .chip')], bars = [...document.querySelectorAll('#hud .chip i')];
  const sheet = document.getElementById('sheet'), hint = document.getElementById('hint'), pbar = document.getElementById('pbar');
  const tStage = document.getElementById('t-stage'), tLoc = document.getElementById('t-loc'), tPct = document.getElementById('t-pct'), tState = document.getElementById('t-state'), hudPct = document.getElementById('hud-pct');
  let curBeat = -1;
  function setBeat(i) { if (i === curBeat) return; curBeat = i;
    copies.forEach((c, j) => c.classList.toggle('on', j === i)); chips.forEach((c, j) => { c.classList.toggle('on', j === i); c.classList.toggle('done', j < i); });
    sheet.textContent = copies[i].dataset.sheet; hint.classList.toggle('off', i > 0);
    if (tStage) tStage.textContent = '0' + (i + 1) + ' / 04 ' + STAGES[i].n.toUpperCase(); if (tLoc) tLoc.textContent = STAGES[i].loc; }
  let progress = 0;
  ScrollTrigger.create({ trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: reduced ? false : 0.5, onUpdate: (s) => { progress = s.progress; } });
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); const a = w / h; camera.aspect = a; camera.fov = a >= 16 / 9 ? 32 : Math.min(62, 2 * Math.atan(Math.tan(16 * Math.PI / 180) * (16 / 9) / a) * 180 / Math.PI); camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  let smoothP = 0;
  function render(t, force) {
    const target = reduced ? 1 : progress; smoothP = force ? target : smoothP + (target - smoothP) * 0.18; if (Math.abs(target - smoothP) < 0.0005) smoothP = target;
    const p = smoothP; update(p, t);
    let b = 0; for (let i = 0; i < BEATS.length; i++) if (p >= BEATS[i] - 0.002) b = i; setBeat(b);
    bars.forEach((el, j) => { const lo = BEATS[j], hi = j < 3 ? BEATS[j + 1] : 1; el.style.transform = 'scaleX(' + clamp((p - lo) / (hi - lo), 0, 1).toFixed(3) + ')'; });
    const pc = Math.round(p * 100); if (tPct) tPct.textContent = pc + '%'; if (hudPct) hudPct.textContent = pc + '%';
    if (tState) tState.textContent = p >= 0.975 ? 'LIVE' : p >= 0.88 ? 'SETTING DOWN' : p >= 0.8 ? 'ON THE ROAD' : p >= 0.64 ? 'AT SEA' : p >= 0.52 ? 'LIFT' : p >= 0.35 ? 'ON THE ROAD' : p >= 0.26 ? 'LIFT' : 'ASSEMBLY';
    pbar.style.width = (p * 100).toFixed(2) + '%';
    placeLabels(p, seg(p, 0.03, 0.24));
    renderer.render(scene, camera);
  }
  function loop(t) { render(t, false); requestAnimationFrame(loop); } requestAnimationFrame(loop);
  window.__mx = { scene, ship, camera, get progress() { return progress; }, get beat() { return curBeat; }, tick() { ScrollTrigger.update(); render(performance.now(), true); }, update };

  return () => {
    disposed = true;
    _listeners.forEach(([t, f, o]) => window.removeEventListener(t, f, o));
    ScrollTrigger.getAll().forEach((s) => s.kill());
    gsap.globalTimeline.clear();
    try { renderer.dispose(); renderer.forceContextLoss(); canvas.remove(); } catch (e) {}
    document.documentElement.classList.remove('js');
  };
}
