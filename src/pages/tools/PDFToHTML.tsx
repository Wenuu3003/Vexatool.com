import { useState } from "react";
import { Code, Download, FileUp, Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import * as pdfjsLib from "pdfjs-dist";
import { CanonicalHead } from "@/components/CanonicalHead";
import DOMPurify from "dompurify";
import ToolSEOContent from "@/components/ToolSEOContent";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Escape HTML special characters to prevent XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const PDFToHTML = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [htmlPreview, setHtmlPreview] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setHtmlPreview("");
        setProgress(0);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setProgressLabel("Loading PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      setProgress(20);
      setProgressLabel("Extracting text...");

      // Extract text from each page using pdfjs-dist
      const pageContents: { text: string; width: number; height: number }[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(20 + Math.round((i / numPages) * 60));
        setProgressLabel(`Extracting page ${i} of ${numPages}...`);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();

        // Group text items by Y position to reconstruct lines
        const lines: Map<number, string[]> = new Map();
        for (const item of textContent.items as { str: string; transform: number[] }[]) {
          const y = Math.round(item.transform[5]);
          if (!lines.has(y)) lines.set(y, []);
          lines.get(y)!.push(item.str);
        }

        // Sort by Y descending (PDF coords are bottom-up)
        const sortedLines = Array.from(lines.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([, texts]) => texts.join(" ").trim())
          .filter(line => line.length > 0);

        pageContents.push({
          text: sortedLines.join("\n"),
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
        });
      }

      setProgress(85);
      setProgressLabel("Building HTML...");

      // Get metadata
      const metadata = await pdf.getMetadata().catch(() => null);
      const info = metadata?.info as Record<string, string> | undefined;
      const title = escapeHtml(info?.Title || file.name.replace('.pdf', ''));
      const author = escapeHtml(info?.Author || '');
      const fileName = escapeHtml(file.name);

      // Generate HTML with actual text content
      let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7; color: #333; background: #f5f5f5; padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .document-header {
            background: white; padding: 30px; border-radius: 8px;
            margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .document-header h1 { font-size: 24px; margin-bottom: 10px; color: #1a1a1a; }
        .document-meta { color: #666; font-size: 14px; }
        .page {
            background: white; padding: 40px; margin-bottom: 20px;
            border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: relative;
        }
        .page-header { color: #999; font-size: 12px; margin-bottom: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        .page-content { white-space: pre-wrap; font-size: 14px; line-height: 1.7; }
        .page-number { position: absolute; bottom: 16px; right: 20px; color: #bbb; font-size: 11px; }
        .empty-page { color: #999; font-style: italic; text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="document-header">
            <h1>${title}</h1>
            <div class="document-meta">
                ${author ? `<p>Author: ${author}</p>` : ''}
                <p>Pages: ${numPages}</p>
                <p>Converted from: ${fileName}</p>
            </div>
        </div>
`;

      for (let i = 0; i < pageContents.length; i++) {
        const pc = pageContents[i];
        const escapedText = escapeHtml(pc.text);

        htmlContent += `
        <div class="page">
            <div class="page-header">Page ${i + 1} &mdash; ${pc.width} &times; ${pc.height} pt</div>
            ${escapedText.trim() ? `<div class="page-content">${escapedText}</div>` : `<div class="empty-page">This page contains no extractable text (may contain images or scanned content).</div>`}
            <div class="page-number">Page ${i + 1} of ${numPages}</div>
        </div>
`;
      }

      htmlContent += `
    </div>
</body>
</html>`;

      setProgress(95);
      setProgressLabel("Finalizing...");

      // Sanitize for preview
      const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ['html', 'head', 'body', 'meta', 'title', 'style', 'div', 'h1', 'h2', 'p', 'span'],
        ALLOWED_ATTR: ['class', 'charset', 'name', 'content', 'lang'],
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'form'],
        FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover']
      });
      setHtmlPreview(sanitizedHtml);

      // Download HTML file
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace('.pdf', '.html');
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setProgressLabel("Done!");

      toast({
        title: "Conversion complete!",
        description: `Extracted text from ${numPages} page${numPages > 1 ? 's' : ''} and converted to HTML.`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      const message = error instanceof Error && error.message.includes("password")
        ? "This PDF is password-protected. Please unlock it first."
        : "Failed to convert PDF. The file may be corrupted or unsupported.";
      toast({
        title: "Conversion failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "PDF to HTML Converter",
    whatIs: "PDF to HTML Converter is a free online tool that extracts actual text content from PDF documents and transforms them into clean, responsive HTML web pages. Unlike basic converters, this tool uses advanced PDF parsing to extract real text from each page, preserving document structure and readability.",
    howToUse: [
      "Click the upload area to select your PDF file.",
      "Click 'Convert to HTML' to start the conversion.",
      "Watch the progress as text is extracted from each page.",
      "Preview the generated HTML in the built-in viewer.",
      "Your HTML file will download automatically.",
    ],
    features: [
      "Extracts actual text content from PDF pages",
      "Creates responsive, styled HTML output",
      "Built-in preview of converted content",
      "Secure XSS-safe HTML generation with DOMPurify",
      "Progress tracking during conversion",
      "Handles multi-page documents efficiently",
      "Detects password-protected and scanned PDFs",
    ],
    safetyNote: "Your PDF files are processed entirely in your browser. No documents are uploaded to any server. The tool uses DOMPurify to sanitize output and prevent security vulnerabilities.",
    faqs: [
      { question: "Will all PDF content be converted?", answer: "The tool extracts text-based content from PDF pages. Scanned documents (image-based PDFs) may show empty pages since they contain images, not selectable text. For scanned PDFs, use an OCR tool first." },
      { question: "Can I edit the generated HTML?", answer: "Yes! The HTML file is standard markup that can be edited with any text editor or web development tool." },
      { question: "Does it support password-protected PDFs?", answer: "No, you'll need to unlock the PDF first using our Unlock PDF tool before converting." },
      { question: "Is the generated HTML mobile-friendly?", answer: "Yes, the output includes responsive CSS that adapts to different screen sizes." },
    ],
  };

  return (
    <>
      <CanonicalHead
        title="PDF to HTML Converter Free Online - Convert PDF to Web Page | VexaTool"
        description="Free online PDF to HTML converter. Extract real text from PDF and convert to clean HTML web pages. Fast, secure, browser-based."
        keywords="pdf to html, convert pdf to html, pdf to web page, pdf text extractor, free html converter"
      />
      <ToolLayout
        title="PDF to HTML"
        description="Convert PDF documents to HTML web pages with real text extraction"
        icon={Code}
        colorClass="bg-orange-500"
      >
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-html-upload"
          />
          <label htmlFor="pdf-html-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
              <FileUp className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              {file ? file.name : "Click to select PDF file"}
            </p>
            <p className="text-sm text-muted-foreground">
              Convert PDF to HTML web page with text extraction
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileUp className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setHtmlPreview(""); setProgress(0); }}>
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
                    Convert to HTML
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {htmlPreview && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Preview</h3>
            <div className="border rounded-lg overflow-hidden bg-white">
              <iframe
                srcDoc={htmlPreview}
                className="w-full h-96"
                title="HTML Preview"
                sandbox=""
              />
            </div>
          </div>
        )}
        <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default PDFToHTML;
