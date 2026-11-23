'use client';

import { useEffect, useRef, useState } from 'react';
import { PROJECTS, type Project } from '@/data/projects';

/** Top-down schematic of the layout, drawn from the same spec as the 3D preview. */
function Plan({ p }: { p: Project }) {
  const m = p.model;
  const pad = 4, gens = m.gens ? 4.8 : 0;
  const totalL = m.L + gens, vw = 400, s = (vw - pad * 2) / totalL, vh = m.W * s + pad * 2 + 4;
  const X = (x: number) => pad + x * s;
  const rows = m.racks > 6 ? 2 : 1;
  const per = Math.ceil(m.racks / rows);
  const bl = m.body[1] - m.body[0];
  const step = Math.min(0.62, (bl - 1.9) / (per + Math.ceil(m.inrow / rows)));
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    const n = per + Math.ceil(m.inrow / rows);
    const y0 = rows === 2 ? (r ? m.W - 1.5 : 0.35) : 0.4;
    for (let i = 0; i < n; i++) {
      const x = m.body[0] + (bl - n * step) / 2 + i * step;
      cells.push(<rect key={`${r}-${i}`} x={X(x)} y={pad + 2 + y0 * s} width={step * s * 0.9} height={1.1 * s} fill="none" stroke="#4FB0FF" strokeWidth=".8" opacity=".75" />);
    }
  }
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} role="img" aria-label={`Plan view, ${p.name}`}>
      <rect x={X(0)} y={pad + 2} width={m.L * s} height={m.W * s} fill="rgba(79,176,255,.05)" stroke="#4FB0FF" strokeWidth="1" strokeDasharray="4 3" />
      <rect x={X(m.body[0])} y={pad + 2} width={bl * s} height={m.W * s} fill="rgba(79,176,255,.1)" stroke="#EAF1FF" strokeWidth="1.2" />
      {cells}
      {m.chillers.map((c, i) => (
        <g key={i}>
          <rect x={X(c - 0.6)} y={pad + 2 + 0.1 * s} width={1.2 * s} height={(m.W - 0.2) * s} fill="none" stroke="#EA2322" strokeWidth="1" opacity=".9" />
          <circle cx={X(c)} cy={pad + 2 + m.W * 0.33 * s} r={0.45 * s} fill="none" stroke="#EA2322" strokeWidth=".8" />
          <circle cx={X(c)} cy={pad + 2 + m.W * 0.67 * s} r={0.45 * s} fill="none" stroke="#EA2322" strokeWidth=".8" />
        </g>
      ))}
      {Array.from({ length: m.gens }).map((_, i) => (
        <rect key={i} x={X(m.L + 0.9)} y={pad + 2 + (i ? m.W * 0.55 : 0.1) * s} width={2.4 * s} height={1.1 * s} fill="none" stroke="#8AA2C9" strokeWidth="1" />
      ))}
    </svg>
  );
}

function Viewer({ p, onClose }: { p: Project; onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ view: (n: string) => void; replay: () => void; stop: () => void } | null>(null);
  const lab = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<'preview' | 'glb'>('preview');
  const [err, setErr] = useState(false);

  useEffect(() => {
    let dead = false;
    import('@/scenes/project-viewer').then(({ startViewer }) => {
      if (dead || !ref.current) return;
      try {
        api.current = startViewer(ref.current, p, { labelsEl: lab.current, onModel: (k: 'preview' | 'glb') => setSrc(k) });
      } catch { setErr(true); }
    });
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { dead = true; api.current?.stop(); window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [p, onClose]);

  return (
    <div className="pv" role="dialog" aria-modal="true" aria-label={`${p.name} 3D model`}>
      <canvas ref={ref} tabIndex={0} />
      <div className="pv-labels" ref={lab} aria-hidden="true" />
      {err && <div className="pv-err">3D needs WebGL. Enable hardware acceleration and reload.</div>}
      <div className="pv-top">
        <div><span className="mono">{p.kind}</span><h3>{p.name}</h3></div>
        <button onClick={onClose} aria-label="Close viewer">Close  Esc</button>
      </div>
      <div className="pv-views">
        <button onClick={() => api.current?.view('outside')}>1 Outside</button>
        <button onClick={() => api.current?.view('inside')}>2 Inside</button>
        <button onClick={() => api.current?.view('top')}>3 Top</button>
        <button onClick={() => api.current?.replay()}>R Replay build</button>
      </div>
      <div className="pv-help mono">
        <span><b>W A S D</b> / arrows move</span><span><b>Drag</b> look</span><span><b>Q E</b> down / up</span><span><b>Shift</b> faster</span><span><b>Scroll</b> forward</span>
        {p.model.preview && <span className="warn">Placeholder model, standard Modularix module</span>}
      </div>
    </div>
  );
}

export default function ProjectsGrid() {
  const [open, setOpen] = useState<Project | null>(null);
  return (
    <>
      <div className="pgrid">
        {PROJECTS.map((p, i) => (
          <article className="pcard" key={p.id}>
            <div className="pplan"><Plan p={p} /></div>
            <div className="pbody">
              <p className="mono"><span className="b">{String(i + 1).padStart(2, '0')}</span>  {p.kind}</p>
              <h3>{p.name}</h3>
              <p className="psum">{p.summary}</p>
              <dl>{p.stats.map((s) => (<div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>))}</dl>
              <div className="ptags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
              <button className="pview" onClick={() => setOpen(p)}>View in 3D</button>
            </div>
          </article>
        ))}
      </div>
      {open && <Viewer p={open} onClose={() => setOpen(null)} />}
    </>
  );
}
