import { useState, useCallback } from "react";
import { Table, Download, FileSpreadsheet, Shield, CheckCircle, Settings, Trash2, Plus, X } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import ExcelJS from "exceljs";
import { readExcelFile, sheetToArray } from "@/lib/excelUtils";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

interface BatchFile {
  file: File;
  workbook: ExcelJS.Workbook | null;
  sheetNames: string[];
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
}

const ExcelToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);
  
  // Batch mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  
  // Clean sheet options
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [autoFitColumns, setAutoFitColumns] = useState(true);
  const [removeEmptyRows, setRemoveEmptyRows] = useState(true);
  const [oneSheetPerPage, setOneSheetPerPage] = useState(false);
  
  const { saveFileHistory } = useFileHistory();

  const processExcelFile = async (selectedFile: File): Promise<{ workbook: ExcelJS.Workbook; sheetNames: string[] } | null> => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const isValid = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    
    if (!isValid) {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel file (.xls, .xlsx) or CSV file (.csv)",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      const result = await readExcelFile(selectedFile);
      return result;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error reading Excel file:", error);
      }
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (batchMode) {
      const newBatchFiles: BatchFile[] = [];
      for (const selectedFile of Array.from(e.target.files)) {
        const result = await processExcelFile(selectedFile);
        if (result) {
          newBatchFiles.push({
            file: selectedFile,
            workbook: result.workbook,
            sheetNames: result.sheetNames,
            status: 'pending',
            progress: 0
          });
        }
      }
      setBatchFiles(prev => [...prev, ...newBatchFiles]);
    } else {
      const selectedFile = e.target.files[0];
      const result = await processExcelFile(selectedFile);
      if (result) {
        setFile(selectedFile);
        setWorkbook(result.workbook);
        setSheetNames(result.sheetNames);
        setSelectedSheets(result.sheetNames);
        setProgress(0);
      } else {
        toast({
          title: "Error reading file",
          description: "Failed to read the Excel file. Please try again.",
          variant: "destructive",
        });
      }
    }
    e.target.value = '';
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
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

  const convertWorkbookToPDF = useCallback(async (
    wb: ExcelJS.Workbook, 
    sheetsToConvert: string[],
    onProgress?: (p: number) => void
  ): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pageWidth = pageSize === "a4" 
      ? (orientation === "portrait" ? 595 : 842)
      : (orientation === "portrait" ? 612 : 792);
    const pageHeight = pageSize === "a4"
      ? (orientation === "portrait" ? 842 : 595)
      : (orientation === "portrait" ? 792 : 612);
    
    const margin = 40;
    const fontSize = 9;
    const headerFontSize = 12;
    const cellPadding = 4;
    
    let sheetsProcessed = 0;
    const totalSheets = sheetsToConvert.length;

    for (const sheetName of sheetsToConvert) {
      const ws = wb.getWorksheet(sheetName);
      if (!ws) continue;
      
      const jsonData = sheetToArray(ws);
      
      let cleanedData = jsonData;
      if (removeEmptyRows) {
        cleanedData = jsonData.filter(row => 
          row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
        );
      }
      
      if (cleanedData.length === 0) continue;
      
      const numCols = Math.max(...cleanedData.map(row => row.length), 1);
      const availableWidth = pageWidth - (margin * 2);

      // Compute column widths based on content
      const colWidths: number[] = [];
      if (autoFitColumns) {
        for (let col = 0; col < numCols; col++) {
          let maxWidth = 30;
          cleanedData.forEach(row => {
            const cellValue = String(row[col] ?? '');
            const textWidth = font.widthOfTextAtSize(cellValue.substring(0, 60), fontSize) + cellPadding * 2;
            if (textWidth > maxWidth) maxWidth = Math.min(textWidth, 200);
          });
          colWidths.push(maxWidth);
        }
        
        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        if (totalWidth > availableWidth) {
          const scale = availableWidth / totalWidth;
          for (let i = 0; i < colWidths.length; i++) {
            colWidths[i] = Math.max(colWidths[i] * scale, 25);
          }
        }
      } else {
        const colWidth = availableWidth / numCols;
        for (let i = 0; i < numCols; i++) colWidths.push(colWidth);
      }

      // Helper: wrap text into lines that fit within a column width
      const wrapText = (text: string, maxTextWidth: number): string[] => {
        if (!text) return [''];
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxTextWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines.length > 0 ? lines : [''];
      };

      // Store first row as header for repeat
      const headerRow = cleanedData.length > 0 ? cleanedData[0] : null;
      
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;
      
      // Sheet title
      page.drawText(sheetName, {
        x: margin,
        y: y,
        size: headerFontSize,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= headerFontSize + 10;

      const drawTableRow = (rowCells: (string | number | boolean | null)[], isHeader: boolean, currentPage: ReturnType<typeof pdfDoc.addPage>, startY: number): { page: ReturnType<typeof pdfDoc.addPage>; endY: number } => {
        let pg = currentPage;
        let yPos = startY;

        // Calculate row height based on wrapped text
        const wrappedCells: string[][] = [];
        let maxLines = 1;
        for (let col = 0; col < numCols; col++) {
          const cellValue = String(rowCells[col] ?? '');
          const maxTextWidth = colWidths[col] - cellPadding * 2;
          const lines = wrapText(cellValue, maxTextWidth);
          wrappedCells.push(lines);
          if (lines.length > maxLines) maxLines = lines.length;
        }

        const lineHeight = fontSize + 3;
        const rowHeight = maxLines * lineHeight + cellPadding * 2;

        // Check if row fits on current page
        if (yPos - rowHeight < margin) {
          pg = pdfDoc.addPage([pageWidth, pageHeight]);
          yPos = pageHeight - margin;

          // Repeat header on new page
          if (headerRow && !isHeader) {
            const headerResult = drawTableRow(headerRow, true, pg, yPos);
            pg = headerResult.page;
            yPos = headerResult.endY;
          }
        }

        // Draw cells
        let x = margin;
        for (let col = 0; col < numCols; col++) {
          const colWidth = colWidths[col];

          // Cell background
          pg.drawRectangle({
            x: x,
            y: yPos - rowHeight,
            width: colWidth,
            height: rowHeight,
            borderColor: rgb(0.75, 0.75, 0.75),
            borderWidth: 0.5,
            color: isHeader ? rgb(0.93, 0.95, 0.98) : undefined,
          });

          // Draw wrapped text lines
          const lines = wrappedCells[col];
          for (let li = 0; li < lines.length; li++) {
            pg.drawText(lines[li], {
              x: x + cellPadding,
              y: yPos - cellPadding - (li + 1) * lineHeight + 2,
              size: fontSize,
              font: isHeader ? boldFont : font,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
          x += colWidth;
        }

        return { page: pg, endY: yPos - rowHeight };
      };
      
      for (let rowIdx = 0; rowIdx < cleanedData.length; rowIdx++) {
        const row = cleanedData[rowIdx];
        const isHeader = rowIdx === 0;
        const result = drawTableRow(row, isHeader, page, y);
        page = result.page;
        y = result.endY;
      }
      
      sheetsProcessed++;
      if (onProgress) onProgress((sheetsProcessed / totalSheets) * 100);
      else setProgress((sheetsProcessed / totalSheets) * 100);
    }
    
    return await pdfDoc.save();
  }, [pageSize, orientation, autoFitColumns, removeEmptyRows, oneSheetPerPage]);

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
      const pdfBytes = await convertWorkbookToPDF(workbook, selectedSheets);
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
  }, [file, workbook, selectedSheets, convertWorkbookToPDF, saveFileHistory]);

  const handleBatchConvert = async () => {
    if (batchFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add Excel files to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;

    for (let i = 0; i < batchFiles.length; i++) {
      const bf = batchFiles[i];
      if (!bf.workbook) continue;

      setBatchFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ));

      try {
        const pdfBytes = await convertWorkbookToPDF(bf.workbook, bf.sheetNames, (p) => {
          setBatchFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: p } : f
          ));
        });

        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = bf.file.name.replace(/\.(xlsx|xls|csv)$/i, '.pdf');
        link.click();
        URL.revokeObjectURL(url);

        setBatchFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'done', progress: 100 } : f
        ));
        
        await saveFileHistory(bf.file.name, "excel", "excel-to-pdf-batch");
        successCount++;
      } catch {
        setBatchFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' } : f
        ));
      }
    }

    setIsProcessing(false);
    toast({
      title: "Batch Conversion Complete!",
      description: `Successfully converted ${successCount} of ${batchFiles.length} files.`,
    });
  };

  const handleReset = () => {
    setFile(null);
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheets([]);
    setBatchFiles([]);
    setProgress(0);
  };

  return (
    <>
      <CanonicalHead 
        title="Excel to PDF Converter – Batch Processing & Clean Sheets | VexaTool"
        description="Convert Excel to PDF online with batch processing and clean sheet options. Supports XLS, XLSX, and CSV."
        keywords="Excel to PDF, XLS to PDF, XLSX to PDF, CSV to PDF, batch Excel convert, spreadsheet to PDF"
      />
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
              Transform Excel spreadsheets into shareable PDF documents while maintaining layout and formatting. 
              Now with batch processing to convert multiple files at once.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "Batch processing" },
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

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Button 
              variant={!batchMode ? "default" : "outline"}
              onClick={() => { setBatchMode(false); handleReset(); }}
            >
              Single File
            </Button>
            <Button 
              variant={batchMode ? "default" : "outline"}
              onClick={() => { setBatchMode(true); handleReset(); }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Batch Processing
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-green-500/50 transition-colors">
            <input
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-upload"
              multiple={batchMode}
            />
            <label htmlFor="excel-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/10 flex items-center justify-center">
                <Table className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {batchMode ? "Click to add Excel files" : (file ? file.name : "Click to select Excel file")}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .xls, .xlsx, and .csv files {batchMode && "(multiple)"}
              </p>
            </label>
          </div>

          {/* Batch Files List */}
          {batchMode && batchFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Files to Convert ({batchFiles.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchFiles.map((bf, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <FileSpreadsheet className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{bf.file.name}</p>
                      <p className="text-xs text-muted-foreground">{bf.sheetNames.length} sheet(s)</p>
                      {bf.status === 'processing' && (
                        <Progress value={bf.progress} className="h-1 mt-1" />
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      bf.status === 'done' ? 'bg-green-100 text-green-700' :
                      bf.status === 'error' ? 'bg-red-100 text-red-700' :
                      bf.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {bf.status === 'done' ? 'Done' :
                       bf.status === 'error' ? 'Error' :
                       bf.status === 'processing' ? 'Converting...' :
                       'Pending'}
                    </span>
                    {bf.status === 'pending' && (
                      <Button variant="ghost" size="sm" onClick={() => removeBatchFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single File Selected */}
          {!batchMode && file && workbook && (
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
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

                {/* Sheet Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Select sheets to convert:</Label>
                    <Button variant="ghost" size="sm" onClick={handleSelectAllSheets}>
                      {selectedSheets.length === sheetNames.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sheetNames.map((name) => (
                      <Button
                        key={name}
                        variant={selectedSheets.includes(name) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSheetToggle(name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Converting sheets... {Math.round(progress)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Conversion Options */}
          {((batchMode && batchFiles.length > 0) || (!batchMode && file)) && (
            <div className="bg-card p-4 rounded-lg border border-border space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Conversion Options
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="portrait" className="font-normal">Portrait</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="landscape" id="landscape" />
                      <Label htmlFor="landscape" className="font-normal">Landscape</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoFitColumns" 
                    checked={autoFitColumns}
                    onCheckedChange={(checked) => setAutoFitColumns(checked as boolean)}
                  />
                  <Label htmlFor="autoFitColumns" className="text-sm">Auto-fit columns</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="removeEmptyRows" 
                    checked={removeEmptyRows}
                    onCheckedChange={(checked) => setRemoveEmptyRows(checked as boolean)}
                  />
                  <Label htmlFor="removeEmptyRows" className="text-sm">Remove empty rows</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="oneSheetPerPage" 
                    checked={oneSheetPerPage}
                    onCheckedChange={(checked) => setOneSheetPerPage(checked as boolean)}
                  />
                  <Label htmlFor="oneSheetPerPage" className="text-sm">One sheet per page</Label>
                </div>
              </div>
            </div>
          )}

          {/* Convert Button */}
          {((batchMode && batchFiles.length > 0) || (!batchMode && file && selectedSheets.length > 0)) && (
            <div className="text-center">
              <Button
                size="lg"
                onClick={batchMode ? handleBatchConvert : handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Converting..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    {batchMode ? `Convert ${batchFiles.length} Files` : `Convert ${selectedSheets.length} Sheet(s) to PDF`}
                  </>
                )}
              </Button>
            </div>
          )}

          <ToolSEOContent
            toolName="Excel to PDF Converter"
            whatIs="The Excel to PDF Converter is a free online tool that transforms Excel spreadsheets (.xls, .xlsx) and CSV files into professional PDF documents. It preserves your table formatting, allows you to select specific sheets, and provides options for page size, orientation, and layout. With batch processing support, you can convert multiple files at once."
            howToUse={[
              "Upload your Excel file (.xls, .xlsx, or .csv) by clicking the upload area.",
              "For multiple files, switch to 'Batch Processing' mode.",
              "Select which sheets you want to include in the PDF.",
              "Customize page size, orientation, and other options.",
              "Click 'Convert to PDF' to generate and download your PDF."
            ]}
            features={[
              "Batch processing for multiple Excel files",
              "Sheet selection - convert specific sheets only",
              "A4 and Letter page size options",
              "Portrait and landscape orientation",
              "Auto-fit columns for optimal layout",
              "Remove empty rows option",
              "100% client-side processing - no uploads"
            ]}
            safetyNote="Your Excel files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring complete privacy for your spreadsheet data."
            faqs={[
              { question: "Will my table formatting be preserved?", answer: "The tool maintains your table structure, headers, and cell data. For complex formatting like colors and merged cells, the PDF will show a clean representation of your data." },
              { question: "Can I convert multiple sheets to one PDF?", answer: "Yes! Select multiple sheets from your workbook, and they'll all be included in a single PDF document." },
              { question: "What's the difference between A4 and Letter size?", answer: "A4 (210 × 297 mm) is the international standard, while Letter (8.5 × 11 in) is common in North America. Choose based on your printing needs." },
              { question: "Is there a file size limit?", answer: "There's no strict limit, but very large files may take longer to process since everything happens in your browser." }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default ExcelToPDF;
