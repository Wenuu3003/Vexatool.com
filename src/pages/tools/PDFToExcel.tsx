import { useState, useCallback } from "react";
import { Table, Download, Upload, Info, FileSpreadsheet, Shield, CheckCircle, Clock, Trash2, Plus, X } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PDFDocument } from "pdf-lib";
import { extractPDFToTableData } from "@/lib/pdfTableExtractor";
import ExcelJS from "exceljs";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

interface BatchFile {
  file: File;
  pageCount: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
}

const PDFToExcel = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<{ sheets: { name: string; data: string[][] }[] } | null>(null);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [detectTables, setDetectTables] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const { saveFileHistory } = useFileHistory();

  const handleFilesChange = async (newFiles: File[]) => {
    if (batchMode) {
      // Batch mode - add multiple files
      const newBatchFiles: BatchFile[] = [];
      for (const file of newFiles) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          newBatchFiles.push({
            file,
            pageCount: pdfDoc.getPageCount(),
            status: 'pending',
            progress: 0
          });
        } catch {
          toast({
            title: "Error loading file",
            description: `Failed to load ${file.name}`,
            variant: "destructive",
          });
        }
      }
      setBatchFiles(prev => [...prev, ...newBatchFiles]);
    } else {
      // Single file mode
      setFiles(newFiles);
      setExtractedData(null);
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
    }
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  const extractTextFromPDF = useCallback(async (file: File, onProgress?: (p: number) => void): Promise<{ sheets: { name: string; data: string[][] }[] }> => {
    const result = await extractPDFToTableData(file, (p) => {
      if (onProgress) onProgress(p);
      else setProgress(p);
    });
    return result;
  }, []);

  const createExcelFromSheets = useCallback(async (sheets: { name: string; data: string[][] }[]): Promise<ArrayBuffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VexaTool';
    workbook.created = new Date();

    for (const sheet of sheets) {
      const ws = workbook.addWorksheet(sheet.name);
      const maxCols = Math.max(...sheet.data.map(r => r.length), 1);

      for (const row of sheet.data) {
        const padded = [...row];
        while (padded.length < maxCols) padded.push('');
        ws.addRow(padded);
      }

      // Bold first row as header
      if (sheet.data.length > 0) {
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true };
        headerRow.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
        });
      }

      // Auto-fit columns
      if (preserveFormatting) {
        for (let i = 1; i <= maxCols; i++) {
          const col = ws.getColumn(i);
          let maxWidth = 10;
          col.eachCell({ includeEmpty: false }, cell => {
            const len = String(cell.value ?? '').length;
            if (len > maxWidth) maxWidth = Math.min(len, 50);
          });
          col.width = maxWidth + 2;
        }
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ArrayBuffer;
  }, [preserveFormatting]);

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
      const result = await extractTextFromPDF(files[0]);
      setExtractedData(result);
      setProgress(90);

      const excelBuffer = await createExcelFromSheets(result.sheets);
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = files[0].name.replace('.pdf', '.xlsx');
      link.click();
      URL.revokeObjectURL(url);
      
      setProgress(100);
      await saveFileHistory(files[0].name, "pdf", "pdf-to-excel");

      const totalRows = result.sheets.reduce((sum, s) => sum + s.data.length, 0);
      toast({
        title: "Conversion Complete!",
        description: `Successfully extracted ${totalRows} rows across ${result.sheets.length} sheet(s) to Excel.`,
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

  const handleBatchConvert = async () => {
    if (batchFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please add PDF files to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;

    for (let i = 0; i < batchFiles.length; i++) {
      const bf = batchFiles[i];
      setBatchFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'processing' } : f
      ));

      try {
        const data = await extractTextFromPDF(bf.file, (p) => {
          setBatchFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: p } : f
          ));
        });

        const excelBuffer = await createExcelFromSheets(data.sheets);
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = bf.file.name.replace('.pdf', '.xlsx');
        link.click();
        URL.revokeObjectURL(url);

        setBatchFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'done', progress: 100 } : f
        ));
        
        await saveFileHistory(bf.file.name, "pdf", "pdf-to-excel-batch");
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
    setFiles([]);
    setBatchFiles([]);
    setExtractedData(null);
    setProgress(0);
    setPageCount(0);
  };

  return (
    <>
      <CanonicalHead 
        title="Convert PDF to Excel Online Free – Fast & Accurate | VexaTool"
        description="Free PDF to Excel converter online. Extract tables from PDF to editable Excel spreadsheets instantly. Batch processing, no signup, 100% secure."
        keywords="PDF to Excel online, convert PDF to Excel free, free PDF to XLS converter, extract tables from PDF, PDF to spreadsheet, PDF to Excel India"
      />
      <ToolLayout
        title="PDF to Excel Converter Online Free"
        description="Extract tables and data from PDF documents into editable Excel spreadsheets — free, fast & accurate"
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
              and convert them into editable Excel spreadsheets. Supports batch processing for multiple files.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "Batch processing" },
              { icon: Shield, text: "Secure processing" },
              { icon: Upload, text: "Multiple files" },
              { icon: Clock, text: "Fast conversion" },
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
          <FileUpload
            files={batchMode ? [] : files}
            onFilesChange={handleFilesChange}
            colorClass="bg-green-500"
            accept=".pdf"
            multiple={batchMode}
          />

          {/* Batch Files List */}
          {batchMode && batchFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Files to Convert ({batchFiles.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchFiles.map((bf, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                    <Table className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{bf.file.name}</p>
                      <p className="text-xs text-muted-foreground">{bf.pageCount} pages</p>
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

          {/* Single File Mode */}
          {!batchMode && files.length > 0 && (
            <div className="space-y-4">
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

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 80 ? "Extracting text..." : progress < 100 ? "Creating Excel file..." : "Complete!"}
                  </p>
                </div>
              )}

              {extractedData && extractedData.sheets.length > 0 && !isProcessing && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-3">Preview (first 10 rows)</h3>
                  <div className="overflow-auto max-h-48 text-sm">
                    <table className="w-full border-collapse">
                      <tbody>
                        {extractedData.sheets[0].data.slice(0, 10).map((row, i) => (
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
                </div>
              )}
            </div>
          )}

          {/* Conversion Options */}
          {((batchMode && batchFiles.length > 0) || (!batchMode && files.length > 0)) && (
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
          )}

          {/* Convert Button */}
          {((batchMode && batchFiles.length > 0) || (!batchMode && files.length > 0)) && (
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
                    {batchMode ? `Convert ${batchFiles.length} Files` : "Convert to Excel"}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Privacy Note */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-muted-foreground">
              Your files are processed securely in your browser. No data is uploaded to any server.
            </AlertDescription>
          </Alert>

          <ToolSEOContent
            toolName="PDF to Excel Converter"
            whatIs="The PDF to Excel Converter is a free online tool that extracts tables and structured data from PDF documents and converts them into editable Excel spreadsheets (.xlsx format). This tool is essential for users who need to analyze, edit, or reuse data locked in PDF files. With batch processing support, you can convert multiple PDF files at once, saving time on repetitive tasks."
            howToUse={[
              "Upload your PDF file by clicking the upload area or drag and drop.",
              "For multiple files, switch to 'Batch Processing' mode.",
              "Enable 'Detect table structure' for better data extraction.",
              "Click 'Convert to Excel' to start the conversion.",
              "Your Excel file will download automatically."
            ]}
            features={[
              "Batch processing for multiple PDFs",
              "Smart table detection algorithm",
              "Auto-fit column widths option",
              "Preview extracted data before download",
              "100% client-side processing - no uploads",
              "Supports all PDF versions"
            ]}
            safetyNote="Your PDF files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring complete privacy for your documents."
            faqs={[
              { question: "How accurate is the table extraction?", answer: "The tool uses advanced text position analysis to detect table structures. Accuracy is highest for well-formatted PDFs with clear grid lines or consistent spacing." },
              { question: "Can I convert scanned PDFs?", answer: "This tool extracts text from digital PDFs. Scanned documents (images) require OCR processing first." },
              { question: "Is there a file size limit?", answer: "There's no strict limit, but larger files may take longer to process as everything happens in your browser." },
              { question: "What Excel format is generated?", answer: "The tool generates .xlsx files (Excel 2007+), which are compatible with Microsoft Excel, Google Sheets, and LibreOffice Calc." }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default PDFToExcel;
