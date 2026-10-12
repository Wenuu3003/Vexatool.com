# Tool validation status

Changes are in a draft branch, not deployed. Automated test counts do not imply all tools work.

| Tool | Status |
|---|---|
| AadhaarPhotoResizer | Pending — real-input/output verification not completed |
| AgeCalculator | Pending — real-input/output verification not completed |
| BMICalculator | Pending — real-input/output verification not completed |
| BackgroundRemover | Pending — real-input/output verification not completed |
| Calculator | Pending — real-input/output verification not completed |
| CompressImage | Pending — real-input/output verification not completed |
| CompressPDF | Pending — real-input/output verification not completed |
| ConvertPDF | Pending — real-input/output verification not completed |
| CurrencyConverter | Draft fix: no hardcoded fallback, missing-rate rejection and amount/date tests; browser/API integration pending |
| EMICalculator | Draft numeric/stale-result fixes; component input/output tests passed; browser and wider cases pending |
| EditPDF | Pending — real-input/output verification not completed |
| ExcelToPDF | Pending — real-input/output verification not completed |
| ExcelToWord | Pending — real-input/output verification not completed |
| FileCompressor | Pending — real-input/output verification not completed |
| GSTCalculator | Draft numeric/stale-result fixes; component input/output tests passed; browser and wider cases pending |
| GoogleDriveToPDF | Pending — real-input/output verification not completed |
| GovtJobPhotoResizer | Pending — real-input/output verification not completed |
| HTMLToPDF | Pending — real-input/output verification not completed |
| ImageFormatConverter | Pending — real-input/output verification not completed |
| ImageResizer | Pending — real-input/output verification not completed |
| ImageToPDF | Pending — real-input/output verification not completed |
| JPGToPDF | Pending — real-input/output verification not completed |
| LoveCalculator | Pending — real-input/output verification not completed |
| MergePDF | Pending — real-input/output verification not completed |
| OrganizePDF | Pending — real-input/output verification not completed |
| PDFToExcel | Pending — real-input/output verification not completed |
| PDFToHTML | Pending — real-input/output verification not completed |
| PDFToImage | Pending — real-input/output verification not completed |
| PDFToJPG | Pending — real-input/output verification not completed |
| PDFToPNG | Pending — real-input/output verification not completed |
| PDFToPowerPoint | Pending — real-input/output verification not completed |
| PNGToPDF | Pending — real-input/output verification not completed |
| PPTToPDF | Draft false-success fix; extraction tests passed; faithful layout conversion unsupported |
| PassportPhotoResizer | Pending — real-input/output verification not completed |
| PercentageCalculator | Draft numeric/stale-result fixes; component input/output tests passed; browser and wider cases pending |
| PinCodeGenerator | Pending — real-input/output verification not completed |
| ProtectPDF | Draft fix; password/output tests passed; browser validation blocked |
| QRCodeGenerator | Pending — real-input/output verification not completed |
| QRCodeScanner | Pending — real-input/output verification not completed |
| RepairPDF | Pending — real-input/output verification not completed |
| RotatePDF | Pending — real-input/output verification not completed |
| SignPDF | Pending — real-input/output verification not completed |
| SplitPDF | Pending — real-input/output verification not completed |
| UnitConverter | Pending — real-input/output verification not completed |
| UnlockPDF | Pending — real-input/output verification not completed |
| WatermarkPDF | Pending — real-input/output verification not completed |
| WhatsAppDPResizer | Pending — real-input/output verification not completed |
| WordCounter | Pending — real-input/output verification not completed |
| WordToExcel | Pending — real-input/output verification not completed |
| WordToPDF | Pending — real-input/output verification not completed |

## Latest PPTX repair

Rejects legacy PPT, corrupt archives, missing presentation/slides, malformed slide XML and archives without supported content. Removes placeholder success paths; decodes text XML with DOMParser. Seven new extraction tests pass. UI states that output is simplified and may omit layout/content. Full renderer fidelity, slide ordering from presentation relationships, overflow/multiple-image layout and broad real-world files remain unverified.

Browser validation is blocked by invalid/truncated Playwright Chromium downloads, including a second attempt with an older browser build. No claim of mobile/desktop completion is made.

## Currency converter repair

Removed hardcoded rates mislabeled as cached. Retrieval failure clears results and shows unavailable. Provider date replaces local fetch time; missing currencies never default to 1. Amount changes calculate synchronously without stale timeout results; empty/nonfinite/negative amounts are rejected, zero allowed. Request timeout and unmount/refresh cancellation added. Pure parser/conversion tests pass; live API and browser integration remain pending.

## Calculator batch

Percentage, GST and EMI now clear results when inputs change or a calculation fails, and reject nonfinite/overflow calculations. EMI caps tenure at 1200 whole months to prevent an unbounded schedule and uses a numerically stable formula. Six actual React component tests cover 63% of 21500, overflow, GST 18% amount/supply changes, cleared inputs, zero-interest EMI and 12% EMI. These checks validate calculations for selected inputs only, not current tax-rate policy or full end-to-end/browser behavior.
