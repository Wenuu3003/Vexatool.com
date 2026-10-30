import { useState } from "react";
import { FileType2, Download, FileText, CheckCircle, Shield, Clock, Eye } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { PDFDocument } from "pdf-lib";
import { convertPdfToWord } from "@/lib/pdfToWord";
import { useFileHistory } from "@/hooks/useFileHistory";
import { AdPlaceholder } from "@/components/AdBanner";
import { CanonicalHead } from "@/components/CanonicalHead";
import ToolSEOContent from "@/components/ToolSEOContent";

const ConvertPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pageCount, setPageCount] = useState(0);
  const { toast } = useToast();
  const { saveFileHistory } = useFileHistory();

  const handleFilesChange = async (newFiles: File[]) => {
    setFiles(newFiles);
    setExtractedText("");
    setProgress(0);
    
    if (newFiles.length > 0) {
      try {
        const arrayBuffer = await newFiles[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch {
        setPageCount(0);
      }
    } else {
      setPageCount(0);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const { blob, pageCount: convertedPages, preview: fullText } = await convertPdfToWord(files[0], setProgress);
      setPageCount(convertedPages);
      setExtractedText(fullText.substring(0, 500) + (fullText.length > 500 ? '...' : ''));
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${files[0].name.replace(/\.pdf$/i, '')}.docx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);

      setProgress(100);
      
      await saveFileHistory(files[0].name, "pdf", "pdf-to-word").catch(() => undefined);

      toast({
        title: "Conversion Complete!",
        description: `Preserved ${convertedPages} page(s). Available editable text is included separately.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Conversion error:", error);
      }
      toast({
        title: "Conversion Error",
        description: error instanceof Error ? error.message : "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <CanonicalHead 
        title="PDF to Word Converter Free Online - Convert PDF to DOCX | VexaTool"
        description="Convert PDF to DOCX locally with original page images and separately editable extracted text. No document uploads."
        keywords="PDF to Word, convert PDF to DOC, PDF converter, PDF to DOCX, free PDF to Word"
      />
      <ToolLayout
        title="PDF to Word"
        description="Preserve PDF pages in Word with separately editable text"
        icon={FileType2}
        colorClass="bg-tool-convert"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileType2 className="w-5 h-5 text-blue-600" />
              Convert PDF to Editable Word Document
            </h2>
            <p className="text-muted-foreground">
              Original PDF pages are preserved as images in your Word document (.docx).
              Available text is included in a separate editable section. Page images are not editable text;
              scanned pages are preserved visually without OCR.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "Full text extraction" },
              { icon: FileText, text: "DOCX format" },
              { icon: Shield, text: "Secure & private" },
              { icon: Clock, text: "Fast conversion" },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                <benefit.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>
          
          <AdPlaceholder className="h-20" />
          
          <FileUpload
            files={files}
            onFilesChange={handleFilesChange}
            colorClass="bg-tool-convert"
            multiple={false}
            accept=".pdf"
          />

          {files.length > 0 && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-foreground">{files[0].name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pageCount} page(s) • {(files[0].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 70 ? "Extracting text..." : progress < 90 ? "Creating Word document..." : "Finalizing..."}
                  </p>
                </div>
              )}

              {/* Preview */}
              {extractedText && !isProcessing && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Text Preview
                  </h4>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-auto">
                    {extractedText}
                  </pre>
                </div>
              )}

              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full bg-tool-convert hover:bg-tool-convert/90"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Convert to Word (.docx)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Security Note */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">Your Privacy is Protected</h4>
                <p className="text-sm text-muted-foreground">
                  All conversion happens locally in your browser. Your PDF files are never uploaded 
                  to any server, ensuring complete privacy and security of your documents.
                </p>
              </div>
            </div>
          </div>
          
          <AdPlaceholder className="h-20" />
          
          <ToolSEOContent
            toolName="PDF to Word Converter"
            whatIs="Converts PDF pages into DOCX with each original page preserved as an image, including tables, graphics and scanned content. Available text is appended in a separately editable section. This does not recreate fully editable tables or exact Word layouts, and does not perform OCR. Processing stays in your browser with no document uploads."
            howToUse={[
              "Click the upload area or drag and drop your PDF file to begin.",
              "Wait for the file to be analyzed — the page count is displayed automatically.",
              "Click 'Convert to Word (.docx)' to start the conversion process.",
              "Monitor the progress bar as text is extracted and the Word document is created.",
              "Preview the extracted text to verify the conversion quality.",
              "Download your DOCX file and open it in Microsoft Word or any compatible word processor."
            ]}
            features={[
              "Full text extraction from all PDF pages with paragraph preservation.",
              "Creates genuine DOCX files compatible with Microsoft Word, Google Docs, and LibreOffice.",
              "Original page visuals with separate Word page sections.",
              "Real-time progress tracking during the conversion process.",
              "Text preview before download to verify extraction quality and accuracy.",
              "Local browser processing — no server uploads for complete document privacy.",
              "Maintains paragraph structure and text flow from the original PDF.",
              "Original page dimensions and separately editable extracted text.",
              "Free to use with no registration, daily limits, or watermarks on output."
            ]}
            safetyNote="Your PDF files are processed entirely in your browser using secure client-side JavaScript technology. No documents are uploaded to external servers, ensuring the complete privacy and confidentiality of your files. The original PDF remains unchanged on your device, and both the source file and converted Word document stay under your full control."
            faqs={[
              { question: "Will all formatting from my PDF be preserved?", answer: "Original page appearance is preserved as images, not fully editable layouts. Extracted text appears separately and may need formatting adjustments." },
              { question: "Can I convert scanned PDFs to Word?", answer: "Scanned pages are preserved as images. No OCR is performed, so pages without a text layer do not produce editable text." },
              { question: "What about images and graphics in my PDF?", answer: "Images, tables and graphics are retained within the original page images. They are not recreated as separate editable Word objects." },
              { question: "Is there a page limit for conversion?", answer: "There is no strict page limit, but very large PDFs (100+ pages) may take longer to process. The conversion happens in your browser, so performance depends on your device's capabilities." },
              { question: "Can I convert multiple PDFs to Word at once?", answer: "The tool processes one PDF at a time to ensure quality. For batch conversion, simply process each file sequentially." },
              { question: "Will the output Word file have editable text?", answer: "When the PDF has a text layer, extracted text is included in a separate editable section after the original page images. Text inside page images is not editable." },
              { question: "Do I need Microsoft Word installed?", answer: "No. You can use any word processor that supports DOCX format, including free options like Google Docs and LibreOffice Writer." },
              { question: "Is the conversion free?", answer: "Yes, completely free with no hidden charges, no registration required, and no daily usage limits." },
              { question: "Can I convert password-protected PDFs?", answer: "Password-protected PDFs need to be unlocked first. Use our Unlock PDF tool to remove protection, then convert the unlocked file." },
              { question: "Why does my converted document look different from the original?", answer: "PDF and Word use fundamentally different formatting engines. While text content is preserved accurately, exact visual layout (columns, spacing, fonts) may differ. The goal is editable content, not pixel-perfect reproduction." }
            ]}
          />
        </div>
      </ToolLayout>
    </>
  );
};

export default ConvertPDF;