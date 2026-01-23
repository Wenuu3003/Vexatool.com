import { useState } from "react";
import { FileSpreadsheet, Download, FileText } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const WordToExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.txt')) {
        setFile(selectedFile);
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
      toast({
        title: "No file selected",
        description: "Please select a Word document to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Read file content
      let text = "";
      if (file.name.endsWith('.txt')) {
        text = await file.text();
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        let extractedText = "";
        for (let i = 0; i < bytes.length; i++) {
          const char = bytes[i];
          if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
            extractedText += String.fromCharCode(char);
          }
        }
        
        text = extractedText
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .trim();
      }

      // Parse text into rows and columns
      const lines = text.split('\n').filter(line => line.trim());
      const rows: string[][] = [];
      
      for (const line of lines) {
        // Try to detect columns by tabs, multiple spaces, or just use the whole line
        let columns: string[];
        if (line.includes('\t')) {
          columns = line.split('\t').map(c => c.trim());
        } else if (line.includes('  ')) {
          columns = line.split(/\s{2,}/).map(c => c.trim());
        } else {
          columns = [line.trim()];
        }
        rows.push(columns);
      }

      // Create CSV content
      const escapeCSV = (str: string): string => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = rows
        .map(row => row.map(cell => escapeCSV(cell)).join(','))
        .join('\n');

      // Download as CSV (can be opened in Excel)
      const blob = new Blob(['\ufeff' + csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(doc|docx|txt)$/i, '.csv');
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Conversion complete!",
        description: "Your document has been converted to CSV format (opens in Excel).",
      });

      setFile(null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "Word to Excel Converter",
    whatIs: "Word to Excel Converter is a free online tool that transforms Word documents and text files into Excel-compatible CSV format. This is useful when you have tabular data in Word documents that you need to analyze or process in a spreadsheet application. The tool intelligently detects column separators (tabs, multiple spaces) to properly structure your data in rows and columns.",
    howToUse: [
      "Click the upload area to select your Word document (.doc, .docx) or text file (.txt).",
      "Review the selected file details.",
      "Click 'Convert to Excel (CSV)' to start the conversion.",
      "Your CSV file will download automatically.",
      "Open the CSV file in Microsoft Excel, Google Sheets, or any spreadsheet application."
    ],
    features: [
      "Converts .doc, .docx, and .txt files to CSV",
      "Automatic detection of columns (tabs, spaces)",
      "UTF-8 encoding for international characters",
      "Compatible with Excel, Google Sheets, and LibreOffice",
      "Client-side processing for privacy",
      "No registration required"
    ],
    safetyNote: "Your Word documents are processed entirely in your browser. No files are uploaded to any server, ensuring complete privacy. The conversion happens locally on your device, and both original and converted files remain under your control.",
    faqs: [
      { question: "How does the converter detect columns?", answer: "The tool looks for tab characters and multiple consecutive spaces to separate columns. For best results, use tabs or consistent spacing to separate data in your Word document." },
      { question: "Why CSV instead of XLS format?", answer: "CSV is universally compatible with all spreadsheet applications including Excel, Google Sheets, and LibreOffice. It ensures your converted file can be opened and processed anywhere." },
      { question: "Will tables in my Word document be converted?", answer: "The tool extracts text content and attempts to preserve structure. For complex tables with merged cells or special formatting, some manual adjustment in the spreadsheet may be needed." },
      { question: "Can I convert documents with images?", answer: "The converter focuses on text content. Images in Word documents are not transferred to the CSV output, which is a text-based format." }
    ]
  };

  return (
    <>
      <CanonicalHead 
        title="Word to Excel Converter Free Online - DOC to XLS CSV | Mypdfs"
        description="Free online Word to Excel converter. Convert DOC and DOCX files to Excel CSV format. Extract tables."
        keywords="word to excel, doc to xls, docx to csv, word to csv, convert word to excel"
      />
      <ToolLayout
        title="Word to Excel"
        description="Convert Word documents to Excel spreadsheet format"
        icon={FileSpreadsheet}
        colorClass="bg-green-600"
      >
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".doc,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="word-excel-upload"
          />
          <label htmlFor="word-excel-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-600/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Click to select Word document
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .doc, .docx, and .txt files
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
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
                    Convert to Excel (CSV)
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

export default WordToExcel;
