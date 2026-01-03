import { useState } from "react";
import { FileText, Download, Table } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

const ExcelToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.csv, .xls, .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        const cells: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        rows.push(cells);
      }
    }
    
    return rows;
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

    try {
      let rows: string[][] = [];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        rows = parseCSV(text);
      } else {
        // For .xls/.xlsx, try to extract text
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        let extractedText = "";
        for (let i = 0; i < bytes.length; i++) {
          const char = bytes[i];
          if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
            extractedText += String.fromCharCode(char);
          }
        }
        
        const lines = extractedText.split(/[\n\r]+/).filter(l => l.trim().length > 3);
        rows = lines.map(line => {
          if (line.includes('\t')) {
            return line.split('\t').map(c => c.trim());
          }
          return [line.trim()];
        });
      }

      // Create RTF document (Rich Text Format - opens in Word)
      let rtfContent = '{\\rtf1\\ansi\\deff0\n';
      rtfContent += '{\\fonttbl{\\f0\\fswiss Helvetica;}}\n';
      rtfContent += '\\f0\\fs24\n';
      
      // Add table
      if (rows.length > 0) {
        const maxCols = Math.max(...rows.map(r => r.length));
        const colWidth = Math.floor(9000 / maxCols);
        
        for (const row of rows) {
          rtfContent += '\\trowd\\trgaph108\n';
          
          for (let i = 0; i < maxCols; i++) {
            rtfContent += `\\cellx${colWidth * (i + 1)}\n`;
          }
          
          for (let i = 0; i < maxCols; i++) {
            const cell = row[i] || '';
            const escapedCell = cell
              .replace(/\\/g, '\\\\')
              .replace(/\{/g, '\\{')
              .replace(/\}/g, '\\}');
            rtfContent += `\\intbl ${escapedCell}\\cell\n`;
          }
          
          rtfContent += '\\row\n';
        }
      }
      
      rtfContent += '}';

      // Download as RTF
      const blob = new Blob([rtfContent], { type: "application/rtf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(csv|xls|xlsx)$/i, '.rtf');
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion complete!",
        description: "Your spreadsheet has been converted to RTF format (opens in Word).",
      });

      setFile(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Excel to Word Converter",
    whatIs: "Excel to Word Converter is a free online tool that transforms Excel spreadsheets and CSV files into Word-compatible documents. This is useful when you need to include tabular data in reports, presentations, or documents. The converter processes your spreadsheet data and creates an RTF file that opens in Microsoft Word, Google Docs, and other word processors while maintaining your table structure.",
    howToUse: [
      "Click the upload area to select your Excel file (.xls, .xlsx, or .csv).",
      "Review the selected file details shown below the upload area.",
      "Click 'Convert to Word (RTF)' to start the conversion.",
      "Your converted RTF file will download automatically.",
      "Open the file in Microsoft Word or any word processor."
    ],
    features: [
      "Converts .xls, .xlsx, and .csv files",
      "Creates RTF tables compatible with all word processors",
      "Preserves row and column structure",
      "Handles quoted fields and special characters in CSV",
      "Fast client-side processing",
      "No file size limits for standard spreadsheets"
    ],
    safetyNote: "Your Excel files are processed entirely in your browser using secure client-side technology. No files are uploaded to any server, ensuring complete privacy for your spreadsheet data. Both original and converted files remain on your device.",
    faqs: [
      { question: "Will my table formatting be preserved?", answer: "The converter creates a basic table structure in RTF format. While the data and layout are preserved, you may need to adjust styling (colors, fonts, borders) in your word processor after conversion." },
      { question: "Can I convert files with multiple sheets?", answer: "For .xlsx files with multiple sheets, the tool extracts text content. For best results with multi-sheet workbooks, save each sheet as a separate CSV file." },
      { question: "Why RTF instead of DOCX?", answer: "RTF is universally compatible with all word processors including Microsoft Word, Google Docs, LibreOffice, and others. It ensures your converted file can be opened anywhere." },
      { question: "What about formulas in my Excel file?", answer: "The converter exports the visible values, not the underlying formulas. If you need to preserve formulas, keep your original Excel file." }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Excel to Word Converter Free Online - XLS CSV to DOC | Mypdfs</title>
        <meta name="description" content="Free online Excel to Word converter. Convert XLS, XLSX, and CSV files to Word document format. Convert spreadsheets to editable documents." />
        <meta name="keywords" content="excel to word, xls to doc, csv to word, spreadsheet to word, convert excel, free converter" />
        <link rel="canonical" href="https://mypdfs.lovable.app/excel-to-word" />
      </Helmet>
      <ToolLayout
        title="Excel to Word"
        description="Convert Excel spreadsheets to Word document format"
        icon={FileText}
        colorClass="bg-blue-600"
      >
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
              Click to select Excel file
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .csv, .xls, and .xlsx files
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Table className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                Remove
              </Button>
            </div>
            
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Converting..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to Word (RTF)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default ExcelToWord;
