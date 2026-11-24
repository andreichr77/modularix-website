import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { LEGAL } from '@/data/site';
import '@/styles/sub.css';
import '@/styles/legal.css';

export default function LegalPage({ sheet, legend, title, children }: { sheet: string; legend: string; title: string; children: React.ReactNode }) {
  return (
    <div className="sub">
      <SiteHeader sheet={sheet} />
      <main>
        <div className="wrap">
          <article className="legal">
            <p className="legend">{legend}</p>
            <h1>{title}</h1>
            <p className="upd">Last updated {LEGAL.updated}</p>
            {children}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
