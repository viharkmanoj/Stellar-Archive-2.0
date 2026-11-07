import { ArchiveApiError, getCatalogPage, getColumns, getTables, searchArchive } from "./api";
import { ARCHIVE_SCHEMA, parseExplorerQuery, type ExplorerData, type QueryParams } from "./explorer";

function failure(error: unknown, fallback: string) {
  return error instanceof ArchiveApiError ? error.message : fallback;
}

export async function getExplorerData(params: QueryParams): Promise<ExplorerData> {
  const query = parseExplorerQuery(params);
  const state: ExplorerData = { query, tables: [], tablesError: null, catalog: null, columns: null, results: null, dataError: null, columnsError: null };
  try {
    state.tables = (await getTables()).filter((table) => table.schema === ARCHIVE_SCHEMA);
  } catch {
    state.tablesError = "The catalog list could not be loaded. Check the archive connection and retry.";
  }

  if (query.q) {
    if (query.q.length < 2 || query.q.length > 100) {
      state.dataError = "Enter between 2 and 100 characters to search the archive.";
      return state;
    }
    // Search can still work if the independent table index is temporarily down.
    try { state.results = await searchArchive(query.q); }
    catch (error) { state.dataError = failure(error, "Search could not be completed. Please retry."); }
    return state;
  }

  if (state.tablesError || !state.tables.length) return state;
  if (!query.catalog) {
    query.catalog = state.tables.find((table) => table.table === "exoplanet_2023")?.table ?? state.tables[0].table;
  }
  if (!state.tables.some((table) => table.table === query.catalog)) {
    state.dataError = "This catalog is not available in stellar_archive. Choose a catalog from the list.";
    return state;
  }
  const [catalog, columns] = await Promise.allSettled([
    getCatalogPage(query.catalog, query.page, query.size), getColumns(query.catalog),
  ]);
  if (catalog.status === "fulfilled") state.catalog = catalog.value;
  else state.dataError = failure(catalog.reason, "Records could not be loaded. Please retry.");
  if (columns.status === "fulfilled") state.columns = columns.value;
  else state.columnsError = "Column metadata could not be loaded. Record values are still available.";
  return state;
}
