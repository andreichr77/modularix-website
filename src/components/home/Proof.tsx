import { CERTS, SITE } from '@/data/site';

export default function Proof() {
  return (
    <section className="band" id="proof" data-sheet="Sheet 14 - Proof">
      <div className="wrap">
        <div className="sh rv">
          <div>
            <p className="legend">14 - A Synotech company</p>
            <h2>
              The people who build<br /><span className="b">Tier IV</span> build this.
            </h2>
          </div>
          <p className="lede">
            Modularix is the modular arm of Synotech Global Services, designing, building and operating critical data
            centers since 1993. The module is built to the same procedures as the facilities below.
          </p>
        </div>
        <div className="stats rv">
          <div><b>{CERTS.length}</b><span>Uptime Institute certified facilities</span></div>
          <div><b className="iv">{CERTS.filter((c) => c.tier === 'iv').length}</b><span>Tier IV</span></div>
          <div><b className="iii">{CERTS.filter((c) => c.tier === 'iii').length}</b><span>Tier III</span></div>
          <div><b>1993</b><span>In critical infrastructure since</span></div>
        </div>
        <div className="strip" id="certs">
          {CERTS.map((c, i) => (
            <a key={i} className="cert" href={SITE.registerUrl} target="_blank" rel="noopener">
              <span className={`tier ${c.tier}`}>{c.tier === 'iv' ? 'Tier IV' : 'Tier III'}</span>
              <h3>{c.city}</h3>
              <p>{c.scope === 'Design documents' ? 'Design documents' : 'Design and Constructed Facility'} - {c.client}</p>
              <span className="yr"><span>{c.code}</span><span>{c.year}</span></span>
            </a>
          ))}
        </div>
        <div className="striphint"><span>Each card opens the Uptime Institute register</span><i /></div>
        <div className="press rv">
          <span className="mono">In the press - Ziarul Financiar - Sep 2026</span>
          <div>
            <q>Synotech, lider detașat pe piața centrelor de date din România, lansează Modularix</q>
            <p>Synotech launches Modularix, a subsidiary dedicated to prefabricated, modular and containerised data centers.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
