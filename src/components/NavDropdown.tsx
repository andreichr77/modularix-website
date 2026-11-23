'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SOLUTIONS } from '@/data/solutions';

export default function NavDropdown({ label, active }: { label: string; active?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className="dd" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className={active ? 'on' : undefined} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label}<i aria-hidden="true" />
      </button>
      <div className={`dd-menu${open ? ' open' : ''}`} role="menu">
        {SOLUTIONS.map((s) => (
          <Link key={s.slug} href={`/solutions/${s.slug}`} role="menuitem" onClick={() => setOpen(false)}>
            <b>{s.id}</b><span>{s.title}</span><em>{s.kind}</em>
          </Link>
        ))}
      </div>
    </div>
  );
}
