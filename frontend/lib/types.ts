export type TableInfo = { schema: string; table: string };
export type AstronomyRecord = Record<string, unknown>;
export type CatalogResponse = { table: string; total: number; data: AstronomyRecord[] };
export type PaginatedCatalog = CatalogResponse & {
  schema: string;
  page: number;
  size: number;
  total_pages: number;
};
export type ColumnInfo = { name: string; type: string; nullable: boolean; primary_key: boolean };
export type ColumnsResponse = { table: string; columns: ColumnInfo[] };
export type SearchResult = { table: string; record: AstronomyRecord };
export type SearchResponse = { query: string; count: number; results: SearchResult[] };
export type DashboardData = {
  tables: TableInfo[] | null;
  catalog: CatalogResponse | null;
  status: "checking" | "online" | "partial" | "offline";
};
