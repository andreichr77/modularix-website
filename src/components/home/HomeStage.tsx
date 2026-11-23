export default function HomeStage() {
  return (
    <>
      <div id="stage" />
        <div id="grid" />
        <div id="nowebgl">THIS PREVIEW NEEDS WEBGL.<br />OPEN IT IN SAFARI OR CHROME.</div>
        <div id="labels">
          <svg aria-hidden="true">
            <line id="ln-shell" /><circle id="dt-shell" r={3} />
            <line id="ln-cool" /><circle id="dt-cool" r={3} />
            <line id="ln-power" /><circle id="dt-power" r={3} />
            <line id="ln-racks" /><circle id="dt-racks" r={3} />
            <line id="ln-door" /><circle id="dt-door" r={3} />
            <line id="ln-mon" /><circle id="dt-mon" r={3} />
          </svg>
          <div className="chip" id="ch-shell"><b>02</b>Shell</div>
          <div className="chip" id="ch-cool"><b>03</b>Cooling</div>
          <div className="chip" id="ch-power"><b>04</b>Power</div>
          <div className="chip" id="ch-racks"><b>05</b>IT room</div>
          <div className="chip" id="ch-door"><b>06</b>Access</div>
          <div className="chip" id="ch-mon"><b>07</b>Protection</div>
        </div>
    </>
  );
}
