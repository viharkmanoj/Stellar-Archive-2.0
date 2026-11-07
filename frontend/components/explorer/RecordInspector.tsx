"use client";

import { useEffect, useRef, useState } from "react";
import type { AstronomyRecord, ColumnsResponse } from "@/lib/types";
import { catalogLabel, fieldValue, recordTitle } from "@/lib/explorer";
import { Icon } from "@/components/dashboard/Icon";
import { ColumnMetadata } from "./ColumnMetadata";

export function RecordInspector({ table, record, initialColumns, close }: {
  table: string; record: AstronomyRecord; initialColumns: ColumnsResponse | null; close: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [metadata, setMetadata] = useState(initialColumns);
  const [loading, setLoading] = useState(!initialColumns);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; opener?.focus(); };
  }, []);
  useEffect(() => {
    if (initialColumns) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/columns/${encodeURIComponent(table)}`, { signal: controller.signal, cache: "no-store" });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Column metadata is unavailable.");
        setMetadata(body);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Column metadata is unavailable.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [table, initialColumns, attempt]);

  return <dialog ref={dialog} className="record-inspector" aria-labelledby="record-title" onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <div className="inspector-heading"><div><span className="explorer-kicker">RECORD INSPECTOR</span><p>{catalogLabel(table)}</p></div><button className="icon-button" onClick={close} aria-label="Close record details"><Icon name="close" /></button></div>
    <div className="inspector-body"><h2 id="record-title">{recordTitle(record, metadata?.columns)}</h2><code className="record-source">stellar_archive.{table}</code>
      <p className="inspector-note">All values are shown as stored. Units and placeholder meanings are not inferred.</p>
      <dl className="inspector-fields">{Object.entries(record).map(([name, value]) => {
        const column = metadata?.columns.find((column) => column.name === name);
        return <div key={name}><dt><span>{name}</span>{column && <small>{column.type}{column.primary_key ? " · PRIMARY KEY" : ""}</small>}</dt><dd className={value == null || value === "" ? "missing-value" : ""}>{fieldValue(value)}</dd></div>;
      })}</dl>
      <details className="inspector-metadata"><summary>Column metadata {metadata ? `(${metadata.columns.length})` : ""}</summary>
        {loading ? <p role="status">Loading source column definitions…</p> : error ? <div className="explorer-inline-error"><p role="alert">{error}</p><button className="explorer-button" onClick={() => { setError(""); setLoading(true); setAttempt(attempt + 1); }}>Retry metadata</button></div> : metadata ? <ColumnMetadata columns={metadata.columns} /> : null}
      </details>
    </div>
  </dialog>;
}
