import Link from 'next/link';
import { NAV, type NavKey } from '@/data/site';
import NavDropdown from '@/components/NavDropdown';
import MobileMenu from '@/components/MobileMenu';

type Props = {
  active?: NavKey;
  sheet: string;
  /** Second line under the sheet label (home + journey). Omit on content pages. */
  prod?: string;
  /** The scenes update these two elements while scrolling. */
  sheetId?: string;
  prodId?: string;
};

export default function SiteHeader({ active, sheet, prod, sheetId, prodId }: Props) {
  return (
    <header>
      <Link className="logo" href="/" aria-label="Modularix home">
        <img src="/assets/logo-dark.svg" alt="Modularix" width={110} height={28} />
      </Link>
      <nav className="top" aria-label="Primary">
        {NAV.map((n) => n.key === 'solutions' ? (
          <NavDropdown key={n.key} label={n.label} active={active === 'solutions'} />
        ) : (
          <Link key={n.key} href={n.href} className={n.key === active ? 'on' : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="hr">
        {prod !== undefined ? (
          <div className="sheetwrap">
            <div className="sheet" id={sheetId}>{sheet}</div>
            <div className="prod" id={prodId}>{prod}</div>
          </div>
        ) : (
          <div className="sheet">{sheet}</div>
        )}
        <Link className="getin desk" href="/#contact">Get in touch <i aria-hidden="true">→</i></Link>
        <MobileMenu active={active} />
      </div>
    </header>
  );
}
