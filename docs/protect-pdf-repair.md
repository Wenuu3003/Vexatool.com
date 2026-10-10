# Protect PDF repair — draft, not approved for production

The previous implementation saved an unencrypted PDF with metadata and called it protected. This change encrypts the original bytes with qpdf 12.2.0 through pinned @neslinesli93/qpdf-wasm 0.3.0. The engine and WASM are bundled locally, and a disposable worker is terminated on completion, cancellation or timeout.

Supported scope: one valid unencrypted PDF, up to 25 MB, 8 non-padding characters to 127 UTF-8 bytes. Password spaces are preserved. Already encrypted/corrupt/empty files fail clearly. Printing and copying are not restricted after opening. Rewriting signed PDFs may invalidate signatures; the UI tells users to keep originals.

## Verified locally

- All 140 Vitest tests passed, including five new regression tests.
- Actual generated output independently read with PDF.js: absent, wrong and trimmed passwords rejected; exact password opens; two pages and fixture text preserved.
- Corrupt, empty, oversized and already encrypted input rejected.
- Fake successful engine output without encryption rejected.
- TypeScript app check passed.
- Vite production build passed; worker and WASM emitted as assets.

## Required before merge

- Run the production preview in Chromium at 390px and 1440px, upload a PDF, check mismatch, encryption, download, cancellation, subsequent attempts and errors. Check overflow, keyboard operation and layout.
- Open browser-downloaded output in an independent PDF reader with no/wrong/correct password.
- Check bundled worker/WASM loading and network requests; no document or password upload should occur.
- Review existing third-party scripts on this sensitive tool page before making site-wide privacy claims.
- Confirm browser compatibility and dependency/security review for qpdf WASM before production.

Browser validation was attempted but could not run: Playwright's Chromium download returned an invalid/truncated ZIP in this environment. Automated engine tests do not replace this check. Build has existing large-chunk warnings and Node builtin externalization warnings from the qpdf browser wrapper; browser checks must confirm its browser branch works.

No live-site changes, merge or deployment were performed. The other 49 tools are outside this repair.
