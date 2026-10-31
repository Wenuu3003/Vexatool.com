import { convertWordToPdf } from "@/lib/wordToPdf";
import { useState, useCallback } from "react";
import { FileText, Download, Upload, Shield, CheckCircle, Eye, Trash2, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";
import { useFileHistory } from "@/hooks/useFileHistory";

const WordToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [preview, setPreview] = useState<string>("");
  const { saveFileHistory } = useFileHistory();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validExtensions = ['.docx', '.txt'];
      const isValid = validExtensions.some(ext =>
        selectedFile.name.toLowerCase().endsWith(ext)
      );

      if (!isValid) {
        setFile(null); setPreview("");
        toast({
          title: "Invalid file type",
          description: "Select DOCX or TXT. Export legacy DOC and RTF from Word first.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setPreview("");
      setProgress(0);
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
    setProgress(10);
    setProgressLabel("Reading document...");

    try {
      const { bytes: pdfBytes, pageCount: pageNum, preview: text } = await convertWordToPdf(file, (value, label) => {
        setProgress(value);
        setProgressLabel(label);
      });
      setPreview(text.substring(0, 300) + (text.length > 300 ? '...' : ''));

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(doc|docx|txt|rtf)$/i, '.pdf');
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      setProgress(100);
      setProgressLabel("Done!");

      await saveFileHistory(file.name, "word", "word-to-pdf").catch(() => undefined);

      toast({
        title: "Conversion Complete!",
        description: `Successfully converted to PDF (${pageNum} page${pageNum > 1 ? 's' : ''}).`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Conversion Error",
        description: error instanceof Error ? error.message : "Failed to convert document. Please use a valid DOCX or TXT file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview("");
    setProgress(0);
  };

  return (
    <>
      <CanonicalHead
        title="Word to PDF Converter Free Online - DOCX to PDF | VexaTool"
        description="Convert DOCX and TXT to PDF in your browser. Render supported tables, images and text styling without uploading your document."
        keywords="word to pdf, doc to pdf, docx to pdf, convert word, word converter, free word to pdf"
      />
      <ToolLayout
        title="Word to PDF"
        description="Convert Word documents to PDF format"
        icon={FileText}
        colorClass="bg-blue-600"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Convert Word to Professional PDF
            </h2>
            <p className="text-muted-foreground">
              Transform your Word documents into universally accessible PDF files. Supports
              .docx and .txt files with document rendering and pagination.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "No registration" },
              { icon: Upload, text: "DOCX, TXT" },
              { icon: Shield, text: "Secure processing" },
              { icon: FileText, text: "Professional PDF" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                <benefit.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors">
            <p className="mb-4 text-sm text-muted-foreground">DOCX tables, images and text styling are rendered locally. PDF pages are images; complex Word layouts and unavailable fonts may differ.</p>
            <input type="file" accept=".docx,.txt" onChange={handleFileChange} className="hidden" id="word-upload" />
            <label htmlFor="word-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {file ? file.name : "Click to select Word document"}
              </p>
              <p className="text-sm text-muted-foreground">Supports .docx and .txt files</p>
            </label>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
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
                  <p className="text-sm text-center text-muted-foreground">{progressLabel}</p>
                </div>
              )}

              {preview && !isProcessing && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Content Preview
                  </h4>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-auto">{preview}</pre>
                </div>
              )}

              <div className="text-center">
                <Button size="lg" onClick={handleConvert} disabled={isProcessing} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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

          <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Secure & Private</h4>
                <p className="text-sm text-muted-foreground">
                  Your Word documents are processed entirely within your browser. No files are uploaded to external servers.
                </p>
              </div>
            </div>
          </div>

          <ToolSEOContent
            toolName="Word to PDF Converter"
            whatIs="Creates a PDF from DOCX or TXT entirely in your browser, rendering supported tables, images, headers, footers and text styling. Pages are image-based, not editable or searchable text. Complex Word layouts and unavailable fonts may differ; use Word Export for exact fidelity. Legacy DOC and RTF are unsupported."
            howToUse={[
              "Click the upload area or drag and drop your Word document.",
              "Preview the file information displayed after selection.",
              "Click 'Convert to PDF' to begin the conversion process.",
              "Monitor the progress bar as your document is processed.",
              "Your converted PDF will download automatically when ready.",
            ]}
            features={[
              "DOCX layout rendering with supported tables and images",
              "Supports .docx and .txt formats",
              "Pagination with table-row and paragraph boundaries",
              "Document page sizes, margins and supported text styling",
              "Fast browser-based processing with no uploads",
              "Progress tracking with descriptive step labels",
              "Content preview before final download",
              "Free to use with no registration required",
            ]}
            safetyNote="Your documents are processed entirely within your browser using secure client-side technology. No files are uploaded to external servers."
            faqs={[
              { question: "Will my Word document formatting be preserved?", answer: "Supported tables, images and text styling are rendered into image-based PDF pages. Complex layouts and fonts not installed on your device may differ. Use Microsoft Word's PDF export when exact fidelity or searchable text is required." },
              { question: "What Word file formats are supported?", answer: "DOCX and TXT are supported. Save legacy DOC and RTF as DOCX first." },
              { question: "Is there a file size limit?", answer: "No strict limit, but very large files (50MB+) may be slow on mobile devices. Most Word documents convert in seconds." },
              { question: "Are my documents stored anywhere?", answer: "No. Everything is processed in your browser. Files never leave your device." },
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default WordToPDF;
