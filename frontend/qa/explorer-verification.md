# Celestial Archive Explorer verification — 7 November 2026

## Automated checks

- 17 unit/adapter tests: passed. Coverage includes real zeroes, partial/unavailable endpoints, malformed responses, exact pagination/column contracts, URL normalization and encoding, category membership, and preserving raw values.
- Four live read-only integration tests: passed. Sampled rows and metadata matched FastAPI exactly for all 50 returned tables. Every table appears once in a meaningful category. No record values are hardcoded in the product.
- Pagination verified against actual first, second, last, and out-of-range pages; source data is preserved.
- Live search matches the backend response; invalid one-character search returns HTTP 400, empty matches return an actual zero result set.
- Unknown metadata catalog returns HTTP 404. Invalid catalog and page URLs display recoverable states.
- A separate frontend on port 3002, configured with an unreachable API, verified archive/search connection errors, retry controls, and HTTP 503 for metadata. The user's actual backend was not interrupted.
- Production build and TypeScript compilation: passed.

## Browser checks

- The Exoplanets 2023 catalog displays actual rows, beginning with AF LEPORIS B. Next loads rows 26–50; Previous restores rows 1–25.
- A different catalog (Black holes) displays its own records and count. Changing page size to 10 updates the URL, row count, and pagination totals.
- Record inspection exposes all ten fields of AF LEPORIS B, including literal source markers such as `---`.
- Columns view displays actual VARCHAR types, nullability, and primary-key flags.
- Universal search for Kepler-186 returns KEPLER-186F from habitable_exoplanets. Its inspector loads that table's metadata through the same-origin adapter.
- Escape closes inspection; browser Back restores the previous catalog URL.
- Homepage Explore Data reaches `/explore`; the hero and all five cards remain present.
- Responsive desktop/tablet/phone checks verify no horizontal document overflow. Wide data tables scroll inside their own containers.

## Preservation

SHA-256 values before and after implementation are identical:

- Homepage `app/globals.css`: `731433bea128359c753aa73162dc304f65d63cba1b8cb80cd8b1c37156e1f753`
- `Backend/main.py`: `a2b216eef95237eed080f2466a661deeaf68e9a4ab16ecd5d2b3954e90ede7cd`
- `Backend/database.py`: `829312cc6bd59dea4d13ed4854bb3f1085cb11354fbf5e0ff52c46a878f2fa38`

The homepage component diff only adds the Link import and changes the two Explore controls to links. No backend or database writes were performed. Search remains subject to the existing backend's 20-result limit; the UI does not claim those results are a complete census.
