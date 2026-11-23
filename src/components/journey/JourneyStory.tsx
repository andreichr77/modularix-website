import Link from 'next/link';

export default function JourneyStory() {
  return (
    <>
      <div id="stage" />
        <div id="nowebgl">THIS FILM NEEDS WEBGL.<br />OPEN IT IN SAFARI OR CHROME.</div>
        <div id="labels" aria-hidden="true" />
        <div id="hud" aria-label="Journey stages">
          <div className="chip on"><b>01</b> Build<i /></div>
          <div className="chip"><b>02</b> Load<i /></div>
          <div className="chip"><b>03</b> Ship<i /></div>
          <div className="chip"><b>04</b> Install<i /></div>
          <span id="hud-pct">0%</span>
        </div>
        <aside id="tele" aria-hidden="true">
          <p className="th">Telemetry <span>Module</span></p>
          <dl>
            <div><dt>Stage</dt><dd id="t-stage">01 / 04 BUILD</dd></div>
            <div><dt>Location</dt><dd id="t-loc">Factory hall</dd></div>
            <div><dt>Status</dt><dd id="t-state">ASSEMBLY</dd></div>
            <div><dt>Progress</dt><dd id="t-pct">0%</dd></div>
          </dl>
        </aside>
        <div id="copy">
          <div className="copy on" data-sheet="Film 01 - Build"><p className="eyebrow">The journey - 01 - Build</p><h1>Built indoors.<br /><span className="b">Every part of it.</span></h1><p>Frame, envelope, racks, cooling, power. Assembled and tested in the hall, under a crane, in dry air. Scroll to follow one container to its pad.</p></div>
          <div className="copy" data-sheet="Film 02 - Load"><p className="eyebrow">02 - Load</p><h2>One lift,<br />then <span className="b">standard width.</span></h2><p>The finished container goes onto a low-bed in a single lift. 16.35 by 3.20 by 3.20 metres travels on a single extendable trailer, chillers already integrated in the end bays.</p></div>
          <div className="copy" data-sheet="Film 03 - Ship"><p className="eyebrow">03 - Ship</p><h2>Lifted like<br />any other <span className="b">box.</span></h2><p>Quay crane, corner castings, twist locks, lashing. The same container reaches Constanța, Alexandria or Rotterdam without being opened.</p></div>
          <div className="copy last" data-sheet="Film 04 - Install"><p className="eyebrow">04 - Install</p><h2>Set down<br /><span className="b">once.</span></h2><p>A mobile crane, a level pad, power and data at the end wall. Then the lights come on.</p><div className="cta"><Link className="primary" href="/#configs">See the configurations</Link><Link href="/#site">What the site needs</Link></div><p className="foot">Film - scroll to scrub - Legacy container from the configurator - vehicles and sets drawn</p></div>
        </div>
        <div className="hint" id="hint"><i />Scroll</div>
        <main id="story"><section className="beat" /><section className="beat" /><section className="beat" /><section className="beat" /></main>
        <div id="progress"><i id="pbar" /></div>
    </>
  );
}
