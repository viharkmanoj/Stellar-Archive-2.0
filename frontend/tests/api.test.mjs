import test from "node:test";
import assert from "node:assert/strict";
import { getDashboardData, searchArchive } from "../lib/api.ts";

const tables = { tables: [{ schema: "fixture", table: "exoplanet_2023" }] };
const catalog = { table: "exoplanet_2023", total: 0, data: [] };

test("uses source counts and preserves a real zero", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => Response.json(url.endsWith("/tables") ? tables : catalog));
  const data = await getDashboardData();
  assert.equal(data.status, "online");
  assert.equal(data.catalog.total, 0);
  assert.equal(data.tables.length, 1);
});

test("keeps the available catalog when the table index fails", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => url.endsWith("/tables") ? new Response(null, { status: 503 }) : Response.json(catalog));
  const data = await getDashboardData();
  assert.equal(data.status, "partial");
  assert.equal(data.tables, null);
  assert.equal(data.catalog.total, 0);
});

test("offline services produce unavailable counts, never invented zeroes", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Network unavailable"); });
  assert.deepEqual(await getDashboardData(), { tables: null, catalog: null, status: "offline" });
});

test("rejects malformed successful responses", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => Response.json(url.endsWith("/tables") ? { tables: [null] } : { ...catalog, total: -1 }));
  assert.equal((await getDashboardData()).status, "offline");
});

test("encodes search text and requests uncached data with a timeout", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("q"), "Kepler & 186f");
    assert.equal(parsed.searchParams.get("limit"), "20");
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ query: "Kepler & 186f", count: 0, results: [] });
  });
  assert.equal((await searchArchive("Kepler & 186f")).count, 0);
});

test("does not pass malformed search records to the UI", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ query: "test", count: 1, results: [{ table: "fixture", record: null }] }));
  await assert.rejects(searchArchive("test"), /Invalid search response/);
});
