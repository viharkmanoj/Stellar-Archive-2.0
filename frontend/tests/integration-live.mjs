// Explicit opt-in read-only checks against the user's running archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getTables, getCatalogPage, getColumns, searchArchive } from '../lib/api.ts';
import { groupCatalogs, explorerUrl } from '../lib/explorer.ts';

const base=(process.env.API_URL || 'http://127.0.0.1:8000').replace(/\/$/,'');
const frontend=(process.env.EXPLORER_URL || 'http://localhost:3000').replace(/\/$/,'');
async function json(path) {
  const response=await fetch(base+path,{signal:AbortSignal.timeout(15000)});
  assert.ok(response.ok,`${path}: HTTP ${response.status}`);
  return response.json();
}

test('all live archive catalogs retain their exact source records and columns',async()=>{
  const tables=(await getTables()).filter(t=>t.schema==='stellar_archive');
  assert.ok(tables.length>0);
  const grouped=groupCatalogs(tables).flatMap(g=>g.tables.map(t=>t.table));
  assert.deepEqual([...grouped].sort(),tables.map(t=>t.table).sort());
  let verified=0;
  // Keep concurrency low for the existing database service.
  for(let i=0;i<tables.length;i+=4){
    await Promise.all(tables.slice(i,i+4).map(async({table})=>{
      const path=encodeURIComponent(table);
      const [source,adapted,sourceColumns,columns]=await Promise.all([
        json(`/api/catalog/${path}?page=1&size=2`),getCatalogPage(table,1,2),json(`/api/columns/${path}`),getColumns(table)
      ]);
      assert.deepEqual(adapted,source,`${table}: changed records`);
      assert.deepEqual(columns,sourceColumns,`${table}: changed metadata`);
      assert.ok(columns.columns.length>0,`${table}: no column definitions`);
      for(const row of adapted.data) assert.deepEqual(Object.keys(row).sort(),columns.columns.map(c=>c.name).sort());
      verified++;
    }));
  }
  console.log(`Verified ${verified} real catalogs; no writes performed.`);
});

test('live next, previous, last, and out-of-range pages follow source pagination',async()=>{
  const table='exoplanet_2023';
  const first=await getCatalogPage(table,1,25);
  if(first.total_pages>1){
    const second=await getCatalogPage(table,2,25);
    assert.notDeepEqual(first.data,second.data);
    assert.deepEqual((await getCatalogPage(table,1,25)).data,first.data);
  }
  const last=await getCatalogPage(table,Math.max(1,first.total_pages),25);
  assert.equal(last.data.length,first.total===0?0:first.total%25||25);
  assert.equal((await getCatalogPage(table,first.total_pages+1,25)).data.length,0);
});

test('live universal search is passed through unchanged',async()=>{
  for(const query of ['Kepler-186','zzzz_no_archive_match_20261107']) {
    const source=await json(`/api/search?${new URLSearchParams({q:query,limit:'20'})}`);
    assert.deepEqual(await searchArchive(query),source);
  }
});

test('Explorer renders live data, metadata proxy, and safe error states',async()=>{
  const response=await fetch(frontend+explorerUrl({catalog:'exoplanet_2023',size:10}));
  assert.equal(response.status,200);
  const html=await response.text();
  assert.ok(html.includes('AF LEPORIS B'),'First source record not rendered');
  assert.ok(html.includes('stellar_archive.'),'Source attribution missing');
  const metadata=await fetch(frontend+'/api/columns/exoplanet_2023');
  assert.equal(metadata.status,200);
  assert.deepEqual(await metadata.json(),await getColumns('exoplanet_2023'));
  assert.equal((await fetch(frontend+'/api/columns/definitely_not_a_catalog')).status,404);
  const invalid=await (await fetch(frontend+'/explore?catalog=definitely_not_a_catalog')).text();
  assert.ok(invalid.includes('This catalog is not available'));
  const outside=await (await fetch(frontend+'/explore?catalog=exoplanet_2023&page=99999')).text();
  assert.ok(outside.includes('Page outside this catalog'));
  assert.equal((await fetch(frontend+'/api/search?q=x')).status,400);
});
