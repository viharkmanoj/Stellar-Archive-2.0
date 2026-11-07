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
