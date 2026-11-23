import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SOLUTIONS, bySlug } from '@/data/solutions';
import '@/styles/sub.css';
import '@/styles/solutions.css';

type P = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return SOLUTIONS.map((s) => ({ slug: s.slug })); }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const s = bySlug((await params).slug);
  return s ? { title: s.title, description: `${s.title}: ${s.intro}`.slice(0, 200) } : {};
}

export default async function SolutionPage({ params }: P) {
  const s = bySlug((await params).slug);
  if (!s) notFound();
  const others = SOLUTIONS.filter((x) => x.slug !== s.slug);
  return (
    <div className="sub">
      <SiteHeader active="solutions" sheet={`Solutions - ${s.id}`} />
      <main>
        <div className="wrap">
          <p className="legend">Solutions - {s.id} - {s.kind}</p>
          <h1>{s.title}</h1>
          <p className="sol-tag">{s.tagline}</p>
          <p className="lede">{s.intro}</p>
          <div className="ptags">{s.tags.map((t) => <span key={t}>{t}</span>)}</div>
          <div className="cta">
            <Link className="primary" href="/#contact">Request a quote</Link>
            <Link href="/#contact">Talk to an engineer</Link>
          </div>

          <h2>Technical <span className="b">data.</span></h2>
          {s.groups.map((g, i) => (
            <section key={i} className="specs">
              {g.title && <h3 className="spec-h">{g.title}</h3>}
              <dl>
                {g.specs.map((x) => (<div key={x.label}><dt>{x.label}</dt><dd>{x.value}</dd></div>))}
              </dl>
            </section>
          ))}
          {s.notes && s.notes.map((n) => <p key={n} className="spec-note">{n}</p>)}
          <p className="mono spec-src">Specifications as published for this configuration. Complete technical data from the engineering team.</p>

          <h2>Other <span className="b">solutions.</span></h2>
          <div className="osol">
            {others.map((o) => (
              <Link key={o.slug} href={`/solutions/${o.slug}`}>
                <b>{o.id}</b><span>{o.title}</span><em>{o.kind}</em>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
