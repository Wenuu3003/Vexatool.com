import { useState } from "react";
import { Code, Download } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet";
import ToolSEOContent from "@/components/ToolSEOContent";

const HTMLToPDF = () => {
  const [html, setHtml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (!html.trim()) {
      toast({
        title: "No HTML content",
        description: "Please enter HTML content to convert.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create a hidden iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '1100px';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');

      // Sanitize HTML before writing to iframe
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'b', 'i', 'sub', 'sup', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'],
        ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan']
      });

      // Write HTML content
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>${sanitizedHtml}</body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use browser's print to PDF functionality
      const printWindow = iframe.contentWindow;
      if (printWindow) {
        printWindow.print();
      }

      document.body.removeChild(iframe);

      toast({
        title: "Print dialog opened",
        description: "Select 'Save as PDF' in the print dialog to save your PDF.",
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Convert error:", error);
      }
      toast({
        title: "Error",
        description: "Failed to convert HTML to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const seoContent = {
    toolName: "HTML to PDF Converter",
    whatIs: "HTML to PDF Converter is a free online tool that transforms HTML code into PDF documents. Whether you're a developer wanting to convert web content to PDF, or you have HTML templates that need to be shared as documents, this tool provides instant conversion with a live preview. It sanitizes your HTML for security while preserving the structure and formatting of your content.",
    howToUse: [
      "Enter or paste your HTML code in the text area.",
      "View the live preview of your HTML content below.",
      "Click 'Convert to PDF' to generate the PDF.",
      "In the print dialog that appears, select 'Save as PDF'.",
      "Choose your save location and filename."
    ],
    features: [
      "Live preview of HTML content",
      "Secure HTML sanitization to prevent XSS attacks",
      "Supports common HTML elements (headings, paragraphs, lists, tables)",
      "Inline CSS styling support",
      "Uses browser's native print-to-PDF for high quality",
      "No file uploads required"
    ],
    safetyNote: "Your HTML code is processed entirely in your browser and is sanitized using DOMPurify to remove any potentially harmful scripts or elements. No data is sent to any server, ensuring complete privacy and security for your content.",
    faqs: [
      { question: "Why does it open a print dialog?", answer: "The tool uses your browser's native print functionality to create PDFs, which ensures the highest quality output. Simply select 'Save as PDF' as the destination in the print dialog." },
      { question: "What HTML elements are supported?", answer: "Common elements like headings (h1-h6), paragraphs, divs, spans, lists, tables, links, images, and semantic HTML5 elements are supported. JavaScript is not executed for security." },
      { question: "Can I include CSS styles?", answer: "Yes! You can include inline CSS styles using the 'style' attribute on elements. The styles will be preserved in the PDF output." },
      { question: "Why are some elements removed?", answer: "For security, the tool sanitizes HTML to prevent cross-site scripting (XSS) attacks. Script tags, event handlers, and potentially dangerous elements are removed while keeping your content structure intact." }
    ]
  };

  return (
    <>
      <Helmet>
        <title>HTML to PDF Converter Free Online | Mypdfs</title>
        <meta name="description" content="Free online HTML to PDF converter. Convert HTML code to PDF documents. Preview and convert web content to PDF instantly." />
        <meta name="keywords" content="HTML to PDF, convert HTML, web to PDF, code to PDF, free HTML converter, online HTML to PDF" />
        <link rel="canonical" href="https://mypdfs.lovable.app/html-to-pdf" />
      </Helmet>
      <ToolLayout
        title="HTML to PDF"
        description="Convert HTML code to PDF documents"
        icon={Code}
        colorClass="bg-orange-500"
      >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="html-content">Enter HTML Content</Label>
          <Textarea
            id="html-content"
            placeholder="<h1>Hello World</h1><p>Enter your HTML here...</p>"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        {html.trim() && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium mb-2">Preview</h3>
              <div 
                className="bg-white p-4 rounded border min-h-[200px]"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(html, {
                    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'b', 'i', 'sub', 'sup', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'],
                    ALLOWED_ATTR: ['class', 'id', 'style', 'href', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan']
                  })
                }}
              />
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={handleConvert}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Convert to PDF
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Uses browser print dialog - select "Save as PDF"
              </p>
            </div>
          </div>
        )}
      </div>
      <ToolSEOContent {...seoContent} />
      </ToolLayout>
    </>
  );
};

export default HTMLToPDF;
