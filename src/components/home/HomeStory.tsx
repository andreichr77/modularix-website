export default function HomeStory() {
  return (
    <>
      <nav id="rail" aria-label="Sections">
          <span className="on">00 Cover</span><span>01 Container</span><span>02 Shell</span><span>03 Cooling</span>
          <span>04 Power</span><span>05 IT room</span><span>06 Access</span><span>07 Protection</span><span>08 Delivered</span>
        </nav>
        <div id="copy">
          <div className="copy hero on" data-sheet="Sheet 00 - Cover"><p className="eyebrow">Modularix - Legacy container - A Synotech company</p><h1>Prefabricated modular <span className="b">data centers.</span></h1><p>Built in our factory. Delivered to your pad. Scroll to open the module.</p></div>
          <div className="copy" data-sheet="Sheet 01 - Container"><p className="eyebrow">01 - One container</p><h2>One container.<br /><span className="b">Everything inside.</span></h2><p>8.50 by 3.20 by 3.20 metres, transport-ready. Condensers on the end wall, one door on the long side, the technical zone behind it.</p></div>
          <div className="copy" data-sheet="Sheet 02 - Shell"><p className="eyebrow">02 - Shell</p><h2>Insulated panels<br />on the <span className="b">frame.</span></h2><p>Roof and front wall lift away. What stays is the plant that makes it a data center.</p></div>
          <div className="copy" data-sheet="Sheet 03 - Cooling"><p className="eyebrow">03 - Cooling</p><h2>In-row cooling.<br /><span className="b">N+1.</span></h2><p>Three in-row units sit between the racks and cool them where the heat is made. Their condensers stack on the end wall outside.</p></div>
          <div className="copy" data-sheet="Sheet 04 - Power"><p className="eyebrow">04 - Power</p><h2>Two UPS.<br /><span className="b">A and B.</span></h2><p>Power lands once, at the main panel. Two UPS feed two paths to every rack, and the panel switches sources on its own.</p></div>
          <div className="copy" data-sheet="Sheet 05 - IT room"><p className="eyebrow">05 - IT room</p><h2>Eight racks under a<br /><span className="b">contained aisle.</span></h2><p>Hot aisle sealed behind the row, cold aisle and front access in front. Your servers are the only thing not installed.</p></div>
          <div className="copy" data-sheet="Sheet 06 - Access"><p className="eyebrow">06 - Access</p><h2>One door.<br /><span className="b">It locks.</span></h2><p>Access control at the door, cameras outside and in, intrusion detection throughout. Part of the module, not an add-on.</p></div>
          <div className="copy" data-sheet="Sheet 07 - Protection"><p className="eyebrow">07 - Protection</p><h2>Protected<br />and <span className="b">watched.</span></h2><p>Clean-agent fire suppression with nozzles in both compartments, and remote monitoring of power, cooling, doors and temperature.</p></div>
          <div className="copy close" data-sheet="Sheet 08 - Delivered"><p className="eyebrow">08 - Delivered</p><h2>Everything inside,<br />except <span className="b">your servers.</span></h2><p>Power, water, data. The module arrives built.</p><div className="cta"><a className="primary" href="#configs">See the configurations</a><a href="#contact">Talk to us</a></div><p className="foot">Prototype - 3D model from the Legacy configurator - 8.50 m - 8 racks - 2N</p></div>
        </div>
        <div className="hint" id="hint"><i />Scroll</div>
        <main id="story">
          <section className="beat" id="top" /><section className="beat" /><section className="beat" /><section className="beat" /><section className="beat" /><section className="beat" /><section className="beat" /><section className="beat" /><section className="beat" />
        </main>
    </>
  );
}
