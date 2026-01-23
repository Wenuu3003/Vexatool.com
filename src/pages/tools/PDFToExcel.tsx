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
import * as pdfjsLib from "pdfjs-dist";
import * as XLSX from "xlsx";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

// Set up PDF.js worker using the installed package version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
  const [extractedData, setExtractedData] = useState<string[][]>([]);
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
    }
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  const extractTextFromPDF = useCallback(async (file: File, onProgress?: (p: number) => void): Promise<string[][]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const allData: string[][] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      if (onProgress) onProgress((i / pdf.numPages) * 80);
      else setProgress((i / pdf.numPages) * 80);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const items = textContent.items as { str: string; transform: number[] }[];
      
      if (detectTables) {
        const rows: Map<number, { x: number; text: string }[]> = new Map();
        
        items.forEach((item) => {
          if (item.str.trim()) {
            const y = Math.round(item.transform[5] / 5) * 5;
            const x = item.transform[4];
            
            if (!rows.has(y)) {
              rows.set(y, []);
            }
            rows.get(y)!.push({ x, text: item.str.trim() });
          }
        });
        
        const sortedRows = Array.from(rows.entries())
          .sort((a, b) => b[0] - a[0]);
        
        sortedRows.forEach(([, cells]) => {
          cells.sort((a, b) => a.x - b.x);
          const rowData = cells.map(c => c.text);
          if (rowData.length > 0) {
            allData.push(rowData);
          }
        });
      } else {
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
      
      if (i < pdf.numPages) {
        allData.push([`--- Page ${i + 1} ---`]);
      }
    }
    
    return allData;
  }, [detectTables]);

  const createExcelFromData = useCallback((data: string[][], fileName: string) => {
    const wb = XLSX.utils.book_new();
    const maxCols = Math.max(...data.map(row => row.length), 1);
    const normalizedData = data.map(row => {
      const newRow = [...row];
      while (newRow.length < maxCols) {
        newRow.push("");
      }
      return newRow;
    });
    
    const ws = XLSX.utils.aoa_to_sheet(normalizedData);
    
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
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
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
      const data = await extractTextFromPDF(files[0]);
      setExtractedData(data);
      setProgress(90);

      const excelBuffer = createExcelFromData(data, files[0].name);
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
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

        const excelBuffer = createExcelFromData(data, bf.file.name);
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
    setExtractedData([]);
    setProgress(0);
    setPageCount(0);
  };

  return (
    <>
      <CanonicalHead 
        title="PDF to Excel Converter Online – Batch Processing & Secure | Mypdfs"
        description="Convert PDF to Excel online with batch processing. Extract tables from multiple PDFs at once. Free and secure."
        keywords="PDF to Excel, PDF to XLS, batch PDF convert, extract PDF tables, PDF to spreadsheet"
      />
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
                    {batchMode ? `Convert All (${batchFiles.length} files)` : "Convert to Excel"}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Trust & Privacy Section */}
          <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-muted-foreground">
              <strong className="text-foreground">Your Privacy Matters.</strong> All files are processed 
              locally in your browser. We do not store or analyze your documents.
            </AlertDescription>
          </Alert>

          <ToolSEOContent
            toolName="PDF to Excel Converter"
            whatIs="The PDF to Excel Converter is a powerful online tool designed to extract tabular data from PDF documents and convert it into editable Excel spreadsheet format (.xlsx). Now with batch processing support to convert multiple files at once."
            howToUse={[
              "Choose Single File or Batch Processing mode.",
              "Upload your PDF file(s) containing tables or data.",
              "Select conversion options (table detection, formatting).",
              "Click Convert to start the conversion.",
              "Download your Excel file(s) automatically."
            ]}
            features={[
              "Batch processing for multiple PDF files",
              "Smart table detection algorithm",
              "Auto-fit column widths",
              "Multi-page PDF support",
              "Progress tracking for each file",
              "Secure client-side processing"
            ]}
            safetyNote="All files are processed entirely in your browser. No data is uploaded to any server, ensuring complete privacy and security."
            faqs={[
              { question: "Can I convert multiple PDFs at once?", answer: "Yes! Use Batch Processing mode to add multiple PDF files and convert them all at once." },
              { question: "Is there a file size limit?", answer: "Processing happens in your browser, so very large files may be slow. For best results, keep files under 50MB." },
              { question: "Will my data be stored?", answer: "No. All processing happens locally in your browser. Your files never leave your device." }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default PDFToExcel;
