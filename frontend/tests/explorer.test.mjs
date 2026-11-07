import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatalogPage, getColumns, ArchiveApiError } from '../lib/api.ts';
import { parseExplorerQuery, explorerUrl, groupCatalogs, fieldValue, recordFields } from '../lib/explorer.ts';

const page = { table: 'fixture', schema: 'stellar_archive', page: 2, size: 10, total: 12, total_pages: 2, data: [{ name: 'Fixture only', value: null }] };

test('pagination forwards table, page and size and preserves all source values', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).pathname, '/api/catalog/fixture');
    assert.equal(new URL(url).search, '?page=2&size=10');
    assert.equal(options.cache, 'no-store');
    return Response.json(page);
  });
  assert.deepEqual(await getCatalogPage('fixture', 2, 10), page);
});

test('encodes catalog names as one path segment', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(new URL(url).pathname, '/api/catalog/a%2Fb%3Fq%3Dc');
    return Response.json({ ...page, table: 'a/b?q=c' });
  });
  await getCatalogPage('a/b?q=c', 2, 10);
});

test('rejects invalid pagination before requesting the backend', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Must not fetch'); });
  for (const [p, size] of [[0,10],[-1,10],[1,101],[1,0],[1.2,10]]) {
    await assert.rejects(getCatalogPage('fixture', p, size), /Invalid catalog request/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test('rejects mismatched table or page and inconsistent pagination metadata', async (t) => {
  for (const patch of [{table:'another'}, {schema:'public'}, {page:1}, {size:25}, {total:-1}, {total_pages:9}, {data:[null]}]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({...page,...patch}));
    await assert.rejects(getCatalogPage('fixture', 2, 10), /Invalid paginated/);
  }
});

test('preserves an empty catalog and a legitimate zero-page total', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({...page,page:1,total:0,total_pages:0,data:[]}));
  assert.equal((await getCatalogPage('fixture',1,10)).total,0);
});

test('retains 404 status without leaking backend response details', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('private exception', {status:404}));
  await assert.rejects(getCatalogPage('fixture',2,10), (error) => error instanceof ArchiveApiError && error.status === 404 && !error.message.includes('private'));
});

test('validates and preserves actual column metadata', async (t) => {
  const body = { table:'fixture', columns:[{name:'name',type:'VARCHAR(50)',nullable:false,primary_key:true}] };
  t.mock.method(globalThis,'fetch',async()=>Response.json(body));
  assert.deepEqual(await getColumns('fixture'),body);
  t.mock.method(globalThis,'fetch',async()=>Response.json({...body,columns:[{name:'name',type:'TEXT',nullable:'false',primary_key:true}]}));
  await assert.rejects(getColumns('fixture'),/Invalid column/);
});

test('normalizes invalid URL parameters and preserves valid search text', () => {
  assert.deepEqual(parseExplorerQuery({page:'-1',size:'999',q:'  Kepler & Earth  '}),{catalog:'',page:1,size:25,q:'Kepler & Earth'});
  assert.equal(parseExplorerQuery({page:'9007199254740991'}).page,1);
  assert.equal(parseExplorerQuery({page:['2','3']}).page,1);
  assert.deepEqual(parseExplorerQuery({catalog:'fixture',page:'3',size:'50'}),{catalog:'fixture',page:3,size:50,q:''});
  const url = new URL(explorerUrl({catalog:'a&b',page:2,size:10,q:'Kepler & Earth'}),'http://localhost');
  assert.equal(url.searchParams.get('catalog'),'a&b');
  assert.equal(url.searchParams.get('q'),'Kepler & Earth');
});

test('groups only existing archive tables once and keeps unknown future tables', () => {
  const tables = [{schema:'stellar_archive',table:'exoplanet_2023'},{schema:'stellar_archive',table:'earth_moons'},{schema:'stellar_archive',table:'future_source'},{schema:'public',table:'exoplanet_2023'}];
  const groups=groupCatalogs(tables);
  assert.equal(groups.flatMap(g=>g.tables).length,3);
  assert.equal(groups.find(g=>g.name==='Other catalogs').tables[0].table,'future_source');
  assert.equal(groups.find(g=>g.name==='Solar System').tables[0].table,'earth_moons');
  assert.deepEqual(groupCatalogs([]),[]);
});

test('never coerces missing markers, zeroes, booleans, or stored units', () => {
  assert.equal(fieldValue(0),'0');
  assert.equal(fieldValue(false),'false');
  assert.equal(fieldValue(null),'Not recorded');
  assert.equal(fieldValue(''),'Empty value');
  assert.equal(fieldValue('---'),'---');
  assert.equal(fieldValue('59°F'),'59°F');
  assert.equal(fieldValue({a:1}),'\u007b"a":1}');
  assert.deepEqual(recordFields([{extra:0},{another:false}],[{name:'known'}]),['known','extra','another']);
});

test('abbreviated asteroid tables are grouped by verified contents rather than assumed stellar names', () => {
  const names=['brightest_astro','fastest_rotators','most_massive_astr','slowest_rotators_astr'];
  const groups=groupCatalogs(names.map(table=>({schema:'stellar_archive',table})));
  assert.equal(groups.length,1);
  assert.equal(groups[0].name,'Solar System');
  assert.equal(groups[0].tables.length,4);
});
