# Release readiness — 2026-10-15

Status: draft, not deployed. All 50 tool pages received initial checks, but not all tool promises have full end-to-end evidence.

## Completed in this revision

- Live sitemap and robots fetched on October 15: HTTP 200; sitemap XML has 122 unique URLs, all 97 configured public static routes, no auth/account URLs. The extra 25 URLs are database-backed landing pages. No live sitemap outage was established.
- Sitemap generation now runs on production builds and reads Vite public environment configuration. Dynamic fetch has a 10-second limit. If unavailable, the existing 25 dynamic entries are retained as last-known data with a warning; current publication state is not claimed verified.
- Dynamic slugs are restricted to URL-safe values; duplicate/private entries are excluded from fallback. Unknown static lastmod dates are omitted, and significant repaired tool dates updated. No invented current-date fallback for dynamic timestamps.
- robots.txt now shares API/function exclusions across normal crawlers rather than overriding them in per-bot groups.
- Sitemap regression tests cover static route inclusion, uniqueness, private route exclusion, XML parsing and canonical HTTPS host.
- Background-removal mask bytes are normalized from 0–255 to 0–1; soft edges, geometry mismatch and invalid values tested. Progress interval is cleaned up on inference errors, and source alpha is preserved.
- PDF editor no longer opens a mobile properties sheet over inline text entry. Text-tool mousedown preserves typing focus; toolbar tools have accessible names. Add-text/export passed at 390px and 1440px. Independent pypdf checks confirmed two pages, original fixture text and the new text.
- Google export helper validates actual Google HTTPS domains, clears stale IDs and uses noopener/noreferrer. Copy no longer requires making private documents public or implies a confirmed download.
- Unsupported footer audience/security endorsements and guaranteed government-photo acceptance copy removed.

## Validation

184 automated tests passed. Production build, application TypeScript and Vite configuration TypeScript passed. Built sitemap contains 122 unique URLs. Detailed editor evidence is in release-readiness-2026-10-15.json.

## Remaining release gates

- Background removal: real portrait/model test attempted; model fetch failed with ERR_CERT_AUTHORITY_INVALID in this test environment. Certificate validation was not disabled. Unit coverage is not a model-quality or end-to-end pass.
- Google export: actual account permissions and Google-generated PDF require an authorized accessible document/session; link parsing is verified, authenticated export is not.
- PDF editor OCR and existing-text replacement on scanned/complex documents remain unverified; adding text has passed.
- PDF-to-PowerPoint currently supplies an image ZIP, not a native editable PPTX. PPT-to-PDF and Word/HTML conversions are simplified. Do not market unsupported fidelity as complete functionality.
- Complex files, large-file memory limits, non-Chromium engines, camera scanning, genuine damaged-PDF recovery, broad target-size compression and live postal/currency data still need scoped acceptance tests.
- Search Console sitemap processing/index coverage and URL-level live canonical/indexability were not accessible in this run. A sitemap does not guarantee indexing or ranking.

Reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
