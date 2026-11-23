/* eslint-disable */
// @ts-nocheck
// Parametric Legacy container model (three.js r128), shared by the home and journey scenes.
import * as THREE from 'three';

const liveRenderers = [];
export function disposeRenderers() {
  while (liveRenderers.length) { const r = liveRenderers.pop(); try { r.dispose(); r.forceContextLoss(); } catch (e) {} }
}

export function makeLegacy3D(){
const T=THREE;
const stage=document.getElementById('stage');
const canvas=document.createElement('canvas'); stage.appendChild(canvas);
const msg=null, tipEl=null;
const fail=m=>{ console.warn(m); const e=document.getElementById('nowebgl'); if(e){ e.style.display='flex'; } };
let renderer;
try{ renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
catch(e){ fail('The 3D view needs WebGL.'); return null; }
liveRenderers.push(renderer);
let dirty=true; const kick=()=>{}; const syncUI=()=>{}; const hideTip=()=>{};
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=0.82;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,matchMedia('(max-width:760px)').matches?1.5:2));
renderer.setClearColor(0x000000,0);
const maxAniso=renderer.capabilities.getMaxAnisotropy();

const scene=new T.Scene();
const camera=new T.PerspectiveCamera(32,16/9,0.1,200);
const controls={target:new T.Vector3(),update(){return false},addEventListener(){}};
controls.enableDamping=true; controls.dampingFactor=0.09;
controls.maxPolarAngle=Math.PI/2-0.015; controls.minDistance=2.5; controls.maxDistance=34;
controls.screenSpacePanning=false;
const world=new T.Group(); scene.add(world);

/* ---------- studio lighting ---------- */
(function(){
  const pm=new T.PMREMGenerator(renderer);
  const es=new T.Scene();
  es.add(new T.Mesh(new T.BoxGeometry(30,16,30),new T.MeshBasicMaterial({color:0x56606f,side:T.BackSide})));
  const panel=(w,h,pos,rot,k)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(k,k,k*1.03),side:T.DoubleSide})); m.position.set(pos[0],pos[1],pos[2]); m.rotation.set(rot[0],rot[1],rot[2]); es.add(m); };
  panel(14,10,[0,7.5,0],[Math.PI/2,0,0],5);
  panel(8,8,[-13,5,6],[0,Math.PI/2,0],3.5);
  panel(8,6,[13,4,-4],[0,-Math.PI/2,0],2.2);
  panel(14,3,[0,3,14],[0,Math.PI,0],1.4);
  scene.environment=pm.fromScene(es,0.035).texture;
  pm.dispose();
})();
scene.add(new T.HemisphereLight(0xdfeaff,0x56606b,0.3));
const sun=new T.DirectionalLight(0xfff6ea,1.7);
sun.position.set(7,13,9); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
{ const c=sun.shadow.camera; c.left=-10; c.right=10; c.top=10; c.bottom=-10; c.near=1; c.far=40; }
sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.03;
scene.add(sun);
const shadowPlane=new T.Mesh(new T.PlaneGeometry(80,80),new T.ShadowMaterial({opacity:0.3}));
shadowPlane.rotation.x=-Math.PI/2; shadowPlane.position.y=0.002; shadowPlane.receiveShadow=true; scene.add(shadowPlane);
/* blueprint floor grid: perspective lines that start at the right of the screen and fade out before the hero text on the left */
{
  const gm=(op)=>new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    uniforms:{uC:{value:new T.Color(0x4FB0FF)},uOp:{value:op},uW:{value:1280}},
    vertexShader:'varying float vD;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uC;uniform float uOp,uW;varying float vD;void main(){float x=gl_FragCoord.x/uW*2.-1.;float f=smoothstep(-0.1,0.85,x)*(1.-smoothstep(28.,75.,vD));gl_FragColor=vec4(uC,uOp*f);}'});
  const mk=(step,half,op)=>{const p=[];for(let v=-half;v<=half;v+=step){p.push(v,0,-half,v,0,half,-half,0,v,half,0,v);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));const m=gm(op),v=new T.Vector2();const l=new T.LineSegments(g,m);l.onBeforeRender=(r)=>{r.getDrawingBufferSize(v);m.uniforms.uW.value=v.x;};l.position.y=0.001;l.frustumCulled=false;l.renderOrder=-1;scene.add(l);};
  mk(1,80,0.16); mk(5,80,0.5);
}
const lightIT=new T.PointLight(0xfff1dc,0.55,9,2), lightTech=new T.PointLight(0xfff1dc,0.4,6,2);
world.add(lightIT,lightTech);

/* ---------- textures ---------- */
const cv=(w,h,fn)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); return c; };
const mk=(c,lin)=>{ const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=Math.min(8,maxAniso); if(!lin) t.encoding=T.sRGBEncoding; return t; };
const TAU=Math.PI*2;

const ribN=mk(cv(128,8,(g,w,h)=>{
  const id=g.createImageData(w,h);
  for(let x=0;x<w;x++){
    const u=x/w; let s=0; if(u>0.25&&u<0.4) s=1; else if(u>0.6&&u<0.75) s=-1;
    const nx=-s*0.85, nz=1, l=Math.hypot(nx,nz);
    for(let y=0;y<h;y++){ const i=(y*w+x)*4; id.data[i]=Math.round((nx/l*0.5+0.5)*255); id.data[i+1]=128; id.data[i+2]=Math.round((nz/l*0.5+0.5)*255); id.data[i+3]=255; }
  }
  g.putImageData(id,0,0);
}),true);
ribN.repeat.set(1/0.2,1/0.2);

const panelTex=mk(cv(256,256,(g,w,h)=>{ g.fillStyle='#eceeea'; g.fillRect(0,0,w,h); g.fillStyle='#c2c6c0'; g.fillRect(0,0,3,h); g.fillRect(0,0,w,3); }));
panelTex.repeat.set(1/1.2,1/1.2);
const floorTex=mk(cv(256,256,(g,w,h)=>{
  g.fillStyle='#575c64'; g.fillRect(0,0,w,h);
  for(let i=0;i<2600;i++){ const v=72+Math.random()*30|0; g.fillStyle='rgb('+v+','+(v+3)+','+(v+8)+')'; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
  g.fillStyle='rgba(0,0,0,.28)'; g.fillRect(0,0,2,h); g.fillRect(0,0,w,2);
}));
floorTex.repeat.set(1/1.5,1/1.5);
const perfTex=mk(cv(64,64,(g,w,h)=>{
  g.fillStyle='#2b2f35'; g.fillRect(0,0,w,h); g.fillStyle='#08090b';
  for(let r=0;r<8;r++) for(let q=0;q<8;q++){ g.beginPath(); g.arc(q*8+4,r*8+4,1.9,0,TAU); g.fill(); }
}));
perfTex.repeat.set(1/0.064,1/0.064);
const coolFrontTex=mk(cv(96,640,(g,w,h)=>{
  g.fillStyle='#2b2f36'; g.fillRect(0,0,w,h);
  g.fillStyle='#1a1d22'; g.fillRect(6,12,w-12,92);
  g.fillStyle='#7fd0ff'; g.fillRect(14,22,w-28,34); g.fillStyle='#d6efff'; g.fillRect(18,28,w-36,4); g.fillRect(18,38,(w-36)*0.6,4);
  ['#3ddc97','#ffb454','#3a4048'].forEach((c,i)=>{ g.fillStyle=c; g.beginPath(); g.arc(24+i*24,82,5,0,TAU); g.fill(); });
  for(let y=124;y<h-44;y+=10){ g.fillStyle='#121418'; g.fillRect(8,y,w-16,5); g.fillStyle='#3b414a'; g.fillRect(8,y+5,w-16,2); }
  g.fillStyle='#16181c'; g.fillRect(0,h-28,w,28);
}));
const coolBackTex=mk(cv(96,640,(g,w,h)=>{
  g.fillStyle='#2b2f36'; g.fillRect(0,0,w,h);
  for(let y=14;y<h-30;y+=10){ g.fillStyle='#121418'; g.fillRect(8,y,w-16,5); g.fillStyle='#3b414a'; g.fillRect(8,y+5,w-16,2); }
}));
const fanTex=mk(cv(320,256,(g,w,h)=>{
  g.fillStyle='#cfd3d8'; g.fillRect(0,0,w,h); g.strokeStyle='#8f969e'; g.lineWidth=2; g.strokeRect(6,6,w-12,h-12);
  const cx=w/2, cy=h/2, R=104;
  g.fillStyle='#1d2024'; g.beginPath(); g.arc(cx,cy,R,0,TAU); g.fill();
  g.strokeStyle='#aeb4bb'; g.lineWidth=2;
  for(let r=22;r<=R;r+=14){ g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke(); }
  for(let a=0;a<24;a++){ const t=a/24*TAU; g.beginPath(); g.moveTo(cx+Math.cos(t)*14,cy+Math.sin(t)*14); g.lineTo(cx+Math.cos(t)*R,cy+Math.sin(t)*R); g.stroke(); }
  g.fillStyle='#8a9098'; g.beginPath(); g.arc(cx,cy,14,0,TAU); g.fill();
}));
const sockTex=mk(cv(24,512,(g,w,h)=>{
  g.fillStyle='#16181b'; g.fillRect(0,0,w,h);
  for(let i=0;i<24;i++){ const big=i>=20; g.fillStyle='#050506'; g.fillRect(big?3:5,22+i*19,big?18:14,big?15:12); g.fillStyle='#4a4f57'; g.fillRect(big?5:7,25+i*19,big?14:10,big?9:6); }
}));

/* ---------- materials ---------- */
const std=(c,r,m,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:r,metalness:m},o||{}));
const MAT={
  rib:std(0xcfcec5,0.55,0.08,{normalMap:ribN,normalScale:new T.Vector2(0.9,0.9)}),
  paint:std(0xcfcec5,0.55,0.08),
  paintDark:std(0xa9a8a0,0.6,0.12),
  roof:std(0xa9a8a0,0.9,0),
  int:std(0xe2e6e2,0.85,0,{map:panelTex}),
  floor:std(0xffffff,0.7,0.02,{map:floorTex}),
  steel:std(0x2c3138,0.5,0.6),
  galv:std(0xa9b1ba,0.38,0.85),
  foot:std(0x0b7df2,0.5,0.3),
  rack:std(0x1f2226,0.5,0.45),
  rackV:std(0x2a2d32,0.45,0.5),
  perf:std(0xffffff,0.5,0.5,{map:perfTex}),
  chrome:std(0xdfe3e8,0.2,1),
  coolBody:std(0x2b2f36,0.5,0.5),
  coolF:std(0xffffff,0.45,0.4,{map:coolFrontTex}),
  coolB:std(0xffffff,0.5,0.4,{map:coolBackTex}),
  white:std(0xf3f4f5,0.4,0.05),
  casing:std(0xc9ced4,0.45,0.5),
  ups:std(0x25282d,0.5,0.45),
  panel:std(0xc6c9cd,0.5,0.35),
  red:std(0xcf2a22,0.35,0.35),
  brass:std(0xb8924a,0.35,0.9),
  copper:std(0xb87333,0.35,0.9),
  black:std(0x0d0e10,0.7,0.2),
  sock:std(0xffffff,0.6,0.2,{map:sockTex}),
  fan:std(0xffffff,0.5,0.35,{map:fanTex}),
  led:std(0xffffff,0.4,0,{emissive:0xfff0d6,emissiveIntensity:2.2}),
  ledG:std(0x000000,0.4,0,{emissive:0x3ddc97,emissiveIntensity:2.5}),
  ledB:std(0x000000,0.4,0,{emissive:0x4fb0ff,emissiveIntensity:2.5}),
  ledR:std(0x000000,0.4,0,{emissive:0xff3b30,emissiveIntensity:2.5}),
  screen:std(0x000000,0.3,0,{emissive:0x7fd0ff,emissiveIntensity:1.5}),
  glass:std(0xbfe3ff,0.08,0,{transparent:true,opacity:0.16,side:T.DoubleSide,depthWrite:false}),
  dome:std(0x14161a,0.1,0.6,{transparent:true,opacity:0.88}),
  hot:new T.MeshBasicMaterial({color:0xea2322,transparent:true,opacity:0.15,depthWrite:false}),
  cold:new T.MeshBasicMaterial({color:0x4fb0ff,transparent:true,opacity:0.08,depthWrite:false})
};

/* ---------- geometry helpers ---------- */
let dispGeo=[], dispTex=[], dispMat=[];
function uvM(g,w,h,d){ // UVs in metres so every texture uses repeat = 1/period
  const uv=g.attributes.uv, dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++) for(let i=0;i<4;i++){ const k=f*4+i; uv.setXY(k,uv.getX(k)*dims[f][0],uv.getY(k)*dims[f][1]); }
  uv.needsUpdate=true;
}
function box(parent,mat,x0,x1,y0,y1,z0,z1,o){
  o=o||{};
  const g=new T.BoxGeometry(x1-x0,y1-y0,z1-z0); if(o.uv) uvM(g,x1-x0,y1-y0,z1-z0);
  const m=new T.Mesh(g,mat); m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
  m.castShadow=o.cast!==false; m.receiveShadow=o.recv!==false; parent.add(m); return m;
}
function cyl(parent,mat,r,h,x,y,z,axis,r2,seg){
  const g=new T.CylinderGeometry(r2===undefined?r:r2,r,h,seg||20);
  const m=new T.Mesh(g,mat); m.position.set(x,y,z);
  if(axis==='x') m.rotation.z=Math.PI/2; else if(axis==='z') m.rotation.x=Math.PI/2;
  m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function sph(parent,mat,r,x,y,z,o){
  const g=new T.SphereGeometry(r,20,12,0,TAU,0,(o&&o.half)?Math.PI/2:Math.PI);
  const m=new T.Mesh(g,mat); m.position.set(x,y,z); m.castShadow=true; parent.add(m); return m;
}
function plane(parent,mat,w,h,x,y,z,ry){
  const m=new T.Mesh(new T.PlaneGeometry(w,h),mat); m.position.set(x,y,z); if(ry) m.rotation.y=ry; parent.add(m); return m;
}
function labelTex(text,w,h,bg,fg,font){
  const t=mk(cv(w,h,(g)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=fg; g.font=font; g.textAlign='center'; g.textBaseline='middle'; g.fillText(text,w/2,h/2+2); }));
  dispTex.push(t); return t;
}
function tag(o,title,sub){ o.traverse(m=>{ if(m.isMesh) m.userData.tip={title:title,sub:sub||''}; }); }
function mats6(ext){
  const m=Array(6).fill(MAT.paintDark), idx={px:0,nx:1,pz:4,nz:5}, opp={px:'nx',nx:'px',pz:'nz',nz:'pz'};
  m[idx[ext]]=MAT.rib; m[idx[opp[ext]]]=MAT.int; return m;
}

/* ---------- container colours + logo ---------- */
const COLORS={
  white:{name:'White',panel:0xcfcec5,dark:0xa9a8a0,env:1,logo:'light',deco:'#0a1530'},
  graphite:{name:'Dark grey',srgb:1,panel:0x3b4147,dark:0x2b3036,env:0.5,logo:'dark',deco:'#ffffff'},
  blue:{name:'Blue',srgb:1,panel:0x0b52e0,dark:0x0a40b3,env:0.5,logo:'dark',deco:'#ffffff'}
};
const LOGO_AR={dark:980/250,light:640/161};
const logoCache={};
function logoMat(kind){
  if(logoCache[kind]) return logoCache[kind];
  const img=document.querySelector('img.logo-'+kind);
  const c=document.createElement('canvas'); c.width=1024; c.height=Math.round(1024/LOGO_AR[kind]);
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.anisotropy=Math.min(8,maxAniso);
  const draw=()=>{ const g=c.getContext('2d'); g.clearRect(0,0,c.width,c.height); g.drawImage(img,0,0,c.width,c.height); t.needsUpdate=true; dirty=true; kick(); };
  if(img){ if(img.complete&&img.naturalWidth) draw(); else img.addEventListener('load',draw,{once:true}); }
  const m=new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.55,metalness:0.05,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  logoCache[kind]=m; return m;
}
function decalText(text,color){
  const t=labelTexT(text,color); const m=new T.MeshStandardMaterial({map:t,transparent:true,roughness:0.55,metalness:0.05,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  dispMat.push(m); return m;
}
function labelTexT(text,color){
  const c=cv(512,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle=color; g.font='600 34px "IBM Plex Mono", monospace'; g.textAlign='left'; g.textBaseline='middle'; g.fillText(text,4,h/2+2); });
  const t=mk(c); dispTex.push(t); return t;
}

/* ---------- model ---------- */
let lastS=null, model=null, dims={L:8.5,W:3.2}, roofG, frontG, ghostFront, doorG, airG, doorPivot, racksArr=[], pickables=[], animItems=[], LAY=null;
const V={roof:0,wall:0,door:1,rdoors:0,air:0,gear:0};
const PRESETS={cutaway:{roof:0,wall:0,door:1},exterior:{roof:1,wall:1,door:1},top:{roof:0,wall:0,door:1},aisle:{roof:0,wall:0,door:1},door:{roof:1,wall:1,door:1}};
let curView='cutaway';

function teardown(){
  if(model){ world.remove(model); model.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); }
  dispTex.forEach(t=>t.dispose()); dispMat.forEach(m=>m.dispose());
  dispTex=[]; dispMat=[]; model=null; racksArr=[]; pickables=[]; animItems=[];
}

function buildRack(parent,R,S,x0,idx){
  const rk=R.rk, w=rk.w, d=rk.d, h=rk.h, FL=0.1, vert=S.rackBrand==='vertiv';
  const g=new T.Group(); g.position.set(x0+w/2,FL,0.7+d/2); parent.add(g);
  const body=vert?MAT.rackV:MAT.rack;
  box(g,body,-w/2,-w/2+0.02,0.06,h,-d/2,d/2);
  box(g,body,w/2-0.02,w/2,0.06,h,-d/2,d/2);
  box(g,body,-w/2,w/2,h-0.03,h,-d/2,d/2);
  box(g,MAT.black,-w/2+0.02,w/2-0.02,0,0.08,-d/2+0.03,d/2-0.03);
  box(g,MAT.black,-w/2+0.02,w/2-0.02,0.08,0.09,-d/2,d/2);
  box(g,MAT.perf,-w/2+0.02,w/2-0.02,0.09,h-0.03,-d/2,-d/2+0.025,{uv:1});
  box(g,MAT.black,-0.12,0.12,h-0.031,h-0.029,-d/2+0.15,-d/2+0.35);
  const inner=new T.Group(); g.add(inner);
  [-1,1].forEach(sx=>box(inner,MAT.galv,sx*0.241-0.011,sx*0.241+0.011,0.12,h-0.06,d/2-0.12,d/2-0.095));
  // PDUs (A + B), vertical, rear corners
  [-1,1].forEach(sx=>{
    const px=sx*(w/2-0.07), pz=-d/2+0.1;
    box(inner,MAT.black,px-0.025,px+0.025,0.2,1.85,pz-0.028,pz+0.028);
    const face=plane(inner,MAT.sock,0.04,1.55,px-sx*0.0255,1.02,pz,-sx*Math.PI/2);
    face.rotation.y=sx<0?Math.PI/2:-Math.PI/2;
    box(inner,S.pdu==='M'?MAT.ledG:MAT.ledB,px-sx*0.026-0.002,px-sx*0.026+0.002,1.78,1.82,pz-0.015,pz+0.015,{cast:false});
  });
  // illustrative IT gear
  const U=rk.u, filled=Math.max(0,Math.min(U-6,Math.round(S.kwRack*3.2)));
  const stex=(function(){
    const pxU=10, ww=256, hh=U*pxU; let rnd=(idx+3)*7919;
    const R_=()=>{ rnd=(rnd*9301+49297)%233280; return rnd/233280; };
    const t=mk(cv(ww,hh,(c)=>{
      c.fillStyle='#0b0c0e'; c.fillRect(0,0,ww,hh);
      let used=0;
      while(used<filled){
        const hU=Math.min(R_()<0.25?2:1,filled-used), yT=hh-(2+used+hU)*pxU;
        c.fillStyle='#23272c'; c.fillRect(4,yT+1,ww-8,hU*pxU-2);
        c.fillStyle='#363c44'; c.fillRect(4,yT+1,ww-8,2);
        c.fillStyle='#121417'; for(let x=40;x<ww-72;x+=6) c.fillRect(x,yT+4,3,hU*pxU-8);
        c.fillStyle=R_()<0.8?'#3ddc97':'#ffb454'; c.fillRect(ww-56,yT+hU*pxU/2-1,3,3);
        c.fillStyle='#7fd0ff'; c.fillRect(ww-44,yT+hU*pxU/2-1,3,3);
        used+=hU;
      }
      for(let k=used;k<U-4;k++){ c.fillStyle='#15171a'; c.fillRect(4,hh-(2+k+1)*pxU+1,ww-8,pxU-2); }
    }));
    dispTex.push(t); return t;
  })();
  const sm=std(0xffffff,0.6,0.2,{map:stex}); dispMat.push(sm);
  const gear=plane(inner,sm,0.4826,U*0.04445,0,0.15+U*0.04445/2,d/2-0.13);
  gear.visible=!!V.gear; gear.castShadow=false;
  // front door
  const piv=new T.Group(); piv.position.set(-w/2+0.012,0,d/2); g.add(piv);
  box(piv,MAT.perf,0,w-0.024,0.09,h-0.03,0,0.025,{uv:1});
  box(piv,MAT.chrome,w-0.085,w-0.063,h*0.5,h*0.5+0.2,0.025,0.055);
  const lt=labelTex('R'+idx,128,48,'#f1f2f4','#15181c','700 30px Archivo, Arial, sans-serif');
  const lm=new T.MeshBasicMaterial({map:lt}); dispMat.push(lm);
  plane(piv,lm,0.14,0.052,w*0.5-0.012,h-0.14,0.0265);
  const item={o:piv,sign:-1,cur:0,tgt:0,key:'rdoors',amt:1.75};
  animItems.push(item);
  g.userData.gear=gear;
  tag(g,'Rack R'+idx+' - '+(vert?'Vertiv':'Schneider')+' '+R.br.model,rk.u+'U - '+(w*1000)+' × '+(d*1000)+' mm - '+S.kwRack+' kW - 2 × EPDU2132'+S.pdu);
  racksArr.push(g);
  return g;
}

function buildCooler(parent,R,x0){
  const w=0.3, h=2.0, d=1.132, FL=0.1;
  const m=[MAT.coolBody,MAT.coolBody,MAT.black,MAT.black,MAT.coolF,MAT.coolB];
  const b=box(parent,m,x0,x0+w,FL,FL+h,0.7,0.7+d);
  box(parent,MAT.copper,x0+0.08,x0+0.1,FL+h,3.1,0.9,0.92);
  box(parent,MAT.copper,x0+0.2,x0+0.22,FL+h,3.1,0.95,0.97);
  b.userData.tip={title:'Vertiv Liebert CRD25 in-row DX',sub:'25 kW net sensible - 300 × 1 132 × 2 000 mm - N+1'};
  return b;
}

function build(R,S,seq){
  teardown();
  const L=R.Ld||R.c.L, W=3.2, H=3.2, FL=0.1, TECH=2.4, px=L-0.1-TECH, rk=R.rk;
  dims={L:L,W:W};
  lastS=S;
  const col=COLORS[S.color]||COLORS.white;
  MAT.rib.color.setHex(col.panel); MAT.paint.color.setHex(col.panel); MAT.paintDark.color.setHex(col.dark); MAT.roof.color.setHex(col.dark);
  if(col.srgb){ MAT.rib.color.convertSRGBToLinear(); MAT.paint.color.convertSRGBToLinear(); MAT.paintDark.color.convertSRGBToLinear(); MAT.roof.color.convertSRGBToLinear(); }
  MAT.rib.envMapIntensity=MAT.paint.envMapIntensity=MAT.paintDark.envMapIntensity=col.env; MAT.roof.envMapIntensity=col.env*0.3;
  const c=(L-0.98)/2;
  model=new T.Group(); model.position.set(-c,0.3,-W/2); world.add(model);
  roofG=new T.Group(); frontG=new T.Group(); ghostFront=new T.Group(); doorG=new T.Group(); airG=new T.Group();
  model.add(roofG,frontG,ghostFront,doorG,airG);
  LAY={cool:new T.Group(),power:new T.Group(),racks:new T.Group(),mon:new T.Group(),fire:new T.Group()}; model.add(LAY.cool,LAY.power,LAY.racks,LAY.mon,LAY.fire);
  const occ=o=>{ o.userData.occ=true; return o; };

  /* shell */
  const dx=L-0.1-1.55;
  occ(box(model,mats6('nz'),0,L,0,H,0,0.1,{uv:1}));
  occ(box(model,mats6('nx'),0,0.1,0,H,0.1,W-0.1,{uv:1}));
  occ(box(model,mats6('px'),L-0.1,L,0,H,0.1,W-0.1,{uv:1}));
  [[0,dx,0,H],[dx+1,L,0,H],[dx,dx+1,2.25,H],[dx,dx+1,0,0.1]].forEach(a=>occ(box(frontG,mats6('pz'),a[0],a[1],a[2],a[3],W-0.1,W,{uv:1})));
  occ(box(model,[MAT.paintDark,MAT.paintDark,MAT.floor,MAT.steel,MAT.paintDark,MAT.paintDark],0,L,0,0.1,0,W,{uv:1}));
  occ(box(roofG,[MAT.paintDark,MAT.paintDark,MAT.roof,MAT.int,MAT.paintDark,MAT.paintDark],0,L,H-0.1,H,0,W,{uv:1}));
  // frame
  const fr=new T.Group(); model.add(fr);
  [[-0.02,0.14,-0.02,0.14],[L-0.14,L+0.02,-0.02,0.14],[-0.02,0.14,W-0.14,W+0.02],[L-0.14,L+0.02,W-0.14,W+0.02]].forEach(a=>box(fr,MAT.paintDark,a[0],a[1],0,H,a[2],a[3]));
  [[0,0.12],[H-0.12,H]].forEach(function(yy){
    box(fr,MAT.paintDark,-0.02,L+0.02,yy[0],yy[1],-0.02,0.12);
    box(fr,MAT.paintDark,-0.02,L+0.02,yy[0],yy[1],W-0.12,W+0.02);
    box(fr,MAT.paintDark,-0.02,0.12,yy[0],yy[1],0.12,W-0.12);
    box(fr,MAT.paintDark,L-0.12,L+0.02,yy[0],yy[1],0.12,W-0.12);
  });
  for(const x of [-0.02,L-0.16]) for(const z of [-0.02,W-0.16]) for(const y of [-0.02,H-0.16]) box(fr,MAT.steel,x,x+0.18,y,y+0.18,z,z+0.18);
  (L>7?[0.3,L/2-0.08,L-0.5]:[0.3,L-0.5]).forEach(x=>box(model,MAT.foot,x,x+0.16,-0.3,0,0.15,W-0.15));
  // ghost front wall
  { const gp=new T.Mesh(new T.PlaneGeometry(L,H),new T.MeshBasicMaterial({color:0x4fb0ff,transparent:true,opacity:0.07,depthWrite:false,side:T.DoubleSide}));
    gp.position.set(L/2,H/2,W); ghostFront.add(gp); dispMat.push(gp.material);
    const ln=new T.LineSegments(new T.EdgesGeometry(gp.geometry),new T.LineBasicMaterial({color:0x4fb0ff,transparent:true,opacity:0.55}));
    ln.position.copy(gp.position); ghostFront.add(ln); dispMat.push(ln.material); }
  // logo (the same artwork as the page header) on the front, back and door-end walls
  { const lm=logoMat(col.logo), lw=(S.smallLogo?0.95:2.3), lh=lw/LOGO_AR[col.logo];
    const sub='LEGACY '+R.kw+' kW - '+L.toFixed(2)+' m', dm=decalText(sub,col.deco);
    const put=(parent,mat,w,h,x,y,z,ry)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h),mat); m.position.set(x,y,z); m.rotation.y=ry; m.renderOrder=1; parent.add(m); return m; };
    if(S.smallLogo){ put(frontG,lm,lw,lh,0.3+lw/2,H-0.32-lh/2,W+0.004,0); } else {
    put(frontG,lm,lw,lh,1.7,1.95,W+0.004,0); put(frontG,dm,1.5,1.5/8,1.7-lw/2+0.75,1.95-lh/2-0.16,W+0.004,0);
    put(model,lm,lw,lh,L-1.7,1.95,-0.004,Math.PI); put(model,dm,1.5,1.5/8,L-1.7+lw/2-0.75,1.95-lh/2-0.16,-0.004,Math.PI);
    put(model,lm,lw,lh,L+0.004,1.95,W/2,Math.PI/2);  } }

  /* exterior door */
  { const piv=new T.Group(); piv.position.set(dx+1.0,FL,W-0.03); doorG.add(piv);
    const leaf=[MAT.paintDark,MAT.paintDark,MAT.paintDark,MAT.paintDark,MAT.rib,MAT.int];
    box(piv,leaf,-0.995,0,0,2.15,-0.035,0.035,{uv:1});
    box(piv,MAT.chrome,-0.2,-0.18,0.95,1.2,0.035,0.07);
    box(piv,MAT.steel,-0.26,-0.14,0.88,1.28,0.035,0.045);
    [0.25,1.05,1.85].forEach(y=>box(piv,MAT.steel,-0.05,0.02,y-0.06,y+0.06,0.0,0.06));
    box(doorG,MAT.steel,dx-0.03,dx,0.1,2.28,W-0.1,W+0.012);
    box(doorG,MAT.steel,dx+1,dx+1.03,0.1,2.28,W-0.1,W+0.012);
    box(doorG,MAT.steel,dx-0.03,dx+1.03,2.25,2.28,W-0.1,W+0.012);
    doorPivot=piv;
    animItems.push({o:piv,sign:1,cur:0,tgt:0,key:'door',amt:1.25});
    tag(doorG,'Exterior door','1 000 × 2 150 mm - REI 90 - access control');
    if(S.sec){ box(frontG,MAT.black,L-0.46,L-0.34,1.2,1.38,W,W+0.03); box(frontG,MAT.ledG,L-0.43,L-0.4,1.33,1.35,W+0.03,W+0.034,{cast:false}); } }

  /* IT row */
  const els=[]; { let x=0.2, ri=0; seq.forEach(function(tk){ if(tk==='R'){ ri++; els.push({k:'R',x:x,w:rk.w,i:ri}); x+=rk.w; } else { els.push({k:'C',x:x,w:0.3}); x+=0.3; } }); els.rowEnd=x; }
  const rowEnd=els.rowEnd;
  els.forEach(function(e){
    if(e.k==='R'){ buildRack(LAY.racks,R,S,e.x,e.i); }
    else buildCooler(LAY.cool,R,e.x);
    const top=FL+(e.k==='R'?rk.h:2.0);
    box(LAY.racks,MAT.glass,e.x,e.x+e.w,top,H-0.1,0.69,0.71,{cast:false}).renderOrder=2;
    box(LAY.racks,MAT.galv,e.x,e.x+e.w,top,top+0.025,0.68,0.72,{cast:false});
  });
  // hot-aisle end door
  { box(LAY.racks,MAT.glass,rowEnd-0.01,rowEnd+0.01,FL,H-0.1,0.12,0.69,{cast:false}).renderOrder=2;
    box(LAY.racks,MAT.galv,rowEnd-0.02,rowEnd+0.02,FL,H-0.1,0.12,0.15,{cast:false});
    box(LAY.racks,MAT.galv,rowEnd-0.02,rowEnd+0.02,FL,H-0.1,0.66,0.69,{cast:false});
    box(LAY.racks,MAT.galv,rowEnd-0.02,rowEnd+0.02,H-0.13,H-0.1,0.12,0.69,{cast:false});
    box(LAY.racks,MAT.chrome,rowEnd+0.02,rowEnd+0.04,1.0,1.2,0.55,0.58,{cast:false}); }
  { const hot=box(airG,MAT.hot,0.1,rowEnd,FL,H-0.1,0.1,0.7,{cast:false,recv:false}); hot.renderOrder=3;
    const cold=box(airG,MAT.cold,0.1,px,FL,H-0.1,0.7+rk.d,W-0.1,{cast:false,recv:false}); cold.renderOrder=3; }

  // overhead cable tray
  { const zt=0.7+rk.d+0.35, ty=2.7, x1=px-0.1, tg=new T.Group(); LAY.power.add(tg);
    [-1,1].forEach(s=>box(tg,MAT.galv,0.2,x1,ty-0.05,ty,zt+s*0.15-0.006,zt+s*0.15+0.006));
    for(let x=0.3;x<x1;x+=0.3) box(tg,MAT.galv,x-0.01,x+0.01,ty-0.055,ty-0.045,zt-0.15,zt+0.15,{cast:false});
    [0.6,Math.round((x1/2)*10)/10,x1-0.5].forEach(x=>[-1,1].forEach(s=>box(tg,MAT.galv,x-0.005,x+0.005,ty,H-0.1,zt+s*0.15-0.005,zt+s*0.15+0.005,{cast:false})));
    tag(tg,'Overhead cable tray','Power and data to the rack row'); }

  /* cooling — non-inrow indoor units (Mitsubishi) */
  if(!R.cool.inrow){
    const big=R.cool.rated>5, uw=big?1.4:0.9;
    for(let i=0;i<R.coolUnits;i++){
      const ux=0.35+i*(uw+0.3), g=new T.Group(); LAY.cool.add(g);
      if(big){
        box(g,MAT.casing,ux,ux+uw,H-0.43,H-0.15,W-0.4,W-0.1);
        box(g,MAT.white,ux+0.1,ux+uw-0.1,H-0.4,H-0.36,W-0.404,W-0.4);
        box(g,MAT.black,ux+0.1,ux+uw-0.1,H-0.34,H-0.3,W-0.404,W-0.4);
        tag(g,'Mitsubishi Electric ducted indoor unit','Ceiling-concealed - '+R.cool.rated+' kW - '+R.coolRed);
      } else {
        box(g,MAT.white,ux,ux+uw,H-0.43,H-0.15,W-0.4,W-0.1);
        box(g,MAT.white,ux+0.02,ux+uw-0.02,H-0.45,H-0.43,W-0.4,W-0.34);
        box(g,MAT.black,ux+0.05,ux+uw-0.05,H-0.42,H-0.4,W-0.404,W-0.4);
        box(g,MAT.ledG,ux+uw-0.1,ux+uw-0.08,H-0.3,H-0.28,W-0.404,W-0.4,{cast:false});
        tag(g,'Mitsubishi Electric split indoor unit','Wall-mounted - '+R.cool.rated+' kW - '+R.coolRed);
      }
    }
  }

  /* outdoor units on the left end wall */
  { const inrow=R.cool.inrow, n=R.coolUnits;
    const fw=inrow?0.83:0.33, fl=inrow?1.562:(R.cool.rated>5?1.05:0.95), fh=inrow?1.272:(R.cool.rated>5?1.338:0.943);
    const stacks=inrow?Math.ceil(n/2):n;
    const og=new T.Group(); LAY.cool.add(og);
    for(let s=0;s<stacks;s++){
      const z0=0.2+s*(fl+0.1), per=inrow?(s===stacks-1&&n%2===1?1:2):1;
      box(og,MAT.galv,-fw-0.2,0,-0.06,0,z0,z0+fl);
      [z0+0.05,z0+fl-0.1].forEach(z=>box(og,MAT.steel,-fw-0.17,-fw-0.11,-0.3,-0.06,z,z+0.05));
      for(let k=0;k<per;k++){
        const y0=k*(fh+0.05), cm=[MAT.casing,MAT.fan,MAT.casing,MAT.casing,MAT.casing,MAT.casing];
        box(og,cm,-fw-0.15,-0.15,y0,y0+fh,z0,z0+fl);
        [y0+fh*0.35,y0+fh*0.5].forEach((y,j)=>cyl(og,MAT.copper,0.014,0.15,-0.075,y,z0+fl*(0.8+j*0.05),'x',undefined,10));
      }
    }
    tag(og,inrow?'Vertiv CCD254H condenser × '+n:'Mitsubishi Electric outdoor unit × '+n,inrow?'Stacked on the end wall - 1 562 × 830 × 1 272 mm':R.cool.model); }

  /* tech zone: UPS, LV panel, DCIM */
  { const ux0=px+0.25;
    for(let i=0;i<R.upsN;i++){
      const ux=ux0+i*0.5, g=new T.Group(); LAY.power.add(g);
      box(g,MAT.ups,ux,ux+0.38,FL,FL+1.3,0.2,1.05);
      box(g,MAT.black,ux+0.03,ux+0.35,FL+0.05,FL+0.4,1.05,1.058);
      for(let k=0;k<6;k++) box(g,MAT.black,ux+0.05,ux+0.33,FL+0.08+k*0.05,FL+0.1+k*0.05,1.058,1.062,{cast:false});
      box(g,MAT.black,ux+0.04,ux+0.34,FL+1.0,FL+1.22,1.05,1.058);
      box(g,MAT.screen,ux+0.08,ux+0.3,FL+1.07,FL+1.17,1.058,1.062,{cast:false});
      box(g,MAT.ledG,ux+0.04,ux+0.34,FL+1.26,FL+1.275,1.05,1.062,{cast:false});
      tag(g,'UPS '+(R.upsTopo==='2N'?'AB'[i]+' - ':'')+'Schneider Easy UPS 3S Pro '+R.upsKva+' kVA','E3SP'+R.upsKva+'KHB - internal batteries - ≥ 5 min at 80 %');
    }
    const pxx=ux0+R.upsN*0.5+0.1, g=new T.Group(); LAY.power.add(g);
    box(g,MAT.panel,pxx,pxx+0.8,FL,FL+2.0,0.15,0.45);
    box(g,MAT.steel,pxx+0.4-0.004,pxx+0.4+0.004,FL+0.05,FL+1.95,0.45,0.452,{cast:false});
    box(g,MAT.chrome,pxx+0.34,pxx+0.36,FL+0.9,FL+1.1,0.452,0.48);
    [MAT.ledG,MAT.ledB,MAT.ledR].forEach((m,k)=>box(g,m,pxx+0.1+k*0.07,pxx+0.14+k*0.07,FL+1.7,FL+1.74,0.45,0.455,{cast:false}));
    box(g,MAT.black,pxx+0.5,pxx+0.7,FL+1.55,FL+1.8,0.45,0.455,{cast:false});
    box(g,MAT.screen,pxx+0.53,pxx+0.67,FL+1.6,FL+1.75,0.455,0.458,{cast:false});
    tag(g,'Main LV panel','Dual-source with automatic changeover');
    if(S.dcim||S.sec){
      const d=new T.Group(); LAY.mon.add(d);
      box(d,MAT.panel,pxx,pxx+0.5,FL,FL+1.0,0.65,0.95);
      box(d,MAT.black,pxx+0.08,pxx+0.42,FL+0.62,FL+0.9,0.95,0.955,{cast:false});
      box(d,MAT.screen,pxx+0.1,pxx+0.4,FL+0.65,FL+0.87,0.955,0.958,{cast:false});
      box(d,MAT.ledG,pxx+0.1,pxx+0.14,FL+0.5,FL+0.54,0.95,0.955,{cast:false});
      tag(d,S.dcim?'DCIM Schneider StruxureWare':'Security controller',S.dcim?'Hosted monitoring gateway':'CCTV / access control'); }
  }

  /* fire suppression */
  if(S.fire){
    const fx=L-0.4, fz=1.75, g=new T.Group(); LAY.fire.add(g);
    cyl(g,MAT.red,0.2,1.3,fx,FL+0.65,fz,'y',undefined,32);
    sph(g,MAT.red,0.2,fx,FL+1.3,fz,{half:true});
    cyl(g,MAT.black,0.205,0.06,fx,FL+0.03,fz,'y',undefined,32);
    cyl(g,MAT.black,0.205,0.03,fx,FL+0.45,fz,'y',undefined,32);
    cyl(g,MAT.black,0.205,0.03,fx,FL+1.05,fz,'y',undefined,32);
    cyl(g,MAT.brass,0.045,0.1,fx,FL+1.52,fz,'y');
    cyl(g,MAT.black,0.012,0.14,fx,FL+1.58,fz,'x',undefined,8);
    cyl(g,MAT.white,0.03,0.015,fx+0.07,FL+1.5,fz-0.04,'x',undefined,16);
    box(g,MAT.steel,L-0.2,L-0.1,FL+0.45,FL+0.5,fz-0.2,fz+0.2); box(g,MAT.steel,L-0.2,L-0.1,FL+1.05,FL+1.1,fz-0.2,fz+0.2);
    tag(g,'FK-5-1-12 (NOVEC) cylinder','Total-flooding clean agent - 25–50 bar');
    const pg=new T.Group(); LAY.fire.add(pg); const py=2.95, pz=1.75;
    cyl(pg,MAT.red,0.022,py-(FL+1.55),fx,(py+FL+1.55)/2,pz,'y',undefined,12);
    sph(pg,MAT.red,0.026,fx,py,pz);
    const xe=Math.max(0.7,px-1.3);
    cyl(pg,MAT.red,0.022,fx-0.5,(fx+0.5)/2,py,pz,'x',undefined,12);
    [1.3,Math.min(px-0.9,3.2),px+1.0].forEach(function(nx,k){
      if(nx<0.5||nx>L-0.5) return;
      cyl(pg,MAT.red,0.014,0.1,nx,py-0.05,pz,'y',undefined,8);
      cyl(pg,MAT.chrome,0.032,0.04,nx,py-0.12,pz,'y',0.014,14);
      if(k===0) tag(pg,'FK-5-1-12 pipe network','Discharge nozzles in the IT room and the technical compartment');
    });
    [[1.0,1.0],[px-0.8,1.0],[px+1.2,0.9]].forEach(function(a){ cyl(model,MAT.white,0.05,0.04,a[0],H-0.12,a[1]+0.5,'y',undefined,16); });
  }

  /* security */
  if(S.sec){
    const cam=(parent,x,y,z,ceil)=>{
      const g=new T.Group(); g.position.set(x,y,z); parent.add(g);
      if(!ceil) cyl(g,MAT.white,0.02,0.25,0,0.125,0,'y',undefined,10);
      const dy=ceil?0:0.25;
      cyl(g,MAT.white,0.07,0.04,0,dy+0.02,0,'y',undefined,20);
      sph(g,MAT.dome,0.06,0,dy+0.04,0,{half:true});
      tag(g,'CCTV camera','Dome - '+(ceil?'interior':'roof corner'));
    };
    cam(roofG,0.4,H,W-0.35,false); cam(roofG,L-0.5,H,W-0.35,false);
    { const g=new T.Group(); g.position.set(px*0.55,H-0.1,2.5); g.rotation.x=Math.PI; LAY.mon.add(g); cam(g,0,0,0,true); }
    { const g=new T.Group(); g.position.set(px+1.1,H-0.1,2.2); g.rotation.x=Math.PI; LAY.mon.add(g); cam(g,0,0,0,true); }
    box(LAY.mon,MAT.white,dx+0.45,dx+0.55,H-0.2,H-0.1,W-0.4,W-0.3,{cast:false});
  }

  /* lights */
  [[px*0.25,2.4],[px*0.6,2.4],[px*0.9,2.4]].forEach(a=>box(model,MAT.led,a[0]-0.6,a[0]+0.6,H-0.14,H-0.1,a[1]-0.06,a[1]+0.06,{cast:false}));
  box(model,MAT.led,px+1.0,px+2.2,H-0.14,H-0.1,1.54,1.66,{cast:false});
  lightIT.position.set(px*0.5-c,2.8,2.3-W/2);
  lightTech.position.set(px+1.2-c,2.8,1.5-W/2);

  // collect pickables
  model.traverse(function(o){ if(o.isMesh&&(o.userData.tip||o.userData.occ)) pickables.push(o); });
  applyState(true);
}

/* ---------- state ---------- */
function applyState(instant){
  if(!model) return;
  roofG.visible=!!V.roof; frontG.visible=!!V.wall; ghostFront.visible=!V.wall; airG.visible=!!V.air;
  animItems.forEach(function(a){
    if(a.key==='door') a.tgt=V.door?a.amt:0;
    else if(a.key==='rdoors') a.tgt=V.rdoors?a.amt:0;
    if(instant){ a.cur=a.tgt; a.o.rotation.y=a.sign*a.cur; }
  });
  racksArr.forEach(r=>{ if(r.userData.gear) r.userData.gear.visible=!!V.gear; });
  dirty=true; kick(); syncUI();
}
function shown(o){ for(let p=o;p&&p!==world;p=p.parent){ if(!p.visible) return false; } return true; }

function pose(name){
  const L=dims.L, c=(L-0.98)/2, doorX=L-1.15-c;
  switch(name){
    case 'exterior': return {pos:[0.4*L,0.3*L+2.0,0.95*L+3.8],tgt:[0.03*L,1.2,0.1]};
    case 'top': return {pos:[-0.04*L,1.22*L+3.4,0.75],tgt:[-0.04*L,0,0.1]};
    case 'aisle': return {pos:[-0.1*L,1.9,6.2],tgt:[-0.12*L,1.15,-0.7]};
    case 'door': return {pos:[doorX+3.6,2.4,7.6],tgt:[doorX-0.5,1.3,1.5]};
    default: return {pos:[-0.08*L,0.62*L+2.4,1.08*L+2.6],tgt:[-0.02*L,0.9,0.1]};
  }
}

/* ---------- public API ---------- */
return {T,renderer,scene,camera,world,MAT,build,applyState,V,sun,shadowPlane,
  get model(){return model},get roofG(){return roofG},get frontG(){return frontG},get ghostFront(){return ghostFront},get doorG(){return doorG},get airG(){return airG},
  get LAY(){return LAY},get doorPivot(){return doorPivot},get animItems(){return animItems},get dims(){return dims},get racksArr(){return racksArr}};
}
