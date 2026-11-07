import { ArchiveApiError, getColumns, getTables } from "@/lib/api";

export async function GET(_request: Request, context: { params: Promise<{ table: string }> }) {
  const { table } = await context.params;
  try {
    const tables = await getTables();
    if (!tables.some((item) => item.schema === "stellar_archive" && item.table === table)) {
      return Response.json({ error: "Catalog not found in the astronomical archive." }, { status: 404 });
    }
    return Response.json(await getColumns(table), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: "Column metadata is unavailable. Please retry." }, {
      status: error instanceof ArchiveApiError && error.status === 404 ? 404 : 503,
    });
  }
}
