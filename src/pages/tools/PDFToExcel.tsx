import { useState, useCallback } from "react";
import { Table, Download, Upload, Info, FileSpreadsheet, Shield, CheckCircle, Clock, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

// Set up PDF.js worker using the installed package version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFToExcel = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<string[][]>([]);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [detectTables, setDetectTables] = useState(true);
  const { saveFileHistory } = useFileHistory();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setExtractedData([]);
    setProgress(0);
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error loading PDF:", error);
        }
        setPageCount(0);
      }
    } else {
      setPageCount(0);
    }
  };

  const extractTextFromPDF = useCallback(async (file: File): Promise<string[][]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const allData: string[][] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress((i / pdf.numPages) * 80);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items with positions
      const items = textContent.items as { str: string; transform: number[] }[];
      
      if (detectTables) {
        // Group text by Y position (rows)
        const rows: Map<number, { x: number; text: string }[]> = new Map();
        
        items.forEach((item) => {
          if (item.str.trim()) {
            const y = Math.round(item.transform[5] / 5) * 5; // Round to nearest 5 for grouping
            const x = item.transform[4];
            
            if (!rows.has(y)) {
              rows.set(y, []);
            }
            rows.get(y)!.push({ x, text: item.str.trim() });
          }
        });
        
        // Sort rows by Y position (descending - PDF coordinates)
        const sortedRows = Array.from(rows.entries())
          .sort((a, b) => b[0] - a[0]);
        
        // Convert to 2D array
        sortedRows.forEach(([, cells]) => {
          // Sort cells by X position
          cells.sort((a, b) => a.x - b.x);
          const rowData = cells.map(c => c.text);
          if (rowData.length > 0) {
            allData.push(rowData);
          }
        });
      } else {
        // Simple line-by-line extraction
        let currentLine = "";
        items.forEach((item) => {
          if (item.str.trim()) {
            currentLine += item.str + " ";
          }
        });
        if (currentLine.trim()) {
          allData.push([currentLine.trim()]);
        }
      }
      
      // Add page separator
      if (i < pdf.numPages) {
        allData.push([`--- Page ${i + 1} ---`]);
      }
    }
    
    return allData;
  }, [detectTables]);

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Extract data from PDF
      const data = await extractTextFromPDF(files[0]);
      setExtractedData(data);
      setProgress(90);

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      
      // Normalize rows to have consistent column count
      const maxCols = Math.max(...data.map(row => row.length), 1);
      const normalizedData = data.map(row => {
        const newRow = [...row];
        while (newRow.length < maxCols) {
          newRow.push("");
        }
        return newRow;
      });
      
      const ws = XLSX.utils.aoa_to_sheet(normalizedData);
      
      // Set column widths
      if (preserveFormatting) {
        const colWidths: { wch: number }[] = [];
        for (let i = 0; i < maxCols; i++) {
          let maxWidth = 10;
          normalizedData.forEach(row => {
            if (row[i] && row[i].length > maxWidth) {
              maxWidth = Math.min(row[i].length, 50);
            }
          });
          colWidths.push({ wch: maxWidth });
        }
        ws['!cols'] = colWidths;
      }
      
      XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = files[0].name.replace('.pdf', '.xlsx');
      link.click();
      URL.revokeObjectURL(url);
      
      setProgress(100);
      
      await saveFileHistory(files[0].name, "pdf", "pdf-to-excel");

      toast({
        title: "Conversion Complete!",
        description: `Successfully extracted ${data.length} rows to Excel.`,
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Conversion error:", error);
      }
      toast({
        title: "Conversion Error",
        description: "Failed to convert PDF to Excel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setExtractedData([]);
    setProgress(0);
    setPageCount(0);
  };

  return (
    <>
      <Helmet>
        <title>PDF to Excel Converter Online – Secure & Accurate | Mypdfs</title>
        <meta name="description" content="Convert PDF to Excel online. Extract tables, use OCR for scanned PDFs, and download clean Excel sheets securely. Free and easy PDF to Excel tool." />
        <meta name="keywords" content="PDF to Excel, PDF to XLS, extract PDF tables, PDF to spreadsheet, free PDF to Excel, convert PDF tables" />
        <link rel="canonical" href="https://mypdfs.lovable.app/pdf-to-excel" />
      </Helmet>
      <ToolLayout
        title="PDF to Excel"
        description="Convert PDF tables and data to Excel spreadsheets"
        icon={Table}
        colorClass="bg-green-500"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Introduction Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Extract PDF Tables to Excel
            </h2>
            <p className="text-muted-foreground">
              This PDF to Excel converter helps users extract tables and structured data from PDF documents 
              and convert them into editable Excel spreadsheets. It is designed for students, professionals, 
              accountants, and data analysts who need accurate and fast document conversion.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "No registration required" },
              { icon: Shield, text: "Secure file processing" },
              { icon: Upload, text: "Works on desktop & mobile" },
              { icon: Clock, text: "Fast conversion" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                <benefit.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* File Upload */}
          <FileUpload
            files={files}
            onFilesChange={handleFilesChange}
            colorClass="bg-green-500"
            accept=".pdf"
            multiple={false}
          />

          {files.length > 0 && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Table className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-foreground">{files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pageCount} page(s) • {(files[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Conversion Options */}
              <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                <h3 className="font-semibold text-foreground">Conversion Options</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="detectTables" 
                      checked={detectTables}
                      onCheckedChange={(checked) => setDetectTables(checked as boolean)}
                    />
                    <Label htmlFor="detectTables" className="text-sm">
                      Detect table structure
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="preserveFormatting" 
                      checked={preserveFormatting}
                      onCheckedChange={(checked) => setPreserveFormatting(checked as boolean)}
                    />
                    <Label htmlFor="preserveFormatting" className="text-sm">
                      Auto-fit column widths
                    </Label>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 80 ? "Extracting text..." : progress < 100 ? "Creating Excel file..." : "Complete!"}
                  </p>
                </div>
              )}

              {/* Preview */}
              {extractedData.length > 0 && !isProcessing && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Preview (first 10 rows)</h3>
                  <div className="overflow-auto max-h-48 text-sm">
                    <table className="w-full border-collapse">
                      <tbody>
                        {extractedData.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b border-border">
                            {row.map((cell, j) => (
                              <td key={j} className="p-2 text-muted-foreground">
                                {cell || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {extractedData.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      ... and {extractedData.length - 10} more rows
                    </p>
                  )}
                </div>
              )}

              {/* Convert Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Convert to Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Usage Guide */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">How to Convert PDF to Excel</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Upload your PDF file containing tables or structured data</li>
              <li>Select conversion options (table detection, formatting)</li>
              <li>Click "Convert to Excel" to start the conversion</li>
              <li>Preview extracted data before downloading</li>
              <li>Download your Excel file (.xlsx)</li>
            </ol>
          </div>

          {/* Trust & Privacy Section */}
          <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-muted-foreground">
              <strong className="text-foreground">Your Privacy Matters.</strong> We respect user privacy. 
              All uploaded files are processed locally in your browser and automatically deleted after processing. 
              We do not store or analyze your documents on any server.
            </AlertDescription>
          </Alert>

          {/* Use Cases */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Ideal for:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Financial reports and statements</li>
                <li>• Invoices and receipts</li>
                <li>• Data tables and statistics</li>
                <li>• Academic research data</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Supported:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Text-based PDF documents</li>
                <li>• Multi-page PDFs</li>
                <li>• Tables with multiple columns</li>
                <li>• Various PDF formats</li>
              </ul>
            </div>
          </div>

          <ToolSEOContent
            toolName="PDF to Excel Converter"
            whatIs="The PDF to Excel Converter is a powerful online tool designed to extract tabular data from PDF documents and convert it into editable Excel spreadsheet format (.xlsx). This tool uses advanced text extraction algorithms to identify table structures, detect columns and rows, and preserve the data organization when transferring to Excel. Whether you're working with financial reports, invoices, data tables, or any PDF containing structured information, this converter helps you transform static PDF content into a dynamic, editable spreadsheet that you can analyze, modify, and integrate into your workflows. The conversion process happens entirely in your browser, ensuring your sensitive documents never leave your device."
            howToUse={[
              "Click the upload area or drag and drop your PDF file containing tables or data you want to extract.",
              "Select your conversion options: enable table detection for structured data, or auto-fit column widths for better formatting.",
              "Click 'Convert to Excel' to begin the extraction and conversion process.",
              "Preview the extracted data to verify the table structure was correctly identified.",
              "Download your Excel file (.xlsx) which can be opened in Microsoft Excel, Google Sheets, or any spreadsheet application."
            ]}
            features={[
              "Automatic table structure detection that identifies rows and columns from PDF layout",
              "Multi-page PDF support with seamless data extraction across all pages",
              "Auto-fit column width option for properly formatted Excel output",
              "Real-time progress tracking during conversion process",
              "Data preview before download to verify extraction accuracy",
              "Local browser processing ensures complete privacy - no server uploads",
              "Compatible with Microsoft Excel, Google Sheets, LibreOffice, and other spreadsheet apps",
              "Free to use with no registration or account required"
            ]}
            safetyNote="Your PDF files are processed entirely in your browser using secure client-side JavaScript technology. No documents are uploaded to external servers, ensuring complete privacy and confidentiality of your data. The original PDF remains unchanged on your device, and both the source file and converted Excel spreadsheet stay under your complete control."
            faqs={[
              {
                question: "Does this tool work with scanned PDFs?",
                answer: "This tool works best with text-based PDFs where the text can be selected. For scanned PDFs (which are essentially images), OCR technology would be needed. For scanned documents, we recommend using dedicated OCR services before converting to Excel."
              },
              {
                question: "Will the table formatting be preserved?",
                answer: "The converter detects table structure by analyzing text positions and creates corresponding rows and columns in Excel. While the data organization is preserved, complex formatting like cell colors or merged cells may need manual adjustment in Excel."
              },
              {
                question: "What is the maximum file size I can convert?",
                answer: "Since processing happens in your browser, the limit depends on your device's memory. Most modern devices can handle PDFs up to 50MB. For very large files, consider splitting the PDF first."
              },
              {
                question: "Can I convert multiple PDFs at once?",
                answer: "Currently, files are converted one at a time for optimal accuracy. For multiple PDFs, convert each file separately. You can then combine the data in Excel if needed."
              },
              {
                question: "Why might some data appear in wrong columns?",
                answer: "Table detection works by grouping text based on position. PDFs with unusual layouts, merged cells, or inconsistent spacing may require manual adjustment after conversion. The preview feature helps you verify the extraction before downloading."
              }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default PDFToExcel;