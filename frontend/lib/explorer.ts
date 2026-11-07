import type { AstronomyRecord, ColumnInfo, ColumnsResponse, PaginatedCatalog, SearchResponse, TableInfo } from "./types";

export const ARCHIVE_SCHEMA = "stellar_archive";
export const PAGE_SIZES = [10, 25, 50, 100] as const;
export type ExplorerQuery = { catalog: string; page: number; size: number; q: string };
export type QueryParams = Record<string, string | string[] | undefined>;
export type ExplorerData = {
  query: ExplorerQuery;
  tables: TableInfo[];
  tablesError: string | null;
  catalog: PaginatedCatalog | null;
  columns: ColumnsResponse | null;
  results: SearchResponse | null;
  dataError: string | null;
  columnsError: string | null;
};

export function parseExplorerQuery(params: QueryParams): ExplorerQuery {
  const single = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const page = Number(single("page"));
  const size = Number(single("size"));
  return {
    catalog: single("catalog"),
    page: /^[1-9]\d*$/.test(single("page")) && Number.isSafeInteger(page * 100) ? page : 1,
    size: PAGE_SIZES.includes(size as typeof PAGE_SIZES[number]) ? size : 25,
    q: single("q").trim(),
  };
}

export function explorerUrl(query: Partial<ExplorerQuery> = {}) {
  const params = new URLSearchParams();
  if (query.catalog) params.set("catalog", query.catalog);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.size && query.size !== 25) params.set("size", String(query.size));
  if (query.q) params.set("q", query.q);
  return `/explore${params.size ? `?${params}` : ""}`;
}

// These are presentation labels for verified existing tables, never synthetic catalogs.
// Unknown future tables remain accessible under Other catalogs.
const definitions = [
  { name: "Exoplanets", tables: ["exoplanet_2023", "exoplanet_nearest", "directly_imaged_exoplanets", "habitable_exoplanets"] },
  { name: "Stars & constellations", tables: ["constellations", "dwarfs_nearest", "nearest_star", "stars_bright"] },
  { name: "Solar System", tables: ["brightest_astro", "fastest_rotators", "most_massive_astr", "slowest_rotators_astr", "composition_pa", "fact_sheet", "mean_temperature", "planet_atmos", "earth_moons", "jupiter_moons", "mars_moons", "neptune_moons", "pluto_moons", "saturn_moons", "uranus_moons"] },
  { name: "Galaxies", tables: ["gal_greater", "gal_lesser"] },
  { name: "Nebulae & star clusters", tables: ["largest_nebulae", "open_cluster", "planetary_nebula", "protoplanetary_nebula"] },
  { name: "Black holes", tables: ["blackholes", "blackholes_dir"] },
  { name: "Supernovae & gamma-ray bursts", tables: ["candidates_sn", "distant_sn", "remnants_sn", "yearly_extragalatic_sn", "supernovas", "grb_distant", "grb_extreme", "grb_list"] },
  { name: "Space exploration", tables: ["current_space_crew_list", "moonwalkers", "et_pre20thcen", "et_1900_to_1956", "et_1957_to_1959", "et_1960_to_1969", "et_1970_to_1979", "et_1980_to_1989", "et_1990_to_1999", "et_2000_to_2009", "et_2010_and_later"] },
];

export function groupCatalogs(tables: TableInfo[]) {
  const archive = tables.filter((table) => table.schema === ARCHIVE_SCHEMA);
  const assigned = new Set(definitions.flatMap((category) => category.tables));
  return [...definitions.map((category) => ({
    name: category.name,
    tables: archive.filter((table) => category.tables.includes(table.table)),
  })), { name: "Other catalogs", tables: archive.filter((table) => !assigned.has(table.table)) }]
    .filter((category) => category.tables.length > 0)
    .map((category) => ({ ...category, tables: category.tables.toSorted((a, b) => catalogLabel(a.table).localeCompare(catalogLabel(b.table))) }));
}

const labels: Record<string, string> = {
  exoplanet_2023: "Exoplanets · 2023", exoplanet_nearest: "Nearest exoplanets",
  directly_imaged_exoplanets: "Directly imaged exoplanets", habitable_exoplanets: "Habitable exoplanet catalog",
  blackholes: "Black holes", blackholes_dir: "Black hole directory", brightest_astro: "Brightest asteroids",
  composition_pa: "Atmospheric composition", fact_sheet: "Planetary fact sheet", planet_atmos: "Planetary atmospheres",
  gal_greater: "Galaxies · greater", gal_lesser: "Galaxies · lesser", dwarfs_nearest: "Nearest dwarf stars",
  fastest_rotators: "Fastest rotating minor planets", slowest_rotators_astr: "Slowest rotating minor planets",
  most_massive_astr: "Most massive asteroids", nearest_star: "Nearest stars", stars_bright: "Bright stars",
  open_cluster: "Open star clusters", candidates_sn: "Supernova candidates", distant_sn: "Distant supernovae",
  remnants_sn: "Supernova remnants", yearly_extragalatic_sn: "Extragalactic supernovae by year",
  grb_distant: "Distant gamma-ray bursts", grb_extreme: "Extreme gamma-ray bursts", grb_list: "Gamma-ray burst catalog",
  et_pre20thcen: "Exploration · before 1900",
};
export function catalogLabel(name: string) {
  if (labels[name]) return labels[name];
  if (name.startsWith("et_")) return `Exploration · ${name.slice(3).replaceAll("_", " ")}`;
  const text = name.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function fieldValue(value: unknown): string {
  if (value === null || value === undefined) return "Not recorded";
  if (value === "") return "Empty value";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export function recordTitle(record: AstronomyRecord, columns: ColumnInfo[] = []): string {
  const primary = columns.filter((column) => column.primary_key).map((column) => column.name);
  const key = [...primary, "name", "object", "planet", "star", "galaxy_name", "cluster_identifier", ...Object.keys(record)]
    .find((name) => record[name] !== null && record[name] !== undefined && record[name] !== "");
  return key ? fieldValue(record[key]) : "Record details";
}

export function recordFields(records: AstronomyRecord[], columns: ColumnInfo[] = []) {
  return [...new Set([...columns.map((column) => column.name), ...records.flatMap(Object.keys)])];
}
