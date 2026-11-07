"use client";

import { useState } from "react";
import Image from "next/image";
import type { DashboardData } from "@/lib/types";
import { Icon } from "./Icon";
import { PlanetScene, StarMapVisual, WirePlanet } from "./Visuals";
import { ArchiveDialog, type Panel } from "./Dialog";

const number = (value: number | undefined) => value === undefined ? "—" : value.toLocaleString("en-US");

function Navigation({ open, contrast, toggleContrast }: { open: (panel: Panel) => void; contrast: boolean; toggleContrast: () => void }) {
  return (
    <header className="topbar">
      <a href="#dashboard" className="brand" aria-label="Stellar Archive home"><Icon name="spark" /><span>STELLAR ARCHIVE</span></a>
      <nav className="nav-pill" aria-label="Main navigation">
        <a href="#dashboard" aria-current="page">Dashboard</a>
        <button onClick={() => open("catalog")}>Explore</button>
        <a href="#ai-analysis">AI Analysis</a>
        <a href="#star-map">Star Map</a>
        <a href="#research">Research</a>
        <button onClick={() => open("about")}>About</button>
      </nav>
      <div className="header-tools">
        <button className="icon-button" aria-label="Search the archive" onClick={() => open("search")}><Icon name="search" /></button>
        <button className="icon-button" aria-label="View service status" onClick={() => open("status")}><Icon name="bell" /></button>
        <button className="icon-button theme-button" aria-label="Toggle higher contrast" aria-pressed={contrast} onClick={toggleContrast}><Icon name="moon" /><Icon name="chevron" /></button>
      </div>
    </header>
  );
}

function StatisticsPanel({ data }: { data: DashboardData }) {
  return (
    <aside className="statistics" aria-label="Archive metrics">
      <div className="stat"><Icon name="planet" /><strong>{number(data.catalog?.total)}</strong><span>EXOPLANET<br />RECORDS</span></div>
      <div className="stat"><Icon name="spark" /><strong>{number(data.tables?.length)}</strong><span>AVAILABLE<br />CATALOGS</span></div>
      <div className="stat"><Icon name="database" /><strong className="connection-value">{data.status === "checking" ? "Checking" : data.status === "online" ? "Connected" : data.status === "partial" ? "Partial" : "Offline"}</strong><span>ARCHIVE<br />CONNECTION</span></div>
    </aside>
  );
}

function Hero({ data, open }: { data: DashboardData; open: (panel: Panel) => void }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <PlanetScene />
      <div className="mission-rail" aria-hidden="true"><span /><Icon name="target" /><span /><span className="rail-mark">01</span></div>
      <div className="hero-copy">
        <div className={`system-status status-${data.status}`} role="status"><span>SYSTEM STATUS</span><i /><span>{data.status}</span></div>
        <h1 id="hero-title">EXPLORE.<br />DISCOVER.<br /><span>ANALYZE.</span></h1>
        <p>An AI-powered platform for exoplanet discovery,<br className="desktop-break" /> celestial data analysis, and space research.</p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={() => open("catalog")}>EXPLORE DATA<Icon name="external" /></button>
          <button className="button button-outline" onClick={() => open("search")}>SEARCH EXOPLANETS<Icon name="target" /></button>
        </div>
      </div>
      <div className="featured-target"><span>FEATURED TARGET</span><strong>Kepler-186f</strong><small>Artist’s impression</small></div>
      <StatisticsPanel data={data} />
      <span className="scene-caption">PLANETARY VISUALIZATION · ARTIST’S IMPRESSION</span>
    </section>
  );
}

function DashboardCards({ data, open }: { data: DashboardData; open: (panel: Panel) => void }) {
  return (
    <section className="dashboard-cards" aria-label="Research dashboard">
      <article className="glass-card catalog-card" id="catalog">
        <div className="card-heading"><h2>EXOPLANET CATALOG</h2><span className="count-badge" aria-label="Exoplanet record count">{number(data.catalog?.total)}</span></div>
        <WirePlanet />
        <button className="catalog-search" onClick={() => open("search")}><span>SEARCH &amp; FILTER</span><Icon name="search" /></button>
        <div className="catalog-source"><i />{data.catalog ? "SOURCE: EXOPLANET_2023" : "AWAITING ARCHIVE CONNECTION"}</div>
      </article>
      <article className="glass-card discovery-card" id="discovery">
        <Image src="/images/discovery-landscape.webp" alt="Illustrated mountain valley beneath a blue planet" fill loading="eager" sizes="(max-width: 600px) 100vw, 30vw" className="card-image" />
        <h2>LATEST DISCOVERY</h2><span className="image-caption">ARTIST’S IMPRESSION</span>
        <div className="discovery-footer"><div><h3>Beyond the familiar.</h3><p>Awaiting a discovery feed</p></div><button className="square-button" aria-label="About the discovery feed" onClick={() => open("discovery")}><Icon name="arrow" /></button></div>
      </article>
      <article className="glass-card map-card" id="star-map">
        <h2>STAR MAP</h2><StarMapVisual />
        <div className="card-footer"><div><span className="map-label">The celestial atlas</span><small>ILLUSTRATIVE PREVIEW</small></div><button className="small-button" onClick={() => open("map")}>VIEW<Icon name="external" /></button></div>
      </article>
      <article className="glass-card analysis-card" id="ai-analysis">
        <div className="card-heading"><h2>AI ANALYSIS</h2><Icon name="target" /></div>
        <ol className="analysis-timeline">
          <li><div><h3>Data processing</h3><p>Connect an observation</p></div><span>WAITING</span></li>
          <li><div><h3>Candidate detection</h3><p>No analysis submitted</p></div></li>
          <li><div><h3>Habitability assessment</h3><p>Requires validated data</p></div></li>
        </ol>
        <button className="text-button" onClick={() => open("analysis")}>ABOUT STELLARMIND AI<Icon name="arrow" /></button>
      </article>
      <article className="glass-card research-card" id="research">
        <Image src="/images/research-nebula.webp" alt="Illustrated violet and blue nebula" fill sizes="(max-width: 600px) 100vw, 20vw" className="card-image" />
        <div><span className="eyebrow">EXPAND YOUR HORIZON</span><h2>RESEARCH <br />LIBRARY</h2><button className="small-button" onClick={() => open("research")} aria-label="Open research library"><Icon name="arrow" /></button></div>
      </article>
    </section>
  );
}

export function Dashboard({ data }: { data: DashboardData }) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [contrast, setContrast] = useState(false);
  return (
    <div className={`observatory ${contrast ? "high-contrast" : ""}`}>
      <a className="skip-link" href="#main">Skip to dashboard</a>
      <Navigation open={setPanel} contrast={contrast} toggleContrast={() => setContrast(!contrast)} />
      <main id="main"><div id="dashboard"><Hero data={data} open={setPanel} /><DashboardCards data={data} open={setPanel} /></div></main>
      <footer className="page-footer"><span>STELLAR ARCHIVE <span className="footer-dot">·</span> POWERED BY STELLARMIND AI</span><span>ILLUSTRATIVE VISUALS. SOURCE-VERIFIED DATA.</span></footer>
      {panel && <ArchiveDialog key={panel} panel={panel} data={data} close={() => setPanel(null)} />}
    </div>
  );
}
