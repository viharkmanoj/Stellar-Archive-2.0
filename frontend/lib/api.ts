import type { CatalogResponse, ColumnsResponse, PaginatedCatalog, DashboardData, SearchResponse, TableInfo } from "./types";

export class ArchiveApiError extends Error {
  readonly status: number;
  constructor(status: number) {
    super(status === 404 ? "This catalog is no longer available." : "The archive service is unavailable. Please try again.");
    this.status = status;
  }
}

// Server-only configuration: the browser never needs the backend's address.
const API_URL = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function request(path: string): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new ArchiveApiError(response.status);
  return response.json();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function getTables(): Promise<TableInfo[]> {
  const response = await request("/tables");
  if (!isObject(response) || !Array.isArray(response.tables) ||
    !response.tables.every((item) => isObject(item) && typeof item.schema === "string" && typeof item.table === "string")) {
    throw new Error("Invalid table response");
  }
  return response.tables as TableInfo[];
}

export async function getCatalog(): Promise<CatalogResponse> {
  const response = await request("/api/catalog/exoplanet_2023?page=1&size=5");
  if (!isObject(response) || typeof response.table !== "string" ||
    !Number.isSafeInteger(response.total) || (response.total as number) < 0 ||
    !Array.isArray(response.data) || !response.data.every(isObject)) {
    throw new Error("Invalid catalog response");
  }
  return response as CatalogResponse;
}

export async function getCatalogPage(table: string, page: number, size: number): Promise<PaginatedCatalog> {
  if (!table || !Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(size) || size < 1 || size > 100) {
    throw new Error("Invalid catalog request");
  }
  const response = await request(`/api/catalog/${encodeURIComponent(table)}?${new URLSearchParams({ page: String(page), size: String(size) })}`);
  if (!isObject(response) || response.table !== table || response.schema !== "stellar_archive" ||
    response.page !== page || response.size !== size ||
    !Number.isSafeInteger(response.total) || (response.total as number) < 0 ||
    !Number.isSafeInteger(response.total_pages) || response.total_pages !== Math.ceil((response.total as number) / size) ||
    !Array.isArray(response.data) || response.data.length > size || !response.data.every(isObject)) {
    throw new Error("Invalid paginated catalog response");
  }
  return response as PaginatedCatalog;
}

export async function getColumns(table: string): Promise<ColumnsResponse> {
  const response = await request(`/api/columns/${encodeURIComponent(table)}`);
  if (!isObject(response) || response.table !== table || !Array.isArray(response.columns) ||
    !response.columns.every((column) => isObject(column) && typeof column.name === "string" &&
      typeof column.type === "string" && typeof column.nullable === "boolean" && typeof column.primary_key === "boolean")) {
    throw new Error("Invalid column metadata response");
  }
  return response as ColumnsResponse;
}

export async function getDashboardData(): Promise<DashboardData> {
  // A single unavailable endpoint must not hide other verified data.
  const [tables, catalog] = await Promise.allSettled([getTables(), getCatalog()]);
  const available = Number(tables.status === "fulfilled") + Number(catalog.status === "fulfilled");
  return {
    tables: tables.status === "fulfilled" ? tables.value : null,
    catalog: catalog.status === "fulfilled" ? catalog.value : null,
    status: available === 2 ? "online" : available === 1 ? "partial" : "offline",
  };
}

export async function searchArchive(query: string): Promise<SearchResponse> {
  const response = await request(`/api/search?${new URLSearchParams({ q: query, limit: "20" })}`);
  if (!isObject(response) || typeof response.query !== "string" ||
    !Number.isSafeInteger(response.count) || (response.count as number) < 0 ||
    !Array.isArray(response.results) || !response.results.every((item) =>
      isObject(item) && typeof item.table === "string" && isObject(item.record))) {
    throw new Error("Invalid search response");
  }
  return response as SearchResponse;
}
