import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CAREERS, JOBS, TOTAL_OPENINGS, applyHref } from '@/data/careers';
import '@/styles/sub.css';
import '@/styles/careers.css';

export const metadata: Metadata = {
  title: 'Careers',
  description: `Synotech and Modularix are hiring: ${TOTAL_OPENINGS} open positions for engineers and skilled trades. Apply by email with your CV.`,
};

export default function CareersPage() {
  return (
    <div className="sub">
      <SiteHeader active="company" sheet="Sheet E - Careers" />
      <main>
        <div className="wrap">
          <p className="legend">Careers - {TOTAL_OPENINGS} open positions</p>
          <h1>Synotech and Modularix<br /><span className="b">are hiring.</span></h1>
          <p className="lede">An international career in the most dynamic segment of the high-tech industry. Join the team that designs, builds and maintains data centers.</p>
          <div className="body" style={{ marginTop: 28 }}>
            <p>Synotech Global Services Romania is the regional leader in the design, construction and maintenance of data centers, with more than 30 years of experience and more than 98 projects delivered. Together with Modularix, the group company for prefabricated, modular and containerised data centers, we are expanding nationally and internationally.</p>
          </div>

          <div className="stats">
            <div><b>{TOTAL_OPENINGS}</b><span>Open positions</span></div>
            <div><b className="iii">{JOBS.length}</b><span>Profiles</span></div>
            <div><b>30+</b><span>Years of experience</span></div>
            <div><b className="iv">21 Dec</b><span>Application deadline, 2026</span></div>
          </div>

          <h2 style={{ marginTop: 'clamp(40px,6vw,72px)' }}>Open <span className="b">positions.</span></h2>
          <div className="jobs" id="positions">
            {JOBS.map((j) => (
              <article className="job" key={j.slug} id={j.slug}>
                <div>
                  <h3>{j.title}</h3>
                  <span className="open">{j.openings} {j.openings === 1 ? 'position' : 'positions'}</span>
                </div>
                <dl>
                  <div><dt>Education and certifications</dt><dd>{j.education}</dd></div>
                  <div><dt>Experience</dt><dd>{j.experience}</dd></div>
                </dl>
                <div className="cta">
                  <a className="primary" href={applyHref(j.title)}>Apply</a>
                </div>
              </article>
            ))}
          </div>

          <div className="grid2" style={{ marginTop: 'clamp(56px,8vw,112px)' }}>
            <div>
              <p className="legend">What we offer</p>
              <ul className="offer">
                <li>Attractive salaries and bonuses</li>
                <li>An international career path</li>
                <li>A fast-growing industry</li>
              </ul>
            </div>
            <div>
              <p className="legend">How to apply</p>
              <p className="lede">Send your CV, together with copies of your diplomas, certifications and references, to <a href={applyHref()} style={{ color: 'var(--blue)' }}>{CAREERS.email}</a>.</p>
              <p className="mono" style={{ marginTop: 14 }}>Deadline for applications: {CAREERS.deadline}</p>
              <div className="cta"><a className="primary" href={applyHref()}>Send your CV</a></div>
            </div>
          </div>
          <p className="smallnote">
            Pressing Apply opens your email app with a ready message to {CAREERS.email}. Attach your CV before sending.
            {' '}Applications are received by {CAREERS.employer}, {CAREERS.address}, tel. {CAREERS.phone}. How we handle your data is described in the <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
