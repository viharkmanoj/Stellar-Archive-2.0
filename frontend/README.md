# Stellar Archive frontend

A static, responsive astronomy dashboard built in the existing Next.js App Router project with React, TypeScript, and Tailwind CSS. The design follows the supplied Stellar Archive reference: floating navigation, a planetary hero, three source-backed metrics, and five glass dashboard cards. No animation, transitions, particle systems, or scientific simulations are used.

## Run locally

Use Node.js 22.18+ (the adapter tests use native TypeScript support). From this directory:

```sh
npm install
npm run dev
```

Open the URL printed by Next.js (normally http://localhost:3000). The existing FastAPI service should run at `http://127.0.0.1:8000`. For another address, copy `.env.example` to `.env.local` and set `API_URL`. This variable stays on the server. The existing FastAPI/PostgreSQL implementation is unchanged.

```sh
npm test
npx tsc --noEmit
npm run build
npm start
```

## Data and interface behavior

- `GET /tables`: displays the count and names of available catalogs.
- `GET /api/catalog/exoplanet_2023?page=1&size=5`: displays the archive's record count and a five-record preview. This historical table is not a current worldwide exoplanet census.
- `GET /api/search?q=...&limit=20`: accessed through the same-origin Next.js `/api/search` adapter. Search covers all text-searchable backend catalogs, not only exoplanets. Results retain their source table and original fields.
- Each request is uncached and has a four-second timeout. Independent endpoint failures preserve successful responses. Unknown counts display an em dash; actual zero counts display zero. Status is checked per page load.
- The search dialog validates input, handles empty/error states, cancels requests on close, and uses native dialog keyboard/focus behavior. Explore opens the current catalog preview. Navigation links lead to the existing cards; the status and About controls open informational dialogs. The moon control enables higher contrast.
- The discovery feed, scientific star map, and AI pipeline are explicitly unconnected. No discoveries, coordinates, processing progress, habitability scores, or storage sizes are invented.
- Research links open the NASA Exoplanet Archive and NASA Astrophysics Data System. They do not imply a connected saved-paper library.

## Files

- `app/page.tsx`: streaming shell and server data loading.
- `components/dashboard/`: reusable navigation/hero/cards, SVG diagrams, icons, and dialogs.
- `lib/api.ts`: server-used FastAPI adapter and response validation.
- `app/api/search/route.ts`: fixed-destination search proxy.
- `app/globals.css`: reference-matched visual system and desktop/tablet/mobile layouts.
- `tests/api.test.mjs`: data integrity, unavailable/partial services, zero counts, and search validation tests with clearly isolated fixtures.
- `public/images/`: optimized local WebP illustrations. See `ASSETS.md` for generation provenance and prompts.
- `public/fonts/geist-latin.woff2`: local Geist font copied from the existing Next.js installation, avoiding build-time font downloads. Geist is distributed under SIL Open Font License 1.1.

No database migrations, backend edits, dependency additions, commits, or deployments are required by this frontend change.

## Celestial Archive Explorer

Open `/explore`. The existing homepage retains its visual design; its Explore navigation item and Explore Data button now link to this page.

- Catalogs come from `/tables` and are restricted to `stellar_archive`, matching the backend's catalog lookup scope. Eight astronomy categories group only returned tables; future unrecognized tables remain available under Other catalogs. Abbreviated asteroid/minor-planet table names were checked against actual source rows before labeling.
- Selecting a catalog calls `/api/catalog/{table_name}` on the server. Next/Previous and page sizes 10, 25, 50, and 100 request backend pages, never slice a downloaded full catalog. Pagination uses the returned totals. Out-of-range pages offer a return to the first page.
- `/explore?catalog=exoplanet_2023&page=2&size=25` is bookmarkable. Universal searches use `q`; selecting another catalog resets pagination and clears the universal query. Browser Back/Forward restores URL-selected views.
- The universal search uses the existing `/api/search?q=...&limit=20` service. Its result cap is stated explicitly; the existing backend does not expose paginated search or a total match count.
- The Records view shows actual field values, with horizontal scrolling for wide catalogs. Inspect opens every field in a keyboard-accessible dialog. Source placeholders, strings, zeroes, booleans, and units are preserved; null and empty strings receive distinct display labels.
- The Columns view displays `/api/columns/{table_name}` metadata: original name, database type, nullability, and primary-key status. Search-result inspectors load the selected source's metadata through `/api/columns/[table]`, a same-origin Next.js adapter that validates membership in the source schema.
- Record data and metadata are fetched independently so a metadata failure does not hide available records. Connection, missing catalog, empty catalog/search, loading, and invalid-page states have explicit messages and recovery controls.
- Explorer styling is isolated in `app/explore/explore.css`; the homepage stylesheet and image assets are unchanged. No new dependencies, tables, AI services, backend edits, or database writes were introduced.

Relevant files: `components/explorer/`, `lib/explorer.ts`, `lib/explorer-data.ts`, `app/explore/`, and `app/api/columns/[table]/route.ts`.

### Integration checks

```sh
npm test
npm run test:integration
npm run build
```

`npm test` uses isolated test fixtures. `npm run test:integration` is explicitly read-only and requires the existing backend and frontend to be running. It compares sampled rows and column metadata for every returned archive table, verifies pagination/search, and checks rendered Explorer responses. Optional shell variables: `API_URL` for the backend and `EXPLORER_URL` for the frontend (default `http://localhost:3000`). Node does not automatically load `.env.local` for these standalone tests; pass a custom address in the shell if needed.
