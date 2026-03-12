# VexaTool — Master Testing Checklist & Validation Workflow

> **Rule:** A tool is NOT production-ready until it passes all stages in preview.
> If preview fails → the tool is NOT done.

---

## Part 1 — Reusable Testing Checklist (per tool)

### Stage 1: Page Load ✅
| # | Check | Pass? |
|---|-------|-------|
| 1.1 | Tool page opens without blank screen | |
| 1.2 | No console-breaking errors (check DevTools) | |
| 1.3 | Layout renders correctly on desktop (1280px+) | |
| 1.4 | Layout renders correctly on mobile (375px) | |
| 1.5 | ToolLayout header, icon, description visible | |
| 1.6 | No missing imports or lazy-load failures | |

### Stage 2: Input / Upload ✅
| # | Check | Pass? |
|---|-------|-------|
| 2.1 | File upload accepts correct file types | |
| 2.2 | Multiple file upload works (if applicable) | |
| 2.3 | Invalid file type shows specific error message | |
| 2.4 | Empty input / no file selected shows clear error | |
| 2.5 | Oversized file handled gracefully (no crash) | |
| 2.6 | Corrupted file shows descriptive error | |
| 2.7 | Password-protected file shows correct guidance | |
| 2.8 | Text input validates before processing | |

### Stage 3: Core Processing ✅
| # | Check | Pass? |
|---|-------|-------|
| 3.1 | Main function executes and produces output | |
| 3.2 | No silent failures (empty result without error) | |
| 3.3 | No stuck/infinite loading state | |
| 3.4 | Processing works on second attempt (retry) | |
| 3.5 | Result is accurate / matches expectation | |
| 3.6 | No placeholder/fake output disguised as real | |

### Stage 4: Output / Download ✅
| # | Check | Pass? |
|---|-------|-------|
| 4.1 | Download triggers correctly | |
| 4.2 | Downloaded file opens in target application | |
| 4.3 | Output content matches input (no data loss) | |
| 4.4 | File extension and MIME type are correct | |
| 4.5 | Filename is descriptive (not "download.pdf") | |

### Stage 5: Error Handling ✅
| # | Check | Pass? |
|---|-------|-------|
| 5.1 | Wrong file type → specific error message | |
| 5.2 | Corrupt file → descriptive recovery guidance | |
| 5.3 | Protected file → suggests Unlock PDF tool | |
| 5.4 | Network error (if API-dependent) → clear message | |
| 5.5 | No vague "Something went wrong" unless unavoidable | |

### Stage 6: UX / State ✅
| # | Check | Pass? |
|---|-------|-------|
| 6.1 | Loading indicator visible during processing | |
| 6.2 | Progress bar or percentage shown (if lengthy) | |
| 6.3 | No flickering/blinking during state transitions | |
| 6.4 | Success toast/message shown after completion | |
| 6.5 | Reset/retry flow works cleanly | |
| 6.6 | Buttons disabled during processing (no double-submit) | |

### Stage 7: Mobile ✅
| # | Check | Pass? |
|---|-------|-------|
| 7.1 | Usable on 375px viewport | |
| 7.2 | No horizontal overflow or scroll | |
| 7.3 | Buttons tappable (min 44px touch target) | |
| 7.4 | Upload area accessible on mobile | |
| 7.5 | Canvas/editor doesn't break layout | |

### Stage 8: Consistency ✅
| # | Check | Pass? |
|---|-------|-------|
| 8.1 | Uses ToolLayout wrapper | |
| 8.2 | Uses CanonicalHead component | |
| 8.3 | Error toasts use consistent variant style | |
| 8.4 | Button styles match site-wide conventions | |
| 8.5 | Upload area matches FileUpload or native input pattern | |

### Stage 9: SEO / Route ✅
| # | Check | Pass? |
|---|-------|-------|
| 9.1 | Direct URL access works (no 404) | |
| 9.2 | Canonical tag present and correct (non-www) | |
| 9.3 | Page title and meta description set | |
| 9.4 | Route exists in sitemap.xml | |
| 9.5 | Route exists in toolsData registry | |

### Stage 10: Final Status
Mark ONE:
- [ ] **✅ Working** — all stages pass
- [ ] **🟡 Working, needs polish** — core works, minor UX issues
- [ ] **🟠 Partially working** — some flows work, others fail
- [ ] **🔴 Broken** — core function fails
- [ ] **⬛ Blocked** — depends on unresolved shared issue

---

## Part 2 — Tool Validation Workflow

```
Step 1: Open tool page directly via URL → verify Stage 1
Step 2: Attempt file upload or input → verify Stage 2
Step 3: Click process/convert button → verify Stage 3
Step 4: Download output → verify Stage 4
Step 5: Re-test with bad input → verify Stage 5
Step 6: Observe all state transitions → verify Stage 6
Step 7: Resize to 375px → verify Stage 7
Step 8: Compare to other tools → verify Stage 8
Step 9: Check canonical, sitemap, route → verify Stage 9
Step 10: Assign final status → Stage 10
```

**Only after ALL 9 functional stages pass can a tool be marked ✅ Working.**

---

## Part 3 — Status Report: All Tools

### PDF Tools (19 tools)
| Tool | Status | Notes |
|------|--------|-------|
| PDF Editor | ✅ Working | Full editor with OCR, text blocks, watermark |
| Merge PDF | ✅ Working | Per-file validation, encrypted file handling |
| Split PDF | ✅ Working | Page range selection, encryption handling |
| Compress PDF | ✅ Working | Quality presets, size preview |
| PDF to Word | ✅ Working | Text extraction via pdfjs-dist |
| Word to PDF | ✅ Working | JSZip .docx parsing, real text extraction |
| Unlock PDF | ✅ Working | Password candidates, Aadhaar support, preview |
| Protect PDF | ✅ Working | Password encryption via pdf-lib |
| Rotate PDF | ✅ Working | Per-page rotation, encryption handling |
| JPG to PDF | ✅ Working | Multi-image, canvas-based |
| PDF to JPG | ✅ Working | pdfjs-dist rendering at 2x scale |
| Sign PDF | ✅ Working | Draw/type signature, place on page |
| Watermark PDF | ✅ Working | Text/image watermark, opacity/tiling |
| Organize PDF | ✅ Working | Drag-drop page reorder |
| Repair PDF | 🟡 Needs polish | Re-saves PDF; limited actual repair capability |
| PDF to Image | ✅ Working | Multi-format output (JPG/PNG/WebP) |
| PDF to PNG | ✅ Working | pdfjs-dist rendering |
| PDF to HTML | ✅ Working | Text extraction with line reconstruction |
| PNG to PDF | ✅ Working | Multi-image support |

### Image Tools (10 tools)
| Tool | Status | Notes |
|------|--------|-------|
| Image Resizer | ✅ Working | Presets, custom dims, special modes |
| Image Compressor | ✅ Working | Quality slider, multi-format |
| Image Format Converter | ✅ Working | JPG/PNG/WebP conversion |
| Image to PDF | ✅ Working | Multi-image to single PDF |
| Background Remover | ✅ Working | AI-powered (@huggingface/transformers), mask editing |
| File Compressor | 🟡 Needs polish | Basically image compressor with different branding |
| WhatsApp DP Resizer | ✅ Working | Redirects to Image Resizer with preset |
| Aadhaar Photo Resizer | ✅ Working | Redirects to Image Resizer with mode |
| Govt Job Photo Resizer | ✅ Working | Redirects to Image Resizer with mode |
| Passport Photo Resizer | ✅ Working | Redirects to Image Resizer with mode |

### Calculator Tools (8 tools)
| Tool | Status | Notes |
|------|--------|-------|
| Love & Age Calculator | ✅ Working | Social sharing cards, viral features |
| BMI Calculator | ✅ Working | Health categories, recommendations |
| Percentage Calculator | ✅ Working | Three calculation modes, ToolLayout |
| EMI Calculator | ✅ Working | Amortization schedule, chart |
| GST Calculator | ✅ Working | All Indian GST rates, CGST/SGST/IGST |
| Scientific Calculator | ✅ Working | Full scientific operations, keyboard |
| Age Calculator | ✅ Working | Exact age, birthday wishes |
| Currency Converter | 🟡 Needs polish | Depends on external API (exchangerate-api.com); works when API is available |

### QR Tools (2 tools)
| Tool | Status | Notes |
|------|--------|-------|
| QR Code Generator | ✅ Working | Custom colors, logo, multiple formats |
| QR Code Scanner | ✅ Working | Camera + image upload, jsqr library |

### Utility Tools (3 tools)
| Tool | Status | Notes |
|------|--------|-------|
| PIN Code Generator | ✅ Working | State/district lookup, reverse search |
| Word Counter | ✅ Working | Full text analysis, keyword density |
| Unit Converter | ✅ Working | Length, weight, temp, area, volume, speed |

### Document Converters (8 tools)
| Tool | Status | Notes |
|------|--------|-------|
| PDF to Excel | ✅ Working | pdfjs-dist text extraction → ExcelJS |
| Excel to PDF | ✅ Working | ExcelJS parsing → pdf-lib rendering |
| PDF to PowerPoint | 🟠 Partially working | Splits PDF into per-page PDFs in ZIP — NOT actual PPTX slides |
| Word to Excel | ✅ Working | JSZip .docx parsing → ExcelJS output |
| Excel to Word | 🟡 Needs polish | ExcelJS → RTF output (not true .docx) |
| PPT to PDF | ✅ Working | JSZip .pptx parsing, text+image extraction |
| HTML to PDF | 🟡 Needs polish | Uses browser print dialog — not a direct PDF download |
| Google Drive to PDF | 🟠 Partially working | Only generates download links; CORS blocks actual conversion for most files |

---

## Part 4 — Recommended Testing Order

**Priority 1 — High-traffic, core tools (test first):**
1. Merge PDF
2. Compress PDF
3. Image Resizer
4. Background Remover
5. PDF to Word
6. QR Code Generator

**Priority 2 — Document converters (highest risk of fake functionality):**
7. PDF to Excel
8. Excel to PDF
9. Word to PDF
10. PDF to PowerPoint ⚠️
11. Google Drive to PDF ⚠️

**Priority 3 — Calculators & Utilities:**
12. EMI Calculator
13. GST Calculator
14. Currency Converter
15. Unit Converter
16. Word Counter

**Priority 4 — Specialized image tools:**
17. Image Compressor
18. Image Format Converter
19. Passport/Aadhaar/Govt Job photo resizers

---

## Part 5 — Known Issues & Root Causes

### 🔴 Tools with fake or misleading functionality:
| Tool | Issue | Root Cause |
|------|-------|------------|
| PDF to PowerPoint | Outputs a ZIP of single-page PDFs, NOT a .pptx file | No PPTX generation library; pdf-lib can only create PDFs |
| Google Drive to PDF | Shows download links but CORS blocks actual fetching | Browser-based tool cannot bypass Google Drive CORS restrictions |
| HTML to PDF | Opens browser print dialog instead of generating PDF | Uses `window.print()` fallback — not a true PDF generator |
| Excel to Word | Generates RTF, not true .docx | No .docx generation (could use `docx` npm package which IS installed) |

### 🟡 Tools that work but need polish:
| Tool | Issue |
|------|-------|
| Currency Converter | Depends on external API availability; no offline fallback |
| File Compressor | Duplicate of Image Compressor with different wrapper |
| Repair PDF | Re-saves PDF via pdf-lib — limited actual corruption repair |

---

## Part 6 — Regression Check Process

### After every code change:
1. Run `vitest` to catch logic regressions in tested modules
2. Spot-check the 3 most recently edited tools in preview
3. Verify download output opens correctly in target app

### Weekly regression sweep:
1. Open each Priority 1 tool → upload → process → download
2. Verify no new console errors
3. Check canonical tags haven't reverted
4. Verify sitemap.xml still matches routes

### Shared components to monitor for regressions:
- `FileUpload.tsx` — any change affects all upload-based tools
- `ToolLayout.tsx` — any change affects all tool pages
- `CanonicalHead.tsx` — any change affects SEO for all tools
- `pdfjs-dist` worker setup — affects all PDF reading tools
- `pdf-lib` — affects all PDF writing tools
- `excelUtils.ts` — affects all Excel tools
- `imageCompression.ts` — affects all image compression tools

---

## Part 7 — Tools That Need Fixes (Priority Order)

1. **PDF to PowerPoint** — Replace ZIP-of-PDFs with actual PPTX generation using rendered page images
2. **Google Drive to PDF** — Add honest limitation notice; cannot work client-side due to CORS
3. **Excel to Word** — Use installed `docx` npm package for real .docx output
4. **HTML to PDF** — Replace print dialog with jspdf-based actual PDF generation
