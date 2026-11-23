/* eslint-disable */
// @ts-nocheck
// Scroll-driven WebGL scene. Ported from the original single-file prototype; markup lives in React components.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { makeLegacy3D, disposeRenderers } from './legacy3d';

export function initHomeScene() {
  let disposed = false;
  const _listeners = [];
  const requestAnimationFrame = (fn) => window.requestAnimationFrame((t) => { if (!disposed) fn(t); });
  const addEventListener = (type, fn, opts) => { window.addEventListener(type, fn, opts); _listeners.push([type, fn, opts]); };
  window.THREE = THREE; window.gsap = gsap; window.ScrollTrigger = ScrollTrigger;

document.documentElement.classList.add('js');
(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone=matchMedia('(max-width: 760px)').matches;
  if(!window.gsap||!window.ScrollTrigger){document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'));return;}
  gsap.registerPlugin(ScrollTrigger);
  const sheet=document.getElementById('sheet'); const prod=document.getElementById('prod'); const PROD_STORY='Legacy container - 8.50 × 3.20 × 3.20 m';

  // ======================= STORY: WebGL module =======================
  let render=()=>{}, progress=0, curBeat=-1, inAfter=false, tl=null, setBeat=()=>{};
  (function story(){
    if(!window.THREE){document.getElementById('nowebgl').style.display='flex';return;}
    const L3=makeLegacy3D(); if(!L3) return;
    const {T,renderer,scene,camera,MAT}=L3;
    // Fixed configuration from the Legacy configurator: 8.50 m, 8 × 42U Schneider, in-row DX 40 kW (3 × CRD25, N+1), 2 × 40 kVA UPS (2N), fire, security, DCIM
    const L=8.5, W=3.2, H=3.2, c=(L-0.98)/2, TECH=2.4, px=L-0.1-TECH, dx=L-0.1-1.55;
    const Rcfg={Ld:L,c:{L:L},rk:{u:42,w:0.6,d:1.0,h:1.991},br:{model:'Easy Rack ER6202'},cool:{inrow:true,rated:40,model:'Vertiv Liebert CRD25 + CCD254H'},coolUnits:3,coolRed:'N+1',kw:40,upsKva:40,upsN:2,upsTopo:'2N'};
    const Scfg={color:'blue',smallLogo:true,dcim:true,fire:true,kwRack:5,pdu:'M',rackBrand:'schneider',sec:true};
    const seq=['R','R','C','R','R','C','R','R','C','R','R'];
    try{ L3.build(Rcfg,Scfg,seq); }catch(e){ console.error(e); document.getElementById('nowebgl').style.display='flex'; return; }
    Object.assign(L3.V,{roof:1,wall:1,door:0,rdoors:0,air:0,gear:1}); L3.applyState(true);
    // a little rim light for the dark ground
    const rim=new T.DirectionalLight(0x4FB0FF,.55); rim.position.set(-10,5,-8); scene.add(rim);
    const toW=(x,y,z)=>new T.Vector3(x-c,y+0.3,z-W/2);
    const BLUE=new T.Color(0x4FB0FF);
    for(const k of['coolBody','casing','ups','panel','rack','perf','rib','paint','red']) MAT[k].emissive=BLUE;

    const S={theta:-0.75,phi:0.30,dist:15,lift:0,tx:1,roof:0,walls:0,wf:1,cool:0,inrow:0,power:0,racks:0,door:0,mon:0,hi:{shell:0,cool:0,power:0,racks:0,door:0,mon:0}};
    const target=new T.Vector3(0.49,1.6,0); let perf=0;
    // the front wall fades in when it returns, so it settles instead of landing
    const wallMats=[]; L3.frontG.traverse(o=>{ if(o.isMesh){ const arr=Array.isArray(o.material); const ms=(arr?o.material:[o.material]).map(m=>{const c=m.clone(); wallMats.push({c,m}); return c;}); o.material=arr?ms:ms[0]; }});
    const syncWall=()=>wallMats.forEach(({c,m})=>{ if(m.color) c.color.copy(m.color); if(m.emissive) c.emissive.copy(m.emissive); if('envMapIntensity' in m) c.envMapIntensity=m.envMapIntensity; if('emissiveIntensity' in m) c.emissiveIntensity=m.emissiveIntensity; });
    let wfState=1;
    function apply(){
      syncWall();
      if(S.wf!==wfState){ wfState=S.wf; const tr=wfState<0.999; wallMats.forEach(({c,m})=>{ c.opacity=wfState*m.opacity; const t=m.transparent||tr; if(c.transparent!==t){c.transparent=t;c.needsUpdate=true;} }); }
      L3.roofG.position.y=S.roof*3.2;
      L3.frontG.position.z=S.walls*2.4; L3.frontG.position.y=S.walls*0.9; L3.frontG.visible=S.walls<0.97; L3.ghostFront.visible=S.walls>=0.97;
      if(L3.doorPivot) L3.doorPivot.rotation.y=S.door*1.25;
      const LY=L3.LAY; LY.cool.position.y=S.cool*1.5; LY.racks.position.y=S.racks*0.6; LY.power.position.y=S.power*0.6; LY.mon.position.y=S.mon*0.9; LY.fire.position.y=S.mon*0.9;
      MAT.coolBody.emissiveIntensity=S.hi.cool*.45; MAT.casing.emissiveIntensity=S.hi.cool*.35;
      MAT.ups.emissiveIntensity=S.hi.power*.45; MAT.panel.emissiveIntensity=S.hi.power*.35;
      MAT.rack.emissiveIntensity=S.hi.racks*.35; MAT.perf.emissiveIntensity=S.hi.racks*.25;
      MAT.rib.emissiveIntensity=S.hi.shell*.12; MAT.paint.emissiveIntensity=S.hi.shell*.12;
      MAT.screen.emissiveIntensity=1.5+S.hi.mon*2.5; MAT.red.emissiveIntensity=S.hi.mon*.35;
      const cy=1.6+S.lift*0.9; const offX=(isPhone?0:-3.0)*S.tx; target.set(0.49+offX,cy-(isPhone?S.tx*1.4:0),0); const d=S.dist;
      camera.position.set(target.x+d*Math.cos(S.phi)*Math.sin(S.theta),target.y+d*Math.sin(S.phi),target.z+d*Math.cos(S.phi)*Math.cos(S.theta));
      camera.lookAt(target);
    }
    const anchors={
      shell:()=>toW(L/2,H+S.roof*3.2+0.15,W/2),
      cool:()=>toW(-0.55,1.45+S.cool*1.5,1.0),
      power:()=>toW(px+0.5,1.6+S.power*0.6,0.6),
      racks:()=>toW(2.95,2.1+S.racks*0.6,1.2),
      door:()=>toW(dx+0.5,1.3+S.walls*0.9,W+S.walls*2.4),
      mon:()=>toW(px+1.35,1.15+S.mon*0.9,0.8)
    };
    const chipOff={shell:[150,-70],cool:[-160,-70],power:[160,-80],racks:[0,-110],door:[170,40],mon:[150,-90]};
    const chipEls={},lnEls={},dtEls={};
    for(const k of Object.keys(anchors)){chipEls[k]=document.getElementById('ch-'+k);lnEls[k]=document.getElementById('ln-'+k);dtEls[k]=document.getElementById('dt-'+k);}
    function projectChips(){
      const w=innerWidth,h=innerHeight;
      for(const k of Object.keys(anchors)){
        const v=anchors[k](); v.project(camera);
        const sx=(v.x*0.5+0.5)*w, sy=(-v.y*0.5+0.5)*h; const on=S.hi[k]>0.5&&progress<0.9;
        const o=chipOff[k]; const scale=isPhone?0.55:1; const rightPad=isPhone?70:170;
        let cx=sx+o[0]*scale, cy=sy+o[1]*scale; cx=Math.max(70,Math.min(w-rightPad,cx)); cy=Math.max(80,Math.min(h*0.62,cy));
        const el=chipEls[k]; el.style.left=cx+'px'; el.style.top=cy+'px'; el.classList.toggle('on',on);
        const ln=lnEls[k]; ln.setAttribute('x1',sx);ln.setAttribute('y1',sy);ln.setAttribute('x2',cx);ln.setAttribute('y2',cy);ln.style.opacity=on?.9:0;
        const dt=dtEls[k]; dt.setAttribute('cx',sx);dt.setAttribute('cy',sy);dt.style.opacity=on?1:0;
      }
    }
    function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);const a=w/h;camera.aspect=a;
      camera.fov=a>=16/9?32:Math.min(62,2*Math.atan(Math.tan(16*Math.PI/180)*(16/9)/a)*180/Math.PI);camera.updateProjectionMatrix();}
    addEventListener('resize',resize);resize();

    const copies=[...document.querySelectorAll('#copy .copy')]; const copyLayer=document.getElementById('copy');
    const rail=[...document.querySelectorAll('#rail span')]; const hint=document.getElementById('hint');
    tl=gsap.timeline({defaults:{ease:'none',lazy:false}}); const D=isPhone?17:15;
    tl.to(S,{theta:0.55,phi:0.22,tx:0.55,dist:D*0.95,duration:1},0);
    tl.to(S,{roof:1,lift:1,phi:0.42,dist:D*1.15,theta:0.35,duration:1},1);
    // front wall leaves: fades out as it lifts away
    tl.to(S,{walls:1,duration:1,ease:'power2.in'},1); tl.to(S,{wf:0,duration:0.8,ease:'sine.inOut'},1);
    tl.to(S.hi,{shell:1,duration:0.25},1.55); tl.to(S.hi,{shell:0,duration:0.25},2.35);
    tl.to(S,{cool:1,theta:-0.9,phi:0.36,duration:1},2); tl.to(S.hi,{cool:1,duration:0.25},2.6); tl.to(S.hi,{cool:0,duration:0.25},3.35);
    tl.to(S,{power:1,theta:0.75,phi:0.38,duration:1},3); tl.to(S.hi,{power:1,duration:0.25},3.6); tl.to(S.hi,{power:0,duration:0.25},4.35);
    tl.to(S,{racks:1,theta:0.2,phi:0.5,dist:D*1.0,duration:1},4); tl.to(S.hi,{racks:1,duration:0.25},4.6); tl.to(S.hi,{racks:0,duration:0.25},5.35);
    tl.to(S,{door:1,theta:0.45,phi:0.2,dist:D*0.95,duration:1},5); tl.to(S.hi,{door:1,duration:0.25},5.6); tl.to(S.hi,{door:0,duration:0.25},6.35);
    tl.to(S,{mon:1,theta:0.7,phi:0.45,dist:D*1.15,duration:1},6); tl.to(S.hi,{mon:1,duration:0.25},6.6); tl.to(S.hi,{mon:0,duration:0.25},7.35);
    tl.to(S,{roof:0,cool:0,power:0,racks:0,door:0,mon:0,lift:0,tx:1,theta:-0.95,phi:0.26,dist:D*1.12,duration:1},7);
    // front wall: eases in and fades up, no hard landing
    tl.set(S,{wf:0},7); tl.to(S,{wf:1,duration:0.9,ease:'sine.inOut'},7); tl.to(S,{walls:0,duration:1,ease:'power3.out'},7);
    tl.pause();
    const story=document.getElementById('story');
    ScrollTrigger.create({trigger:story,start:'top top',end:'bottom bottom',scrub:reduced?false:0.6,onUpdate:self=>{progress=self.progress;}});
    setBeat=function(i){if(i===curBeat)return;curBeat=i;copies.forEach((c,j)=>c.classList.toggle('on',j===i));rail.forEach((r,j)=>r.classList.toggle('on',j===i));sheet.textContent=copies[i].dataset.sheet;prod.textContent=PROD_STORY;
      copyLayer.classList.toggle('scrim',isPhone||(i>0&&i<8));hint.classList.toggle('off',i>0);};
    if(reduced){tl.progress(0.58);}
    let last=0;
    render=function(t,force){
      perf=t;
      const sb=story.getBoundingClientRect().bottom; const visible=sb>-50||force;
      if(!reduced){tl.progress(progress*(1-1e-4));}
      if(!inAfter) setBeat(Math.min(8,Math.round(progress*8)));
      if(!visible){last=t;return;}
      const idleAmt=Math.max(0,1-progress*8)+Math.max(0,(progress-0.9)*10);
      const th=S.theta; S.theta+=idleAmt*0.00012*(t-last); last=t;
      apply(); S.theta=th; projectChips(); renderer.render(scene,camera);
    };
  })();

  // ======================= AFTER: drawing-set bands =======================
  const after=document.getElementById('after');
  const bands=[...document.querySelectorAll('#after .band')];
  const rvs=[...document.querySelectorAll('.rv')];
  if(reduced) rvs.forEach(e=>e.classList.add('in'));
  let lastBand=null;
  function afterState(){
    const vh=innerHeight; const at=after.getBoundingClientRect().top;
    const now=at<vh*0.7;
    if(now!==inAfter){inAfter=now;document.querySelector('.home')?.classList.toggle('after',now);if(!now)curBeat=-1;}
    if(now){
      let cur=null; for(const b of bands){const r=b.getBoundingClientRect(); if(r.top<=vh*0.55&&r.bottom>vh*0.55){cur=b;break;}}
      if(cur&&cur!==lastBand){lastBand=cur;sheet.textContent=cur.dataset.sheet;prod.textContent=cur.dataset.prod||'';} else if(!cur&&lastBand){lastBand=null;}
      for(const e of rvs){if(!e.classList.contains('in')){const r=e.getBoundingClientRect();if(r.top<vh*0.94&&r.bottom>0)e.classList.add('in');}}
    }
  }
  // statement: words light with scroll
  const w1=[...document.querySelectorAll('#st1 span')], w2=[...document.querySelectorAll('#st2 span')];
  ScrollTrigger.create({trigger:'#why',start:'top 70%',end:'bottom 70%',scrub:true,onUpdate:s=>{const p=s.progress;const n1=Math.floor(p*1.25*w1.length);w1.forEach((w,i)=>w.classList.toggle('lit',i<n1));const n2=Math.floor((p-0.6)/0.3*w2.length);w2.forEach((w,i)=>w.classList.toggle('lit',i<n2));}});
  // site plan: draw in, then light the three interfaces with the list
  (function sitePlan(){
    const holder=document.getElementById('siteplan'); const svg=holder&&holder.querySelector('svg'); if(!svg)return;
    const strokes=[...svg.querySelectorAll('rect,line,path,circle')].filter(e=>{const s=e.getAttribute('stroke');return s&&s!=='none'&&!e.closest('.mk');});
    const data=strokes.map(e=>{let len=0;try{len=e.getTotalLength();}catch(x){len=0}const dash=e.getAttribute('stroke-dasharray')||e.style.strokeDasharray||'';return{e,len,dash,done:false};});
    if(!reduced){data.forEach(d=>{if(d.len>0){d.e.style.strokeDasharray=d.len;d.e.style.strokeDashoffset=d.len;}});}
    const rows=[...document.querySelectorAll('#ifl li')];
    const n=data.length;
    function update(p){
      if(!reduced){data.forEach((d,i)=>{const t=i/n*0.5;const q=Math.max(0,Math.min(1,(p-t)/0.1));if(q>=1&&!d.done){d.done=true;d.e.style.strokeDasharray=d.dash;d.e.style.strokeDashoffset='';}else if(q<1){d.done=false;d.e.style.strokeDasharray=d.len;d.e.style.strokeDashoffset=d.len*(1-q);}});}
      holder.classList.toggle('text',p>0.5);
      const k=p<0.56?0:p<0.71?1:p<0.86?2:3;
      rows.forEach((r,i)=>r.classList.toggle('on',p>0.5&&(k===0?true:i===k-1)));
      svg.querySelectorAll('.mk,.if,.pad').forEach(el=>{const m=+el.dataset.n;el.classList.toggle('on',k>0&&m===k);});
    }
    ScrollTrigger.create({trigger:'#site',start:'top 60%',end:'bottom 40%',scrub:true,onUpdate:s=>update(s.progress)});
    update(reduced?1:0);
  })();
  // scale grid
  (function scale(){
    const rects=[...document.querySelectorAll('#sgrid .m')]; const nm=document.getElementById('stagename'), nc=document.getElementById('stagecount'); if(!rects.length)return;
    const stages=[[1,'One module'],[4,'A row'],[12,'A block'],[48,'A campus']];
    function set(p){const si=p<0.25?0:p<0.5?1:p<0.75?2:3;const [cnt,name]=stages[si];rects.forEach(r=>{const i=+r.dataset.i;const row=Math.floor(i/12),col=i%12;const on=cnt===1?(row===0&&col===0):cnt===4?(row===0&&col<4):cnt===12?(row===0):true;r.classList.toggle('on',on);});nm.textContent=name;nc.textContent=cnt;}
    ScrollTrigger.create({trigger:'#scale',start:'top 60%',end:'bottom 50%',scrub:true,onUpdate:s=>set(s.progress)}); set(reduced?1:0);
  })();
  // certificates: cover-flow tilt by distance to the strip centre
  (function certs(){
    const strip=document.getElementById('certs'); if(!strip)return; const cards=[...strip.children]; let raf=0;
    function tilt(){raf=0;const r=strip.getBoundingClientRect();const c=r.left+r.width/2;cards.forEach(card=>{const b=card.getBoundingClientRect();const d=(b.left+b.width/2-c)/r.width;const dd=Math.max(-1,Math.min(1,d));card.style.transform=reduced?'':`rotateY(${(-dd*28).toFixed(2)}deg) scale(${(1-Math.abs(dd)*0.12).toFixed(3)})`;card.style.opacity=(1-Math.abs(dd)*0.35).toFixed(3);});}
    strip.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(tilt);},{passive:true}); addEventListener('resize',tilt); tilt();
  })();
  // copy email
  (function mail(){
    const btn=document.getElementById('copymail'), txt=document.getElementById('mailtxt'); if(!btn)return;
    btn.addEventListener('click',()=>{const v=txt.textContent.trim();const done=()=>{btn.textContent='Copied';setTimeout(()=>btn.textContent='Copy',1600);};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(done).catch(()=>{const s=getSelection(),rg=document.createRange();rg.selectNodeContents(txt);s.removeAllRanges();s.addRange(rg);btn.textContent='Selected';setTimeout(()=>btn.textContent='Copy',1600);});}
      else{const s=getSelection(),rg=document.createRange();rg.selectNodeContents(txt);s.removeAllRanges();s.addRange(rg);}});
  })();

  // ======================= loop =======================
  function frame(t){afterState();render(t);requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
  window.__mx={get progress(){return progress},get beat(){return curBeat},get tl(){return tl},tick(){ScrollTrigger.update();afterState();render(performance.now(),true);}};
})();

  return () => {
    disposed = true;
    _listeners.forEach(([t, f, o]) => window.removeEventListener(t, f, o));
    ScrollTrigger.getAll().forEach((s) => s.kill());
    gsap.globalTimeline.clear();
    disposeRenderers();
    document.documentElement.classList.remove('js');
  };
}
