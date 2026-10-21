# Pending tool verification — 2026-10-21
Scope: targeted follow-up, not certification of all tools or all browsers.

## Changes
- PIN bulk generation samples a shuffled unique list with a finite bound, respects location filters, and saves the batch together.
- Finder invalidates old responses when input is cleared/changed; displays service errors.
- Reverse lookup clears stale results and ignores responses after input changes.
- Postal client validates response fields and bounds a stalled request to 20 seconds.
- PIN descriptions identify the third-party provider and limited local coverage.
- QR camera cancellation stops late streams; metadata/canplay cannot launch duplicate scan loops.

## Verification
- 190 automated tests passed; production build passed. Final TypeScript check passed.
- Chromium 390px and 1440px: PIN fixture response, service failure, cleared-input race, unique bulk output, invalid reverse lookup passed.
- Same viewports: QR late-permission cancellation stops stream; denied permission displays error. These use simulated media APIs, not a physical camera.
- Same viewports: Google Doc/Sheet/Slides/Other File export URLs and invalid-link stale-state clearing passed. No Google authenticated download performed.
- Same viewports: Repair PDF recovered a fixture with an invalid startxref offset. Independent pypdf strict parsing confirmed page count and extracted text equal the source.
- Live api.postalpincode.in/pincode/600001 returned HTTP 200, Success, seven offices. This verifies provider availability for one request, not address accuracy or the deployed backend.
- Browser checks use local app and controlled external responses. Test harness selector/mock errors were corrected before final passing runs.

## Still requires verification
- Deployed postal backend and wider postal data accuracy.
- Physical-device QR camera capture and additional browser engines.
- Authorized private Google document export.
- Large/complex PDF compression quality, broader genuinely damaged PDFs, model asset loading on production and complex Office fidelity.
- Existing photo-guide content claims require a separate content correction; link fixes do not validate official requirements.

No live deployment performed; user publishes through Lovable.
