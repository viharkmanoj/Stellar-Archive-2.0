import Image from "next/image";

export function PlanetScene() {
  return (
    <div className="planet-scene" aria-hidden="true">
      <Image src="/images/planetary-scene.webp" alt="" fill priority sizes="(max-width: 700px) 100vw, 90vw" className="scene-image" />
      <svg className="orbital-paths" viewBox="0 0 800 600" fill="none">
        <ellipse cx="438" cy="303" rx="355" ry="133" transform="rotate(-31 438 303)" stroke="#b5cbd9" strokeOpacity=".55" strokeWidth=".65" />
        <ellipse cx="450" cy="300" rx="373" ry="171" transform="rotate(-39 450 300)" stroke="#6d9cba" strokeOpacity=".24" strokeWidth=".65" />
        <circle cx="165" cy="484" r="2.1" fill="#e5f0f6" /><circle cx="713" cy="122" r="1.6" fill="#e5f0f6" />
      </svg>
    </div>
  );
}

export function WirePlanet() {
  return (
    <svg viewBox="0 0 300 205" className="wire-planet" aria-hidden="true" fill="none">
      <defs>
        <radialGradient id="planet-fill" cx="30%" cy="20%"><stop stopColor="#63818e" stopOpacity=".38" /><stop offset="1" stopColor="#0a1722" stopOpacity=".2" /></radialGradient>
        <linearGradient id="wire-light" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#dae9ee" /><stop offset="1" stopColor="#577180" /></linearGradient>
      </defs>
      <circle cx="150" cy="103" r="99" stroke="#476070" strokeOpacity=".2" />
      <g transform="rotate(-23 150 103)" stroke="url(#wire-light)" strokeWidth=".65">
        {[106, 113, 120, 128].map((rx) => <ellipse key={rx} cx="150" cy="103" rx={rx} ry={rx / 4.8} />)}
        <circle cx="150" cy="103" r="63" fill="url(#planet-fill)" strokeWidth="1.2" />
        {[14, 31, 47, 58].map((rx) => <ellipse key={rx} cx="150" cy="103" rx={rx} ry="63" />)}
        {[22, 40, 54].map((ry) => <ellipse key={ry} cx="150" cy="103" rx="63" ry={ry} />)}
        <path d="M87 103h126M150 40v126" />
      </g>
    </svg>
  );
}

export function StarMapVisual() {
  return (
    <svg viewBox="0 0 260 215" className="star-map-visual" aria-hidden="true" fill="none">
      <defs><radialGradient id="star-glow"><stop stopColor="#d5f3ce" stopOpacity=".45" /><stop offset="1" stopColor="#b9d6bb" stopOpacity="0" /></radialGradient></defs>
      {[31, 53, 76, 99].map((r) => <circle key={r} cx="130" cy="108" r={r} stroke="#9bb6af" strokeOpacity={r === 99 ? ".18" : ".45"} strokeWidth=".7" />)}
      <path d="M21 108h218M130 0v215" stroke="#b9d6bb" strokeOpacity=".06" />
      {[[130,108,7],[58,79,3.5],[81,134,3],[162,64,3],[207,95,3.3],[183,171,3.3]].map(([cx,cy,r],i) => <g key={i}><circle cx={cx} cy={cy} r={r*4} fill="url(#star-glow)" /><circle cx={cx} cy={cy} r={r} fill="#e1f3d9" /></g>)}
      {[[130,9],[130,55],[31,108],[229,108],[130,184],[207,46]].map(([cx,cy],i) => <circle key={i} cx={cx} cy={cy} r=".8" fill="#bdcdc0" />)}
    </svg>
  );
}
