import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { CERTS, SITE } from '@/data/site';
import '@/styles/sub.css';

export const metadata: Metadata = {
  title: 'Company',
  description: 'Modularix is the modular arm of Synotech Global Services: seven Uptime Institute certified facilities, four at Tier IV.',
};

export default function CompanyPage() {
  return (
    <div className="sub">
      <SiteHeader active="company" sheet="Sheet D - Company" />
      <main>
<div className="wrap">
<p className="legend">Company - A Synotech company</p>
  <h1>The people who build<br /><span className="b">Tier IV</span> build this.</h1>
  <p className="lede">Modularix is the modular arm of Synotech Global Services, a Romanian integrator that has designed, built and operated critical data centers since 1993. The module is built by the same engineers, to the same procedures, as the certified facilities below.</p>
  <div className="stats">
    <div><b>7</b><span>Uptime Institute certified facilities</span></div>
    <div><b className="iv">4</b><span>Tier IV</span></div>
    <div><b className="iii">3</b><span>Tier III</span></div>
    <div><b>130+</b><span>Professionals, 10+ Uptime-accredited engineers</span></div>
  </div>
  <h2>Seven certified <span className="b">facilities.</span></h2>
  <p className="lede" style={{marginBottom: 24}}>Design and, for six of the seven, the constructed facility itself, tested by Uptime Institute on site. Four at Tier IV, the top of the scheme, delivered in three years by one team.</p>
  <div className="tblwrap"><table>
      <thead><tr><th>Site</th><th>Tier</th><th>Certification</th><th>Year</th><th>End client</th></tr></thead>
      <tbody>
{CERTS.map((c, i) => (
  <tr key={i}>
    <td>{c.city}</td>
    <td><span className={`tier ${c.tier}`}>{c.tier === 'iv' ? 'Tier IV' : 'Tier III'}</span></td>
    <td>{c.scope}</td>
    <td>{c.year}</td>
    <td>{c.client}</td>
  </tr>
))}
</tbody></table></div>
  <p className="mono" style={{marginTop: 12}}><a href={SITE.registerUrl} target="_blank" rel="noopener" style={{color: 'var(--blue)'}}>Uptime Institute register →</a></p>
  <div className="grid2" style={{marginTop: 'clamp(56px,8vw,112px)'}}>
    <div className="body">
      <p className="legend">Why it matters for a module</p>
      <p>A Tier IV Constructed Facility certificate means Uptime's own engineers switched off live systems on site and watched the load stay up. The procedures that pass that test, dual paths, compartmentation, maintenance without shutdown, documented commissioning, are the procedures the Modularix factory runs.</p>
      <p>In 2025 Uptime Institute named Synotech its Best Partner, for the delivery record and for more than 150 professional training courses delivered with the Institute. The same training builds local teams wherever a module is installed.</p>
      <p className="legend" style={{marginTop: 36}}>Where</p>
      <p>Headquartered in Bucharest, with offices in Romania, Moldova, Hungary and Germany. More than 98 projects delivered, a named portfolio above 150 million euro.</p>
    </div>
    <div>
      <ul className="tl">
        <li><b>1993</b><p>Synotech starts in critical infrastructure.</p></li>
        <li><b>2024</b><p>Three Tier III facilities certified: Brașov, Brașov, Sibiu.</p></li>
        <li><b>2025</b><p>Four Tier IV facilities certified: Bucharest twice, Timiș twice. Uptime Institute Best Partner award.</p></li>
        <li><b>2026</b><p>Modularix launched as the subsidiary for prefabricated, modular and containerised data centers. First modules fitted out and shipped.</p></li>
      </ul>
      <div className="grid2" style={{marginTop: 24, gap: 16}}>
        <figure className="fig" style={{margin: 0}}><img src="/assets/team1.jpg" alt="Synotech engineer working inside a module" loading="lazy" /><figcaption><span>Fit-out, inside a module</span><span>Photo</span></figcaption></figure>
        <figure className="fig" style={{margin: 0}}><img src="/assets/team2.jpg" alt="Engineer working on rack rows" loading="lazy" /><figcaption><span>Rack row, in production</span><span>Photo</span></figcaption></figure>
      </div>
    </div>
  </div>
  <div className="grid2" style={{marginTop: 'clamp(56px,8vw,112px)'}}>
    <div><p className="legend">In the press</p><p style={{fontSize: 'clamp(18px,1.8vw,24px)', fontWeight: 500, letterSpacing: '-.01em', lineHeight: '1.3', margin: 0}}>“Synotech, lider detașat pe piața centrelor de date din România, lansează Modularix”</p><p className="mono" style={{marginTop: 10}}>Ziarul Financiar - September 2026</p></div>
    <div><p className="legend">Talk to us</p><p className="lede">Tell us the workload and the site. We come back with a drawing.</p><div className="cta"><Link className="primary" href="/#contact">Contact</Link><a href="https://synotech.com" target="_blank" rel="noopener">synotech.com</a></div></div>
  </div>
</div>
      </main>
      <SiteFooter />
    </div>
  );
}
