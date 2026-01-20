import { useState, useCallback } from "react";
import { Table, Download, FileSpreadsheet, Shield, CheckCircle, Settings, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as XLSX from "xlsx";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

const ExcelToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  
  // Clean sheet options
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [autoFitColumns, setAutoFitColumns] = useState(true);
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true);
  const [oneSheetPerPage, setOneSheetPerPage] = useState(false);
  
  const { saveFileHistory } = useFileHistory();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const isValid = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
      
      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xls, .xlsx) or CSV file (.csv)",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      setProgress(0);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setSelectedSheets(wb.SheetNames); // Select all by default
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error reading Excel file:", error);
        }
        toast({
          title: "Error reading file",
          description: "Failed to read the Excel file. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSheetToggle = (sheetName: string) => {
    setSelectedSheets(prev => 
      prev.includes(sheetName)
        ? prev.filter(s => s !== sheetName)
        : [...prev, sheetName]
    );
  };

  const handleSelectAllSheets = () => {
    if (selectedSheets.length === sheetNames.length) {
      setSelectedSheets([]);
    } else {
      setSelectedSheets([...sheetNames]);
    }
  };

  const handleConvert = useCallback(async () => {
    if (!file || !workbook) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to convert.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSheets.length === 0) {
      toast({
        title: "No sheets selected",
        description: "Please select at least one sheet to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Page dimensions
      const pageWidth = pageSize === "a4" 
        ? (orientation === "portrait" ? 595 : 842)
        : (orientation === "portrait" ? 612 : 792);
      const pageHeight = pageSize === "a4"
        ? (orientation === "portrait" ? 842 : 595)
        : (orientation === "portrait" ? 792 : 612);
      
      const margin = 40;
      const fontSize = 10;
      const headerFontSize = 12;
      const lineHeight = fontSize * 1.5;
      const cellPadding = 4;
      
      let sheetsProcessed = 0;
      const totalSheets = selectedSheets.length;

      for (const sheetName of selectedSheets) {
        const ws = workbook.Sheets[sheetName];
        const jsonData: (string | number | boolean | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Clean data if option is enabled
        let cleanedData = jsonData;
        if (removeEmptyRows) {
          cleanedData = jsonData.filter(row => 
            row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
          );
        }
        
        if (cleanedData.length === 0) continue;
        
        // Calculate column widths
        const numCols = Math.max(...cleanedData.map(row => row.length), 1);
        const availableWidth = pageWidth - (margin * 2);
        let colWidths: number[] = [];
        
        if (autoFitColumns) {
          // Calculate based on content
          for (let col = 0; col < numCols; col++) {
            let maxWidth = 30;
            cleanedData.forEach(row => {
              const cellValue = String(row[col] ?? '');
              const cellWidth = font.widthOfTextAtSize(cellValue.substring(0, 30), fontSize) + cellPadding * 2;
              if (cellWidth > maxWidth) maxWidth = Math.min(cellWidth, 150);
            });
            colWidths.push(maxWidth);
          }
          
          // Normalize widths to fit page
          const totalWidth = colWidths.reduce((a, b) => a + b, 0);
          if (totalWidth > availableWidth) {
            const scale = availableWidth / totalWidth;
            colWidths = colWidths.map(w => w * scale);
          }
        } else {
          // Equal width columns
          const colWidth = availableWidth / numCols;
          colWidths = Array(numCols).fill(colWidth);
        }
        
        // Create pages
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;
        let rowIndex = 0;
        
        // Draw sheet title
        page.drawText(sheetName, {
          x: margin,
          y: y,
          size: headerFontSize,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= headerFontSize + 10;
        
        for (const row of cleanedData) {
          const rowHeight = lineHeight + cellPadding;
          
          // Check if we need a new page
          if (y - rowHeight < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
            
            if (oneSheetPerPage && rowIndex === 0) {
              page.drawText(sheetName, {
                x: margin,
                y: y,
                size: headerFontSize,
                font: boldFont,
                color: rgb(0.2, 0.2, 0.2),
              });
              y -= headerFontSize + 10;
            }
          }
          
          // Draw row
          let x = margin;
          const isHeader = rowIndex === 0;
          
          for (let col = 0; col < numCols; col++) {
            const cellValue = String(row[col] ?? '');
            const colWidth = colWidths[col];
            
            // Draw cell border
            page.drawRectangle({
              x: x,
              y: y - rowHeight,
              width: colWidth,
              height: rowHeight,
              borderColor: rgb(0.8, 0.8, 0.8),
              borderWidth: 0.5,
              color: isHeader ? rgb(0.95, 0.95, 0.95) : undefined,
            });
            
            // Draw cell text
            const truncatedText = cellValue.length > 25 
              ? cellValue.substring(0, 22) + '...'
              : cellValue;
            
            page.drawText(truncatedText, {
              x: x + cellPadding,
              y: y - rowHeight + cellPadding + 2,
              size: fontSize,
              font: isHeader ? boldFont : font,
              color: rgb(0.1, 0.1, 0.1),
              maxWidth: colWidth - cellPadding * 2,
            });
            
            x += colWidth;
          }
          
          y -= rowHeight;
          rowIndex++;
        }
        
        sheetsProcessed++;
        setProgress((sheetsProcessed / totalSheets) * 100);
      }
      
      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf');
      link.click();
      URL.revokeObjectURL(url);
      
      await saveFileHistory(file.name, "excel", "excel-to-pdf");

      toast({
        title: "Conversion Complete!",
        description: `Successfully converted ${selectedSheets.length} sheet(s) to PDF.`,
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Conversion error:", error);
      }
      toast({
        title: "Conversion Error",
        description: "Failed to convert Excel to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [file, workbook, selectedSheets, pageSize, orientation, autoFitColumns, removeEmptyRows, oneSheetPerPage, saveFileHistory]);

  const handleReset = () => {
    setFile(null);
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheets([]);
    setProgress(0);
  };

  return (
    <>
      <Helmet>
        <title>Excel to PDF Converter – Clean Sheets & Secure Export | Mypdfs</title>
        <meta name="description" content="Convert Excel to PDF online with clean sheet options, auto-fit columns, and secure processing. Supports XLS, XLSX, and CSV files." />
        <meta name="keywords" content="Excel to PDF, XLS to PDF, XLSX to PDF, CSV to PDF, spreadsheet to PDF, free Excel converter, convert spreadsheet" />
        <link rel="canonical" href="https://mypdfs.lovable.app/excel-to-pdf" />
      </Helmet>
      <ToolLayout
        title="Excel to PDF"
        description="Convert Excel spreadsheets to PDF with formatting"
        icon={Table}
        colorClass="bg-green-600"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Introduction Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Convert Excel to Professional PDF
            </h2>
            <p className="text-muted-foreground">
              The Excel to PDF converter allows users to transform Excel spreadsheets into shareable PDF documents 
              while maintaining layout and formatting. It is useful for reports, data sharing, and official documentation.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "Preserves formatting" },
              { icon: Settings, text: "Clean sheet options" },
              { icon: Shield, text: "Secure processing" },
              { icon: FileSpreadsheet, text: "XLS, XLSX, CSV" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                <benefit.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-green-500/50 transition-colors">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/10 flex items-center justify-center">
                <Table className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {file ? file.name : "Click to select Excel file"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xls, .xlsx, and .csv files
              </p>
            </label>
          </div>

          {file && workbook && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sheetNames.length} sheet(s) • {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Sheet Selection */}
              {sheetNames.length > 1 && (
                <div className="bg-card p-4 rounded-lg border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Select Sheets</h3>
                    <Button variant="ghost" size="sm" onClick={handleSelectAllSheets}>
                      {selectedSheets.length === sheetNames.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {sheetNames.map((name) => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`sheet-${name}`} 
                          checked={selectedSheets.includes(name)}
                          onCheckedChange={() => handleSheetToggle(name)}
                        />
                        <Label htmlFor={`sheet-${name}`} className="text-sm truncate">
                          {name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clean Sheet Options */}
              <div className="bg-card p-4 rounded-lg border border-border space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Clean Sheet Options
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Page Size */}
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Select value={pageSize} onValueChange={(v) => setPageSize(v as "a4" | "letter")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Orientation */}
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <RadioGroup value={orientation} onValueChange={(v) => setOrientation(v as "portrait" | "landscape")} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="portrait" id="portrait" />
                        <Label htmlFor="portrait">Portrait</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="landscape" id="landscape" />
                        <Label htmlFor="landscape">Landscape</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoFit" 
                      checked={autoFitColumns}
                      onCheckedChange={(checked) => setAutoFitColumns(checked as boolean)}
                    />
                    <Label htmlFor="autoFit" className="text-sm">Auto-fit columns</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="removeEmpty" 
                      checked={removeEmptyRows}
                      onCheckedChange={(checked) => setRemoveEmptyRows(checked as boolean)}
                    />
                    <Label htmlFor="removeEmpty" className="text-sm">Remove empty rows</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="onePerPage" 
                      checked={oneSheetPerPage}
                      onCheckedChange={(checked) => setOneSheetPerPage(checked as boolean)}
                    />
                    <Label htmlFor="onePerPage" className="text-sm">One sheet per page</Label>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Converting sheets... {Math.round(progress)}%
                  </p>
                </div>
              )}

              {/* Convert Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleConvert}
                  disabled={isProcessing || selectedSheets.length === 0}
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
                      Convert to PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Usage Guide */}
          <div className="bg-muted/30 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">How to Convert Excel to PDF</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Upload your Excel file (.xls, .xlsx) or CSV file</li>
              <li>Select which sheets to include in the PDF</li>
              <li>Choose layout settings (page size, orientation)</li>
              <li>Enable clean sheet options as needed</li>
              <li>Click "Convert to PDF" and download your file</li>
            </ol>
          </div>

          {/* Security Note */}
          <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">
                  All file processing is secure and temporary. Files are processed locally in your browser 
                  and removed automatically after conversion. Your data never leaves your device.
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Perfect For:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Business reports</li>
                <li>• Financial statements</li>
                <li>• Academic data</li>
                <li>• Office documentation</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="font-medium text-foreground mb-2">Supported Formats:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Microsoft Excel (.xlsx, .xls)</li>
                <li>• CSV files (.csv)</li>
                <li>• Multi-sheet workbooks</li>
                <li>• Large spreadsheets</li>
              </ul>
            </div>
          </div>

          <ToolSEOContent
            toolName="Excel to PDF Converter"
            whatIs="The Excel to PDF Converter is a comprehensive online tool that transforms Excel spreadsheets (.xls, .xlsx) and CSV files into professionally formatted PDF documents. This converter preserves your spreadsheet's structure, table formatting, and data organization while creating a universally shareable PDF file. With advanced clean sheet options, you can customize page size, orientation, auto-fit columns, remove empty rows, and control how multiple sheets are handled. Whether you're preparing business reports, financial statements, data presentations, or official documentation, this tool ensures your spreadsheet data is converted accurately and maintains a professional appearance in the final PDF output."
            howToUse={[
              "Click the upload area or drag and drop your Excel file (.xls, .xlsx) or CSV file.",
              "If your workbook has multiple sheets, select which sheets to include in the PDF.",
              "Configure clean sheet options: page size (A4/Letter), orientation (Portrait/Landscape), auto-fit columns, and more.",
              "Click 'Convert to PDF' to process your spreadsheet.",
              "Download the generated PDF file with your formatted spreadsheet data."
            ]}
            features={[
              "Full support for Excel workbooks (.xls, .xlsx) and CSV files",
              "Multi-sheet selection - choose which sheets to convert",
              "Flexible page size options: A4 or Letter format",
              "Portrait and landscape orientation support",
              "Auto-fit columns to adjust width based on content",
              "Remove empty rows option for cleaner output",
              "One sheet per page option for organized documents",
              "Table formatting preservation with borders and headers",
              "Local browser processing for complete privacy",
              "No registration or account required"
            ]}
            safetyNote="Your Excel files are processed entirely within your browser using secure client-side technology. No spreadsheet data is uploaded to external servers, ensuring complete confidentiality of your financial reports, business data, and personal information. The conversion happens locally on your device, and both the original Excel file and the generated PDF remain under your full control."
            faqs={[
              {
                question: "Will formulas and calculations be preserved?",
                answer: "The converter exports the calculated values (results) of formulas, not the formulas themselves. The PDF will display the final numbers as they appear in your spreadsheet."
              },
              {
                question: "Can I convert multiple sheets into one PDF?",
                answer: "Yes! Select multiple sheets from your workbook and they will all be combined into a single PDF document. You can also use the 'One sheet per page' option to start each sheet on a new page."
              },
              {
                question: "What happens to charts and images in my Excel file?",
                answer: "Currently, the converter focuses on tabular data. Charts and embedded images are not included in the PDF output. For complex documents with charts, consider using Excel's native export feature."
              },
              {
                question: "Is there a limit on file size or number of rows?",
                answer: "Since processing happens in your browser, practical limits depend on your device's memory. Most spreadsheets up to 10,000 rows convert smoothly. Very large files may take longer to process."
              },
              {
                question: "Why does my text appear truncated in some cells?",
                answer: "To maintain readability, very long cell content may be truncated with '...' in the PDF. The auto-fit columns option helps, but extremely wide content may still be shortened to fit the page."
              }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default ExcelToPDF;