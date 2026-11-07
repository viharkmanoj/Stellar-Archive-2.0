# Verification — 7 November 2026

- Production `npm run build`: passed, including TypeScript and prerendering.
- `npm test`: six adapter tests passed (real zero, partial service, offline service, malformed responses, query encoding/timeout, malformed search results).
- Browser checks: desktop, tablet, and phone layouts; all five cards present and no horizontal document overflow at checked sizes. The browser was at 110% zoom, so CSS viewport measurements differ from requested outer dimensions. Observed widths included 1672, 768, 390, and 291 CSS pixels.
- Live FastAPI integration: 92 rows in `exoplanet_2023`, 50 available catalogs at verification time. These are local archive counts, not worldwide scientific statistics.
- Live search for `Kepler-186`: one record returned, source table shown, record fields expand correctly.
- Empty search: zero-result response. One-character input: HTTP 400. Valid search: HTTP 200.
- Catalog dialog: 50 catalog names and the first five exoplanet records.
- Native dialog close/Escape verified; cleanup restores focus to the opener.
- HTTP 200 verified for the rendered development and production homepages.
- Backend files and database schema were not modified.

`desktop.jpg` and `mobile.jpg` are browser captures of the local implementation. The small N badge is Next.js's development control and is absent from production.

The existing development service at localhost:3000 was left running. The separate production QA process on port 3001 was stopped. Discovery feeds, scientific mapping, and AI analysis remain explicitly unconnected.
