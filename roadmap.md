# Roadmap

## Done
- Renamed the Utility category label to "Online Utility Tools" everywhere it is shown or described: mega menu, tool cards category list, breadcrumb, "Back to" button, category page heading and head tags, route metadata, Unit Converter page label, llms.txt. URL `/utility-tools` left unchanged on purpose.
- Folded the Bing opportunity queries that the existing Image Format Converter genuinely handles into its search text (title, description, keywords on the page and in the sitemap/route registry and tool registry): `jpeg to jpg`, `png to jpg`, `webp to jpg`, `jpg to png`, `jpg to webp`, `webp to png`.
- Verified in the live preview: mega menu and breadcrumb show the new name, converter page title reads "JPEG to JPG, PNG to JPG, WebP to JPG Converter | VexaTool". Tests 194/194, build OK.

## Deliberately left out (needs a decision, not a code edit)
- `open jpg file`, `open jpeg file`, `open pdf file` — no viewer tool exists; claiming them would be a false page description.
- `mp4 to mp3` — no audio/video conversion tool built.
- `avif to jpg`, `jfif to jpg` — the converter only advertises JPG, PNG and WebP, so not claimed.
- `pdf压缩` — Chinese query on an English page; would be irrelevant keyword stuffing.

## Open
- Verify Google Drive-to-PDF anonymous browser download (blocked: supplied document has only owner/writer permissions, no public sharing). Link handling and independently retrieved authorized 2-page PDF verified; updated audit delivered.

## Completed Word-to-PDF repair and tool audit
- Repaired local DOCX rendering; supplied table/logo document and mobile download verified without redesigning the interface or changing ads.
- All 49 tool pages rendered; 48 basic workflows verified with explicit limitations, Google Drive export unverified. 197 tests passed; supervised build OK. Delivered the 49-tool audit report in Files.
