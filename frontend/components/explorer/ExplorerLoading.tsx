import { ExplorerHeader } from "./ExplorerHeader";

export function ExplorerLoading() {
  return <div className="explorer-shell"><ExplorerHeader /><main className="explorer-loading" aria-busy="true"><p className="eyebrow">CONNECTING TO THE ARCHIVE</p><h1>Celestial Archive</h1><p role="status">Loading catalogs and source records…</p><div className="explorer-loading-grid" aria-hidden="true"><div /><div /></div></main></div>;
}
