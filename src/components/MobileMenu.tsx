'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAV, type NavKey } from '@/data/site';
import { SOLUTIONS } from '@/data/solutions';

export default function MobileMenu({ active }: { active?: NavKey }) {
  const [open, setOpen] = useState(false);
  const [sol, setSol] = useState(false);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);
  const close = () => setOpen(false);
  return (
    <div className="mm">
      <button type="button" className={`mm-btn${open ? ' open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span /><span /><span />
      </button>
      {open && <div className="mm-scrim" onClick={close} />}
      <div className={`mm-panel${open ? ' open' : ''}`} role="menu">
        {NAV.map((n) => n.key === 'solutions' ? (
          <div key={n.key} className="mm-sol">
            <button type="button" className={active === 'solutions' ? 'on' : undefined} aria-expanded={sol} onClick={() => setSol((s) => !s)}>
              {n.label}<i aria-hidden="true" />
            </button>
            {sol && SOLUTIONS.map((s) => (
              <Link key={s.slug} href={`/solutions/${s.slug}`} className="sub" onClick={close}>{s.title}</Link>
            ))}
          </div>
        ) : (
          <Link key={n.key} href={n.href} className={n.key === active ? 'on' : undefined} onClick={close}>{n.label}</Link>
        ))}
        <Link className="getin" href="/#contact" onClick={close}>Get in touch <i aria-hidden="true">→</i></Link>
      </div>
    </div>
  );
}
