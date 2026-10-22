# Follow-up validation — 2026-10-22

Code baseline: 14ef1a54c995adbef7dd8f5f01bff1bfecaa9b2d.
This supplements pending-tool-validation-2026-10-21.md. No application code changed in this follow-up.

## Completed checks

| Area | Evidence | Scope |
| --- | --- | --- |
| Compress PDF | 2,821,348-byte synthetic scanned PDF, 8 pages, 500 KB target produced 153,790-byte PDF at both 390px and 1440px widths | Both outputs independently parsed with pypdf strict mode and retained 8 pages. First-page rendering inspected: heading readable but softened; compression is lossy, not a universal quality guarantee. |
| QR camera decoding | Real canvas MediaStream supplied through simulated getUserMedia; QR decoded from video frames, success shown, track ended | Passed at 390px and 1440px. This exercises video decoding and cleanup, not a physical camera. |
| Postal deployed backend | POST to deployed india-postal function with query 600001 returned HTTP 200 and 7 matching PIN results | One live backend query; not verification of all directory entries. |

Prior batch: 190 automated tests, build and typecheck passed. Browser checks covered PIN errors/stale requests/bulk generation, camera permission cancellation, Google export URL construction, and damaged-xref PDF recovery at mobile and desktop widths.

## External checks still open

- Background Remover normal model download: attempted with production preview at 390px. Hugging Face request failed with ERR_CERT_AUTHORITY_INVALID in this environment; UI surfaced a fetch failure. This run did not pass. Do not infer that every production user sees this environment-specific certificate failure. Earlier verified-asset inference does not replace normal CDN delivery verification.
- Physical phone camera: permission, focus and scan under real lighting still need a device check.
- Google Drive export: authenticated private-file export requires an authorized Google session/file. URL construction was tested; private export was not.
- Complex Office document layout and broad image quality are not exhaustively certified by these fixtures.
- Exam-specific photo requirement claims remain a separate content verification task. Shared resizer links do not establish official UPSC specifications.

## Release status

Link fixes (93170ea) and PIN/QR fixes (14ef1a5) are in GitHub main. This report does not publish Lovable or certify that the live site contains those commits. User-managed publication and live smoke checks remain necessary.
