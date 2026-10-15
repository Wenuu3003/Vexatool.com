> 2026-10-15 update: 184 tests and app/build-config typechecks pass. Sitemap/robots fixes and editor text-entry focus fixes are drafted; see release-readiness-2026-10-15.md. This is not full 50-tool release approval.

# Tool validation status

Updated 2026-10-14. Draft PR #28 only; no live deployment. All 50 pages have now been exercised, but this is NOT full release approval. The latest 32 tools had desktop/mobile initial checks; selected workflows and follow-up results are recorded separately. Earlier counts described batches, not complete certification.

172 automated tests, production build and TypeScript checks passed after this batch. Main gaps: external background-removal model, Google export, real PDF editing/OCR, complex documents, broad failure cases and additional browser engines.

| Tool | Verified scope / remaining limitation |
|---|---|
| AadhaarPhotoResizer | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| AgeCalculator | Fixed-date 26-year result checked at both widths; invalid calculation clears prior result |
| BMICalculator | 70 kg / 175 cm = 22.9 and invalid-height result clearing checked at both widths |
| BackgroundRemover | Blocked — real model fetch hit test-environment certificate error; byte-mask normalization fixed and unit-tested, real segmentation output still unverified |
| Calculator | Keyboard 2 + 3 = 5 result confirmed |
| CompressImage | Selected browser flows passed at 390/1440px: valid output and corrupt rejection; downloaded format, dimensions and color independently verified |
| CompressPDF | Small valid PDF passthrough plus corrupt/encrypted rejection checked; large-file target-size quality cases remain pending |
| ConvertPDF | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| CurrencyConverter | Selected mocked success/failure browser flows passed; live provider accuracy unverified |
| EMICalculator | Selected component and browser arithmetic flows passed |
| EditPDF | Selected add-text export passed at 390/1440px; independent PDF inspection retained original and added text; OCR, replacement and complex layouts still pending |
| ExcelToPDF | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| ExcelToWord | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| FileCompressor | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| GSTCalculator | Selected component and browser arithmetic flows passed; legal tax rates not validated |
| GoogleDriveToPDF | Partial — invalid link rejected; Google authenticated export not exercised |
| GovtJobPhotoResizer | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| HTMLToPDF | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| ImageFormatConverter | Selected browser flows passed at 390/1440px: valid output and corrupt rejection; downloaded format, dimensions and color independently verified |
| ImageResizer | Selected browser flows passed at 390/1440px: valid output and corrupt rejection; downloaded format, dimensions and color independently verified |
| ImageToPDF | Selected browser flows passed at 390/1440px: valid multi-image output and corrupt rejection; PDF page dimensions, colors and order independently verified |
| JPGToPDF | Selected browser flows passed at 390/1440px: valid multi-image output and corrupt rejection; PDF page dimensions, colors and order independently verified |
| LoveCalculator | Names produced entertainment result; no claim of real relationship accuracy |
| MergePDF | Draft fix; selected 390px/1440px browser and independent PDF-output checks passed |
| OrganizePDF | Two-page unchanged export plus corrupt/encrypted rejection checked; reorder/delete interaction still pending |
| PDFToExcel | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| PDFToHTML | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| PDFToImage | Selected 390/1440px browser flows passed: two-page rendering/download, corrupt and protected input rejection; image format, pixel dimensions and colors verified |
| PDFToJPG | Selected 390/1440px browser flows passed: two-page rendering/download, corrupt and protected input rejection; image format, pixel dimensions and colors verified |
| PDFToPNG | Selected 390/1440px browser flows passed: two-page rendering/download, corrupt and protected input rejection; image format, pixel dimensions and colors verified |
| PDFToPowerPoint | Selected two-page image slide-pack export passed; produces ZIP of JPEGs, not native editable PPTX |
| PNGToPDF | Selected browser flows passed at 390/1440px: valid multi-image output and corrupt rejection; PDF page dimensions, colors and order independently verified |
| PPTToPDF | Draft false-success fix; extraction tests passed; faithful layout conversion unsupported |
| PassportPhotoResizer | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| PercentageCalculator | Selected component and browser arithmetic flows passed |
| PinCodeGenerator | Local random PIN UI output checked; live postal API accuracy and failure cases unverified |
| ProtectPDF | Selected browser encryption/download and independent password checks passed; broader cases pending |
| QRCodeGenerator | PNG generation round-tripped through scanner to exact input URL |
| QRCodeScanner | Uploaded QR decoded exact fixture URL; live-camera path unverified |
| RepairPDF | Valid PDF rewrite and corrupt/encrypted rejection checked; recovery of genuinely damaged but repairable PDFs unverified |
| RotatePDF | Draft fix; selected 390px/1440px browser and independent PDF-output checks passed |
| SignPDF | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| SplitPDF | Draft fix; selected 390px/1440px browser and independent PDF-output checks passed |
| UnitConverter | 1000 meters to 1 kilometer browser calculation passed |
| UnlockPDF | Selected correct-password workflow passed; unencrypted raster output visually compared; searchable text is lost; wrong/absent-password regression still pending |
| WatermarkPDF | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| WhatsAppDPResizer | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| WordCounter | Sample counts confirmed: 3 words, 17 characters, 1 sentence, 1 paragraph |
| WordToExcel | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |
| WordToPDF | Selected valid-file output at 390/1440px checked; see remaining-tools reports for exact fixtures and limitations |

## Latest fixes

- Photo shortcut pages now select their requested mode. Four fixture JPEG outputs matched preset dimensions and stayed below 20 KB.
- Corrupt DOCX files no longer fall through to raw-byte extraction in Word-to-PDF/Excel.
- Compress PDF validates input before the small-file passthrough.
- Organize, watermark, file compressor, repair and sign exports no longer ignore PDF encryption.
- Watermark image decoding uses bounded failure handling and URL cleanup.
- Age/BMI calculations clear stale results on invalid recalculation.
- Google export status describes opening a link rather than confirming a download.

## Evidence

- `remaining-tools-browser-results.json`: initial attempts, follow-up checks and negative inputs. Initial selector timeouts are superseded only where explicit follow-up results exist.
- `remaining-tools-output-results.json`: independently decoded output evidence.
- Browser checks use Chromium at 390px and 1440px, with external requests blocked. Background-model/network failures are not product success.
- PDF editor export was tested without modifications; it remains partial. PDF-to-PowerPoint exports an image ZIP; Word/PPT/HTML conversions remain simplified.
- Synthetic fixtures do not establish complex-layout fidelity, all format variants, accessibility, camera support or guaranteed target sizes.
