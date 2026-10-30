# Architecture rules

- Word-to-PDF renders DOCX locally with docx-preview inside an isolated iframe, then paginates raster output into PDF; this preserves tables and Unicode without site CSS interference or document uploads. Never replace it with plain-text extraction or claim full Microsoft Word fidelity/searchable output.
- PDF-to-Word preserves original pages as local PDF.js raster images in per-page DOCX sections and appends available editable text separately; never describe raster pages as editable layouts or imply OCR.