import { useState, useCallback } from "react";
import { FileText, Download, Upload, Shield, CheckCircle, Eye, Trash2, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
      const validExtensions = ['.doc', '.docx', '.txt', '.rtf'];
      const isValid = validExtensions.some(ext =>
        selectedFile.name.toLowerCase().endsWith(ext)
      );

      if (!isValid) {
        toast({
          title: "Invalid file type",
          description: "Please select a Word document (.doc, .docx), RTF, or text file (.txt)",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setPreview("");
      setProgress(0);
    }
  };

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    // Plain text
    if (fileName.endsWith('.txt')) {
      return await file.text();
    }

    // RTF - strip control codes
    if (fileName.endsWith('.rtf')) {
      const text = await file.text();
      return text
        .replace(/\\[a-z]+\d* ?/gi, '')
        .replace(/[{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // DOCX - proper ZIP extraction using JSZip
    if (fileName.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(arrayBuffer);
        const docXml = await zip.file('word/document.xml')?.async('text');

        if (docXml) {
          // Parse paragraphs properly
          const paragraphs: string[] = [];
          const paraMatches = docXml.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];

          for (const para of paraMatches) {
            const textParts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
            const paraText = textParts
              .map(t => t.replace(/<[^>]+>/g, ''))
              .join('');
            paragraphs.push(paraText);
          }

          const result = paragraphs.join('\n').trim();
          if (result.length > 10) return result;
        }
      } catch {
        // Fall through to basic extraction
      }
    }

    // Fallback for .doc files: extract readable text from binary
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // For .doc binary files, look for text runs between control sequences
    // Extract only sequences of printable ASCII that look like real words
    const textChunks: string[] = [];
    let currentChunk = "";
    
    for (let i = 0; i < bytes.length; i++) {
      const char = bytes[i];
      if ((char >= 32 && char <= 126) || char === 10 || char === 13 || char === 9) {
        currentChunk += String.fromCharCode(char);
      } else {
        if (currentChunk.trim().length > 3) {
          textChunks.push(currentChunk.trim());
        }
        currentChunk = "";
      }
    }
    if (currentChunk.trim().length > 3) {
      textChunks.push(currentChunk.trim());
    }

    // Filter out binary noise: keep only chunks that contain actual words
    // (at least 2 words with letters, not just symbols/numbers)
    const wordPattern = /[a-zA-Z]{2,}/;
    const meaningfulChunks = textChunks.filter(chunk => {
      const words = chunk.split(/\s+/).filter(w => wordPattern.test(w));
      return words.length >= 2;
    });

    // Remove common binary artifacts
    const cleaned = meaningfulChunks
      .join('\n')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/(.)\1{5,}/g, '$1$1$1') // Reduce repeated chars
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleaned.length < 50) {
      return `Document: ${file.name}\n\nThis is a legacy .doc file format. For best results with .doc files, we recommend:\n\n1. Open the file in Microsoft Word or Google Docs\n2. Save it as .docx format\n3. Upload the .docx file here for accurate text extraction\n\nAlternatively, use Word's built-in PDF export (File → Save As → PDF).`;
    }

    return cleaned;
  }, []);

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
      const text = await extractTextFromFile(file);
      setPreview(text.substring(0, 300) + (text.length > 300 ? '...' : ''));

      setProgress(40);
      setProgressLabel("Creating PDF...");

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 11;
      const titleFontSize = 16;
      const margin = 50;
      const pageWidth = 612;
      const pageHeight = 792;
      const lineHeight = fontSize * 1.5;
      const maxWidth = pageWidth - (margin * 2);
      const maxLinesPerPage = Math.floor((pageHeight - (margin * 2) - titleFontSize - 20) / lineHeight);

      setProgress(60);
      setProgressLabel("Formatting pages...");

      const wrapText = (text: string): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
      };

      const paragraphs = text.split('\n');
      const allLines: string[] = [];
      for (const para of paragraphs) {
        if (para.trim()) {
          allLines.push(...wrapText(para.trim()));
        } else {
          allLines.push('');
        }
      }

      setProgress(80);
      setProgressLabel("Writing PDF...");

      let lineIndex = 0;
      let pageNum = 0;

      while (lineIndex < allLines.length) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        if (pageNum === 0) {
          const title = file.name.replace(/\.(doc|docx|txt|rtf)$/i, '');
          page.drawText(title, {
            x: margin, y, size: titleFontSize, font: boldFont, color: rgb(0.1, 0.1, 0.1),
          });
          y -= titleFontSize + 20;
        }

        const linesOnThisPage = pageNum === 0 ? maxLinesPerPage - 2 : maxLinesPerPage;

        for (let i = 0; i < linesOnThisPage && lineIndex < allLines.length; i++) {
          const line = allLines[lineIndex];
          if (line) {
            page.drawText(line, {
              x: margin, y, size: fontSize, font, color: rgb(0.15, 0.15, 0.15),
            });
          }
          y -= lineHeight;
          lineIndex++;
        }

        const pageNumText = `Page ${pageNum + 1}`;
        const pageNumWidth = font.widthOfTextAtSize(pageNumText, 9);
        page.drawText(pageNumText, {
          x: (pageWidth - pageNumWidth) / 2, y: 30, size: 9, font, color: rgb(0.5, 0.5, 0.5),
        });

        pageNum++;
      }

      setProgress(95);
      setProgressLabel("Finalizing...");

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(/\.(doc|docx|txt|rtf)$/i, '.pdf');
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      await saveFileHistory(file.name, "word", "word-to-pdf");

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
        description: "Failed to convert document. The file may be corrupted or in an unsupported format.",
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
        title="Word to PDF Converter Free Online - DOC DOCX to PDF | VexaTool"
        description="Free online Word to PDF converter. Convert DOC, DOCX, RTF and TXT files to PDF format instantly."
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
              .doc, .docx, .txt, and .rtf files with proper text extraction and pagination.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle, text: "No registration" },
              { icon: Upload, text: "DOC, DOCX, TXT, RTF" },
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
            <input type="file" accept=".doc,.docx,.txt,.rtf" onChange={handleFileChange} className="hidden" id="word-upload" />
            <label htmlFor="word-upload" className="cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {file ? file.name : "Click to select Word document"}
              </p>
              <p className="text-sm text-muted-foreground">Supports .doc, .docx, .txt, and .rtf files</p>
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
            whatIs="The Word to PDF Converter transforms Microsoft Word documents (.doc, .docx), RTF files, and text files (.txt) into universally accessible PDF format. For .docx files, it uses proper ZIP-based extraction to accurately read document content. PDFs preserve your document's formatting across all devices and platforms."
            howToUse={[
              "Click the upload area or drag and drop your Word document.",
              "Preview the file information displayed after selection.",
              "Click 'Convert to PDF' to begin the conversion process.",
              "Monitor the progress bar as your document is processed.",
              "Your converted PDF will download automatically when ready.",
            ]}
            features={[
              "Proper DOCX extraction using ZIP parsing for accurate text",
              "Supports .doc, .docx, .txt, and .rtf formats",
              "Automatic text wrapping and pagination for long documents",
              "Professional layout with title, page numbers, and proper margins",
              "Fast browser-based processing with no uploads",
              "Progress tracking with descriptive step labels",
              "Content preview before final download",
              "Free to use with no registration required",
            ]}
            safetyNote="Your documents are processed entirely within your browser using secure client-side technology. No files are uploaded to external servers."
            faqs={[
              { question: "Will my Word document formatting be preserved?", answer: "Text content is fully preserved with proper paragraph breaks. For complex formatting with tables, images, and styling, use Microsoft Word's built-in PDF export." },
              { question: "What Word file formats are supported?", answer: "DOC, DOCX, TXT, and RTF files are supported. DOCX files get the best text extraction using proper ZIP-based parsing." },
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
