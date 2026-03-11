import { useState } from "react";
import { FileSpreadsheet, Download, FileText, Loader2, Trash2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

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
      let text = "";
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.txt')) {
        text = await file.text();
      } else if (fileName.endsWith('.docx')) {
        // Proper DOCX extraction using JSZip
        try {
          const arrayBuffer = await file.arrayBuffer();
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(arrayBuffer);
          const docXml = await zip.file('word/document.xml')?.async('text');

          if (docXml) {
            const paragraphs: string[] = [];
            const paraMatches = docXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
            for (const para of paraMatches) {
              const textParts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
              const paraText = textParts.map(t => t.replace(/<[^>]+>/g, '')).join('');
              paragraphs.push(paraText);
            }
            text = paragraphs.join('\n').trim();
          }
        } catch {
          // Fallback
        }

        if (!text) {
          // Fallback byte scanning
          const bytes = new Uint8Array(await file.arrayBuffer());
          let extracted = "";
          for (let i = 0; i < bytes.length; i++) {
            const c = bytes[i];
            if ((c >= 32 && c <= 126) || c === 10 || c === 13 || c === 9) extracted += String.fromCharCode(c);
          }
          text = extracted.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
        }
      } else {
        // .doc fallback
        const bytes = new Uint8Array(await file.arrayBuffer());
        let extracted = "";
        for (let i = 0; i < bytes.length; i++) {
          const c = bytes[i];
          if ((c >= 32 && c <= 126) || c === 10 || c === 13 || c === 9) extracted += String.fromCharCode(c);
        }
        text = extracted.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
      }

      if (!text || text.length < 10) {
        toast({
          title: "No text found",
          description: "Could not extract text from this document. It may contain only images or be in an unsupported format.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      setProgress(50);
      setProgressLabel("Building spreadsheet...");

      // Parse text into rows and columns
      const lines = text.split('\n').filter(line => line.trim());
      const rows: string[][] = [];

      for (const line of lines) {
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

      setProgress(80);
      setProgressLabel("Creating CSV...");

      const escapeCSV = (str: string): string => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = rows.map(row => row.map(cell => escapeCSV(cell)).join(',')).join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(doc|docx|txt)$/i, '.csv');
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      toast({
        title: "Conversion complete!",
        description: `Extracted ${rows.length} rows to CSV format.`,
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

  const seoContent = {
    toolName: "Word to Excel Converter",
    whatIs: "Word to Excel Converter is a free online tool that transforms Word documents and text files into Excel-compatible CSV format. For .docx files, it uses proper ZIP-based extraction to accurately read document content. The tool intelligently detects column separators (tabs, multiple spaces) to properly structure your data.",
    howToUse: [
      "Click the upload area to select your Word document (.doc, .docx) or text file (.txt).",
      "Review the selected file details.",
      "Click 'Convert to Excel (CSV)' to start the conversion.",
      "Your CSV file will download automatically.",
      "Open the CSV file in Microsoft Excel, Google Sheets, or any spreadsheet app.",
    ],
    features: [
      "Proper DOCX text extraction using ZIP parsing",
      "Converts .doc, .docx, and .txt files to CSV",
      "Automatic detection of columns (tabs, spaces)",
      "UTF-8 encoding with BOM for international characters",
      "Progress tracking during conversion",
      "No registration required",
    ],
    safetyNote: "Your documents are processed entirely in your browser. No files are uploaded to any server.",
    faqs: [
      { question: "How does the converter detect columns?", answer: "The tool looks for tab characters and multiple consecutive spaces to separate columns." },
      { question: "Why CSV instead of XLS format?", answer: "CSV is universally compatible with all spreadsheet applications including Excel, Google Sheets, and LibreOffice." },
      { question: "Will tables in my Word document be converted?", answer: "The tool extracts text content and preserves tab/space structure. Complex tables may need manual adjustment." },
      { question: "Can I convert documents with images?", answer: "The converter focuses on text content. Images are not transferred to CSV output." },
    ],
  };

  return (
    <>
      <CanonicalHead
        title="Word to Excel Converter Free Online - DOC to XLS CSV | VexaTool"
        description="Free online Word to Excel converter. Convert DOC and DOCX files to Excel CSV format with proper text extraction."
        keywords="word to excel, doc to xls, docx to csv, word to csv, convert word to excel"
      />
      <ToolLayout
        title="Word to Excel"
        description="Convert Word documents to Excel spreadsheet format"
        icon={FileSpreadsheet}
        colorClass="bg-green-600"
      >
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
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
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
