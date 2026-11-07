"use client";

import { useState } from "react";
import Link from "next/link";
import { catalogLabel, explorerUrl, groupCatalogs } from "@/lib/explorer";
import type { TableInfo } from "@/lib/types";
import { Icon } from "@/components/dashboard/Icon";

export function CatalogSidebar({ tables, selected, error, busy, navigate, retry }: {
  tables: TableInfo[]; selected: string; error: string | null; busy: boolean;
  navigate: (href: string) => void; retry: () => void;
}) {
  const [filter, setFilter] = useState("");
  const groups = groupCatalogs(tables);
  const matching = groups.map((group) => ({ ...group, tables: group.tables.filter((table) =>
    `${catalogLabel(table.table)} ${table.table} ${group.name}`.toLowerCase().includes(filter.toLowerCase().trim())) })).filter((group) => group.tables.length);
  return <aside className="catalog-sidebar explorer-panel" aria-label="Catalog browser">
    <div className="catalog-sidebar-heading"><h2>Catalogs</h2><span>{error ? "—" : tables.length}</span></div>
    <label className="catalog-filter"><Icon name="search" /><span className="sr-only">Filter catalog names</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Find a catalog…" type="search" /></label>
    <div className="catalog-groups">
      {error ? <div className="sidebar-message"><p role="alert">{error}</p><button className="explorer-button" disabled={busy} onClick={retry}>Retry catalog list</button></div> : !tables.length ? <p className="sidebar-message">No catalogs are available in this schema.</p> : !matching.length ? <p className="sidebar-message">No catalogs match “{filter}”.</p> : matching.map((group) =>
        <details key={group.name} open={!!filter || group.tables.some((table) => table.table === selected) || (!selected && group.name === groups[0]?.name)} className="catalog-group">
          <summary><span>{group.name}</span><span>{group.tables.length}<Icon name="chevron" /></span></summary>
          <ul>{group.tables.map((table) => <li key={`${table.schema}.${table.table}`}><Link href={explorerUrl({ catalog: table.table })} prefetch={false} aria-current={selected === table.table ? "page" : undefined} title={table.table} onNavigate={(event) => { event.preventDefault(); if (!busy) navigate(explorerUrl({ catalog: table.table })); }} aria-disabled={busy}>
            <span className="catalog-link-dot" /><span>{catalogLabel(table.table)}</span>{selected === table.table && <Icon name="arrow" />}
          </Link></li>)}</ul>
        </details>)}
    </div>
    <div className="catalog-sidebar-footer"><Icon name="database" /><span>Source schema<strong>stellar_archive</strong></span></div>
  </aside>;
}
