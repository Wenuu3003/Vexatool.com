# VexaTool release verification — 30 October 2026

Prepared for manual publication through Lovable. This report covers selected functional flows, not every possible input or device.

## Changes

- Watermark PDF: shaped Telugu/Hindi text, measured placement, crop/rotation-aware coordinates, large-logo fitting, tiled placement and reusable download.
- Word to PDF: preserved the latest iframe-based DOCX layout renderer; added local Telugu/Hindi fonts, UTF-16/UTF-8 text handling, repeat download and safer paragraph boundaries. Pages remain image-based; complex Word layouts may differ from Microsoft Word.
- Preserved latest PDF-to-Word page-image output with separate extracted text and multiline Word-to-Excel cells.
- Unit converter: no grouping separators in numeric inputs; correct large-value swap/reverse conversion and finite-value checks.
- Image converter: preserves WebP alpha, invalidates stale outputs after changing settings and releases reset previews.
- Corrected conversion feature descriptions and synchronized npm lockfile with docx-preview dependency.

## Validation

- 49 tool routes, each at Chromium viewport widths 390 and 1440: **98/98 selected flows passed**.
- 10 error-handling checks passed: corrupt PDF, invalid split range, denied camera, postal-service failure and corrupt image at both widths.
- Watermark and Word Unicode/re-download flows plus large logos on four rotated/cropped pages tested separately; final results included alongside this report.
- Output verification opens PDFs, DOCX, XLSX, ZIP and images independently. PDF checks use text markers where promised, raster checks where documented, page counts and encryption/password checks. WebP transparency is verified.
- Word first/last-page and Telugu/Hindi rendering inspected visually. Watermark placement is covered by 20 geometry tests including every corner/center on rotated crop boxes.

## Limits to keep visible

- Word PDF pages and preserved PDF-to-Word page appearances are raster images, not searchable/editable layouts. Extracted PDF text is appended separately; there is no OCR.
- Google Drive export URL construction was tested; private authenticated Google account exports were not.
- Exchange-rate success/failure and postal failures use mocked responses; live provider accuracy/availability was not certified.
- Camera denial was tested; real-device scanning and Safari were not. Mobile tests use a 390px Chromium viewport.
- Build may emit existing large-chunk and qpdf browser-external warnings; inspect real-device performance after publication.

## Tool coverage

| Route | 390px | 1440px |
|---|---|---|
| /protect-pdf | Pass | Pass |
| /unlock-pdf | Pass | Pass |
| /merge-pdf | Pass | Pass |
| /split-pdf | Pass | Pass |
| /rotate-pdf | Pass | Pass |
| /compress-pdf | Pass | Pass |
| /watermark-pdf | Pass | Pass |
| /repair-pdf | Pass | Pass |
| /organize-pdf | Pass | Pass |
| /pdf-to-word | Pass | Pass |
| /pdf-to-excel | Pass | Pass |
| /pdf-to-html | Pass | Pass |
| /pdf-to-powerpoint | Pass | Pass |
| /word-to-pdf | Pass | Pass |
| /word-to-excel | Pass | Pass |
| /excel-to-pdf | Pass | Pass |
| /excel-to-word | Pass | Pass |
| /ppt-to-pdf | Pass | Pass |
| /html-to-pdf | Pass | Pass |
| /pdf-to-image | Pass | Pass |
| /pdf-to-jpg | Pass | Pass |
| /pdf-to-png | Pass | Pass |
| /image-to-pdf | Pass | Pass |
| /jpg-to-pdf | Pass | Pass |
| /png-to-pdf | Pass | Pass |
| /aadhaar-photo-resize | Pass | Pass |
| /govt-job-photo-resize | Pass | Pass |
| /passport-photo-resize | Pass | Pass |
| /whatsapp-dp-resize | Pass | Pass |
| /image-resizer | Pass | Pass |
| /image-format-converter | Pass | Pass |
| /compress-image | Pass | Pass |
| /file-compressor | Pass | Pass |
| /qr-code-generator | Pass | Pass |
| /qr-code-scanner | Pass | Pass |
| /percentage-calculator | Pass | Pass |
| /gst-calculator | Pass | Pass |
| /emi-calculator | Pass | Pass |
| /bmi-calculator | Pass | Pass |
| /age-calculator | Pass | Pass |
| /calculator | Pass | Pass |
| /love-calculator | Pass | Pass |
| /word-counter | Pass | Pass |
| /unit-converter | Pass | Pass |
| /currency-converter | Pass | Pass |
| /pincode-generator | Pass | Pass |
| /google-drive-to-pdf | Pass | Pass |
| /sign-pdf | Pass | Pass |
| /edit-pdf | Pass | Pass |

Final gate: 224 automated tests across 22 test files passed; production build and application TypeScript checks passed. Final office recheck: 6/6. PDF Unicode/logo recheck: 6/6 (including all six logo positions on four rotated/cropped pages). Independent output validation: 24 grouped checks passed.
