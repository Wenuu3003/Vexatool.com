import { useState } from "react";
import { FileSpreadsheet, Download, FileText, Loader2, Trash2, Shield, Table } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { parseDocxContent, extractDocText } from "@/lib/docxTableParser";
import ExcelJS from "exceljs";

const WordToExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const valid = ['.doc', '.docx', '.txt'].some(ext => selectedFile.name.toLowerCase().endsWith(ext));
      if (valid) {
        setFile(selectedFile);
        setProgress(0);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a Word document (.doc, .docx) or text file (.txt)",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({ title: "No file selected", description: "Please select a Word document to convert.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setProgressLabel("Reading document...");

    try {
      const fileName = file.name.toLowerCase();
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'VexaTool';
      workbook.created = new Date();

      if (fileName.endsWith('.docx')) {
        // Try proper table extraction first
        try {
          const content = await parseDocxContent(file);
          setProgress(50);
          setProgressLabel("Building spreadsheet...");

          let sheetIndex = 1;

          // Add each table as a separate sheet
          if (content.tables.length > 0) {
            for (const table of content.tables) {
              const ws = workbook.addWorksheet(content.tables.length === 1 ? "Table Data" : `Table ${sheetIndex}`);
              const maxCols = Math.max(...table.rows.map(r => r.length), 1);

              for (const row of table.rows) {
                const padded = [...row];
                while (padded.length < maxCols) padded.push('');
                ws.addRow(padded);
              }

              // Bold header row
              if (table.rows.length > 0) {
                const headerRow = ws.getRow(1);
                headerRow.font = { bold: true };
                headerRow.eachCell(cell => {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F0FE' } };
                });
              }

              // Auto-fit columns
              for (let i = 1; i <= maxCols; i++) {
                const col = ws.getColumn(i);
                let maxWidth = 10;
                col.eachCell({ includeEmpty: false }, cell => {
                  const len = String(cell.value ?? '').length;
                  if (len > maxWidth) maxWidth = Math.min(len, 50);
                });
                col.width = maxWidth + 2;
              }
              sheetIndex++;
            }
          }

          // Add paragraph content as a separate sheet if present
          if (content.paragraphs.length > 0) {
            const ws = workbook.addWorksheet("Text Content");
            for (const para of content.paragraphs) {
              ws.addRow([para]);
            }
            ws.getColumn(1).width = 80;
          }

          // If no tables and no paragraphs, try text fallback
          if (content.tables.length === 0 && content.paragraphs.length === 0) {
            throw new Error("No content found, trying fallback");
          }
        } catch {
          // Fallback: extract raw text and parse into rows
          const text = await extractDocText(file);
          if (!text || text.length < 5) {
            toast({ title: "No text found", description: "Could not extract content from this document.", variant: "destructive" });
            setIsProcessing(false);
            return;
          }
          addTextAsSheet(workbook, text);
        }
      } else {
        // .doc or .txt - text extraction
        const text = fileName.endsWith('.txt') ? await file.text() : await extractDocText(file);
        if (!text || text.length < 5) {
          toast({ title: "No text found", description: "Could not extract content from this document.", variant: "destructive" });
          setIsProcessing(false);
          return;
        }
        addTextAsSheet(workbook, text);
      }

      setProgress(80);
      setProgressLabel("Creating Excel file...");

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(doc|docx|txt)$/i, '.xlsx');
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      const sheetCount = workbook.worksheets.length;
      const totalRows = workbook.worksheets.reduce((sum, ws) => sum + ws.rowCount, 0);
      toast({
        title: "Conversion complete!",
        description: `Extracted ${totalRows} rows across ${sheetCount} sheet(s) to Excel (.xlsx).`,
      });

      setFile(null);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Convert error:", error);
      toast({
        title: "Conversion failed",
        description: "Failed to convert document. The file may be corrupted or in an unsupported format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /** Parse text lines into a worksheet with intelligent column detection */
  function addTextAsSheet(workbook: ExcelJS.Workbook, text: string) {
    const ws = workbook.addWorksheet("Extracted Data");
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      let columns: string[];
      if (line.includes('\t')) {
        columns = line.split('\t').map(c => c.trim());
      } else if (line.includes('  ')) {
        columns = line.split(/\s{2,}/).map(c => c.trim());
      } else {
        columns = [line.trim()];
      }
      ws.addRow(columns);
    }

    // Auto-fit columns
    const maxCols = ws.columnCount || 1;
    for (let i = 1; i <= maxCols; i++) {
      const col = ws.getColumn(i);
      let maxWidth = 10;
      col.eachCell({ includeEmpty: false }, cell => {
        const len = String(cell.value ?? '').length;
        if (len > maxWidth) maxWidth = Math.min(len, 60);
      });
      col.width = maxWidth + 2;
    }
  }

  const seoContent = {
    toolName: "Word to Excel Converter",
    whatIs: "Word to Excel Converter is a free online tool that transforms Word documents into proper Excel spreadsheets (.xlsx). For .docx files with tables, it extracts each table into a separate Excel sheet with formatted headers. Paragraph content is placed in a dedicated sheet. The entire conversion happens in your browser — no files are uploaded.",
    howToUse: [
      "Click the upload area to select your Word document (.doc, .docx) or text file (.txt).",
      "Review the selected file details.",
      "Click 'Convert to Excel (.xlsx)' to start the conversion.",
      "Your Excel file will download automatically.",
      "Open the file in Microsoft Excel, Google Sheets, or any spreadsheet app.",
    ],
    features: [
      "Extracts actual Word tables into structured Excel sheets",
      "Each table becomes a separate sheet with bold headers",
      "Paragraph content exported to a dedicated sheet",
      "Generates real .xlsx files (not CSV)",
      "Auto-fit column widths",
      "Supports .doc, .docx, and .txt files",
      "100% browser-based — no server upload",
      "Free with no registration required",
    ],
    safetyNote: "Your documents are processed entirely in your browser. No files are uploaded to any server.",
    faqs: [
      { question: "How does the converter handle Word tables?", answer: "For .docx files, the tool extracts actual table elements from the document XML. Each table becomes a separate Excel sheet with proper rows and columns." },
      { question: "Why .xlsx instead of CSV?", answer: "XLSX supports multiple sheets, formatting, and auto-fitted columns — providing a much better result than flat CSV files." },
      { question: "Will tables in my Word document be converted accurately?", answer: "Yes — actual Word tables are parsed cell-by-cell. Complex merged cells may need minor adjustment." },
      { question: "Can I convert documents with images?", answer: "The converter focuses on text and table content. Images are not transferred to Excel output." },
    ],
  };

  return (
    <>
      <CanonicalHead
        title="Word to Excel Converter Free Online - DOC to XLSX | VexaTool"
        description="Free online Word to Excel converter. Extract tables from Word documents into proper Excel spreadsheets (.xlsx) with formatted headers."
        keywords="word to excel, doc to xlsx, docx to excel, word to spreadsheet, convert word to excel"
      />
      <ToolLayout
        title="Word to Excel"
        description="Convert Word documents to Excel spreadsheet format"
        icon={FileSpreadsheet}
        colorClass="bg-green-600"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input type="file" accept=".doc,.docx,.txt" onChange={handleFileChange} className="hidden" id="word-excel-upload" />
            <label htmlFor="word-excel-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {file ? file.name : "Click to select Word document"}
              </p>
              <p className="text-sm text-muted-foreground">Supports .doc, .docx, and .txt files</p>
            </label>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setProgress(0); }}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">{progressLabel}</p>
                </div>
              )}

              <div className="text-center">
                <Button size="lg" onClick={handleConvert} disabled={isProcessing} className="gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Convert to Excel (.xlsx)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">
                  Your documents are processed entirely within your browser. No files are uploaded to any server.
                </p>
              </div>
            </div>
          </div>

          <ToolSEOContent {...seoContent} />
        </div>
      </ToolLayout>
    </>
  );
};

export default WordToExcel;
