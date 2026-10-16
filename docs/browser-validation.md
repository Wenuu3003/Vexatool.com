# Browser validation — 2026-10-13

Production Vite build tested in headless Chromium at 390×900 and 1440×900. All 12 selected core flows passed, with no document-wide horizontal overflow or uncaught page errors. Screenshots were inspected. This is viewport emulation, not testing on physical Android/iOS devices.

| Tool | Checks passed at both sizes |
|---|---|
| Protect PDF | Mismatched password disables action; actual worker/WASM encrypts; result and download work |
| PPT-to-PDF | Synthetic text PPTX downloads PDF; corrupt archive shows error without download |
| Currency | Controlled USD/INR response renders 80; HTTP 503 refresh clears result and shows unavailable |
| Percentage | 63% of 21500 renders 13545; clearing input removes stale result |
| GST | 1000 at selected 18% renders 1180; changing supply type clears stale result |
| EMI | 12000, zero interest, one year renders monthly 1000 |

Both browser-downloaded protected PDFs independently verified with pypdf: encrypted; absent/wrong passwords rejected; exact password opens and preserves fixture text. Both PPT PDFs preserve fixture text.

## Scope and remaining checks

External third-party requests were blocked; Currency API was mocked with fixed success/failure responses. This does not validate the live provider, ad scripts, live deployment or current tax policy. PPTX remains a simplified extractor, not a full-fidelity renderer. Complex PDFs/PPTX, keyboard/accessibility audit, cancellation, multiple retries, network timeout and other browser engines/physical devices are not covered by this run. Existing console warnings from pdf-lib parsing encrypted objects and expected conversion-error logging occurred; they were not uncaught page errors.

The previous browser-install blocker was overcome using a packaged Chromium binary with software graphics disabled. No merge or deployment was performed. See browser-core-results.json and browser-output-results.json for recorded assertions. The other 44 tools still require their own validation.
