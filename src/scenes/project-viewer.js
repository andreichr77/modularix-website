import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/*
 * Project viewer. Same look as the Journey module: shaded see-through solids with glowing
 * edge lines, parts that build up in sequence, spinning fans, blinking server lights.
 * Equipment and dimensions come from the offer documents and the 3D plan.
 */
const T = THREE;
const C = { blue: 0x4FB0FF, deep: 0x1E5FC4, cool: 0x5ED0EA, power: 0xFFB04A, it: 0x6FE3B0, ink: 0xBFD8FF, dim: 0x2E4F86, red: 0xFF5A4A };
const STEEL = 0x5E7FB8, GREY = 0x7C889C, DARK = 0x0F1B38, FY = 0.14;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const ease = (t) => t * t * (3 - 2 * t), seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

/* ---------- line toolkit ---------- */
class Lines {
  constructor() { this.p = []; }
  seg(a, b) { this.p.push(a[0], a[1], a[2], b[0], b[1], b[2]); return this; }
  poly(pts, close) { const n = pts.length; for (let i = 0; i < n - (close ? 0 : 1); i++) this.seg(pts[i], pts[(i + 1) % n]); return this; }
  circle(cx, cy, cz, r, n) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push([cx + Math.cos(a) * r, cy, cz + Math.sin(a) * r]); } return this.poly(pts, true); }
  geo() { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3)); return g; }
}
const lineMat = (color, opacity) => new T.ShaderMaterial({
  transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  uniforms: { uColor: { value: new T.Color(color) }, uOp: { value: opacity } },
  vertexShader: 'varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform vec3 uColor;uniform float uOp;varying float vD;void main(){gl_FragColor=vec4(uColor,uOp*(1.-smoothstep(90.,200.,vD)));}',
});

/* ---------- part kit (same idea as the Journey module) ---------- */
let mod, parts, seq, labels, pal;
const PAL = [[0.37, 0.82, 0.92], [1, 1, 1], [0.44, 0.89, 0.69], [0.31, 0.69, 1]];

function makePart(opts) {
  const g = new T.Group(), mats = [], cache = {};
  const part = { g, mats, rise: !!(opts && opts.rise), drop: !!(opts && opts.drop), spin: [], blink: [] };
  part.fm = (color, op) => { const k = 'f' + color + op; if (!cache[k]) { const m = new T.MeshLambertMaterial({ color, transparent: true, opacity: op, depthWrite: op > 0.6 }); mats.push({ m, base: op, kind: 'f' }); cache[k] = m; } return cache[k]; };
  part.bm = (color, op) => { const k = 'b' + color + op; if (!cache[k]) { const m = new T.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false, side: T.DoubleSide }); mats.push({ m, base: op, kind: 'f' }); cache[k] = m; } return cache[k]; };
  part.lm = (color, op) => { const k = 'l' + color + op; if (!cache[k]) { const m = lineMat(color, op); mats.push({ m, base: op, kind: 'l' }); cache[k] = m; } return cache[k]; };
  part.pm = (size, op) => { const m = new T.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false }); mats.push({ m, base: op, kind: 'f' }); return m; };
  g.visible = false; mod.add(g); parts.push(part); return part;
}
function stage(part, a, b) { seq.push({ part, a, b }); return part; }
function sbox(part, x0, y0, z0, x1, y1, z1, o) {
  const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  if (o.fill != null) { const m = new T.Mesh(geo, part.fm(o.fill, o.fo == null ? 0.95 : o.fo)); m.position.set(cx, cy, cz); part.g.add(m); }
  if (o.edge != null) { const l = new T.LineSegments(new T.EdgesGeometry(geo), part.lm(o.edge, o.eo == null ? 0.9 : o.eo)); l.position.set(cx, cy, cz); l.frustumCulled = false; part.g.add(l); }
}
function addLines(part, lines, color, op) { const l = new T.LineSegments(lines.geo(), part.lm(color, op)); l.frustumCulled = false; part.g.add(l); return l; }
function addPoints(part, pos, col, size, blink) {
  if (!pos.length) return;
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
  const m = part.pm(size, 0.95), pt = new T.Points(g, m); pt.frustumCulled = false; part.g.add(pt); if (blink) part.blink.push(m);
}
function label(x, y, z, text) { labels.push({ p: new T.Vector3(x, y, z), t: text }); }

/* server lights on a rack face */
function faceLights(a, face, x0, z0, w, d, h, y0) {
  const along = face[1] === 'z' ? w : d, n = Math.max(1, Math.floor(along / 0.19));
  for (let u = 0; u < Math.floor((h - 0.4) / 0.16); u++) for (let k = 0; k < n; k++) {
    if (Math.random() > 0.8) continue; const c = PAL[Math.floor(Math.random() * 4)], y = y0 + 0.25 + u * 0.16;
    const off = 0.1 + k * 0.19;
    if (face === '+z') a.pos.push(x0 + off, y, z0 + d + 0.015);
    else if (face === '-z') a.pos.push(x0 + off, y, z0 - 0.015);
    else if (face === '+x') a.pos.push(x0 + w + 0.015, y, z0 + off);
    else a.pos.push(x0 - 0.015, y, z0 + off);
    a.col.push(c[0], c[1], c[2]);
  }
}
function rack(p, a, x0, z0, w, d, h, face, hpc) {
  sbox(p, x0, FY, z0, x0 + w, FY + h, z0 + d, { fill: DARK, fo: 0.97, edge: hpc ? C.cool : C.blue, eo: 0.85 });
  faceLights(a, face, x0, z0, w, d, h, FY);
}
function inrow(p, x0, z0, w, d, h) { sbox(p, x0, FY, z0, x0 + w, FY + h, z0 + d, { fill: GREY, fo: 0.95, edge: C.cool, eo: 0.85 }); }
function cab(p, x0, z0, w, d, h, edge, o) { sbox(p, x0, FY, z0, x0 + w, FY + h, z0 + d, { fill: GREY, fo: 0.95, edge, eo: 0.95 }); if (o && o.seam) { const l = new Lines(); l.seg([x0 + w / 2, FY + 0.06, z0 - 0.01], [x0 + w / 2, FY + h - 0.06, z0 - 0.01]); l.seg([x0 + w / 2, FY + 0.06, z0 + d + 0.01], [x0 + w / 2, FY + h - 0.06, z0 + d + 0.01]); addLines(p, l, edge, 0.7); } }
/* outdoor chiller / condenser with two spinning fans on top */
function chiller(p, cx, cz, sx, sz, h) {
  sbox(p, cx - sx / 2, FY, cz - sz / 2, cx + sx / 2, FY + h, cz + sz / 2, { fill: GREY, fo: 0.95, edge: C.cool, eo: 0.85 });
  const along = sz >= sx, r = Math.min(along ? sx : sz, (along ? sz : sx) / 2) * 0.44, top = FY + h + 0.01;
  [-1, 1].forEach((s) => {
    const fx = along ? cx : cx + s * sx / 4, fz = along ? cz + s * sz / 4 : cz;
    const ring = new Lines(); ring.circle(fx, top, fz, r, 28); ring.circle(fx, top, fz, r * 0.2, 12); addLines(p, ring, C.cool, 0.95); p.g.children[p.g.children.length - 1].renderOrder = 5;
    const disc = new T.Mesh(new T.CircleGeometry(r, 28), p.bm(0x040A1A, 0.95)); disc.rotation.x = -Math.PI / 2; disc.position.set(fx, top - 0.005, fz); disc.renderOrder = 4; p.g.add(disc);
    const bl = new Lines(); for (let k = 0; k < 6; k++) { const an = k / 6 * Math.PI * 2; bl.seg([0, 0, 0], [Math.cos(an) * r * 0.92, 0, Math.sin(an) * r * 0.92]); bl.seg([Math.cos(an) * r * 0.92, 0, Math.sin(an) * r * 0.92], [Math.cos(an + 0.5) * r * 0.7, 0, Math.sin(an + 0.5) * r * 0.7]); }
    const bm = new T.LineSegments(bl.geo(), p.lm(C.cool, 0.95)); bm.position.set(fx, top + 0.01, fz); bm.frustumCulled = false; bm.renderOrder = 6; p.g.add(bm); p.spin.push(bm);
  });
}
function generator(p, cx, cz, sx, sz, h, a) {
  sbox(p, cx - sx / 2, 0.15, cz - sz / 2, cx + sx / 2, 0.15 + h, cz + sz / 2, { fill: DARK, fo: 0.97, edge: C.power, eo: 0.95 });
  sbox(p, cx - sx / 2 - 0.01, 0.15 + h * 0.46, cz - sz / 2 - 0.01, cx + sx / 2 + 0.01, 0.15 + h * 0.58, cz + sz / 2 + 0.01, { fill: 0xD8382E, fo: 0.9 });
  const ex = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.7, 12), p.fm(GREY, 0.95)); ex.position.set(cx + sx / 2 - 0.3, 0.15 + h + 0.35, cz); p.g.add(ex);
  a.pos.push(cx - sx / 2 + 0.2, 0.15 + h + 0.03, cz); a.col.push(1, 0.29, 0.23);
}
function person(p, x, z) {
  const leg = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.85, 10), p.fm(0x1A2A55, 0.97)); leg.position.set(x, FY + 0.43, z); p.g.add(leg);
  const body = new T.Mesh(new T.CylinderGeometry(0.17, 0.15, 0.62, 12), p.fm(0xFF7A2F, 0.97)); body.position.set(x, FY + 1.16, z); p.g.add(body);
  const head = new T.Mesh(new T.SphereGeometry(0.11, 12, 8), p.fm(0xEAF1FF, 0.97)); head.position.set(x, FY + 1.6, z); p.g.add(head);
}
/* space-frame truss: chords, posts, diagonals on both sides, ends and roof */
function truss(p, x0, x1, z0, z1, y0, y1, op, pitch) {
  const l = new Lines(), n = Math.max(1, Math.round((x1 - x0) / (pitch || 0.8))), dx = (x1 - x0) / n;
  for (const z of [z0, z1]) { l.seg([x0, y0, z], [x1, y0, z]); l.seg([x0, y1, z], [x1, y1, z]); for (let i = 0; i <= n; i++) { const x = x0 + i * dx; l.seg([x, y0, z], [x, y1, z]); if (i < n) { if (i % 2) l.seg([x, y0, z], [x + dx, y1, z]); else l.seg([x, y1, z], [x + dx, y0, z]); } } }
  for (const x of [x0, x1]) { l.poly([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], true); l.seg([x, y0, z0], [x, y1, z1]); l.seg([x, y0, z1], [x, y1, z0]); }
  for (let i = 0; i < n; i++) { l.seg([x0 + i * dx, y1, z0], [x0 + (i + 1) * dx, y1, z1]); l.seg([x0 + i * dx, y1, z1], [x0 + (i + 1) * dx, y1, z0]); }
  addLines(p, l, C.ink, op);
}
function frameBox(p, x0, x1, z0, z1, y0, y1, op) { const l = new Lines(); for (const y of [y0, y1]) l.poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true); for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) l.seg([x, y0, z], [x, y1, z]); addLines(p, l, C.ink, op); }
function glass(p, x0, x1, z0, z1, y1, op) {
  for (const z of [z0, z1]) { const w = new T.Mesh(new T.PlaneGeometry(x1 - x0, y1), p.bm(0x6FA8FF, z < 0 ? op * 1.6 : op)); w.position.set((x0 + x1) / 2, y1 / 2, z); p.g.add(w); }
  for (const x of [x0, x1]) { const w = new T.Mesh(new T.PlaneGeometry(z1 - z0, y1), p.bm(0x6FA8FF, op)); w.rotation.y = Math.PI / 2; w.position.set(x, y1 / 2, (z0 + z1) / 2); p.g.add(w); }
}
function door(p, x, z0, z1, y1, side) { const l = new Lines(); const zz = side; l.poly([[x, 0.2, zz], [x + 0.9, 0.2, zz], [x + 0.9, 2.2, zz], [x, 2.2, zz]], true); addLines(p, l, C.ink, 0.85); }
const slab = (p, x0, z0, x1, z1, edge) => sbox(p, x0, 0, z0, x1, FY, z1, { fill: 0x0B1B3E, fo: 0.97, edge: edge || C.blue, eo: 0.8 });
/* chilled-water pipes: supply (cool) and return (red), with drops */
function pipes(p, x0, x1, y, zs, zr, drops, dy) {
  const s = new Lines(), r = new Lines();
  s.seg([x0, y, zs], [x1, y, zs]); r.seg([x0, y, zr], [x1, y, zr]);
  for (const dx of drops) { s.seg([dx, y, zs], [dx, dy, zs]); r.seg([dx + 0.06, y, zr], [dx + 0.06, dy, zr]); }
  addLines(p, s, C.cool, 0.95); addLines(p, r, C.red, 0.95);
}
function trays(p, x0, x1, y, zs, edge) { for (const z of zs) sbox(p, x0, y, z - 0.17, x1, y + 0.12, z + 0.17, { fill: DARK, fo: 0.95, edge: edge || C.power, eo: 0.95 }); }
function sensors(p, pts) { const pos = [], col = []; for (const q of pts) { pos.push(q[0], q[1], q[2]); col.push(1, 0.29, 0.23); } addPoints(p, pos, col, 5, true); }

/* ====================================================================
   1023  AI / HPC 120 kW. 16.35 x 3.2 x 3.2 m, open truss ends with a chiller each,
   central enclosed hall: 4 x 48U + 1 x 42U racks, 4 x 600 and 2 x 300 in-row units,
   2 x 150 kW UPS, 2 battery cabinets, switchboard, 2 generators.
   ==================================================================== */
function build1023() {
  const L = 16.35, W = 3.2, H = 3.2, bx = 4.95, hx = L / 2;
  const shell = stage(makePart(), 0, 0.12);
  slab(shell, -hx, -W / 2, hx, W / 2);
  truss(shell, -hx, -bx, -W / 2, W / 2, FY, H, 0.5); truss(shell, bx, hx, -W / 2, W / 2, FY, H, 0.5);
  frameBox(shell, -bx, bx, -W / 2, W / 2, FY, H, 0.8);
  for (const x of [-bx, -bx / 2, 0, bx / 2, bx]) for (const z of [-W / 2, W / 2]) sbox(shell, x - 0.07, FY, z - 0.07, x + 0.07, H, z + 0.07, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.6 });
  glass(shell, -bx, bx, -W / 2, W / 2, H, 0.06);
  door(shell, -bx + 0.5, -W / 2, W / 2, H, W / 2 + 0.01);

  const cool = stage(makePart({ rise: true }), 0.1, 0.3);
  chiller(cool, -6.55, 0, 1.2, 3.09, 1.97); chiller(cool, 6.55, 0, 1.2, 3.09, 1.97);
  const rk = stage(makePart({ rise: true }), 0.42, 0.74), ra = { pos: [], col: [] };
  // row A faces the aisle: IR300 IR600 R48 R48 IR600 R48 R48 IR600 R42 IR600 IR300
  const rowA = [['i', 0.3], ['i', 0.6], ['r', 0.8, 2.26], ['r', 0.8, 2.26], ['i', 0.6], ['r', 0.8, 2.26], ['r', 0.8, 2.26], ['i', 0.6], ['r', 0.6, 1.99], ['i', 0.6], ['i', 0.3]];
  let x = -3.4; const irx = [];
  for (const it of rowA) { if (it[0] === 'i') { inrow(rk, x, -1.45, it[1], 1.2, 2.0); irx.push(x + it[1] / 2); } else rack(rk, ra, x, -1.45, it[1], 1.2, it[2], '+z', true); x += it[1]; }
  addPoints(rk, ra.pos, ra.col, 2.4, true);
  const pw = stage(makePart({ rise: true }), 0.24, 0.42);
  cab(pw, -3.2, 1.05, 1.2, 0.5, 2.0, C.power, { seam: true });             // distribution board, 2 sections
  cab(pw, -1.85, 0.8, 0.908, 0.6, 1.98, C.it, { seam: true }); cab(pw, -0.85, 0.8, 0.908, 0.6, 1.98, C.it, { seam: true }); // 2 x UPS
  cab(pw, 0.2, 0.8, 0.9, 0.7, 1.98, C.it); cab(pw, 1.2, 0.8, 0.9, 0.7, 1.98, C.it);                                        // 2 x Li-ion
  const fire = stage(makePart({ rise: true }), 0.38, 0.5);
  { const c = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, 1.7, 18), fire.fm(0xD8382E, 0.97)); c.position.set(4.5, 1.0, 1.3); fire.g.add(c); }
  const pp = stage(makePart({ drop: true }), 0.7, 0.86);
  pipes(pp, -6.55, 6.55, 2.7, -0.55, -0.35, irx.filter((v) => v > -4 && v < 4).concat([-6.55, 6.55]), 2.15);
  const ov = stage(makePart({ drop: true }), 0.8, 0.96);
  trays(ov, -4.7, 4.7, 2.85, [0.2], C.power); trays(ov, -3.4, 3.4, 2.62, [-0.9], C.power);
  for (let xx = -4.4; xx <= 4.5; xx += 1.1) sbox(ov, xx - 0.04, 3.0, -W / 2 + 0.1, xx + 0.04, 3.08, W / 2 - 0.1, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
  sensors(ov, [[-3.5, 3.0, -1], [-1, 3.0, 0], [1.5, 3.0, 1], [3.8, 3.0, -1], [-bx + 0.3, 2.9, 1.3], [bx - 0.3, 2.9, -1.3]]);
  const gn = stage(makePart({ rise: true }), 0.9, 1), ga = { pos: [], col: [] };
  generator(gn, hx + 2.6, -1.4, 3.0, 1.1, 1.7, ga); generator(gn, hx + 2.6, 1.4, 3.0, 1.1, 1.7, ga); addPoints(gn, ga.pos, ga.col, 5, true);
  const mid = stage(makePart(), 0.7, 1); person(mid, 0.8, 0.0);

  label(-6.55, 2.3, 0, 'Outdoor chiller'); label(6.55, 2.3, 0, 'Outdoor chiller');
  label(-0.4, 2.45, -1.45, 'AI / HPC racks'); label(-0.3, 2.2, 1.1, '2 x UPS 150 kW'); label(1.65, 2.2, 1.15, 'Li-ion storage'); label(-2.6, 2.25, 1.3, 'Switchboard'); label(hx + 2.6, 2.1, 0, '2 generator sets');
  label(-3.3, 2.3, -1.4, 'In-row cooling');
  return { L, D: W, extra: 5, inside: { x: -3.9, y: 1.65, z: 0.2, yaw: -Math.PI / 2 } };
}

/* ====================================================================
   1047  Legacy 120 kW. Seven modules, each 12.19 x 2.44 x 2.90 m: office, power,
   three IT halls, power, condenser shelter. 24 x 42U racks, 10 x 25 kW in-row DX,
   2 x 50 kW UPS, 2 battery cabinets, 2 electrical panels.
   ==================================================================== */
function build1047() {
  const L = 12.19, W = 2.44, H = 2.9, hx = L / 2;
  const types = ['office', 'power', 'it', 'it', 'it', 'power', 'cond'], irPer = [3, 3, 4];
  const D = 7 * W, shell = stage(makePart(), 0, 0.12);
  const zc = (i) => (i - 3) * W;
  types.forEach((t, i) => { const z0 = zc(i) - W / 2, z1 = zc(i) + W / 2; slab(shell, -hx, z0, hx, z1); truss(shell, -hx, hx, z0, z1, FY, H, 0.3, 1.5); });
  glass(shell, -hx, hx, -D / 2, D / 2, H, 0.05);
  door(shell, hx - 1.2, 0, 0, H, zc(0) + W / 2 + 0.01);
  const cool = stage(makePart({ rise: true }), 0.1, 0.28), pw = stage(makePart({ rise: true }), 0.24, 0.42), rk = stage(makePart({ rise: true }), 0.4, 0.78), ra = { pos: [], col: [] };
  const ov = stage(makePart({ drop: true }), 0.76, 0.94), off = stage(makePart({ rise: true }), 0.3, 0.46);
  let itIdx = 0; const pipesZ = [];
  types.forEach((t, i) => {
    const c = zc(i);
    if (t === 'cond') { [-3.8, 0, 3.8].forEach((x) => chiller(cool, x, c, 1.6, 2.1, 2.0)); label(0, 2.4, c, 'Condenser shelter, outdoor units'); }
    if (t === 'power') {
      cab(pw, -4.6, c - 0.3, 0.908, 0.6, 1.98, C.it, { seam: true }); cab(pw, -3.55, c - 0.3, 0.908, 0.6, 1.98, C.it, { seam: true });
      cab(pw, -2.2, c - 0.3, 0.9, 0.7, 1.98, C.it); cab(pw, -1.2, c - 0.3, 0.9, 0.7, 1.98, C.it);
      cab(pw, 0.8, c - 0.9, 1.2, 0.5, 2.0, C.power, { seam: true }); cab(pw, 2.4, c - 0.9, 1.2, 0.5, 2.0, C.power, { seam: true });
      if (i === 1) label(-3.5, 2.3, c, 'UPS 50 kW + Li-ion'); else label(1.5, 2.3, c - 0.7, 'Electrical panels');
    }
    if (t === 'office') {
      sbox(off, -3.2, FY, c - 0.35, -1.6, FY + 0.75, c + 0.35, { fill: GREY, fo: 0.95, edge: C.ink, eo: 0.8 });
      sbox(off, -0.4, FY, c - 0.35, 1.2, FY + 0.75, c + 0.35, { fill: GREY, fo: 0.95, edge: C.ink, eo: 0.8 });
      for (const x of [-2.4, 0.4]) { sbox(off, x - 0.25, FY + 0.75, c - 0.05, x + 0.25, FY + 1.1, c + 0.02, { fill: DARK, fo: 0.97, edge: C.blue, eo: 0.9 }); sbox(off, x - 0.2, FY, c + 0.55, x + 0.2, FY + 0.9, c + 0.9, { fill: STEEL, fo: 0.9, edge: C.ink, eo: 0.5 }); }
      label(-1.2, 1.5, c, 'Office');
    }
    if (t === 'it') {
      const n = irPer[itIdx++]; let x = -hx + 1.2; const ins = new Set(); for (let j = 1; j <= n; j++) ins.add(Math.floor(j * 8 / (n + 1)));
      for (let k = 0; k < 8; k++) { rack(rk, ra, x, c - W / 2 + 0.1, 0.75, 1.2, 1.99, '+z', false); x += 0.75; if (ins.has(k + 1)) { inrow(rk, x, c - W / 2 + 0.1, 0.3, 1.2, 2.0); x += 0.3; } }
      pipesZ.push(c); if (itIdx === 2) label(-2, 2.35, c - 0.6, '8 racks 42U, in-row DX');
    }
  });
  // refrigerant lines run along each IT hall and across to the condensers
  const pp = stage(makePart({ drop: true }), 0.7, 0.86);
  const s = new Lines(), r = new Lines();
  pipesZ.forEach((c) => { s.seg([-hx + 0.8, 2.55, c + 0.15], [hx - 0.5, 2.55, c + 0.15]); r.seg([-hx + 0.8, 2.6, c + 0.25], [hx - 0.5, 2.6, c + 0.25]); });
  s.seg([hx - 0.5, 2.55, zc(2) + 0.15], [hx - 0.5, 2.55, zc(6)]); r.seg([hx - 0.4, 2.6, zc(2) + 0.25], [hx - 0.4, 2.6, zc(6)]);
  addLines(pp, s, C.cool, 0.95); addLines(pp, r, C.red, 0.95);
  addPoints(rk, ra.pos, ra.col, 2.4, true);
  trays(ov, -hx + 0.6, hx - 0.6, 2.7, [zc(2) + 0.6, zc(3) + 0.6, zc(4) + 0.6], C.power);
  sensors(ov, [2, 3, 4].flatMap((i) => [[-3, 2.82, zc(i)], [0, 2.82, zc(i)], [3, 2.82, zc(i)]]));
  const mid = stage(makePart(), 0.7, 1); person(mid, 0.5, zc(3) + 0.7);
  return { L, D, extra: 0, inside: { x: -5.3, y: 1.65, z: zc(3) + 0.66, yaw: -Math.PI / 2 } };
}

/* ====================================================================
   1068  Open container. 13.2 m: chiller 2.35 | 0.4 | glazed hall 7.7 | 0.4 | chiller 2.35,
   3.2 m wide, 1.24 m side decks with UPS and switchboards, 4.59 m of plant with two generators.
   ==================================================================== */
function build1068() {
  const L = 13.2, W = 3.2, H = 3.0, hx = L / 2, hl = 3.85;
  const shell = stage(makePart(), 0, 0.12);
  slab(shell, -hx, -W / 2, hx, W / 2);
  slab(shell, -hl, -W / 2 - 1.24, hl, -W / 2, C.dim); slab(shell, -hl, W / 2, hl, W / 2 + 1.24, C.dim);
  truss(shell, -hx, -hl - 0.4, -W / 2, W / 2, FY, H, 0.45); truss(shell, hl + 0.4, hx, -W / 2, W / 2, FY, H, 0.45);
  frameBox(shell, -hl, hl, -W / 2, W / 2, FY, H, 0.8);
  for (const x of [-hl, -hl / 2, 0, hl / 2, hl]) for (const z of [-W / 2, W / 2]) sbox(shell, x - 0.06, FY, z - 0.06, x + 0.06, H, z + 0.06, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.6 });
  glass(shell, -hl, hl, -W / 2, W / 2, H, 0.08);
  door(shell, hl - 1.3, 0, 0, H, W / 2 + 0.01);
  const cool = stage(makePart({ rise: true }), 0.1, 0.3);
  chiller(cool, -5.425, 0, 1.2, 3.09, 1.97); chiller(cool, 5.425, 0, 1.2, 3.09, 1.97);
  const rk = stage(makePart({ rise: true }), 0.42, 0.76), ra = { pos: [], col: [] }; const irx = [];
  let x = -3.3;
  for (let k = 0; k < 8; k++) { rack(rk, ra, x, -1.45, 0.6, 1.2, 1.99, '+z', false); x += 0.6; if (k === 1 || k === 4 || k === 6) { inrow(rk, x, -1.45, 0.3, 1.1, 2.0); irx.push(x + 0.15); x += 0.3; } }
  x = -3.3; for (let k = 0; k < 8; k++) { rack(rk, ra, x, 0.4, 0.6, 1.1, 1.99, '-z', k % 2 === 0); x += 0.6; if (k === 1 || k === 4 || k === 6) { inrow(rk, x, 0.4, 0.3, 1.1, 2.0); x += 0.3; } }
  addPoints(rk, ra.pos, ra.col, 2.4, true);
  const pw = stage(makePart({ rise: true }), 0.24, 0.42);
  [[-3.1, -2.3], [-2.1, -2.3], [2.3, 2.3], [3.0, 2.3]].forEach(([ux, uz]) => cab(pw, ux, uz - 0.3, 0.908, 0.6, 1.98, C.it, { seam: true }));
  cab(pw, hl - 0.6, W / 2 + 0.3, 0.5, 0.9, 2.0, C.power, { seam: true });
  const pp = stage(makePart({ drop: true }), 0.7, 0.86);
  pipes(pp, -5.425, 5.425, 2.62, -0.1, 0.1, irx.concat([-5.425, 5.425]), 2.1);
  const ov = stage(makePart({ drop: true }), 0.8, 0.96);
  trays(ov, -3.6, 3.6, 2.4, [-0.8, 0.9], C.power);        // overhead busbars
  for (let xx = -3.6; xx <= 3.7; xx += 0.9) sbox(ov, xx - 0.04, 2.9, -W / 2 + 0.1, xx + 0.04, 2.98, W / 2 - 0.1, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
  sensors(ov, [[-2.6, 2.95, -1], [0, 2.95, 0], [2.6, 2.95, 1], [-hl + 0.3, 2.9, 1.3]]);
  const gn = stage(makePart({ rise: true }), 0.9, 1), ga = { pos: [], col: [] };
  generator(gn, hx + 2.7, -1.3, 3.0, 1.1, 1.7, ga); generator(gn, hx + 2.7, 1.3, 3.0, 1.1, 1.7, ga); addPoints(gn, ga.pos, ga.col, 5, true);
  const mid = stage(makePart(), 0.7, 1); person(mid, 0.0, 0.0);
  label(-5.425, 2.3, 0, 'Outdoor chiller'); label(5.425, 2.3, 0, 'Outdoor chiller'); label(0, 2.45, -1.5, 'Rack line, in-row cooling'); label(-2.6, 2.2, -2.4, 'UPS and batteries'); label(hx + 2.7, 2.1, 0, '2 generator sets'); label(0, 2.9, 0.5, 'Overhead busbar');
  return { L, D: W + 2.48, extra: 4.6, inside: { x: -3.5, y: 1.65, z: 0, yaw: -Math.PI / 2 } };
}

/* ====================================================================
   1092  Mobile container. Placeholder: the standard Modularix module from the Journey.
   ==================================================================== */
function build1092() {
  const L = 8.5, W = 3.2, H = 3.2, X0 = -L / 2, X1 = L / 2, Z0 = -W / 2, Z1 = W / 2;
  const shell = stage(makePart(), 0, 0.12);
  sbox(shell, X0, 0, Z0, X1, FY, Z1, { fill: 0x0B1B3E, fo: 0.97, edge: C.blue, eo: 0.8 });
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X1, Z1], [X0, Z1]]) { const sx = x < 0 ? 1 : -1, sz = z < 0 ? 1 : -1; sbox(shell, Math.min(x, x + sx * 0.22), 0, Math.min(z, z + sz * 0.22), Math.max(x, x + sx * 0.22), H, Math.max(z, z + sz * 0.22), { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.7 }); }
  for (const z of [Z0, Z1]) { sbox(shell, X0, H - 0.14, z - (z < 0 ? 0 : 0.14), X1, H, z + (z < 0 ? 0.14 : 0), { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 }); for (const x of [-2.125, 0, 2.125]) sbox(shell, x - 0.05, FY, z - (z < 0 ? 0 : 0.1), x + 0.05, H - 0.14, z + (z < 0 ? 0 : 0.1) + (z < 0 ? 0.1 : 0), { fill: STEEL, fo: 0.9, edge: C.ink, eo: 0.35 }); }
  for (const x of [X0, X1]) sbox(shell, x - (x < 0 ? 0 : 0.14), H - 0.14, Z0, x + (x < 0 ? 0.14 : 0), H, Z1, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
  glass(shell, X0, X1, Z0, Z1, H, 0.07);
  const cool = stage(makePart({ rise: true }), 0.1, 0.3); for (const z0 of [-1.45, 0.05]) chiller(cool, -3.275, z0 + 0.7, 1.55, 1.4, 2.41);
  const pw = stage(makePart({ rise: true }), 0.24, 0.42); for (const z0 of [-1.45, 0.1]) cab(pw, -2.35, z0, 0.85, 1.35, 2.31, C.power, { seam: true });
  const fire = stage(makePart({ rise: true }), 0.38, 0.5); { const c = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 2.1, 18), fire.fm(0xD8382E, 0.97)); c.position.set(-1.12, 1.19, -1.25); fire.g.add(c); }
  const rk = stage(makePart({ rise: true }), 0.44, 0.78), ra = { pos: [], col: [] };
  for (let i = 0; i < 5; i++) { const x0 = -0.8 + i * 0.9; rack(rk, ra, x0, Z0 + 0.15, 0.82, 0.85, 2.26, '+z', false); rack(rk, ra, x0, 0.6, 0.82, 1.0, 2.26, '-z', false); }
  addPoints(rk, ra.pos, ra.col, 2.4, true);
  const ov = stage(makePart({ drop: true }), 0.74, 1); trays(ov, -4.0, 4.0, 2.78, [-0.55, 0.55], C.power);
  for (let x = -3.8; x <= 3.8; x += 0.95) sbox(ov, x - 0.04, 2.97, Z0 + 0.12, x + 0.04, 3.07, Z1 - 0.12, { fill: STEEL, fo: 0.95, edge: C.ink, eo: 0.5 });
  sensors(ov, [[-3.4, 2.93, -1], [-1.2, 2.93, 0], [1, 2.93, 1], [3.2, 2.93, -1]]);
  label(-3.3, 2.7, 0, 'Cooling'); label(-1.9, 2.55, 0, 'Power'); label(1.4, 2.55, -1.2, 'IT racks');
  return { L, D: W, extra: 0, inside: { x: 0.2, y: 1.6, z: 0, yaw: -Math.PI / 2 } };
}

const BUILD = { 'project-1023': build1023, 'project-1047': build1047, 'project-1068': build1068, 'project-1092': build1092 };

/* ---------- viewer ---------- */
export function startViewer(canvas, project, hooks = {}) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setClearColor(0x040814, 1);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(52, 1, 0.05, 400);
  scene.add(new T.AmbientLight(0x6F93D0, 0.6)); { const d = new T.DirectionalLight(0xE6F0FF, 0.75); d.position.set(6, 14, 9); scene.add(d); }

  // blueprint floor, same as the Journey
  const floor = new T.Mesh(new T.PlaneGeometry(400, 400), new T.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uC: { value: new T.Color(0x08142F) } },
    vertexShader: 'varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform vec3 uC;varying float vD;void main(){gl_FragColor=vec4(uC,.92*(1.-smoothstep(50.,160.,vD)));}' }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.03; floor.renderOrder = -2; scene.add(floor);
  const minor = new Lines(), major = new Lines();
  for (let v = -100; v <= 100; v += 2) { (v % 10 === 0 ? major : minor).seg([v, 0, -100], [v, 0, 100]); (v % 10 === 0 ? major : minor).seg([-100, 0, v], [100, 0, v]); }
  [[minor, 0.1], [major, 0.24]].forEach(([l, o]) => { const m = new T.LineSegments(l.geo(), lineMat(0xEAF1FF, o)); m.frustumCulled = false; scene.add(m); });

  mod = new T.Group(); scene.add(mod); parts = []; seq = []; labels = [];
  const info = (BUILD[project.id] || build1092)();
  const R = Math.max(info.L + (info.extra || 0), info.D, 12);

  // optional real model dropped in later
  if (project.glb) new GLTFLoader().load(`/models/projects/${project.id}.glb`, (gltf) => { mod.visible = false; const bb = new T.Box3().setFromObject(gltf.scene), c = bb.getCenter(new T.Vector3()); gltf.scene.position.set(-c.x, -bb.min.y, -c.z); scene.add(gltf.scene); hooks.onModel?.('glb'); }, undefined, () => {});
  hooks.onModel?.('preview');

  // label elements
  const lel = hooks.labelsEl, lbls = labels.map((l) => { const d = document.createElement('div'); d.className = 'lbl'; d.textContent = l.t; lel?.appendChild(d); return { ...l, d }; });

  const st = { x: 0, y: 4, z: 0, yaw: 0, pitch: -0.3, keys: new Set(), drag: false, lx: 0, ly: 0, fast: false };
  const view = (name) => {
    if (name === 'inside') { const i = info.inside; st.x = i.x; st.y = i.y; st.z = i.z; st.yaw = i.yaw; st.pitch = 0; }
    else if (name === 'top') { st.x = (info.extra || 0) / 2; st.y = R * 1.1; st.z = 0.01; st.yaw = -Math.PI / 2; st.pitch = -1.52; }
    else { st.x = (info.extra || 0) / 2 + R * 0.55; st.y = R * 0.5; st.z = R * 0.85; st.yaw = Math.atan2(st.x - (info.extra || 0) / 2, st.z); st.pitch = -0.4; }
  };
  view('outside');
  let t0 = performance.now();
  const replay = () => { t0 = performance.now(); };

  const key = (e, down) => {
    const k = e.key.toLowerCase(), map = { w: 'f', arrowup: 'f', s: 'b', arrowdown: 'b', a: 'l', arrowleft: 'l', d: 'r', arrowright: 'r', q: 'dn', c: 'dn', e: 'up', ' ': 'up' };
    if (map[k]) { e.preventDefault(); down ? st.keys.add(map[k]) : st.keys.delete(map[k]); }
    if (k === 'shift') st.fast = down;
    if (down && k === '1') view('outside'); if (down && k === '2') view('inside'); if (down && k === '3') view('top'); if (down && k === 'r') replay();
  };
  const kd = (e) => key(e, true), ku = (e) => key(e, false);
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  const pd = (e) => { st.drag = true; st.lx = e.clientX; st.ly = e.clientY; canvas.setPointerCapture?.(e.pointerId); };
  const pm = (e) => { if (!st.drag) return; st.yaw -= (e.clientX - st.lx) * 0.005; st.pitch = clamp(st.pitch - (e.clientY - st.ly) * 0.005, -1.55, 1.55); st.lx = e.clientX; st.ly = e.clientY; };
  const pu = () => { st.drag = false; };
  const wh = (e) => { e.preventDefault(); const f = Math.sign(e.deltaY) * -0.7; st.x += -Math.sin(st.yaw) * Math.cos(st.pitch) * f; st.z += -Math.cos(st.yaw) * Math.cos(st.pitch) * f; st.y += Math.sin(st.pitch) * f; };
  canvas.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu); canvas.addEventListener('wheel', wh, { passive: false });
  const resize = () => { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  const v3 = new T.Vector3(); let raf = 0, last = performance.now();
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const bp = clamp((now - t0) / 7500, 0, 1);
    for (const s of seq) {
      const t = ease(seg(bp, s.a, s.b)), p = s.part;
      p.g.visible = t > 0.002;
      for (const { m, base, kind } of p.mats) { if (kind === 'l') m.uniforms.uOp.value = base * t; else m.opacity = base * t; }
      if (p.rise) p.g.scale.y = 0.04 + 0.96 * t; if (p.drop) p.g.position.y = (1 - t) * 1.2;
      for (const m of p.blink) m.opacity = (0.72 + 0.28 * Math.sin(now * 0.012)) * t;
      for (const b of p.spin) b.rotation.y += dt * 7;
    }
    const sp = (st.fast ? 9 : 3.2) * dt, fx = -Math.sin(st.yaw), fz = -Math.cos(st.yaw);
    if (st.keys.has('f')) { st.x += fx * sp; st.z += fz * sp; } if (st.keys.has('b')) { st.x -= fx * sp; st.z -= fz * sp; }
    if (st.keys.has('l')) { st.x += fz * sp; st.z -= fx * sp; } if (st.keys.has('r')) { st.x -= fz * sp; st.z += fx * sp; }
    if (st.keys.has('up')) st.y += sp; if (st.keys.has('dn')) st.y -= sp; st.y = Math.max(0.3, st.y);
    camera.position.set(st.x, st.y, st.z); camera.rotation.order = 'YXZ'; camera.rotation.set(st.pitch, st.yaw, 0); camera.updateMatrixWorld();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    for (const l of lbls) {
      v3.copy(l.p).project(camera); const dist = camera.position.distanceTo(l.p), on = v3.z < 1 && Math.abs(v3.x) < 1.05 && Math.abs(v3.y) < 1.05 && dist < R * 1.7 && dist > 2.5 && bp > 0.85;
      l.d.style.opacity = on ? '1' : '0'; if (on) l.d.style.transform = `translate(${(v3.x * 0.5 + 0.5) * w}px,${(-v3.y * 0.5 + 0.5) * h}px)`;
    }
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return {
    view, replay,
    stop() {
      cancelAnimationFrame(raf); ro.disconnect();
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu);
      canvas.removeEventListener('pointerdown', pd); canvas.removeEventListener('wheel', wh);
      lbls.forEach((l) => l.d.remove());
      scene.traverse((o) => { o.geometry?.dispose?.(); const mt = o.material; (Array.isArray(mt) ? mt : mt ? [mt] : []).forEach((x) => x.dispose?.()); });
      renderer.dispose();
    },
  };
}
