import type { CatalogResponse, DashboardData, SearchResponse, TableInfo } from "./types";

// Server-only configuration: the browser never needs the backend's address.
const API_URL = (process.env.API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function request(path: string): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error("Astronomy service unavailable");
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
