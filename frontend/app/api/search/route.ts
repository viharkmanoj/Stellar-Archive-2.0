import { searchArchive } from "@/lib/api";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) {
    return Response.json({ error: "Enter between 2 and 100 characters." }, { status: 400 });
  }
  try {
    return Response.json(await searchArchive(query), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The archive is unavailable. Please try again when the data service is connected." }, { status: 503 });
  }
}
