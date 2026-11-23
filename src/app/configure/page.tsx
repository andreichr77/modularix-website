import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE } from '@/data/site';
import '@/styles/sub.css';

export const metadata: Metadata = {
  title: 'Configure',
  description: 'Tell us the load and get the drawing: the Legacy container configurator returns plan, elevation, 3D view and a quote request.',
};

export default function ConfigurePage() {
  return (
    <div className="sub">
      <SiteHeader active="configure" sheet="Sheet C - Configure" />
      <main>
<div className="wrap">
<p className="legend">Configure - Legacy container</p>
  <h1>Tell us the load.<br />Get the <span className="b">drawing.</span></h1>
  <p className="lede">The configurator takes the capacity you need and returns the container, the cooling, the UPS, the floor plan, the elevation and a 3D view, then a quote request. No login. About two minutes.</p>
  <div className="cta"><Link className="primary" href="/configurator">Open the configurator</Link><Link href="/#contact">Talk to an engineer instead</Link></div>
  <div className="grid3" style={{marginTop: 'clamp(48px,6vw,80px)'}}>
    <article className="card"><div className="n">Step 1</div><h3>Requirement</h3><p>Resilience level, IT load in kilowatts, number of racks. The tool tells you when the load no longer fits the container.</p></article>
    <article className="card"><div className="n">Step 2</div><h3>Solution</h3><p>The recommended container, 6.00 m or 8.50 m, with in-row cooling and UPS sized to the load, and the floor plan drawn from it.</p></article>
    <article className="card"><div className="n">Step 3</div><h3>Configure and quote</h3><p>Racks, PDUs, power topology, fire suppression, security, monitoring, finish. Every change redraws the plan, the elevation and the 3D model. Then request the quote.</p></article>
  </div>
  <div className="grid2" style={{marginTop: 'clamp(48px,6vw,80px)'}}>
    <figure className="fig" style={{margin: 0}}><img src="/assets/configurator-plan.jpg" alt="Configurator floor plan of a 6 m Legacy container" loading="lazy" /><figcaption><span>Floor plan - drawn from the configuration</span><span>Screen from the configurator</span></figcaption></figure>
    <figure className="fig" style={{margin: 0}}><img src="/assets/configurator-3d.jpg" alt="Configurator 3D view of an 8.5 m Legacy container" loading="lazy" /><figcaption><span>3D view - the same model as on this site</span><span>Screen from the configurator</span></figcaption></figure>
  </div>
  <div className="grid2 body" style={{marginTop: 'clamp(48px,6vw,80px)'}}>
    <div><p className="legend">What the configurator covers</p><p>The Legacy range: a 6.00 m container for one to four racks and an 8.50 m container for four to eight, both 3.20 m wide and 3.20 m high, with in-row DX cooling or split units, one or two UPS, and the options you see on the module page.</p></div>
    <div><p className="legend">What it does not</p><p>Larger chilled-water modules, liquid-cooled high-density rooms, EMSEC shielding and multi-module campuses are engineered per project. For those, write to us with the workload and the site and we come back with a drawing.</p><div className="cta"><Link href="/#configs">See the six configurations</Link></div></div>
  </div>
</div>
      </main>
      <SiteFooter />
    </div>
  );
}
