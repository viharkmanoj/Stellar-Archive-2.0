"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/dashboard/Icon";
import { catalogLabel, explorerUrl, fieldValue, groupCatalogs, PAGE_SIZES, recordTitle, type ExplorerData } from "@/lib/explorer";
import type { AstronomyRecord } from "@/lib/types";
import { ExplorerHeader } from "./ExplorerHeader";
import { CatalogSidebar } from "./CatalogSidebar";
import { SearchForm } from "./SearchForm";
import { RecordsTable } from "./RecordsTable";
import { ColumnMetadata } from "./ColumnMetadata";
import { RecordInspector } from "./RecordInspector";

function EmptyState({ title, message, children, error = false }: { title: string; message: string; children?: React.ReactNode; error?: boolean }) {
  return <div className="explorer-empty" role={error ? "alert" : "status"}><Icon name={error ? "database" : "search"} /><h3>{title}</h3><p>{message}</p>{children}</div>;
}

function Workspace({ data, pending, navigate, retry }: { data: ExplorerData; pending: boolean; navigate: (url: string) => void; retry: () => void }) {
  const { query, catalog, columns, results } = data;
  const [selection, setSelection] = useState<{ table: string; record: AstronomyRecord } | null>(null);
  const [view, setView] = useState<"records" | "columns">("records");
  const searching = !!query.q;
  const category = groupCatalogs(data.tables).find((group) => group.tables.some((table) => table.table === query.catalog));
  const outOfRange = catalog && catalog.total > 0 && query.page > catalog.total_pages;
  const retryButton = <button className="explorer-button" onClick={retry} disabled={pending}>Retry connection<Icon name="arrow" /></button>;

  return <section className="explorer-panel records-panel" aria-labelledby="catalog-title" aria-busy={pending}>
    <div className="workspace-heading"><div><p className="explorer-kicker">{searching ? "ACROSS THE ARCHIVE" : category?.name ?? "SOURCE RECORDS"}</p><h2 id="catalog-title">{searching ? "Search results" : query.catalog ? catalogLabel(query.catalog) : "Choose a catalog"}</h2>
      <p className="catalog-provenance">{searching ? <>Matching <strong>“{query.q}”</strong></> : query.catalog ? <code>stellar_archive.{query.catalog}</code> : "Select an available source to begin exploring."}</p></div>
      <button className="explorer-button refresh-button" disabled={pending} onClick={retry}>Refresh<Icon name="database" /></button>
    </div>
    {pending && <p className="explorer-pending" role="status">Loading source records…</p>}
    <div className="workspace-toolbar">
      {!searching ? <div className="explorer-view-switch" role="group" aria-label="Catalog view"><button aria-pressed={view === "records"} onClick={() => setView("records")}>Records{catalog && <span>{catalog.total.toLocaleString("en-US")}</span>}</button><button aria-pressed={view === "columns"} onClick={() => setView("columns")}>Columns{columns && <span>{columns.columns.length}</span>}</button></div> : <><span className="search-count">{results ? `${results.count} matches returned` : "Search all catalogs"}</span><button className="explorer-button" disabled={pending} onClick={() => navigate(explorerUrl({ catalog: query.catalog, size: query.size }))}>Clear search<Icon name="close" /></button></>}
      {!searching && <label className="page-size-label">Rows per page<select aria-label="Rows per page" value={query.size} disabled={pending} onChange={(event) => navigate(explorerUrl({ catalog: query.catalog, size: Number(event.target.value) }))}>{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>}
    </div>
    <div className={pending ? "workspace-content is-pending" : "workspace-content"}>
      {data.tablesError && !searching ? <EmptyState error title="Archive connection unavailable" message={data.tablesError}>{retryButton}</EmptyState>
        : data.dataError && (searching || view === "records") ? <EmptyState error title={searching ? "Search unavailable" : "Records unavailable"} message={data.dataError}>{retryButton}</EmptyState>
        : !data.tables.length && !searching ? <EmptyState title="No catalogs available" message="The service returned no tables in stellar_archive.">{retryButton}</EmptyState>
        : searching ? <>
          <p className="search-limit-note">Search returns up to 20 matches across all catalogs. Refine your query for more specific results.</p>
          {results?.results.length ? <div className="search-result-list">{results.results.map((result, index) => <article className="search-result" key={`${result.table}-${index}`}><div><Link prefetch={false} href={explorerUrl({ catalog: result.table })} onNavigate={(event) => { event.preventDefault(); if (!pending) navigate(explorerUrl({ catalog: result.table })); }} className="result-catalog">{catalogLabel(result.table)}<Icon name="external" /></Link><h3>{recordTitle(result.record)}</h3><dl>{Object.entries(result.record).slice(0, 3).map(([field, value]) => <div key={field}><dt>{field.replaceAll("_", " ")}</dt><dd>{fieldValue(value)}</dd></div>)}</dl></div><button className="explorer-button" disabled={pending} onClick={() => setSelection(result)}>Inspect record<Icon name="arrow" /></button></article>)}</div>
            : <EmptyState title="No matching records" message="Try a shorter object name, a different spelling, or another keyword." />}
        </> : view === "columns" ? data.columnsError ? <EmptyState error title="Metadata unavailable" message={data.columnsError}>{retryButton}</EmptyState> : columns ? <><p className="metadata-intro">Column definitions provided by the source catalog. Field names and data types are preserved.</p><ColumnMetadata columns={columns.columns} /></> : <EmptyState title="No metadata available" message="Select an available catalog to inspect its columns." />
          : outOfRange ? <EmptyState title="Page outside this catalog" message={`This catalog currently has ${catalog.total_pages} pages.`}><button className="explorer-button" onClick={() => navigate(explorerUrl({ catalog: query.catalog, size: query.size }))}>Go to first page</button></EmptyState>
          : catalog?.data.length ? <>{data.columnsError && <p className="metadata-warning" role="status">{data.columnsError} <button onClick={retry} disabled={pending}>Retry</button></p>}<RecordsTable records={catalog.data} columns={columns?.columns ?? []} offset={(catalog.page - 1) * catalog.size} busy={pending} inspect={(record) => setSelection({ table: query.catalog, record })} /></>
            : <EmptyState title="No records in this catalog" message="The catalog exists, but no rows were returned for this page.">{retryButton}</EmptyState>}
    </div>
    {!searching && catalog && !outOfRange && view === "records" && <div className="pagination"><p>{catalog.total === 0 ? "0 records" : `Showing ${(catalog.page - 1) * catalog.size + 1}–${(catalog.page - 1) * catalog.size + catalog.data.length} of ${catalog.total.toLocaleString("en-US")} records`}</p><nav aria-label="Catalog pagination"><button className="explorer-button" disabled={pending || catalog.page <= 1} onClick={() => navigate(explorerUrl({ ...query, page: catalog.page - 1 }))}><Icon name="arrow" className="previous-arrow" />Previous</button><span>Page {catalog.total_pages ? catalog.page : 0} of {catalog.total_pages}</span><button className="explorer-button" disabled={pending || catalog.page >= catalog.total_pages} onClick={() => navigate(explorerUrl({ ...query, page: catalog.page + 1 }))}>Next<Icon name="arrow" /></button></nav></div>}
    <div className="workspace-footnote"><Icon name="database" /><span>Source records · Values displayed as stored · No inferred measurements</span></div>
    {selection && !pending && <RecordInspector table={selection.table} record={selection.record} initialColumns={selection.table === columns?.table ? columns : null} close={() => setSelection(null)} />}
  </section>;
}

export function Explorer({ data }: { data: ExplorerData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const navigate = (url: string) => startTransition(() => router.push(url, { scroll: false }));
  const retry = () => startTransition(() => router.refresh());
  const context = `${data.query.catalog}:${data.query.page}:${data.query.size}:${data.query.q}`;
  return <div className="explorer-shell">
    <a className="skip-link" href="#explorer-main">Skip to catalog records</a>
    <ExplorerHeader />
    <main id="explorer-main">
      <section className="explorer-intro"><div><p className="explorer-kicker">EXPLORE / CELESTIAL ARCHIVE</p><h1>Celestial Archive<span>.</span></h1><p>A universe of observations. Explore the records behind the discoveries.</p></div><div className="archive-summary"><Icon name="planet" /><span><strong>{data.tablesError ? "—" : data.tables.length}</strong>source catalogs</span></div></section>
      <SearchForm key={data.query.q} query={data.query} busy={pending} navigate={navigate} />
      <div className="explorer-grid"><CatalogSidebar tables={data.tables} selected={data.query.q ? "" : data.query.catalog} error={data.tablesError} busy={pending} navigate={navigate} retry={retry} /><Workspace key={context} data={data} pending={pending} navigate={navigate} retry={retry} /></div>
    </main>
    <footer className="explorer-footer"><Link href="/">STELLAR ARCHIVE</Link><span>Explore with curiosity. Read from the source.</span></footer>
  </div>;
}
