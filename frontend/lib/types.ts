export type TableInfo = { schema: string; table: string };
export type AstronomyRecord = Record<string, unknown>;
export type CatalogResponse = { table: string; total: number; data: AstronomyRecord[] };
export type SearchResult = { table: string; record: AstronomyRecord };
export type SearchResponse = { query: string; count: number; results: SearchResult[] };
export type DashboardData = {
  tables: TableInfo[] | null;
  catalog: CatalogResponse | null;
  status: "checking" | "online" | "partial" | "offline";
};
