"use client";

import { useState, type FormEvent } from "react";
import { explorerUrl, type ExplorerQuery } from "@/lib/explorer";
import { Icon } from "@/components/dashboard/Icon";

export function SearchForm({ query, busy, navigate }: { query: ExplorerQuery; busy: boolean; navigate: (url: string) => void }) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") || "").trim();
    if (q.length < 2 || q.length > 100) { setError("Enter between 2 and 100 characters."); return; }
    setError("");
    navigate(explorerUrl({ catalog: query.catalog, size: query.size, q }));
  }
  return <div className="universal-search">
    <form onSubmit={submit} role="search" aria-label="Search all astronomical catalogs">
      <label htmlFor="explorer-search"><Icon name="search" /><span className="sr-only">Search all catalogs</span></label>
      <input id="explorer-search" name="q" defaultValue={query.q} type="search" placeholder="Search any object, mission, or keyword…" minLength={2} maxLength={100} required aria-describedby="search-scope" />
      <button type="submit" disabled={busy}>Search archive<Icon name="arrow" /></button>
    </form>
    <div id="search-scope" className="search-scope"><span>UNIVERSAL SEARCH</span><p>Search text fields across all connected catalogs.</p></div>
    {error && <p className="explorer-inline-error" role="alert">{error}</p>}
  </div>;
}
