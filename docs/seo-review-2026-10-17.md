# FAQ and SEO review — 17 October 2026

## Corrections

- Made static description/social/robots tags replaceable by React Helmet. Previously every tested tool page retained the homepage description alongside its own description. Removed homepage-only hreflang links from the shared HTML shell.
- Removed unsubstantiated aggregate ratings from the HTML shell, postal tool and gallery schema. Removed the shared PDF Tools breadcrumb (incorrect on unrelated routes) and an unverified homepage search action. Kept route-specific breadcrumbs and organization/site identity.
- Added the missing Offer type to WebApplication offers.
- Rewrote the 12 homepage answers to explain actual file/format limits, external-service dependencies, conversion fidelity and mobile constraints. The FAQ UI and JSON-LD use the same data.
- Removed unsupported homepage audience, competitor comparison, security, universal device-testing and perfect-output claims.
- Aligned homepage social titles, clarified PDF-to-PowerPoint produces JPEG images in a ZIP, shortened the image-resizer title, and removed unsupported postal database/accuracy/offline claims from metadata.
- Replaced unsupported About Us biographies, founder identity, certifications, audience figures and blanket compliance claims with factual tool guidance. About-page FAQs now share one source with JSON-LD.
- Removed page-specific index overrides on the homepage and postal tool so preview noindex directives remain effective.

## Validation

186 automated tests and application TypeScript checks passed. Production build passed. Browser review covered homepage plus 50 tool routes at 390px and 1440px (102 visits): one title, one description, one canonical, one H1, parseable JSON-LD, no horizontal overflow and no duplicate Open Graph titles. WebApplication offers all carry Offer type; no aggregateRating remained in these rendered pages. The homepage FAQ answer was opened successfully at both widths. Four photo shortcuts redirect to the same image-resizer canonical; their shared title is not a separate canonical-page duplicate.

A final targeted homepage/postal/About Us check verifies preview noindex after removing route-level overrides. These local Chromium checks block external ads/analytics; they do not establish production ad layout or Google rendering/indexation.

Sitemap contains 123 unique URLs, including 35 blogs and no auth/account pages. Live robots.txt allows public crawling and advertises the sitemap. Search retrieval surfaced VexaTool pages, but does not establish a Google position or complete indexing coverage.

## Remaining verification

- Search Console access/export is needed for queries, countries/devices, average positions, indexing exclusions and Google-selected canonicals. No rank, traffic or approval guarantee is made.
- These changes require publishing the synced Lovable project. Recheck the deployed metadata after publication.
- This was a technical metadata and targeted FAQ/content pass, not a full factual review of every tool FAQ, legal page or article. No founder identity or credentials are asserted without owner evidence.
- The site is client-rendered; non-JavaScript previews can still see shell metadata. No server rendering/prerendering was added.

## Current Google guidance

https://developers.google.com/search/docs/appearance/title-link — descriptive, concise titles; Google chooses displayed title links.

https://developers.google.com/search/updates — May 8, 2026 entry says FAQ rich results stopped appearing from May 7, 2026; June 15 entry records removal of the FAQ feature documentation. FAQ content remains useful to visitors; the schema is not a promise of rich results or improved ranking.
