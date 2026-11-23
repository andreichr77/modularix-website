import { CONFIGS } from '@/data/site';

export default function Configs() {
  return (
    <section className="band" id="configs" data-sheet="Sheet 10 - Configurations" data-prod="Module range">
      <div className="wrap">
        <div className="sh rv">
          <div>
            <p className="legend">10 - Configurations</p>
            <h2>
              Pick the module<br />your workload <span className="b">needs.</span>
            </h2>
          </div>
          <p className="lede">
            Six ways to order it, from the Legacy container shown above to the larger chilled-water modules. The factory
            and the people are the same. What changes is what we put inside.
          </p>
        </div>
        <p className="keyline rv">
          <b>Module range</b> - <b>up to 300 kW per module</b> - N+1 or 2N - air - direct-to-chip liquid - chilled water - DX -{' '}
          <b>13.2 m in transit, 3.2 m wide deployed</b>
        </p>
        <div className="strip" id="cfgstrip">
          {CONFIGS.map((c) => (
            <article key={c.id} className={`card${c.emsec ? ' emsec' : ''} rv`}>
              <div className="n"><b>{c.id}</b><em>{c.kind}</em></div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <div className="tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>
              <a className="go" href={`/solutions/${c.slug}`}>Technical data</a>
            </article>
          ))}
        </div>
        <div className="striphint"><span>Drag or scroll sideways</span><i /></div>
      </div>
    </section>
  );
}
