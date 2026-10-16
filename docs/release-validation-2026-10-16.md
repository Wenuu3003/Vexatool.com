# Draft validation — October 16, 2026

No live deployment or merge. This follows the October 15 report and supersedes only its basic background inference and OCR/replacement blockers.

## Confirmed selected workflows

- **Background removal, 390px and 1440px:** real Xenova/MODNet inference on the public Hugging Face portrait fixture; downloaded 360×450 RGBA PNGs independently decoded. Each contains 57,189 transparent, 8,615 opaque and 96,196 soft-alpha pixels. Visual inspection retained the subject; hair edges show some fringe, so perfect edges are not claimed.
- **Native PDF text replacement, both widths:** exported two-page PDFs independently contain `VEXA REPLACEMENT`. Replacement covers the old text with an overlay; this is not secure redaction.
- **Scanned English PDF OCR, both widths:** actual Tesseract recognition found fixture text, then replacement and download succeeded. Independent pypdf inspection confirms one page, `OCR VERIFIED`, and the retained source scan image in both files.
- **Accessibility:** mobile PDF page and editing-control sheets now have accessible titles, addressing the Radix missing-dialog-title warning observed during QA.

## Test transport and limits

The direct browser model request previously failed certificate validation in this environment. This follow-up uses actual upstream assets fetched through certificate-verified HTTPS curl and supplied to the browser; neither inference nor downloaded outputs are mocked. Certificate checks were never disabled. This proves selected inference/edit/export workflows, not normal deployed-browser CDN loading. Ads, analytics and remote font requests were blocked during QA.

The fixture is https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/portrait-of-woman_small.jpg. Synthetic PDFs cover simple English text, not arbitrary languages or complex layouts. Test results are recorded in release-validation-2026-10-16.json.

## Remaining acceptance work

- Authenticated Google document export needs an authorized accessible document/session.
- Organize PDF reorder/delete and Unlock PDF wrong/absent-password browser regressions now pass at both widths; see follow-up below.
- Native editable PPTX output is not implemented; current PDF-to-PowerPoint output is an explicitly described JPEG slide ZIP. Office/HTML conversion fidelity remains limited.
- Large and damaged PDFs, compression target/quality cases, camera QR scanning, additional browser engines and live postal/currency providers need targeted checks.
- Deployed asset delivery, live URL indexability and Search Console processing remain unverified. No all-50 release certification or ranking guarantee is implied.

## Organize / Unlock follow-up

Organize PDF previously depended on desktop drag-and-drop and did not implement deletion. Accessible earlier/later/delete buttons now support touch and keyboard use. Invalid drag indexes are ignored and deletion of the final page is disabled. Browser tests at 390px and 1440px moved page 2 before page 1, exported, then separately deleted page 1 and exported. Independent pypdf inspection confirmed [beta, alpha] order and the one-page beta-only output. No text/raster reconstruction is used for these operations.

Unlock PDF tests at both widths confirmed an absent password disables the button; submitting Enter reports Password required without producing a file. A wrong password reports Incorrect password and produces neither download nor success controls. The prior correct-password output test remains applicable.

Eight browser checks passed. 184 automated tests, production build and application TypeScript checks passed. Draft only; no deployment. Evidence: organize-unlock-validation-2026-10-16.json.
