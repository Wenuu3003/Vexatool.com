# Release regression checks

Run from the repository root. Install dependencies, Python packages `pillow python-docx openpyxl python-pptx reportlab pypdf pymupdf`, Playwright and Chromium. Set `PLAYWRIGHT_PATH` to the Playwright module if it is outside this project; set `CHROMIUM_PATH` to the Chromium executable. The scripts default to `playwright` and `../browser-qa/chromium`.

```
python scripts/qa/fixtures.py
npm run build
node scripts/qa/all-tools.cjs
node scripts/qa/negative.cjs
node scripts/qa/pdf-fixes.cjs
python scripts/qa/verify-outputs.py
```

Results and generated files go into `qa-output/` (not release source). Each browser script starts and stops its own local production preview. Browser runs use widths 390 and 1440. `QA_ONLY` can restrict routes; `QA_WIDTHS` restricts widths. External requests are blocked except explicitly mocked exchange/postal responses. Google export tests inspect URL construction, not authenticated exports. Camera denial is simulated.

PDF output checks include page counts, text markers where searchable output is promised, raster pages where documented, encryption/password handling, readable Office archives, image decoding and WebP alpha. Word PDF pages are raster images; inspect their first/last pages visually for content and pagination. Font shaping and watermark geometry also have unit/browser coverage.
