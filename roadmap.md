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
- Tell the user these changes reach the live site only on the next publish.
