"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AstronomyRecord, DashboardData, SearchResponse } from "@/lib/types";
import { Icon } from "./Icon";
import { StarMapVisual } from "./Visuals";

export type Panel = "catalog" | "search" | "status" | "about" | "discovery" | "map" | "analysis" | "research";
const titles: Record<Panel, string> = {
  catalog: "Explore the archive", search: "Search the archive", status: "Service status", about: "A window into the universe.",
  discovery: "The next discovery starts here.", map: "The celestial atlas", analysis: "Meet StellarMind AI", research: "Research library",
};

function RecordDetails({ record }: { record: AstronomyRecord }) {
  return <dl className="record-grid">{Object.entries(record).map(([name, value]) => <div key={name}><dt>{name.replaceAll("_", " ")}</dt><dd>{value == null ? "Not available" : typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl>;
}

function SearchPanel() {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") || "").trim();
    if (q.length < 2 || q.length > 100) { setError("Enter between 2 and 100 characters."); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setError(""); setResult(null);
    try {
      const response = await fetch(`/api/search?${new URLSearchParams({ q })}`, { signal: controller.signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Search is unavailable.");
      setResult(body);
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Search is unavailable.");
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <>
    <p className="dialog-intro">Search exoplanets and other celestial objects across the connected archive.</p>
    <form className="search-form" onSubmit={search}><label htmlFor="archive-query">Object name or keyword</label><div><input autoFocus id="archive-query" name="q" type="search" minLength={2} maxLength={100} required placeholder="Try Kepler-186" /><button className="button button-primary" disabled={busy} type="submit">{busy ? "SEARCHING…" : "SEARCH"}<Icon name="search" /></button></div></form>
    <div aria-live="polite" aria-busy={busy}>{error && <p className="notice" role="alert">{error}</p>}{result && <><p className="results-caption">{result.count === 0 ? "No matching records found." : `${result.count} matching records returned (up to 20).`}</p>{result.results.map((item, index) => <details className="record" key={`${item.table}-${index}`}><summary>{item.table.replaceAll("_", " ")}<span>Record {index + 1}</span></summary><RecordDetails record={item.record} /></details>)}</>}</div>
  </>;
}

export function ArchiveDialog({ panel, data, close }: { panel: Panel; data: DashboardData; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = oldOverflow; opener?.focus(); };
  }, []);

  return <dialog ref={dialog} className="archive-dialog" aria-labelledby="dialog-title" onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="dialog-content">
      <div className="dialog-heading"><span className="eyebrow">STELLAR ARCHIVE / WORKSPACE</span><button className="icon-button" aria-label="Close dialog" onClick={close}><Icon name="close" /></button></div>
      <h2 id="dialog-title">{titles[panel]}</h2>
      {panel === "search" && <SearchPanel />}
      {panel === "catalog" && <>
        <p className="dialog-intro">A preview of your connected astronomical catalogs. Counts reflect this archive, not a global exoplanet census.</p>
        {data.tables ? <div className="table-tags">{data.tables.length ? data.tables.map((table) => <span key={`${table.schema}.${table.table}`}>{table.table.replaceAll("_", " ")}</span>) : <p>No catalogs are available.</p>}</div> : <p className="notice">Catalogs are unavailable while the archive is disconnected.</p>}
        {data.catalog && <><h3 className="preview-title">Exoplanet catalog · {data.catalog.total.toLocaleString("en-US")} records</h3><p className="results-caption">Source: {data.catalog.table} · first {data.catalog.data.length} records</p>{data.catalog.data.map((record, index) => <details className="record" key={index}><summary>Exoplanet record {index + 1}<Icon name="chevron" /></summary><RecordDetails record={record} /></details>)}</>}
      </>}
      {panel === "status" && <><p className="dialog-intro">Archive connection: <strong>{data.status}</strong>.</p><ul className="service-list"><li>Catalog index <span>{data.tables ? "Connected" : "Unavailable"}</span></li><li>Exoplanet records <span>{data.catalog ? "Connected" : "Unavailable"}</span></li><li>Discovery feed <span>Not connected</span></li><li>AI analysis <span>Not connected</span></li></ul><p className="dialog-note">Status is checked when this page loads. Reload after reconnecting the data service.</p></>}
      {panel === "about" && <><p className="dialog-intro">Stellar Archive brings astronomical catalogs into one research workspace. StellarMind AI is the planned analysis layer for exploring observations and investigating exoplanet candidates.</p><p className="dialog-note">The current dashboard displays records from your existing archive. Planetary imagery is artistic; the star map is an illustrative preview. No AI findings or habitability claims are generated by this page.</p></>}
      {panel === "discovery" && <><p className="dialog-intro">The discovery feed is not connected yet.</p><p className="dialog-note">The current catalog does not establish which discovery is the latest. Until a dated, verified source is available, this panel displays an artist’s impression without claiming a new detection.</p></>}
      {panel === "map" && <><div className="dialog-map"><StarMapVisual /></div><p className="dialog-intro">An illustrative view of a planetary system.</p><p className="dialog-note">The points, distances, and orbital paths are decorative. A scientific star map requires a connected coordinate catalog; no measured positions or system counts are represented here.</p></>}
      {panel === "analysis" && <><p className="dialog-intro">A workspace for future observation analysis.</p><p className="dialog-note">Data processing, candidate detection, and habitability assessment are not connected to an analysis service yet. No jobs are running and no scientific scores have been calculated.</p></>}
      {panel === "research" && <><p className="dialog-intro">Start with the source.</p><div className="research-links"><a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank" rel="noreferrer">NASA Exoplanet Archive<Icon name="external" /></a><a href="https://ui.adsabs.harvard.edu/" target="_blank" rel="noreferrer">NASA Astrophysics Data System<Icon name="external" /></a></div><p className="dialog-note">External research resources open in a new tab. A saved-paper library is not connected.</p></>}
    </div>
  </dialog>;
}
