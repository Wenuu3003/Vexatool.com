import { useState } from "react";
import { FileText, Download, Table, Loader2, Shield } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { readExcelFile, sheetToArray } from "@/lib/excelUtils";
import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow, TableCell, WidthType, HeadingLevel, BorderStyle } from "docx";

const ExcelToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setProgress(0);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.csv, .xls, .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setProgressLabel("Reading spreadsheet...");

    try {
      const { workbook } = await readExcelFile(file);
      setProgress(40);
      setProgressLabel("Building Word document...");

      const sections: Paragraph[] = [];
      const tables: (Paragraph | DocxTable)[] = [];

      // Title
      tables.push(
        new Paragraph({
          text: file.name.replace(/\.(csv|xls|xlsx)$/i, ''),
          heading: HeadingLevel.TITLE,
          spacing: { after: 300 },
        })
      );

      const defaultBorder = {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "999999",
      };

      workbook.worksheets.forEach((worksheet, sheetIndex) => {
        const sheetData = sheetToArray(worksheet);
        if (sheetData.length === 0) return;

        // Sheet heading
        if (workbook.worksheets.length > 1) {
          tables.push(
            new Paragraph({
              text: worksheet.name,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            })
          );
        }

        // Calculate max columns
        const maxCols = Math.max(...sheetData.map(r => r.length), 1);

        // Calculate column widths proportionally using DXA
        const tableWidthDxa = 9360; // US Letter with 1" margins
        const colWidthDxa = Math.floor(tableWidthDxa / maxCols);

        // Build table rows
        const docxRows = sheetData.map((row, rowIndex) => {
          const cells: TableCell[] = [];
          for (let c = 0; c < maxCols; c++) {
            const cellValue = String(row[c] ?? "");
            const isHeader = rowIndex === 0;
            cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cellValue,
                        bold: isHeader,
                        size: isHeader ? 22 : 20,
                        font: "Arial",
                      }),
                    ],
                  }),
                ],
                width: { size: colWidthDxa, type: WidthType.DXA },
                margins: { top: 40, bottom: 40, left: 80, right: 80 },
                borders: {
                  top: defaultBorder,
                  bottom: defaultBorder,
                  left: defaultBorder,
                  right: defaultBorder,
                },
              })
            );
          }
          return new TableRow({ children: cells });
        });

        const columnWidths = Array(maxCols).fill(colWidthDxa);

        tables.push(
          new DocxTable({
            rows: docxRows,
            width: { size: tableWidthDxa, type: WidthType.DXA },
            columnWidths,
          })
        );

        // Spacer between sheets
        tables.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      });

      setProgress(70);
      setProgressLabel("Generating DOCX file...");

      const doc = new Document({
        sections: [{
          properties: {},
          children: tables,
        }],
      });

      const blob = await Packer.toBlob(doc);

      setProgress(90);
      setProgressLabel("Preparing download...");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(csv|xls|xlsx)$/i, '.docx');
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      toast({
        title: "Conversion complete!",
        description: "Your spreadsheet has been converted to a Word document (.docx).",
      });

      setFile(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Conversion Error",
        description: "Failed to convert file. The file may be corrupted or in an unsupported format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const seoContent = {
    toolName: "Excel to Word Converter",
    whatIs: "Excel to Word Converter is a free online tool that transforms Excel spreadsheets and CSV files into genuine Microsoft Word documents (.docx). Unlike basic converters that output RTF, this tool generates real DOCX files with properly formatted tables, preserving your row and column structure. The entire conversion happens in your browser — your spreadsheet data never leaves your device.",
    howToUse: [
      "Click the upload area to select your Excel file (.xls, .xlsx, or .csv).",
      "Review the selected file details shown below the upload area.",
      "Click 'Convert to Word (.docx)' to start the conversion.",
      "Monitor the progress bar as your document is generated.",
      "Your converted DOCX file will download automatically."
    ],
    features: [
      "Generates real .docx files — not RTF",
      "Converts .xls, .xlsx, and .csv files",
      "Creates formatted Word tables with borders and headers",
      "Handles multiple sheets with separate tables",
      "First row is automatically bolded as table header",
      "Progress tracking during conversion",
      "100% browser-based — no server upload",
      "Free with no registration required"
    ],
    safetyNote: "Your Excel files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring complete privacy for your spreadsheet data.",
    faqs: [
      { question: "Does this generate a real DOCX file?", answer: "Yes! The converter generates a genuine .docx file (Microsoft Word format) with properly formatted tables. It is not an RTF wrapper — it is a true Word document compatible with Microsoft Word, Google Docs, and LibreOffice." },
      { question: "Will my table formatting be preserved?", answer: "The converter creates structured Word tables with borders and proper column widths. The first row is automatically bolded as a header. You can further style the table in your word processor." },
      { question: "Can I convert files with multiple sheets?", answer: "Yes! All sheets from your Excel workbook are included in the output with separate tables and sheet name headings." },
      { question: "What about formulas in my Excel file?", answer: "The converter exports the visible computed values, not the underlying formulas. Keep your original Excel file if you need to preserve formulas." },
      { question: "Is there a file size limit?", answer: "There is no strict limit. Standard spreadsheets convert in seconds. Very large files with thousands of rows may take a moment longer." }
    ]
  };

  return (
    <>
      <CanonicalHead
        title="Excel to Word Converter Free Online - XLS to DOCX | VexaTool"
        description="Free online Excel to Word converter. Convert XLS, XLSX, and CSV files to real Word documents (.docx) with formatted tables."
        keywords="excel to word, xls to docx, csv to word, spreadsheet to word, convert excel to word"
      />
      <ToolLayout
        title="Excel to Word"
        description="Convert Excel spreadsheets to Word documents (.docx)"
        icon={FileText}
        colorClass="bg-blue-600"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="excel-word-upload"
            />
            <label htmlFor="excel-word-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/10 flex items-center justify-center">
                <Table className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {file ? file.name : "Click to select Excel file"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .csv, .xls, and .xlsx files
              </p>
            </label>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Table className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
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
                <Button
                  size="lg"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Convert to Word (.docx)
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">
                  Your spreadsheets are processed entirely within your browser. No files are uploaded to any server.
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

export default ExcelToWord;
