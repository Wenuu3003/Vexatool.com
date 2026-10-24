# Background Remover retirement and Office checks — 24 October 2026

## Changes
- Removed Background Remover implementation, route, tool registry entry, navigation/related links, supporting blog entry, preview asset, sitemap entries and direct Transformers dependency. Dynamic guide links exclude the retired tool; its URL renders the existing noindex not-found page.
- Replaced the UPSC database-generated page with a reviewed guide. Removed unverified fixed-size/acceptance claims, clarified shared custom resizing and linked the official CSE 2026 notice and application portal. This overrides stale database copy without requiring a database migration.
- Word: namespace-aware XML parsing decodes entities; table extraction preserves horizontal grid spacing. Long text tokens wrap. Legacy DOC/RTF are rejected instead of producing guessed text. DOCX-to-PDF is explicitly body-text-only.
- Excel: fixed quoted multiline CSV, escaped quotes, rich-text values, missing cached formula results and chart-containing workbook loading. Drawings are omitted in an in-memory copy because these tools export cell data, not charts. Original files are unchanged. Legacy XLS is rejected. Oversized rows/wide tables fail explicitly rather than silently clipping.
- PPTX: uses presentation manifest order; long text and excess supported images continue onto extra PDF pages. Output remains a simplified extraction, not original slide layout.
- Google Drive: clarified that Google controls export layout; URL validation and export targets checked.

## Verification
194 automated tests passed across 19 files. TypeScript check passed.
Browser checks at 390px and 1440px:
| Conversion | Fixture | Independently inspected output |
| --- | --- | --- |
| Word to PDF | DOCX with image/header, merged table, ampersands and 85 body paragraphs | 3 pages; final paragraph and decoded characters present |
| Word to Excel | Same DOCX | 2 sheets; table values and final body paragraph present |
| Excel to PDF | XLSX with 140 data rows, second sheet, merge, formula and chart | 5 pages; both sheets and final data row present |
| Excel to Word | Same XLSX | 2 tables; both sheets and final row present |
| PPTX to PDF | Reordered two-slide deck, image and 65 text rows per slide | 8 pages; correct order and final text from both slides present |

PDFs parsed independently with pypdf strict mode, XLSX with openpyxl, DOCX with python-docx. First Excel and PPT PDF pages were rendered and inspected. Simplified layouts are intentional; charts, original styles and exact Office layout are not certified.
At both widths the reviewed UPSC guide opens the custom Image Resizer; All Tools contains no Background Remover link; the retired route displays not found.
Google Drive: four export destinations, invalid URL rejection, clearing old export options and new-tab isolation passed. Private authenticated export was not tested because no authorized Google account/file was provided.

## Sources and release
UPSC source: https://www.upsc.gov.in/sites/default/files/Notif-CSP-2026-Engl-060226Rev.pdf (Notes 2 and 3: live photo and three signatures).
Current instructions: https://upsconline.nic.in/
No universal current photo dimensions are asserted. Confirm requirements in the active application.
Changes are prepared for GitHub/Lovable sync. Publishing remains user-managed.
